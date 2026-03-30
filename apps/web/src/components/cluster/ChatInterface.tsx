import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Clock, Bot, User, Sparkles, AlertCircle, Loader2 } from "lucide-react";
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
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SESSION_DURATION = 15 * 60; // 15 minutes

const SUGGESTED_QUESTIONS = [
  "Apa strategi terbaik untuk meningkatkan market penetration?",
  "Segment mana yang paling potensial untuk difokuskan?",
  "Bagaimana pricing strategy yang optimal?",
  "Apa risiko terbesar yang perlu diantisipasi?",
];

export function ChatInterface({ simulationResult, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya siap membantu menganalisis hasil simulasi **${simulationResult.request.product.name}** di **${simulationResult.cityContext.cityName}**.\n\nMarket penetration Anda **${simulationResult.summary.marketPenetration}%** dengan confidence score **${simulationResult.summary.confidenceScore}%**. Ada yang ingin Anda tanyakan lebih lanjut?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isLoading || isExpired) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Immediately show user message + typing indicator
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: loadingId, role: "assistant", content: "", timestamp: new Date().toISOString(), isLoading: true },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history (exclude loading indicator)
      const history = messages
        .filter((m) => !m.isLoading)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          simulationResult,
          history,
        }),
      });

      const data = await res.json() as { success?: boolean; message?: string; error?: string };

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.success && data.message
          ? data.message
          : "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date().toISOString(),
      };

      // Replace loading indicator with real response
      setMessages((prev) =>
        prev.filter((m) => m.id !== loadingId).concat(assistantMessage)
      );
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

  const isLowTime = timeLeft < 300;

  // Render markdown-ish bold text
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

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

      {/* Chat Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-2xl flex flex-col bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: "min(82vh, 680px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#111] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Consultant</h3>
              <p className="text-[11px] text-slate-500">{simulationResult.cityContext.cityName} · {simulationResult.request.product.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
              isExpired
                ? "bg-red-500/10 border border-red-500/20 text-red-400"
                : isLowTime
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-white/5 border border-white/10 text-slate-400"
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {isExpired ? "Berakhir" : formatTime(timeLeft)}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
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
                  ? "bg-emerald-500/20 border border-emerald-500/20"
                  : "bg-violet-500/20 border border-violet-500/20"
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
                    : "bg-[#1a1a26] border border-white/8 text-slate-200 rounded-tl-sm"
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
                <span className="text-[10px] text-slate-600 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Suggested questions (only at top, no messages sent yet) */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={isExpired}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-slate-400 hover:text-slate-200 text-xs transition-all disabled:opacity-40"
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
                className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Sesi konsultasi telah berakhir</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-3 border-t border-white/8 bg-[#0d0d14] shrink-0">
          <div className="flex gap-2.5 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExpired || isLoading}
              placeholder={isExpired ? "Sesi telah berakhir" : "Tanyakan tentang hasil simulasi..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 hover:border-white/15 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isExpired}
              className="w-9 h-9 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            Sesi aktif {formatTime(timeLeft)} lagi · Konsultasi berbasis data simulasi Anda
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
