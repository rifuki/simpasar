import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../../db/database";
import { adminAuth } from "../../middleware/adminAuth";
import type { Cluster } from "../../../../../packages/shared/types";

export const adminClusters = new Hono();

adminClusters.use("*", adminAuth);

const clusterSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9_-]+$/, "ID hanya boleh huruf kecil, angka, underscore, dash"),
  name: z.string().min(1),
  cityId: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  industry: z.enum(["fnb", "beauty", "fashion", "retail", "services"]),
  industryLabel: z.string().min(1),
  description: z.string().min(1),
  marketSize: z.enum(["large", "medium", "small"]),
  competitionLevel: z.enum(["high", "medium", "low"]),
  avgSpending: z.number().int().positive(),
  demographics: z.string().min(1),
  keyInsights: z.array(z.string()).min(1),
  icon: z.string().default("Utensils"),
  color: z.string().default("orange"),
  activePersonas: z.number().int().min(0).default(50),
  category: z.string().min(1),
});

function rowToCluster(row: any): Cluster {
  return {
    id: row.id,
    name: row.name,
    cityId: row.city_id,
    city: row.city,
    province: row.province,
    industry: row.industry,
    industryLabel: row.industry_label,
    description: row.description,
    marketSize: row.market_size,
    competitionLevel: row.competition_level,
    avgSpending: row.avg_spending,
    demographics: row.demographics,
    keyInsights: JSON.parse(row.key_insights),
    icon: row.icon,
    color: row.color,
    activePersonas: row.active_personas,
    category: row.category,
  };
}

// GET /api/admin/clusters
adminClusters.get("/", (c) => {
  const rows = db.query("SELECT * FROM clusters ORDER BY name").all();
  return c.json(rows.map(rowToCluster));
});

// GET /api/admin/clusters/:id
adminClusters.get("/:id", (c) => {
  const row = db.query("SELECT * FROM clusters WHERE id = ?").get(c.req.param("id"));
  if (!row) return c.json({ error: "NOT_FOUND", message: "Cluster tidak ditemukan" }, 404);
  return c.json(rowToCluster(row));
});

// POST /api/admin/clusters — Tambah cluster baru
adminClusters.post("/", zValidator("json", clusterSchema), (c) => {
  const cluster = c.req.valid("json");

  // Verify cityId exists
  const cityExists = db.query("SELECT id FROM cities WHERE id = ?").get(cluster.cityId);
  if (!cityExists) {
    return c.json({ error: "INVALID_CITY", message: `City '${cluster.cityId}' tidak ditemukan di database. Tambahkan kota dulu.` }, 400);
  }

  const existing = db.query("SELECT id FROM clusters WHERE id = ?").get(cluster.id);
  if (existing) return c.json({ error: "CONFLICT", message: "Cluster ID sudah ada" }, 409);

  db.prepare(`
    INSERT INTO clusters (id, name, city_id, city, province, industry, industry_label, description, market_size, competition_level, avg_spending, demographics, key_insights, icon, color, active_personas, category)
    VALUES ($id, $name, $cityId, $city, $province, $industry, $industryLabel, $description, $marketSize, $competitionLevel, $avgSpending, $demographics, $keyInsights, $icon, $color, $activePersonas, $category)
  `).run({
    $id: cluster.id,
    $name: cluster.name,
    $cityId: cluster.cityId,
    $city: cluster.city,
    $province: cluster.province,
    $industry: cluster.industry,
    $industryLabel: cluster.industryLabel,
    $description: cluster.description,
    $marketSize: cluster.marketSize,
    $competitionLevel: cluster.competitionLevel,
    $avgSpending: cluster.avgSpending,
    $demographics: cluster.demographics,
    $keyInsights: JSON.stringify(cluster.keyInsights),
    $icon: cluster.icon,
    $color: cluster.color,
    $activePersonas: cluster.activePersonas,
    $category: cluster.category,
  });

  const inserted = db.query("SELECT * FROM clusters WHERE id = ?").get(cluster.id);
  return c.json(rowToCluster(inserted), 201);
});

// PUT /api/admin/clusters/:id — Update cluster
adminClusters.put("/:id", zValidator("json", clusterSchema.omit({ id: true })), (c) => {
  const id = c.req.param("id");
  const existing = db.query("SELECT id FROM clusters WHERE id = ?").get(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Cluster tidak ditemukan" }, 404);

  const cluster = c.req.valid("json");

  db.prepare(`
    UPDATE clusters SET
      name=$name, city_id=$cityId, city=$city, province=$province,
      industry=$industry, industry_label=$industryLabel, description=$description,
      market_size=$marketSize, competition_level=$competitionLevel, avg_spending=$avgSpending,
      demographics=$demographics, key_insights=$keyInsights, icon=$icon, color=$color,
      active_personas=$activePersonas, category=$category
    WHERE id=$id
  `).run({
    $id: id,
    $name: cluster.name,
    $cityId: cluster.cityId,
    $city: cluster.city,
    $province: cluster.province,
    $industry: cluster.industry,
    $industryLabel: cluster.industryLabel,
    $description: cluster.description,
    $marketSize: cluster.marketSize,
    $competitionLevel: cluster.competitionLevel,
    $avgSpending: cluster.avgSpending,
    $demographics: cluster.demographics,
    $keyInsights: JSON.stringify(cluster.keyInsights),
    $icon: cluster.icon,
    $color: cluster.color,
    $activePersonas: cluster.activePersonas,
    $category: cluster.category,
  });

  const updated = db.query("SELECT * FROM clusters WHERE id = ?").get(id);
  return c.json(rowToCluster(updated));
});

// DELETE /api/admin/clusters/:id
adminClusters.delete("/:id", (c) => {
  const id = c.req.param("id");
  const existing = db.query("SELECT id FROM clusters WHERE id = ?").get(id);
  if (!existing) return c.json({ error: "NOT_FOUND", message: "Cluster tidak ditemukan" }, 404);

  db.prepare("DELETE FROM clusters WHERE id = ?").run(id);
  return c.json({ success: true });
});
