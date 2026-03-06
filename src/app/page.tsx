import Link from "next/link";
import { MoveRight, Ticket, UserCheck, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-transparent">
      <div className="max-w-4xl w-full px-6 py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <ShieldCheck className="w-4 h-4" />
          <span>Event Invitation & Check-in System</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Halal Bihalal 2025 <br />
          <span className="text-primary italic">Bharata Group</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Sistem manajemen undangan digital, registrasi mandiri, dan check-in berbasis QR Code untuk event ekosistem Bharata Group.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Link 
            href="/register/halal-bihalal-2025" 
            className="group flex flex-col items-center p-8 rounded-3xl bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <Ticket className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Registrasi Umum</h3>
            <p className="text-sm text-muted-foreground mb-4">Daftar mandiri untuk mendapatkan E-Ticket (Eksternal)</p>
            <span className="inline-flex items-center text-secondary font-medium mt-auto group-hover:translate-x-1 transition-transform">
              Daftar Sekarang <MoveRight className="ml-2 w-4 h-4" />
            </span>
          </Link>

          <Link 
            href="/scanner" 
            className="group flex flex-col items-center p-8 rounded-3xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Scan Check-in</h3>
            <p className="text-sm text-muted-foreground mb-4">Mode Panitia: Registrasi Sesi Siang & Malam</p>
            <span className="inline-flex items-center text-primary font-medium mt-auto group-hover:translate-x-1 transition-transform">
              Mulai Scan <MoveRight className="ml-2 w-4 h-4" />
            </span>
          </Link>

          <Link 
            href="/dashboard" 
            className="group flex flex-col items-center p-8 rounded-3xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all duration-300 hover:scale-105 active:scale-95 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-foreground/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">Kelola Event, Tamu, dan Doorprize Internal</p>
            <span className="inline-flex items-center text-foreground font-medium mt-auto group-hover:translate-x-1 transition-transform">
              Buka Panel <MoveRight className="ml-2 w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
