-- 001: Initial schema
-- Semua tabel inti PasarSim

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

CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  industry TEXT NOT NULL,
  industry_label TEXT NOT NULL,
  description TEXT NOT NULL,
  market_size TEXT NOT NULL,
  competition_level TEXT NOT NULL,
  avg_spending INTEGER NOT NULL,
  demographics TEXT NOT NULL,
  key_insights TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Utensils',
  color TEXT NOT NULL DEFAULT 'orange',
  active_personas INTEGER NOT NULL DEFAULT 50,
  category TEXT NOT NULL DEFAULT 'fnb_beverage'
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
  result_json TEXT NOT NULL,
  wallet_address TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  reference TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount_sol REAL NOT NULL,
  credits_requested INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
