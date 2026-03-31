import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { simulationRequestSchema } from "../schemas/simulationSchema";
import { runSimulation } from "../services/claudeService";
import { db } from "../db/database";

export const simulation = new Hono();

simulation.post("/run", zValidator("json", simulationRequestSchema), async (c) => {
  const body = c.req.valid("json");

  // Validate Credits
  if (!body.walletAddress) {
    return c.json({ error: "UNAUTHORIZED", message: "Wallet address is required for simulation" }, 401);
  }

  const user = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(body.walletAddress) as any;
  if (!user || user.credits < 1) {
    return c.json({ error: "INSUFFICIENT_CREDITS", message: "You need at least 1 credit to run simulation. Please Top Up." }, 402);
  }

  return streamSSE(c, async (stream) => {
    try {
      const result = await runSimulation(
        body,
        (step, label) => {
          stream.writeSSE({ event: "progress", data: JSON.stringify({ step, label }) }).catch(() => {});
        },
        (token) => {
          stream.writeSSE({ event: "thought", data: JSON.stringify({ token }) }).catch(() => {});
        }
      );

      // Deduct credit
      db.run("UPDATE users SET credits = credits - 1 WHERE wallet_address = ?", [body.walletAddress ?? ""]);

      await stream.writeSSE({ event: "result", data: JSON.stringify({ success: true, data: result }) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan simulasi";
      console.error("[simulation/run]", err);
      await stream.writeSSE({ event: "error", data: JSON.stringify({ error: "SIMULATION_FAILED", message }) });
    }
  });
});
