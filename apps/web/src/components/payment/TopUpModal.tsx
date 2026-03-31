import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, XCircle, X, Wallet, QrCode } from "lucide-react";
import { api } from "../../lib/api";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { getAssociatedTokenAddressSync, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
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
  const successFiredRef = useRef(false);

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
    if (isConfirmed && !successFiredRef.current) {
      successFiredRef.current = true;
      queryClient.invalidateQueries({ queryKey: ["user_me", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["idrx_balance", publicKey?.toBase58()] });
      showToast(`+${statusData?.creditsAdded ?? creditsCount} Credit berhasil ditambahkan!`, "success");
      const timer = setTimeout(() => onSuccess(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

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
    staleTime: 30_000,
    refetchOnMount: false,
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

      // SPL transfer with decimals check + reference key embedded as readonly account
      // (@solana/pay's validateTransfer expects reference in the transfer instruction's accounts)
      const transferIx = createTransferCheckedInstruction(
        senderATA,
        splTokenPubKey,
        recipientATA,
        publicKey,
        rawAmount,
        IDRX_DECIMALS
      );
      transferIx.keys.push({ pubkey: referencePubKey, isSigner: false, isWritable: false });
      tx.add(transferIx);

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.18 }}
        className="bg-[#111114] border border-white/8 rounded-2xl max-w-xs w-full shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Top Up Credit</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">1 Credit = 1 Simulasi Pasar</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/8 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Credit Quantity Picker */}
          {!isConfirmed && !txSignature && (
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">Jumlah Credit</p>

              {/* Quick select */}
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCreditsCount(n)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      creditsCount === n
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-transparent border-white/6 text-zinc-500 hover:border-white/12 hover:text-zinc-300"
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-xl px-3 py-2">
                <button
                  onClick={() => setCreditsCount(c => Math.max(1, c - 1))}
                  className="w-6 h-6 rounded-md bg-white/6 hover:bg-white/10 text-zinc-300 font-bold transition-colors flex items-center justify-center text-sm leading-none"
                >−</button>
                <div className="flex-1 text-center">
                  <span className="text-white font-semibold text-sm">{creditsCount}</span>
                  <span className="text-zinc-600 text-xs ml-1">credit</span>
                </div>
                <button
                  onClick={() => setCreditsCount(c => Math.min(100, c + 1))}
                  className="w-6 h-6 rounded-md bg-white/6 hover:bg-white/10 text-zinc-300 font-bold transition-colors flex items-center justify-center text-sm leading-none"
                >+</button>
              </div>

              {/* Price summary */}
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 text-[11px]">@75.000 IDRX / credit</span>
                <span className="text-white font-semibold text-xs">
                  {(creditsCount * PRICE_PER_CREDIT).toLocaleString("id-ID")} IDRX
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!isConfirmed && !txSignature && (
            <div className="flex bg-white/4 p-0.5 rounded-xl border border-white/6">
              <button
                onClick={() => setActiveTab("wallet")}
                className={`flex-1 py-2 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "wallet"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" /> Bayar Wallet
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 py-2 rounded-[10px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "qr"
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> Scan QR
              </button>
            </div>
          )}

          {/* Content area */}
          <AnimatePresence mode="wait">

            {/* Loading checkout */}
            {isCheckoutLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Memuat...</span>
              </motion.div>
            )}

            {/* Error */}
            {(isCheckoutError || (!isCheckoutLoading && !checkout)) && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 gap-2 text-red-400/80">
                <XCircle className="w-5 h-5" />
                <span className="text-xs">Gagal memuat pembayaran</span>
              </motion.div>
            )}

            {/* Awaiting on-chain confirmation */}
            {txSignature && !isConfirmed && (
              <motion.div key="pending" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-4">
                {/* Spinner */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-14 h-14 rounded-full border border-emerald-500/15 animate-ping" />
                  <div className="w-12 h-12 rounded-full bg-white/4 border border-white/8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  </div>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-1.5 w-full">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Terkirim</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-white/8 mb-3.5" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-5 h-5 rounded-full bg-white/6 border border-white/12 flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                    </div>
                    <span className="text-[10px] text-zinc-300 font-medium">Konfirmasi</span>
                  </div>
                  <div className="flex-1 h-px bg-white/8 mb-3.5" />
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-5 h-5 rounded-full bg-white/3 border border-white/6 flex items-center justify-center">
                      <span className="text-[9px] text-zinc-700 font-bold">3</span>
                    </div>
                    <span className="text-[10px] text-zinc-700 font-medium">Selesai</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-white font-medium text-xs">Menunggu konfirmasi blockchain</p>
                  <p className="text-zinc-600 text-[11px] mt-0.5">Biasanya 5–15 detik</p>
                </div>

                {/* TX link */}
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full bg-white/4 hover:bg-white/6 border border-white/6 rounded-xl px-3 py-2 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Tx Hash</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate group-hover:text-zinc-200 transition-colors">
                      {txSignature.slice(0, 18)}...{txSignature.slice(-6)}
                    </p>
                  </div>
                  <svg className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </motion.div>
            )}

            {/* Success */}
            {isConfirmed && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Berhasil!</p>
                  <p className="text-emerald-400/80 text-xs mt-0.5">+{statusData?.creditsAdded ?? creditsCount} Credit ditambahkan</p>
                </div>
              </motion.div>
            )}

            {/* Wallet tab */}
            {checkout && !isConfirmed && !txSignature && activeTab === "wallet" && (
              <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">

                {/* Ledger row */}
                <div className="flex items-center justify-between bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Saldo IDRX</p>
                    {isBalanceLoading ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-white/8 animate-pulse" />
                        <div className="relative overflow-hidden rounded h-3.5 w-20 bg-white/5">
                          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                        </div>
                      </div>
                    ) : isBalanceError ? (
                      <div className="flex items-center gap-1 text-red-400/70 text-xs">
                        <XCircle className="w-3 h-3" /> RPC error
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <img src="/idrx.png" alt="IDRX" className="w-4 h-4 rounded-full" />
                        <span className="text-white font-semibold text-sm">{userBalance !== undefined ? userBalance.toLocaleString("id-ID") : "0"}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-px h-8 bg-white/6" />

                  <div className="text-right">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Tagihan</p>
                    <p className="text-emerald-400 font-semibold text-sm">{checkout.amount.toLocaleString("id-ID")} <span className="text-xs font-normal text-emerald-400/70">IDRX</span></p>
                  </div>
                </div>

                {/* Alerts */}
                {sendError && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3 text-xs text-red-400/90">
                    {sendError}
                  </div>
                )}
                {userBalance !== undefined && userBalance !== null && userBalance < checkout.amount && !sendError && (
                  <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3 text-xs text-amber-400/90">
                    Saldo kurang. Isi dari <a href="/faucet" target="_blank" className="font-semibold underline hover:text-amber-300">Faucet</a>.
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleWalletPay}
                  disabled={isSending || (userBalance !== undefined && userBalance !== null && userBalance < checkout.amount)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Otorisasi Wallet...</>
                  ) : (
                    "Setujui Pembayaran"
                  )}
                </button>
              </motion.div>
            )}

            {/* QR tab */}
            {checkout && !isConfirmed && !txSignature && activeTab === "qr" && (
              <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex justify-center py-2">
                <div className="bg-white p-3 rounded-xl">
                  <QRCodeSVG value={checkout.url} size={150} level="Q" includeMargin={false} />
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer */}
          {checkout && !isConfirmed && (
            <div className="pt-3 border-t border-white/6 flex flex-col items-center gap-1.5">
              {txSignature ? (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Memverifikasi di blockchain...
                </div>
              ) : (
                <p className="text-[11px] text-zinc-700">
                  Devnet demo —{" "}
                  <a href="/faucet" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    Klaim IDRX gratis
                  </a>
                </p>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
