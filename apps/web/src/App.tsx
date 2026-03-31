import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ToastProvider } from "./components/ui/Toast";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { FaucetPage } from "./pages/FaucetPage";
import { PersonasPage } from "./pages/admin/PersonasPage";
import { CitiesPage } from "./pages/admin/CitiesPage";
import { SimulationsPage } from "./pages/admin/SimulationsPage";
import { PromptPage } from "./pages/admin/PromptPage";

// B2B App Pages
import { AppLogin } from "./pages/app/AppLogin";
import { AppDashboard } from "./pages/app/AppDashboard";
import { HistoryPage } from "./pages/app/HistoryPage";
import { SimulationResultPage } from "./pages/app/SimulationResultPage";
import { MarketClusterPage } from "./pages/MarketClusterPage";

// Services & Guards
import { getAdminKey } from "./lib/adminApi";
import { WalletProviderWrapper } from "./components/layout/WalletProvider";
import { AppGuard } from "./components/layout/AppGuard";
import { AppLayout } from "./components/layout/AppLayout";

function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!getAdminKey()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/faucet" element={<FaucetPage />} />
            
            {/* Public Business Login */}
            <Route path="/app/login" element={<AppLogin />} />

            {/* Business / Wallet App */}
            <Route path="/app" element={
              <AppGuard>
                <AppLayout />
              </AppGuard>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<AppDashboard />} />
              <Route path="simulate" element={<Navigate to="/app/cluster" replace />} />
              <Route path="cluster" element={<MarketClusterPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="result/:id" element={<SimulationResultPage />} />
            </Route>
            
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
        </ToastProvider>
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}
