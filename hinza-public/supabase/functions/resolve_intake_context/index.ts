import { getServiceClient, handleOptions, jsonResponse } from "../_shared/cors.ts";
import { resolveIntakeContext } from "../_shared/resolve.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json();
    const productId = body.product_id as string | undefined;
    const batchId = body.batch_id as string | undefined;
    const outletId = (body.outlet_id as string | null | undefined) ?? null;

    if (!productId || !batchId) {
      return jsonResponse({ ok: false, error: "missing_ids" }, 400);
    }

    const supabase = getServiceClient();
    const context = await resolveIntakeContext(supabase, {
      productId,
      batchId,
      outletId,
    });

    return jsonResponse(context, context.ok ? 200 : 400);
  } catch (err) {
    console.error("resolve_intake_context error", err);
    return jsonResponse({ ok: false, error: "internal_error" }, 500);
  }
});
