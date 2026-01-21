import Link from "next/link";
import React from "react";
import {
  ArrowRight, ShieldCheck, Cpu, Recycle, Zap,
  Settings2, PackageCheck, Wrench, Wand2, Coins, MonitorCheck, Hammer
} from "lucide-react";
import { FeaturedSlider } from "@/components/FeaturedSlider";

// --- API URL ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

// Pobieranie danych po stronie serwera
async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/api/prebuilts`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.slice(0, 6);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function LandingPage() {
  const featuredPCs = await getFeaturedProducts();

  // --- SCHEMA FAQ (Dla Google) ---
  // Treść musi pokrywać się z sekcją wizualną poniżej
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Czy muszę składać komputer samodzielnie, czy mogę kupić gotowy zestaw?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wybór należy do Ciebie! Oferujemy szeroką gamę sprawdzonych, gotowych konfiguracji PC ('Gotowe Zestawy'), które są złożone, przetestowane i gotowe do wysyłki. To opcja Plug & Play – wyjmujesz z pudełka, podłączasz i grasz."
        }
      },
      {
        "@type": "Question",
        "name": "Podoba mi się gotowy zestaw, ale chcę zmienić kartę graficzną. Czy to możliwe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, to nasza unikalna funkcja! Każdy gotowy zestaw w PlayAgain możesz traktować jako bazę. Wystarczy kliknąć przycisk 'Modyfikuj', aby wejść do konfiguratora. Możesz tam wymienić dowolną część, a nasz asystent kompatybilności sprawdzi, czy wszystko do siebie pasuje."
        }
      },
      {
        "@type": "Question",
        "name": "Czy używany komputer gamingowy (refurbished) jest bezpieczny?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, często bezpieczniejszy niż używany sprzęt z aukcji internetowych. W PlayAgain każdy komputer przechodzi rygorystyczne, 24-godzinne testy obciążeniowe. Wymieniamy pasty termoprzewodzące, aktualizujemy BIOS i dajemy pełną, 24-miesięczną gwarancję na cały zestaw."
        }
      },
      {
        "@type": "Question",
        "name": "Ile trwa realizacja zamówienia na komputer z konfiguratora?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Mimo że każdy komputer składamy indywidualnie pod Twoje zamówienie, działamy szybko. Standardowy czas realizacji to 2-4 dni robocze. W tym czasie kompletujemy części, profesjonalnie montujemy zestaw, wykonujemy stress-testy i bezpiecznie pakujemy sprzęt do wysyłki."
        }
      },
      {
        "@type": "Question",
        "name": "Co oznacza technologia 'Obiegu Zamkniętego'?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To nasze podejście pro-ekologiczne. Zamiast produkować nowe elektrośmieci, przywracamy do życia topowe podzespoły, które wciąż oferują potężną wydajność. Dzięki temu Ty oszczędzasz do 40% ceny, a my wspólnie redukujemy ślad węglowy o kilkanaście kilogramów na każdym zestawie."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen pt-16 bg-black text-white selection:bg-blue-600 selection:text-white overflow-x-hidden w-full">
      
      {/* Wstrzyknięcie Schema FAQ tylko na tej podstronie */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
            ODNOWIONE KOMPUTERY<br /><span className="text-blue-600">  GAMINGOWE</span>
          </h1>
          <p className="sr-only">Define Your Performance - PlayAgain Store</p>

          <p className="text-base md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 px-2">
            Zbuduj wymarzonego PC w <strong>konfiguratorze 3D</strong>, wybierz gotowy zestaw lub ulepsz swoją maszynę.
            <strong className="text-white font-medium"> PLAYAGAIN</strong> – wydajność bez kompromisów.
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

      {/* 3. FEATURED BUILDS */}
      <section className="py-16 md:py-24 border-b border-zinc-800 bg-zinc-900/20 w-full overflow-hidden">
        <FeaturedSlider products={featuredPCs} />
      </section>

      {/* --- NOWA SEKCJA SEO: JAK DZIAŁA KONFIGURATOR --- */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-[1600px] mx-auto border-b border-zinc-800 bg-black relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-16 max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6">
              Rewolucyjny <span className="text-blue-600">Konfigurator PC</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
              PlayAgain to nie tylko sklep. To zaawansowane narzędzie do <strong>składania komputera online</strong>, które łączy wydajność części używanych z bezpieczeństwem i gwarancją. Zobacz, jak w 4 krokach stworzysz swoją maszynę.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <StepCard
              number="01"
              icon={<Settings2 />}
              title="Pełna Personalizacja 3D"
              desc="Nasz konfigurator komputera 3D pozwala Ci zobaczyć każdy element. Wybierasz obudowę, kartę graficzną, procesor i chłodzenie w czasie rzeczywistym."
            />
            <StepCard
              number="02"
              icon={<Wand2 className="text-purple-500" />}
              title="Asystent AI"
              desc="Nie znasz się na częściach? Nasz Asystent AI automatycznie dobierze kompatybilne podzespoły i zasugeruje najlepszą wydajność w Twoim budżecie."
            />
            <StepCard
              number="03"
              icon={<Coins className="text-yellow-500" />}
              title="Ceny Live"
              desc="Składanie PC z podglądem ceny na żywo. Widzisz, ile kosztuje każda część i ile oszczędzasz wybierając certyfikowane podzespoły używane."
            />
            <StepCard
              number="04"
              icon={<Hammer className="text-blue-500" />}
              title="Profesjonalny Montaż"
              desc="Ty konfigurujesz, my składamy. Każdy komputer gamingowy przechodzi 24-godzinne testy obciążeniowe przed wysyłką."
            />
          </div>

          {/* Blok tekstowy SEO */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-12 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Dlaczego warto wybrać nasz konfigurator komputerów?</h3>
            <div className="prose prose-invert prose-zinc max-w-none grid grid-cols-1 md:grid-cols-2 gap-8 text-sm md:text-base leading-relaxed">
              <div>
                <p>
                  Rynek sprzętu komputerowego zmienia się dynamicznie, a ceny nowych kart graficznych potrafią przyprawić o zawrót głowy. Nasz <strong>konfigurator PC</strong> to odpowiedź na potrzeby graczy, którzy szukają maksymalnej wydajności bez przepłacania. Dzięki wykorzystaniu <strong className="text-white">części używanych (refurbished)</strong>, jesteśmy w stanie zaoferować zestawy komputerowe tańsze nawet o 40% względem nowych odpowiedników, zachowując przy tym pełną, 24-miesięczną gwarancję.
                </p>
                <p className="mt-4">
                  <strong>Składanie komputera</strong> w PlayAgain jest intuicyjne. Nie musisz martwić się o to, czy procesor będzie pasował do płyty głównej. Nasz system, wspierany przez sztuczną inteligencję, blokuje niekompatybilne połączenia. To najbezpieczniejszy sposób na <strong>tani komputer gamingowy</strong>, który poradzi sobie z najnowszymi tytułami AAA.
                </p>
              </div>
              <div>
                <p>
                  W przeciwieństwie do aukcji internetowych, u nas nie kupujesz "kota w worku". Każda część – od procesora Intel/AMD po karty RTX – przechodzi rygorystyczne testy w naszym laboratorium w Poznaniu. <strong>Konfigurator zestawów komputerowych</strong> PlayAgain daje Ci wolność wyboru, ale zdejmuje z Ciebie ryzyko awarii.
                </p>
                <p className="mt-4">
                  Oferujemy również gotowe zestawy, ale to właśnie własna konfiguracja daje najwięcej satysfakcji. Sprawdź nasz <strong>kreator PC</strong>, zobacz jak zmienia się cena w czasie rzeczywistym (Live Pricing) i zamów maszynę złożoną przez profesjonalistów. Dołącz do rewolucji Circular Economy w gamingu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DLACZEGO WARTO */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
              Technologia <br /> <span className="text-blue-600">Obiegu Zamkniętego.</span>
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
            {/* Tutaj też można użyć next/image w przyszłości */}
            <div className="absolute inset-0 flex items-center justify-center bg-[url('/assembly-bg.jpg')] bg-cover bg-center opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
              <Wrench className="w-16 h-16 md:w-24 md:h-24 text-zinc-700 mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-white">Lab Serwisowy</h3>
              <p className="text-zinc-400 text-sm">Poznań, Polska</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION - SEO BOOSTER */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black uppercase text-white mb-4">Pytania i Odpowiedzi</h2>
          <p className="text-zinc-400">Wszystko, co musisz wiedzieć o zakupach w PlayAgain.</p>
        </div>

        <div className="space-y-4">
          <FaqItem
            question="Czy muszę składać komputer samodzielnie, czy mogę kupić gotowy zestaw?"
            answer="Wybór należy do Ciebie! Oferujemy szeroką gamę sprawdzonych, gotowych konfiguracji PC ('Gotowe Zestawy'), które są złożone, przetestowane i gotowe do wysyłki. To opcja Plug & Play – wyjmujesz z pudełka, podłączasz i grasz. Nie musisz znać się na podzespołach, by mieć świetny sprzęt."
          />
          <FaqItem
            question="Podoba mi się gotowy zestaw, ale chcę zmienić kartę graficzną. Czy to możliwe?"
            answer="Tak, to nasza unikalna funkcja! Każdy gotowy zestaw w PlayAgain możesz traktować jako bazę. Wystarczy kliknąć przycisk 'Modyfikuj', aby wejść do konfiguratora. Możesz tam wymienić dowolną część (np. dołożyć więcej RAMu, zmienić obudowę lub wybrać mocniejsze GPU), a nasz asystent kompatybilności sprawdzi, czy wszystko do siebie pasuje."
          />
          <FaqItem
            question="Czy używany komputer gamingowy (refurbished) jest bezpieczny?"
            answer="Tak, często bezpieczniejszy niż używany sprzęt z aukcji internetowych. W PlayAgain każdy komputer przechodzi rygorystyczne, 24-godzinne testy obciążeniowe. Wymieniamy pasty termoprzewodzące, aktualizujemy BIOS i dajemy pełną, 24-miesięczną gwarancję na cały zestaw."
          />
          <FaqItem
            question="Ile trwa realizacja zamówienia na komputer z konfiguratora?"
            answer="Mimo że każdy komputer składamy indywidualnie pod Twoje zamówienie, działamy szybko. Standardowy czas realizacji to 2-4 dni robocze. W tym czasie kompletujemy części, profesjonalnie montujemy zestaw, wykonujemy stress-testy i bezpiecznie pakujemy sprzęt do wysyłki."
          />
          <FaqItem
            question="Co oznacza technologia 'Obiegu Zamkniętego'?"
            answer="To nasze podejście pro-ekologiczne. Zamiast produkować nowe elektrośmieci, przywracamy do życia topowe podzespoły, które wciąż oferują potężną wydajność. Dzięki temu Ty oszczędzasz do 40% ceny, a my wspólnie redukujemy ślad węglowy o kilkanaście kilogramów na każdym zestawie."
          />
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
        <p>&copy; 2026 PlayAgain. Designed for gamers, engineered for planet.</p>
      </footer>
    </main>
  );
}

// --- KOMPONENTY POMOCNICZE (Server Components) ---

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

// Nowy komponent dla kroków konfiguratora
function StepCard({ number, icon, title, desc }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-black border border-zinc-800 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <span className="text-4xl font-black text-zinc-800 select-none">{number}</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
// Wklej to na samym dole pliku app/page.tsx, pod ostatnim nawiasem klamrowym "}"

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
      <details className="group">
        <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-white hover:text-blue-500 transition-colors select-none">
          <span>{question}</span>
          <span className="transition-transform duration-300 group-open:rotate-180">
            {/* Prosta strzałka SVG, żeby nie musieć importować dodatkowych ikon */}
            <svg 
              fill="none" 
              height="24" 
              shapeRendering="geometricPrecision" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              viewBox="0 0 24 24" 
              width="24"
            >
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </span>
        </summary>
        <div className="px-6 pb-6 text-sm text-zinc-400 leading-relaxed animate-in slide-in-from-top-2 duration-200">
          {answer}
        </div>
      </details>
    </div>
  );
}