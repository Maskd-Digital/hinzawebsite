-- Switch public intake categories to complaint_master_templates
-- Fields come from templates.fields jsonb (complaint_master_template_fields is unused).

alter table public_complaints
  alter column company_complaint_type_id drop not null;

alter table public_complaints
  alter column template_id set not null;

comment on column public_complaints.template_id is
  'Selected complaint_master_templates row for public QR intake';
comment on column public_complaints.company_complaint_type_id is
  'Optional link to company_complaint_types when a matching type exists; nullable for master-template-only intake';

create or replace function resolve_intake_context(
  p_product_id uuid,
  p_batch_id uuid,
  p_outlet_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products%rowtype;
  v_batch batches%rowtype;
  v_outlet facilities%rowtype;
  v_templates jsonb;
begin
  select * into v_product from products where id = p_product_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_product');
  end if;

  select * into v_batch from batches where id = p_batch_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_batch');
  end if;

  if v_batch.product_id <> v_product.id then
    return jsonb_build_object('ok', false, 'error', 'batch_product_mismatch');
  end if;

  if p_outlet_id is not null then
    select * into v_outlet from facilities where id = p_outlet_id;
    if not found or v_outlet.company_id <> v_product.company_id then
      return jsonb_build_object('ok', false, 'error', 'invalid_outlet');
    end if;
  end if;

  -- Master templates for this company (and global templates with null company_id).
  -- Public intake only surfaces consumer-relevant fields; QR already knows product/batch,
  -- and internal QA fields (facility, quarantine, production line, etc.) are skipped.
  select coalesce(jsonb_agg(t.obj order by t.name), '[]'::jsonb)
  into v_templates
  from (
    select
      cmt.name,
      jsonb_build_object(
        'id', cmt.id,
        'name', cmt.name,
        'description', cmt.description,
        'is_safety', (
          lower(cmt.name) ~ '(contaminat|injury|safety|allergen|foreign.?object|illness|hazard|pest)'
        ),
        'fields', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', f->>'id',
              'field_label', coalesce(f->>'field_name', f->>'field_label'),
              'field_type', case lower(coalesce(f->>'field_type', 'text'))
                when 'select' then 'dropdown'
                when 'textarea' then 'text'
                when 'boolean' then 'dropdown'
                when 'file' then 'file_upload'
                when 'number' then 'number'
                when 'date' then 'date'
                else 'text'
              end,
              'is_required', coalesce((f->>'is_required')::boolean, false),
              'options', case
                when lower(coalesce(f->>'field_type', '')) = 'boolean'
                  then '["Yes","No"]'::jsonb
                when jsonb_typeof(f->'options') = 'array' then f->'options'
                else '[]'::jsonb
              end,
              'field_order', coalesce((f->>'field_order')::int, 0)
            )
            order by coalesce((f->>'field_order')::int, 0)
          )
          from jsonb_array_elements(coalesce(cmt.fields, '[]'::jsonb)) f
          where
            -- skip files (handled by photo step) and description (handled by story step)
            lower(coalesce(f->>'field_type', '')) not in ('file')
            and lower(coalesce(f->>'field_name', f->>'field_label', ''))
              !~ '(^description$|photo|attachment|document|evidence)'
            -- skip QR-known / internal ops fields
            and lower(coalesce(f->>'field_name', f->>'field_label', ''))
              !~ '(product name|product affected|batch|lot number|production date|reporting facility|receiving facility|sending facility|facility type|department|production line|shift|immediate action|quarantine|quarantined|retained for|stock removed|suggested corrective|supplier|carrier|delivery reference|downtime|equipment|previous product|material type|date received|date discovered|best before|target volume|actual volume|required temperature|recorded temperature|estimated duration|logistics)'
        ), '[]'::jsonb)
      ) as obj
    from complaint_master_templates cmt
    where cmt.company_id = v_product.company_id
       or cmt.company_id is null
  ) t;

  return jsonb_build_object(
    'ok', true,
    'product', jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'company_id', v_product.company_id
    ),
    'batch', jsonb_build_object(
      'id', v_batch.id,
      'batch_number', v_batch.batch_number,
      'production_date', v_batch.production_date
    ),
    'outlet', case
      when p_outlet_id is null then null
      else jsonb_build_object(
        'id', v_outlet.id,
        'name', v_outlet.name
      )
    end,
    'complaint_types', v_templates
  );
end;
$$;

revoke all on function resolve_intake_context(uuid, uuid, uuid) from public;
grant execute on function resolve_intake_context(uuid, uuid, uuid) to anon, authenticated;
