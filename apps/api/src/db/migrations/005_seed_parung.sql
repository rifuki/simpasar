-- 005: Seed Parung
-- Permintaan User: Tambah Parung dengan 39 responden

INSERT OR IGNORE INTO cities (id, name, province, tier, population, economic_profile, avg_monthly_expenditure, top_industries)
VALUES
  ('parung', 'Parung', 'Jawa Barat', '3', 120000,
   'Kota kecamatan di Bogor dengan karakteristik semi-rural. Padat penduduk, didominasi pekerja commuter dan UMKM lokal. Konsumen sangat price-sensitive, preferensi produk lokal tinggi.',
   3500000, '["F&B","Pertanian","Retail","Jasa"]');

INSERT OR IGNORE INTO clusters (id, name, city_id, city, province, industry, industry_label, description, market_size, competition_level, avg_spending, demographics, key_insights, icon, color, active_personas, category)
VALUES
  ('fnb-parung', 'F&B Parung', 'parung', 'Parung', 'Jawa Barat',
   'fnb', 'Food & Beverage',
   'Pasar kuliner di kecamatan Parung, Bogor. Didominasi warung makan, UMKM lokal, dan pedagang kaki lima. Konsumen sangat price-sensitive dengan preferensi masakan rumahan.',
   'small', 'low', 15000,
   'Warga Lokal (60%), Pekerja Commuter (25%), Pelajar (15%)',
   '["Konsumen sangat loyal pada rasa rumahan","Harga optimal: 8-20rb untuk makanan","Pasar tradisional = channel utama","Preferensi masakan Sunda sangat tinggi"]',
   'Utensils', 'orange', 39, 'fnb_beverage');
