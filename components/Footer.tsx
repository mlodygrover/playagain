"use client";

import Link from "next/link";
import {
  ArrowRight,
  Twitter,
  Instagram,
  Mail,
  ExternalLink,
  MapPin,
  Building2
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 pt-16 pb-8" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Stopka serwisu PlayAgain Store</h2>

      <div className="max-w-[1600px] mx-auto px-6">

        {/* RZĄD GÓRNY: LOGO & KETELMAN HOLDING (BARDZO WYEKSPONOWANY) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* 1. MARKA I LOGO */}
          <div className="space-y-6 flex flex-col justify-center">
            <Link href="/" className="block w-fit opacity-90 hover:opacity-100 transition-opacity" aria-label="Strona główna PlayAgain">
              <img
                src="/logo3.svg"
                alt="PlayAgain Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Wierzymy w rewolucję rynku używanej elektroniki. Projektujemy wydajne <strong>komputery gamingowe</strong> w oparciu o technologię obiegu zamkniętego.
              Maksymalizujemy wydajność, minimalizujemy cenę.
            </p>

            <div className="flex gap-4 pt-2">
              <SocialIcon href="https://twitter.com/playagainstore" label="Twitter" icon={<Twitter className="w-4 h-4" />} />
              <SocialIcon href="https://instagram.com/playagainstore" label="Instagram" icon={<Instagram className="w-4 h-4" />} />
            </div>
          </div>

          {/* 2. KETELMAN HOLDING (PEŁNA SZEROKOŚĆ PRAWEJ STRONY) */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-mono font-bold">Holding</p>
              <div className="opacity-90 group-hover:opacity-100 transition-opacity">
                <img
                  src="/ketelman.svg"
                  alt="Ketelman Holding Logo"
                  className="h-12 w-auto object-contain mx-auto md:mx-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="hidden text-3xl font-black text-white uppercase tracking-tighter italic">Ketelman<span className="font-light not-italic">Holding</span></span>
              </div>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                PlayAgain jest dumną częścią ekosystemu <strong>Ketelman Holding</strong>.
                Wspólnie budujemy przyszłość zrównoważonej technologii.
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono text-center md:text-left">Pozostałe projekty</p>
              <ExternalProjectLink href="https://ketelman.com" name="Ketelman.com" />
              <ExternalProjectLink href="https://draftngo.com" name="DraftnGo.com" />
            </div>
          </div>
        </div>

        {/* RZĄD DOLNY: NAWIGACJA & KONTAKT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-zinc-800 pb-12">

          {/* 3. NAWIGACJA */}
          <div className="flex flex-col justify-start">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-8 border-l-2 border-blue-600 pl-4">/ Sklep & Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ul className="space-y-3">
                <FooterLink href="/konfigurator" highlight>Konfigurator PC 3D</FooterLink>
                <FooterLink href="/gotowe-konfiguracje">Gotowe Zestawy</FooterLink>
                <FooterLink href="/o-nas">O marce PlayAgain</FooterLink>
              </ul>
              <ul className="space-y-3">
                <FooterLink href="/regulamin">Regulamin</FooterLink>
                <FooterLink href="/regulamin">Polityka prywatności</FooterLink>
                <FooterLink href="/regulamin">Kontakt</FooterLink>
              </ul>
            </div>
          </div>

          {/* 4. KONTAKT I DANE (NAP) */}
          <div itemScope itemType="http://schema.org/Organization">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-8 border-l-2 border-zinc-700 pl-4">/ Biuro & Wsparcie</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Adres */}
              <div className="flex items-start gap-4" itemProp="address" itemScope itemType="http://schema.org/PostalAddress">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-lg shrink-0">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-zinc-300">
                  <span className="font-bold text-white block mb-1" itemProp="name">PlayAgain</span>
                  <span itemProp="addressLocality">Poznań</span>, <span itemProp="addressCountry">Polska</span>
                </div>
              </div>

              {/* Maile */}
              <div className="space-y-4">
                <a href="mailto:kontakt@playagain.com" className="flex items-center gap-3 group">
                  <Mail className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Support</span>
                    <span className="text-sm text-zinc-300 font-mono group-hover:text-blue-400 transition-colors">kontakt@playagain.com</span>
                  </div>
                </a>

                <a href="mailto:info@ketelman.com" className="flex items-center gap-3 group">
                  <Building2 className="w-4 h-4 text-zinc-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-[10px] text-zinc-600 uppercase font-bold tracking-wider">Holding / B2B</span>
                    <span className="text-sm text-zinc-400 font-mono group-hover:text-white transition-colors">wiczynski@ketelman.com</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* STOPKA DOLNA (COPYRIGHT) */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-zinc-600 font-mono uppercase tracking-widest">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} PlayAgain & Ketelman Holding.</p>
            <span className="hidden md:inline text-zinc-800">|</span>
            <div className="flex gap-4">
              <Link href="/polityka-prywatnosci" className="hover:text-zinc-400 transition-colors">Prywatność</Link>
              <Link href="/regulamin" className="hover:text-zinc-400 transition-colors">Regulamin</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-zinc-500">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- KOMPONENTY POMOCNICZE ---

const FooterLink = ({ href, children, highlight }: { href: string; children: React.ReactNode; highlight?: boolean }) => (
  <li>
    <Link
      href={href}
      className={`text-sm flex items-center gap-2 transition-all duration-200 group ${highlight ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
    >
      <ArrowRight className={`w-3 h-3 text-blue-600 transition-transform ${highlight ? 'opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
      {children}
    </Link>
  </li>
);

const ExternalProjectLink = ({ href, name }: { href: string, name: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between bg-black/40 border border-zinc-800/50 hover:border-blue-600/50 p-3 rounded-xl transition-all group"
  >
    <span className="text-zinc-300 font-bold text-xs group-hover:text-white transition-colors uppercase tracking-tight">
      {name}
    </span>
    <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-blue-500 transition-colors" />
  </a>
);

const SocialIcon = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 rounded-lg transition-all shadow-sm"
  >
    {icon}
  </a>
);