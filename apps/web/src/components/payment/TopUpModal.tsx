import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TopUpModalProps {
  walletAddress: string;
  onSuccess: () => void;
}

export function TopUpModal({ walletAddress, onSuccess }: TopUpModalProps) {
  const queryClient = useQueryClient();

  // 1. Fetch initial checkout URL
  const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
    queryKey: ["payment_checkout", walletAddress],
    queryFn: async () => {
      const res = await api.get(`/api/payment/checkout?wallet=${walletAddress}`);
      return res as { url: string; reference: string; amount: number };
    },
    refetchOnWindowFocus: false,
  });

  // 2. Poll for payment status
  const { data: statusData } = useQuery({
    queryKey: ["payment_status", checkout?.reference],
    queryFn: async () => {
      if (!checkout?.reference) return null;
      const res = await api.get(`/api/payment/verify?reference=${checkout.reference}`);
      return res as { status: string; creditsAdded: number };
    },
    enabled: !!checkout?.reference,
    refetchInterval: (data) => {
      if ((data as any)?.state?.data?.status === "confirmed") return false;
      return 3000; // poll every 3 seconds
    },
  });

  const isConfirmed = statusData?.status === "confirmed";

  useEffect(() => {
    if (isConfirmed) {
      // Invalidate user cache so credits refresh
      queryClient.invalidateQueries({ queryKey: ["user_me", walletAddress] });
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, walletAddress, queryClient]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Top Up Credit</h2>
          <p className="text-slate-400 text-sm">
            Scan via Phantom atau Solflare (Devnet). Harga: <strong className="text-emerald-400">15.000 IDRX</strong>
          </p>
        </div>

        <div className="bg-[#12121a] border border-white/5 p-4 rounded-2xl flex justify-center items-center mb-6 min-h-[250px] relative z-10">
          {isCheckoutLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Membuat QR Code...</span>
            </div>
          ) : isCheckoutError || !checkout ? (
            <div className="flex flex-col items-center gap-3 text-red-500">
              <XCircle className="w-8 h-8" />
              <span>Gagal memuat pembayaran</span>
            </div>
          ) : isConfirmed ? (
            <div className="flex flex-col items-center gap-4 text-emerald-400">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-lg font-bold text-white">Pembayaran Berhasil!</div>
              <div className="text-sm text-slate-400">+1 Credit Ditambahkan</div>
            </div>
          ) : (
            <div className="bg-white p-2 rounded-xl">
              <QRCodeSVG 
                value={checkout.url} 
                size={200}
                level="Q"
                includeMargin={false}
              />
            </div>
          )}
        </div>

        {!isConfirmed && (
          <div className="text-center relative z-10 mt-4 space-y-3">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Menunggu pembayaran...
            </div>
            
            <p className="text-xs text-slate-500">
              Tidak punya saldo IDRX Devnet? <a href="/faucet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Ambil dari Faucet</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
