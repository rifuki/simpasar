import { Hono } from "hono";
import { getAllCities, getCityById, getPersonasByCity } from "../db/queries";

export const citiesRoute = new Hono();

citiesRoute.get("/", (c) => {
  return c.json(getAllCities());
});

citiesRoute.get("/:cityId/personas", (c) => {
  const cityId = c.req.param("cityId");
  const city = getCityById(cityId);
  if (!city) return c.json({ error: "NOT_FOUND", message: "Kota tidak ditemukan" }, 404);

  const personas = getPersonasByCity(cityId);
  return c.json({ city, personas });
});
