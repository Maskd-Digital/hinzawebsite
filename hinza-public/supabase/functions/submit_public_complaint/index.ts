import {
  getClientIp,
  getServiceClient,
  handleOptions,
  jsonResponse,
  mapSeverityToPriority,
} from "../_shared/cors.ts";
import { checkRateLimit, scoreAbuse } from "../_shared/abuse.ts";
import { structureComplaint } from "../_shared/structure.ts";
import { resolveIntakeContext } from "../_shared/resolve.ts";

type SubmitBody = {
  product_id: string;
  batch_id: string;
  outlet_id?: string | null;
  /** complaint_master_templates.id */
  template_id: string;
  raw_text: string;
  field_answers?: Record<string, string>;
  severity_user_rated?: number | null;
  photo_paths?: string[];
  contact_phone?: string | null;
  contact_email?: string | null;
  device_fingerprint?: string | null;
  source?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  try {
    const body = (await req.json()) as SubmitBody;
    if (!body.product_id || !body.batch_id || !body.template_id) {
      return jsonResponse({ ok: false, error: "missing_required_fields" }, 400);
    }
    if (!body.raw_text || !body.raw_text.trim()) {
      return jsonResponse({ ok: false, error: "raw_text_required" }, 400);
    }
    if (body.source && body.source !== "public_qr") {
      return jsonResponse({ ok: false, error: "invalid_source" }, 400);
    }

    const supabase = getServiceClient();
    const clientIp = getClientIp(req);
    const deviceFingerprint = body.device_fingerprint ?? req.headers.get("x-device-fingerprint");

    const context = await resolveIntakeContext(supabase, {
      productId: body.product_id,
      batchId: body.batch_id,
      outletId: body.outlet_id ?? null,
    });

    if (!context.ok) {
      return jsonResponse({ ok: false, error: context.error }, 400);
    }

    const templates = context.complaint_types as Array<{
      id: string;
      name: string;
      is_safety: boolean;
      fields: Array<{ id: string; is_required: boolean }>;
    }>;

    const selectedTemplate = templates.find((t) => t.id === body.template_id);
    if (!selectedTemplate) {
      return jsonResponse({ ok: false, error: "invalid_template" }, 400);
    }

    const fieldAnswers = body.field_answers ?? {};
    for (const field of selectedTemplate.fields) {
      if (field.is_required && !String(fieldAnswers[field.id] ?? "").trim()) {
        return jsonResponse({ ok: false, error: "missing_required_field", field_id: field.id }, 400);
      }
    }

    if (selectedTemplate.is_safety) {
      if (!body.severity_user_rated || body.severity_user_rated < 1) {
        return jsonResponse({ ok: false, error: "severity_required_for_safety" }, 400);
      }
      if (!body.photo_paths?.length) {
        return jsonResponse({ ok: false, error: "photo_required_for_safety" }, 400);
      }
    }

    const rate = await checkRateLimit(supabase, {
      deviceFingerprint,
      clientIp,
      batchId: body.batch_id,
    });
    const abuse = scoreAbuse(body.raw_text);
    const flagged = rate.flagged || abuse.flagged;
    const flagReason = rate.reason || abuse.reason;

    const structured = await structureComplaint({
      rawText: body.raw_text.trim(),
      typeName: selectedTemplate.name,
      productName: context.product.name,
      fieldAnswers,
    });

    const { data: trackingCode, error: trackingError } = await supabase.rpc(
      "generate_public_tracking_code",
    );
    if (trackingError || !trackingCode) {
      return jsonResponse({ ok: false, error: "tracking_code_failed" }, 500);
    }

    const photoUrls = (body.photo_paths ?? []).map((path) =>
      path.startsWith("http") ? path : path
    );

    // Optional link to company_complaint_types; ensure a row exists if the
    // public_complaints.company_complaint_type_id column is still NOT NULL.
    let linkedTypeId: string | null = null;
    {
      const { data: linkedType } = await supabase
        .from("company_complaint_types")
        .select("id")
        .eq("company_id", context.product.company_id)
        .eq("source_template_id", body.template_id)
        .maybeSingle();

      if (linkedType?.id) {
        linkedTypeId = linkedType.id;
      } else {
        const { data: created, error: createTypeError } = await supabase
          .from("company_complaint_types")
          .insert({
            company_id: context.product.company_id,
            name: selectedTemplate.name,
            source_template_id: body.template_id,
          })
          .select("id")
          .single();
        if (createTypeError) {
          console.warn("company_complaint_types upsert skipped", createTypeError.message);
        } else {
          linkedTypeId = created.id;
        }
      }
    }

    const insertPayload = {
      tracking_code: trackingCode as string,
      source: "public_qr",
      company_id: context.product.company_id,
      product_id: body.product_id,
      batch_id: body.batch_id,
      outlet_id: body.outlet_id ?? null,
      company_complaint_type_id: linkedTypeId,
      template_id: body.template_id,
      severity_user_rated: body.severity_user_rated ?? null,
      severity_ai_suggested: structured.severity_ai_suggested,
      category_ai_suggested: structured.category_ai_suggested,
      category_mismatch: structured.category_mismatch,
      ai_title: structured.title,
      ai_summary: structured.summary,
      raw_text: body.raw_text.trim(),
      photo_urls: photoUrls,
      field_answers: fieldAnswers,
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email || null,
      device_fingerprint: deviceFingerprint,
      client_ip: clientIp,
      status: "submitted",
      flagged_for_review: flagged || structured.category_mismatch,
      flag_reason: flagReason,
    };

    const { data: publicRow, error: insertError } = await supabase
      .from("public_complaints")
      .insert(insertPayload)
      .select("id, tracking_code, flagged_for_review")
      .single();

    if (insertError || !publicRow) {
      console.error("public_complaints insert failed", insertError);
      return jsonResponse({ ok: false, error: "insert_failed" }, 500);
    }

    let hinzaComplaintId: string | null = null;
    try {
      hinzaComplaintId = await promoteToHinzaComplaint(supabase, {
        publicComplaintId: publicRow.id,
        companyId: context.product.company_id,
        productId: body.product_id,
        batchId: body.batch_id,
        facilityId: body.outlet_id ?? null,
        templateId: body.template_id,
        title: structured.title,
        priority: mapSeverityToPriority(
          body.severity_user_rated ?? structured.severity_ai_suggested,
        ),
        fieldAnswers,
        photoPaths: photoUrls,
        summary: structured.summary,
        rawText: body.raw_text.trim(),
      });

      await supabase
        .from("public_complaints")
        .update({ hinza_complaint_id: hinzaComplaintId })
        .eq("id", publicRow.id);
    } catch (promoteError) {
      console.error("promote failed", promoteError);
      await supabase
        .from("public_complaints")
        .update({
          flagged_for_review: true,
          flag_reason: "promote_failed",
        })
        .eq("id", publicRow.id);
    }

    return jsonResponse({
      ok: true,
      tracking_code: publicRow.tracking_code,
      public_complaint_id: publicRow.id,
      hinza_complaint_id: hinzaComplaintId,
      flagged_for_review: publicRow.flagged_for_review,
    });
  } catch (err) {
    console.error("submit_public_complaint error", err);
    return jsonResponse({ ok: false, error: "internal_error" }, 500);
  }
});

async function promoteToHinzaComplaint(
  supabase: ReturnType<typeof getServiceClient>,
  opts: {
    publicComplaintId: string;
    companyId: string;
    productId: string;
    batchId: string;
    facilityId: string | null;
    templateId: string | null;
    title: string;
    priority: string;
    fieldAnswers: Record<string, string>;
    photoPaths: string[];
    summary: string;
    rawText: string;
  },
): Promise<string> {
  const submitterId =
    Deno.env.get("PUBLIC_COMPLAINT_SUBMITTER_ID") ??
    "00000000-0000-0000-0000-0000000000a1";

  const customFieldsPayload = {
    source: "public_qr",
    public_complaint_id: opts.publicComplaintId,
    ai_summary: opts.summary,
    raw_text: opts.rawText,
    answers: opts.fieldAnswers,
  };

  const { data: complaint, error } = await supabase
    .from("complaints")
    .insert({
      company_id: opts.companyId,
      product_id: opts.productId,
      batch_id: opts.batchId,
      facility_id: opts.facilityId,
      template_id: opts.templateId,
      title: opts.title,
      priority: opts.priority,
      status: "pending",
      submitted_by_id: submitterId,
      custom_fields: customFieldsPayload,
    })
    .select("id")
    .single();

  if (error || !complaint) {
    throw new Error(error?.message ?? "complaint_insert_failed");
  }

  // Master template field ids are string keys (e.g. "1a01"), not UUIDs —
  // store answers on complaints.custom_fields only.
  const uuidFieldRows = Object.entries(opts.fieldAnswers)
    .filter(([id]) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    )
    .map(([custom_field_id, value]) => ({
      complaint_id: complaint.id,
      custom_field_id,
      value: String(value),
    }));

  if (uuidFieldRows.length > 0) {
    const { error: valuesError } = await supabase
      .from("complaint_custom_field_values")
      .insert(uuidFieldRows);
    if (valuesError) {
      console.error("custom field values insert failed", valuesError);
    }
  }

  if (opts.photoPaths.length > 0) {
    const docs = opts.photoPaths.map((filePath) => ({
      complaint_id: complaint.id,
      document_type: "evidence",
      file_path: filePath,
      file_name: filePath.split("/").pop() ?? "evidence.jpg",
      uploaded_by: submitterId,
    }));
    const { error: docsError } = await supabase.from("complaint_documents").insert(docs);
    if (docsError) {
      console.error("complaint_documents insert failed", docsError);
    }
  }

  return complaint.id as string;
}
