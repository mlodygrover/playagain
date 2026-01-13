import { 
  ShieldCheck, Recycle, Cpu, Activity, 
  Terminal, Server, Globe, Wrench 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-600 selection:text-white pt-24 pb-20">
      
      {/* 1. HERO - MANIFESTO */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-widest">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Mission Log: 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight">
          Nie produkujemy. <br/>
          <span className="text-blue-600">My przywracamy.</span>
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Przemysł technologiczny generuje 50 milionów ton elektrośmieci rocznie. 
          PlayAgain to nasza odpowiedź. Bierzemy topowy sprzęt, który został "skreślony", 
          i przywracamy mu wydajność fabryczną.
        </p>
      </section>

      {/* 2. STATYSTYKI (GRID) */}
      <section className="border-y border-zinc-800 bg-zinc-950/50 mb-24">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          <StatBox 
            label="Zaoszczędzone CO2" 
            value="12,500 kg" 
            desc="Tyle dwutlenku węgla nie trafiło do atmosfery dzięki naszym klientom." 
          />
          <StatBox 
            label="Odnowione Jednostki" 
            value="3,400+" 
            desc="Komputery, które wróciły do gry zamiast trafić na wysypisko." 
          />
          <StatBox 
            label="Średnia Oszczędność" 
            value="35%" 
            desc="Tyle średnio zostaje w kieszeni klienta w porównaniu do nowego sprzętu." 
          />
        </div>
      </section>

      {/* 3. PROCES RENOWACJI (Timeline) */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Protokół Odnowy</h2>
          <p className="text-zinc-500 font-mono text-sm">// JAK ZAPEWNIAMY JAKOŚĆ?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProcessCard 
            number="01" 
            title="Selekcja i Czyszczenie" 
            icon={<Recycle className="w-6 h-6" />}
            text="Sprzęt trafia do myjki ultradźwiękowej. Usuwamy każdy pyłek kurzu z radiatorów i PCB. Wymieniamy pasty termoprzewodzące na Thermal Grizzly."
          />
          <ProcessCard 
            number="02" 
            title="Diagnostyka Hardware" 
            icon={<Activity className="w-6 h-6" />}
            text="Sprawdzamy kondensatory, sekcje zasilania i pamięci VRAM. Używamy profesjonalnych kamer termowizyjnych, by wykryć hotspoty."
          />
          <ProcessCard 
            number="03" 
            title="Stress Testy 24h" 
            icon={<Terminal className="w-6 h-6" />}
            text="Każde GPU i CPU przechodzi 24-godzinną pętlę w benchmarkach (FurMark, Cinebench, OCCT). Jeśli sprzęt ma paść - padnie u nas, nie u Ciebie."
          />
          <ProcessCard 
            number="04" 
            title="Certyfikacja i Bios" 
            icon={<ShieldCheck className="w-6 h-6" />}
            text="Wgrywamy najnowszy stabilny BIOS, ustawiamy krzywe wentylatorów dla ciszy i naklejamy plombę gwarancyjną PlayAgain™."
          />
        </div>
      </section>

      {/* 4. WARTOŚCI (Grid mniejszy) */}
      <section className="max-w-[1600px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ValueCard icon={<Globe className="w-5 h-5 text-blue-500" />} title="Eco-Friendly" />
          <ValueCard icon={<Wrench className="w-5 h-5 text-blue-500" />} title="Serwis Door-to-Door" />
          <ValueCard icon={<Server className="w-5 h-5 text-blue-500" />} title="Wsparcie 24/7" />
          <ValueCard icon={<Cpu className="w-5 h-5 text-blue-500" />} title="Części Premium" />
        </div>
      </section>

    </div>
  );
}

// --- KOMPONENTY POMOCNICZE ---

const StatBox = ({ label, value, desc }: { label: string, value: string, desc: string }) => (
  <div className="p-10 text-center group hover:bg-zinc-900 transition-colors">
    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">{label}</p>
    <p className="text-5xl md:text-6xl font-black text-white mb-4 group-hover:text-blue-500 transition-colors">{value}</p>
    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
  </div>
);

const ProcessCard = ({ number, title, text, icon }: any) => (
  <div className="bg-zinc-900/30 border border-zinc-800 p-8 flex gap-6 hover:border-blue-600/50 transition-colors group">
    <div className="flex-shrink-0 flex flex-col items-center gap-2">
      <span className="text-4xl font-black text-zinc-800 group-hover:text-blue-900 transition-colors">{number}</span>
      <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-blue-400 group-hover:border-blue-500/30">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">
        {text}
      </p>
    </div>
  </div>
);

const ValueCard = ({ icon, title }: any) => (
  <div className="border border-zinc-800 p-6 flex items-center gap-4 bg-black hover:bg-zinc-900 transition-colors">
    {icon}
    <span className="font-bold text-zinc-300 uppercase tracking-wide text-sm">{title}</span>
  </div>
);