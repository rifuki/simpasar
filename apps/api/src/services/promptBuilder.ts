import type { SimulationRequest, City, Persona } from "../../../../packages/shared/types";

export const SYSTEM_PROMPT = `You are a market research AI specializing in Indonesian consumer behavior.
You analyze products based on real consumer persona profiles from specific Indonesian cities.

Your task: Given a product description and a list of consumer personas, simulate each persona's purchasing decision and provide structured market insights.

RULES:
1. Respond ONLY with valid JSON matching the exact schema provided. No markdown, no explanation, no code blocks.
2. Base decisions on each persona's income, lifestyle, price sensitivity, and cultural context.
3. Be realistic and critical — not every persona will buy. A 100% buy rate is suspicious.
4. Use Indonesian market context: local competition, pricing norms, consumer psychology.
5. Confidence scores should reflect realistic uncertainty, not wishful thinking.
6. All monetary values in IDR (Indonesian Rupiah, integer only).
7. All text fields (reasoning, mainReason, overallRecommendation) must be in Bahasa Indonesia.
8. Do NOT add any text, markdown, or explanation outside the JSON.`;

export function buildUserPrompt(
  request: SimulationRequest,
  city: City,
  personas: Persona[]
): string {
  const categoryLabel: Record<string, string> = {
    fnb_beverage: "F&B - Minuman",
    fnb_food: "F&B - Makanan",
    fashion: "Fashion",
    beauty: "Kecantikan / Beauty",
    electronics: "Elektronik",
    services: "Jasa / Services",
    other: "Lainnya",
  };

  const personasText = personas
    .map(
      (p) => `
PERSONA ${p.id}:
- Nama: ${p.name}, Usia: ${p.age} tahun (${p.ageGroup})
- Jenis Kelamin: ${p.gender === "male" ? "Laki-laki" : "Perempuan"}
- Pekerjaan: ${p.occupation}
- Income Level: ${p.incomeLevel} | Pendapatan/bulan: Rp ${p.monthlyIncome.toLocaleString("id-ID")} | Uang jajan/bulan: Rp ${p.monthlyDisposable.toLocaleString("id-ID")}
- Sensitivitas Harga: ${p.shoppingBehavior.priceElasticity}
- Faktor Keputusan Beli: ${p.shoppingBehavior.decisionFactor.join(", ")}
- Pengeluaran F&B/minggu: Rp ${p.shoppingBehavior.weeklyFnBSpend.toLocaleString("id-ID")}
- Lifestyle: ${p.lifestyle.join(", ")}
- Values: ${p.psychographic.values.join(", ")}
- Kompetitor yang dikenal: ${p.cityContext.competitorAwareness.join(", ")}
- Catatan budaya: ${p.cityContext.culturalNote}`
    )
    .join("\n");

  return `PRODUK YANG AKAN DISIMULASIKAN:
Nama: ${request.product.name}
Kategori: ${categoryLabel[request.product.category] || request.product.category}
Harga: Rp ${request.product.price.toLocaleString("id-ID")} ${request.product.priceUnit.replace("per_", "per ")}
Deskripsi: ${request.product.description}
${request.additionalContext ? `Konteks tambahan: ${request.additionalContext}` : ""}

KOTA TARGET: ${city.name}, ${city.province}
Profil Ekonomi: ${city.economicProfile}
Rata-rata pengeluaran bulanan: Rp ${city.avgMonthlyExpenditure.toLocaleString("id-ID")}

PERSONA KONSUMEN (evaluasi masing-masing secara independen):
${personasText}

RESPOND WITH THIS EXACT JSON (no markdown, no code blocks, raw JSON only):
{
  "summary": {
    "confidenceScore": <integer 0-100>,
    "optimalPriceRange": {
      "min": <integer IDR>,
      "max": <integer IDR>,
      "recommended": <integer IDR>
    },
    "estimatedMonthlyRevenue": {
      "low": <integer IDR>,
      "high": <integer IDR>
    },
    "overallRecommendation": "<1-2 kalimat ringkas dalam Bahasa Indonesia>",
    "keyRisks": ["<risiko 1>", "<risiko 2>", "<risiko 3>"],
    "keyOpportunities": ["<peluang 1>", "<peluang 2>", "<peluang 3>"],
    "sentimentAnalysis": {
      "positive": ["<hal positif 1>", "<hal positif 2>"],
      "negative": ["<hal negatif 1>", "<hal negatif 2>"],
      "neutral": ["<hal netral 1>", "<hal netral 2>"]
    },
    "footTrafficImpact": "<high|medium|low>",
    "backfireWarnings": ["<peringatan potensi blunder 1>", "<peringatan potensi blunder 2>"]
  },
  "segmentBreakdown": [
    {
      "segmentName": "<contoh: Mahasiswa (18-24)>",
      "ageGroup": "<18-24|25-30|31-40|41-55|55+>",
      "incomeLevel": "<low|lower-mid|mid|upper-mid|high>",
      "willBuyPercentage": <integer 0-100>,
      "averageWeeklyFrequency": <number, berapa kali seminggu jika beli>,
      "pricePerception": "<too_cheap|cheap|fair|expensive|too_expensive>",
      "mainReason": "<1 kalimat dalam Bahasa Indonesia>",
      "personaCount": <integer>,
      "sentiment": "<positive|neutral|negative>",
      "interestLevel": <integer 0-100>
    }
  ],
  "personaDetails": [
    {
      "personaId": "<id persona>",
      "personaName": "<nama>",
      "ageGroup": "<group>",
      "occupation": "<pekerjaan>",
      "incomeLevel": "<level>",
      "decision": "<buy|consider|pass>",
      "willingnessToPay": <integer IDR, harga maksimal yang mau dibayar>,
      "reasoning": "<1-2 kalimat reasoning dalam Bahasa Indonesia>",
      "confidenceLevel": <integer 0-100>
    }
  ]
}`;
}
