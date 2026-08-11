## Table `companies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `full_name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `is_active` | `bool` |  |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `parent_id` | `uuid` |  Nullable |
| `name` | `text` |  |
| `level` | `int4` |  |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `batches`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `product_id` | `uuid` |  |
| `batch_number` | `text` |  |
| `production_date` | `date` |  Nullable |

## Table `complaint_master_templates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `fields` | `jsonb` |  Nullable |
| `company_id` | `uuid` |  Nullable |

## Table `complaint_master_template_fields`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `template_id` | `uuid` |  |
| `field_label` | `text` |  |
| `field_type` | `custom_field_type` |  |
| `is_required` | `bool` |  |
| `options` | `jsonb` |  Nullable |

## Table `company_complaint_types`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `name` | `text` |  |
| `source_template_id` | `uuid` |  Nullable |

## Table `company_complaint_custom_fields`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_complaint_type_id` | `uuid` |  |
| `field_label` | `text` |  |
| `field_type` | `custom_field_type` |  |
| `is_required` | `bool` |  |
| `options` | `jsonb` |  Nullable |

## Table `complaints`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `parent_id` | `uuid` |  Nullable |
| `submitted_by_id` | `uuid` |  |
| `assigned_to_id` | `uuid` |  Nullable |
| `product_id` | `uuid` |  |
| `batch_id` | `uuid` |  Nullable |
| `status` | `complaint_status` |  |
| `created_at` | `timestamptz` |  |
| `title` | `text` |  |
| `priority` | `text` |  Nullable |
| `template_id` | `uuid` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `capa_document_url` | `text` |  Nullable |
| `sla_document_url` | `text` |  Nullable |
| `capa_verified_at` | `timestamptz` |  Nullable |
| `sla_verified_at` | `timestamptz` |  Nullable |
| `verified_by` | `uuid` |  Nullable |
| `facility_id` | `uuid` |  Nullable |
| `custom_fields` | `jsonb` |  Nullable |
| `review_status` | `text` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `reviewed_by` | `uuid` |  Nullable |
| `rejection_reason` | `text` |  Nullable |
| `equipment_id` | `uuid` |  Nullable |
| `facility_escalated_at` | `timestamptz` |  Nullable |
| `facility_escalated_by` | `uuid` |  Nullable |
| `department_id` | `uuid` |  Nullable |
| `operations_notified_at` | `timestamptz` |  Nullable |
| `operations_notified_by` | `uuid` |  Nullable |

## Table `complaint_custom_field_values`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `complaint_id` | `uuid` |  |
| `custom_field_id` | `uuid` |  |
| `value` | `text` |  Nullable |

## Table `permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `name` | `text` |  Unique |
| `description` | `text` |  Nullable |

## Table `roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `name` | `text` |  |

## Table `role_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role_id` | `uuid` | Primary |
| `permission_id` | `int4` | Primary |

## Table `user_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `role_id` | `uuid` | Primary |

## Table `facilities`

Stores company facilities/locations for multi-location support

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `address` | `text` |  Nullable |
| `city` | `text` |  Nullable |
| `state` | `text` |  Nullable |
| `country` | `text` |  Nullable |
| `postal_code` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `facility_type` | `text` |  Nullable |

## Table `complaint_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `complaint_id` | `uuid` |  |
| `user_id` | `uuid` |  Nullable |
| `body` | `text` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `complaint_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `complaint_id` | `uuid` |  |
| `document_type` | `text` |  |
| `file_path` | `text` |  |
| `file_name` | `text` |  Nullable |
| `uploaded_at` | `timestamptz` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `company_id` | `uuid` |  |
| `type` | `text` |  |
| `related_entity_type` | `text` |  Nullable |
| `related_entity_id` | `uuid` |  Nullable |
| `title` | `text` |  |
| `body` | `text` |  Nullable |
| `read_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `facility_equipment`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `facility_id` | `uuid` |  |
| `name` | `text` |  |
| `asset_tag` | `text` |  Nullable |
| `model` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `facility_equipment_complaints`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `facility_id` | `uuid` |  |
| `equipment_id` | `uuid` |  |
| `description` | `text` |  |
| `picture_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `departments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `name` | `text` |  |
| `code` | `text` |  Nullable |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `department_qa_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `department_id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |

## Table `facility_qa_assignments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `facility_id` | `uuid` | Primary |
| `company_id` | `uuid` |  |
| `role_type` | `text` | Primary |
| `created_at` | `timestamptz` |  |

## Custom Types / Enums

### `complaint_status`

`pending` | `assigned` | `in_progress` | `resolved` | `closed`

### `custom_field_type`

`text` | `number` | `date` | `file_upload` | `dropdown`

## RLS Policies

### `complaint_documents`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can insert documents for complaints in their company` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM (complaints c      JOIN users u ON ((u.company_id = c.company_id)))   WHERE ((c.id = complaint_documents.complaint_id) AND (u.id = auth.uid()))))` |
| `Users can read documents for complaints in their company` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM (complaints c      JOIN users u ON ((u.company_id = c.company_id)))   WHERE ((c.id = complaint_documents.complaint_id) AND (u.id = auth.uid()))))` | — |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can read own notifications` | SELECT | public | PERMISSIVE | `(user_id = auth.uid())` | — |
| `Users can update own notifications read_at` | UPDATE | public | PERMISSIVE | `(user_id = auth.uid())` | `(user_id = auth.uid())` |

### `users`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Enable read access for users based on their ID` | SELECT | public | PERMISSIVE | `(auth.uid() = id)` | — |
| `Users can only see users in their own company` | SELECT | public | PERMISSIVE | `(company_id = get_current_company_id())` | — |
| `Users can view own user data` | SELECT | public | PERMISSIVE | `(auth.uid() = id)` | — |

### `products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Employees can view products` | SELECT | public | PERMISSIVE | `true` | — |
| `products_delete_policy` | DELETE | public | PERMISSIVE | `(is_superadmin() OR (user_has_product_permission('products:delete'::text) AND (company_id = get_user_company_id())))` | — |
| `products_insert_policy` | INSERT | public | PERMISSIVE | — | `(is_superadmin() OR (user_has_product_permission('products:create'::text) AND (company_id = get_user_company_id())))` |
| `products_select_policy` | SELECT | public | PERMISSIVE | `(is_superadmin() OR (user_has_product_permission('products:read'::text) AND (company_id = get_user_company_id())))` | — |
| `products_update_policy` | UPDATE | public | PERMISSIVE | `(is_superadmin() OR (user_has_product_permission('products:update'::text) AND (company_id = get_user_company_id())))` | `(is_superadmin() OR (user_has_product_permission('products:update'::text) AND (company_id = get_user_company_id())))` |

### `complaints`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can insert their own complaints` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = submitted_by_id)` |
| `Users can only insert complaints for their own company` | INSERT | public | PERMISSIVE | — | `((company_id = get_current_company_id()) AND (submitted_by_id = auth.uid()))` |
| `Users can only see complaints from their own company` | SELECT | public | PERMISSIVE | `(company_id = get_current_company_id())` | — |
| `temp_allow_all_inserts` | INSERT | authenticated | PERMISSIVE | — | `true` |

### `facility_qa_assignments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `facility_qa_assignments_delete_same_company` | DELETE | public | PERMISSIVE | `(company_id IN ( SELECT u.company_id    FROM users u   WHERE (u.id = auth.uid())))` | — |
| `facility_qa_assignments_insert_same_company` | INSERT | public | PERMISSIVE | — | `(company_id IN ( SELECT u.company_id    FROM users u   WHERE (u.id = auth.uid())))` |
| `facility_qa_assignments_select_same_company` | SELECT | public | PERMISSIVE | `(company_id IN ( SELECT u.company_id    FROM users u   WHERE (u.id = auth.uid())))` | — |

### `facilities`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Allow company admins to create facilities` | INSERT | public | PERMISSIVE | — | `((company_id IN ( SELECT users.company_id    FROM users   WHERE (users.id = auth.uid()))) AND (EXISTS ( SELECT 1    FROM (((users u      JOIN user_roles ur ON ((ur.user_id = u.id)))      JOIN role_permissions rp ON ((rp.role_id = ur.role_id)))      JOIN permissions p ON ((p.id = rp.permission_id)))   WHERE ((u.id = auth.uid()) AND (p.name = 'facilities:create'::text)))))` |
| `Allow company admins to delete facilities` | DELETE | public | PERMISSIVE | `((company_id IN ( SELECT users.company_id    FROM users   WHERE (users.id = auth.uid()))) AND (EXISTS ( SELECT 1    FROM (((users u      JOIN user_roles ur ON ((ur.user_id = u.id)))      JOIN role_permissions rp ON ((rp.role_id = ur.role_id)))      JOIN permissions p ON ((p.id = rp.permission_id)))   WHERE ((u.id = auth.uid()) AND (p.name = 'facilities:delete'::text)))))` | — |
| `Allow company admins to update facilities` | UPDATE | public | PERMISSIVE | `((company_id IN ( SELECT users.company_id    FROM users   WHERE (users.id = auth.uid()))) AND (EXISTS ( SELECT 1    FROM (((users u      JOIN user_roles ur ON ((ur.user_id = u.id)))      JOIN role_permissions rp ON ((rp.role_id = ur.role_id)))      JOIN permissions p ON ((p.id = rp.permission_id)))   WHERE ((u.id = auth.uid()) AND (p.name = 'facilities:update'::text)))))` | — |
| `Allow company users to read their facilities` | SELECT | public | PERMISSIVE | `(company_id IN ( SELECT users.company_id    FROM users   WHERE (users.id = auth.uid())))` | — |
| `Allow superadmins full access to facilities` | ALL | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM users u   WHERE ((u.id = auth.uid()) AND (u.company_id = '00000000-0000-0000-0000-000000000001'::uuid))))` | — |
| `Users can read facilities of their company` | SELECT | authenticated | PERMISSIVE | `(company_id = ( SELECT users.company_id    FROM users   WHERE (users.id = auth.uid())  LIMIT 1))` | — |

### `complaint_comments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Users can insert comments for complaints in their company` | INSERT | public | PERMISSIVE | — | `(EXISTS ( SELECT 1    FROM (complaints c      JOIN users u ON ((u.company_id = c.company_id)))   WHERE ((c.id = complaint_comments.complaint_id) AND (u.id = auth.uid()))))` |
| `Users can read comments for complaints in their company` | SELECT | public | PERMISSIVE | `(EXISTS ( SELECT 1    FROM (complaints c      JOIN users u ON ((u.company_id = c.company_id)))   WHERE ((c.id = complaint_comments.complaint_id) AND (u.id = auth.uid()))))` | — |

## Table `public_complaints`

Public QR intake channel. Anonymous insert-only; status lookup via `get_public_complaint_status`. Dual-writes into `complaints` via edge function (`hinza_complaint_id`).

Screen 1 categories come from `complaint_master_templates` (fields from `templates.fields` jsonb). `company_complaint_type_id` is optional when a matching company type exists.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tracking_code` | `text` | Unique, not null |
| `source` | `text` | Default `public_qr` |
| `company_id` | `uuid` | FK → companies |
| `product_id` | `uuid` | FK → products |
| `batch_id` | `uuid` | Nullable, FK → batches |
| `outlet_id` | `uuid` | Nullable, FK → facilities |
| `company_complaint_type_id` | `uuid` | Nullable, FK → company_complaint_types |
| `template_id` | `uuid` | FK → complaint_master_templates (required) |
| `severity_user_rated` | `smallint` | Nullable |
| `severity_ai_suggested` | `smallint` | Nullable |
| `category_ai_suggested` | `text` | Nullable |
| `category_mismatch` | `bool` | Default false |
| `ai_title` | `text` | Nullable |
| `ai_summary` | `text` | Nullable |
| `raw_text` | `text` | Not null (verbatim, never overwritten) |
| `photo_urls` | `text[]` | Default `{}` |
| `field_answers` | `jsonb` | Default `{}` |
| `contact_phone` | `text` | Nullable |
| `contact_email` | `text` | Nullable |
| `device_fingerprint` | `text` | Nullable |
| `client_ip` | `text` | Nullable |
| `status` | `text` | `submitted` \| `in_review` \| `actioned` \| `closed` |
| `flagged_for_review` | `bool` | Default false |
| `flag_reason` | `text` | Nullable |
| `hinza_complaint_id` | `uuid` | Nullable, FK → complaints |
| `created_at` | `timestamptz` | Default now() |

### RPCs

- `resolve_intake_context(product_id, batch_id, outlet_id)` — public-safe bootstrap from master templates
- `get_public_complaint_status(tracking_code)` — minimal status only
- `generate_public_tracking_code()` — service role
- `public_complaint_batch_spikes(window_hours, min_count)` — ops spike detection

