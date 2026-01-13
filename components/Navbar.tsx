"use client";

import Link from "next/link";
import { Zap, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black group-hover:bg-white transition-colors">
            P
          </div>
          <span className="font-bold text-lg tracking-tight uppercase text-white">
            PlayAgain<span className="text-zinc-600 group-hover:text-blue-500 transition-colors">.tech</span>
          </span>
        </Link>

        {/* LINKI (DESKTOP) */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/konfigurator">Konfigurator 3D</NavLink>
          <NavLink href="/czesci">Podzespoły</NavLink>
          <NavLink href="/gwarancja">O Nas</NavLink>
        </div>

        {/* KOSZYK / CTA */}
        <div className="flex items-center gap-4">
           <button className="hidden sm:flex text-xs font-mono text-zinc-400 hover:text-white uppercase transition items-center gap-2">
             <ShoppingBag className="w-4 h-4" />
             <span className="bg-blue-600/20 text-blue-500 px-1.5 rounded">0</span>
           </button>
           
           <Link 
             href="/konfigurator"
             className="bg-white text-black text-xs font-bold px-5 py-2 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all skew-x-[-10deg]"
           >
             <span className="skew-x-[10deg] inline-block">Zbuduj PC</span>
           </Link>

           {/* Mobile Menu Toggle */}
           <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <Menu />
           </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 p-4 flex flex-col gap-4">
          <MobileLink href="/konfigurator">Konfigurator</MobileLink>
          <MobileLink href="/czesci">Części</MobileLink>
          <MobileLink href="/gwarancja">Gwarancja</MobileLink>
        </div>
      )}
    </nav>
  );
}

// Pomocnicze komponenty linków
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-xs font-mono text-zinc-400 hover:text-blue-500 uppercase tracking-widest transition-colors">
    {children}
  </Link>
);

const MobileLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-sm font-bold text-white py-2 border-b border-zinc-800 block">
    {children}
  </Link>
);