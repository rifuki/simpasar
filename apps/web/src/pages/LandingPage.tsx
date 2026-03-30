import { Link } from "react-router-dom";
import { 
  ArrowRight, Activity, Users, CheckCircle, MapPin, BrainCircuit 
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
              PasarSim
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
              className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-full hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all transform hover:scale-105 active:scale-95"
            >
              Coba Sekarang
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
              Validasi Ide Bisnis di Klaster Suburban <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Dalam 1 Menit.
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Memahami dinamika pasar Jabodetabek melalui simulasi AI agent berbasis data psikografi dan demografi nyata secara instan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/app" 
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all"
              >
                Mulai Simulasi Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 opacity-60">
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Gading Serpong</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> BSD City</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Bekasi Timur</span>
              <span className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Depok</span>
            </div>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">65.5 Juta UMKM, Rp 0 Data Lokal.</h2>
            <p className="text-slate-400">Pemilik bisnis membuang ratusan juta membuka cabang hanya bermodalkan "Gut Feel" (insting).</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ProblemCard 
              icon={<Users className="w-8 h-8 text-emerald-400" />}
              title="Hyper-Local Insights"
              desc="Pahami perbedaan perilaku belanja warga BSD yang tech-savvy vs warga Bekasi yang value-oriented."
            />
            <ProblemCard 
              icon={<BrainCircuit className="w-8 h-8 text-cyan-400" />}
              title="Backfire Warnings"
              desc="AI kami mendeteksi potensi 'blunder' pemasaran sebelum kamu menghabiskan budget iklan."
            />
            <ProblemCard 
              icon={<Activity className="w-8 h-8 text-blue-400" />}
              title="Foot Traffic Analysis"
              desc="Estimasi dampak traffic fisik dan digital terhadap konversi penjualan produk kamu."
            />
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="mb-32">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-8">Intelligence Level Baru</h2>
              <div className="space-y-8">
                <Step 
                  num="01" 
                  title="Target Klaster Spesifik" 
                  desc="Pilih dari 4 klaster ekonomi kunci di Jabodetabek dengan karakteristik uni masing-masing."
                />
                <Step 
                  num="02" 
                  title="Deep Persona Simulation" 
                  desc="20+ AI Agent (Mahasiswa UI, Pekerja Jababeka, IRT Gading Serpong) menguji kelayakan hargamu."
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
                    <div className="text-white font-bold text-lg tracking-tight">PasarSim</div>
                    <div className="text-emerald-400 text-sm">Fine Dining di Gading Serpong</div>
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
            <p className="text-slate-400">Riset tingkat enterprise, harga UMKM. Tersedia dalam Pay-As-You-Go maupun langganan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard 
              title="Pay-As-You-Go"
              price="75.000 IDR"
              priceIdr="/ credit (1 Simulasi)"
              features={["1 Credit Simulasi", "Tanpa Langganan", "Akses 4 Klaster Jabodetabek", "Full Sentiment Analysis", "Credit Berlaku 12 Bulan"]}
              buttonText="Beli Credit"
            />
            <PricingCard 
              isPopular
              title="Explorer"
              price="150.000 IDR"
              priceIdr="/ bulan (Berlangganan)"
              features={["3 Simulasi per Bulan", "Prioritas Render < 48 Jam", "Akses 4 Klaster Jabodetabek", "WTP & Backfire Alerts", "Export PDF Insights"]}
              buttonText="Mulai Langganan"
            />
            <PricingCard 
              title="Pro"
              price="750.000 IDR"
              priceIdr="/ bulan (Berlangganan)"
              features={["Unlimited Simulasi", "Prioritas Tertinggi (< 8 Jam)", "Custom Persona Library", "PasarSim API Access", "Dedicated Support Manager"]}
              buttonText="Mulai Pro"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-7xl mx-auto flex py-4 flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-lg font-bold text-white">PasarSim</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 PasarSim. Empowering Local Commerce.</p>
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
      
      <button className={`w-full py-3.5 rounded-xl font-bold transition-all transform active:scale-95 ${
        isPopular 
          ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-black hover:shadow-[0_0_25px_rgba(52,211,153,0.4)]" 
          : "bg-white/5 text-white hover:bg-white/10"
      }`}>
        {buttonText}
      </button>
    </div>
  );
}
