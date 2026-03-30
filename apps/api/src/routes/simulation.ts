import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { simulationRequestSchema } from "../schemas/simulationSchema";
import { runSimulation } from "../services/claudeService";

export const simulation = new Hono();

simulation.post("/run", zValidator("json", simulationRequestSchema), async (c) => {
  const body = c.req.valid("json");

  const skipPayment = process.env.SKIP_PAYMENT === "true";
  const isPaid = body.tier !== "free";

  if (isPaid && !skipPayment && !body.paymentTxSignature) {
    return c.json(
      { error: "PAYMENT_REQUIRED", message: "Simulasi berbayar membutuhkan payment signature" },
      402
    );
  }

  try {
    const result = await runSimulation(body);
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan simulasi";
    console.error("[simulation/run]", err);
    return c.json({ error: "SIMULATION_FAILED", message }, 500);
  }
});
