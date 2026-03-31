import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, XCircle, X, Wallet, QrCode } from "lucide-react";
import { api } from "../../lib/api";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { getAssociatedTokenAddressSync, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { Transaction, SystemProgram } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../ui/Toast";

interface TopUpModalProps {
  walletAddress: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export function TopUpModal({ walletAddress, onSuccess, onClose }: TopUpModalProps) {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"wallet" | "qr">("wallet");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [creditsCount, setCreditsCount] = useState(1);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const PRICE_PER_CREDIT = 75000;

  // 1. Fetch checkout details (re-runs when creditsCount changes)
  const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
    queryKey: ["payment_checkout", walletAddress, creditsCount],
    queryFn: async () => {
      const res = await api.get(`/api/payment/checkout?wallet=${walletAddress}&credits=${creditsCount}`);
      return res as { url: string; reference: string; amount: number; credits: number; recipient: string; splToken: string };
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // 2. Poll for payment status (Backend verification)
  const { data: statusData } = useQuery({
    queryKey: ["payment_status", checkout?.reference],
    queryFn: async () => {
      if (!checkout?.reference) return null;
      const res = await api.get(`/api/payment/verify?reference=${checkout.reference}`);
      return res as { status: string; creditsAdded: number; currentCredits?: number };
    },
    enabled: !!checkout?.reference,
    refetchInterval: (query) => {
      // query.state.data is the returned data from queryFn
      if (query.state.data?.status === "confirmed") return false;
      return 3000;
    },
  });

  const isConfirmed = statusData?.status === "confirmed";

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ["user_me", walletAddress] });
      showToast(`+${statusData?.creditsAdded ?? creditsCount} Credit berhasil ditambahkan!`, "success");
      const timer = setTimeout(() => {
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, walletAddress, queryClient, showToast, statusData?.creditsAdded, creditsCount]);

  // 3. Fetch IDRX Balance — derive ATA directly, 1 RPC call
  const { data: userBalance, isLoading: isBalanceLoading, isError: isBalanceError } = useQuery({
    queryKey: ["idrx_balance", publicKey?.toBase58(), checkout?.splToken],
    queryFn: async () => {
      if (!publicKey || !checkout?.splToken) return undefined;
      const mintPubKey = new PublicKey(checkout.splToken);
      const ata = getAssociatedTokenAddressSync(mintPubKey, publicKey, true);
      console.log("[IDRX Balance] mint:", checkout.splToken, "| owner:", publicKey.toBase58(), "| ata:", ata.toBase58());
      try {
        const { value } = await connection.getTokenAccountBalance(ata);
        console.log("[IDRX Balance] result:", value.uiAmountString);
        return parseFloat(value.uiAmountString ?? "0");
      } catch (e: any) {
        console.warn("[IDRX Balance] ATA not found or error:", e?.message);
        const errMsg = e?.message?.toLowerCase() || "";
        
        // Hanya return 0 jika kita yakin akun belum ada
        if (errMsg.includes("could not find account") || errMsg.includes("invalid param") || errMsg.includes("not found")) {
          return 0;
        }
        
        // Jika karena koneksi/RPC jelek, throw error agar statusnya isError
        throw e;
      }
    },
    enabled: !!publicKey && !!checkout?.splToken,
    retry: 2,
    staleTime: 0,
    refetchOnMount: true,
  });

  const handleWalletPay = async () => {
    if (!checkout || !publicKey) return;
    setIsSending(true);
    setSendError("");
    
    try {
      const recipientPubKey = new PublicKey(checkout.recipient);
      const splTokenPubKey = new PublicKey(checkout.splToken);
      const referencePubKey = new PublicKey(checkout.reference);
      const IDRX_DECIMALS = 6;
      const rawAmount = new BigNumber(checkout.amount).multipliedBy(10 ** IDRX_DECIMALS).toNumber();

      // Derive sender and recipient ATAs (allowOwnerOffCurve = true)
      const senderATA = getAssociatedTokenAddressSync(splTokenPubKey, publicKey, true);
      const recipientATA = getAssociatedTokenAddressSync(splTokenPubKey, recipientPubKey, true);

      const tx = new Transaction();

      // Create recipient ATA if it doesn't exist (first time)
      try {
        await getAccount(connection, recipientATA);
      } catch {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,      // payer (buyer pays to create merchant ATA)
            recipientATA,
            recipientPubKey,
            splTokenPubKey
          )
        );
      }

      // SPL transfer with decimals check
      tx.add(
        createTransferCheckedInstruction(
          senderATA,
          splTokenPubKey,
          recipientATA,
          publicKey,
          rawAmount,
          IDRX_DECIMALS
        )
      );

      // Add reference key as no-op memo so backend can find this tx
      tx.add(
        new Transaction().add(...[
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: referencePubKey,
            lamports: 0,
          })
        ]).instructions[0]
      );

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      console.log("Tx sent:", signature);
      setTxSignature(signature);
      // Backend polling will catch confirmation naturally
    } catch (err: any) {
      console.error("Wallet transaction error:", err);
      let errorMsg = "Gagal memproses transaksi. Silakan coba lagi.";
      
      const errString = err?.toString()?.toLowerCase() || "";
      const errMsg = err?.message?.toLowerCase() || "";
      const errName = err?.name || "";

      if (
        errName === "WalletSignTransactionError" || 
        errName === "WalletSendTransactionError" && (errMsg.includes("reject") || errMsg.includes("cancel") || errMsg.includes("denied")) ||
        errMsg.includes("user rejected") || 
        errString.includes("user rejected") ||
        errMsg.includes("reject") || 
        errString.includes("reject") ||
        errMsg.includes("cancel") || 
        errString.includes("cancel") ||
        errMsg.includes("denied") ||
        errString.includes("denied") ||
        errString.includes("user cancelled")
      ) {
        errorMsg = "Transaksi dibatalkan. Anda menolak persetujuan di Wallet.";
      } else if (err?.message) {
        errorMsg = `Gagal: ${err.message}`;
      } else if (typeof err === "string") {
        errorMsg = `Gagal: ${err}`;
      }
      
      setSendError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0f] border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-sm w-full shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Glow & BG */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Close Button */}
        {onClose && !isConfirmed && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-5 relative z-10 w-[90%] mx-auto">
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Top Up Credit</h2>
          <p className="text-zinc-500 text-xs">1 Credit = 1 Simulasi Pasar</p>
        </div>

        {/* Credit Quantity Picker */}
        {!isConfirmed && !txSignature && (
          <div className="relative z-10 mb-5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 px-1">Jumlah Credit</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[1, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setCreditsCount(n)}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                    creditsCount === n
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl px-4 py-2.5">
              <button
                onClick={() => setCreditsCount(c => Math.max(1, c - 1))}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center text-lg leading-none"
              >−</button>
              <div className="flex-1 text-center">
                <span className="text-white font-bold text-lg">{creditsCount}</span>
                <span className="text-zinc-500 text-xs ml-1">credit</span>
              </div>
              <button
                onClick={() => setCreditsCount(c => Math.min(100, c + 1))}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors flex items-center justify-center text-lg leading-none"
              >+</button>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
              <span className="text-zinc-500 text-xs">@75.000 IDRX / credit</span>
              <span className="text-emerald-400 font-bold text-sm">
                Total: {(creditsCount * PRICE_PER_CREDIT).toLocaleString("id-ID")} IDRX
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!isConfirmed && !txSignature && (
          <div className="flex bg-[#111] p-1 rounded-xl mb-6 relative z-10 border border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "wallet" 
                  ? "bg-white text-black shadow-md" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wallet className="w-4 h-4" /> Bayar Wallet
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "qr" 
                  ? "bg-white text-black shadow-md" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <QrCode className="w-4 h-4" /> Scan QR
            </button>
          </div>
        )}

        {/* Payment Content View */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            
            {/* Loading checkout state */}
            {isCheckoutLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-500 min-h-[220px]">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Memverifikasi Harga...</span>
              </motion.div>
            )}

            {/* Error state */}
            {(isCheckoutError || (!isCheckoutLoading && !checkout)) && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-3 text-red-400 min-h-[220px]">
                <XCircle className="w-10 h-10" />
                <span className="text-sm">Gagal memuat saluran pembayaran</span>
              </motion.div>
            )}

            {/* Awaiting confirmation state */}
            {txSignature && !isConfirmed && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center justify-center py-8 gap-6 min-h-[220px]"
              >
                {/* Animated ring */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-500/20 animate-ping" />
                  <div className="absolute w-20 h-20 rounded-full bg-emerald-500/5 blur-md" />
                  <div className="w-16 h-16 rounded-full bg-[#111] border border-emerald-500/30 flex items-center justify-center relative z-10">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 w-full px-2">
                  {/* Step 1 — done */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold text-center leading-tight">Terkirim</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 to-white/10 mb-3" />
                  {/* Step 2 — active */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                    </div>
                    <span className="text-[10px] text-white font-semibold text-center leading-tight">Konfirmasi</span>
                  </div>
                  <div className="flex-1 h-px bg-white/10 mb-3" />
                  {/* Step 3 — waiting */}
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-600 font-bold">3</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-semibold text-center leading-tight">Selesai</span>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-white font-semibold text-sm">Menunggu Konfirmasi Blockchain</p>
                  <p className="text-zinc-500 text-xs">Biasanya selesai dalam 5–15 detik</p>
                </div>

                {/* TX Hash */}
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 transition-colors group w-full"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Transaction Hash</p>
                    <p className="text-xs text-zinc-300 font-mono truncate group-hover:text-white transition-colors">
                      {txSignature.slice(0, 20)}...{txSignature.slice(-8)}
                    </p>
                  </div>
                  <svg className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </motion.div>
            )}

            {/* Success state */}
            {isConfirmed ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 gap-5 text-emerald-400 min-h-[220px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center relative z-10 border border-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-md" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white tracking-tight mb-1">Transaksi Berhasil!</div>
                  <div className="text-sm text-emerald-400/80 font-medium">+{statusData?.creditsAdded ?? creditsCount} Credit Ditambahkan</div>
                </div>
              </motion.div>
            ) : null}

            {/* Wallet Pay Tab */}
            {checkout && !isConfirmed && !txSignature && activeTab === "wallet" && (
              <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-[220px]">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-5 w-full flex-1 flex flex-col text-center justify-between gap-4">
                  
                  {/* Ledger Display */}
                  <div className="w-full flex justify-between items-center bg-[#16161e] border border-white/10 rounded-xl p-4 shadow-inner">
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Saldo IDRX Anda</span>
                      <div className="flex items-center gap-2">
                        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/26732.png" alt="IDRX" className="w-5 h-5 rounded-full bg-white/10" />
                        {isBalanceLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                        ) : isBalanceError ? (
                          <span className="text-red-400 font-medium text-xs">Gagal memuat network</span>
                        ) : (
                          <span className="text-white font-bold leading-none">{userBalance !== undefined ? userBalance.toLocaleString("id-ID") : "0"}</span>
                        )}
                      </div>
                    </div>

                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    <div className="flex flex-col items-end text-right">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Tagihan</span>
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5 leading-none mt-1">
                        {checkout.amount.toLocaleString("id-ID")} <span className="text-xs font-semibold">IDRX</span>
                      </div>
                    </div>
                  </div>

                  {sendError && (
                    <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 text-left">
                      {sendError}
                    </div>
                  )}

                  {userBalance !== undefined && userBalance !== null && userBalance < checkout.amount && !sendError && (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl w-full text-left font-medium leading-relaxed">
                      Saldo Anda kurang. Harap isi dari <a href="/faucet" target="_blank" className="font-bold underline hover:text-amber-300">Faucet</a>.
                    </div>
                  )}

                  <button
                    onClick={handleWalletPay}
                    disabled={isSending || (userBalance !== undefined && userBalance !== null && userBalance < checkout.amount)}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#021A11] font-bold shadow-[0_5px_20px_rgba(52,211,153,0.2)] hover:shadow-[0_8px_30px_rgba(52,211,153,0.3)] disabled:opacity-40 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2 mt-auto"
                  >
                    {isSending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Otorisasi Wallet...</>
                    ) : (
                      "Setujui Pembayaran"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* QR Scan Tab */}
            {checkout && !isConfirmed && !txSignature && activeTab === "qr" && (
              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col min-h-[220px]">
                <div className="bg-[#12121a] border border-white/5 p-4 rounded-2xl flex justify-center items-center flex-1">
                  <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <QRCodeSVG 
                      value={checkout.url} 
                      size={180}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {checkout && !isConfirmed && (
          <div className="text-center relative z-10 mt-6 pt-5 border-t border-white/10 space-y-3">
            {txSignature ? (
              <div className="inline-flex items-center gap-2 text-[13px] font-medium text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[ping_1.5s_ease-in-out_infinite]"></span>
                Backend memverifikasi transaksi...
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-400 bg-[#111] border border-white/5 px-4 py-2 rounded-full shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[ping_1.5s_ease-in-out_infinite]"></span>
                  Sistem backend memonitor pembayaran...
                </div>
                <p className="text-xs text-zinc-500">
                  Butuh saldo IDRX Devnet? <a href="/faucet" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Faucet Gratis</a>
                </p>
              </>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
