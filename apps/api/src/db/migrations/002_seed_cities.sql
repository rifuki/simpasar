-- 002: Seed cities
-- Wedge: Jabodetabek suburban corridors (sesuai Pitch Deck)

INSERT OR IGNORE INTO cities (id, name, province, tier, population, economic_profile, avg_monthly_expenditure, top_industries)
VALUES
  ('gading-serpong', 'Gading Serpong', 'Banten', '2', 150000,
   'Modern suburban hub. Upper-mid to high income. Sangat padat dengan F&B lifestyle, kafe tematik, dan pusat kuliner. Konsumen sangat dipengaruhi tren media sosial dan nilai estetika.',
   6500000, '["F&B","Lifestyle","Property","Retail"]'),

  ('bsd', 'BSD City', 'Banten', '1', 450000,
   'Planned integrated city. High income, tech-hub (Digital Hub), dan keluarga muda mapan. Konsumen selektif, tech-savvy, dan memiliki daya beli tinggi untuk produk premium/sehat.',
   8000000, '["Teknologi","F&B","Pendidikan","Kesehatan"]'),

  ('bekasi-timur', 'Bekasi Timur', 'Jawa Barat', '1', 600000,
   'Commuter & industrial hub. Sangat padat penduduk, didominasi kelas menengah-bawah hingga menengah. Konsumen sangat value-oriented dan price-sensitive. F&B mass-market sangat kuat.',
   4500000, '["Logistik","Manufaktur","Retail","F&B"]'),

  ('depok', 'Depok (Margonda)', 'Jawa Barat', '2', 2000000,
   'Education & residential hub. Fokus di area Margonda yang didominasi mahasiswa (UI, Gunadarma) dan pekerja commuter. Market sangat dinamis, price-sensitive untuk harian, namun massif.',
   5000000, '["Pendidikan","F&B","Layanan Jasa","Retail"]');
