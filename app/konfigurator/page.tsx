"use client";

import { useCart } from "@/context/CartContext";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Cpu, MemoryStick, Fan, Box, Check, MonitorPlay,
  ShoppingBag, PackageOpen, Plus, Minus, ChevronDown, ChevronUp,
  Sparkles, CircuitBoard, Zap, HardDrive, SlidersHorizontal, Search as SearchIcon, X,
  ArrowDownNarrowWide, ArrowUpNarrowWide, Wrench // <--- Dodano ikonę Wrench
} from "lucide-react";
import { Chatbot } from "@/components/Chatbox";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

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

// Definicja struktury kategorii
const CATEGORY_DEFINITIONS = [
  { id: "gpu", apiType: "GPU", name: "Karta Graficzna", icon: <MonitorPlay className="w-4 h-4" /> },
  { id: "cpu", apiType: "CPU", name: "Procesor", icon: <Cpu className="w-4 h-4" /> },
  { id: "mobo", apiType: "Motherboard", name: "Płyta Główna", icon: <CircuitBoard className="w-4 h-4" /> },
  { id: "ram", apiType: "RAM", name: "Pamięć RAM", icon: <MemoryStick className="w-4 h-4" /> },
  { id: "disk", apiType: "Disk", name: "Dysk SSD/HDD", icon: <HardDrive className="w-4 h-4" /> },
  { id: "psu", apiType: "PSU", name: "Zasilacz", icon: <Zap className="w-4 h-4" /> },
  { id: "cool", apiType: "Cooling", name: "Chłodzenie CPU", icon: <Fan className="w-4 h-4" /> },
  { id: "case", apiType: "Case", name: "Obudowa PC", icon: <Box className="w-4 h-4" /> },
  // --- NOWOŚĆ: SEKCJA USŁUG ---
  { id: "service", apiType: "Service", name: "Usługi i Montaż", icon: <Wrench className="w-4 h-4" /> },
];

const generateSpecs = (item: any) => {
  const specs = [];
  switch (item.type) {
    case 'GPU':
      if (item.vram) specs.push(`${item.vram}GB VRAM`);
      if (item.chipset) specs.push(item.chipset);
      break;
    case 'CPU':
      if (item.cores) specs.push(`${item.cores} Cores`);
      if (item.socket) specs.push(item.socket);
      break;
    case 'RAM':
      if (item.capacity) specs.push(`${item.capacity}GB`);
      if (item.memoryType) specs.push(item.memoryType);
      if (item.speed) specs.push(`${item.speed}MHz`);
      break;
    case 'Motherboard':
      if (item.socket) specs.push(item.socket);
      if (item.formFactor) specs.push(item.formFactor);
      if (item.chipset) specs.push(item.chipset);
      break;
    case 'Disk':
      if (item.capacity) specs.push(`${item.capacity}GB`);
      if (item.diskType) specs.push(item.diskType);
      if (item.interface) specs.push(item.interface);
      break;
    case 'PSU':
      if (item.power) specs.push(`${item.power}W`);
      if (item.certification) specs.push(item.certification);
      if (item.modular) specs.push(`Modular: ${item.modular}`);
      break;
    case 'Case':
      if (item.standard) specs.push(item.standard);
      if (item.caseType) specs.push(item.caseType);
      break;
    case 'Cooling':
      if (item.coolingType) specs.push(item.coolingType);
      if (item.fanSize) specs.push(`${item.fanSize}mm`);
      break;
    // --- NOWOŚĆ: SPECYFIKACJA USŁUG ---
    case 'Service':
      if (item.serviceType) specs.push(item.serviceType);
      if (item.duration) specs.push(`Czas: ${item.duration}h`);
      break;
  }
  return specs;
};

// --- KOMPONENT: HISTOGRAM + DUAL SLIDER ---
const PriceHistogramSlider = ({ items, minPrice, maxPrice, currentMin, currentMax, onChange }: any) => {
  const bucketsCount = 24;

  const buckets = useMemo(() => {
    if (items.length === 0) return new Array(bucketsCount).fill(0);
    const step = (maxPrice - minPrice) / bucketsCount;
    const data = new Array(bucketsCount).fill(0);

    items.forEach((item: any) => {
      const index = Math.floor((item.price - minPrice) / step);
      const safeIndex = Math.min(index, bucketsCount - 1);
      if (safeIndex >= 0) data[safeIndex]++;
    });
    return data;
  }, [items, minPrice, maxPrice]);

  const maxCount = Math.max(...buckets, 1);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), currentMax - 10);
    onChange(val, currentMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), currentMin + 10);
    onChange(currentMin, val);
  };

  return (
    <div className="w-full pt-6 pb-2">
      {/* HISTOGRAM */}
      <div className="flex items-end h-12 gap-1 mb-[-6px] px-1">
        {buckets.map((count, i) => {
          const heightPercent = (count / maxCount) * 100;
          const bucketPriceStart = minPrice + (i * ((maxPrice - minPrice) / bucketsCount));
          const isActive = bucketPriceStart >= currentMin && bucketPriceStart <= currentMax;

          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-colors duration-200 ${isActive ? 'bg-blue-500/60' : 'bg-zinc-800'}`}
              style={{ height: `${Math.max(heightPercent, 5)}%` }}
            />
          );
        })}
      </div>

      {/* DUAL SLIDER CONTAINER */}
      <div className="relative h-6 w-full">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 rounded -translate-y-1/2" />
        <div
          className="absolute top-1/2 h-1 bg-blue-500 rounded -translate-y-1/2 pointer-events-none"
          style={{
            left: `${((currentMin - minPrice) / (maxPrice - minPrice)) * 100}%`,
            right: `${100 - ((currentMax - minPrice) / (maxPrice - minPrice)) * 100}%`
          }}
        />
        <input
          type="range" min={minPrice} max={maxPrice} value={currentMin} onChange={handleMinChange}
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-transform z-20"
        />
        <input
          type="range" min={minPrice} max={maxPrice} value={currentMax} onChange={handleMaxChange}
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-transform z-20"
        />
      </div>

      {/* ETYKIETY */}
      <div className="flex justify-between text-[10px] font-mono text-zinc-400 mt-2">
        <span>{Math.floor(currentMin)} zł</span>
        <span>{Math.ceil(currentMax)} zł</span>
      </div>
    </div>
  );
};

const ProductTile = ({ item, isSelected, isExpanded, onToggleExpand, onSelect }: any) => (
  <div className={`relative w-full border-b last:border-b-0 border-zinc-800 transition-all duration-200 group ${isExpanded ? "bg-zinc-900" : "hover:bg-zinc-900/40 bg-black"}`}>
    <div onClick={onToggleExpand} className="flex items-center justify-between p-2 sm:p-4 cursor-pointer gap-2 h-14 sm:h-auto">
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? "bg-blue-600" : "bg-transparent group-hover:bg-zinc-700"}`} />
      <div className="flex flex-col justify-center flex-grow min-w-0 pl-2">
        <h3 className={`text-xs sm:text-sm font-medium truncate pr-2 ${isSelected ? "text-blue-400" : "text-zinc-300"}`}>{item.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs sm:text-sm font-mono text-zinc-400 font-bold leading-none">{item.price} zł</span>
          {isSelected && <span className="text-[9px] uppercase tracking-wider text-blue-500 font-mono leading-none">[SELECTED]</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border rounded transition-all duration-200 z-10 
            ${isSelected ? "bg-blue-600 border-blue-600 text-white hover:bg-red-600 hover:border-red-600" : "border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-500 hover:bg-zinc-800"}`}
        >
          {isSelected ? <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
        <div className="text-zinc-600 w-6 flex justify-center sm:pl-2 sm:border-l border-zinc-800">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
    </div>
    {isExpanded && (
      <div className="p-3 pt-0 pl-4 sm:pl-6 pr-3 border-t border-zinc-800/50 bg-zinc-900/50 animate-in slide-in-from-top-1 fade-in duration-200">
        <div className="flex flex-row gap-3 sm:gap-4 mt-3">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-black border border-zinc-800 flex items-center justify-center flex-shrink-0 rounded-sm">
            {item.image ? <img src={item.image} alt={item.name} className="object-cover w-full h-full opacity-90" /> : <PackageOpen className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-700" />}
          </div>
          <div className="flex-grow space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {item.specs.map((spec: string, i: number) => (
                <span key={i} className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 border border-zinc-700 text-zinc-500 bg-zinc-950 rounded-sm">{spec}</span>
              ))}
            </div>
            {/* Opis dla usług jest w item.description, dla części generyczny */}
            <p className="text-[10px] sm:text-xs text-zinc-500 leading-relaxed max-w-md">
              {item.description || "Komponent zweryfikowany pod kątem kompatybilności."}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const SummaryPanel = ({ categories, selections, totalPrice, onCategoryClick }: any) => {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    const componentNames: string[] = [];
    categories.forEach((cat: any) => {
      const selectedId = selections[cat.id];
      const item = cat.items.find((i: any) => i.id === selectedId);
      if (item) componentNames.push(`${cat.name}: ${item.name}`);
    });

    if (componentNames.length === 0) {
      alert("Wybierz przynajmniej jeden komponent!");
      return;
    }

    addToCart({
      id: `build-${Date.now()}`,
      name: "Custom Gaming PC Build",
      price: totalPrice,
      type: "custom_build",
      components: componentNames,
      image: null
    });
    router.push("/koszyk");
  };

  return (
    <div className="border border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/50">
        <div className="w-2 h-2 bg-blue-500 animate-pulse" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">System Status</h3>
      </div>
      <div className="p-0 font-mono text-xs">
        {categories.map((category: any) => {
          const selectedItemId = selections[category.id];
          const selectedItem = category.items.find((i: any) => i.id === selectedItemId);

          // Dla usług nie pokazujemy "/// EMPTY", jeśli nic nie wybrano - po prostu nie pokazujemy wiersza
          // Ale jeśli to główny komponent, to pokazujemy "/// EMPTY"
          if (category.id === 'service' && !selectedItem) return null;

          return (
            <div key={category.id} onClick={() => onCategoryClick(category.name)} className="flex justify-between items-center p-3 border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer group">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase w-10 text-zinc-600 group-hover:text-zinc-400 truncate`}>{category.id.slice(0, 8)}</span>
                <span className={`truncate max-w-[150px] ${selectedItem ? "text-blue-400" : "text-zinc-700 italic"}`}>{selectedItem ? selectedItem.name : "/// EMPTY"}</span>
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
        <button onClick={handleAddToCart} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 border border-blue-500"><ShoppingBag className="w-4 h-4" />Dodaj do Koszyka</button>
      </div>
    </div>
  );
};

// --- GŁÓWNY KONTENT KONFIGURATORA ---
function ConfiguratorContent({ onOpenChat, isChatOpen, onCloseChat }: { onOpenChat: () => void, isChatOpen: boolean, onCloseChat: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const [filters, setFilters] = useState<Record<string, {
    search: string;
    minPrice: number;
    maxPrice: number;
    manufacturers: string[];
    isOpen: boolean;
    sortOrder: 'asc' | 'desc' | null;
  }>>({});

  const selectedCpuId = selections['cpu'];
  const selectedCpuSocket = useMemo(() => {
    if (!selectedCpuId) return null;
    const cpuCategory = categories.find(c => c.id === 'cpu');
    const cpuItem = cpuCategory?.items.find((i: any) => i.id === selectedCpuId);
    return cpuItem?.socket || null;
  }, [selectedCpuId, categories]);

  // Pobieranie Danych
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/components?user=true`);
        const data = await res.json();
        console.log(data)
        const mappedCategories = CATEGORY_DEFINITIONS.map(def => {
          const items = data
            .filter((item: any) => item.type === def.apiType)
            .map((item: any) => {
              let chipset = item.chipset ? item.chipset.toUpperCase() : (item.name ? item.name.split(' ')[0].toUpperCase() : "UNKNOWN");
              if (def.id === 'gpu') {
                const fullName = (item.name + " " + (item.chipset || "")).toUpperCase();
                if (fullName.includes("NVIDIA") || fullName.includes("GEFORCE") || fullName.includes("RTX") || fullName.includes("GTX")) {
                  chipset = "NVIDIA";
                } else if (fullName.includes("AMD") || fullName.includes("RADEON") || fullName.includes("RX")) {
                  chipset = "AMD";
                } else if (fullName.includes("INTEL") || fullName.includes("ARC")) {
                  chipset = "INTEL";
                }
              }
              // Dla usług chipsetem jest serviceType
              if (def.id === 'service') {
                chipset = item.serviceType || "SERVICE";
              }

              return {
                id: item._id,
                name: item.name,
                type: item.type, // Dodajemy typ do obiektu
                chipset: chipset,
                socket: item.socket,
                formFactor: item.formFactor,
                price: item.stats.basePrice > 0 ? item.stats.basePrice : item.stats.averagePrice,
                image: item.image,
                description: item.description, // Dla usług
                serviceType: item.serviceType, // Dla usług
                duration: item.duration, // Dla usług
                specs: generateSpecs(item)
              };
            });
          return { ...def, items: items };
        });

        setCategories(mappedCategories);

        const initialFilters: any = {};
        mappedCategories.forEach(cat => {
          if (cat.items.length > 0) {
            const prices = cat.items.map((i: any) => i.price);
            initialFilters[cat.id] = {
              search: "",
              minPrice: Math.min(...prices),
              maxPrice: Math.max(...prices),
              manufacturers: [],
              isOpen: false,
              sortOrder: 'asc'
            };
          }
        });
        setFilters(initialFilters);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const currentParams: Record<string, string> = {};
    searchParams.forEach((value, key) => { currentParams[key] = value; });
    setSelections(currentParams);
  }, [searchParams]);
  // ... (istniejące useEffecty) ...

  // --- NOWOŚĆ: AUTOMATYCZNE WYBIERANIE MONTAŻU ---
  useEffect(() => {
    // 1. Jeśli kategorie się jeszcze nie załadowały, nic nie rób
    if (categories.length === 0) return;

    // 2. Sprawdź, czy usługa jest już wybrana w URL
    const currentServiceId = searchParams.get('service');

    // 3. Jeśli NIE ma wybranej usługi, wybierz domyślną
    if (!currentServiceId) {
      const serviceCategory = categories.find(c => c.id === 'service');

      // Sprawdź czy kategoria usług istnieje i czy ma jakieś produkty
      if (serviceCategory && serviceCategory.items.length > 0) {

        // Wybieramy pierwszą usługę z listy (zakładamy, że to "Montaż Standard")
        // Możesz tu też poszukać konkretnej po nazwie: 
        // const defaultService = serviceCategory.items.find((i: any) => i.name.includes("Standard")) || serviceCategory.items[0];
        const defaultService = serviceCategory.items[0];

        // Aktualizujemy URL (to wywoła odświeżenie stanu selections)
        const params = new URLSearchParams(searchParams.toString());
        params.set('service', defaultService.id);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [categories, searchParams, router]);

  // ... (reszta kodu) ...

  const updateSelection = (category: string, itemId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Sprawdzamy czy użytkownik ODZNACZA aktualny element
    const isDeselecting = params.get(category) === itemId;

    // Standardowa logika toggle (zaznacz/odznacz)
    if (isDeselecting) {
      params.delete(category);
    } else {
      params.set(category, itemId);
    }

    // --- LOGIKA KOMPATYBILNOŚCI CPU <-> MOBO ---
    if (category === 'cpu') {
      if (isDeselecting) {
        // SCENARIUSZ 1: Użytkownik usuwa procesor całkowicie -> Usuwamy płytę główną
        params.delete('mobo');
      } else {
        // SCENARIUSZ 2: Użytkownik zmienia procesor na inny
        // Musimy sprawdzić czy nowy procesor pasuje do starej płyty (ten sam socket)

        // 1. Znajdź dane nowego procesora
        const cpuCategory = categories.find(c => c.id === 'cpu');
        const newCpuItem = cpuCategory?.items.find((i: any) => i.id === itemId);

        // 2. Znajdź ID aktualnie wybranej płyty głównej (jeśli jest)
        const currentMoboId = params.get('mobo');

        if (currentMoboId && newCpuItem) {
          const moboCategory = categories.find(c => c.id === 'mobo');
          const currentMoboItem = moboCategory?.items.find((i: any) => i.id === currentMoboId);

          // 3. Porównaj Sockety
          // Jeśli sockety są różne (np. zmiana z Intel LGA1700 na AMD AM4), usuwamy płytę
          if (currentMoboItem && newCpuItem.socket !== currentMoboItem.socket) {
            params.delete('mobo');
          }
          // Jeśli sockety są takie same -> nic nie robimy (płyta zostaje zaznaczona)
        }
      }
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    categories.forEach(cat => {
      const selectedId = selections[cat.id];
      const item = cat.items.find((i: any) => i.id === selectedId);
      if (item) total += item.price;
    });
    return total;
  }, [selections, categories]);

  const handle3DClick = (friendlyName: string) => {
    const category = categories.find(c => c.name === friendlyName);
    if (category) {
      const element = document.getElementById(`section-${category.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        if (collapsedCategories[category.id]) toggleCategoryCollapse(category.id);
        element.classList.add("bg-zinc-900", "animate-shake", "animate-border-flow");
        setTimeout(() => element.classList.remove("bg-zinc-900", "animate-shake", "animate-border-flow"), 2000);
      }
    }
  };

  const toggleCategoryCollapse = (catId: string) => setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  const toggleFilterPanel = (catId: string) => setFilters(prev => ({ ...prev, [catId]: { ...prev[catId], isOpen: !prev[catId]?.isOpen } }));
  const updateFilter = (catId: string, field: string, value: any) => setFilters(prev => ({ ...prev, [catId]: { ...prev[catId], [field]: value } }));
  const updatePriceRange = (catId: string, min: number, max: number) => setFilters(prev => ({ ...prev, [catId]: { ...prev[catId], minPrice: min, maxPrice: max } }));
  const toggleManufacturer = (catId: string, brand: string) => {
    setFilters(prev => {
      const currentBrands = prev[catId]?.manufacturers || [];
      const newBrands = currentBrands.includes(brand) ? currentBrands.filter(b => b !== brand) : [...currentBrands, brand];
      return { ...prev, [catId]: { ...prev[catId], manufacturers: newBrands } };
    });
  };

  const aiInventory = useMemo(() => {
    const items: any[] = [];
    categories.forEach(cat => {
      cat.items.forEach((item: any) => {
        items.push({
          id: item.id,
          name: item.name,
          type: cat.id,
          price: item.price,
          // Dodajemy socket, jeśli istnieje (głównie dla CPU i MOBO)
          socket: item.socket || null
        });
      });
    });
    return items;
  }, [categories]);

  if (loading) return <div className="flex h-[50vh] w-full items-center justify-center font-mono text-zinc-500 animate-pulse">INITIALIZING DATABASE CONNECTION...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start relative">
      {/* LEWA KOLUMNA */}
      <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
        <div className="aspect-square w-full bg-black border border-zinc-800 relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-blue-600 z-10" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-blue-600 z-10" />
          <Scene3D onPartSelect={handle3DClick} />
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-blue-500 uppercase tracking-widest bg-black/80 px-2 py-1 border border-blue-500/30">Interactive View</div>
        </div>
        <button onClick={onOpenChat} className="w-full py-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all group">
          <div className="relative"><Sparkles className="w-5 h-5 text-purple-400 group-hover:animate-spin-slow" /><span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse" /></div><span>Skonfiguruj z AI</span>
        </button>
        <SummaryPanel categories={categories} selections={selections} totalPrice={totalPrice} onCategoryClick={handle3DClick} />
      </div>

      {/* PRAWA KOLUMNA */}
      <div className="lg:col-span-8 flex flex-col gap-4 pb-20">
        <div className="border-b border-zinc-800 pb-6 mb-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white mb-2">Configurator <span className="text-blue-600">V.2.0</span></h1>
          <p className="text-zinc-500 font-mono text-sm max-w-xl">// CENY LIVE Z BAZY DANYCH <br />// WIDOCZNE TYLKO DOSTĘPNE KOMPONENTY.</p>
        </div>

        {categories.map((category) => {
          let categoryItems = category.items;
          let blockReason = null;

          if (category.id === 'mobo') {
            if (!selectedCpuId) {
              blockReason = "Najpierw wybierz procesor, aby dopasować płytę główną.";
              categoryItems = [];
            } else if (selectedCpuSocket) {
              categoryItems = categoryItems.filter((mobo: any) => mobo.socket === selectedCpuSocket);
              if (categoryItems.length === 0) blockReason = `Brak płyt głównych dla socketu ${selectedCpuSocket} w bazie.`;
            }
          }

          const catPrices = categoryItems.map((i: any) => i.price);
          const absoluteMin = catPrices.length > 0 ? Math.min(...catPrices) : 0;
          const absoluteMax = catPrices.length > 0 ? Math.max(...catPrices) : 5000;

          const currentFilter = filters[category.id] || {
            search: "",
            minPrice: absoluteMin,
            maxPrice: absoluteMax,
            manufacturers: [],
            isOpen: false,
            sortOrder: 'asc'
          };

          const availableChipsets = Array.from(new Set(categoryItems.map((i: any) => i.chipset))).filter(Boolean).sort() as string[];

          let filteredItems = categoryItems.filter((item: any) => {
            const matchesSearch = item.name.toLowerCase().includes(currentFilter.search.toLowerCase());
            const matchesPrice = item.price >= currentFilter.minPrice && item.price <= currentFilter.maxPrice;
            const matchesBrand = currentFilter.manufacturers.length > 0 ? currentFilter.manufacturers.includes(item.chipset) : true;
            return matchesSearch && matchesPrice && matchesBrand;
          });

          if (currentFilter.sortOrder === 'asc') filteredItems.sort((a: any, b: any) => a.price - b.price);
          else if (currentFilter.sortOrder === 'desc') filteredItems.sort((a: any, b: any) => b.price - a.price);

          const isCollapsed = collapsedCategories[category.id];

          return (
            <section key={category.id} id={`section-${category.id}`} className="scroll-mt-24 transition-all duration-300 border border-zinc-800 bg-zinc-950/30">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors select-none" onClick={() => toggleCategoryCollapse(category.id)}>
                <div className="text-zinc-500">{isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}</div>
                <div className={`p-1.5 rounded bg-zinc-900 border border-zinc-800 ${selections[category.id] ? "text-blue-500 border-blue-900/30" : "text-zinc-600"}`}>{category.icon}</div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 flex-grow">{category.name}</h2>
                <div className="flex items-center gap-4">
                  {category.id !== 'service' && (
                    <button onClick={(e) => { e.stopPropagation(); if (isCollapsed) toggleCategoryCollapse(category.id); toggleFilterPanel(category.id); }} className={`text-xs flex items-center gap-1 uppercase font-mono transition-colors p-2 rounded hover:bg-zinc-800 ${currentFilter.isOpen ? 'text-blue-400' : 'text-zinc-500 hover:text-white'}`}>
                      <SlidersHorizontal className="w-3.5 h-3.5" /><span className="hidden sm:inline">Filters</span>
                    </button>
                  )}
                  {selections[category.id] && <div className="flex items-center gap-2 text-xs font-mono text-blue-500 bg-blue-900/10 px-2 py-1 rounded border border-blue-500/20"><Check className="w-3 h-3" />SELECTED</div>}
                </div>
              </div>

              {!isCollapsed && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  {blockReason && (
                    <div className="p-8 text-center border-t border-zinc-800 bg-red-950/10">
                      <div className="inline-flex items-center justify-center p-3 bg-red-900/20 rounded-full mb-3"><Cpu className="w-6 h-6 text-red-500" /></div>
                      <p className="text-zinc-300 font-bold text-sm mb-1">Wymagany Procesor</p>
                      <p className="text-zinc-500 font-mono text-xs">{blockReason}</p>
                    </div>
                  )}

                  {!blockReason && currentFilter.isOpen && category.id !== 'service' && (
                    <div className="bg-zinc-900/80 border-y border-zinc-800 p-6 animate-in slide-in-from-top-2 fade-in backdrop-blur-sm space-y-6">
                      {/* FILTRY DLA ZWYKŁYCH CZĘŚCI (bez zmian) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-bold mb-1 block">Szukaj</label>
                            <div className="relative">
                              <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                              <input value={currentFilter.search} onChange={(e) => updateFilter(category.id, 'search', e.target.value)} placeholder="Model..." className="w-full bg-black border border-zinc-800 text-white text-sm pl-9 pr-3 py-2 focus:border-blue-500 outline-none rounded-sm" />
                              {currentFilter.search && <button onClick={() => updateFilter(category.id, 'search', "")} className="absolute right-3 top-2.5"><X className="w-4 h-4 text-zinc-500 hover:text-white" /></button>}
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-2">
                              <label className="text-[10px] text-zinc-500 uppercase font-bold">
                                {category.id === 'gpu' ? 'Producent GPU' : category.id === 'cpu' ? 'Producent CPU' : 'Producent / Marka'}
                              </label>
                              <div className="flex gap-1">
                                <button onClick={() => updateFilter(category.id, 'sortOrder', 'asc')} className={`px-2 py-1 text-[9px] uppercase border rounded flex items-center gap-1 ${currentFilter.sortOrder === 'asc' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}><ArrowDownNarrowWide className="w-3 h-3" /> Najtańsze</button>
                                <button onClick={() => updateFilter(category.id, 'sortOrder', 'desc')} className={`px-2 py-1 text-[9px] uppercase border rounded flex items-center gap-1 ${currentFilter.sortOrder === 'desc' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}><ArrowUpNarrowWide className="w-3 h-3" /> Najdroższe</button>
                              </div>
                            </div>
                            {availableChipsets.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {availableChipsets.map((chipset) => {
                                  const isActive = currentFilter.manufacturers.includes(chipset);
                                  let colorClass = isActive ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600';
                                  if (isActive) {
                                    if (chipset === 'NVIDIA') colorClass = 'bg-green-900/40 border-green-500 text-green-400';
                                    else if (chipset === 'AMD') colorClass = 'bg-red-900/40 border-red-500 text-red-400';
                                    else if (chipset === 'INTEL') colorClass = 'bg-blue-900/40 border-blue-500 text-blue-400';
                                  }
                                  return <button key={chipset} onClick={() => toggleManufacturer(category.id, chipset)} className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border rounded transition-all ${colorClass}`}>{chipset}</button>
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-zinc-500 uppercase font-bold">Zakres Cenowy</label>
                            <span className="text-[10px] font-mono text-blue-400">{filteredItems.length} produktów</span>
                          </div>
                          <PriceHistogramSlider items={categoryItems} minPrice={absoluteMin} maxPrice={absoluteMax} currentMin={currentFilter.minPrice} currentMax={currentFilter.maxPrice} onChange={(min: number, max: number) => updatePriceRange(category.id, min, max)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {!blockReason && (
                    <div className="bg-black max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item: any) => (
                          <ProductTile key={item.id} item={item} isSelected={selections[category.id] === item.id} isExpanded={expandedItemId === item.id} onToggleExpand={() => setExpandedItemId(prev => prev === item.id ? null : item.id)} onSelect={() => updateSelection(category.id, item.id)} />
                        ))
                      ) : (
                        <div className="p-8 text-center border-t border-zinc-800">
                          <p className="text-zinc-500 font-mono text-xs mb-2">// NO ITEMS MATCHING FILTERS</p>
                          <button onClick={() => updatePriceRange(category.id, absoluteMin, absoluteMax)} className="text-blue-500 hover:underline text-xs">Reset Filters</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <Chatbot
        externalOpen={isChatOpen}
        onClose={onCloseChat}
        inventory={aiInventory}
      />
    </div>
  );
}

export default function ConfiguratorPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      <nav className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-black italic text-black">P</div><span className="font-bold text-lg tracking-tight uppercase">PlayAgain<span className="text-zinc-600"></span></span></div>
        <div className="flex gap-4"><button className="text-xs font-mono text-zinc-400 hover:text-white uppercase transition">Share Build</button><button className="text-xs font-mono text-zinc-400 hover:text-white uppercase transition">Support</button></div>
      </nav>
      <main className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto">
        <Suspense fallback={<div className="text-white font-mono p-10">LOADING CONFIGURATION...</div>}>
          <ConfiguratorContent
            onOpenChat={() => setIsChatOpen(true)}
            isChatOpen={isChatOpen}
            onCloseChat={() => setIsChatOpen(false)}
          />
        </Suspense>
      </main>
    </div>
  );
}