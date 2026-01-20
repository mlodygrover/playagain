"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, ShieldCheck, Cpu, Recycle, Zap, 
  Settings2, PackageCheck, Wrench, ChevronLeft, ChevronRight, MonitorPlay 
} from "lucide-react";

// --- API URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function LandingPage() {
  const [featuredPCs, setFeaturedPCs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/prebuilts`)
      .then(res => res.json())
      .then(data => setFeaturedPCs(data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  // Ulepszona funkcja przewijania - oblicza szerokość karty dynamicznie
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Pobieramy szerokość pierwszej karty, jeśli istnieje, lub domyślnie 400px
      const cardWidth = current.children[0]?.clientWidth || 400;
      const gap = 24; // Odpowiada gap-6 (24px)
      const scrollAmount = direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
      
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen pt-16 bg-black text-white selection:bg-blue-600 selection:text-white overflow-x-hidden w-full">
      
      {/* 1. HERO SECTION */}
      <header className="relative min-h-[85vh] flex flex-col items-center justify-center border-b border-zinc-800 overflow-hidden w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-60 animate-pulse-slow pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto space-y-6 md:space-y-8 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] md:text-xs font-mono uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-ping" />
            PlayAgain V.2.0
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600 animate-in zoom-in duration-1000 leading-[0.9] break-words">
            DEFINE YOUR <br /> <span className="text-blue-600">PERFORMANCE.</span>
          </h1>
          
          <p className="text-base md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 px-2">
            Zbuduj wymarzonego PC w konfiguratorze 3D, wybierz gotowy zestaw lub ulepsz swoją maszynę. 
            <strong className="text-white font-medium"> Premium Refurbished</strong> – wydajność bez kompromisów.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mt-8 w-full px-6 md:px-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link 
              href="/konfigurator" 
              className="w-full sm:w-auto group relative px-8 py-4 md:px-10 md:py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-zinc-200 transition-all overflow-hidden skew-x-0 md:skew-x-[-10deg] text-center"
            >
              <div className="absolute inset-0 w-2 bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="flex items-center justify-center gap-3 md:skew-x-[10deg]">
                <Zap className="w-5 h-5" /> Zbuduj PC
              </span>
            </Link>
            
            <Link 
              href="/gotowe-konfiguracje" 
              className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all skew-x-0 md:skew-x-[-10deg] text-center"
            >
              <span className="inline-block md:skew-x-[10deg]">Gotowe Zestawy</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CHOOSE YOUR PATH */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-xs md:text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Możliwości</h2>
          <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Wybierz swoją ścieżkę</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <PathCard 
            href="/konfigurator"
            icon={<Settings2 className="w-10 h-10 md:w-12 md:h-12 text-blue-500" />}
            title="Custom Build 3D"
            desc="Pełna kontrola. Wybierz każdą część w naszym interaktywnym konfiguratorze."
            label="Skonfiguruj"
          />
          <PathCard 
            href="/gotowe-konfiguracje"
            icon={<PackageCheck className="w-10 h-10 md:w-12 md:h-12 text-purple-500" />}
            title="Gotowe Zestawy"
            desc="Sprawdzone konfiguracje przez naszych ekspertów. Plug & Play."
            label="Zobacz Zestawy"
            highlight
          />
          <PathCard 
            href="/gotowe-konfiguracje"
            icon={<Wrench className="w-10 h-10 md:w-12 md:h-12 text-green-500" />}
            title="Baza Modyfikacji"
            desc="Każdy zestaw możesz edytować. Podoba Ci się 'Cyber Starter', ale chcesz lepsze GPU?"
            label="Modyfikuj"
          />
        </div>
      </section>

      {/* 3. FEATURED BUILDS (SLIDER) - ZMODYFIKOWANA SEKCJA */}
      <section className="py-16 md:py-24 border-b border-zinc-800 bg-zinc-900/20 w-full overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Bestsellery</h2>
              <p className="text-zinc-400 text-sm md:text-base">Najczęściej wybierane konfiguracje w tym tygodniu.</p>
            </div>
            <div className="flex gap-2 hidden md:flex">
              <button aria-label="Przewiń w lewo" onClick={() => scroll('left')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronLeft /></button>
              <button aria-label="Przewiń w prawo" onClick={() => scroll('right')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronRight /></button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            // Zmiany w klasach kontenera:
            // snap-x snap-mandatory -> wymusza zatrzymanie na środku
            // px-8 md:px-0 -> padding pozwala wycentrować skrajne elementy (mobile)
            // scroll-smooth -> płynne przewijanie
            className="flex gap-4 md:gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scroll-smooth px-8 md:px-0 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredPCs.length > 0 ? featuredPCs.map((pc) => (
              <article 
                key={pc._id} 
                // Zmiany w klasach karty:
                // snap-center -> element centruje się w widoku
                // w-[80vw] -> na mobile zajmuje 80% ekranu (dzięki temu widać 10% sąsiada z lewej i 10% z prawej)
                // shrink-0 -> zapobiega ściskaniu
                className="snap-center shrink-0 w-[80vw] sm:w-[350px] md:w-[400px] bg-black border border-zinc-800 hover:border-blue-600/50 transition-all group relative flex flex-col"
              >
                <div className="aspect-square w-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                  {pc.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={pc.image} 
                        alt={`Komputer gamingowy ${pc.name} - PlayAgain`} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <MonitorPlay className="w-20 h-20 text-zinc-800" />
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm shadow-lg z-10">
                    {pc.category}
                  </div>
                </div>
                
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 truncate">{pc.name}</h3>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-4 mt-auto">
                    <span className="text-xl md:text-2xl font-black text-white">{pc.price} PLN</span>
                    <Link href={`/gotowe-konfiguracje/${pc._id}`} className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1 p-2">
                      Szczegóły <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            )) : (
              <div className="w-full text-center text-zinc-500 py-10 animate-pulse">Ładowanie najlepszych zestawów...</div>
            )}
          </div>
        </div>
      </section>

      {/* 4. DLACZEGO WARTO */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
              Technologia <br/> <span className="text-blue-600">Obiegu Zamkniętego.</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 leading-relaxed">
              Oszczędzasz do 40% ceny rynkowej. Otrzymujesz sprzęt klasy premium, profesjonalnie odnowiony, przetestowany i objęty gwarancją.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureItem icon={<ShieldCheck className="text-blue-500" />} title="Gwarancja 24m" desc="Pełna ochrona jak przy nowym sprzęcie." />
              <FeatureItem icon={<Recycle className="text-green-500" />} title="Eco-Friendly" desc="Redukcja elektrośmieci o 15kg na zestaw." />
              <FeatureItem icon={<Cpu className="text-purple-500" />} title="Stress Tests" desc="24h testów obciążeniowych (GPU/CPU)." />
              <FeatureItem icon={<Zap className="text-yellow-500" />} title="Ready to Play" desc="Windows, sterowniki i BIOS zaktualizowane." />
            </div>
          </div>
          
          <div className="relative h-64 sm:h-[400px] lg:h-[500px] w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center bg-[url('/assembly-bg.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
               <Wrench className="w-16 h-16 md:w-24 md:h-24 text-zinc-700 mb-4" />
               <h3 className="text-xl md:text-2xl font-bold text-white">Lab Serwisowy</h3>
               <p className="text-zinc-400 text-sm">Poznań, Polska</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA FOOTER */}
      <section className="py-16 md:py-24 border-t border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-black text-center w-full">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter mb-8">Zacznij Swoją Historię</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
            <Link 
              href="/konfigurator" 
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all rounded-sm"
            >
              Stwórz Własny PC
            </Link>
            <Link 
              href="/gotowe-konfiguracje" 
              className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-5 border border-zinc-700 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm"
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

// --- KOMPONENTY POMOCNICZE (Responywne) ---

function PathCard({ href, icon, title, desc, label, highlight }: any) {
  return (
    <Link href={href} className={`block p-6 md:p-8 border rounded-lg ${highlight ? 'border-blue-600 bg-blue-900/10' : 'border-zinc-800 bg-zinc-900/30'} hover:border-zinc-500 transition-all group h-full flex flex-col`}>
      <div className="mb-4 md:mb-6">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 uppercase">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6 md:mb-8 flex-grow">{desc}</p>
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white group-hover:text-blue-400 transition-colors mt-auto">
        {label} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
      </div>
    </Link>
  );
}

function FeatureItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-lg flex-shrink-0">
        {React.cloneElement(icon, { className: "w-5 h-5 md:w-6 md:h-6" })}
      </div>
      <div>
        <h4 className="font-bold text-white uppercase text-sm mb-1">{title}</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}