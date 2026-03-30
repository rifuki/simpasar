import axios from "axios";

const BASE = "/api/admin";
const KEY_STORAGE = "simpasar_admin_key";

export function getAdminKey(): string {
  return localStorage.getItem(KEY_STORAGE) ?? "";
}

export function setAdminKey(key: string): void {
  localStorage.setItem(KEY_STORAGE, key);
}

export function clearAdminKey(): void {
  localStorage.removeItem(KEY_STORAGE);
}

const adminAxios = axios.create({ baseURL: BASE });
adminAxios.interceptors.request.use((config) => {
  config.headers["X-Admin-Key"] = getAdminKey();
  return config;
});

async function req<T>(promise: Promise<any>): Promise<T> {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || `API Error`);
    }
    throw error;
  }
}

// ─── Cities ──────────────────────────────────────────────────────────────────

export type AdminCity = {
  id: string; name: string; province: string; tier: "1" | "2" | "3";
  population: number; economicProfile: string; avgMonthlyExpenditure: number;
  topIndustries: string[]; personaCount: number;
};

export const adminApi = {
  cities: {
    list: () => req<AdminCity[]>(adminAxios.get("/cities")),
    get: (id: string) => req<AdminCity>(adminAxios.get(`/cities/${id}`)),
    create: (data: Omit<AdminCity, "personaCount">) => req<AdminCity>(adminAxios.post("/cities", data)),
    update: (id: string, data: Omit<AdminCity, "id" | "personaCount">) => req<AdminCity>(adminAxios.put(`/cities/${id}`, data)),
    delete: (id: string) => req<{ success: boolean }>(adminAxios.delete(`/cities/${id}`)),
  },

  // ─── Personas ──────────────────────────────────────────────────────────────

  personas: {
    list: (cityId?: string) => req<AdminPersona[]>(adminAxios.get(`/personas`, { params: { cityId } })),
    get: (id: string) => req<AdminPersona>(adminAxios.get(`/personas/${id}`)),
    create: (data: AdminPersona) => req<AdminPersona>(adminAxios.post("/personas", data)),
    update: (id: string, data: Omit<AdminPersona, "id">) => req<AdminPersona>(adminAxios.put(`/personas/${id}`, data)),
    delete: (id: string) => req<{ success: boolean }>(adminAxios.delete(`/personas/${id}`)),
  },

  // ─── Simulations ───────────────────────────────────────────────────────────

  simulations: {
    list: (params?: { limit?: number; offset?: number; cityId?: string }) => 
      req<{ total: number; limit: number; offset: number; data: SimulationRow[] }>(adminAxios.get(`/simulations`, { params })),
    get: (id: string) => req<SimulationDetail>(adminAxios.get(`/simulations/${id}`)),
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  settings: {
    getPrompt: () => req<{ prompt: string; isCustom: boolean }>(adminAxios.get("/settings/prompt")),
    savePrompt: (prompt: string) => req<{ success: boolean; prompt: string }>(adminAxios.put("/settings/prompt", { prompt })),
    resetPrompt: () => req<{ success: boolean; prompt: string }>(adminAxios.delete("/settings/prompt")),
  },

  // ─── Stats ─────────────────────────────────────────────────────────────────

  stats: {
    get: () => req<{ totalPersonas: number; totalCities: number; totalSimulations: number; todaySimulations: number }>(adminAxios.get("/stats")),
  },
};

export type AdminPersona = {
  id: string; cityId: string; name: string; age: number;
  ageGroup: "18-24" | "25-30" | "31-40" | "41-55" | "55+";
  gender: "male" | "female"; occupation: string;
  incomeLevel: "low" | "lower-mid" | "mid" | "upper-mid" | "high";
  monthlyIncome: number; monthlyDisposable: number;
  lifestyle: string[]; location: string;
  shoppingBehavior: {
    priceElasticity: "very_sensitive" | "sensitive" | "moderate" | "insensitive";
    decisionFactor: string[]; preferredChannel: string[]; weeklyFnBSpend: number;
  };
  psychographic: { values: string[]; mediaConsumption: string[]; peerInfluence: "high" | "medium" | "low" };
  cityContext: { culturalNote: string; competitorAwareness: string[] };
};

export type SimulationRow = {
  id: string; created_at: string; city_id: string;
  product_name: string; market_penetration: number;
};

export type SimulationDetail = {
  id: string; createdAt: string; cityId: string;
  productName: string; marketPenetration: number;
  request: unknown; result: unknown;
};
