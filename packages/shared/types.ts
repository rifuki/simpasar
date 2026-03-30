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
  sentiment: "positive" | "neutral" | "negative";
  interestLevel: number; // 0-100
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
    sentimentAnalysis: {
      positive: string[];
      negative: string[];
      neutral: string[];
    };
    footTrafficImpact: "high" | "medium" | "low";
    backfireWarnings: string[];
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

export interface Persona {
  id: string;
  cityId: string;
  name: string;
  age: number;
  ageGroup: string;
  gender: "male" | "female";
  occupation: string;
  incomeLevel: "low" | "lower-mid" | "mid" | "upper-mid" | "high";
  monthlyIncome: number;
  monthlyDisposable: number;
  lifestyle: string[];
  location: string;
  shoppingBehavior: {
    priceElasticity: "very_sensitive" | "sensitive" | "moderate" | "insensitive";
    decisionFactor: string[];
    preferredChannel: string[];
    weeklyFnBSpend: number;
  };
  psychographic: {
    values: string[];
    mediaConsumption: string[];
    peerInfluence: "low" | "medium" | "high";
  };
  cityContext: {
    culturalNote: string;
    competitorAwareness: string[];
  };
}

export interface ApiError {
  error: string;
  message: string;
}

// Cluster Types (for Market Cluster feature)
export type IndustryType = "fnb" | "beauty" | "fashion" | "retail" | "services";

export interface Cluster {
  id: string;
  name: string;
  city: string;
  province: string;
  industry: IndustryType;
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

export interface ClusterSimulationRequest {
  product: {
    name: string;
    description: string;
    price: number;
    priceUnit: PriceUnit;
  };
  clusterId: string;
  additionalContext?: string;
  walletAddress?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  simulationId: string;
  clusterId: string;
  startedAt: string;
  expiresAt: string;
  messages: ChatMessage[];
  remainingSeconds: number;
}
