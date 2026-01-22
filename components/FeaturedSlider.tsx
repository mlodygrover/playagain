"use client";

import Link from "next/link";
import React, { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MonitorPlay } from "lucide-react";
import Image from "next/image";

export function FeaturedSlider({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const cardWidth = current.children[0]?.clientWidth || 400;
      const gap = 24;
      const scrollAmount = direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) {
    return <div className="w-full text-center text-zinc-500 py-10">Brak dostępnych zestawów.</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Bestsellery</h2>
          <p className="text-zinc-400 text-sm md:text-base">Najczęściej wybierane konfiguracje w tym tygodniu.</p>
        </div>
        <div className="flex gap-2 hidden md:flex">
          <button aria-label="Przewiń w lewo" onClick={() => scroll('left')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronLeft /></button>
          <button aria-label="Przewiń w prawo" onClick={() => scroll('right')} className="p-3 border border-zinc-700 hover:bg-white hover:text-black transition-colors rounded-full"><ChevronRight /></button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scroll-smooth px-8 md:px-0 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* DODANO: index do argumentów mapy */}
        {products.map((pc, index) => (
          <article 
            key={pc._id} 
            className="snap-center shrink-0 w-[80vw] sm:w-[350px] md:w-[400px] bg-black border border-zinc-800 hover:border-blue-600/50 transition-all group relative flex flex-col"
          >
            <div className="aspect-square w-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
              {pc.image ? (
                <div className="relative w-full h-full p-6">
                   {/* Optymalizacja obrazu - DODANO priority */}
                   <Image 
                      src={pc.image} 
                      alt={`Komputer gamingowy ${pc.name} - PlayAgain`}
                      fill
                      sizes="(max-width: 768px) 80vw, 400px"
                      className="object-contain group-hover:scale-105 transition-transform duration-500"
                      priority={index === 0} // <--- TO NAPRAWIA BŁĄD LCP
                   />
                </div>
              ) : (
                <MonitorPlay className="w-20 h-20 text-zinc-800" />
              )}
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm shadow-lg z-10">
                {pc.category || "Gaming"}
              </div>
            </div>
            
            <div className="p-5 md:p-6 flex flex-col flex-grow">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 truncate">{pc.name}</h3>
              <div className="flex justify-between items-center border-t border-zinc-800 pt-4 mt-auto">
                <span className="text-xl md:text-2xl font-black text-white">{pc.price} PLN</span>
                <Link href={`/gotowe-konfiguracje/${pc._id}`} className="text-xs font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1 p-2">
                  Szczegóły <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}