import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Clock, Bot, User, Sparkles, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import type { SimulationResult } from "@shared/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  simulationResult: SimulationResult;
  onClose?: () => void;
  mode?: "modal" | "embedded";
}

function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return "Berakhir";
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SESSION_HOURS = 12;

const SUGGESTED_QUESTIONS = [
  "Apa strategi terbaik untuk meningkatkan market penetration?",
  "Segment mana yang paling potensial untuk difokuskan?",
  "Bagaimana pricing strategy yang optimal?",
  "Apa risiko terbesar yang perlu diantisipasi?",
];

function buildWelcomeMessage(result: SimulationResult): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: `Halo! Saya siap membantu menganalisis hasil simulasi **${result.request.product.name}** di **${result.cityContext.cityName}**.\n\nMarket penetration Anda **${result.summary.marketPenetration}%** dengan confidence score **${result.summary.confidenceScore}%**. Ada yang ingin Anda tanyakan lebih lanjut?`,
    timestamp: result.createdAt,
  };
}

export function ChatInterface({ simulationResult, onClose, mode = "modal" }: ChatInterfaceProps) {
  const simulationId = simulationResult.id;

  // Calculate time left from simulation createdAt
  const expiresAt = new Date(simulationResult.createdAt).getTime() + SESSION_HOURS * 60 * 60 * 1000;
  const calcTimeLeft = () => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

  const [messages, setMessages] = useState<Message[]>([buildWelcomeMessage(simulationResult)]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const [isExpired, setIsExpired] = useState(calcTimeLeft() <= 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted messages from DB
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/chat/messages?simulationId=${simulationId}`);
        const data = await res.json() as {
          success: boolean;
          messages: { id: string; role: string; content: string; created_at: string }[];
          isExpired: boolean;
        };
        if (data.success && data.messages.length > 0) {
          const dbMessages: Message[] = data.messages.map(m => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.created_at,
          }));
          // Always prepend welcome as first visual message
          setMessages([buildWelcomeMessage(simulationResult), ...dbMessages]);
        }
        if (data.isExpired) setIsExpired(true);
      } catch {
        // Failed to load history — show welcome only
      } finally {
        setIsFetchingHistory(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);

  // Countdown timer
  useEffect(() => {
    if (isExpired) return;
    const timer = setInterval(() => {
      const left = calcTimeLeft();
      setTimeLeft(left);
      if (left <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpired]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isFetchingHistory) inputRef.current?.focus();
  }, [isFetchingHistory]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isLoading || isExpired) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: loadingId, role: "assistant", content: "", timestamp: new Date().toISOString(), isLoading: true },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => !m.isLoading && m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, simulationId, simulationResult, history }),
      });

      const data = await res.json() as { success?: boolean; message?: string; error?: string };

      if (data.error === "SESSION_EXPIRED") {
        setIsExpired(true);
        setMessages((prev) => prev.filter((m) => m.id !== loadingId));
        return;
      }

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.success && data.message ? data.message : "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => prev.filter((m) => m.id !== loadingId).concat(assistantMessage));
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.filter((m) => m.id !== loadingId).concat({
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Gagal terhubung ke server. Periksa koneksi Anda.",
          timestamp: new Date().toISOString(),
        })
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLowTime = timeLeft < 3600; // < 1 hour
  const isVeryLowTime = timeLeft < 600; // < 10 minutes

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

  // Only show suggested questions when only welcome message is present (no real history)
  const hasRealMessages = messages.filter(m => m.id !== "welcome" && !m.isLoading).length > 0;

  const isEmbedded = mode === "embedded";

  const content = (
    <motion.div
      initial={isEmbedded ? {} : { opacity: 0, y: 20, scale: 0.97 }}
      animate={isEmbedded ? {} : { opacity: 1, y: 0, scale: 1 }}
      exit={isEmbedded ? {} : { opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`relative flex flex-col bg-[#0c0c0a] border border-white/[0.09] shadow-2xl overflow-hidden ${
        isEmbedded ? "w-full h-full rounded-2xl" : "w-full max-w-2xl rounded-2xl"
      }`}
      style={isEmbedded ? {} : { height: "min(84vh, 700px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/25 to-violet-600/8 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Consultant</h3>
              <p className="text-[11px] text-zinc-600">{simulationResult.cityContext.cityName} · {simulationResult.request.product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Session timer */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
              isExpired
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : isVeryLowTime
                  ? "bg-red-500/8 border border-red-500/15 text-red-400"
                  : isLowTime
                    ? "bg-amber-500/8 border border-amber-500/15 text-amber-400"
                    : "bg-white/[0.04] border border-white/[0.07] text-zinc-500"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTimeLeft(timeLeft)}
            </div>
            {onClose && !isEmbedded && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Loading history indicator */}
          {isFetchingHistory && (
            <div className="flex items-center justify-center py-4 gap-2 text-zinc-600 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Memuat riwayat konsultasi...
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "user"
                  ? "bg-emerald-500/15 border border-emerald-500/20"
                  : "bg-violet-500/15 border border-violet-500/20"
              }`}>
                {msg.role === "user"
                  ? <User className="w-3.5 h-3.5 text-emerald-400" />
                  : <Bot className="w-3.5 h-3.5 text-violet-400" />
                }
              </div>

              {/* Bubble */}
              <div className={`flex flex-col max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-[#021A11] rounded-tr-sm font-medium"
                    : "bg-white/[0.04] border border-white/[0.07] text-zinc-200 rounded-tl-sm"
                }`}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                    </div>
                  ) : (
                    renderContent(msg.content)
                  )}
                </div>
                <span className="text-[10px] text-zinc-700 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Suggested questions */}
          {!isFetchingHistory && !hasRealMessages && !isLoading && !isExpired && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/8 border border-white/[0.07] hover:border-white/15 text-zinc-500 hover:text-zinc-200 text-xs transition-all"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}

          {/* Session expired */}
          <AnimatePresence>
            {isExpired && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-4 px-4 bg-red-500/8 border border-red-500/15 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Sesi konsultasi 24 jam telah berakhir</span>
                </div>
                <p className="text-zinc-600 text-xs text-center">Jalankan simulasi baru untuk melanjutkan konsultasi AI.</p>
                {onClose && !isEmbedded && (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/[0.07] hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Kembali ke Cluster
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] shrink-0">
          <div className="flex gap-2.5 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExpired || isLoading || isFetchingHistory}
              placeholder={isExpired ? "Sesi telah berakhir" : "Tanyakan tentang hasil simulasi..."}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 hover:border-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isExpired || isFetchingHistory}
              className="w-9 h-9 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-700 mt-2">
            {isExpired
              ? "Sesi berakhir · Riwayat chat tersimpan di database"
              : `Sesi aktif ${formatTimeLeft(timeLeft)} lagi · Chat tersimpan otomatis`}
          </p>
        </div>
      </motion.div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      {content}
    </motion.div>
  );
}
