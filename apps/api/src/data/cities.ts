import type { City } from "../../../../packages/shared/types";

export const cities: City[] = [
  {
    id: "gading-serpong",
    name: "Gading Serpong",
    province: "Banten",
    tier: "2",
    population: 150000,
    economicProfile:
      "Modern suburban hub. Upper-mid to high income. Sangat padat dengan F&B lifestyle, kafe tematik, dan pusat kuliner. Konsumen sangat dipengaruhi tren media sosial dan nilai estetika.",
    avgMonthlyExpenditure: 6500000,
    topIndustries: ["F&B", "Lifestyle", "Property", "Retail"],
  },
  {
    id: "bsd",
    name: "BSD City",
    province: "Banten",
    tier: "1",
    population: 450000,
    economicProfile:
      "Planned integrated city. High income, tech-hub (Digital Hub), dan keluarga muda mapan. Konsumen selektif, tech-savvy, dan memiliki daya beli tinggi untuk produk premium/sehat.",
    avgMonthlyExpenditure: 8000000,
    topIndustries: ["Teknologi", "F&B", "Pendidikan", "Kesehatan"],
  },
  {
    id: "bekasi-timur",
    name: "Bekasi Timur",
    province: "Jawa Barat",
    tier: "1",
    population: 600000,
    economicProfile:
      "Commuter & industrial hub. Sangat padat penduduk, didominasi kelas menengah-bawah hingga menengah. Konsumen sangat value-oriented dan price-sensitive. F&B mass-market sangat kuat.",
    avgMonthlyExpenditure: 4500000,
    topIndustries: ["Logistik", "Manufaktur", "Retail", "F&B"],
  },
  {
    id: "depok",
    name: "Depok (Margonda)",
    province: "Jawa Barat",
    tier: "2",
    population: 2000000,
    economicProfile:
      "Education & residential hub. Fokus di area Margonda yang didominasi mahasiswa (UI, Gunadarma) dan pekerja commuter. Market sangat dinamis, price-sensitive untuk harian, namun massif.",
    avgMonthlyExpenditure: 5000000,
    topIndustries: ["Pendidikan", "F&B", "Layanan Jasa", "Retail"],
  },
];

export function getCityById(id: string): City | undefined {
  return cities.find((c) => c.id === id);
}
