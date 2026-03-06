"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Ticket, 
  Timer, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-8 space-y-10 sticky top-0 h-screen", className)}>
      <div className="flex items-center gap-4 px-2">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="font-heading font-black text-2xl tracking-tight">BIP Panel</span>
      </div>

      <nav className="flex-1 space-y-2">
        <SidebarLink 
          href="/dashboard" 
          icon={<LayoutDashboard />} 
          label="Dashboard" 
          active={pathname === "/dashboard" || pathname === "/dashboard/"} 
        />
        <SidebarLink 
          href="/scanner" 
          icon={<Ticket />} 
          label="Scanner" 
          active={pathname === "/scanner" || pathname === "/scanner/"} 
        />
        <SidebarLink 
          href="/admin/doorprize" 
          icon={<Timer />} 
          label="Doorprize" 
          active={pathname.includes("/admin/doorprize")} 
        />
        <SidebarLink 
          href="#" 
          icon={<Settings />} 
          label="Settings" 
          active={pathname === "/settings"} 
        />
      </nav>

      <Button variant="destructive" className="w-full justify-start gap-3 h-14 rounded-2xl">
        <LogOut className="w-5 h-5" />
        Keluar
      </Button>
    </aside>
  );
}

function SidebarLink({ 
  href, 
  icon, 
  label, 
  active = false 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean 
}) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300",
        active 
          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {React.isValidElement<{ className?: string }>(icon) && React.cloneElement(icon, { 
        className: cn("w-5 h-5", icon.props.className) 
      })}
      {label}
    </Link>
  );
}
