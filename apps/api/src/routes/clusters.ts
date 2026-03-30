import { Hono } from "hono";
import { clusters, getClusterById } from "../data/clusters";

const clusterRoutes = new Hono();

// GET /api/clusters - Get all clusters
clusterRoutes.get("/", (c) => {
  return c.json({
    success: true,
    data: clusters,
  });
});

// GET /api/clusters/:id - Get cluster by ID
clusterRoutes.get("/:id", (c) => {
  const id = c.req.param("id");
  const cluster = getClusterById(id);
  
  if (!cluster) {
    return c.json(
      { success: false, error: "Cluster not found" },
      404
    );
  }
  
  return c.json({
    success: true,
    data: cluster,
  });
});

// GET /api/clusters/industry/:industry - Get clusters by industry
clusterRoutes.get("/industry/:industry", (c) => {
  const industry = c.req.param("industry") as any;
  const filtered = clusters.filter((c) => c.industry === industry);
  
  return c.json({
    success: true,
    data: filtered,
  });
});

export default clusterRoutes;
