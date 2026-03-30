/**
 * Market Cluster Data
 * Clusters represent specific market segments defined by industry + city combination
 */

export interface Cluster {
  id: string;
  name: string;
  city: string;
  province: string;
  industry: "fnb" | "beauty" | "fashion" | "retail" | "services";
  industryLabel: string;
  description: string;
  marketSize: "large" | "medium" | "small";
  competitionLevel: "high" | "medium" | "low";
  avgSpending: number;
  demographics: string;
  keyInsights: string[];
  icon: string;
  color: string;
  activePersonas: number;
}

export const clusters: Cluster[] = [
  // F&B - Depok
  {
    id: "fnb-depok",
    name: "F&B Depok",
    city: "Depok",
    province: "Jawa Barat",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description: "Pasar kuliner mahasiswa terbesar di Jabodetabek. Didominasi oleh kampus UI dan gunadarma dengan daya beli price-sensitive.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 25000,
    demographics: "Mahasiswa (65%), Karyawan (25%), Warga (10%)",
    keyInsights: [
      "Peak hours: 11.00-13.00 & 17.00-20.00",
      "Delivery demand tinggi via GoFood/GrabFood",
      "Social media marketing sangat efektif",
      "Harga optimal: 15-35rb untuk makanan"
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50
  },
  // F&B - Yogyakarta
  {
    id: "fnb-yogyakarta",
    name: "F&B Yogyakarta",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description: "Kota wisata dengan mix konsumen lokal dan wisatawan. Kafe & kuliner tradisional sangat diminati dengan harga kompetitif.",
    marketSize: "medium",
    competitionLevel: "high",
    avgSpending: 35000,
    demographics: "Wisatawan (40%), Mahasiswa (35%), Lokal (25%)",
    keyInsights: [
      "Instagrammable places perform 3x better",
      "Wisatawan willing to pay premium",
      "Local ingredients marketing efektif",
      "Malioboro area: foot traffic tertinggi"
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50
  },
  // F&B - Solo
  {
    id: "fnb-solo",
    name: "F&B Solo",
    city: "Surakarta (Solo)",
    province: "Jawa Tengah",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description: "Kota budaya dengan selera kuliner tradisional yang kuat. Warga lokal loyal pada brand lokal dengan value-for-money.",
    marketSize: "medium",
    competitionLevel: "medium",
    avgSpending: 28000,
    demographics: "Warga Lokal (70%), Pelajar (20%), Wisatawan (10%)",
    keyInsights: [
      "Heritage/traditional concept works best",
      "Local community engagement penting",
      "Price-conscious but loyal customers",
      "Pasar tradisional: channel penting"
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50
  },
  // F&B - Bandung
  {
    id: "fnb-bandung",
    name: "F&B Bandung",
    city: "Bandung",
    province: "Jawa Barat",
    industry: "fnb",
    industryLabel: "Food & Beverage",
    description: "Kota kreatif dengan konsumen trend-conscious. Kafe aesthetic dan konsep baru selalu dicari, willing to pay premium.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 45000,
    demographics: "Karyawan (40%), Mahasiswa (30%), Wisatawan (30%)",
    keyInsights: [
      "Aesthetic & experience > price",
      "Weekend crowd 2-3x weekdays",
      "Influencer marketing ROI tinggi",
      "Dago & Setiabudi: premium areas"
    ],
    icon: "Utensils",
    color: "orange",
    activePersonas: 50
  },
  // Beauty - Solo
  {
    id: "beauty-solo",
    name: "Kecantikan Solo",
    city: "Surakarta (Solo)",
    province: "Jawa Tengah",
    industry: "beauty",
    industryLabel: "Beauty & Personal Care",
    description: "Pasar skincare dan kosmetik dengan pertumbuhan pesat. Konsumen tertarik brand lokal halal dengan harga terjangkau.",
    marketSize: "medium",
    competitionLevel: "medium",
    avgSpending: 150000,
    demographics: "Wanita 18-35 (75%), Mahasiswa (40%), Karyawan (35%)",
    keyInsights: [
      "Halal certification is a must",
      "Shopee/Tokopedia dominate sales",
      "Local ingredients = trust factor",
      "Influencer UMKM lokal efektif"
    ],
    icon: "Sparkles",
    color: "pink",
    activePersonas: 50
  },
  // Beauty - Depok
  {
    id: "beauty-depok",
    name: "Kecantikan Depok",
    city: "Depok",
    province: "Jawa Barat",
    industry: "beauty",
    industryLabel: "Beauty & Personal Care",
    description: "Pasar beauty mahasiswa dengan fokus affordable skincare. Online-first dengan komunitas yang aktif di media sosial.",
    marketSize: "medium",
    competitionLevel: "high",
    avgSpending: 85000,
    demographics: "Mahasiswa (60%), Karyawan Muda (30%), Remaja (10%)",
    keyInsights: [
      "Price range 50-150rb sweet spot",
      "TikTok Shop emerging channel",
      "Korean beauty influence kuat",
      "Bundle deals perform 2x better"
    ],
    icon: "Sparkles",
    color: "pink",
    activePersonas: 50
  },
  // Beauty - Surabaya
  {
    id: "beauty-surabaya",
    name: "Kecantikan Surabaya",
    city: "Surabaya",
    province: "Jawa Timur",
    industry: "beauty",
    industryLabel: "Beauty & Personal Care",
    description: "Pasar beauty profesional dengan daya beli tinggi. Konsumen mencari quality products dengan service excellent.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 280000,
    demographics: "Karyawan (50%), Entrepreneur (25%), Ibu Rumah Tangga (25%)",
    keyInsights: [
      "Premium brands accepted well",
      "Beauty clinics partnerships valued",
      "Loyalty programs essential",
      "Online-offline hybrid preferred"
    ],
    icon: "Sparkles",
    color: "pink",
    activePersonas: 50
  },
  // Fashion - Bandung
  {
    id: "fashion-bandung",
    name: "Fashion Bandung",
    city: "Bandung",
    province: "Jawa Barat",
    industry: "fashion",
    industryLabel: "Fashion & Apparel",
    description: "Kota fashion terkemuka dengan konsumen trend-conscious. Distro culture dan brand lokal sangat diminati.",
    marketSize: "large",
    competitionLevel: "high",
    avgSpending: 180000,
    demographics: "Gen Z & Millennial (80%), Karyawan (45%), Pelajar (35%)",
    keyInsights: [
      "Local brand loyalty tinggi",
      "Streetwear & casual dominate",
      "Pop-up stores very effective",
      "Instagram marketing ROI tinggi"
    ],
    icon: "Shirt",
    color: "violet",
    activePersonas: 50
  },
  // Fashion - Yogyakarta
  {
    id: "fashion-yogyakarta",
    name: "Fashion Yogyakarta",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    industry: "fashion",
    industryLabel: "Fashion & Apparel",
    description: "Pasar fashion dengan preferensi batik dan budaya. Mix antara modern dan tradisional dengan harga affordable.",
    marketSize: "medium",
    competitionLevel: "medium",
    avgSpending: 120000,
    demographics: "Wisatawan (45%), Mahasiswa (35%), Warga (20%)",
    keyInsights: [
      "Batik & ethnic fusion trending",
      "Souvenir fashion opportunity",
      "Local artisan collaboration valued",
      "Weekend markets: prime spots"
    ],
    icon: "Shirt",
    color: "violet",
    activePersonas: 50
  },
  // Retail - Malang
  {
    id: "retail-malang",
    name: "Retail Malang",
    city: "Malang",
    province: "Jawa Timur",
    industry: "retail",
    industryLabel: "Retail & Lifestyle",
    description: "Pasar retail dengan karakteristik kota pelajar. Produk lifestyle dan gadget diminati dengan harga kompetitif.",
    marketSize: "medium",
    competitionLevel: "high",
    avgSpending: 95000,
    demographics: "Mahasiswa (55%), Karyawan Muda (30%), Warga (15%)",
    keyInsights: [
      "Gadget accessories high demand",
      "Dorm essentials seasonal peak",
      "Pre-order model works well",
      "Campus ambassadors effective"
    ],
    icon: "Store",
    color: "emerald",
    activePersonas: 50
  },
  // Services - Surabaya
  {
    id: "services-surabaya",
    name: "Jasa Surabaya",
    city: "Surabaya",
    province: "Jawa Timur",
    industry: "services",
    industryLabel: "Professional Services",
    description: "Pasar jasa profesional dengan B2B opportunities. Konsumen mencari reliability dan professionalism.",
    marketSize: "large",
    competitionLevel: "medium",
    avgSpending: 500000,
    demographics: "Business Owner (40%), Corporate (35%), Professional (25%)",
    keyInsights: [
      "B2B contracts high value",
      "Reputation & portfolio critical",
      "LinkedIn marketing effective",
      "Referral system essential"
    ],
    icon: "Briefcase",
    color: "blue",
    activePersonas: 50
  },
  // Services - Semarang
  {
    id: "services-semarang",
    name: "Jasa Semarang",
    city: "Semarang",
    province: "Jawa Tengah",
    industry: "services",
    industryLabel: "Professional Services",
    description: "Pasar jasa dengan pertumbuhan startup ecosystem. Konsumen value-oriented mencari cost-effective solutions.",
    marketSize: "medium",
    competitionLevel: "low",
    avgSpending: 350000,
    demographics: "UMKM Owner (50%), Startup (25%), Corporate (25%)",
    keyInsights: [
      "Startup ecosystem growing fast",
      "Digital service demand rising",
      "Price still main differentiator",
      "Local networking events effective"
    ],
    icon: "Briefcase",
    color: "blue",
    activePersonas: 50
  }
];

export function getClusterById(id: string): Cluster | undefined {
  return clusters.find((c) => c.id === id);
}

export function getClustersByIndustry(industry: Cluster["industry"]): Cluster[] {
  return clusters.filter((c) => c.industry === industry);
}

export function getClustersByCity(city: string): Cluster[] {
  return clusters.filter((c) => c.city.toLowerCase().includes(city.toLowerCase()));
}
