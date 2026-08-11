import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const SPAM_PATTERNS = [
  /\b(viagra|casino|crypto\s*pump|buy\s*followers)\b/i,
  /(https?:\/\/\S+\s*){4,}/i,
  /(.)\1{12,}/,
];

/** Flag only — never block a genuine submission. */
export function scoreAbuse(rawText: string): { flagged: boolean; reason: string | null } {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(rawText)) {
      return { flagged: true, reason: "spam_pattern" };
    }
  }
  if (rawText.trim().length < 8) {
    return { flagged: true, reason: "too_short" };
  }
  return { flagged: false, reason: null };
}

/** Repeat submissions in a short window are flagged, not rejected. */
export async function checkRateLimit(
  supabase: SupabaseClient,
  opts: { deviceFingerprint: string | null; clientIp: string | null; batchId: string },
): Promise<{ flagged: boolean; reason: string | null }> {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  let query = supabase
    .from("public_complaints")
    .select("id", { count: "exact", head: true })
    .eq("batch_id", opts.batchId)
    .gte("created_at", since);

  if (opts.deviceFingerprint) {
    query = query.eq("device_fingerprint", opts.deviceFingerprint);
  } else if (opts.clientIp) {
    query = query.eq("client_ip", opts.clientIp);
  } else {
    return { flagged: false, reason: null };
  }

  const { count, error } = await query;
  if (error) {
    console.error("rate limit check failed", error);
    return { flagged: false, reason: null };
  }

  if ((count ?? 0) >= 3) {
    return { flagged: true, reason: "repeat_submission_window" };
  }
  return { flagged: false, reason: null };
}
