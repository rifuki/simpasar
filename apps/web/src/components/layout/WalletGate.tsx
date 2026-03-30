import { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { TopUpModal } from "../payment/TopUpModal";

export function WalletGate({ children }: { children: ReactNode }) {
  const { connected, publicKey } = useWallet();
  const walletStr = publicKey?.toBase58() || null;
  const { data: user, isLoading } = useUser(walletStr);

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/5 bg-[#0a0a0f] shadow-2xl relative">
          <Link to="/" className="absolute top-4 left-4 p-2 text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Akses Bisnis</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Hubungkan wallet Solana Anda (ex: Phantom) untuk masuk ke dashboard simulasi. Identitas Anda akan terkait dengan wallet ini.
          </p>
          <div className="flex justify-center flex-col gap-3">
            <div className="wallet-button-wrapper mx-auto">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      {user && user.credits < 1 && (
        <TopUpModal 
          walletAddress={walletStr!} 
          onSuccess={() => { /* will auto refresh user creds */ }} 
        />
      )}
    </>
  );
}
