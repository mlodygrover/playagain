import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu, Recycle, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen pt-16">
      
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-zinc-800">
        
        {/* Tło (Siatka + Gradient) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SYSTEM V.2.0 ONLINE
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent animate-in zoom-in duration-700">
            NEXT GEN <br /> REFURBISHED.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Wydajność klasy premium za ułamek ceny. Buduj ekologicznie, graj bez kompromisów. 
            Certyfikowane podzespoły z 24-miesięczną gwarancją.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link 
              href="/konfigurator" 
              className="group relative px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-blue-500 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="flex items-center gap-2">
                Uruchom Konfigurator <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            
            <Link 
              href="/czesci" 
              className="px-8 py-4 border border-zinc-700 text-zinc-300 font-mono text-sm uppercase hover:bg-zinc-900 transition-colors"
            >
              Przeglądaj Części
            </Link>
          </div>
        </div>
      </section>

      {/* STATYSTYKI / TRUST BAR */}
      <div className="border-b border-zinc-800 bg-black">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
          <StatItem label="Gwarancja" value="24 Miesiące" />
          <StatItem label="Oszczędność" value="do 40%" />
          <StatItem label="Dostawa" value="24h" />
          <StatItem label="Eko-Impact" value="-15kg CO2" />
        </div>
      </div>

      {/* DLACZEGO MY (GRID) */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">Standard Jakości</h2>
          <div className="h-1 w-20 bg-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-blue-500" />}
            title="Certyfikat PlayAgain™"
            desc="Każda karta graficzna i procesor przechodzi 3-etapowe testy obciążeniowe (FurMark, Cinebench). Nie sprzedajemy sprzętu, któremu nie ufamy."
          />
          <FeatureCard 
            icon={<Recycle className="w-8 h-8 text-green-500" />}
            title="Technologia Obiegu"
            desc="Dajemy drugie życie topowym podzespołom. To nie tylko oszczędność pieniędzy, ale realny wpływ na redukcję elektrośmieci."
          />
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-purple-500" />}
            title="Profesjonalny Montaż"
            desc="Nie musisz znać się na składaniu. Nasi technicy złożą Twój zestaw, ułożą kable (cable management) i zaktualizują BIOS."
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 border-t border-zinc-800 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6">GOTOWY NA UPGRADE?</h2>
          <p className="text-zinc-400 mb-8">
            Skorzystaj z naszego interaktywnego modelu 3D i zobacz, jak będzie wyglądał Twój nowy setup.
          </p>
          <Link 
            href="/konfigurator"
            className="inline-flex items-center gap-3 text-2xl font-bold text-blue-500 hover:text-white transition-colors group"
          >
            <Zap className="w-8 h-8 group-hover:text-yellow-400 transition-colors" />
            <span>WEJDŹ DO KONFIGURATORA</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
      
      {/* STOPKA */}
      <footer className="border-t border-zinc-800 py-12 text-center text-zinc-600 text-sm font-mono">
        <p>&copy; 2026 PlayAgain.tech. All Systems Operational.</p>
      </footer>

    </main>
  );
}

// Pomocnicze komponenty
const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="p-8 text-center hover:bg-zinc-900/50 transition-colors">
    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl md:text-3xl font-bold text-white font-mono">{value}</p>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 border border-zinc-800 bg-zinc-950 hover:border-blue-500/50 transition-colors group">
    <div className="mb-6 bg-zinc-900 w-16 h-16 flex items-center justify-center rounded-sm group-hover:bg-blue-900/20 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-zinc-200 group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-sm">
      {desc}
    </p>
  </div>
);