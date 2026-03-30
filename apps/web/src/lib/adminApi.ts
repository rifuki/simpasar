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

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": getAdminKey(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Cities ──────────────────────────────────────────────────────────────────

export type AdminCity = {
  id: string; name: string; province: string; tier: "1" | "2" | "3";
  population: number; economicProfile: string; avgMonthlyExpenditure: number;
  topIndustries: string[]; personaCount: number;
};

export const adminApi = {
  cities: {
    list: () => req<AdminCity[]>("/cities"),
    get: (id: string) => req<AdminCity>(`/cities/${id}`),
    create: (data: Omit<AdminCity, "personaCount">) => req<AdminCity>("/cities", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Omit<AdminCity, "id" | "personaCount">) => req<AdminCity>(`/cities/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => req<{ success: boolean }>(`/cities/${id}`, { method: "DELETE" }),
  },

  // ─── Personas ──────────────────────────────────────────────────────────────

  personas: {
    list: (cityId?: string) => req<AdminPersona[]>(`/personas${cityId ? `?cityId=${cityId}` : ""}`),
    get: (id: string) => req<AdminPersona>(`/personas/${id}`),
    create: (data: AdminPersona) => req<AdminPersona>("/personas", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Omit<AdminPersona, "id">) => req<AdminPersona>(`/personas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => req<{ success: boolean }>(`/personas/${id}`, { method: "DELETE" }),
  },

  // ─── Simulations ───────────────────────────────────────────────────────────

  simulations: {
    list: (params?: { limit?: number; offset?: number; cityId?: string }) => {
      const qs = new URLSearchParams();
      if (params?.limit) qs.set("limit", String(params.limit));
      if (params?.offset) qs.set("offset", String(params.offset));
      if (params?.cityId) qs.set("cityId", params.cityId);
      return req<{ total: number; limit: number; offset: number; data: SimulationRow[] }>(`/simulations?${qs}`);
    },
    get: (id: string) => req<SimulationDetail>(`/simulations/${id}`),
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  settings: {
    getPrompt: () => req<{ prompt: string; isCustom: boolean }>("/settings/prompt"),
    savePrompt: (prompt: string) => req<{ success: boolean; prompt: string }>("/settings/prompt", { method: "PUT", body: JSON.stringify({ prompt }) }),
    resetPrompt: () => req<{ success: boolean; prompt: string }>("/settings/prompt", { method: "DELETE" }),
  },

  // ─── Stats ─────────────────────────────────────────────────────────────────

  stats: {
    get: () => req<{ totalPersonas: number; totalCities: number; totalSimulations: number; todaySimulations: number }>("/stats"),
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
