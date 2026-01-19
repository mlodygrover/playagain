"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, ShieldCheck, Cpu, Recycle, Zap, 
  Settings2, PackageCheck, Wrench, ShoppingBag, 
  ChevronLeft, ChevronRight, MonitorPlay 
} from "lucide-react";

// --- API URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function LandingPage() {
  const [featuredPCs, setFeaturedPCs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pobieranie 4-5 przykładowych zestawów na stronę główną
  useEffect(() => {
    fetch(`${API_URL}/api/prebuilts`)
      .then(res => res.json())
      .then(data => setFeaturedPCs(data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen pt-16 bg-black text-white selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center border-b border-zinc-800 overflow-hidden">
        {/* Tło dynamiczne */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-60 animate-pulse-slow" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            PlayAgain.tech V.2.0
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600 animate-in zoom-in duration-1000">
            DEFINE YOUR <br /> <span className="text-blue-600">PERFORMANCE.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Zbuduj wymarzonego PC w konfiguratorze 3D, wybierz gotowy zestaw lub ulepsz swoją maszynę. 
            <strong className="text-white"> Premium Refurbished</strong> – wydajność bez kompromisów.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link 
              href="/konfigurator" 
              className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-all overflow-hidden skew-x-[-10deg]"
            >
              <div className="absolute inset-0 w-2 bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="flex items-center gap-3 skew-x-[10deg]">
                <Zap className="w-5 h-5" /> Zbuduj PC
              </span>
            </Link>
            
            <Link 
              href="/gotowe-konfiguracje" 
              className="px-10 py-5 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all skew-x-[-10deg]"
            >
              <span className="inline-block skew-x-[10deg]">Gotowe Zestawy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR PATH (3 KAFLE) */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Możliwości</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Wybierz swoją ścieżkę</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* KAFEL 1: CUSTOM */}
          <PathCard 
            href="/konfigurator"
            icon={<Settings2 className="w-12 h-12 text-blue-500" />}
            title="Custom Build 3D"
            desc="Pełna kontrola. Wybierz każdą część w naszym interaktywnym konfiguratorze. Zobacz swój komputer zanim go zamówisz."
            label="Skonfiguruj"
          />
          {/* KAFEL 2: PREBUILT */}
          <PathCard 
            href="/gotowe-konfiguracje"
            icon={<PackageCheck className="w-12 h-12 text-purple-500" />}
            title="Gotowe Zestawy"
            desc="Sprawdzone konfiguracje przez naszych ekspertów. Plug & Play. Wyjmujesz z pudełka i grasz."
            label="Zobacz Zestawy"
            highlight
          />
          {/* KAFEL 3: UPGRADE (na razie linkuje do części) */}
          <PathCard 
            href="/gotowe-konfiguracje"
            icon={<Wrench className="w-12 h-12 text-green-500" />}
            title="Baza Modyfikacji"
            desc="Każdy nasz gotowy zestaw możesz edytować. Podoba Ci się 'Cyber Starter', ale chcesz lepsze GPU? Jedno kliknięcie."
            label="Modyfikuj"
          />
        </div>
      </section>

      {/* 3. FEATURED BUILDS (SLIDER) */}
      <section className="py-24 border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Bestsellery</h2>
              <p className="text-zinc-400">Najczęściej wybierane konfiguracje w tym tygodniu.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronLeft /></button>
              <button onClick={() => scroll('right')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronRight /></button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredPCs.length > 0 ? featuredPCs.map((pc) => (
              <div key={pc._id} className="min-w-[300px] md:min-w-[400px] snap-center bg-black border border-zinc-800 hover:border-blue-600/50 transition-all group relative">
                <div className="aspect-[4/3] bg-zinc-900 flex items-center justify-center p-8 relative overflow-hidden">
                  {pc.image ? (
                    <img src={pc.image} alt={pc.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <MonitorPlay className="w-20 h-20 text-zinc-800" />
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                    {pc.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 truncate">{pc.name}</h3>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-4 mt-4">
                    <span className="text-2xl font-black text-white">{pc.price} PLN</span>
                    <Link href={`/gotowe-konfiguracje/${pc._id}`} className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1">
                      Szczegóły <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="w-full text-center text-zinc-500 py-10">Ładowanie zestawów...</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. DLACZEGO WARTO (GRID ICONS) */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
              Technologia <br/> <span className="text-blue-600">Obiegu Zamkniętego.</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Kupując u nas, nie tylko oszczędzasz do 40% ceny rynkowej. Otrzymujesz sprzęt klasy premium, który został profesjonalnie odnowiony, przetestowany i objęty pełną gwarancją.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureItem icon={<ShieldCheck className="text-blue-500" />} title="Gwarancja 24m" desc="Pełna ochrona jak przy nowym sprzęcie." />
              <FeatureItem icon={<Recycle className="text-green-500" />} title="Eco-Friendly" desc="Redukcja elektrośmieci o 15kg na zestaw." />
              <FeatureItem icon={<Cpu className="text-purple-500" />} title="Stress Tests" desc="24h testów obciążeniowych (GPU/CPU)." />
              <FeatureItem icon={<Zap className="text-yellow-500" />} title="Ready to Play" desc="Windows, sterowniki i BIOS zaktualizowane." />
            </div>
          </div>
          
          <div className="relative h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
            {/* Tutaj można wstawić duże zdjęcie z montażu */}
            <div className="absolute inset-0 flex items-center justify-center bg-[url('/assembly-bg.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
               <Wrench className="w-24 h-24 text-zinc-700 mb-4" />
               <h3 className="text-2xl font-bold text-white">Lab Serwisowy</h3>
               <p className="text-zinc-400">Poznań, Polska</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA FOOTER */}
      <section className="py-24 border-t border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">Zacznij Swoją Historię</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/konfigurator" 
              className="px-12 py-5 bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
            >
              Stwórz Własny PC
            </Link>
            <Link 
              href="/gotowe-konfiguracje" 
              className="px-12 py-5 border border-zinc-700 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Kup Gotowca
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 text-xs font-mono">
        <p>&copy; 2026 PlayAgain.tech. Designed for gamers, engineered for planet.</p>
      </footer>
    </main>
  );
}

// --- KOMPONENTY POMOCNICZE ---

function PathCard({ href, icon, title, desc, label, highlight }: any) {
  return (
    <Link href={href} className={`block p-8 border ${highlight ? 'border-blue-600 bg-blue-900/10' : 'border-zinc-800 bg-zinc-900/30'} hover:border-zinc-500 transition-all group h-full flex flex-col`}>
      <div className="mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3 uppercase">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">{desc}</p>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors">
        {label} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
      </div>
    </Link>
  );
}

function FeatureItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-lg flex-shrink-0">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <h4 className="font-bold text-white uppercase text-sm mb-1">{title}</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}