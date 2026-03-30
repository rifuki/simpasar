import { Database } from "bun:sqlite";
import { resolve } from "path";

const DB_PATH = resolve(import.meta.dir, "simpasar.db");

export const db = new Database(DB_PATH, { create: true });

db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT NOT NULL,
    tier TEXT NOT NULL,
    population INTEGER NOT NULL,
    economic_profile TEXT NOT NULL,
    avg_monthly_expenditure INTEGER NOT NULL,
    top_industries TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS personas (
    id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    age_group TEXT NOT NULL,
    gender TEXT NOT NULL,
    occupation TEXT NOT NULL,
    income_level TEXT NOT NULL,
    monthly_income INTEGER NOT NULL,
    monthly_disposable INTEGER NOT NULL,
    lifestyle TEXT NOT NULL,
    location TEXT NOT NULL,
    shopping_behavior TEXT NOT NULL,
    psychographic TEXT NOT NULL,
    city_context TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    city_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    market_penetration INTEGER NOT NULL,
    request_json TEXT NOT NULL,
    result_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);
