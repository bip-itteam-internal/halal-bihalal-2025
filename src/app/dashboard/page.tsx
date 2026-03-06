"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight,
  UserCheck,
  Ticket,
  Timer
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Guest, Checkin } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/shared/stats-card";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";

interface GuestWithCheckins extends Guest {
  checkins: Checkin[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    internal: 0,
    external: 0,
    checkedIn: 0,
    quotaLeft: 0,
  });
  
  const [guests, setGuests] = useState<GuestWithCheckins[]>([]);
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

      const { data: allGuests, error } = await supabase
        .from('guests')
        .select(`*, checkins(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!allGuests) return;

      setGuests(allGuests as GuestWithCheckins[]);

      // 3. Calculate Stats
      const total = allGuests.length;
      const internal = allGuests.filter(g => g.guest_type === 'internal').length;
      const external = allGuests.filter(g => g.guest_type === 'external').length;
      const checkedIn = allGuests.filter(g => g.checkins && g.checkins.length > 0).length;
      
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
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-heading font-black tracking-tighter mb-3">Event Analytics</h1>
            <p className="text-muted-foreground font-medium text-lg">Halal Bihalal 2025 & Festival Letto</p>
          </div>

          <Card className="flex items-center gap-6 p-3 bg-white pr-6">
            <div className="px-6 py-2 border-r border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Public Reg</span>
              <Badge variant={regStatus === 'open' ? 'success' : 'destructive'} className="h-6">
                {regStatus.toUpperCase()}
              </Badge>
            </div>
            <Button 
              variant={regStatus === 'open' ? 'destructive' : 'primary'}
              size="sm"
              onClick={toggleRegStatus}
              className="h-12 px-6"
            >
              {regStatus === 'open' ? "Tutup Registrasi" : "Buka Registrasi"}
            </Button>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatsCard icon={<Users />} label="Total Tamu" value={stats.total} color="blue" />
          <StatsCard icon={<UserCheck />} label="Hadir (Cek-in)" value={stats.checkedIn} color="emerald" />
          <StatsCard icon={<Ticket />} label="Sisa Kuota" value={stats.quotaLeft} color="amber" />
          <StatsCard icon={<Timer />} label="Intern / Ekstern" value={`${stats.internal} / ${stats.external}`} color="indigo" />
        </div>

        {/* Table & Filters */}
        <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/60 rounded-[3rem]">
          <CardHeader className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <CardTitle className="text-2xl">Daftar Tamu</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama atau perusahaan..." 
                  className="pl-12 w-full md:w-80 h-12 bg-slate-50 border-transparent shadow-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-xl">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-10 py-6">Tamu</TableHead>
                  <TableHead className="px-10 py-6">Kategori</TableHead>
                  <TableHead className="px-10 py-6">Instansi</TableHead>
                  <TableHead className="px-10 py-6">Check-in</TableHead>
                  <TableHead className="px-10 py-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-32 text-center font-bold text-slate-300 animate-pulse text-xl">
                      Diving into data...
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-32 text-center font-medium text-slate-400">
                      Belum ada tamu yang terdaftar.
                    </TableCell>
                  </TableRow>
                ) : filteredGuests.map((guest) => (
                  <TableRow key={guest.id} className="hover:bg-slate-50/30 transition-colors group cursor-pointer">
                    <TableCell className="px-10 py-7">
                      <p className="font-bold text-slate-900 text-lg">{guest.full_name}</p>
                      <p className="text-xs text-slate-400 font-bold tracking-tight">{guest.phone || 'No WhatsApp'}</p>
                    </TableCell>
                    <TableCell className="px-10 py-7">
                      <Badge variant={guest.guest_type === 'internal' ? 'info' : 'purple'}>
                        {guest.guest_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 py-7 text-sm font-bold text-slate-500 uppercase tracking-tight">
                      {guest.company || guest.department || 'Personal'}
                    </TableCell>
                    <TableCell className="px-10 py-7">
                      <div className="flex gap-2">
                        {(['siang', 'malam'] as const).map(s => {
                          const hasChecked = guest.checkins?.some((c: Checkin) => c.session_type === s);
                          return (
                            <Badge key={s} variant={hasChecked ? 'success' : 'outline'} className="rounded-lg h-6 px-2 lowercase font-medium">
                              {s}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-7 text-right">
                      <div className="p-3 hover:bg-white rounded-2xl transition-all group-hover:shadow-md inline-block">
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         </CardContent>
        </Card>
      </main>
    </div>
  );
}
