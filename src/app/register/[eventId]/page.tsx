"use client";

import { useState, use } from "react";
import { MoveLeft, User, Phone, Building, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";

interface RegistrationPageProps {
  params: Promise<{ eventId: string }>;
}

export default function RegistrationPage({ params }: RegistrationPageProps) {
  const router = useRouter();
  const { eventId } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/register/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setGuestId(data.guest_id);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-secondary/5">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 text-center border border-secondary/20 scale-in-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-heading font-bold mb-4">Registrasi Berhasil!</h1>
          <p className="text-muted-foreground mb-8">
            Silakan simpan/screenshot E-Ticket (QR Code) di bawah ini untuk ditukarkan dengan Gelang Konser di venue.
          </p>

          <div className="p-6 bg-white border-2 border-dashed border-primary/30 rounded-3xl mb-8 inline-block mx-auto">
            <QRCode value={guestId} size={200} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
          </div>

          <div className="text-left p-4 bg-secondary/5 rounded-2xl border border-secondary/10 mb-8 space-y-2">
            <p className="text-sm text-muted-foreground">Detail Peserta:</p>
            <p className="font-medium text-lg">{formData.full_name}</p>
            <p className="text-sm font-medium opacity-70">ID: {guestId.split('-')[0].toUpperCase()}</p>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full py-4 px-6 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all mb-4"
          >
            Cetak Tiket / Simpan
          </button>
          
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm font-medium">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-secondary/5">
      <Link href="/" className="fixed top-8 left-8 p-3 rounded-full bg-white shadow-sm border border-secondary/10 hover:shadow-md transition-shadow group">
        <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </Link>
      
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="space-y-4 mb-10 text-center">
          <h1 className="text-4xl font-heading font-extrabold tracking-tight">External Ticketing</h1>
          <p className="text-muted-foreground">Daftarkan diri Anda untuk menghadiri acara malam Halal Bihalal 2025.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl p-8 border border-secondary/10 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 italic">
              * {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Nama Lengkap
            </label>
            <input 
              required
              type="text" 
              placeholder="Masukkan nama sesuai KTP"
              className="w-full h-14 px-5 rounded-2xl border border-input-border bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Nomor WhatsApp
            </label>
            <input 
              required
              type="tel" 
              placeholder="08123456789"
              className="w-full h-14 px-5 rounded-2xl border border-input-border bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" /> Instansi / Perusahaan
            </label>
            <input 
              type="text" 
              placeholder="Ketik 'Personal' jika perorangan"
              className="w-full h-14 px-5 rounded-2xl border border-input-border bg-input-bg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          <button 
            disabled={loading}
            className={cn(
              "w-full h-16 rounded-2xl font-bold text-white text-lg bg-primary shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              loading && "animate-pulse"
            )}
            type="submit"
          >
            {loading ? "Memproses Data..." : "Dapatkan E-Ticket"}
          </button>

          <p className="text-center text-xs text-muted-foreground px-6 mt-4 italic">
            * E-Ticket ini wajib dibawa untuk ditukarkan dengan Gelang Akses di pintu masuk (Open Gate 16:30).
          </p>
        </form>
      </div>
    </div>
  );
}
