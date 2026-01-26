"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu, ShoppingBag, Users, BarChart3,
  Settings, ShieldAlert, ArrowRight, Database,
  AlertTriangle, Monitor, // <--- 1. DODANO IKONĘ MONITOR
  RotateCcw
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">Ładowanie panelu...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* NAGŁÓWEK */}
        <div className="mb-12 border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-red-600" />
              Panel Administratora
            </h1>
            <p className="text-zinc-500 mt-2 text-lg">
              Witaj, <span className="text-white font-bold">{user?.firstName || user?.email}</span>.
              Przejmij kontrolę nad sklepem.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs font-mono text-zinc-600 uppercase">System Status</p>
            <p className="text-green-500 font-bold flex items-center gap-2 justify-end">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>

        {/* --- GŁÓWNE SKRÓTY (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">

          {/* 1. BAZA CZĘŚCI */}
          <DashboardCard
            href="/admin/components"
            title="Baza Części (Components)"
            description="Zarządzaj procesorami, kartami graficznymi i innymi podzespołami. Importuj JSON, edytuj ceny i specyfikacje."
            icon={<Cpu className="w-8 h-8 text-blue-500" />}
            color="blue"
            badge="Core"
          />

          {/* --- 2. NOWOŚĆ: GOTOWE ZESTAWY --- */}
          <DashboardCard
            href="/admin/prebuilts"
            title="Gotowe Zestawy (Prebuilts)"
            description="Twórz i edytuj gotowe komputery gamingowe. Przypisuj części z bazy, dodawaj zdjęcia i ustalaj ceny promocyjne."
            icon={<Monitor className="w-8 h-8 text-yellow-500" />}
            color="yellow"
            badge="Storefront"
          />

          {/* 3. ZAMÓWIENIA */}
          <DashboardCard
            href="/admin/orders"
            title="Zamówienia"
            description="Przeglądaj napływające zamówienia, zmieniaj statusy realizacji i sprawdzaj płatności Tpay."
            icon={<ShoppingBag className="w-8 h-8 text-green-500" />}
            color="green"
          />

          {/* 4. UŻYTKOWNICY */}
          <DashboardCard
            href="/admin/users"
            title="Użytkownicy"
            description="Lista zarejestrowanych klientów. Zarządzanie rolami, blokowanie kont i podgląd historii."
            icon={<Users className="w-8 h-8 text-purple-500" />}
            color="purple"
          />

          {/* 5. KONFIGURACJA */}
          <DashboardCard
            href="#"
            title="Ustawienia Sklepu"
            description="Globalne ustawienia marży, konfiguracja API (Allegro, Tpay) i powiadomień mailowych."
            icon={<Settings className="w-8 h-8 text-zinc-400" />}
            color="gray"
            disabled
          />

          {/* 6. RAPORTY */}
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center items-center text-center opacity-50 border-dashed">
            <BarChart3 className="w-12 h-12 text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold uppercase text-zinc-500">Statystyki Sprzedaży</h3>
            <p className="text-zinc-600 text-sm mt-2">Dostępne po zebraniu pierwszych 100 zamówień.</p>
          </div>
          {/* 7. ZWROTY (NOWOŚĆ) */}
          <DashboardCard
            href="/admin/returns"
            title="Obsługa Zwrotów"
            description="Zarządzaj zgłoszonymi zwrotami. Zmieniaj statusy, weryfikuj uzasadnienia i dodawaj notatki administracyjne."
            icon={<RotateCcw className="w-8 h-8 text-orange-500" />}
            color="purple" // Pamiętaj o dodaniu obsługi koloru 'orange' w DashboardCard
            badge="RMA"
          />
        </div>

        {/* --- STATUS --- */}
        <div className="bg-red-950/10 border border-red-900/30 p-6 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-red-400 font-bold uppercase text-sm mb-1">Status Systemu</h4>
            <p className="text-zinc-400 text-sm">
              Pamiętaj, że zmiany w <strong>Bazie Części</strong> oraz <strong>Gotowych Zestawach</strong> są widoczne dla klientów natychmiastowo.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- KOMPONENT KAFELKA ---
interface DashboardCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'gray' | 'yellow';
  badge?: string;
  disabled?: boolean;
}

const DashboardCard = ({ href, title, description, icon, color, badge, disabled }: DashboardCardProps) => {

  // Zaktualizowałem styl yellow, żeby miał też cień (shadow) tak jak inne
  const colorStyles = {
    blue: "group-hover:border-blue-500/50 group-hover:bg-blue-900/10 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]",
    green: "group-hover:border-green-500/50 group-hover:bg-green-900/10 group-hover:shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]",
    purple: "group-hover:border-purple-500/50 group-hover:bg-purple-900/10 group-hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]",
    yellow: "group-hover:border-yellow-500/50 group-hover:bg-yellow-900/10 group-hover:shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]",
    gray: "group-hover:border-zinc-500/50 group-hover:bg-zinc-800/50",
  };

  const Wrapper = disabled ? 'div' : Link;

  return (
    <Wrapper
      href={href}
      className={`
        relative block p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl transition-all duration-300 group overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : colorStyles[color]}
      `}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-black border border-zinc-800 rounded-lg shadow-lg">
          {icon}
        </div>

        {badge && (
          <span className="bg-zinc-800 text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-zinc-700">
            {badge}
          </span>
        )}

        {!disabled && !badge && (
          <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300" />
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-black uppercase mb-2 text-zinc-200 group-hover:text-white transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-${color}-500`} />
    </Wrapper>
  );
};