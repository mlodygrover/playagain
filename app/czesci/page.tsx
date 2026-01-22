"use client";

import React, { useState, useMemo } from "react";
import { 
  MonitorPlay, Cpu, MemoryStick, Fan, Box, 
  Search, Filter, ShoppingCart, ArrowRight 
} from "lucide-react";

// --- 1. MOCK DATABASE (Baza produktów) ---
const ALL_PRODUCTS = [
  { id: "gpu-1", category: "gpu", name: "NVIDIA RTX 3060 12GB", price: 1200, specs: ["12GB VRAM", "Ray Tracing"], condition: "Grade A+" },
  { id: "gpu-2", category: "gpu", name: "NVIDIA RTX 4070 Ti", price: 3400, specs: ["12GB GDDR6X", "DLSS 3.0"], condition: "Open Box" },
  { id: "gpu-3", category: "gpu", name: "AMD Radeon RX 6600", price: 900, specs: ["8GB GDDR6", "Eco Mode"], condition: "Refurbished" },
  { id: "cpu-1", category: "cpu", name: "Intel Core i5-12400F", price: 600, specs: ["6 Cores", "LGA1700"], condition: "Grade A" },
  { id: "cpu-2", category: "cpu", name: "Intel Core i9-13900K", price: 2500, specs: ["24 Cores", "5.8 GHz"], condition: "Grade A+" },
  { id: "ram-1", category: "ram", name: "Kingston Fury 16GB", price: 200, specs: ["DDR4", "3200MHz"], condition: "New" },
  { id: "ram-2", category: "ram", name: "Corsair Vengeance 32GB", price: 450, specs: ["DDR5", "RGB"], condition: "New" },
  { id: "cool-1", category: "cool", name: "SilentiumPC Fera 5", price: 120, specs: ["Air Cooler", "120mm"], condition: "Grade A" },
  { id: "cool-2", category: "cool", name: "NZXT Kraken 240", price: 600, specs: ["AIO Liquid", "LCD Display"], condition: "Refurbished" },
  { id: "case-1", category: "case", name: "NZXT H5 Flow", price: 400, specs: ["ATX", "Tempered Glass"], condition: "Grade B" },
  { id: "case-2", category: "case", name: "SilentiumPC Ventum", price: 250, specs: ["ATX", "Mesh Front"], condition: "Grade A" },
];

const CATEGORIES = [
  { id: "all", label: "Wszystkie", icon: <Filter className="w-4 h-4" /> },
  { id: "gpu", label: "Karty Graficzne", icon: <MonitorPlay className="w-4 h-4" /> },
  { id: "cpu", label: "Procesory", icon: <Cpu className="w-4 h-4" /> },
  { id: "ram", label: "Pamięć RAM", icon: <MemoryStick className="w-4 h-4" /> },
  { id: "cool", label: "Chłodzenie", icon: <Fan className="w-4 h-4" /> },
  { id: "case", label: "Obudowy", icon: <Box className="w-4 h-4" /> },
];

export default function PartsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrowanie
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-20">
      
      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto px-6 mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
          Magazyn <span className="text-zinc-600">Części</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl font-mono text-sm border-l-2 border-blue-600 pl-4">
          // Przeglądaj certyfikowane komponenty. <br/>
        
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* --- LEWA KOLUMNA: FILTRY (Sticky) --- */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-8">
          
          {/* Szukajka */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="SEARCH_DB..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 pl-10 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-600 focus:bg-zinc-900/80 transition-all placeholder:text-zinc-700"
            />
          </div>

          {/* Kategorie */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 pl-2">Kategorie</h3>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-2 transition-all
                  ${selectedCategory === cat.id 
                    ? "border-blue-600 bg-zinc-900 text-white" 
                    : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50 hover:border-zinc-700"
                  }
                `}
              >
                {cat.icon}
                {cat.label}
                {selectedCategory === cat.id && <ArrowRight className="w-3 h-3 ml-auto text-blue-500" />}
              </button>
            ))}
          </div>

          {/* Banner */}
          <div className="p-4 border border-zinc-800 bg-zinc-950/50 text-center">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Need Help?</p>
            <p className="text-sm text-zinc-300 mb-4">Nie wiesz co wybrać do swojej płyty głównej?</p>
            <button className="text-xs text-blue-400 hover:text-white font-bold uppercase underline decoration-blue-500/30 hover:decoration-white">
              Uruchom Asystenta AI
            </button>
          </div>
        </div>

        {/* --- PRAWA KOLUMNA: GRID PRODUKTÓW --- */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-zinc-800">
                <p className="text-zinc-500 font-mono">BRAK WYNIKÓW W BAZIE DANYCH.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// --- KOMPONENT KARTY PRODUKTU (SKLEP) ---
function ProductCard({ product }: { product: any }) {
  return (
    <div className="group bg-black border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col h-full relative overflow-hidden">
      
      {/* Badge Stanu */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900/80 backdrop-blur text-zinc-400 px-2 py-1 border border-zinc-800">
          {product.condition}
        </span>
      </div>

      {/* Obrazek (Placeholder) */}
      <div className="h-48 bg-zinc-900/30 flex items-center justify-center group-hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/50">
        <Box className="w-12 h-12 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
      </div>

      {/* Treść */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4 flex-grow">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.specs.map((spec: string, i: number) => (
              <span key={i} className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-1.5 py-0.5">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Karty */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
          <span className="text-xl font-bold text-white font-mono">
            {product.price} <span className="text-sm text-zinc-500">PLN</span>
          </span>
          
          <button className="bg-white text-black p-2 hover:bg-blue-600 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}