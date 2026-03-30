import { Hono } from "hono";
import { getSimulationsByWallet, getSimulationById } from "../db/queries";
import { db } from "../db/database";

export const history = new Hono();

// Get all simulations for a wallet address
history.get("/:walletAddress", async (c) => {
  const walletAddress = c.req.param("walletAddress");
  
  if (!walletAddress) {
    return c.json({ error: "BAD_REQUEST", message: "Wallet address is required" }, 400);
  }

  try {
    const simulations = getSimulationsByWallet(walletAddress);
    
    // Enrich with city names
    const enriched = simulations.map((sim) => {
      const city = db.query("SELECT name FROM cities WHERE id = ?").get(sim.city_id) as { name: string } | undefined;
      return {
        id: sim.id,
        createdAt: sim.created_at,
        cityId: sim.city_id,
        cityName: city?.name || sim.city_id,
        productName: sim.product_name,
        marketPenetration: sim.market_penetration,
      };
    });

    return c.json(enriched);
  } catch (err) {
    console.error("[history/get]", err);
    return c.json({ error: "INTERNAL_ERROR", message: "Gagal mengambil history" }, 500);
  }
});

// Get single simulation detail
history.get("/detail/:id", async (c) => {
  const id = c.req.param("id");
  
  try {
    const sim = getSimulationById(id);
    if (!sim) {
      return c.json({ error: "NOT_FOUND", message: "Simulasi tidak ditemukan" }, 404);
    }
    
    // Parse the JSON strings back to objects
    const result = JSON.parse(sim.result_json);
    return c.json(result);
  } catch (err) {
    console.error("[history/detail]", err);
    return c.json({ error: "INTERNAL_ERROR", message: "Gagal mengambil detail simulasi" }, 500);
  }
});
