"use client";

import { useState, useEffect, useCallback } from "react";
import { MoveLeft, Trophy, Sparkles, RefreshCcw, PartyPopper, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function DoorprizePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/doorprize/eligible");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCandidates(data.candidates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const startSpin = useCallback(() => {
    if (candidates.length === 0) return;
    
    setSpinning(true);
    setWinner(null);
    setError("");

    // Simulate meaningful spinning duration
    let startTime = Date.now();
    let duration = 3000; // 3 seconds of high-speed random switching

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      setWinner(candidates[randomIndex]);
      
      if (Date.now() - startTime > duration) {
        clearInterval(spinInterval);
        setSpinning(false);
        fireConfetti();
      }
    }, 100);

  }, [candidates]);

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#fbbf24', '#ffffff']
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white min-h-screen">
      {/* Navbar Overlay */}
      <div className="p-8 flex items-center justify-between z-10">
        <Link href="/dashboard" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <MoveLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <PartyPopper className="w-6 h-6 text-amber-400 animate-bounce" />
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">Doorprize Spinner</h1>
        </div>
        <button 
          onClick={fetchCandidates}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          title="Refresh Data"
        >
          <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="max-w-4xl w-full text-center space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-[0.3em]">Siap Untuk Menentukan Pemenang?</h2>
            <div className="inline-flex items-center gap-4 bg-emerald-900/30 px-6 py-2 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="font-medium text-emerald-400">{candidates.length} Peserta Eligible (Internal Malam)</p>
            </div>
          </div>

          {/* Winner Display Area */}
          <div className="relative min-h-[350px] flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            
            {winner ? (
              <div className={cn(
                "relative z-10 w-full animate-in zoom-in-95 fade-in duration-500",
                spinning && "animate-pulse"
              )}>
                <div className="inline-block p-1 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-[3rem]">
                  <div className="bg-slate-900 rounded-[2.9rem] px-12 py-16 lg:px-20 lg:py-24 shadow-2xl space-y-6">
                    <Trophy className={cn(
                      "w-20 h-20 mx-auto transition-all duration-700",
                      spinning ? "text-white/20 scale-90" : "text-amber-400 scale-110 rotate-[15deg] drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                    )} />
                    
                    <div className="space-y-2">
                       <h3 className={cn(
                         "text-5xl lg:text-7xl font-heading font-black tracking-tighter transition-all duration-300",
                         spinning ? "blur-md select-none opacity-50" : "blur-0"
                       )}>
                        {winner.full_name}
                      </h3>
                      <p className={cn(
                        "text-xl lg:text-2xl font-medium text-slate-400 tracking-wide transition-opacity",
                        spinning ? "opacity-0" : "opacity-100"
                      )}>
                        {winner.department || 'General Department'}
                      </p>
                    </div>

                    {!spinning && (
                       <div className="flex items-center justify-center gap-2 pt-8">
                         <Sparkles className="w-5 h-5 text-amber-400" />
                         <span className="text-amber-400 font-bold tracking-widest uppercase text-sm">Winner Selected!</span>
                         <Sparkles className="w-5 h-5 text-amber-400" />
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 border-4 border-dashed border-white/10 rounded-[4rem] text-center space-y-6">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white/20" />
                 </div>
                 <p className="text-white/40 font-medium italic">Tekan Tombol Di Bawah Untuk Mengocok Nama</p>
              </div>
            )}
          </div>

          <div className="pt-12">
            <button 
              disabled={spinning || candidates.length === 0}
              onClick={startSpin}
              className={cn(
                "group relative px-12 py-6 rounded-3xl font-heading font-black text-2xl tracking-widest transition-all duration-300 shadow-2xl",
                spinning 
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600" 
                  : "bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/30 hover:shadow-primary/50"
              )}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity animate-pulse pointer-events-none" />
              {spinning ? "MENGACAK NAMA..." : "AMBIL UNDIAN"}
            </button>
            
            {error && (
              <p className="mt-8 text-rose-500 font-bold italic px-6 text-sm">* {error}</p>
            )}
          </div>
        </div>
      </div>

      <p className="p-8 text-center text-white/20 text-xs font-bold uppercase tracking-[0.5em]">Bharata Group • Doorprize Engine v1.0</p>
    </div>
  );
}
