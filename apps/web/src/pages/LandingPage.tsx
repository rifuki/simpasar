import { Link } from "react-router-dom";
import { 
  ArrowRight, Activity, Users, CheckCircle, Clock, Wallet, ShieldCheck, 
  MapPin, BrainCircuit 
} from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-slate-300 font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06060a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <Activity className="w-5 h-5 text-black" strokeWidth={2.5} />
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
            <Link 
              to="/app" 
              className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all"
            >
              Mulai Simulasi
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
              <BrainCircuit className="w-4 h-4" /> AI Market Simulation Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Riset Pasar yang Biasanya 50 Juta dan 3 Bulan. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Sekarang 1 Menit.
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Simulasikan respons pasar lokal menggunakan AI agent dari data konsumen nyata (Surabaya, Malang, Bandung, dll), bukan asumsi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/app" 
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all"
              >
                Mulai Simulasi Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 opacity-60">
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Bandung</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Surabaya</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Malang</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Jogjakarta</span>
            </div>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Kenapa 70% Bisnis Baru Gagal?</h2>
            <p className="text-slate-400">Bukan karena produknya jelek. Tapi karena mereka mengandalkan <i>feeling</i>, bukan data.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ProblemCard 
              icon={<Users className="w-8 h-8 text-red-400" />}
              title="Survei Teman Sendiri"
              desc="Teman selalu bilang ide kamu bagus. Data tidak representatif dan bias tinggi."
            />
            <ProblemCard 
              icon={<Wallet className="w-8 h-8 text-orange-400" />}
              title="Konsultan Terlalu Mahal"
              desc="Market research tradisional butuh 50-500 juta. Itu menghabiskan modal awal bisnis kamu."
            />
            <ProblemCard 
              icon={<Clock className="w-8 h-8 text-blue-400" />}
              title="Kehilangan Momentum"
              desc="Riset butuh 3-6 bulan? Momentum pasar keburu hilang atau keduluan kompetitor."
            />
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="mb-32">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-8">3 Langkah Validasi Bisnismu</h2>
              <div className="space-y-8">
                <Step 
                  num="01" 
                  title="Input Parameter Produk" 
                  desc="Masukkan nama produk, harga, kategori, dan deskripsi singkat. Pilih kota target yang ingin disimulasikan."
                />
                <Step 
                  num="02" 
                  title="AI Agent Mensimulasikan Pasar" 
                  desc="30-50 persona konsumen AI (berbasis survei warga lokal) akan menguji dan bereaksi terhadap produk kamu."
                />
                <Step 
                  num="03" 
                  title="Dapatkan Insight Nyata" 
                  desc="Lihat demand, penerimaan harga, proyeksi revenue, dan segmentasi usia/pendapatan dalam 60 detik."
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
                    <div className="text-white font-bold">Simulasi Selesai</div>
                    <div className="text-emerald-400 text-sm">Matcha Latte di Malang</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Market Penetration</span>
                    <span className="text-2xl font-bold text-white">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Est. Revenue / Bulan</span>
                    <span className="text-lg font-bold text-emerald-400">Rp 50M - 80M</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400">Harga Optimal</span>
                    <span className="text-lg font-bold text-white">Rp 22.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Gunakan Solana Pay, Dapatkan Akses Bisnis</h2>
            <p className="text-slate-400">Harga transparan. 1 Credit = 1 Simulasi.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard 
              title="Free Trial"
              price="0 IDRX"
              features={["1 Simulasi Kota", "Insight Basic", "Tanpa Export", "Watermarked"]}
              buttonText="Coba Gratis"
            />
            <PricingCard 
              isPopular
              title="Pro Simulation"
              price="1 Credit"
              priceIdr="150.000 IDRX / prompt"
              features={["Fitur Demografi Lengkap", "Rekapitulasi Harga AI", "Proyeksi Revenue", "Export PDF (Coming Soon)"]}
              buttonText="Beli Credit (Solana Pay)"
            />
            <PricingCard 
              title="Enterprise"
              price="Custom"
              features={["Akses API", "Custom City Agents", "Prioritas Support", "Account Manager"]}
              buttonText="Hubungi Kami"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-7xl mx-auto flex py-4 flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-bold text-white">SimPasar</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 SimPasar. Dibangun tangguh untuk Indonesia.</p>
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
    <div className={`p-8 rounded-3xl border ${isPopular ? "border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.15)] bg-emerald-950/20" : "border-white/10 bg-[#0a0a0f]"} relative flex flex-col`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
          Paling Laris
        </div>
      )}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-extrabold text-white">{price}</span>
      </div>
      {priceIdr && <p className="text-emerald-400 text-sm font-medium mb-6">{priceIdr}</p>}
      {!priceIdr && <div className="h-5 mb-6" />}
      
      <div className="space-y-4 mb-8 flex-1">
        {features.map((f: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            <span className="text-slate-300 text-sm">{f}</span>
          </div>
        ))}
      </div>
      
      <button className={`w-full py-3.5 rounded-xl font-bold transition-all ${isPopular ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-white/5 text-white hover:bg-white/10"}`}>
        {buttonText}
      </button>
    </div>
  );
}
