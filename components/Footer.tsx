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
    <footer className="bg-black border-t border-zinc-800 pt-16 pb-8">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* TOP SECTION: NEWSLETTER & BRAND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 border-b border-zinc-800 pb-12">
          
          {/* Brand Promise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black">
                P
              </div>
              <span className="font-bold text-xl tracking-tight uppercase text-white">
                PlayAgain<span className="text-zinc-600">.tech</span>
              </span>
            </div>
            <p className="text-zinc-400 max-w-md leading-relaxed text-sm">
              Jesteśmy liderem rynku elektroniki odnowionej. 
              Dajemy drugie życie topowym podzespołom, oferując wydajność 
              klasy premium w cenie, która nie niszczy portfela.
            </p>
          </div>

          {/* Newsletter Input */}
          <div className="flex flex-col justify-center">
            <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-widest mb-4">
              // Join the Mainframe
            </h3>
            <div className="flex gap-0">
              <input 
                type="email" 
                placeholder="ENTER_EMAIL_ADDRESS..." 
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-3 w-full focus:outline-none focus:border-blue-600 font-mono text-sm placeholder:text-zinc-600"
              />
              <button className="bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-500 transition-colors flex items-center gap-2">
                SUBMIT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-3 font-mono">
              * Otrzymuj kody rabatowe na pierwsze zakupy. Zero spamu.
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          
          {/* Column 1 */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Sklep</h4>
            <ul className="space-y-3">
              <FooterLink href="/konfigurator">Konfigurator 3D</FooterLink>
              <FooterLink href="/czesci/gpu">Karty Graficzne</FooterLink>
              <FooterLink href="/czesci/cpu">Procesory</FooterLink>
              <FooterLink href="/zestawy">Gotowe Zestawy</FooterLink>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Wsparcie</h4>
            <ul className="space-y-3">
              <FooterLink href="/status">Status Zamówienia</FooterLink>
              <FooterLink href="/gwarancja">Gwarancja 24m</FooterLink>
              <FooterLink href="/zwroty">Zwroty i Reklamacje</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Firma</h4>
            <ul className="space-y-3">
              <FooterLink href="/o-nas">O Nas</FooterLink>
              <FooterLink href="/eko">Ekologia</FooterLink>
              <FooterLink href="/praca">Kariera</FooterLink>
              <FooterLink href="/kontakt">Kontakt B2B</FooterLink>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest mb-6">/ Kontakt</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>
                  ul. Cybernetyki 10<br />
                  02-677 Warszawa, Polska
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:hello@playagain.tech" className="hover:text-white transition">hello@playagain.tech</a>
              </li>
              <li className="pt-2 flex gap-4">
                <SocialIcon icon={<Twitter className="w-5 h-5" />} />
                <SocialIcon icon={<Instagram className="w-5 h-5" />} />
                <SocialIcon icon={<Github className="w-5 h-5" />} />
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-zinc-500 font-mono">
            <p>&copy; 2026 PlayAgain Sp. z o.o.</p>
            <div className="hidden md:block w-px h-3 bg-zinc-800" />
            <Link href="/regulamin" className="hover:text-zinc-300">Regulamin</Link>
            <Link href="/prywatnosc" className="hover:text-zinc-300">Polityka Prywatności</Link>
          </div>

          <div className="flex items-center gap-2">
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

// Pomocniczy komponent Linku
const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link 
      href={href} 
      className="text-sm text-zinc-500 hover:text-white hover:translate-x-1 transition-all duration-200 block"
    >
      {children}
    </Link>
  </li>
);

// Pomocniczy komponent Social
const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
    {icon}
  </a>
);