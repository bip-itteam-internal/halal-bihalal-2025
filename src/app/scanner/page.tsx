"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  MoveLeft, 
  User, 
  ShieldCheck, 
  Ticket, 
  AlertCircle, 
  CheckCircle2, 
  QrCode 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Guest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Sidebar } from "@/components/layout/sidebar";

interface ScanResult {
  success: boolean;
  message: string;
  guest?: Guest;
}

export default function ScannerPage() {
  const [session, setSession] = useState<'siang' | 'malam'>('siang');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [braceletGiven, setBraceletGiven] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      setScanning(true);
      setError("");

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          handleScan(decodedText);
          stopScanner();
        },
        () => {
          // Keep scanning...
        }
      );
    } catch (err: unknown) {
      setError("Gagal mengakses kamera: " + (err instanceof Error ? err.message : "Error tidak dikenal"));
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  const handleScan = async (guestId: string) => {
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_id: guestId,
          session_type: session,
          bracelet_given: session === 'siang' || session === 'malam' ? braceletGiven : false
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Gagal check-in");
      }

      setLastResult({
        success: true,
        guest: data.guest,
        message: data.message
      });
      
      // Auto reset status feedback after 5 seconds
      setTimeout(() => setLastResult(null), 5000);

    } catch (err: unknown) {
      setLastResult({
        success: false,
        message: err instanceof Error ? err.message : "Gagal check-in"
      });
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-8 h-24 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12">
              <MoveLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-heading font-black tracking-tighter">Event Scanner</h1>
        </div>
        
        <Card className="flex bg-slate-100 p-1.5 rounded-[1.4rem] border-transparent shadow-none">
          <button 
            onClick={() => setSession('siang')}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-sm font-black transition-all uppercase tracking-widest",
              session === 'siang' ? "bg-white text-emerald-600 shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Siang
          </button>
          <button 
            onClick={() => setSession('malam')}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-sm font-black transition-all uppercase tracking-widest",
              session === 'malam' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Malam
          </button>
        </Card>
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Scanner Area */}
        <Card className="overflow-hidden relative p-4 border-none shadow-2xl shadow-slate-200/60 rounded-[3rem]">
          <CardContent className="p-0">
            <div id="reader" className="w-full aspect-square rounded-[2.5rem] overflow-hidden bg-slate-950 flex items-center justify-center text-white text-center">
              {!scanning && (
                <div className="p-12 space-y-8 flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center border border-white/10 ring-8 ring-white/5 animate-pulse">
                    <QrCode className="w-14 h-14" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-heading font-black tracking-tight">Kamera Siap</h2>
                    <p className="text-white/40 font-medium max-w-[250px] mx-auto text-sm leading-relaxed italic">Point your camera at the guest&apos;s QR code to begin check-in.</p>
                  </div>
                  <Button 
                    onClick={startScanner}
                    size="lg"
                    className="rounded-3xl px-12 h-18 text-xl font-black tracking-widest"
                  >
                    Buka Kamera
                  </Button>
                </div>
              )}
            </div>

            {scanning && (
              <div className="absolute inset-x-12 bottom-12 z-10 flex flex-col items-center">
                <Button 
                  variant="glass"
                  onClick={stopScanner}
                  className="w-full h-16 rounded-3xl font-black tracking-widest text-lg"
                >
                  CANCEL SCAN
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Option: Bracelet */}
        <Card className={cn(
          "p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] transition-all",
          braceletGiven ? "bg-amber-500 text-white ring-8 ring-amber-500/10" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center transition-colors",
                braceletGiven ? "bg-white/20" : "bg-amber-100"
              )}>
                <Ticket className={cn("w-8 h-8", braceletGiven ? "text-white" : "text-amber-600")} />
              </div>
              <div>
                <p className="font-heading font-black text-xl tracking-tight">Distribusi Gelang</p>
                <p className={cn(
                  "text-xs font-black uppercase tracking-[0.2em]",
                  braceletGiven ? "text-white/80" : "text-slate-400"
                )}>
                  GELANG DIBERIKAN?
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setBraceletGiven(!braceletGiven)}
              className={cn(
                "w-16 h-9 rounded-full relative transition-all duration-300",
                braceletGiven ? "bg-white" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-1.5 w-6 h-6 rounded-full transition-all duration-300 shadow-sm",
                braceletGiven ? "left-8 bg-amber-500" : "left-1.5 bg-white"
              )} />
            </button>
          </div>
        </Card>

        {/* Scan Results Feedback */}
        {lastResult && (
          <div className={cn(
            "rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in slide-in-from-top-4 duration-500",
            lastResult.success 
              ? "bg-emerald-600 text-white shadow-emerald-200/50" 
              : "bg-rose-600 text-white shadow-rose-200/50"
          )}>
            <div className="flex gap-8">
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner",
                lastResult.success ? "bg-white/20" : "bg-white/20"
              )}>
                {lastResult.success ? <CheckCircle2 className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-3xl tracking-tighter">
                    {lastResult.success ? "BERHASIL!" : "GAGAL!"}
                  </h3>
                  <p className="text-lg font-medium text-white/90 leading-snug">{lastResult.message}</p>
                </div>
                
                {lastResult.success && lastResult.guest && (
                  <Card className="bg-white/10 border-white/10 shadow-none rounded-[2rem] p-6 text-white space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Info Tamu</p>
                    <p className="font-heading font-black text-2xl">{lastResult.guest.full_name}</p>
                    <div className="flex gap-2 pt-2">
                       <Badge variant="glass" className="h-6 text-[10px]">{lastResult.guest.guest_type}</Badge>
                       <Badge variant="glass" className="h-6 text-[10px]">{lastResult.guest.company || 'PERSONAL'}</Badge>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl flex items-center gap-4 border border-rose-100 font-bold italic text-sm shadow-sm animate-in shake-1">
            <AlertCircle className="w-6 h-6 shrink-0" />
            {error}
          </div>
        )}

        {/* Static Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <Card className="p-8 space-y-4 border-none shadow-lg shadow-slate-200/30 rounded-[2.5rem]">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-black text-lg tracking-tight uppercase">Security 1st</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">Pastikan QR Code berasal dari E-Ticket resmi Halal Bihalal 2025.</p>
            </div>
          </Card>
          
          <Card className="p-8 space-y-4 border-none shadow-lg shadow-slate-200/30 rounded-[2.5rem]">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-black text-lg tracking-tight uppercase">Verifikasi</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">Cek tipe tamu (Internal/Eksternal) untuk distribusi akomodasi.</p>
            </div>
          </Card>
        </div>

        </div>
      </div>
    </div>
  );
}
