import { useMutation, useQuery } from "@tanstack/react-query";
import { runSimulation, fetchCities } from "../lib/api";
import type { SimulationRequest } from "@shared/types";

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });
}

export function useRunSimulation() {
  return useMutation({
    mutationFn: (request: SimulationRequest) => runSimulation(request),
  });
}
