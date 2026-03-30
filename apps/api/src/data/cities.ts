import type { City } from "../../../packages/shared/types";

export const cities: City[] = [
  {
    id: "malang",
    name: "Malang",
    province: "Jawa Timur",
    tier: "2",
    population: 843810,
    economicProfile:
      "Kota pelajar dengan 5+ universitas besar. Didominasi mahasiswa dan keluarga muda. Sangat price-sensitive namun terbuka terhadap tren F&B baru. Kompetisi minuman kopi/boba sangat tinggi. UMR sekitar 3.2 juta/bulan.",
    avgMonthlyExpenditure: 2800000,
    topIndustries: ["pendidikan", "F&B", "pariwisata", "retail"],
  },
  {
    id: "bandung",
    name: "Bandung",
    province: "Jawa Barat",
    tier: "1",
    population: 2510160,
    economicProfile:
      "Kota kreatif dan lifestyle. Konsumen Bandung sangat trend-conscious, melek media sosial, dan willing to pay premium untuk experience unik. F&B, fashion, dan beauty adalah kategori utama. UMR sekitar 3.5 juta/bulan.",
    avgMonthlyExpenditure: 3500000,
    topIndustries: ["fashion", "F&B", "kreatif", "teknologi"],
  },
  {
    id: "surabaya",
    name: "Surabaya",
    province: "Jawa Timur",
    tier: "1",
    population: 2874699,
    economicProfile:
      "Kota bisnis terbesar kedua di Indonesia. Konsumen pragmatis dan business-minded. Daya beli lebih tinggi dari rata-rata kota tier 2. Keputusan pembelian lebih rasional (value-for-money). UMR sekitar 4.5 juta/bulan.",
    avgMonthlyExpenditure: 4200000,
    topIndustries: ["perdagangan", "industri", "logistik", "F&B"],
  },
  {
    id: "yogyakarta",
    name: "Yogyakarta",
    province: "DI Yogyakarta",
    tier: "2",
    population: 422732,
    economicProfile:
      "Kota budaya dan wisata. Mix antara mahasiswa, warga lokal budaya-conscious, dan wisatawan. Harga sangat sensitif untuk warga lokal, tapi wisatawan lebih fleksibel. Kompetisi kuliner sangat ketat. UMR sekitar 2.1 juta/bulan.",
    avgMonthlyExpenditure: 2500000,
    topIndustries: ["pariwisata", "pendidikan", "kuliner", "kerajinan"],
  },
  {
    id: "semarang",
    name: "Semarang",
    province: "Jawa Tengah",
    tier: "1",
    population: 1653524,
    economicProfile:
      "Kota industri dan perdagangan. Konsumen lebih konservatif dan value-oriented dibanding Bandung/Surabaya. Tidak terlalu trend-driven, tapi daya beli solid. Kompetisi F&B masih lebih rendah dibanding kota besar lain. UMR sekitar 3.2 juta/bulan.",
    avgMonthlyExpenditure: 3100000,
    topIndustries: ["industri", "perdagangan", "logistik", "F&B"],
  },
];

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}
