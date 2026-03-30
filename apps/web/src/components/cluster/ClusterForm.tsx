import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, MapPin, Users, TrendingUp } from "lucide-react";
import type { Cluster, ClusterSimulationRequest } from "@shared/types";
import { formatRupiahFull } from "../../lib/utils";

const schema = z.object({
  productName: z.string().min(1, "Nama produk wajib diisi").max(100),
  description: z.string().min(10, "Minimal 10 karakter").max(500),
  price: z.number().int().min(1000, "Harga minimal Rp 1.000").max(100_000_000),
  priceUnit: z.enum(["per_piece", "per_cup", "per_portion", "per_kg", "per_session", "per_package"]),
  additionalContext: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

const PRICE_UNITS = [
  { value: "per_cup", label: "per cup" },
  { value: "per_piece", label: "per buah" },
  { value: "per_portion", label: "per porsi" },
  { value: "per_kg", label: "per kg" },
  { value: "per_session", label: "per sesi" },
  { value: "per_package", label: "per paket" },
];

interface ClusterFormProps {
  cluster: Cluster;
  onSubmit: (data: ClusterSimulationRequest) => void;
  onClose: () => void;
  isLoading: boolean;
}

export function ClusterForm({ cluster, onSubmit, onClose, isLoading }: ClusterFormProps) {
  const [step, setStep] = useState<"info" | "form">("info");
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priceUnit: cluster.industry === "services" ? "per_session" : cluster.industry === "fnb" ? "per_cup" : "per_piece",
    },
  });

  const price = watch("price");

  const onValid = (values: FormValues) => {
    const request: ClusterSimulationRequest = {
      product: {
        name: values.productName,
        description: values.description,
        price: values.price,
        priceUnit: values.priceUnit as any,
      },
      clusterId: cluster.id,
      additionalContext: values.additionalContext,
    };
    onSubmit(request);
  };

  const competitionColors = {
    high: "text-red-400 bg-red-500/10 border-red-500/20",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  const marketSizeLabels = {
    large: "Market Besar",
    medium: "Market Sedang",
    small: "Market Kecil",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">{cluster.name}</h2>
            <p className="text-sm text-slate-400">{cluster.industryLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <AnimatePresence mode="wait">
            {step === "info" ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Cluster Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <MapPin className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">{cluster.city}</div>
                    <div className="text-xs text-slate-500">{cluster.province}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <Users className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">{cluster.activePersonas}</div>
                    <div className="text-xs text-slate-500">Active Personas</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                    <div className="text-white font-semibold text-sm">{marketSizeLabels[cluster.marketSize]}</div>
                    <div className="text-xs text-slate-500">Market Size</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Deskripsi Market</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{cluster.description}</p>
                </div>

                {/* Demographics */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Demografi</h3>
                  <p className="text-slate-400 text-sm">{cluster.demographics}</p>
                </div>

                {/* Key Insights */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Key Insights</h3>
                  <div className="space-y-2">
                    {cluster.keyInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-medium shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-400">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Mulai Simulasi
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit(onValid)}
                className="space-y-5"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Kembali ke info cluster
                </button>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nama Produk
                  </label>
                  <input
                    {...register("productName")}
                    placeholder="Contoh: Kopi Susu Gula Aren, Skincare Serum Vitamin C..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  {errors.productName && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.productName.message}</p>
                  )}
                </div>

                {/* Price & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex justify-between">
                      <span>Harga Jual</span>
                      {price > 0 && <span className="text-emerald-400 font-medium text-xs">{formatRupiahFull(price)}</span>}
                    </label>
                    <input
                      {...register("price", { valueAsNumber: true })}
                      type="number"
                      placeholder="45000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    {errors.price && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Satuan Harga
                    </label>
                    <select
                      {...register("priceUnit")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white hover:border-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                    >
                      {PRICE_UNITS.map((u) => (
                        <option key={u.value} value={u.value} className="bg-slate-800">
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Deskripsi Produk
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Jelaskan produkmu: bahan, manfaat, keunggulan, target konsumen..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.description.message}</p>
                  )}
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Konteks Tambahan (Opsional)
                  </label>
                  <input
                    {...register("additionalContext")}
                    placeholder="Contoh: jualan di Instagram, ada booth di event, dll"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Jalankan Simulasi
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
