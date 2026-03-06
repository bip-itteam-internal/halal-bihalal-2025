"use client";

import { useState, use } from "react";
import { 
  MoveLeft, 
  User, 
  Phone, 
  Building, 
  CheckCircle2, 
  Ticket,
  Printer,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface RegistrationPageProps {
  params: Promise<{ eventId: string }>;
}

export default function RegistrationPage({ params }: RegistrationPageProps) {
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 min-h-screen">
        <Card className="max-w-md w-full border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] p-4 animate-in zoom-in-95 fade-in duration-500">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter mb-2">Registration Success!</CardTitle>
            <CardDescription className="text-base font-medium text-slate-400 italic">
              Please save your ticket for check-in at the venue.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-10 px-8">
            <div className="p-8 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-sm">
              <QRCode value={guestId} size={200} viewBox={`0 0 256 256`} className="rounded-2xl" />
            </div>

            <div className="bg-slate-50/80 rounded-[2rem] p-6 border border-slate-100 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guest Name</p>
                <p className="font-heading font-black text-2xl tracking-tight text-slate-900">{formData.full_name}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Badge variant="outline" className="h-6">EXTERNAL</Badge>
                <p className="text-xs font-black text-slate-400 tracking-tighter uppercase font-mono">{guestId.split('-')[0]}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 p-8">
            <Button 
              size="lg" 
              className="w-full h-18 rounded-3xl text-xl font-black tracking-widest shadow-xl shadow-primary/20"
              onClick={() => window.print()}
            >
              <Printer className="w-6 h-6 mr-3" />
              PRINT / SAVE
            </Button>
            
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-400 font-bold hover:text-slate-900">
                Go back to home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 min-h-screen">
      <Link href="/" className="fixed top-10 left-10 z-10">
        <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border-none transition-all hover:scale-110 active:scale-95">
          <MoveLeft className="w-6 h-6" />
        </Button>
      </Link>
      
      <div className="max-w-lg w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="space-y-3 mb-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-heading font-black tracking-tighter text-slate-900">Get Your Ticket</h1>
          <p className="text-slate-400 font-medium text-lg leading-relaxed italic">Festival Letto & Halal Bihalal BIP 2025</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] p-4">
            <CardContent className="space-y-8 p-8">
              {error && (
                <div className="p-5 bg-rose-50 text-rose-600 rounded-[1.5rem] text-sm font-black border border-rose-100 italic flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  * {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <Input 
                  required
                  placeholder="Enter your legal name"
                  className="h-16 px-6 rounded-2xl bg-slate-50 border-transparent shadow-none"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> WhatsApp
                </label>
                <Input 
                  required
                  type="tel"
                  placeholder="08123456789"
                  className="h-16 px-6 rounded-2xl bg-slate-50 border-transparent shadow-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                  <Building className="w-3 h-3" /> Institution / Company
                </label>
                <Input 
                  placeholder="Type 'Personal' if individual"
                  className="h-16 px-6 rounded-2xl bg-slate-50 border-transparent shadow-none"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </CardContent>

            <CardFooter className="p-8 pb-4">
              <Button 
                disabled={loading}
                className={cn(
                  "w-full h-18 rounded-3xl text-xl font-black tracking-widest shadow-2xl transition-all duration-300",
                  loading && "animate-pulse"
                )}
                type="submit"
              >
                {loading ? "PROCESSING..." : "REGISTER NOW"}
              </Button>
            </CardFooter>
            
            <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] pb-8 px-12 leading-relaxed">
              Ticket issued by Bharata International Panel Automation System
            </p>
          </Card>
        </form>
      </div>
    </div>
  );
}
