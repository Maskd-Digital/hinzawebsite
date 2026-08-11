import type {
  CreateUploadUrlResult,
  IntakeContext,
  IntakeContextError,
  SubmitPublicComplaintPayload,
  SubmitPublicComplaintResult,
} from "@/lib/types";
import { getSupabaseBrowserClient, getSupabaseFunctionsBaseUrl } from "@/lib/supabase/client";

function anonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

async function callFunction<T>(
  name: string,
  body?: unknown,
  method: "GET" | "POST" = "POST",
): Promise<T> {
  const url = new URL(`${getSupabaseFunctionsBaseUrl()}/${name}`);
  const init: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${anonKey()}`,
      apikey: anonKey(),
      "Content-Type": "application/json",
    },
  };

  if (method === "POST") {
    init.body = JSON.stringify(body ?? {});
  } else if (body && typeof body === "object") {
    for (const [k, v] of Object.entries(body as Record<string, string>)) {
      if (v != null) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export async function resolveIntakeContext(params: {
  productId: string;
  batchId: string;
  outletId?: string | null;
}): Promise<IntakeContext> {
  const data = await callFunction<IntakeContext | IntakeContextError>(
    "resolve_intake_context",
    {
      product_id: params.productId,
      batch_id: params.batchId,
      outlet_id: params.outletId ?? null,
    },
  );

  if (!data.ok) {
    throw new Error(data.error || "Unable to load complaint form");
  }
  return data;
}

export async function submitPublicComplaint(
  payload: SubmitPublicComplaintPayload,
): Promise<SubmitPublicComplaintResult> {
  return callFunction<SubmitPublicComplaintResult>("submit_public_complaint", {
    ...payload,
    source: "public_qr",
  });
}

export async function createEvidenceUploadUrl(contentType: string): Promise<CreateUploadUrlResult> {
  return callFunction<CreateUploadUrlResult>("create_evidence_upload_url", {
    content_type: contentType,
  });
}

export async function uploadEvidenceBlob(
  blob: Blob,
  contentType = "image/jpeg",
): Promise<string> {
  const signed = await createEvidenceUploadUrl(contentType);
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from("public-complaint-evidence")
    .uploadToSignedUrl(signed.path, signed.token, blob, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message || "Photo upload failed");
  }

  return signed.path;
}

export async function getPublicStatus(trackingCode: string): Promise<{
  tracking_code: string;
  status: string;
  created_at: string;
}> {
  const data = await callFunction<{
    ok: boolean;
    tracking_code?: string;
    status?: string;
    created_at?: string;
    error?: string;
  }>("get_public_complaint_status", { tracking_code: trackingCode });

  if (!data.ok || !data.tracking_code || !data.status || !data.created_at) {
    throw new Error(data.error || "Tracking code not found");
  }

  return {
    tracking_code: data.tracking_code,
    status: data.status,
    created_at: data.created_at,
  };
}
