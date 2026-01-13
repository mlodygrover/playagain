"use client";

import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShoppingBag, Package } from "lucide-react";
import Link from "next/link"; // Upewnij się, że Link jest zaimportowany

export default function CartPage() {
  const { items, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 text-center px-4">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Twój koszyk jest pusty</h1>
        <p className="text-zinc-500 mb-8 max-w-md">
          Wygląda na to, że nie dodałeś jeszcze żadnych podzespołów. Skonfiguruj swój wymarzony komputer.
        </p>
        <Link 
          href="/konfigurator" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 font-bold uppercase tracking-widest transition-all"
        >
          Przejdź do Konfiguratora
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b border-zinc-800 pb-4">
        Twój Koszyk <span className="text-blue-600 text-xl align-top">{items.length}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LISTA PRODUKTÓW */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-zinc-900/30 border border-zinc-800 p-6 flex flex-col sm:flex-row gap-6 group hover:border-zinc-700 transition-colors">
              
              {/* Ikona / Obrazek */}
              <div className="w-20 h-20 bg-black border border-zinc-800 flex items-center justify-center flex-shrink-0">
                {item.type === "custom_build" ? (
                  <Package className="w-8 h-8 text-blue-500" />
                ) : (
                  <img src={item.image || ""} alt="" className="w-full h-full object-cover opacity-80" />
                )}
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-white">{item.name}</h3>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
                      {item.type === "custom_build" ? "Konfiguracja Własna" : "Pojedyncza część"}
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-white">{item.price} PLN</p>
                </div>

                {/* Lista komponentów (jeśli to zestaw PC) */}
                {item.components && (
                  <ul className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                    {item.components.map((comp, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                        {comp}
                      </li>
                    ))}
                  </ul>
                )}

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 mt-auto"
                >
                  <Trash2 className="w-3 h-3" /> Usuń
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PODSUMOWANIE (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 p-6 sticky top-24">
            <h2 className="font-bold text-xl mb-6 uppercase">Podsumowanie</h2>
            
            <div className="space-y-3 mb-6 text-sm text-zinc-400">
              <div className="flex justify-between">
                <span>Wartość produktów</span>
                <span className="text-white font-mono">{totalPrice} PLN</span>
              </div>
              <div className="flex justify-between">
                <span>Dostawa (Kurier)</span>
                <span className="text-green-500 font-mono">0 PLN</span>
              </div>
              <div className="flex justify-between">
                <span>Montaż i Testy</span>
                <span className="text-green-500 font-mono">GRATIS</span>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-white">Do zapłaty</span>
              <span className="text-2xl font-black text-blue-500 font-mono">{totalPrice} PLN</span>
            </div>

            {/* --- ZMIANA: PRZYCISK ZAMIENIONY NA LINK DO /platnosc --- */}
            <Link 
              href="/platnosc"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center block"
            >
              Przejdź do płatności <ArrowRight className="w-4 h-4" />
            </Link>
            
            <p className="text-[10px] text-center text-zinc-600 mt-4">
              Bezpieczne płatności SSL. Gwarancja 24 miesiące.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}