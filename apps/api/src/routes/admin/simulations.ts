import { Hono } from "hono";
import { getSimulations, getSimulationById, countSimulations } from "../../db/queries";
import { adminAuth } from "../../middleware/adminAuth";

export const adminSimulations = new Hono();

adminSimulations.use("*", adminAuth);

// GET /api/admin/simulations?limit=50&offset=0&cityId=malang
adminSimulations.get("/", (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
  const offset = Number(c.req.query("offset") ?? 0);
  const cityId = c.req.query("cityId");

  const rows = getSimulations(limit, offset);
  const filtered = cityId ? rows.filter((r) => r.city_id === cityId) : rows;
  const total = countSimulations();

  return c.json({ total, limit, offset, data: filtered });
});

// GET /api/admin/simulations/:id
adminSimulations.get("/:id", (c) => {
  const sim = getSimulationById(c.req.param("id"));
  if (!sim) return c.json({ error: "NOT_FOUND", message: "Simulasi tidak ditemukan" }, 404);

  return c.json({
    id: sim.id,
    createdAt: sim.created_at,
    cityId: sim.city_id,
    productName: sim.product_name,
    marketPenetration: sim.market_penetration,
    request: JSON.parse(sim.request_json),
    result: JSON.parse(sim.result_json),
  });
});
