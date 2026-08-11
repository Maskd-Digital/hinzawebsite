import { getServiceClient, handleOptions, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  try {
    const body = await req.json();
    const contentType = (body.content_type as string) || "image/jpeg";
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : contentType === "image/heic"
            ? "heic"
            : "jpg";

    const prefix = (body.prefix as string) || crypto.randomUUID();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;

    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from("public-complaint-evidence")
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("signed upload failed", error);
      return jsonResponse({ ok: false, error: "upload_url_failed" }, 500);
    }

    return jsonResponse({
      ok: true,
      path: data.path ?? path,
      token: data.token,
      signed_url: data.signedUrl,
    });
  } catch (err) {
    console.error("create_evidence_upload_url error", err);
    return jsonResponse({ ok: false, error: "internal_error" }, 500);
  }
});
