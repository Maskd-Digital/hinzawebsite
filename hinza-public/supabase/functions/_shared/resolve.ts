import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

type MasterField = {
  id?: string;
  field_name?: string;
  field_label?: string;
  field_type?: string;
  is_required?: boolean;
  options?: unknown;
  field_order?: number;
};

/**
 * Public QR intake is customer-only. Internal / plant / staff templates are excluded.
 * Match against complaint_master_templates.name.
 */
const CUSTOMER_TEMPLATE =
  /(damaged lid|cap defect|leaking|damaged container|off-?spec|taste|color|carbonation|foreign object|label(l)?ing|coding error|expired|short-?dated|allergen|contaminat)/i;

const INTERNAL_TEMPLATE =
  /(equipment|malfunction|raw material|ingredient|general internal|receiving|transit|pest|hygiene|temperature excursion|cold chain|fill level|supplier|production line)/i;

/**
 * Only surface field types a customer can answer. Everything else is plant/QA.
 */
const CUSTOMER_FIELD =
  /^(defect type|damage type|packaging type|attribute affected|specific issue|object type|error type|issue|allergen involved|quantity affected|quantity \(cases|deviation type|best before)/i;

/** Plant/staff field names — never ask the public these. */
const INTERNAL_FIELD =
  /(reporting facility|receiving facility|sending facility|facility type|department|production line|shift|immediate action|quarantine|quarantined|retained|stock removed|stock quarantined|suggested corrective|supplier|carrier|delivery|downtime|equipment|previous product|material type|date received|date discovered|discovered during|found at stage|contamination source|sample retained|product released|target volume|actual volume|required temperature|recorded temperature|estimated duration|logistics|area \/ zone|product at risk|cases received|cases damaged|malfunction|used in production|cip|flush|changeover)/i;

/** Friendlier labels for customers (QR already knows product/batch). */
const CUSTOMER_LABELS: Record<string, string> = {
  "defect type": "What kind of defect?",
  "damage type": "What kind of damage?",
  "packaging type": "What packaging did you have?",
  "attribute affected": "What seemed wrong?",
  "specific issue": "Which best describes it?",
  "object type": "What did you find?",
  "error type": "What was wrong with the label?",
  issue: "What was the issue?",
  "allergen involved": "Any allergen concern?",
  "quantity affected": "How many units were affected?",
  "quantity (cases / units)": "How many units were affected?",
  "deviation type": "How was the fill level off?",
  "best before date": "What best-before date is on the pack?",
};

function mapFieldType(raw: string | undefined): string {
  switch ((raw ?? "text").toLowerCase()) {
    case "select":
      return "dropdown";
    case "textarea":
      return "text";
    case "boolean":
      return "dropdown";
    case "file":
      return "file_upload";
    case "number":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}

function isCustomerTemplate(name: string): boolean {
  if (INTERNAL_TEMPLATE.test(name)) return false;
  return CUSTOMER_TEMPLATE.test(name);
}

function customerLabel(name: string): string {
  const key = name.trim().toLowerCase();
  return CUSTOMER_LABELS[key] ?? name;
}

export function publicFieldsFromMaster(fields: MasterField[] | null | undefined) {
  if (!Array.isArray(fields)) return [];
  return fields
    .filter((f) => {
      const type = (f.field_type ?? "").toLowerCase();
      const name = (f.field_name ?? f.field_label ?? "").trim();
      if (!name) return false;
      if (type === "file") return false;
      if (/^description$/i.test(name)) return false; // covered by free-text story step
      if (INTERNAL_FIELD.test(name)) return false;
      if (!CUSTOMER_FIELD.test(name)) return false;
      return true;
    })
    .sort((a, b) => (a.field_order ?? 0) - (b.field_order ?? 0))
    .map((f) => {
      const name = (f.field_name ?? f.field_label ?? "Field").trim();
      return {
        id: String(f.id ?? ""),
        field_label: customerLabel(name),
        field_type: mapFieldType(f.field_type),
        // Soften required: public flow shouldn't force plant-oriented quantity if blank
        is_required: Boolean(f.is_required) && !/^quantity/i.test(name),
        options:
          (f.field_type ?? "").toLowerCase() === "boolean"
            ? ["Yes", "No"]
            : Array.isArray(f.options)
              ? f.options
              : [],
        field_order: f.field_order ?? 0,
      };
    })
    .filter((f) => f.id);
}

export type IntakeContextOk = {
  ok: true;
  product: { id: string; name: string; company_id: string };
  batch: { id: string; batch_number: string; production_date: string | null };
  outlet: { id: string; name: string } | null;
  complaint_types: Array<{
    id: string;
    name: string;
    description: string | null;
    is_safety: boolean;
    fields: ReturnType<typeof publicFieldsFromMaster>;
  }>;
};

export type IntakeContextErr = { ok: false; error: string };

/** Customer-facing names for templates that still sound internal. */
function customerTemplateName(name: string): string {
  const map: Record<string, string> = {
    "Damaged Lid / Cap Defect": "Damaged lid or cap",
    "Leaking / Damaged Container": "Leaking or damaged packaging",
    "Off-Spec Product (Taste / Color / Carbonation)": "Taste, color, or fizz issue",
    "Foreign Object Found": "Something unexpected in the product",
    "Labeling / Coding Error": "Wrong or unclear label",
    "Expired / Short-Dated Stock Found": "Expired or short-dated product",
    "Cross-Contamination / Allergen Risk": "Allergen or contamination concern",
  };
  return map[name] ?? name;
}

function customerTemplateDescription(name: string, fallback: string | null): string {
  const map: Record<string, string> = {
    "Damaged Lid / Cap Defect": "The lid, cap, or seal looks cracked, loose, or broken.",
    "Leaking / Damaged Container": "The bottle, can, or pack is leaking, crushed, or damaged.",
    "Off-Spec Product (Taste / Color / Carbonation)":
      "The taste, color, smell, or fizz doesn’t seem right.",
    "Foreign Object Found": "You found something that shouldn’t be in the product.",
    "Labeling / Coding Error": "The label, date, or code looks wrong or missing.",
    "Expired / Short-Dated Stock Found": "The product is past date or very close to expiry.",
    "Cross-Contamination / Allergen Risk":
      "You’re concerned about allergens or contamination.",
  };
  return map[name] ?? fallback ?? "";
}

/** Resolve product/batch and load customer-facing master templates only. */
export async function resolveIntakeContext(
  supabase: SupabaseClient,
  opts: { productId: string; batchId: string; outletId?: string | null },
): Promise<IntakeContextOk | IntakeContextErr> {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, company_id")
    .eq("id", opts.productId)
    .maybeSingle();

  if (productError || !product) {
    return { ok: false, error: "invalid_product" };
  }

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("id, batch_number, production_date, product_id")
    .eq("id", opts.batchId)
    .maybeSingle();

  if (batchError || !batch) {
    return { ok: false, error: "invalid_batch" };
  }

  if (batch.product_id !== product.id) {
    return { ok: false, error: "batch_product_mismatch" };
  }

  let outlet: { id: string; name: string } | null = null;
  if (opts.outletId) {
    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .select("id, name, company_id")
      .eq("id", opts.outletId)
      .maybeSingle();
    if (facilityError || !facility || facility.company_id !== product.company_id) {
      return { ok: false, error: "invalid_outlet" };
    }
    outlet = { id: facility.id, name: facility.name };
  }

  const { data: templates, error: templateError } = await supabase
    .from("complaint_master_templates")
    .select("id, name, description, fields, company_id")
    .or(`company_id.eq.${product.company_id},company_id.is.null`)
    .order("name");

  if (templateError) {
    return { ok: false, error: templateError.message };
  }

  const complaint_types = (templates ?? [])
    .filter((t) => isCustomerTemplate(t.name ?? ""))
    .map((t) => ({
      id: t.id,
      name: customerTemplateName(t.name),
      description: customerTemplateDescription(t.name, t.description),
      is_safety: /(contaminat|allergen|foreign.?object|illness|hazard)/i.test(t.name ?? ""),
      fields: publicFieldsFromMaster(t.fields as MasterField[]),
      _sortName: t.name as string,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ _sortName: _, ...rest }) => rest);

  return {
    ok: true,
    product,
    batch: {
      id: batch.id,
      batch_number: batch.batch_number,
      production_date: batch.production_date,
    },
    outlet,
    complaint_types,
  };
}
