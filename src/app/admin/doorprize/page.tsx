"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  MoveLeft, 
  Trophy, 
  Sparkles, 
  RefreshCcw, 
  PartyPopper, 
  User 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Guest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";

export default function DoorprizePage() {
  const [candidates, setCandidates] = useState<Guest[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Guest | null>(null);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat peserta");
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

    const startTime = Date.now();
    const duration = 3000; 

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
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar className="bg-slate-900 border-white/5 text-white shadow-2xl shadow-black/50" />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Navbar Overlay */}
        <div className="p-10 flex items-center justify-between z-10">
          <Link href="/dashboard">
            <Button variant="glass" size="icon" className="w-14 h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10">
              <MoveLeft className="w-6 h-6 text-white" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center animate-pulse">
              <PartyPopper className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-3xl font-heading font-black tracking-tighter text-white">Luck Engine</h1>
          </div>
          <Button 
            variant="glass" 
            size="icon" 
            className="w-14 h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10"
            onClick={fetchCandidates}
          >
            <RefreshCcw className={cn("w-6 h-6 text-white", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="max-w-4xl w-full text-center space-y-16">
            
            <div className="space-y-6">
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                Ready to find the lucky one?
              </h2>
              <Badge variant="glass" className="h-10 px-6 rounded-full border-emerald-500/20 text-emerald-400 font-black tracking-widest bg-emerald-950/30">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse" />
                {candidates.length} CANDIDATES ELIGIBLE
              </Badge>
            </div>

            {/* Winner Display Area */}
            <div className="relative min-h-[400px] flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-x-0 inset-y-0 bg-primary/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />
              
              {winner ? (
                <div className={cn(
                  "relative z-10 w-full animate-in zoom-in-95 fade-in duration-500",
                  spinning && "animate-pulse"
                )}>
                  <div className="inline-block p-1 bg-gradient-to-tr from-amber-400 via-white to-emerald-400 rounded-[4rem] shadow-[0_0_80px_rgba(5,150,105,0.2)]">
                    <Card className="bg-slate-950 border-none rounded-[3.9rem] px-20 py-24 lg:px-32 lg:py-32 shadow-2xl space-y-10">
                      <CardContent className="p-0 space-y-10">
                        <Trophy className={cn(
                          "w-32 h-32 mx-auto transition-all duration-700",
                          spinning ? "text-white/10 scale-90" : "text-amber-400 scale-110 rotate-[15deg] drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
                        )} />
                        
                        <div className="space-y-4">
                           <h3 className={cn(
                             "text-6xl lg:text-8xl font-heading font-black tracking-tighter text-white transition-all duration-300 leading-none",
                             spinning ? "blur-xl select-none opacity-30 scale-95" : "blur-0"
                           )}>
                            {winner.full_name}
                          </h3>
                          <p className={cn(
                            "text-2xl lg:text-3xl font-black text-emerald-500/60 uppercase tracking-widest transition-opacity duration-500",
                            spinning ? "opacity-0" : "opacity-100"
                          )}>
                            {winner.department || winner.company || 'PARTICIPANT'}
                          </p>
                        </div>

                        {!spinning && (
                           <div className="flex items-center justify-center gap-4 pt-10">
                             <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                             <span className="text-white font-black tracking-[0.3em] uppercase text-sm">WINNER SELECTED!</span>
                             <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                           </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="p-24 border-4 border-dashed border-white/5 rounded-[5rem] text-center space-y-8 bg-white/[0.02]">
                   <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5 ring-8 ring-white/[0.01]">
                      <User className="w-12 h-12 text-white/10" />
                   </div>
                   <p className="text-white/20 font-black uppercase tracking-[0.2em] italic max-w-sm mx-auto leading-relaxed">
                     Tap the draw button below to initiate the randomization engine
                   </p>
                </div>
              )}
            </div>

            <div className="pt-16 pb-20">
              <Button 
                disabled={spinning || candidates.length === 0}
                onClick={startSpin}
                size="lg"
                className={cn(
                  "h-24 px-16 rounded-[2.5rem] font-heading font-black text-4xl tracking-widest transition-all duration-500 shadow-2xl",
                  spinning 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700" 
                    : "bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/40 hover:shadow-primary/60 border-t border-white/20"
                )}
              >
                {spinning ? "RANDOMIZING..." : "DRAW NOW"}
              </Button>
              
              {error && (
                <p className="mt-12 text-rose-500 font-bold italic px-8 text-sm opacity-80 animate-in shake-1">
                  [SYSTEM ERROR] * {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="p-10 text-center text-white/5 text-[10px] font-black uppercase tracking-[1em] mt-auto">
          BIP AUTOMATION • LUCK ENGINE V2.0
        </p>
      </main>
    </div>
  );
}
