"use client";

import Link from "next/link";
import { 
  Zap, 
  ArrowRight, 
  Github, 
  Twitter, 
  Instagram, 
  Mail, 
  MapPin, 
  CreditCard 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 pt-16 pb-8" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Stopka serwisu PlayAgain Store</h2>
      
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* TOP SECTION: NEWSLETTER & BRAND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 border-b border-zinc-800 pb-12">
          
          {/* Brand Promise - SEO Rich Text */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 mb-6 group w-fit" aria-label="Strona główna PlayAgain - Używane Komputery Gamingowe">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black group-hover:scale-110 transition-transform">
                P
              </div>
              <span className="font-bold text-xl tracking-tight uppercase text-white">
                PlayAgain<span className="text-zinc-600">.store</span>
              </span>
            </Link>
            
            <p className="text-zinc-400 max-w-md leading-relaxed text-sm">
              <strong>PlayAgain Store</strong> to lider rynku elektroniki odnowionej (refurbished) w Polsce. 
              Dajemy drugie życie topowym podzespołom PC, oferując <strong className="text-zinc-300">wydajne komputery gamingowe</strong> z gwarancją 24 miesiące. 
              Oszczędzaj pieniądze i planetę, wybierając sprzęt używany klasy premium.
            </p>
          </div>

          {/* Newsletter Input */}
          <div className="flex flex-col justify-center">
            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-widest mb-4">
              // Dołącz do społeczności PlayAgain
            </h3>
            <form className="flex gap-0" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Twój adres email..." 
                aria-label="Adres email do newslettera"
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-3 w-full focus:outline-none focus:border-blue-600 font-mono text-sm placeholder:text-zinc-600"
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-500 transition-colors flex items-center gap-2">
                ZAPISZ SIĘ <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-zinc-600 mt-3 font-mono">
              * Otrzymuj informacje o nowych dostawach używanych kart graficznych i promocjach na zestawy PC.
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          
          {/* Column 1 - Sklep */}
          <nav aria-label="Linki do kategorii sklepu">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Sklep PlayAgain</h4>
            <ul className="space-y-3">
              <FooterLink href="/konfigurator" title="Skonfiguruj własny komputer PC">Konfigurator 3D PC</FooterLink>
              <FooterLink href="/czesci/gpu">Używane Karty Graficzne</FooterLink>
              <FooterLink href="/czesci/cpu">Procesory (CPU)</FooterLink>
              <FooterLink href="/gotowe-konfiguracje" title="Sprawdź gotowe zestawy komputerowe">Gotowe Zestawy Gamingowe</FooterLink>
            </ul>
          </nav>

          {/* Column 2 - Wsparcie */}
          <nav aria-label="Linki do wsparcia klienta">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Wsparcie Klienta</h4>
            <ul className="space-y-3">
              <FooterLink href="/status">Status Zamówienia</FooterLink>
              <FooterLink href="/gwarancja" title="Szczegóły gwarancji 24 miesiące">Gwarancja PlayAgain (24m)</FooterLink>
              <FooterLink href="/zwroty">Zwroty i Reklamacje</FooterLink>
              <FooterLink href="/faq">Częste Pytania (FAQ)</FooterLink>
            </ul>
          </nav>

          {/* Column 3 - Firma */}
          <nav aria-label="Informacje o firmie">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ O Marce PlayAgain</h4>
            <ul className="space-y-3">
              <FooterLink href="/o-nas">O Nas</FooterLink>
              <FooterLink href="/eko" title="Nasze podejście do ekologii i refurbished">Ekologia i Refurbished</FooterLink>
              <FooterLink href="/praca">Kariera w IT</FooterLink>
              <FooterLink href="/kontakt" title="Kontakt dla firm B2B">Współpraca B2B</FooterLink>
            </ul>
          </nav>

          {/* Column 4: Contact - Dane teleadresowe (Ważne dla Local SEO) */}
          <address className="not-italic">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Kontakt</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
                <span itemScope itemType="http://schema.org/PostalAddress">
                  <span itemProp="name" className="block text-white font-bold mb-1">PlayAgain Store</span>
                  <span itemProp="streetAddress">ul. Cybernetyki 10</span><br />
                  <span itemProp="postalCode">02-677</span> <span itemProp="addressLocality">Warszawa</span>, <span itemProp="addressCountry">Polska</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
                <a href="mailto:hello@playagain.store" className="hover:text-white transition" title="Napisz do nas">hello@playagain.store</a>
              </li>
              <li className="pt-2 flex gap-4">
                <SocialIcon href="https://twitter.com/playagainstore" label="Twitter PlayAgain" icon={<Twitter className="w-5 h-5" />} />
                <SocialIcon href="https://instagram.com/playagainstore" label="Instagram PlayAgain" icon={<Instagram className="w-5 h-5" />} />
                <SocialIcon href="https://github.com/playagainstore" label="GitHub PlayAgain" icon={<Github className="w-5 h-5" />} />
              </li>
            </ul>
          </address>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-zinc-500 font-mono">
            <p>&copy; {new Date().getFullYear()} PlayAgain Sp. z o.o. - Wszelkie prawa zastrzeżone.</p>
            <div className="hidden md:block w-px h-3 bg-zinc-800" />
            <Link href="/regulamin" className="hover:text-zinc-300">Regulamin Sklepu</Link>
            <Link href="/prywatnosc" className="hover:text-zinc-300">Polityka Prywatności</Link>
          </div>

          <div className="flex items-center gap-2" title="Wszystkie systemy działają poprawnie">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Systems Operational</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

// Pomocniczy komponent Linku (z opcjonalnym title)
const FooterLink = ({ href, children, title }: { href: string; children: React.ReactNode; title?: string }) => (
  <li>
    <Link 
      href={href} 
      title={title}
      className="text-sm text-zinc-500 hover:text-white hover:translate-x-1 transition-all duration-200 block"
    >
      {children}
    </Link>
  </li>
);

// Pomocniczy komponent Social
const SocialIcon = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a 
    href={href} 
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
  >
    {icon}
  </a>
);