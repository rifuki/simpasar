import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCities } from "../../hooks/useSimulation";
import { CATEGORY_LABELS, formatRupiahFull } from "../../lib/utils";
import type { SimulationRequest } from "@shared/types";

const schema = z.object({
  productName: z.string().min(1, "Nama produk wajib diisi").max(100),
  category: z.enum([
    "fnb_beverage", "fnb_food", "fashion",
    "beauty", "electronics", "services", "other",
  ]),
  description: z.string().min(10, "Minimal 10 karakter").max(500),
  price: z.number().int().min(1000, "Harga minimal Rp 1.000").max(100_000_000),
  priceUnit: z.enum(["per_piece", "per_cup", "per_portion", "per_kg"]),
  targetCity: z.enum(["malang", "bandung", "surabaya", "yogyakarta", "semarang"]),
  additionalContext: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (req: SimulationRequest) => void;
  isLoading: boolean;
}

const PRICE_UNITS = [
  { value: "per_cup", label: "per cup" },
  { value: "per_piece", label: "per buah" },
  { value: "per_portion", label: "per porsi" },
  { value: "per_kg", label: "per kg" },
];

export function SimulationForm({ onSubmit, isLoading }: Props) {
  const { data: cities } = useCities();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "fnb_beverage",
      priceUnit: "per_cup",
      targetCity: "malang",
    },
  });

  const price = watch("price");

  const onValid: SubmitHandler<FormValues> = (values) => {
    const req: SimulationRequest = {
      product: {
        name: values.productName,
        category: values.category,
        description: values.description,
        price: values.price,
        priceUnit: values.priceUnit,
      },
      targetCity: values.targetCity,
      additionalContext: values.additionalContext,
      tier: "free",
    };
    onSubmit(req);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onValid)}
      className="space-y-6"
    >
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Nama Produk
        </label>
        <input
          {...register("productName")}
          placeholder="contoh: Matcha Latte, Baju Batik Modern, Kursus Excel"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
        {errors.productName && (
          <p className="text-red-400 text-xs mt-1">{errors.productName.message}</p>
        )}
      </div>

      {/* Category + Price Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Kategori
          </label>
          <select
            {...register("category")}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Satuan Harga
          </label>
          <select
            {...register("priceUnit")}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          >
            {PRICE_UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Harga
          {price > 0 && (
            <span className="ml-2 text-emerald-400 font-normal">
              {formatRupiahFull(price)}
            </span>
          )}
        </label>
        <input
          {...register("price", { valueAsNumber: true })}
          type="number"
          placeholder="contoh: 45000"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
        {errors.price && (
          <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Deskripsi Singkat
        </label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Jelaskan produkmu: bahan, keunggulan, target konsumen..."
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
        />
        {errors.description && (
          <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Target City */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Kota Target
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(cities ?? []).map((city) => (
            <label key={city.id} className="cursor-pointer">
              <input
                type="radio"
                value={city.id}
                {...register("targetCity")}
                className="sr-only"
              />
              <div className={`text-center py-2.5 px-1 rounded-xl border text-sm font-medium transition
                ${watch("targetCity") === city.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500"
                }`}
              >
                {city.name}
              </div>
            </label>
          ))}
        </div>
        {errors.targetCity && (
          <p className="text-red-400 text-xs mt-1">{errors.targetCity.message}</p>
        )}
      </div>

      {/* Additional Context (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Konteks Tambahan{" "}
          <span className="text-slate-500 font-normal">(opsional)</span>
        </label>
        <input
          {...register("additionalContext")}
          placeholder="contoh: akan dijual di food court mall, target anak muda"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-all
          bg-emerald-500 hover:bg-emerald-400 text-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        {isLoading ? "Menjalankan Simulasi..." : (
          <>Jalankan Simulasi <ArrowRight className="w-5 h-5" /></>
        )}
      </button>
    </motion.form>
  );
}
