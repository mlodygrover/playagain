"use client";

import React, { useState } from "react";
import { Search, Terminal, Loader2, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function AllegroTestPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/check-allegro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data);
      
      // LOGOWANIE DO KONSOLI (Zgodnie z życzeniem)
      console.log("Wyniki Allegro dla:", query);
      console.table(data.results); // console.table wygląda świetnie dla tablic obiektów
      console.log("Pełny JSON:", data);

    } catch (err) {
      console.error(err);
      setResponse({ error: "Błąd połączenia z backendem" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-32 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-black uppercase text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-orange-500" /> 
            Allegro API Debugger
          </h1>
          <p className="text-zinc-500 font-mono text-xs mt-2">
            Kategoria: Podzespoły komputerowe (ID: 4226) | Sortowanie: Cena (rosnąco)
          </p>
        </div>

        {/* Formularz */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wpisz nazwę części (np. RTX 4060)..."
            className="flex-grow bg-zinc-900 border border-zinc-800 p-4 text-white focus:border-orange-500 outline-none font-mono"
          />
          <button 
            type="submit" 
            disabled={loading || !query}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search className="w-4 h-4" />}
            Szukaj
          </button>
        </form>

        {/* Wyniki (Wizualne + Info o konsoli) */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-lg font-mono text-sm overflow-hidden">
          <div className="flex items-center gap-2 text-zinc-500 mb-4 border-b border-zinc-900 pb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Wyniki zostały również wypisane w konsoli przeglądarki (F12).</span>
          </div>

          {response ? (
            <pre className="text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          ) : (
            <span className="text-zinc-700">// Oczekiwanie na zapytanie...</span>
          )}
        </div>

      </div>
    </div>
  );
}