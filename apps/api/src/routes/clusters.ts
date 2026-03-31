import { Hono } from "hono";
import { db } from "../db/database";
import type { Cluster } from "../../../../packages/shared/types";

const clusterRoutes = new Hono();

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

// GET /api/clusters - Get all clusters
clusterRoutes.get("/", (c) => {
  const rows = db.query("SELECT * FROM clusters ORDER BY name").all();
  const clusters = rows.map(rowToCluster);
  return c.json({
    success: true,
    data: clusters,
  });
});

// GET /api/clusters/:id - Get cluster by ID
clusterRoutes.get("/:id", (c) => {
  const id = c.req.param("id");
  const row = db.query("SELECT * FROM clusters WHERE id = ?").get(id);

  if (!row) {
    return c.json(
      { success: false, error: "Cluster not found" },
      404
    );
  }

  return c.json({
    success: true,
    data: rowToCluster(row),
  });
});

// GET /api/clusters/industry/:industry - Get clusters by industry
clusterRoutes.get("/industry/:industry", (c) => {
  const industry = c.req.param("industry");
  const rows = db
    .query("SELECT * FROM clusters WHERE industry = ? ORDER BY name")
    .all(industry);
  const clusters = rows.map(rowToCluster);

  return c.json({
    success: true,
    data: clusters,
  });
});

export default clusterRoutes;
