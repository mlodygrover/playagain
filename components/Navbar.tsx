"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, ArrowRight, User as UserIcon, LogOut, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-zinc-800 h-18">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group z-50" onClick={closeMenu}>
            {/* ZMIANA: Usunięto div z literą P, wstawiono obrazek */}
            <img 
              src="/logo.svg" 
              alt="PlayAgain Logo" 
              className="w-16 h-16 object-contain" 
            />
            <span className="font-bold text-lg tracking-tight uppercase text-white">
              PlayAgain<span className="text-zinc-600 group-hover:text-blue-500 transition-colors"></span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/konfigurator">Konfigurator </NavLink>
            <NavLink href="/gotowe-konfiguracje">Gotowe Zestawy</NavLink> 
            <NavLink href="/o-nas">O Nas</NavLink>
          </div>

          {/* ACTION ICONS */}
          <div className="flex items-center gap-4 z-50">
             
             {/* ADMIN (DESKTOP) */}
             {isAdmin && (
               <Link 
                 href="/admin" 
                 className="hidden sm:flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors mr-4 border border-red-900/30 bg-red-900/10 px-3 py-1.5 rounded"
               >
                 <ShieldAlert className="w-4 h-4" /> Admin
               </Link>
             )}

             {/* LOGOWANIE / KONTO (Desktop) */}
             {user ? (
               <div className="hidden sm:flex items-center gap-3 mr-2 border-r border-zinc-800 pr-4">
                 <Link 
                    href="/profil" 
                    className="text-right group/profile cursor-pointer"
                    title="Przejdź do profilu"
                 >
                   <span className="block text-[10px] text-zinc-500 uppercase font-bold group-hover/profile:text-blue-500 transition-colors">
                     Zalogowany
                   </span>
                   <span className="block text-xs font-mono text-white font-bold group-hover/profile:text-blue-400 transition-colors">
                     {user.firstName || user.email}
                   </span>
                 </Link>

                 <button 
                   onClick={logout} 
                   title="Wyloguj"
                   className="p-2 hover:bg-zinc-800 rounded-full transition-colors group"
                 >
                   <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
                 </button>
               </div>
             ) : (
               <Link 
                 href="/login" 
                 className="hidden sm:flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors mr-2 border-r border-zinc-800 pr-4"
               >
                 <UserIcon className="w-4 h-4" /> Logowanie
               </Link>
             )}

             {/* KOSZYK */}
             <Link href="/koszyk" className="flex text-xs font-mono text-zinc-400 hover:text-white uppercase transition items-center gap-2 group">
               <ShoppingBag className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
               {items.length > 0 && (
                 <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold animate-in zoom-in">
                   {items.length}
                 </span>
               )}
             </Link>
             
             {/* CTA */}
             <Link 
               href="/konfigurator"
               className="hidden sm:block bg-white text-black text-xs font-bold px-5 py-2 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all skew-x-[-10deg]"
             >
               <span className="skew-x-[10deg] inline-block">Zbuduj PC</span>
             </Link>

             {/* MOBILE HAMBURGER */}
             <button 
                className="md:hidden text-white p-2 hover:bg-zinc-800 rounded transition-colors" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full h-[calc(100vh-64px)] bg-black z-40 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-top-5 duration-300">
          
          {/* Sekcja usera w mobile */}
          <div className="mb-6 pb-6 border-b border-zinc-800">
            {user ? (
               <div className="flex items-center justify-between">
                 <Link href="/profil" onClick={closeMenu} className="group">
                   <p className="text-xs text-zinc-500 uppercase group-hover:text-blue-500 transition-colors">Witaj</p>
                   <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{user.firstName || user.email}</p>
                 </Link>
                 <button onClick={logout} className="text-red-500 text-xs uppercase font-bold border border-zinc-800 px-3 py-2">Wyloguj</button>
               </div>
            ) : (
               <Link href="/login" onClick={closeMenu} className="flex items-center gap-2 text-blue-500 font-bold uppercase">
                 <UserIcon className="w-5 h-5" /> Zaloguj się / Rejestracja
               </Link>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Nawigacja</p>
            
            {/* ADMIN (MOBILE) */}
            {isAdmin && (
              <Link 
                href="/admin" 
                onClick={closeMenu}
                className="text-red-500 font-bold text-lg py-3 flex items-center gap-2 uppercase tracking-wide border-b border-zinc-900 mb-2"
              >
                <ShieldAlert className="w-5 h-5" /> Panel Administratora
              </Link>
            )}

            {user && <MobileLink href="/profil" onClick={closeMenu}>Twój Profil</MobileLink>}
            <MobileLink href="/konfigurator" onClick={closeMenu}>Konfigurator </MobileLink>
            <MobileLink href="/gotowe-konfiguracje" onClick={closeMenu}>Gotowe Zestawy</MobileLink>
            <MobileLink href="/koszyk" onClick={closeMenu}>Twój Koszyk ({items.length})</MobileLink>
          </div>

          <div className="mt-auto mb-8 space-y-4">
            <Link 
               href="/konfigurator"
               onClick={closeMenu}
               className="w-full bg-blue-600 text-white font-bold text-center py-4 uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
             >
               Rozpocznij Konfigurację <ArrowRight className="w-4 h-4" />
             </Link>
          </div>

        </div>
      )}
    </>
  );
}

// Helpers
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