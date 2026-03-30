import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/adminApi";
import { Link } from "react-router-dom";
import { Users, Map, BarChart2, Zap, ArrowUpRight } from "lucide-react";

export function AdminDashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin_stats"],
    queryFn: () => adminApi.stats.get(),
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard PasarSim</h1>
        <p className="text-slate-400">Ringkasan data dan aktivitas platform</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">
          Loading stats...
        </div>
      ) : isError ? (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 rounded-xl mb-6">
          Gagal mengambil data statistik. Pastikan backend berjalan dan API Key benar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Personas"
            value={stats?.totalPersonas || 0}
            icon={<Users size={24} />}
            linkTo="/admin/personas"
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <StatCard
            title="Total Kota"
            value={stats?.totalCities || 0}
            icon={<Map size={24} />}
            linkTo="/admin/cities"
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            title="Total Simulasi"
            value={stats?.totalSimulations || 0}
            icon={<BarChart2 size={24} />}
            linkTo="/admin/simulations"
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
          <StatCard
            title="Simulasi Hari Ini"
            value={stats?.todaySimulations || 0}
            icon={<Zap size={24} />}
            linkTo="/admin/simulations"
            color="text-orange-400"
            bg="bg-orange-500/10"
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  linkTo,
  color,
  bg
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  linkTo: string;
  color: string;
  bg: string;
}) {
  return (
    <Link 
      to={linkTo} 
      className="bg-[#12121a] border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-black/50 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          {icon}
        </div>
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors"><ArrowUpRight size={20} /></div>
      </div>
      <div>
        <div className="text-slate-400 text-sm font-medium mb-1">{title}</div>
        <div className="text-3xl font-bold text-white">{value.toLocaleString("id-ID")}</div>
      </div>
    </Link>
  );
}
