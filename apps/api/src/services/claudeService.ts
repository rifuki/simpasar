import { buildUserPrompt } from "./promptBuilder";
import { getPersonasByCity, getCityById, getSetting, saveSimulation } from "../db/queries";
import { callCodex } from "./codexService";
import type { SimulationRequest, SimulationResult } from "../../../packages/shared/types";

// ─── Provider: Anthropic SDK (direct API key) ────────────────────────────────

async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

// ─── Provider: Naisu Agent Gateway (OAuth / subscription) ────────────────────

async function callNaisu(systemPrompt: string, userPrompt: string): Promise<string> {
  const baseUrl = process.env.NAISU_AGENT_URL || "http://localhost:8787";
  const provider = process.env.NAISU_PROVIDER || "openai-codex";

  const res = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Naisu agent error ${res.status}: ${err}`);
  }

  const json = await res.json() as {
    success: boolean;
    message: string;
    data: { message: { content: string } };
  };

  if (!json.success) throw new Error(`Naisu agent returned failure: ${json.message}`);
  return json.data.message.content;
}

// ─── Router ──────────────────────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  switch (provider) {
    case "codex":
      return callCodex(systemPrompt, userPrompt);
    case "naisu":
      return callNaisu(systemPrompt, userPrompt);
    case "anthropic":
    default:
      return callAnthropic(systemPrompt, userPrompt);
  }
}

// ─── JSON extraction ─────────────────────────────────────────────────────────

function extractJson(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);

  throw new Error("No JSON found in LLM response");
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  const city = getCityById(request.targetCity);
  if (!city) throw new Error(`City '${request.targetCity}' not found`);

  const personas = getPersonasByCity(request.targetCity);
  if (personas.length === 0)
    throw new Error(`No personas found for city '${request.targetCity}'`);

  const systemPrompt = getSetting("system_prompt") ?? (await import("./promptBuilder")).SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(request, city, personas);
  const rawText = await callLLM(systemPrompt, userPrompt);

  const jsonStr = extractJson(rawText);
  const parsed = JSON.parse(jsonStr) as {
    summary: SimulationResult["summary"] & { marketPenetration?: number };
    segmentBreakdown: SimulationResult["segmentBreakdown"];
    personaDetails: SimulationResult["personaDetails"];
  };

  // Always calculate marketPenetration server-side
  const buyCount = parsed.personaDetails.filter((p) => p.decision === "buy").length;
  const marketPenetration = Math.round((buyCount / parsed.personaDetails.length) * 100);

  const result: SimulationResult = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    request,
    summary: {
      ...parsed.summary,
      marketPenetration,
    },
    segmentBreakdown: parsed.segmentBreakdown,
    personaDetails: parsed.personaDetails,
    cityContext: {
      cityName: city.name,
      marketSize: `Populasi ${city.population.toLocaleString("id-ID")} jiwa`,
      competition: city.topIndustries.join(", "),
    },
  };

  saveSimulation({
    id: result.id,
    createdAt: result.createdAt,
    cityId: request.targetCity,
    productName: request.product.name,
    marketPenetration,
    requestJson: JSON.stringify(request),
    resultJson: JSON.stringify(result),
  });

  return result;
}
