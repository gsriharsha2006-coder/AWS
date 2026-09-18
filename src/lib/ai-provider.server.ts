/**
 * Server-only AI provider abstraction for Venture Connect.
 *
 * Every AI feature (Idea Workspace review, VC Readiness report, opportunity
 * quality gate) calls `runStructuredAI` — never a provider SDK directly — so the
 * provider can be switched without touching any UI code.
 *
 * Providers:
 *  - "bedrock" — Amazon Bedrock (Converse API) through the AWS connector gateway.
 *                AWS credentials stay server-side; the gateway SigV4-signs calls.
 *  - "lovable" — Lovable AI Gateway (default, always available).
 *
 * Select with the VC_AI_PROVIDER environment variable.
 */

const AWS_GATEWAY = "https://connector-gateway.lovable.dev/aws";

export const BEDROCK_REGION = "ap-south-2";
export const BEDROCK_MODEL_ID = "apac.anthropic.claude-sonnet-4-20250514-v1:0";

export type AiProvider = "bedrock" | "lovable";

/**
 * Amazon Bedrock is attempted first for every AI feature. Set VC_AI_PROVIDER to
 * "lovable" to pin the fallback provider instead.
 */
export function selectedProvider(): AiProvider {
  return process.env["VC_AI_PROVIDER"] === "lovable" ? "lovable" : "bedrock";
}

function awsHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const awsKey = process.env["AWS_API_KEY"];
  if (!lovableKey || !awsKey) throw new Error("AWS is not connected for this project.");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": awsKey,
    "X-Aws-Signing-Name": "bedrock",
    ...extra,
  };
}

/** Genuine AWS read: lists the Bedrock foundation models this account can use. */
export async function listBedrockModels(): Promise<{ reachable: boolean; models: number; detail?: string }> {
  try {
    const res = await fetch(`${AWS_GATEWAY}/bedrock/foundation-models`, { headers: awsHeaders() });
    if (!res.ok) return { reachable: false, models: 0, detail: `AWS responded with status ${res.status}.` };
    const body = (await res.json()) as { modelSummaries?: unknown[] };
    return { reachable: true, models: body.modelSummaries?.length ?? 0 };
  } catch (error) {
    return { reachable: false, models: 0, detail: error instanceof Error ? error.message : "unknown error" };
  }
}

/**
 * Genuine Bedrock *runtime* probe: a tiny Converse request. Status is only ever
 * reported as working when a real inference call succeeds.
 */
export async function probeBedrockRuntime(): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await fetch(`${AWS_GATEWAY}/bedrock-runtime/model/${BEDROCK_MODEL_ID}/converse`, {
      method: "POST",
      headers: awsHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ text: "Reply with OK." }] }],
        inferenceConfig: { maxTokens: 8 },
      }),
    });
    if (!res.ok) return { ok: false, detail: `Bedrock runtime responded with status ${res.status}.` };
    return { ok: true };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "unknown error" };
  }
}

export interface StructuredRequest {
  instructions: string;
  schemaName: string;
  schema: Record<string, unknown>;
  prompt: string;
  effort: "low" | "medium";
}

/** Amazon Bedrock Converse call, returning the model's raw JSON text. */
async function runOnBedrock(req: StructuredRequest): Promise<string> {
  const res = await fetch(`${AWS_GATEWAY}/bedrock-runtime/model/${BEDROCK_MODEL_ID}/converse`, {
    method: "POST",
    headers: awsHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      system: [
        {
          text:
            req.instructions +
            " Respond with a single JSON object that validates against this JSON schema and nothing else: " +
            JSON.stringify(req.schema),
        },
      ],
      messages: [{ role: "user", content: [{ text: req.prompt }] }],
      inferenceConfig: { maxTokens: 4096, temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Bedrock request failed [${res.status}]: ${detail}`);
  }

  const body = (await res.json()) as { output?: { message?: { content?: { text?: string }[] } } };
  const text = body.output?.message?.content?.map((c) => c.text ?? "").join("") ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Bedrock returned no structured result.");
  return text.slice(start, end + 1);
}

/** Lovable AI Gateway call, returning the model's raw JSON text. */
async function runOnLovable(req: StructuredRequest): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      stream: true,
      instructions: req.instructions,
      reasoning: { effort: req.effort, summary: "auto" },
      include: ["reasoning.encrypted_content"],
      store: false,
      text: { format: { type: "json_schema", name: req.schemaName, strict: true, schema: req.schema } },
      input: [{ role: "user", content: [{ type: "input_text", text: req.prompt }] }],
    }),
  });

  if (!res.ok || !res.body) {
    if (res.status === 429) throw new Error("The analysis service is busy. Please try again shortly.");
    if (res.status === 402)
      throw new Error("AI usage credits are exhausted for this workspace. Add credits to continue.");
    throw new Error("The analysis could not be completed right now. Please try again.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload) as { type?: string; delta?: string; response?: { output_text?: string } };
        if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
          text += evt.delta;
        } else if (evt.type === "response.completed" && evt.response?.output_text && !text) {
          text = evt.response.output_text;
        }
      } catch {
        /* skip malformed SSE chunks */
      }
    }
  }

  if (!text.trim()) throw new Error("The analysis returned no result. Please try again.");
  return text;
}

/**
 * Runs a structured AI request on the configured provider. If Bedrock is
 * selected but the call fails, the request falls back to the Lovable gateway so
 * a founder never sees a broken analysis.
 */
export async function runStructuredAI(
  req: StructuredRequest,
): Promise<{ raw: string; provider: AiProvider; fallbackNote: string | null }> {
  let fallbackNote: string | null = null;

  if (selectedProvider() === "bedrock") {
    try {
      return { raw: await runOnBedrock(req), provider: "bedrock", fallbackNote: null };
    } catch (error) {
      console.error("Bedrock request failed, falling back to the Lovable gateway:", error);
      fallbackNote =
        "Amazon Bedrock could not be reached for this request, so the analysis ran on the backup AI provider.";
    }
  }
  return { raw: await runOnLovable(req), provider: "lovable", fallbackNote };
}
