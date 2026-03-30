import { Hono } from "hono";
import { db } from "../../db/database";
import { adminAuth } from "../../middleware/adminAuth";

export const adminStats = new Hono();

adminStats.use("*", adminAuth);

adminStats.get("/", async (c) => {
  try {
    const totalPersonas = db.query("SELECT COUNT(*) as count FROM personas").get() as { count: number };
    const totalCities = db.query("SELECT COUNT(*) as count FROM cities").get() as { count: number };
    const totalSimulations = db.query("SELECT COUNT(*) as count FROM simulations").get() as { count: number };
    
    // Get today's start and end in ISO format (approximate to local time zero)
    // Simulations save created_at as ISO string like '2023-10-10T12:00:00.000Z'
    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const todaySimulations = db.query("SELECT COUNT(*) as count FROM simulations WHERE created_at LIKE ?").get(`${todayStr}%`) as { count: number };

    return c.json({
      totalPersonas: totalPersonas.count,
      totalCities: totalCities.count,
      totalSimulations: totalSimulations.count,
      todaySimulations: todaySimulations.count,
    });
  } catch (err: any) {
    return c.json({ error: "INTERNAL_ERROR", message: err.message }, 500);
  }
});
