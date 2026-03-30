import { db } from "./database";
import type { City } from "../../../packages/shared/types";
import type { Persona } from "../data/personas";

// ─── City helpers ────────────────────────────────────────────────────────────

function rowToCity(row: Record<string, unknown>): City {
  return {
    id: row.id as string,
    name: row.name as string,
    province: row.province as string,
    tier: row.tier as City["tier"],
    population: row.population as number,
    economicProfile: row.economic_profile as string,
    avgMonthlyExpenditure: row.avg_monthly_expenditure as number,
    topIndustries: JSON.parse(row.top_industries as string),
  };
}

export function getAllCities(): City[] {
  return (db.query("SELECT * FROM cities ORDER BY name").all() as Record<string, unknown>[]).map(rowToCity);
}

export function getCityById(id: string): City | undefined {
  const row = db.query("SELECT * FROM cities WHERE id = $id").get({ $id: id }) as Record<string, unknown> | null;
  return row ? rowToCity(row) : undefined;
}

// ─── Persona helpers ─────────────────────────────────────────────────────────

function rowToPersona(row: Record<string, unknown>): Persona {
  return {
    id: row.id as string,
    cityId: row.city_id as string,
    name: row.name as string,
    age: row.age as number,
    ageGroup: row.age_group as Persona["ageGroup"],
    gender: row.gender as Persona["gender"],
    occupation: row.occupation as string,
    incomeLevel: row.income_level as Persona["incomeLevel"],
    monthlyIncome: row.monthly_income as number,
    monthlyDisposable: row.monthly_disposable as number,
    lifestyle: JSON.parse(row.lifestyle as string),
    location: row.location as string,
    shoppingBehavior: JSON.parse(row.shopping_behavior as string),
    psychographic: JSON.parse(row.psychographic as string),
    cityContext: JSON.parse(row.city_context as string),
  };
}

export function getPersonasByCity(cityId: string): Persona[] {
  return (db.query("SELECT * FROM personas WHERE city_id = $cityId").all({ $cityId: cityId }) as Record<string, unknown>[]).map(rowToPersona);
}

export function getAllPersonas(): Persona[] {
  return (db.query("SELECT * FROM personas ORDER BY city_id, id").all() as Record<string, unknown>[]).map(rowToPersona);
}

export function getPersonaById(id: string): Persona | undefined {
  const row = db.query("SELECT * FROM personas WHERE id = $id").get({ $id: id }) as Record<string, unknown> | null;
  return row ? rowToPersona(row) : undefined;
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

export function getSetting(key: string): string | undefined {
  const row = db.query("SELECT value FROM settings WHERE key = $key").get({ $key: key }) as { value: string } | null;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ($key, $value)").run({ $key: key, $value: value });
}

// ─── Simulation helpers ───────────────────────────────────────────────────────

export function saveSimulation(sim: {
  id: string;
  createdAt: string;
  cityId: string;
  productName: string;
  marketPenetration: number;
  requestJson: string;
  resultJson: string;
  walletAddress?: string;
}): void {
  db.prepare(`
    INSERT INTO simulations (id, created_at, city_id, product_name, market_penetration, request_json, result_json, wallet_address)
    VALUES ($id, $createdAt, $cityId, $productName, $marketPenetration, $requestJson, $resultJson, $walletAddress)
  `).run({
    $id: sim.id,
    $createdAt: sim.createdAt,
    $cityId: sim.cityId,
    $productName: sim.productName,
    $marketPenetration: sim.marketPenetration,
    $requestJson: sim.requestJson,
    $resultJson: sim.resultJson,
    $walletAddress: sim.walletAddress || null,
  });
}

export function getSimulations(limit = 50, offset = 0): {
  id: string; created_at: string; city_id: string; product_name: string; market_penetration: number; wallet_address: string | null;
}[] {
  return db.query(
    "SELECT id, created_at, city_id, product_name, market_penetration, wallet_address FROM simulations ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
  ).all({ $limit: limit, $offset: offset }) as ReturnType<typeof getSimulations>;
}

export function getSimulationsByWallet(walletAddress: string, limit = 50, offset = 0): {
  id: string; created_at: string; city_id: string; product_name: string; market_penetration: number; wallet_address: string;
}[] {
  return db.query(
    "SELECT id, created_at, city_id, product_name, market_penetration, wallet_address FROM simulations WHERE wallet_address = $walletAddress ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
  ).all({ $walletAddress: walletAddress, $limit: limit, $offset: offset }) as ReturnType<typeof getSimulationsByWallet>;
}

export function getSimulationById(id: string): { id: string; created_at: string; city_id: string; product_name: string; market_penetration: number; request_json: string; result_json: string } | undefined {
  return db.query("SELECT * FROM simulations WHERE id = $id").get({ $id: id }) as ReturnType<typeof getSimulationById>;
}

export function countSimulations(): number {
  return (db.query("SELECT COUNT(*) as count FROM simulations").get() as { count: number }).count;
}
