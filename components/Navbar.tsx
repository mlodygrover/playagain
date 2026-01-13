"use client";

import Link from "next/link";
import { Zap, ShoppingBag, Menu, X, ArrowRight } from "lucide-react"; // Dodałem X i ArrowRight
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Funkcja zamykająca menu po kliknięciu w link
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800 h-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          
          {/* --- LOGO --- */}
          <Link href="/" className="flex items-center gap-3 group z-50" onClick={closeMenu}>
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black group-hover:bg-white transition-colors">
              P
            </div>
            <span className="font-bold text-lg tracking-tight uppercase text-white">
              PlayAgain<span className="text-zinc-600 group-hover:text-blue-500 transition-colors">.tech</span>
            </span>
          </Link>

          {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/konfigurator">Konfigurator 3D</NavLink>
            <NavLink href="/czesci">Podzespoły</NavLink>
            <NavLink href="/o-nas">O Nas</NavLink>
          </div>

          {/* --- ACTIONS (Cart & CTA) --- */}
          <div className="flex items-center gap-4 z-50">
             {/* Koszyk (Widoczny zawsze) */}
             <button className="flex text-xs font-mono text-zinc-400 hover:text-white uppercase transition items-center gap-2">
               <ShoppingBag className="w-5 h-5" />
               <span className="hidden sm:inline bg-blue-600/20 text-blue-500 px-1.5 rounded">0</span>
             </button>
             
             {/* CTA Button (Ukryty na bardzo małych ekranach, żeby nie zasłaniał logo) */}
             <Link 
               href="/konfigurator"
               className="hidden sm:block bg-white text-black text-xs font-bold px-5 py-2 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all skew-x-[-10deg]"
             >
               <span className="skew-x-[10deg] inline-block">Zbuduj PC</span>
             </Link>

             {/* --- HAMBURGER TOGGLE --- */}
             <button 
                className="md:hidden text-white p-2 hover:bg-zinc-800 rounded transition-colors" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
             >
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE FULLSCREEN OVERLAY --- 
          Wyświetla się pod navbarem (top-16) i zajmuje resztę ekranu
      */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full h-[calc(100vh-64px)] bg-black z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-top-5 duration-300">
          
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Menu Nawigacji</p>
            
            <MobileLink href="/konfigurator" onClick={closeMenu}>Konfigurator 3D</MobileLink>
            <MobileLink href="/czesci" onClick={closeMenu}>Podzespoły</MobileLink>
            <MobileLink href="/o-nas" onClick={closeMenu}>O Nas</MobileLink>
            <MobileLink href="/kontakt" onClick={closeMenu}>Kontakt</MobileLink>
          </div>

          <div className="mt-auto mb-8 space-y-4">
            <Link 
               href="/konfigurator"
               onClick={closeMenu}
               className="w-full bg-blue-600 text-white font-bold text-center py-4 uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
             >
               Rozpocznij Konfigurację <ArrowRight className="w-4 h-4" />
             </Link>
             
             <div className="text-center">
                <p className="text-xs text-zinc-600 font-mono">PlayAgain.tech &copy; 2026</p>
             </div>
          </div>

        </div>
      )}
    </>
  );
}

// --- POMOCNICZE KOMPONENTY ---

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-xs font-mono text-zinc-400 hover:text-blue-500 uppercase tracking-widest transition-colors relative group">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
  </Link>
);

const MobileLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="text-2xl font-black text-white py-4 border-b border-zinc-900 hover:text-blue-500 hover:pl-2 transition-all flex justify-between items-center group"
  >
    {children}
    <ArrowRight className="w-5 h-5 text-zinc-800 group-hover:text-blue-500 transition-colors" />
  </Link>
);