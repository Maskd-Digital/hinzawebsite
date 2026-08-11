import { getServiceClient, handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();

  try {
    const url = new URL(req.url);
    let trackingCode: string | null = url.searchParams.get("tracking_code");

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      trackingCode = (body.tracking_code as string) || trackingCode;
    }

    if (!trackingCode?.trim()) {
      return jsonResponse({ ok: false, error: "tracking_code_required" }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.rpc("get_public_complaint_status", {
      p_tracking_code: trackingCode.trim(),
    });

    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 500);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return jsonResponse({ ok: false, error: "not_found" }, 404);
    }

    return jsonResponse({
      ok: true,
      tracking_code: row.tracking_code,
      status: row.status,
      created_at: row.created_at,
    });
  } catch (err) {
    console.error("get_public_complaint_status error", err);
    return jsonResponse({ ok: false, error: "internal_error" }, 500);
  }
});
