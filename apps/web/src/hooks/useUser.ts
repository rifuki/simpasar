import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface UserResponse {
  wallet_address: string;
  credits: number;
  created_at?: string;
}

export function useUser(walletAddress: string | null) {
  return useQuery({
    queryKey: ["user_me", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const res = await api.get(`/api/user/me?wallet=${walletAddress}`);
      return res as UserResponse;
    },
    enabled: !!walletAddress,
  });
}
