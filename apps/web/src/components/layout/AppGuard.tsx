import { Navigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactNode } from "react";

export function AppGuard({ children }: { children: ReactNode }) {
  const { connected } = useWallet();

  if (!connected) {
    return <Navigate to="/app/login" replace />;
  }

  return <>{children}</>;
}
