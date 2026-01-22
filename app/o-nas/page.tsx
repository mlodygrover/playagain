import { 
  ShieldCheck, Recycle, Cpu, Activity, 
  Terminal, Server, Globe, Wrench, Boxes, History, Lightbulb
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-600 selection:text-white pt-24 pb-20">
      
      {/* 1. HERO - MANIFEST MARKI */}
      <section className="max-w-4xl mx-auto px-6 mb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-blue-900/30 bg-blue-950/20 text-xs font-mono text-blue-400 uppercase tracking-widest rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Technologia w obiegu zamkniętym
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight">
          Definiujemy <br/>
          <span className="text-blue-600">wydajność na nowo.</span>
        </h1>
        <div className="space-y-6 text-xl text-zinc-400 leading-relaxed max-w-3xl">
          <p>
            <span className="text-white font-bold">PlayAgain</span> to rzemieślnicza manufaktura komputerowa, która powstała z przekonania, że najwyższa wydajność nie musi oznaczać ciągłej produkcji nowych elektrośmieci. Wierzymy, że najlepszy komputer to taki, który już istnieje, ale potrzebuje inżynierskiej precyzji, by wrócić do gry.
          </p>
          <p>
            Działamy na styku pasji do hardware'u i idei <span className="text-white border-b border-blue-600">Circular Economy</span>. Nie jesteśmy zwykłym sklepem – jesteśmy zespołem, który bierze na warsztat sprawdzone podzespoły klasy premium i przywraca im sprawność fabryczną, często przewyższając standardy rynkowe.
          </p>
        </div>
      </section>

      {/* 2. EKOSYSTEM HOLDINGU */}
      <section className="max-w-[1600px] mx-auto px-6 mb-32">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xs font-mono text-blue-500 uppercase tracking-[0.3em] mb-4">Zaplecze Technologiczne</h2>
            <h3 className="text-3xl md:text-4xl font-black uppercase mb-6 italic">Część ekosystemu Ketelman Holding</h3>
            <p className="text-zinc-400 leading-relaxed mb-8">
              PlayAgain nie funkcjonuje w izolacji. Jako integralna część grupy <span className="text-white font-bold">Ketelman Holding</span>, korzystamy z zaawansowanej infrastruktury diagnostycznej, globalnego zaplecza logistycznego oraz interdyscyplinarnej wiedzy ekspertów IT. To połączenie rzemieślniczej dbałości o detal z bezpieczeństwem i stabilnością dużej grupy kapitałowej.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-800 rounded-xl bg-black/40">
                <span className="block text-white font-bold mb-1 font-mono">Ketelman.com</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Venture Building & Tech</span>
              </div>
              <div className="p-4 border border-zinc-800 rounded-xl bg-black/40">
                <span className="block text-white font-bold mb-1 font-mono">DraftnGo.com</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Sports Analytics</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden group">
             <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay group-hover:bg-transparent transition-colors"></div>
             <Boxes className="w-32 h-32 text-zinc-800 group-hover:text-blue-900 transition-all duration-700" />
             <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-600 uppercase">Holding Infrastructure Access</div>
          </div>
        </div>
      </section>

      {/* 3. FILARY OPERACYJNE */}
      <section className="max-w-5xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Protokół PlayAgain</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>

        <div className="space-y-24">
          <SectionItem 
            icon={<History className="w-12 h-12 text-blue-500" />}
            title="Selekcja Hardware"
            desc="Każdy komponent w naszych zestawach przechodzi rygorystyczną weryfikację. Nie szukamy okazji – szukamy jednostek o udokumentowanej stabilności i potencjale cieplnym, które po procesie renowacji zaoferują wydajność identyczną z nowymi odpowiednikami."
          />
          <SectionItem 
            icon={<Lightbulb className="w-12 h-12 text-yellow-500" />}
            title="Optymalizacja i Modernizacja"
            desc="Przywrócenie sprawności to dopiero początek. W PlayAgain optymalizujemy każdy zestaw: stosujemy markowe pasty o wysokiej przewodności, modernizujemy systemy chłodzenia i aktualizujemy oprogramowanie układowe (BIOS), aby zapewnić maksymalną kulturę pracy."
            reverse
          />
          <SectionItem 
            icon={<ShieldCheck className="w-12 h-12 text-green-500" />}
            title="Standard Gwarancyjny"
            desc="Budujemy markę opartą na zaufaniu. Każdy odnowiony komputer objęty jest pełną, 24-miesięczną gwarancją. Nasz model operacyjny zakłada, że technologia odnowiona (refurbished) musi być równie niezawodna, co fabrycznie nowa."
          />
        </div>
      </section>

      {/* 4. CTA */}
      <section className="max-w-4xl mx-auto px-6 text-center py-20 border-t border-zinc-800">
        <h2 className="text-3xl font-bold mb-6 italic">Gotowy na nową rundę?</h2>
        <p className="text-zinc-500 mb-10">Dołącz do społeczności graczy, którzy stawiają na inteligentną wydajność.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/konfigurator" className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Konfigurator 3D</a>
            <a href="/gotowe-konfiguracje" className="px-10 py-4 border border-zinc-800 font-black uppercase tracking-widest hover:border-white transition-all">Gotowe Zestawy</a>
        </div>
      </section>

    </div>
  );
}

// --- KOMPONENTY POMOCNICZE ---

const SectionItem = ({ icon, title, desc, reverse = false }: any) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 group`}>
    <div className="flex-shrink-0 bg-zinc-900/50 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center border border-zinc-800 group-hover:border-blue-600/50 transition-all duration-500 shadow-2xl">
      {icon}
    </div>
    <div className={reverse ? 'text-right' : 'text-left'}>
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-zinc-400 text-lg leading-relaxed">{desc}</p>
    </div>
  </div>
);