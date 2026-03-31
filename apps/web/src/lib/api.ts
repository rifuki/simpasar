import axios from "axios";
import type { SimulationRequest, SimulationResult, City } from "@shared/types";

const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

const apiClient = axios.create({ baseURL: BASE });

async function handleResponse<T>(promise: Promise<any>): Promise<T> {
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

export async function fetchCities(): Promise<City[]> {
  return handleResponse<City[]>(apiClient.get("/cities"));
}

export async function runSimulation(body: SimulationRequest): Promise<SimulationResult> {
  return handleResponse<SimulationResult>(apiClient.post("/simulation/run", body));
}

export const api = {
  get: async (url: string) => {
    const finalUrl = url.startsWith("http") ? url : url.replace(/^\/api/, "").replace(/^\//, "");
    return handleResponse<any>(apiClient.get(finalUrl));
  },
  post: async (url: string, data: any) => {
    const finalUrl = url.startsWith("http") ? url : url.replace(/^\/api/, "").replace(/^\//, "");
    return handleResponse<any>(apiClient.post(finalUrl, data));
  }
};
