import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LayoutDashboard, Grid3X3, History, LogOut, ArrowLeft, Coins, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import { useState, useEffect } from "react";
import { TopUpModal } from "../payment/TopUpModal";

export function AppLayout() {
  const { disconnect, publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const [showTopUp, setShowTopUp] = useState(false);
  const navigate = useNavigate();

  // Collapsible state (hidden by default on screens < 1024px)
  const [isCollapsed, setIsCollapsed] = useState(() => 
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await disconnect();
    navigate("/");
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0c0c0a] flex text-white font-sans">
      {/* Sidebar */}
      <aside 
        className={`shrink-0 border-r border-white/[0.06] bg-[#0e0e0b] flex flex-col relative z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[80px]" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-9 w-7 h-7 bg-[#1a1a17] border border-white/[0.08] rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50 shadow-lg"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
        </button>

        {/* Logo Area */}
        <div className={`py-8 border-b border-white/[0.06] flex items-center transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-6'}`}>
          <div className="flex items-center">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.03)]">
              <img src="/logo.png" alt="SimPasar Logo" className="w-full h-full object-contain opacity-90" />
            </div>
            <div 
              className={`text-white font-extrabold text-xl tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? "w-0 opacity-0 ml-0" : "w-28 opacity-100 ml-3"
              }`}
            >
              SimPasar
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-8 space-y-2 transition-all duration-300 custom-scrollbar ${isCollapsed ? 'px-3' : 'px-4'}`}>
          <NavLink
            to="/app/dashboard"
            title="Tinjauan"
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all duration-300 ${
                isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'
              } ${
                isActive
                  ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" /> 
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Tinjauan</span>
          </NavLink>
          
          <NavLink
            to="/app/cluster"
            title="Klaster Pasar"
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all duration-300 ${
                isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'
              } ${
                isActive
                  ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent"
              }`
            }
          >
            <Grid3X3 className="w-5 h-5 shrink-0" /> 
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Klaster Pasar</span>
          </NavLink>

          <NavLink
            to="/app/history"
            title="Riwayat Simulasi"
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all duration-300 ${
                isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3'
              } ${
                isActive
                  ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent"
              }`
            }
          >
            <History className="w-5 h-5 shrink-0" /> 
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Riwayat</span>
          </NavLink>
        </nav>

        {/* Footer Actions */}
        <div className={`py-6 border-t border-white/[0.06] transition-all duration-300 flex flex-col items-center ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {/* Credit Balance Card */}
          <div className={`mb-4 bg-amber-500/[0.04] border border-amber-500/[0.12] rounded-xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden w-full ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {isCollapsed ? (
              <div 
                title={`Saldo Credit: ${user?.credits ?? 0}`}
                onClick={() => setShowTopUp(true)}
                className="flex flex-col items-center justify-center cursor-pointer hover:bg-amber-500/10 rounded-lg p-2 w-full transition-colors"
               >
                <Coins className="w-5 h-5 text-amber-400/80 mb-1" />
                <span className="text-xs font-bold text-amber-300">{user?.credits ?? 0}</span>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-3.5 h-3.5 text-amber-400/70" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400/60">Saldo Credit</span>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-amber-300">{user?.credits ?? 0}</span>
                  <span className="text-xs text-amber-400/50">credit</span>
                </div>
                <button
                  onClick={() => setShowTopUp(true)}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/[0.08] hover:bg-amber-500/[0.14] border border-amber-500/[0.15] text-amber-300/80 hover:text-amber-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Top Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Wallet Button */}
          <div 
            title="Solana Wallet"
            className={`mb-4 w-full transition-all duration-300 
            [&_.wallet-adapter-dropdown]:!w-full [&_.wallet-adapter-dropdown]:!block 
            [&_.wallet-adapter-button]:!justify-center [&_.wallet-adapter-button]:!h-10 
            [&_.wallet-adapter-button]:!bg-white/[0.03] [&_.wallet-adapter-button]:!border 
            [&_.wallet-adapter-button]:!border-white/5 [&_.wallet-adapter-button]:!rounded-xl 
            [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-semibold 
            hover:[&_.wallet-adapter-button]:!bg-white/[0.08] hover:[&_.wallet-adapter-button]:!text-white 
            ${isCollapsed 
              ? "[&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!px-0 [&_.wallet-adapter-button]:!text-transparent [&_.wallet-adapter-button-start-icon]:!block [&_.wallet-adapter-button-start-icon]:!m-0 [&_.wallet-adapter-button-start-icon>img]:!w-5 [&_.wallet-adapter-button-start-icon>img]:!h-5" 
              : "[&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button-start-icon]:!hidden [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!text-slate-300"
            }`}
          >
            <WalletMultiButton />
          </div>

          <NavLink
            to="/"
            title="Kembali ke Landing"
            className={`flex items-center rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all mb-1 w-full ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'}`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Kembali</span>
          </NavLink>
          
          <button
            onClick={handleLogout}
            title="Keluar"
            className={`flex items-center rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${isCollapsed ? 'justify-center p-3' : 'px-4 py-2.5 gap-3'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto scrollbar-hide relative min-w-0">
        {/* Subtle mesh/glow background behind everything */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-[-100px] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 p-4 lg:p-8 h-full">
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
