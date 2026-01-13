"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Cpu, 
  MemoryStick, 
  Fan, 
  Box, 
  Check, 
  Zap, 
  MonitorPlay, 
  ShoppingBag, 
  PackageOpen, 
  Plus, 
  Minus, // Dodano ikonę minusa
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";

// --- 1. IMPORT SCENY 3D ---
const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-900 border border-zinc-800">
      <div className="text-blue-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        [INITIALIZING 3D ENGINE...]
      </div>
    </div>
  ),
});

// --- 2. DANE (MOCK) ---
const CATEGORIES = [
  {
    id: "gpu",
    name: "Karta Graficzna",
    icon: <MonitorPlay className="w-4 h-4" />,
    items: [
      { id: "gpu-1", name: "NVIDIA RTX 3060 12GB", price: 1200, specs: ["12GB VRAM", "Ray Tracing"], image: "/parts/gpu-1.png" },
      { id: "gpu-2", name: "NVIDIA RTX 4070 Ti", price: 3400, specs: ["12GB GDDR6X", "DLSS 3.0"], image: null },
      { id: "gpu-3", name: "AMD Radeon RX 6600", price: 900, specs: ["8GB GDDR6", "Eco Mode"], image: null },
    ]
  },
  {
    id: "cpu",
    name: "Procesor",
    icon: <Cpu className="w-4 h-4" />,
    items: [
      { id: "cpu-1", name: "Intel Core i5-12400F", price: 600, specs: ["6 Cores", "LGA1700"], image: null },
      { id: "cpu-2", name: "Intel Core i9-13900K", price: 2500, specs: ["24 Cores", "5.8 GHz"], image: null },
    ]
  },
  {
    id: "ram",
    name: "Pamięć RAM",
    icon: <MemoryStick className="w-4 h-4" />,
    items: [
      { id: "ram-1", name: "Kingston Fury 16GB", price: 200, specs: ["DDR4", "3200MHz"], image: null },
      { id: "ram-2", name: "Corsair Vengeance 32GB", price: 450, specs: ["DDR5", "RGB"], image: null },
    ]
  },
  {
    id: "cool",
    name: "Chłodzenie CPU",
    icon: <Fan className="w-4 h-4" />,
    items: [
      { id: "cool-1", name: "SilentiumPC Fera 5", price: 120, specs: ["Air Cooler", "120mm"], image: null },
      { id: "cool-2", name: "NZXT Kraken 240", price: 600, specs: ["AIO Liquid", "LCD Display"], image: null },
    ]
  },
   {
    id: "case",
    name: "Obudowa PC",
    icon: <Box className="w-4 h-4" />,
    items: [
      { id: "case-1", name: "NZXT H5 Flow", price: 400, specs: ["ATX", "Tempered Glass"], image: null },
      { id: "case-2", name: "SilentiumPC Ventum", price: 250, specs: ["ATX", "Mesh Front"], image: null },
    ]
  },
];

// --- 3. KOMPONENTY UI ---

// Karta Produktu - Zmodyfikowana: Szybki przycisk akcji w nagłówku
const ProductTile = ({ item, isSelected, isExpanded, onToggleExpand, onSelect }: any) => (
  <div 
    className={`
      relative w-full border-b last:border-b-0 border-zinc-800 transition-all duration-200 group
      ${isExpanded ? "bg-zinc-900" : "hover:bg-zinc-900/40 bg-black"}
    `}
  >
    {/* NAGŁÓWEK */}
    <div 
      onClick={onToggleExpand}
      className="flex items-center justify-between p-4 cursor-pointer gap-3 sm:gap-4"
    >
      {/* Pasek statusu po lewej */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? "bg-blue-600" : "bg-transparent group-hover:bg-zinc-700"}`} />

      {/* Nazwa i Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 pl-2 flex-grow min-w-0">
        <h3 className={`text-sm font-medium truncate ${isSelected ? "text-blue-400" : "text-zinc-300"}`}>
          {item.name}
        </h3>
        {isSelected && (
          <span className="inline-block w-fit text-[9px] uppercase tracking-wider bg-blue-900/30 text-blue-400 px-1.5 py-0.5 border border-blue-500/20 font-mono rounded-sm">
            Installed
          </span>
        )}
      </div>

      {/* --- QUICK ACTION BUTTON (NOWOŚĆ) --- */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Ważne: zapobiega rozwijaniu akordeonu
          onSelect();
        }}
        className={`
          flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-200 z-10
          ${isSelected 
            ? "bg-blue-600 border-blue-600 text-white hover:bg-red-600 hover:border-red-600" // Wybrany: Niebieski -> Czerwony po najechaniu
            : "border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-500 hover:bg-zinc-800" // Niewybrany: Szary -> Niebieski
          }
        `}
        title={isSelected ? "Usuń z zestawu" : "Dodaj do zestawu"}
      >
        {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>

      {/* Cena */}
      <div className="text-right min-w-[70px]">
        <span className="text-sm font-mono text-zinc-400">
          {item.price} zł
        </span>
      </div>

      {/* Ikona rozwijania */}
      <div className="text-zinc-600 pl-2 border-l border-zinc-800">
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </div>

    {/* SZCZEGÓŁY (Rozwijane) */}
    {isExpanded && (
      <div className="p-4 pt-0 pl-6 pr-4 border-t border-zinc-800/50 bg-zinc-900/50 animate-in slide-in-from-top-1 fade-in duration-200">
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          
          <div className="w-24 h-24 bg-black border border-zinc-800 flex items-center justify-center flex-shrink-0">
             {item.image ? (
               <img src={item.image} alt={item.name} className="object-cover w-full h-full opacity-90" />
             ) : (
               <PackageOpen className="w-8 h-8 text-zinc-700" />
             )}
          </div>

          <div className="flex-grow space-y-3">
            <div className="flex flex-wrap gap-2">
              {item.specs.map((spec: string, i: number) => (
                <span key={i} className="text-[10px] uppercase font-mono px-1.5 py-0.5 border border-zinc-700 text-zinc-500 bg-zinc-950">
                  {spec}
                </span>
              ))}
            </div>
            
            <p className="text-xs text-zinc-500 leading-relaxed max-w-md">
              Profesjonalnie odnowiony komponent. Przeszedł 24-godzinne testy obciążeniowe. 
              Stan wizualny: Klasa A+.
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

// --- KOMPONENT PODSUMOWANIA ---
const SummaryPanel = ({ selections, totalPrice, onCategoryClick }: any) => {
  return (
    <div className="border border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50">
        <div className="w-2 h-2 bg-blue-500 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">System Status</h3>
      </div>
      
      <div className="p-0 font-mono text-xs">
        {CATEGORIES.map((category) => {
          const selectedItemId = selections[category.id];
          const selectedItem = category.items.find(i => i.id === selectedItemId);

          return (
            <div 
              key={category.id} 
              onClick={() => onCategoryClick(category.name)}
              className="flex justify-between items-center p-3 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] uppercase w-10 text-zinc-600 group-hover:text-zinc-400 truncate`}>{category.id}</span>
                 <span className={`truncate max-w-[150px] ${selectedItem ? "text-blue-400" : "text-zinc-700 italic"}`}>
                   {selectedItem ? selectedItem.name : "/// EMPTY"}
                 </span>
              </div>
              {selectedItem && <span className="text-zinc-500">{selectedItem.price}</span>}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
        <div className="flex justify-between items-end mb-4 font-mono">
          <span className="text-zinc-500 text-xs uppercase">Total Cost</span>
          <span className="text-xl font-bold text-white tracking-tighter">{totalPrice} <span className="text-sm text-zinc-600">PLN</span></span>
        </div>
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 border border-blue-500">
          <ShoppingBag className="w-4 h-4" />
          Checkout
        </button>
      </div>
    </div>
  );
};


// --- GŁÓWNA ZAWARTOŚĆ ---
function ConfiguratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    const currentParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      currentParams[key] = value;
    });
    setSelections(currentParams);
  }, [searchParams]);

  const updateSelection = (category: string, itemId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(category) === itemId) {
      params.delete(category);
    } else {
      params.set(category, itemId);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    CATEGORIES.forEach(cat => {
      const selectedId = selections[cat.id];
      const item = cat.items.find(i => i.id === selectedId);
      if (item) total += item.price;
    });
    return total;
  }, [selections]);

  const handle3DClick = (friendlyName: string) => {
    const category = CATEGORIES.find(c => c.name === friendlyName);
    if (category) {
      const element = document.getElementById(`section-${category.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("bg-zinc-900");
        setTimeout(() => element.classList.remove("bg-zinc-900"), 500);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
      {/* LEWA KOLUMNA */}
      <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
        <div className="aspect-square w-full bg-black border border-zinc-800 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-600 z-10" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-600 z-10" />
          
          <Scene3D onPartSelect={handle3DClick} />
          
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-blue-500 uppercase tracking-widest bg-black/80 px-2 py-1 border border-blue-500/30">
            Interactive View
          </div>
        </div>

        <SummaryPanel 
          selections={selections} 
          totalPrice={totalPrice} 
          onCategoryClick={handle3DClick} 
        />
      </div>

      {/* PRAWA KOLUMNA */}
      <div className="lg:col-span-8 flex flex-col gap-8 pb-20">
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white mb-2">
            Configurator <span className="text-blue-600">V.2.0</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm max-w-xl">
            // CLICK [+] TO ADD COMPONENT. CLICK ROW TO VIEW DETAILS. <br/>
            // LIVE PREVIEW ON THE LEFT.
          </p>
        </div>

        {CATEGORIES.map((category) => (
          <section 
            key={category.id} 
            id={`section-${category.id}`}
            className="scroll-mt-24 transition-colors duration-500"
          >
            <div className="flex items-center gap-3 mb-0 bg-zinc-950 border border-zinc-800 border-b-0 p-3 sticky top-[4rem] z-10">
              <div className={`p-1.5 ${selections[category.id] ? "text-blue-500" : "text-zinc-600"}`}>
                {category.icon}
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
                {category.name}
              </h2>
              {selections[category.id] && (
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-blue-500">
                  <Check className="w-3 h-3" />
                  INSTALLED
                </div>
              )}
            </div>

            <div className="border border-zinc-800 bg-black">
              {category.items.map((item) => (
                <ProductTile 
                  key={item.id}
                  item={item}
                  isSelected={selections[category.id] === item.id}
                  isExpanded={expandedItemId === item.id}
                  
                  // Kliknięcie w nagłówek = ROZWIŃ
                  onToggleExpand={() => setExpandedItemId(prev => prev === item.id ? null : item.id)}
                  
                  // Kliknięcie w przycisk = WYBIERZ
                  onSelect={() => updateSelection(category.id, item.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// --- 4. WRAPPER ---
export default function ConfiguratorPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      <nav className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black">
            P
          </div>
          <span className="font-bold text-lg tracking-tight uppercase">PlayAgain<span className="text-zinc-600">.tech</span></span>
        </div>
        <div className="flex gap-4">
           <button className="text-xs font-mono text-zinc-400 hover:text-white uppercase transition">Share Build</button>
           <button className="text-xs font-mono text-zinc-400 hover:text-white uppercase transition">Support</button>
        </div>
      </nav>

      <main className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto">
        <Suspense fallback={<div className="text-white font-mono p-10">LOADING CONFIGURATION...</div>}>
          <ConfiguratorContent />
        </Suspense>
      </main>
    </div>
  );
}