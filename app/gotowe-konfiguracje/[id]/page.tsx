"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { 
  Check, ShoppingBag, Settings2, Cpu, MonitorPlay, 
  HardDrive, MemoryStick, CircuitBoard, Box, Fan, Zap,
  ArrowLeft, Loader2, Sparkles // <--- Dodałem Sparkles
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

// Definicje typów (zgodne z bazą danych)
interface Component {
  _id: string;
  name: string;
  type: string;
  price: number;
}

interface Prebuilt {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  components: Component[];
}

export default function PrebuiltDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Prebuilt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Pobieranie danych z API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/prebuilts/${params.id}`);
        
        if (!res.ok) {
            if(res.status === 404) throw new Error("Nie znaleziono zestawu.");
            throw new Error("Błąd serwera.");
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProduct();
  }, [params.id]);

  // 2. Helper do znajdowania nazwy komponentu w zestawie
  const getComponentName = (type: string) => {
    if (!product) return "Brak";
    const comp = product.components.find(c => c.type === type);
    return comp ? comp.name : "Brak danych";
  };

  // 3. Generowanie linku do konfiguratora
  const handleCustomize = () => {
    if (!product) return;

    const queryParams = new URLSearchParams();
    
    const typeToParamMap: Record<string, string> = {
        'GPU': 'gpu',
        'CPU': 'cpu',
        'Motherboard': 'mobo',
        'RAM': 'ram',
        'Disk': 'disk',
        'PSU': 'psu',
        'Case': 'case',
        'Cooling': 'cool'
    };

    product.components.forEach(comp => {
        const paramKey = typeToParamMap[comp.type];
        if (paramKey) {
            queryParams.set(paramKey, comp._id);
        }
    });

    router.push(`/konfigurator?${queryParams.toString()}`);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const componentNames = product.components.map(c => c.name);

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      type: "custom_build",
      image: product.image || null,
      components: componentNames
    });
  };

  // --- RENDERING STANÓW ---

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-blue-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-mono gap-4">
        <div className="text-red-500 text-xl">ERROR: {error || "CONFIGURATION_NOT_FOUND"}</div>
        <Link href="/gotowe-konfiguracje" className="text-sm underline text-zinc-500 hover:text-white">
            Wróć do listy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-20">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Nawigacja wstecz */}
        <Link href="/gotowe-konfiguracje" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 text-sm font-mono transition-colors">
          <ArrowLeft className="w-4 h-4" /> WRÓĆ DO LISTY
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEWA STRONA - WIZUALIZACJA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/3] bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden group">
              {/* Ozdobniki */}
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-600/50 m-4" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-blue-600/50 m-4" />
              
              {/* Obrazek */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                 {product.image ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                 ) : (
                     <Box className="w-48 h-48 text-zinc-800 group-hover:text-zinc-700 transition-colors duration-700" />
                 )}
              </div>
              
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur px-3 py-1 border border-zinc-700 text-xs font-mono text-zinc-300">
                ID: {product._id.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>

          {/* PRAWA STRONA - DANE I AKCJE */}
          <div className="lg:col-span-5 flex flex-col">
            
            <div className="border-b border-zinc-800 pb-6 mb-6">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{product.name}</h1>
                <p className="text-zinc-400 text-sm leading-relaxed">{product.description || "Brak opisu dla tej konfiguracji."}</p>
            </div>

            {/* Specyfikacja - Lista Generowana Dynamicznie */}
            <div className="space-y-3 mb-8 flex-grow">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Specyfikacja Techniczna</h3>
                
                <SpecRow icon={<MonitorPlay />} label="Karta Graficzna" value={getComponentName('GPU')} highlight />
                <SpecRow icon={<Cpu />} label="Procesor" value={getComponentName('CPU')} />
                <SpecRow icon={<CircuitBoard />} label="Płyta Główna" value={getComponentName('Motherboard')} />
                <SpecRow icon={<MemoryStick />} label="Pamięć RAM" value={getComponentName('RAM')} />
                <SpecRow icon={<HardDrive />} label="Dysk" value={getComponentName('Disk')} />
                <SpecRow icon={<Zap />} label="Zasilacz" value={getComponentName('PSU')} />
                <SpecRow icon={<Box />} label="Obudowa" value={getComponentName('Case')} />
            </div>

            {/* Sekcja Zakupu */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Cena zestawu</p>
                        <p className="text-3xl font-black text-white tracking-tight">{product.price} <span className="text-lg text-zinc-500 font-normal">PLN</span></p>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                            <Check className="w-3 h-3" /> Dostępny od ręki
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {/* PRZYCISK: DOSTOSUJ (TERAZ BARDZO WIDOCZNY) */}
                    <button 
                        onClick={handleCustomize}
                        className="group relative w-full overflow-hidden rounded font-bold uppercase tracking-wide flex items-center justify-center gap-3 py-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* Tło Gradientowe */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all group-hover:brightness-110"></div>
                        
                        {/* Efekt Poświaty */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-50 bg-purple-500 blur-xl transition-opacity"></div>
                        
                        {/* Efekt Przesuwającego się błysku */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>

                        {/* Treść przycisku */}
                        <span className="relative z-10 flex items-center gap-2 text-white text-sm md:text-base">
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                            Edytuj w Konfiguratorze
                        </span>
                    </button>

                    {/* PRZYCISK: DO KOSZYKA (STANDARDOWY) */}
                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white py-4 rounded font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                    >
                        <ShoppingBag className="w-5 h-5 text-zinc-400" /> Kup ten zestaw bez zmian
                    </button>
                </div>
                
                <p className="text-[10px] text-zinc-500 text-center font-mono">
                    * Wybierając "Edytuj", przeniesiesz wszystkie części do konfiguratora 3D.
                </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Pomocniczy komponent wiersza specyfikacji
function SpecRow({ icon, label, value, highlight = false }: { icon: any, label: string, value: string, highlight?: boolean }) {
    if (value === "Brak" || value === "Brak danych") return null;

    return (
        <div className={`flex items-center justify-between p-3 rounded border ${highlight ? 'bg-blue-900/10 border-blue-900/30' : 'bg-black border-zinc-800'}`}>
            <div className="flex items-center gap-3">
                <div className={`text-zinc-500 ${highlight ? 'text-blue-400' : ''}`}>
                    {React.cloneElement(icon, { className: "w-5 h-5" })}
                </div>
                <span className="text-xs text-zinc-500 uppercase font-bold">{label}</span>
            </div>
            <span className={`text-sm font-medium ${highlight ? 'text-white' : 'text-zinc-300'}`}>{value}</span>
        </div>
    )
}