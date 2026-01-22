"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MonitorPlay, ArrowRight, Cpu, Zap, Loader } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

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
    category: string;
    image?: string;
    description?: string;
    components: Component[];
}

export default function PrebuiltsPage() {
    const [prebuilts, setPrebuilts] = useState<Prebuilt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrebuilts = async () => {
            try {
                const apiUrl = API_URL;
                const response = await fetch(`${apiUrl}/api/prebuilts`);

                if (!response.ok) {
                    throw new Error('Failed to fetch prebuilt computers');
                }
                const data = await response.json();
                setPrebuilts(data);
            } catch (err: unknown) {
                console.error("Error fetching prebuilts:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPrebuilts();
    }, []);

    const getSpec = (components: Component[], type: string): string => {
        const component = components.find((c) => c.type === type);
        return component ? component.name : "N/A";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <Loader className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-20">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* HEADER */}
                <div className="mb-12 border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-blue-600"></div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                            Gotowe <span className="text-zinc-600">Zestawy</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 max-w-2xl font-mono text-sm pl-5">
                        // PROFESJONALNIE ZŁOŻONE. PRZETESTOWANE. GOTOWE DO GRY. <br />
                        // PLUG & PLAY EXPERIENCE.
                    </p>
                </div>

                {/* GRID ZESTAWÓW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {prebuilts.map((pc) => {
                        const cpuSpec = getSpec(pc.components, 'CPU');
                        const gpuSpec = getSpec(pc.components, 'GPU');

                        return (
                            // ZMIANA 1: Główny kontener jest teraz Linkiem
                            <Link 
                                key={pc._id} 
                                href={`/gotowe-konfiguracje/${pc._id}`}
                                className="group bg-zinc-900/30 border border-zinc-800 hover:border-blue-900/50 hover:bg-zinc-900/60 transition-all duration-300 flex flex-col overflow-hidden relative"
                            >

                                {/* Badge Kategorii */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-black/80 backdrop-blur text-blue-400 px-3 py-1 border border-blue-900/30 rounded-full">
                                        {pc.category}
                                    </span>
                                </div>

                                {/* Obrazek */}
                                <div className="h-64 bg-gradient-to-b from-black/0 to-zinc-900/50 flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-500">
                                    {pc.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={pc.image} alt={pc.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50 rounded-lg">
                                            <MonitorPlay className="w-16 h-16 text-zinc-700 group-hover:text-blue-500/50 transition-colors" />
                                        </div>
                                    )}
                                </div>

                                {/* Treść */}
                                <div className="p-6 flex flex-col flex-grow border-t border-zinc-800">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors truncate">
                                            {pc.name}
                                        </h3>
                                        <div className="flex flex-col gap-1 text-xs font-mono text-zinc-500">
                                            <span className="flex items-center gap-2 truncate"><Cpu className="w-3 h-3" /> {cpuSpec}</span>
                                            <span className="flex items-center gap-2 truncate"><Zap className="w-3 h-3" /> {gpuSpec}</span>
                                        </div>
                                    </div>

                                    {/* ZMIANA 2: Usunięto błędny atrybut href z diva */}
                                    <div className="mt-auto pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-zinc-500 font-bold">Cena</span>
                                            <span className="text-xl font-bold text-white tracking-tight">{pc.price} PLN</span>
                                        </div>

                                        {/* ZMIANA 3: Przycisk to teraz div (wizualnie guzik), bo Link jest na całości */}
                                        <div className="bg-white group-hover:bg-blue-600 group-hover:text-white text-black px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2">
                                            Szczegóły <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}