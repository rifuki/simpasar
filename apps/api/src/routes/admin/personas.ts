import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../../db/database";
import { getAllPersonas, getPersonasByCity, getPersonaById } from "../../db/queries";
import { adminAuth } from "../../middleware/adminAuth";

export const adminPersonas = new Hono();

adminPersonas.use("*", adminAuth);

const personaSchema = z.object({
  id: z.string().min(1),
  cityId: z.string().min(1),
  name: z.string().min(1),
  age: z.number().int().min(16).max(80),
  ageGroup: z.enum(["18-24", "25-30", "31-40", "41-55", "55+"]),
  gender: z.enum(["male", "female"]),
  occupation: z.string().min(1),
  incomeLevel: z.enum(["low", "lower-mid", "mid", "upper-mid", "high"]),
  monthlyIncome: z.number().int().positive(),
  monthlyDisposable: z.number().int().positive(),
  lifestyle: z.array(z.string()),
  location: z.string().min(1),
  shoppingBehavior: z.object({
    priceElasticity: z.enum(["very_sensitive", "sensitive", "moderate", "insensitive"]),
    decisionFactor: z.array(z.string()),
    preferredChannel: z.array(z.string()),
    weeklyFnBSpend: z.number().int().positive(),
  }),
  psychographic: z.object({
    values: z.array(z.string()),
    mediaConsumption: z.array(z.string()),
    peerInfluence: z.enum(["high", "medium", "low"]),
  }),
  cityContext: z.object({
    culturalNote: z.string(),
    competitorAwareness: z.array(z.string()),
  }),
});

// GET /api/admin/personas?cityId=malang
adminPersonas.get("/", (c) => {
  const cityId = c.req.query("cityId");
  const personas = cityId ? getPersonasByCity(cityId) : getAllPersonas();
  return c.json(personas);
});

// GET /api/admin/personas/:id
adminPersonas.get("/:id", (c) => {
  const persona = getPersonaById(c.req.param("id"));
  if (!persona) return c.json({ error: "NOT_FOUND", message: "Persona tidak ditemukan" }, 404);
  return c.json(persona);
});

// POST /api/admin/personas
adminPersonas.post("/", zValidator("json", personaSchema), (c) => {
  const p = c.req.valid("json");

  const existing = getPersonaById(p.id);
  if (existing) return c.json({ error: "CONFLICT", message: "Persona ID sudah ada" }, 409);

  db.prepare(`
    INSERT INTO personas (id, city_id, name, age, age_group, gender, occupation, income_level, monthly_income, monthly_disposable, lifestyle, location, shopping_behavior, psychographic, city_context)
    VALUES ($id, $cityId, $name, $age, $ageGroup, $gender, $occupation, $incomeLevel, $monthlyIncome, $monthlyDisposable, $lifestyle, $location, $shoppingBehavior, $psychographic, $cityContext)
  `).run({
    $id: p.id, $cityId: p.cityId, $name: p.name, $age: p.age, $ageGroup: p.ageGroup,
    $gender: p.gender, $occupation: p.occupation, $incomeLevel: p.incomeLevel,
    $monthlyIncome: p.monthlyIncome, $monthlyDisposable: p.monthlyDisposable,
    $lifestyle: JSON.stringify(p.lifestyle), $location: p.location,
    $shoppingBehavior: JSON.stringify(p.shoppingBehavior),
    $psychographic: JSON.stringify(p.psychographic),
    $cityContext: JSON.stringify(p.cityContext),
  });

  return c.json(getPersonaById(p.id), 201);
});

// PUT /api/admin/personas/:id
adminPersonas.put("/:id", zValidator("json", personaSchema.omit({ id: true })), (c) => {
  const id = c.req.param("id");
  const existing = getPersonaById(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Persona tidak ditemukan" }, 404);

  const p = c.req.valid("json");

  db.prepare(`
    UPDATE personas SET
      city_id=$cityId, name=$name, age=$age, age_group=$ageGroup, gender=$gender,
      occupation=$occupation, income_level=$incomeLevel, monthly_income=$monthlyIncome,
      monthly_disposable=$monthlyDisposable, lifestyle=$lifestyle, location=$location,
      shopping_behavior=$shoppingBehavior, psychographic=$psychographic, city_context=$cityContext
    WHERE id=$id
  `).run({
    $id: id, $cityId: p.cityId, $name: p.name, $age: p.age, $ageGroup: p.ageGroup,
    $gender: p.gender, $occupation: p.occupation, $incomeLevel: p.incomeLevel,
    $monthlyIncome: p.monthlyIncome, $monthlyDisposable: p.monthlyDisposable,
    $lifestyle: JSON.stringify(p.lifestyle), $location: p.location,
    $shoppingBehavior: JSON.stringify(p.shoppingBehavior),
    $psychographic: JSON.stringify(p.psychographic),
    $cityContext: JSON.stringify(p.cityContext),
  });

  return c.json(getPersonaById(id));
});

// DELETE /api/admin/personas/:id
adminPersonas.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = getPersonaById(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Persona tidak ditemukan" }, 404);

  db.prepare("DELETE FROM personas WHERE id = $id").run({ $id: id });
  return c.json({ success: true });
});
