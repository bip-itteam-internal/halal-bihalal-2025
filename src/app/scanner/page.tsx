"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { MoveLeft, User, ShieldCheck, Ticket, AlertCircle, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
  const [session, setSession] = useState<'siang' | 'malam'>('siang');
  const [scanning, setScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>("Buka Kamera");
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [braceletGiven, setBraceletGiven] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      setScanning(true);
      setScanningStatus("Menunggu Scaning...");
      setError("");

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Keep scanning...
        }
      );
    } catch (err: any) {
      setError("Gagal mengakses kamera: " + err.message);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setScanning(false);
      setScanningStatus("Scan Selesai");
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

    } catch (err: any) {
      setLastResult({
        success: false,
        message: err.message
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
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <MoveLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-heading font-bold">Event Scanner</h1>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setSession('siang')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              session === 'siang' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Sesi Siang
          </button>
          <button 
            onClick={() => setSession('malam')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              session === 'malam' ? "bg-black text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Sesi Malam
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto p-6 space-y-6">
        
        {/* Scanner Area */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-4 border border-slate-100 overflow-hidden relative">
          <div id="reader" className="w-full aspect-square rounded-[2rem] overflow-hidden bg-slate-900 flex items-center justify-center text-white text-center">
            {!scanning && (
              <div className="p-10 space-y-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                  <QrCode className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Kamera Siap</h2>
                  <p className="text-white/60 text-sm">Pastikan pencahayaan cukup untuk scanning QR Code.</p>
                </div>
                <button 
                  onClick={startScanner}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                >
                  Buka Kamera
                </button>
              </div>
            )}
          </div>

          {scanning && (
            <div className="absolute inset-x-8 bottom-10 z-10">
               <button 
                onClick={stopScanner}
                className="w-full py-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold border border-white/20 hover:bg-white/30 transition-all"
              >
                Batalkan
              </button>
            </div>
          )}
        </div>

        {/* Status Option: Bracelet (Only for Afternoon Session) */}
        {session === 'siang' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold">Distribusi Gelang</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Beri Centang Jika Gelang Diberikan</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={braceletGiven} 
                onChange={(e) => setBraceletGiven(e.target.checked)} 
              />
              <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        )}

        {/* Scan Results Feedback */}
        {lastResult && (
          <div className={cn(
            "rounded-3xl p-6 border-2 animate-in fade-in zoom-in slide-in-from-top-4 duration-300",
            lastResult.success 
              ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
              : "bg-rose-50 border-rose-200 text-rose-900"
          )}>
            <div className="flex gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                lastResult.success ? "bg-emerald-200" : "bg-rose-200"
              )}>
                {lastResult.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-xl">{lastResult.success ? "Check-in Berhasil" : "Gagal Check-in"}</h3>
                <p className="opacity-80 font-medium leading-tight">{lastResult.message}</p>
                
                {lastResult.success && lastResult.guest && (
                  <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-emerald-200/50 space-y-1">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Detail Tamu</p>
                    <p className="font-bold text-lg">{lastResult.guest.full_name}</p>
                    <p className="text-sm opacity-70">Tipe: {lastResult.guest.guest_type.toUpperCase()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-rose-100 text-rose-700 p-4 rounded-2xl flex items-center gap-3 border border-rose-200 font-medium italic text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Static Instructions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100 p-5 rounded-3xl space-y-2 border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-sm">Security Pertama</h4>
            <p className="text-xs text-slate-500 leading-normal italic">Pastikan QR Code berasal dari E-Ticket resmi Halal Bihalal 2025.</p>
          </div>
          <div className="bg-slate-100 p-5 rounded-3xl space-y-2 border border-slate-200">
            <User className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-sm">Verifikasi Data</h4>
            <p className="text-xs text-slate-500 leading-normal italic">Cek tipe tamu (Internal/Eksternal) untuk distribusi akomodasi.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
