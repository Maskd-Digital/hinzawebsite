export type StructureResult = {
  title: string;
  summary: string;
  severity_ai_suggested: number | null;
  category_ai_suggested: string | null;
  category_mismatch: boolean;
};

export type StructureInput = {
  rawText: string;
  typeName: string;
  productName: string;
  fieldAnswers: Record<string, string>;
};

type AiProvider = "openai" | "anthropic";

function getProvider(): AiProvider {
  const raw = (Deno.env.get("AI_PROVIDER") ?? "openai").toLowerCase().trim();
  return raw === "anthropic" ? "anthropic" : "openai";
}

function buildPrompt(input: StructureInput): string {
  return `You structure public product complaints for QA triage.
Return ONLY valid JSON with keys:
- title (short, <= 80 chars)
- summary (2-4 sentences, QA-readable)
- severity_ai_suggested (1-5 integer or null)
- category_ai_suggested (string; closest category label)
- category_mismatch (boolean; true if user category likely wrong)

User-selected category: ${input.typeName}
Product: ${input.productName}
Field answers: ${JSON.stringify(input.fieldAnswers)}
Customer verbatim text (do not rewrite as replacement; summarize separately):
"""
${input.rawText}
"""`;
}

function fallbackResult(input: StructureInput): StructureResult {
  return {
    title: `${input.typeName}: ${input.rawText.slice(0, 60)}`.trim(),
    summary: input.rawText.slice(0, 500),
    severity_ai_suggested: null,
    category_ai_suggested: input.typeName,
    category_mismatch: false,
  };
}

function parseStructureJson(text: string, input: StructureInput): StructureResult {
  const fallback = fallbackResult(input);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return fallback;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: String(parsed.title || fallback.title).slice(0, 120),
      summary: String(parsed.summary || fallback.summary),
      severity_ai_suggested:
        typeof parsed.severity_ai_suggested === "number"
          ? Math.min(5, Math.max(1, Math.round(parsed.severity_ai_suggested)))
          : null,
      category_ai_suggested: parsed.category_ai_suggested
        ? String(parsed.category_ai_suggested)
        : input.typeName,
      category_mismatch: Boolean(parsed.category_mismatch),
    };
  } catch {
    return fallback;
  }
}

async function structureWithOpenAI(
  input: StructureInput,
  fallback: StructureResult,
): Promise<StructureResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.warn("OPENAI_API_KEY missing; using fallback structuring");
    return fallback;
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You return only valid JSON matching the requested schema.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
    }),
  });

  if (!res.ok) {
    console.error("OpenAI API error", await res.text());
    return fallback;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return parseStructureJson(text, input);
}

async function structureWithAnthropic(
  input: StructureInput,
  fallback: StructureResult,
): Promise<StructureResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY missing; using fallback structuring");
    return fallback;
  }

  const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-20250514";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });

  if (!res.ok) {
    console.error("Claude API error", await res.text());
    return fallback;
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  return parseStructureJson(text, input);
}

/** Server-side structuring only — never call from the browser. */
export async function structureComplaint(input: StructureInput): Promise<StructureResult> {
  const fallback = fallbackResult(input);
  const provider = getProvider();

  try {
    if (provider === "anthropic") {
      return await structureWithAnthropic(input, fallback);
    }
    return await structureWithOpenAI(input, fallback);
  } catch (err) {
    console.error(`structureComplaint (${provider}) failed`, err);
    return fallback;
  }
}

/** @deprecated Use structureComplaint — kept for call-site compatibility. */
export const structureComplaintWithClaude = structureComplaint;
