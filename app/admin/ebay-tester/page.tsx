"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";
export default function EbayTester() {
    const [query, setQuery] = useState("RTX 3060");
    const [categoryId, setCategoryId] = useState("27386"); // Domyślnie GPU
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResults([]);

        try {
            const res = await fetch(`${API_URL}/api/ebay-test/search`, { // Zmień na swój URL jeśli lokalnie
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    query, 
                    categoryId 
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Błąd pobierania");
            
            setResults(data.items);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-32">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="text-yellow-500" /> eBay API Tester
                </h1>

                {/* Formularz */}
                <form onSubmit={handleSearch} className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 mb-8 flex gap-4 items-end flex-wrap">
                    <div className="flex-grow">
                        <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Fraza (np. RTX 3060)</label>
                        <input 
                            type="text" 
                            value={query} 
                            onChange={e => setQuery(e.target.value)}
                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">ID Kategorii</label>
                        <input 
                            type="text" 
                            value={categoryId} 
                            onChange={e => setCategoryId(e.target.value)}
                            placeholder="np. 27386 (GPU)"
                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
                        />
                        <span className="text-[10px] text-zinc-500">27386 = GPU, 179 = Komputery</span>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        Szukaj
                    </button>
                </form>

                {/* Błędy */}
                {error && (
                    <div className="p-4 bg-red-900/30 border border-red-800 text-red-400 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Wyniki */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((item) => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex gap-4 hover:border-zinc-600 transition-colors">
                            {/* Obrazek */}
                            <div className="w-24 h-24 bg-white rounded overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black font-bold text-xs">NO IMG</div>
                                )}
                            </div>

                            {/* Treść */}
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-bold line-clamp-2 mb-1 text-zinc-200">{item.title}</h3>
                                    <p className="text-xs text-zinc-500">{item.condition}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-xl font-bold text-yellow-500">
                                        {item.price} {item.currency}
                                    </span>
                                    <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                    >
                                        eBay <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {!loading && results.length === 0 && !error && (
                    <p className="text-center text-zinc-600 mt-10">Brak wyników lub jeszcze nie szukano.</p>
                )}
            </div>
        </div>
    );
}

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}