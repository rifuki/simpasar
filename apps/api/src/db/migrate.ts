/**
 * Migration Runner
 * Membaca dan menjalankan file .sql dari folder migrations/ secara berurutan.
 * Melacak migrasi yang sudah dijalankan di tabel _migrations.
 */
import { Database } from "bun:sqlite";
import { resolve, basename } from "path";
import { readdirSync, readFileSync } from "fs";

const DB_PATH = resolve(import.meta.dir, "pasarsim.db");
const MIGRATIONS_DIR = resolve(import.meta.dir, "migrations");

export function runMigrations(database?: Database) {
  const db = database ?? new Database(DB_PATH, { create: true });

  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Create migration tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Get already-applied migrations
  const applied = new Set(
    (db.query("SELECT name FROM _migrations").all() as { name: string }[]).map(
      (r) => r.name
    )
  );

  // Read migration files, sorted by name
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf-8");
    console.log(`[migrate] Running: ${file}`);

    try {
      db.exec(sql);
      db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
      count++;
    } catch (err: any) {
      console.error(`[migrate] FAILED on ${file}: ${err.message}`);
      throw err;
    }
  }

  if (count === 0) {
    console.log("[migrate] No new migrations to apply.");
  } else {
    console.log(`[migrate] Applied ${count} migration(s).`);
  }

  return db;
}

// Auto-run if executed directly: bun run src/db/migrate.ts
if (import.meta.main) {
  runMigrations();
}
