/**
 * Market Cluster Seed Data
 * Sesuai PasarSim Pitch Deck: Jabodetabek suburban corridors, F&B focus.
 * Data ini hanya digunakan untuk initial seed ke database.
 * Setelah di-seed, database menjadi single source of truth.
 */

import type { Cluster } from "../../../../packages/shared/types";

export const clustersSeed: Cluster[] = [
  {
    id: "fnb-gading-serpong",
    name: "F&B Gading Serpong",
    cityId: "gading-serpong",
    city: "Gading Serpong",
    province: "Banten",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description:
      "Suburban hub premium dengan konsumen upper-mid. Sangat padat kafe tematik, konsumen dipengaruhi tren media sosial dan estetika. Target utama: anak muda dan keluarga mapan.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 55000,
    demographics: "Mahasiswa UMN (30%), Karyawan (35%), Keluarga (35%)",
    keyInsights: [
      "Konsumen sangat mementingkan 'vibe' dan estetika tempat",
      "Peak hours: 10.00-14.00 & 17.00-21.00",
      "GoFood/GrabFood delivery demand tinggi",
      "Influencer & TikTok marketing sangat efektif",
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50,
    category: "fnb_beverage",
  },
  {
    id: "fnb-bsd",
    name: "F&B BSD City",
    cityId: "bsd",
    city: "BSD City",
    province: "Banten",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description:
      "Planned integrated city dengan Digital Hub. Konsumen tech-savvy, keluarga muda mapan, daya beli tinggi untuk produk premium dan healthy food.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 75000,
    demographics: "Tech Workers (40%), Keluarga Muda (35%), Eksekutif (25%)",
    keyInsights: [
      "Konsumen selektif, research sebelum beli",
      "Healthy & premium concept sangat diminati",
      "Weekend brunch culture sangat kuat",
      "Loyalty programs direspon positif",
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50,
    category: "fnb_beverage",
  },
  {
    id: "fnb-bekasi-timur",
    name: "F&B Bekasi Timur",
    cityId: "bekasi-timur",
    city: "Bekasi Timur",
    province: "Jawa Barat",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description:
      "Commuter & industrial hub. Didominasi kelas menengah, konsumen sangat value-oriented dan price-sensitive. F&B mass-market dan warteg premium sangat kuat.",
    marketSize: "large",
    competitionLevel: "medium",
    avgSpending: 25000,
    demographics: "Pekerja Commuter (50%), Warga Lokal (35%), Pelajar (15%)",
    keyInsights: [
      "Harga optimal: 10-30rb untuk makanan",
      "Porsi besar = nilai jual utama",
      "Jam makan siang commuter = peak hours",
      "Promo bundling sangat efektif",
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50,
    category: "fnb_beverage",
  },
  {
    id: "fnb-depok",
    name: "F&B Depok (Margonda)",
    cityId: "depok",
    city: "Depok",
    province: "Jawa Barat",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description:
      "Education & residential hub didominasi mahasiswa UI dan Gunadarma. Market sangat dinamis, price-sensitive untuk harian namun volume pembelian massif.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 25000,
    demographics: "Mahasiswa (65%), Karyawan (25%), Warga (10%)",
    keyInsights: [
      "Peak hours: 11.00-13.00 & 17.00-20.00",
      "Delivery demand tinggi via GoFood/GrabFood",
      "Social media marketing sangat efektif",
      "Harga optimal: 15-35rb untuk makanan",
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50,
    category: "fnb_beverage",
  },
];
