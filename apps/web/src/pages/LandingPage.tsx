import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowRight, Activity, Users, CheckCircle, MapPin, BrainCircuit 
} from "lucide-react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { City } from "@shared/types";
import { ParticlesBackground } from "../components/ui/ParticlesBackground";

export function LandingPage() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleSimulateClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/app");
    }, 800); // Dramatic delay for the demo visualization
  };

  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["public-cities"],
    queryFn: async () => {
      const res = await api.get("/cities");
      return res.success ? res.data : [];
    }
  });

  const displayCities = cities.slice(0, 4);
  return (
    <div 
      className="min-h-screen bg-[#06060a] text-slate-300 font-sans selection:bg-emerald-500/30 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition duration-300 opacity-50"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              700px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.08),
              transparent 80%
            )
          `,
        }}
      />
      
      <ParticlesBackground />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06060a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 z-10">
            <div className="w-9 h-9 flex items-center justify-center p-1.5 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
              <img src="/logo.png" alt="SimPasar Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SimPasar
            </span>
          </div>
          
          {/* Middle: Centered Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <a href="#how-it-works" className="text-slate-400 hover:text-white transition">Cara Kerja</a>
            <a href="#pricing" className="text-slate-400 hover:text-white transition">Harga</a>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-4 z-10">
            <Link to="/app">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-colors"
              >
                Coba Sekarang
              </motion.button>
            </Link>
          </div>
          
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
              <BrainCircuit className="w-4 h-4" /> Hyperlocal Market Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Validasi Ide Bisnis di Pasar Hiperlokal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 inline-flex overflow-hidden" aria-label="Sebelum Kamu Buka.">
                {"Sebelum Kamu Buka.".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.1, delay: 0.5 + index * 0.05 }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Memahami dinamika pasar hiperlokal melalui simulasi AI agent berbasis data psikografi dan demografi nyata secara instan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <div className="relative group w-full sm:w-auto">
                {/* Glowing Aura that expands on hover & explodes on click */}
                <div className={`absolute -inset-1 rounded-full blur-md opacity-40 transition-all duration-700 ${
                  isNavigating 
                    ? 'bg-emerald-400 animate-ping opacity-100 scale-150' 
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 group-hover:opacity-100 group-hover:blur-xl'
                }`} />
                
                <motion.button 
                  disabled={isNavigating}
                  onClick={handleSimulateClick}
                  whileHover={!isNavigating ? { scale: 1.05 } : {}}
                  whileTap={!isNavigating ? { scale: 0.9, y: 4, transition: { duration: 0.15 } } : {}}
                  animate={isNavigating ? { scale: [0.9, 1.05, 1.1], opacity: [1, 1, 0] } : {}}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`relative z-10 flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 font-extrabold rounded-full transition-all duration-300 ${
                    isNavigating 
                      ? "bg-emerald-400 text-black shadow-[0_0_50px_rgba(52,211,153,1)]" 
                      : "bg-white text-black hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.6)]"
                  }`}
                >
                  {isNavigating ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-[3px] border-black/20 border-t-black animate-[spin_0.8s_linear_infinite]" />
                      <span className="tracking-widest uppercase text-sm mt-0.5 whitespace-nowrap">
                        Initializing Agent...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg whitespace-nowrap">Mulai Simulasi Sekarang</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 opacity-60">
              {isLoading ? (
                <>
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                </>
              ) : displayCities.length > 0 ? (
                displayCities.map(city => (
                  <span key={city.id} className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4"/> {city.name}
                  </span>
                ))
              ) : (
                <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Berbagai Pasar Terdaftar</span>
              )}
            </div>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">65.5 Juta UMKM, 0 Akses Data Pasar Lokal.</h2>
            <p className="text-slate-400">Pemilik bisnis membuang ratusan juta membuka cabang hanya bermodalkan "Gut Feel" (insting).</p>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ProblemCard
                icon={<Users className="w-8 h-8 text-emerald-400" />}
                title="Hyper-Local Insights"
                desc="Pahami perbedaan perilaku belanja spesifik pada masing-masing area pasar tanpa mengandalkan asumsi umum."
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ProblemCard 
                icon={<BrainCircuit className="w-8 h-8 text-cyan-400" />}
                title="Backfire Warnings"
                desc="AI kami mendeteksi potensi 'blunder' pemasaran sebelum kamu menghabiskan budget iklan."
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ProblemCard 
                icon={<Activity className="w-8 h-8 text-blue-400" />}
                title="Foot Traffic Analysis"
                desc="Estimasi dampak traffic fisik dan digital terhadap konversi penjualan produk kamu."
              />
            </motion.div>
          </motion.div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="mb-32">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-8">Intelligence Level Baru</h2>
              <div className="space-y-8">
                <Step
                  num="01"
                  title="Target Pasar Spesifik"
                  desc="Pilih dari berbagai segmen pasar hiperlokal yang terdaftar dengan karakteristik unik masing-masing."
                />
                <Step
                  num="02"
                  title="Deep Persona Simulation"
                  desc="Puluhan AI Agent dengan profil demografi nyata dari tiap area pasar menguji kelayakan ide dan hargamu."
                />
                <Step 
                  num="03" 
                  title="Willingness-to-Pay Map" 
                  desc="Dapatkan heatmap harga maksimal yang rela dibayar oleh tiap segmen pasar."
                />
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl -z-10 rounded-full" />
              <div className="border border-white/10 rounded-2xl bg-[#0a0a0f] p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg tracking-tight">SimPasar</div>
                    <div className="text-emerald-400 text-sm">Coffee Shop Premium</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Market Sentiment</span>
                    <span className="text-lg font-bold text-emerald-400">Sangat Positif</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Willingness To Pay</span>
                    <span className="text-lg font-bold text-white">Rp 450k - 600k</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Backfire Risk</span>
                    <span className="text-lg font-bold text-red-400">Rendah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight">
              Simulate Before You Open.
            </h2>
            <p className="text-slate-400">Bayar hanya saat kamu butuh. Tanpa langganan, tanpa komitmen.</p>
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="flex justify-center"
          >
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" } } }} className="w-full max-w-sm">
              <PricingCard
                title="Pay-As-You-Go"
                price="300.000 IDR"
                priceIdr="/ credit (1 Simulasi)"
                features={[
                  "1 Credit = 1x Analisis Komprehensif", 
                  "Bebas Pilih Area/Klaster Tersedia", 
                  "Mencakup Sesi Chat AI Evaluasi 12 Jam", 
                  "Laporan Sentimen Pasar & Willingness-To-Pay", 
                  "Kredit Berlaku Selamanya (Tanpa Kedaluwarsa)"
                ]}
                buttonText="Beli Credit"
              />
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-7xl mx-auto flex py-4 flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center p-1 rounded-lg bg-white/5 border border-white/10">
              <img src="/logo.png" alt="SimPasar Logo" className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold text-white opacity-70 group-hover:opacity-100 transition-opacity">SimPasar</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 SimPasar. Empowering Local Commerce.</p>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-[#0a0a0f] text-emerald-400 flex items-center justify-center font-mono font-bold group-hover:bg-emerald-500 group-hover:text-black transition-colors time">
          {num}
        </div>
        <div className="w-px h-full bg-gradient-to-b from-emerald-500/30 to-transparent mt-4" />
      </div>
      <div className="pb-8">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, priceIdr, features, isPopular, buttonText }: any) {
  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 group ${
      isPopular 
        ? "border-emerald-500/50 shadow-[0_0_40px_rgba(52,211,153,0.15)] bg-emerald-950/20 scale-105 z-10" 
        : "border-white/10 bg-[#0a0a0f] hover:border-white/20"
    } relative flex flex-col`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
          Recomended
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-extrabold text-white tracking-tight">{price}</span>
      </div>
      {priceIdr && <p className="text-emerald-400/80 text-xs font-semibold mb-6">{priceIdr}</p>}
      {!priceIdr && <div className="h-5 mb-6" />}
      
      <div className="space-y-4 mb-10 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500/50 mt-0.5 shrink-0" />
            <span className="text-slate-300 text-sm leading-tight">{f}</span>
          </div>
        ))}
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className={`w-full py-3.5 rounded-xl font-bold transition-colors ${
          isPopular 
            ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-black hover:shadow-[0_0_25px_rgba(52,211,153,0.4)]" 
            : "bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        {buttonText}
      </motion.button>
    </div>
  );
}
