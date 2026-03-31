-- 007: Chat messages persistence
-- Menyimpan riwayat konsultasi AI per simulasi (berlaku 24 jam)

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  simulation_id TEXT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_simulation_id ON chat_messages(simulation_id);
