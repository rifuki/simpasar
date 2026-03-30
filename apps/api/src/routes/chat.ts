import { Hono } from "hono";
// SimulationResult type inline (shared types path resolution broken in API — pre-existing issue)

export const chatRoute = new Hono();

interface ChatRequestBody {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulationResult: any;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

chatRoute.post("/", async (c) => {
  let body: ChatRequestBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON", message: "Request body tidak valid" }, 400);
  }

  const { message, simulationResult, history } = body;

  if (!message || !simulationResult) {
    return c.json({ error: "BAD_REQUEST", message: "message dan simulationResult wajib ada" }, 400);
  }

  try {
    const { callLLM } = await import("../services/claudeService");

    const systemPrompt = `Kamu adalah AI Market Consultant untuk platform SimPasar — platform simulasi pasar B2B berbasis data konsumen Indonesia.

Kamu memiliki akses ke hasil simulasi berikut:

PRODUK: ${simulationResult.request.product.name}
KATEGORI: ${simulationResult.request.product.category}
DESKRIPSI: ${simulationResult.request.product.description ?? "-"}
HARGA: ${simulationResult.request.product.price.toLocaleString("id-ID")} ${simulationResult.request.product.priceUnit}
KOTA TARGET: ${simulationResult.cityContext.cityName}
MARKET SIZE: ${simulationResult.cityContext.marketSize}

HASIL SIMULASI:
- Market Penetration: ${simulationResult.summary.marketPenetration}%
- Confidence Score: ${simulationResult.summary.confidenceScore}%
- Harga Optimal Rekomendasi: Rp ${simulationResult.summary.optimalPriceRange.recommended.toLocaleString("id-ID")}
- Range Harga Optimal: Rp ${simulationResult.summary.optimalPriceRange.min.toLocaleString("id-ID")} - Rp ${simulationResult.summary.optimalPriceRange.max.toLocaleString("id-ID")}
- Estimasi Revenue Bulanan: Rp ${simulationResult.summary.estimatedMonthlyRevenue.low.toLocaleString("id-ID")} - Rp ${simulationResult.summary.estimatedMonthlyRevenue.high.toLocaleString("id-ID")}
- Key Risks: ${simulationResult.summary.keyRisks.join(", ")}
- Key Opportunities: ${simulationResult.summary.keyOpportunities.join(", ")}
- Overall Recommendation: ${simulationResult.summary.overallRecommendation}

BREAKDOWN SEGMEN:
${simulationResult.segmentBreakdown.map((s: { name: string; percentage: number; decision: string }) => `- ${s.name}: ${s.percentage}% (${s.decision})`).join("\n")}

Jawab pertanyaan user secara profesional, singkat, tepat sasaran, dalam Bahasa Indonesia. 
Fokus pada insight yang actionable dan spesifik berdasarkan data simulasi di atas.
Jangan jawab hal-hal di luar konteks simulasi ini.`;

    const conversationHistory = (history ?? [])
      .slice(-10) // Limit last 10 messages for context
      .map(m => `${m.role === "user" ? "User" : "Consultant"}: ${m.content}`)
      .join("\n");

    const userPrompt = conversationHistory
      ? `Riwayat percakapan:\n${conversationHistory}\n\nUser: ${message}`
      : message;

    const response = await callLLM(systemPrompt, userPrompt);

    return c.json({ success: true, message: response });
  } catch (err) {
    console.error("[chat/post]", err);
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada AI";
    return c.json({ error: "AI_ERROR", message: msg }, 500);
  }
});
