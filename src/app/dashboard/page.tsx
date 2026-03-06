"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Timer, Ticket, ShieldCheck, Search, Filter, LayoutDashboard, Settings, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn, formatEventDate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
    checkedIn: 0,
    quotaLeft: 0,
  });
  
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regStatus, setRegStatus] = useState<'open' | 'closed'>('open');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Event for status and quota
      const { data: event } = await supabase.from('events').select('*').single();
      if (event) {
        setRegStatus(event.public_reg_status);
      }

      // 2. Fetch All Guests
      const { data: guestsData, error } = await supabase
        .from('guests')
        .select(`*, checkins(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!guestsData) return;

      setGuests(guestsData);

      // 3. Calculate Stats
      const total = guestsData.length;
      const internal = guestsData.filter(g => g.guest_type === 'internal').length;
      const external = guestsData.filter(g => g.guest_type === 'external').length;
      const checkedIn = guestsData.filter(g => g.checkins && g.checkins.length > 0).length;
      
      setStats({
        total,
        internal,
        external,
        checkedIn,
        quotaLeft: event ? event.external_quota - external : 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegStatus = async () => {
    const newStatus = regStatus === 'open' ? 'closed' : 'open';
    const { error } = await supabase
      .from('events')
      .update({ public_reg_status: newStatus })
      .eq('name', 'Halal Bihalal 2025'); // Adjust key as needed

    if (!error) setRegStatus(newStatus);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredGuests = guests.filter(g => 
    g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.company && g.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-xl">BIP Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/scanner" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Ticket className="w-5 h-5" />
            Scanner
          </Link>
          <Link href="/admin/doorprize" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Timer className="w-5 h-5" />
            Doorprize
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors mt-auto">
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-2">Event Analytics</h1>
            <p className="text-muted-foreground font-medium">Halal Bihalal 2025 & Festival Letto</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="px-4 py-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Public Reg</span>
              <span className={cn(
                "font-bold",
                regStatus === 'open' ? "text-emerald-600" : "text-rose-600"
              )}>
                {regStatus.toUpperCase()}
              </span>
            </div>
            <button 
              onClick={toggleRegStatus}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm",
                regStatus === 'open' ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              )}
            >
              {regStatus === 'open' ? "Tutup Registrasi" : "Buka Registrasi"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard icon={<Users className="text-blue-600" />} label="Total Tamu" value={stats.total} color="blue" />
          <StatsCard icon={<UserCheck className="text-emerald-600" />} label="Hadir (Cek-in)" value={stats.checkedIn} color="emerald" />
          <StatsCard icon={<Ticket className="text-amber-600" />} label="Sisa Kuota" value={stats.quotaLeft} color="amber" />
          <StatsCard icon={<Timer className="text-indigo-600" />} label="Intern / Ekstern" value={`${stats.internal} / ${stats.external}`} color="indigo" />
        </div>

        {/* Table & Filters */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Daftar Tamu Terdaftar</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau perusahaan..." 
                  className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border-none group">
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Tamu</th>
                  <th className="px-8 py-4">Kategori</th>
                  <th className="px-8 py-4">Instansi</th>
                  <th className="px-8 py-4">Sesi Check-in</th>
                  <th className="px-8 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center font-medium animate-pulse">Memuat data tamu...</td></tr>
                ) : filteredGuests.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center font-medium">Tidak ada tamu ditemukan.</td></tr>
                ) : filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{guest.full_name}</p>
                      <p className="text-xs text-slate-400 font-medium">{guest.phone || 'No phone'}</p>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        guest.guest_type === 'internal' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {guest.guest_type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">
                      {guest.company || guest.department || 'Personal'}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        {['siang', 'malam'].map(s => {
                          const hasChecked = guest.checkins?.some((c: any) => c.session_type === s);
                          return (
                            <span key={s} className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md",
                              hasChecked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                            )}>
                              {s.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg transition-colors border-none group-hover:shadow-sm">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", colorMap[color])}>
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-heading font-extrabold">{value}</p>
    </div>
  );
}
