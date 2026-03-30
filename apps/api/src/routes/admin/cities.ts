import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../../db/database";
import { getAllCities, getCityById } from "../../db/queries";
import { adminAuth } from "../../middleware/adminAuth";

export const adminCities = new Hono();

adminCities.use("*", adminAuth);

const citySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9_-]+$/, "ID hanya boleh huruf kecil, angka, underscore, dash"),
  name: z.string().min(1),
  province: z.string().min(1),
  tier: z.enum(["1", "2", "3"]),
  population: z.number().int().positive(),
  economicProfile: z.string().min(1),
  avgMonthlyExpenditure: z.number().int().positive(),
  topIndustries: z.array(z.string()).min(1),
});

// GET /api/admin/cities
adminCities.get("/", (c) => {
  const cities = getAllCities();
  const personaCounts = db.query(
    "SELECT city_id, COUNT(*) as count FROM personas GROUP BY city_id"
  ).all() as { city_id: string; count: number }[];
  const countMap = Object.fromEntries(personaCounts.map((r) => [r.city_id, r.count]));

  return c.json(cities.map((city) => ({ ...city, personaCount: countMap[city.id] ?? 0 })));
});

// GET /api/admin/cities/:id
adminCities.get("/:id", (c) => {
  const city = getCityById(c.req.param("id"));
  if (!city) return c.json({ error: "NOT_FOUND", message: "Kota tidak ditemukan" }, 404);
  return c.json(city);
});

// POST /api/admin/cities
adminCities.post("/", zValidator("json", citySchema), (c) => {
  const city = c.req.valid("json");

  const existing = getCityById(city.id);
  if (existing) return c.json({ error: "CONFLICT", message: "City ID sudah ada" }, 409);

  db.prepare(`
    INSERT INTO cities (id, name, province, tier, population, economic_profile, avg_monthly_expenditure, top_industries)
    VALUES ($id, $name, $province, $tier, $population, $economicProfile, $avgMonthlyExpenditure, $topIndustries)
  `).run({
    $id: city.id, $name: city.name, $province: city.province, $tier: city.tier,
    $population: city.population, $economicProfile: city.economicProfile,
    $avgMonthlyExpenditure: city.avgMonthlyExpenditure,
    $topIndustries: JSON.stringify(city.topIndustries),
  });

  return c.json(getCityById(city.id), 201);
});

// PUT /api/admin/cities/:id
adminCities.put("/:id", zValidator("json", citySchema.omit({ id: true })), (c) => {
  const id = c.req.param("id");
  const existing = getCityById(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Kota tidak ditemukan" }, 404);

  const city = c.req.valid("json");

  db.prepare(`
    UPDATE cities SET
      name=$name, province=$province, tier=$tier, population=$population,
      economic_profile=$economicProfile, avg_monthly_expenditure=$avgMonthlyExpenditure,
      top_industries=$topIndustries
    WHERE id=$id
  `).run({
    $id: id, $name: city.name, $province: city.province, $tier: city.tier,
    $population: city.population, $economicProfile: city.economicProfile,
    $avgMonthlyExpenditure: city.avgMonthlyExpenditure,
    $topIndustries: JSON.stringify(city.topIndustries),
  });

  return c.json(getCityById(id));
});

// DELETE /api/admin/cities/:id — blocked jika masih ada personas
adminCities.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = getCityById(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Kota tidak ditemukan" }, 404);

  const personaCount = (
    db.query("SELECT COUNT(*) as count FROM personas WHERE city_id = $id").get({ $id: id }) as { count: number }
  ).count;

  if (personaCount > 0) {
    return c.json(
      { error: "CONSTRAINT", message: `Hapus ${personaCount} persona di kota ini dulu sebelum hapus kotanya` },
      409
    );
  }

  db.prepare("DELETE FROM cities WHERE id = $id").run({ $id: id });
  return c.json({ success: true });
});
