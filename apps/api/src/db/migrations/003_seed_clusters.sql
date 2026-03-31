-- 003: Seed clusters
-- F&B clusters untuk 4 kota Jabodetabek (sesuai Pitch Deck)

INSERT OR IGNORE INTO clusters (id, name, city_id, city, province, industry, industry_label, description, market_size, competition_level, avg_spending, demographics, key_insights, icon, color, active_personas, category)
VALUES
  ('fnb-gading-serpong', 'F&B Gading Serpong', 'gading-serpong', 'Gading Serpong', 'Banten',
   'fnb', 'Food & Beverage',
   'Suburban hub premium dengan konsumen upper-mid. Sangat padat kafe tematik, konsumen dipengaruhi tren media sosial dan estetika. Target utama: anak muda dan keluarga mapan.',
   'large', 'high', 55000,
   'Mahasiswa UMN (30%), Karyawan (35%), Keluarga (35%)',
   '["Konsumen sangat mementingkan vibe dan estetika tempat","Peak hours: 10.00-14.00 & 17.00-21.00","GoFood/GrabFood delivery demand tinggi","Influencer & TikTok marketing sangat efektif"]',
   'Utensils', 'orange', 50, 'fnb_beverage'),

  ('fnb-bsd', 'F&B BSD City', 'bsd', 'BSD City', 'Banten',
   'fnb', 'Food & Beverage',
   'Planned integrated city dengan Digital Hub. Konsumen tech-savvy, keluarga muda mapan, daya beli tinggi untuk produk premium dan healthy food.',
   'large', 'high', 75000,
   'Tech Workers (40%), Keluarga Muda (35%), Eksekutif (25%)',
   '["Konsumen selektif, research sebelum beli","Healthy & premium concept sangat diminati","Weekend brunch culture sangat kuat","Loyalty programs direspon positif"]',
   'Utensils', 'orange', 50, 'fnb_beverage'),

  ('fnb-bekasi-timur', 'F&B Bekasi Timur', 'bekasi-timur', 'Bekasi Timur', 'Jawa Barat',
   'fnb', 'Food & Beverage',
   'Commuter & industrial hub. Didominasi kelas menengah, konsumen sangat value-oriented dan price-sensitive. F&B mass-market dan warteg premium sangat kuat.',
   'large', 'medium', 25000,
   'Pekerja Commuter (50%), Warga Lokal (35%), Pelajar (15%)',
   '["Harga optimal: 10-30rb untuk makanan","Porsi besar = nilai jual utama","Jam makan siang commuter = peak hours","Promo bundling sangat efektif"]',
   'Utensils', 'orange', 50, 'fnb_beverage'),

  ('fnb-depok', 'F&B Depok (Margonda)', 'depok', 'Depok', 'Jawa Barat',
   'fnb', 'Food & Beverage',
   'Education & residential hub didominasi mahasiswa UI dan Gunadarma. Market sangat dinamis, price-sensitive untuk harian namun volume pembelian massif.',
   'large', 'high', 25000,
   'Mahasiswa (65%), Karyawan (25%), Warga (10%)',
   '["Peak hours: 11.00-13.00 & 17.00-20.00","Delivery demand tinggi via GoFood/GrabFood","Social media marketing sangat efektif","Harga optimal: 15-35rb untuk makanan"]',
   'Utensils', 'orange', 50, 'fnb_beverage');
