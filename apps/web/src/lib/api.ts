import type { SimulationRequest, SimulationResult, City } from "@shared/types";

const BASE = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${BASE}/cities`);
  return handleResponse<City[]>(res);
}

export async function runSimulation(body: SimulationRequest): Promise<SimulationResult> {
  const res = await fetch(`${BASE}/simulation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<SimulationResult>(res);
}
