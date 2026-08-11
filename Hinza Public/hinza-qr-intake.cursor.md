# Hinza Public QR Complaint Intake — Project Strategy & Build Guide

> Cursor project context file. Paste this into `.cursor/rules` or keep as root-level `CONTEXT.md` and reference it in prompts. Written for an AI pair-programmer to have full strategic + technical context without re-explaining the product on every session.

---

## 1. What we're building

A lightweight, mobile-first web app that lets **any member of the public** file a product complaint by scanning a QR code on physical product packaging or in-store signage. The submission is **not a static form** — it's a short adaptive flow that ends in a structured complaint routed into **Hinza**, Mask'd Studio's existing QA complaint management platform (hinza.app), tagged as a distinct public-origin source separate from Hinza's existing internal QA complaint pipeline.

This is a new, narrow entry surface into an existing system — not a rebuild of Hinza. Treat Hinza's existing schema, auth, and complaint model as the source of truth; this app is a thin, fast, public-facing ingestion layer that writes into it.

### Why this exists
- Physical products can't currently generate a complaint without someone finding the Hinza site/app and manually filling in what/where/when.
- QR-to-form has bad completion rates. The goal is QR-to-*conversation*, where most context (product, batch, location) is pre-filled from the QR payload itself, and the user only supplies what only they know: what went wrong, and evidence.
- Long-term, this becomes a first-party structured data source for **BAI (Bitch About It)**, the public-facing accountability/reputation feed Mask'd Studio is separately building on top of Hinza. Design the schema so BAI can consume from it later without rework.

---

## 2. Product strategy (read before writing code)

### 2.1 Core principle: the QR does the work, the user does the feeling
Every piece of context that *can* be known at print time should be encoded in the QR payload, not asked of the user. The user should only ever be asked things only they can know:
- What went wrong (category)
- Evidence (photo/voice/text)
- Optionally, how to reach them back

They should never type: product name, purchase location, date, batch number — all of that comes from the QR.

### 2.2 QR payload design
QR encodes a URL with embedded identifiers, not just a landing page:

```
https://hinza.app/complain/r/{productId}/{batchId}?loc={outletId}&src=qr
```

- `productId` — SKU-level identifier
- `batchId` — production batch/lot, enables clustering complaints against a bad run
- `loc` (optional) — outlet/store ID if the QR is location-specific (e.g. in-store signage vs on-pack)
- `src=qr` — static tag so we always know origin channel, even if other entry points get added later (e.g. SMS, in-app)

Print-time QR generation is a separate small tool/script — batch-generate one QR per SKU+batch combination, exportable as PNG/SVG/PDF sheet for packaging/print vendors. Build this as an internal admin utility, not part of the public app.

### 2.3 The adaptive flow (replaces the form)

Think 3 short screens, each a single decision, not one scroll of fields.

**Screen 1 — Category (visual, not dropdown)**
Icon-based tap targets, contextual to product type where possible (a food product shows "spoiled / off smell", a hardware product shows "damaged / doesn't work"). Categories should map to Hinza's existing complaint taxonomy — don't invent a parallel taxonomy; pull/mirror Hinza's existing categories so triage doesn't need to translate.

**Screen 2 — Branch on category**
- Safety-flagged categories (e.g. contamination, injury risk) → prompt photo + a severity self-rating + fast-path flag for urgent internal routing.
- Non-safety categories → prompt photo (optional but encouraged) + move to free text.

**Screen 3 — Free-form context**
One field, typed text by default. Offer a **voice-to-text option** alongside it (a mic icon that transcribes into the same field via the Web Speech API) for anyone who'd rather talk than type — but don't make it the primary/first-presented input. Typing is the safer default across contexts (quiet workplaces, shared spaces, spotty mic permissions), and voice-first can feel gimmicky or slow if the transcription needs correcting.

**Screen 4 — Confirmation + tracking**
Immediate tracking code (e.g. `HZ-4821`), plain-language "what happens next," and an optional (never required) phone/email for follow-up. No login/account creation ever required to submit — that's a hard conversion killer for anonymous public complaints. If they want to check status later, tracking-code lookup, not login.

### 2.4 AI-assisted structuring (server-side, not user-facing)
Once free text/voice + category + metadata are captured, call the Claude API server-side (Supabase edge function) to:
- Generate a clean, short complaint title
- Produce a QA-readable summary (customer's raw words are preserved separately — never overwrite them, only augment)
- Suggest/confirm severity and category (cross-check against what the user tapped; flag mismatches for human review rather than silently overriding)
- Extract structured fields where possible (e.g. "the lid was cracked" → `defect_type: packaging`)

This keeps the user-facing flow fast and dumb (a few taps + one voice note) while the system does the categorization work a form would normally offload onto the user.

### 2.5 Anti-abuse, calibrated for a public unauthenticated surface
- Rate-limit by device fingerprint + IP, not CAPTCHA — CAPTCHA on mobile after a QR scan is a conversion killer.
- No submission blocking on suspected spam/abuse — flag for a review queue instead. False positives on a genuine complaint are worse than a bit of QA review overhead.
- Server-side profanity/spam scoring happens after submission, not as a submit-blocking gate.
- Repeat submissions from the same device against the same batch/product within a short window: don't block, just cluster/flag — could be a genuine repeat complainant, could be pile-on abuse, could be a real batch problem. Let humans decide.

### 2.6 Routing distinctly into Hinza
This is the most important integration decision: **don't merge this into Hinza's existing complaint intake path.** Write to the same underlying complaints table/model, but with a `source` discriminator:

```
source: 'public_qr'   // this app
source: 'internal_qa' // existing Hinza flows
```

This lets Hinza's triage queue:
- Route public-origin complaints to a different SLA/queue (public complaints often carry more reputational/PR sensitivity and may need faster first response)
- Retain batch/product/location metadata that internal QA complaints may not have
- Detect volume spikes against a single `batchId` as an early warning signal for a production issue
- Be BAI-ready later — BAI wants social-first, reputation-scored complaints; this is a clean first-party feed for it without needing to scrape or backfill

---

## 3. Tech stack

Consistent with the rest of the Mask'd Studio / Hinza stack — don't introduce new infra for this.

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js** (App Router) | Single lightweight route tree, not a full app shell. First paint speed matters a lot — this is a cold mobile load right after a QR scan, often on patchy in-store wifi. |
| Styling | Tailwind | Match Hinza's existing marketing site tokens where sensible for brand consistency, but this can feel more utilitarian/fast than marketing pages. |
| Backend/data | **Supabase** | Same project as Hinza where possible, or a linked project — writes into the shared complaints table (or a `public_complaints` table that Hinza's backend reads via a view/join). Confirm which before scaffolding schema. |
| AI structuring | Claude API (Sonnet-class), called from a **Supabase Edge Function** | Keep this server-side only. Never call the Claude API from the client — no API keys in the browser bundle. |
| Voice input | Web Speech API (client), offered as an optional mic toggle on the text field, not the default input | No need for a hosted STT service initially; revisit if browser support gaps cause real drop-off. |
| Image upload | Direct-to-Supabase-Storage from client, signed upload URL | Camera should launch directly (`capture="environment"` on the file input), not a generic "attach file" picker. |
| QR generation (admin tool) | Small internal script/CLI, not part of the public app | Batch-generates QR sets per SKU+batch, exports PNG/SVG/PDF sheets. |

---

## 4. Data model sketch

Adjust to match Hinza's actual existing schema once confirmed — this is a starting proposal, not a fixed spec.

```sql
create table public_complaints (
  id uuid primary key default gen_random_uuid(),
  tracking_code text unique not null, -- e.g. HZ-4821, human-shareable
  source text not null default 'public_qr',
  product_id text not null,
  batch_id text,
  outlet_id text,
  category text not null,           -- mirrors Hinza's existing taxonomy
  severity_user_rated smallint,     -- null if not a safety-flagged category
  severity_ai_suggested smallint,
  ai_title text,
  ai_summary text,
  raw_text text,                    -- verbatim user input, never overwritten
  photo_urls text[],
  contact_phone text,               -- optional, nullable
  contact_email text,               -- optional, nullable
  device_fingerprint text,
  status text not null default 'submitted', -- submitted | in_review | actioned | closed
  flagged_for_review boolean default false,
  created_at timestamptz default now()
);

create index on public_complaints (batch_id);
create index on public_complaints (product_id);
create index on public_complaints (tracking_code);
```

Row-level security: public **insert-only** access for anonymous users (no select/update), scoped tightly — this table is written to by strangers on the internet. Status lookups by tracking code should go through a scoped RPC/edge function that returns only status + minimal fields, not raw table access.

---

## 5. Build phases

**Phase 1 — Core intake flow**
- Next.js route `/r/[productId]/[batchId]` parses QR params
- Screens 1–4 (category → branch → free text/voice → confirmation)
- Supabase insert with `source: 'public_qr'`
- Tracking code generation + status lookup page

**Phase 2 — AI structuring**
- Edge function: raw text/voice transcript → title, summary, severity suggestion, category cross-check
- Mismatch flagging logic (user-tapped category vs AI-suggested)

**Phase 3 — Photo/evidence**
- Direct camera capture + Supabase Storage signed upload
- Basic image handling (compression before upload, since mobile photos are large)

**Phase 4 — Admin/QA-side routing**
- Confirm how this feeds into Hinza's existing triage queue/dashboard — likely a view or shared read in Hinza's admin, filtered/sortable by `source = 'public_qr'`
- Batch-spike detection (alert if N complaints hit same `batch_id` within a time window)

**Phase 5 — QR generation tooling**
- Internal script to batch-generate QR codes per SKU+batch, exportable for print

**Phase 6 — Abuse handling**
- Rate limiting (device fingerprint + IP)
- Spam/profanity scoring post-submission
- Review queue for flagged items

---

## 6. Non-negotiables / guardrails for Cursor when generating code here

- **Never** call the Claude API or any AI structuring step from client-side code. Server-side (edge function) only.
- **Never** require login/account creation to submit a complaint.
- **Never** overwrite the user's raw verbatim text — AI-generated summaries/titles are additive fields, not replacements.
- **Never** hard-block a submission based on automated spam/abuse scoring — flag for review instead.
- Keep the public route (`/r/[productId]/[batchId]`) as light as possible — no heavy client bundles, this is a cold mobile load.
- RLS on `public_complaints`: anonymous insert-only. No anonymous select/update. Status checks go through a scoped function.
- Always tag `source` explicitly on write — never rely on a default silently doing the discrimination; make it an explicit field in the insert payload so it's visible in code review.
- Match Hinza's existing complaint category taxonomy rather than inventing a new one — check Hinza's schema/admin before hardcoding categories here.

---

## 7. Open questions to resolve before/while building

- Is `public_complaints` a new table in the same Supabase project as Hinza, or a separate project with a sync job? (Same project + `source` column is strongly preferred — avoids sync complexity.)
- Does Hinza's admin dashboard need a new filter/view for `source = 'public_qr'`, or a fully separate lightweight admin view for this channel initially?
- Confirm Hinza's existing complaint category taxonomy so Screen 1 icons map 1:1 rather than requiring a translation layer later.
- Confirm whether `outletId` (location-specific QR) is needed for v1 or can be deferred — adds print/logistics complexity (per-store QR codes) that may not be worth it initially if most QR codes are on-pack (SKU+batch only, no location).
