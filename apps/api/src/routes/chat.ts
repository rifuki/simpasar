import { Hono } from "hono";
import { db } from "../db/database";

export const chatRoute = new Hono();

const CHAT_SESSION_HOURS = 12;

interface ChatRequestBody {
  message: string;
  simulationId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulationResult: any;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}

// ── GET /api/chat/messages?simulationId=xxx ───────────────────────────────────
// Load persisted messages for a simulation
chatRoute.get("/messages", (c) => {
  const simulationId = c.req.query("simulationId");
  if (!simulationId) return c.json({ error: "Missing simulationId" }, 400);

  const sim = db.query("SELECT created_at FROM simulations WHERE id = ?").get(simulationId) as { created_at: string } | null;
  if (!sim) return c.json({ error: "Simulation not found" }, 404);

  // Check if session is still valid (24h from simulation creation)
  const createdAt = new Date(sim.created_at).getTime();
  const expiresAt = createdAt + CHAT_SESSION_HOURS * 60 * 60 * 1000;
  const isExpired = Date.now() > expiresAt;

  const messages = db.query(
    "SELECT id, role, content, created_at FROM chat_messages WHERE simulation_id = ? ORDER BY created_at ASC"
  ).all(simulationId) as { id: string; role: string; content: string; created_at: string }[];

  return c.json({
    success: true,
    messages,
    expiresAt: new Date(expiresAt).toISOString(),
    isExpired,
  });
});

// ── POST /api/chat ────────────────────────────────────────────────────────────
// Send a message and get AI response; persists to DB if simulationId provided
chatRoute.post("/", async (c) => {
  let body: ChatRequestBody;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "INVALID_JSON", message: "Request body tidak valid" }, 400);
  }

  const { message, simulationId, simulationResult, history } = body;

  if (!message || !simulationResult) {
    return c.json({ error: "BAD_REQUEST", message: "message dan simulationResult wajib ada" }, 400);
  }

  // Enforce session expiry if simulationId provided
  if (simulationId) {
    const sim = db.query("SELECT created_at FROM simulations WHERE id = ?").get(simulationId) as { created_at: string } | null;
    if (sim) {
      const expiresAt = new Date(sim.created_at).getTime() + CHAT_SESSION_HOURS * 60 * 60 * 1000;
      if (Date.now() > expiresAt) {
        return c.json({ error: "SESSION_EXPIRED", message: "Sesi konsultasi 24 jam telah berakhir. Jalankan simulasi baru untuk melanjutkan." }, 403);
      }
    }
  }

  try {
    const { callLLM } = await import("../services/claudeService");

    const systemPrompt = `Kamu adalah AI Market Consultant untuk platform PasarSim — platform simulasi pasar B2B berbasis data konsumen Indonesia.

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
      .slice(-10)
      .map(m => `${m.role === "user" ? "User" : "Consultant"}: ${m.content}`)
      .join("\n");

    const userPrompt = conversationHistory
      ? `Riwayat percakapan:\n${conversationHistory}\n\nUser: ${message}`
      : message;

    const response = await callLLM(systemPrompt, userPrompt);

    // Persist messages if simulationId provided
    if (simulationId) {
      const now = new Date().toISOString();
      db.prepare("INSERT INTO chat_messages (id, simulation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), simulationId, "user", message, now);
      db.prepare("INSERT INTO chat_messages (id, simulation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), simulationId, "assistant", response, now);
    }

    return c.json({ success: true, message: response });
  } catch (err) {
    console.error("[chat/post]", err);
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan pada AI";
    return c.json({ error: "AI_ERROR", message: msg }, 500);
  }
});
