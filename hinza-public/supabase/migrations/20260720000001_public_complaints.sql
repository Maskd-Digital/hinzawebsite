-- Public QR complaint intake schema
-- Same Supabase project as Hinza; anonymous public writes go here, then promote to complaints.

-- ---------------------------------------------------------------------------
-- System submitter used only by service-role promote path
-- ---------------------------------------------------------------------------
-- Insert a dedicated company-scoped system user if not present.
-- Uses a fixed UUID so edge functions can reference PUBLIC_COMPLAINT_SUBMITTER_ID.
-- Company id 00000000-0000-0000-0000-000000000001 matches Hinza superadmin company convention.

do $$
begin
  if not exists (
    select 1 from companies where id = '00000000-0000-0000-0000-000000000001'
  ) then
    insert into companies (id, name, created_at)
    values (
      '00000000-0000-0000-0000-000000000001',
      'Hinza System',
      now()
    );
  end if;

  if not exists (
    select 1 from users where id = '00000000-0000-0000-0000-0000000000a1'
  ) then
    insert into users (id, company_id, full_name, email, is_active)
    values (
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-000000000001',
      'Public QR Intake',
      'public-qr-intake@hinza.system',
      true
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- public_complaints
-- ---------------------------------------------------------------------------
create table if not exists public_complaints (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique not null,
  source text not null default 'public_qr',
  company_id uuid not null references companies(id),
  product_id uuid not null references products(id),
  batch_id uuid references batches(id),
  outlet_id uuid references facilities(id),
  company_complaint_type_id uuid references company_complaint_types(id),
  template_id uuid not null references complaint_master_templates(id),
  severity_user_rated smallint,
  severity_ai_suggested smallint,
  category_ai_suggested text,
  category_mismatch boolean default false,
  ai_title text,
  ai_summary text,
  raw_text text not null,
  photo_urls text[] default '{}',
  field_answers jsonb default '{}'::jsonb,
  contact_phone text,
  contact_email text,
  device_fingerprint text,
  client_ip text,
  status text not null default 'submitted'
    check (status in ('submitted', 'in_review', 'actioned', 'closed')),
  flagged_for_review boolean default false,
  flag_reason text,
  hinza_complaint_id uuid references complaints(id),
  created_at timestamptz default now()
);

create index if not exists public_complaints_batch_id_idx on public_complaints (batch_id);
create index if not exists public_complaints_product_id_idx on public_complaints (product_id);
create index if not exists public_complaints_tracking_code_idx on public_complaints (tracking_code);
create index if not exists public_complaints_company_id_idx on public_complaints (company_id);
create index if not exists public_complaints_hinza_complaint_id_idx on public_complaints (hinza_complaint_id);
create index if not exists public_complaints_created_at_idx on public_complaints (created_at desc);
create index if not exists public_complaints_device_batch_idx
  on public_complaints (device_fingerprint, batch_id, created_at desc);

alter table public_complaints enable row level security;

-- Anon insert-only; no select/update for anonymous clients
drop policy if exists "anon_insert_public_complaints" on public_complaints;
create policy "anon_insert_public_complaints"
  on public_complaints
  for insert
  to anon, authenticated
  with check (
    source = 'public_qr'
    and raw_text is not null
    and length(trim(raw_text)) > 0
  );

-- Company users can read public complaints for their company (Hinza admin)
drop policy if exists "company_read_public_complaints" on public_complaints;
create policy "company_read_public_complaints"
  on public_complaints
  for select
  to authenticated
  using (
    company_id = (
      select u.company_id from users u where u.id = auth.uid() limit 1
    )
    or exists (
      select 1 from users u
      where u.id = auth.uid()
        and u.company_id = '00000000-0000-0000-0000-000000000001'
    )
  );

-- ---------------------------------------------------------------------------
-- Tracking code generator
-- ---------------------------------------------------------------------------
create or replace function generate_public_tracking_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
  attempts int := 0;
begin
  loop
    candidate := 'HZ-' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (
      select 1 from public_complaints where tracking_code = candidate
    );
    attempts := attempts + 1;
    if attempts > 50 then
      candidate := 'HZ-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
      exit;
    end if;
  end loop;
  return candidate;
end;
$$;

revoke all on function generate_public_tracking_code() from public;
grant execute on function generate_public_tracking_code() to service_role;

-- ---------------------------------------------------------------------------
-- Public status RPC (minimal fields only)
-- ---------------------------------------------------------------------------
create or replace function get_public_complaint_status(p_tracking_code text)
returns table (
  tracking_code text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select pc.tracking_code, pc.status, pc.created_at
  from public_complaints pc
  where upper(pc.tracking_code) = upper(trim(p_tracking_code))
  limit 1;
$$;

revoke all on function get_public_complaint_status(text) from public;
grant execute on function get_public_complaint_status(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Resolve intake context (product → company → complaint types + fields)
-- ---------------------------------------------------------------------------
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
  v_types jsonb;
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

  select coalesce(jsonb_agg(t.obj order by t.name), '[]'::jsonb)
  into v_types
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
            lower(coalesce(f->>'field_type', '')) not in ('file')
            and lower(coalesce(f->>'field_name', f->>'field_label', ''))
              !~ '(^description$|photo|attachment|document|evidence)'
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
    'complaint_types', v_types
  );
end;
$$;

revoke all on function resolve_intake_context(uuid, uuid, uuid) from public;
grant execute on function resolve_intake_context(uuid, uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Batch spike helper (ops / Phase 4)
-- ---------------------------------------------------------------------------
create or replace function public_complaint_batch_spikes(
  p_window_hours int default 24,
  p_min_count int default 5
)
returns table (
  batch_id uuid,
  product_id uuid,
  company_id uuid,
  complaint_count bigint,
  window_start timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pc.batch_id,
    pc.product_id,
    pc.company_id,
    count(*)::bigint as complaint_count,
    now() - make_interval(hours => p_window_hours) as window_start
  from public_complaints pc
  where pc.created_at >= now() - make_interval(hours => p_window_hours)
    and pc.batch_id is not null
  group by pc.batch_id, pc.product_id, pc.company_id
  having count(*) >= p_min_count
  order by complaint_count desc;
$$;

revoke all on function public_complaint_batch_spikes(int, int) from public;
grant execute on function public_complaint_batch_spikes(int, int) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for evidence photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-complaint-evidence',
  'public-complaint-evidence',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Signed uploads are minted by edge functions (service role).
-- Authenticated company users can read evidence for their company via path prefix checks
-- handled in app/admin; no public read policy.

drop policy if exists "service_role_evidence_all" on storage.objects;
-- Service role bypasses RLS; keep a narrow authenticated read for company staff if path embeds company_id later.
-- For v1, evidence is only accessed via signed URLs issued by edge functions.
