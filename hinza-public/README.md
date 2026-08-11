# Hinza Public QR Complaint Intake

Mobile-first public intake app for product complaints via QR. Writes to `public_complaints`, then promotes into Hinza `complaints` for triage.

## Stack

- Next.js (App Router) + Tailwind
- Supabase (same project as Hinza): table, RPCs, Storage, Edge Functions
- OpenAI or Claude for server-side structuring (`AI_PROVIDER`)

## Setup

1. Copy `.env.example` → `.env.local` and fill Supabase + AI keys.
2. Apply migration:

```bash
supabase db push
# or run supabase/migrations/20260720000001_public_complaints.sql in the SQL editor
```

3. Deploy edge functions:

```bash
supabase functions deploy resolve_intake_context
supabase functions deploy create_evidence_upload_url
supabase functions deploy submit_public_complaint
supabase functions deploy get_public_complaint_status
```

Set function secrets:

- `AI_PROVIDER` — `openai` (default) or `anthropic`
- `OPENAI_API_KEY` / `OPENAI_MODEL` (when using OpenAI)
- `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` (when using Claude)
- `PUBLIC_COMPLAINT_SUBMITTER_ID`, `SUPABASE_SERVICE_ROLE_KEY`

To switch providers later, set `AI_PROVIDER=anthropic` and redeploy — no client or schema changes.

4. Install and run (app is mounted at `/complain`):

```bash
npm install
npm run dev -- -p 3001
# open http://localhost:3001/complain
```

Set `NEXT_PUBLIC_APP_URL` to the public app base including `/complain` (e.g. `http://localhost:3001/complain` locally, `https://hinza.app/complain` in production).

## Routes

Served under Next.js `basePath: '/complain'`:

| Route | Purpose |
|---|---|
| `/complain` | Landing / track entry |
| `/complain/r/[productId]/[batchId]?loc=&src=qr` | Conversational intake |
| `/complain/t/[trackingCode]` | Status for a code |
| `/complain/status` | Manual tracking lookup |

## Deploy (Vercel, path-mounted on marketing domain)

1. Create a Vercel project with **Root Directory** `hinza-public`.
2. Set production env `NEXT_PUBLIC_APP_URL=https://hinza.app/complain` (plus existing Supabase vars).
3. Do **not** attach `hinza.app` to this project — the marketing site on `hinza.app` proxies `/complain/*` to this deployment (see root `vercel.json`).
4. Confirm the rewrite destination host matches this project’s `*.vercel.app` hostname (default in repo: `hinzawebsite-complain.vercel.app`).

## QR generation (admin / print)

```bash
npm run qr:generate -- --product <uuid> --batch <uuid> --out ./qr-output
npm run qr:generate -- --csv ./batches.csv --out ./qr-output
```

URLs are built under `NEXT_PUBLIC_APP_URL` (must end with `/complain`).

CSV columns: `product_id,batch_id,outlet_id` (outlet optional).

## Dual-write flow

1. Validate product/batch/type via `resolve_intake_context`
2. Insert `public_complaints` with `source: public_qr` and selected `template_id` (from `complaint_master_templates`)
3. AI structures title/summary/severity (never overwrites `raw_text`)
4. Promote to `complaints` + evidence docs using system submitter (`field_answers` in `custom_fields`)
5. Abuse/rate signals set `flagged_for_review` — submissions are never hard-blocked

## Ops helpers

- `public_complaint_batch_spikes(window_hours, min_count)` — authenticated RPC for batch volume alerts
