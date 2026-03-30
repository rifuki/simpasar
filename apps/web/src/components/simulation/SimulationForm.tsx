import { useState, useRef, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Search, Check } from "lucide-react";
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
  targetCities: z.array(z.string()).min(1, "Pilih minimal 1 kota"),
  additionalContext: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (reqs: SimulationRequest[]) => void;
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
  const [citySearch, setCitySearch] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "fnb_beverage",
      priceUnit: "per_cup",
      targetCities: ["malang"],
    },
  });

  const price = watch("price");
  const targetCities = watch("targetCities") || [];

  const onValid: SubmitHandler<FormValues> = (values) => {
    // Return array of requests, one for each city
    const requests = values.targetCities.map(cityId => ({
      product: {
        name: values.productName,
        category: values.category as SimulationRequest['product']['category'],
        description: values.description,
        price: values.price,
        priceUnit: values.priceUnit as SimulationRequest['product']['priceUnit'],
      },
      targetCity: cityId,
      additionalContext: values.additionalContext,
      tier: "free" as const,
    }));
    onSubmit(requests);
  };

  // Click outside to close city dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCity = (cityId: string) => {
    if (targetCities.includes(cityId)) {
      setValue("targetCities", targetCities.filter(id => id !== cityId), { shouldValidate: true });
    } else {
      setValue("targetCities", [...targetCities, cityId], { shouldValidate: true });
    }
    setCitySearch('');
  };

  const removeCity = (cityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("targetCities", targetCities.filter(id => id !== cityId), { shouldValidate: true });
  };

  const filteredCities = (cities || []).filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onValid)}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="bg-slate-800/20 rounded-2xl p-6 border border-slate-700/50 shadow-xl space-y-5">
        
        {/* Row 1: Product Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 focus-within:text-emerald-400 transition-colors">
              Nama Produk
            </label>
            <input
              {...register("productName")}
              placeholder="Matcha Latte, Baju Batik..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {errors.productName && <p className="text-red-400 text-xs mt-1.5">{errors.productName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 focus-within:text-emerald-400 transition-colors">
              Kategori
            </label>
            <select
              {...register("category")}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-slate-800">{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Price & Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex justify-between focus-within:text-emerald-400 transition-colors">
              <span>Harga Jual</span>
              {price > 0 && <span className="text-emerald-400 font-medium text-xs">{formatRupiahFull(price)}</span>}
            </label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              placeholder="45000"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {errors.price && <p className="text-red-400 text-xs mt-1.5">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 focus-within:text-emerald-400 transition-colors">
              Satuan Harga
            </label>
            <select
              {...register("priceUnit")}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              {PRICE_UNITS.map((u) => (
                <option key={u.value} value={u.value} className="bg-slate-800">{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Target Cities (Multi-select with Badges) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Kota Target (Bisa pilih lebih dari satu)
            <span className="ml-2 text-xs text-slate-500">({targetCities.length} kota = {targetCities.length} Credit)</span>
          </label>
          
          <div 
            className={`min-h-[50px] w-full bg-slate-900/50 border rounded-xl flex flex-wrap items-center gap-2 p-2 transition-all cursor-text
              ${isCityDropdownOpen ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700 hover:border-slate-600'}`}
            onClick={() => setIsCityDropdownOpen(true)}
          >
            <AnimatePresence>
              {targetCities.map((cityId) => {
                const city = cities?.find(c => c.id === cityId);
                if (!city) return null;
                return (
                  <motion.div
                    key={cityId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg text-sm border border-emerald-500/30 font-medium"
                  >
                    {city.name}
                    <button
                      type="button"
                      onClick={(e) => removeCity(cityId, e)}
                      className="text-emerald-400 hover:text-emerald-100 transition p-0.5 rounded outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            <div className="flex-1 flex items-center gap-2 min-w-[120px]">
              <Search className="w-4 h-4 text-slate-500 ml-2" />
              <input
                type="text"
                placeholder={targetCities.length === 0 ? "Ketik nama kota..." : ""}
                value={citySearch}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setIsCityDropdownOpen(true);
                }}
                className="w-full bg-transparent border-none text-white focus:outline-none placeholder-slate-500 text-sm py-1"
              />
            </div>
          </div>
          {errors.targetCities && <p className="text-red-400 text-xs mt-1.5">{errors.targetCities.message}</p>}

          {/* Dropdown Options */}
          <AnimatePresence>
            {isCityDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-20 top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2"
              >
                {filteredCities.length === 0 ? (
                  <div className="px-4 py-3 text-slate-400 text-sm text-center">Kota tidak ditemukan</div>
                ) : (
                  filteredCities.map((city) => {
                    const isSelected = targetCities.includes(city.id);
                    return (
                      <div
                        key={city.id}
                        onClick={() => toggleCity(city.id)}
                        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition
                          ${isSelected ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-200 hover:bg-slate-700/50'}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{city.name}</span>
                          <span className="text-xs opacity-60">{city.province} • Tier {city.tier}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 4: Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 focus-within:text-emerald-400 transition-colors">
            Deskripsi Singkat Keunggulan
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Jelaskan produkmu: bahan, manfaat utama, target konsumen..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1.5">{errors.description.message}</p>}
        </div>

        {/* Row 5: Additional Context */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 focus-within:text-emerald-400 transition-colors">
            Konteks Spesifik (Opsional)
          </label>
          <input
            {...register("additionalContext")}
            placeholder="contoh: dijual di food court kampus, atau jualan online Instagram"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 hover:border-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || targetCities.length === 0}
          className="group relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all
            bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none overflow-hidden"
        >
          {isLoading ? "Memproses..." : (
            <>
              Simulasikan {targetCities.length} Kota
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
          {/* Subtle shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>
    </motion.form>
  );
}
