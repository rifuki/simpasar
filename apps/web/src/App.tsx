import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { SimulationPage } from "./pages/SimulationPage";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { FaucetPage } from "./pages/FaucetPage";
import { PersonasPage } from "./pages/admin/PersonasPage";
import { CitiesPage } from "./pages/admin/CitiesPage";
import { SimulationsPage } from "./pages/admin/SimulationsPage";
import { PromptPage } from "./pages/admin/PromptPage";

// Services & Guards
import { getAdminKey } from "./lib/adminApi";
import { WalletGate } from "./components/layout/WalletGate";
import { WalletProviderWrapper } from "./components/layout/WalletProvider";

function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!getAdminKey()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/faucet" element={<FaucetPage />} />
            
            {/* Business / Wallet App */}
            <Route path="/app" element={
              <WalletGate>
                <SimulationPage />
              </WalletGate>
            } />
            
            {/* Admin Dashboard */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={<AdminGuard><AdminLayout /></AdminGuard>}
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="personas" element={<PersonasPage />} />
              <Route path="cities" element={<CitiesPage />} />
              <Route path="simulations" element={<SimulationsPage />} />
              <Route path="prompt" element={<PromptPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}
