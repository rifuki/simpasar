export type ProductCategory =
  | "fnb_beverage"
  | "fnb_food"
  | "fashion"
  | "beauty"
  | "electronics"
  | "services"
  | "other";

export type PriceUnit = "per_piece" | "per_cup" | "per_portion" | "per_kg";

export type SimulationTier = "free" | "basic" | "pro";

export interface SimulationRequest {
  product: {
    name: string;
    category: ProductCategory;
    description: string;
    price: number;
    priceUnit: PriceUnit;
  };
  targetCity: string;
  additionalContext?: string;
  tier: SimulationTier;
  paymentTxSignature?: string;
  walletAddress?: string;
}

export type PricePerception =
  | "too_cheap"
  | "cheap"
  | "fair"
  | "expensive"
  | "too_expensive";

export type PersonaDecision = "buy" | "consider" | "pass";

export interface SegmentResult {
  segmentName: string;
  ageGroup: string;
  incomeLevel: string;
  willBuyPercentage: number;
  averageWeeklyFrequency: number;
  pricePerception: PricePerception;
  mainReason: string;
  personaCount: number;
}

export interface PersonaSimResult {
  personaId: string;
  personaName: string;
  ageGroup: string;
  occupation: string;
  incomeLevel: string;
  decision: PersonaDecision;
  willingnessToPay: number;
  reasoning: string;
  confidenceLevel: number;
}

export interface SimulationResult {
  id: string;
  createdAt: string;
  request: SimulationRequest;
  summary: {
    marketPenetration: number;
    confidenceScore: number;
    optimalPriceRange: {
      min: number;
      max: number;
      recommended: number;
    };
    estimatedMonthlyRevenue: {
      low: number;
      high: number;
    };
    overallRecommendation: string;
    keyRisks: string[];
    keyOpportunities: string[];
  };
  segmentBreakdown: SegmentResult[];
  personaDetails: PersonaSimResult[];
  cityContext: {
    cityName: string;
    marketSize: string;
    competition: string;
  };
}

export interface City {
  id: string;
  name: string;
  province: string;
  tier: "1" | "2" | "3";
  population: number;
  economicProfile: string;
  avgMonthlyExpenditure: number;
  topIndustries: string[];
}

export interface ApiError {
  error: string;
  message: string;
}
