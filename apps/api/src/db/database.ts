import { Database } from "bun:sqlite";
import { resolve } from "path";
import { runMigrations } from "./migrate";

const DB_PATH = resolve(import.meta.dir, "pasarsim.db");

export const db = new Database(DB_PATH, { create: true });

// Run all pending migrations on startup
runMigrations(db);
