import { NavLink, Outlet } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LayoutDashboard, Beaker, LogOut, ArrowLeft, Coins } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";
import { TopUpModal } from "../payment/TopUpModal";

export function AppLayout() {
  const { disconnect, publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const [showTopUp, setShowTopUp] = useState(false);

  const handleLogout = async () => {
    await disconnect();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[#0a0a0f] flex flex-col relative z-20">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="text-white font-bold text-lg tracking-tight">SimPasar</div>
          <div className="text-emerald-400 text-xs mt-1 font-medium tracking-wide shadow-sm">B2B Portal</div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.05)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" /> Overview
          </NavLink>
          
          <NavLink
            to="/app/simulate"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.05)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <Beaker className="w-5 h-5" /> Market Simulation
          </NavLink>
        </nav>

        <div className="px-4 py-6 border-t border-white/5">
          {/* Credit Balance Card */}
          <div className="mb-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Coins className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Saldo Credit</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-bold text-white">{user?.credits ?? 0}</span>
              <span className="text-xs text-zinc-500">credit</span>
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <span>+ Top Up</span>
            </button>
          </div>

          {/* Custom styled wallet button inside sidebar */}
          <div className="mb-4 [&_.wallet-adapter-dropdown]:!w-full [&_.wallet-adapter-dropdown]:!block [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!justify-center [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!bg-white/5 [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-white/10 [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-medium [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button-start-icon]:!hidden hover:[&_.wallet-adapter-button]:!bg-white/10 transition-all">
            <WalletMultiButton />
          </div>

          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Subtle mesh/glow background behind everything */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-[-100px] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 p-8 h-full">
          <Outlet />
        </div>
      </main>

      {/* TopUp Modal */}
      {showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => {
            setShowTopUp(false);
            refetchUser();
          }}
          onClose={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
}
