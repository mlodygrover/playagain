"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

interface ChatbotProps {
  externalOpen?: boolean;
  onClose?: () => void;
  inventory: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    socket?: string; // <--- DODAJ TĘ LINIJKĘ (opcjonalne, bo np. GPU nie ma socketu)
  }>;
}

export function Chatbot({ externalOpen = false, onClose, inventory }: ChatbotProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Cześć! Powiedz, w co chcesz zagrać lub jaki masz budżet, a ja złożę Ci komputer.", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronizacja otwarcia z zewnątrz
  useEffect(() => {
    if (externalOpen) setIsOpen(true);
  }, [externalOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState && onClose) onClose();
  };

  // Scrollowanie do dołu
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- LOGIKA WYKONYWANIA KOMEND ---
  // --- LOGIKA WYKONYWANIA KOMEND ---
  const processResponse = (fullResponse: string) => {
    // ZMIANA: Dodano :? co oznacza "dwukropek jest opcjonalny"
    // Flaga 'i' sprawia, że wielkość liter nie ma znaczenia (Commands vs commands)
    const parts = fullResponse.split(/\*\*commands:?\*\*/i);

    const textForUser = parts[0].trim();
    const commandsBlock = parts[1]; // Teraz to zadziała nawet jak AI doda dwukropek

    if (commandsBlock) {
      const newParams = new URLSearchParams(searchParams.toString());
      let hasChanges = false;
      // Regex do wyciągania komend pozostaje ten sam
      const regex = /setComponent\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
      let match;

      while ((match = regex.exec(commandsBlock)) !== null) {
        const category = match[1];
        const id = match[2];
        console.log(`🤖 AI ustawia: ${category} -> ${id}`);
        newParams.set(category, id);
        hasChanges = true;
      }

      if (hasChanges) {
        router.replace(`?${newParams.toString()}`, { scroll: false });
      }
    }
    return textForUser;
  };


  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setIsLoading(true);

    try {
      // 1. Budowanie kontekstu obecnej konfiguracji
      // Mapujemy ID z URL na nazwy produktów, żeby AI rozumiało co to za części
      const currentConfig: Record<string, string> = {};

      searchParams.forEach((value, key) => {
        // Szukamy produktu w inventory po ID
        const item = inventory.find((i) => i.id === value);
        // Zapisujemy: "gpu": "NVIDIA RTX 3060" (zamiast samego ID)
        currentConfig[key] = item ? item.name : value;
      });

      const contextMessages = messages.slice(-6).map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));
      contextMessages.push({ role: "user", content: userMessage });

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMessages,
          inventory: inventory,
          currentConfiguration: currentConfig // <--- WYSYŁAMY KONFIGURACJĘ
        }),
      });

      if (!res.ok) throw new Error("Błąd sieci");

      const data = await res.json();
      const cleanText = processResponse(data.reply);
      setMessages((prev) => [...prev, { text: cleanText, sender: "bot" }]);
      console.log(data)
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { text: "Ups, coś przerwało mi połączenie. Spróbuj ponownie.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* 1. TŁO (BACKDROP) TYLKO NA MOBILE */}
      {/* Pojawia się tylko gdy isOpen jest true. Klasa sm:hidden ukrywa to na desktopie */}
      {isOpen && (
        <div
          onClick={handleToggle}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 sm:hidden animate-in fade-in duration-300"
        />
      )}

      {/* PRZYCISK TOGGLE */}
      <button
        onClick={handleToggle}
        // Zwiększyłem z-index na z-50, żeby był nad tłem na mobile
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-500 group ${isOpen
          ? "bg-zinc-900 border border-zinc-700 rotate-90"
          : "bg-gradient-to-tr from-blue-600 to-purple-600 hover:scale-110"
          }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white group-hover:animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border border-black"></span>
          </div>
        )}
      </button>

      {/* GŁÓWNE OKNO CZATU */}
      {isOpen && (
        <div className={`
            fixed 
            z-50 
            flex flex-col overflow-hidden 
            bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 
            shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300
            
            /* STYLOWANIE MOBILE (Center + Większe) */
            bottom-24 
            left-1/2 -translate-x-1/2 
            w-[95vw] 
            h-[65vh] 
            rounded-2xl

            /* STYLOWANIE DESKTOP (Prawy róg + Mniejsze) */
            sm:left-auto sm:translate-x-0 
            sm:right-6 
            sm:w-96 
            sm:h-[60vh] sm:max-h-[600px]
            sm:rounded-3xl
            sm:origin-bottom-right
        `}>

          {/* HEADER */}
          <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI Configurator</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                  {isLoading ? "Thinking..." : "Neural Net Active"}
                </span>
              </div>
            </div>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row animate-in fade-in slide-in-from-left-2"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-zinc-800" : "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"}`}>
                  {msg.sender === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-3 text-sm max-w-[85%] leading-relaxed ${msg.sender === "user"
                  ? "bg-zinc-800 text-white rounded-2xl rounded-tr-none"
                  : "bg-zinc-900/80 border border-white/5 text-zinc-200 rounded-2xl rounded-tl-none shadow-sm"
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 flex-row animate-in fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-zinc-800 bg-black/40 backdrop-blur-sm">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Np. tani zestaw do CS:GO..."
                disabled={isLoading}
                // Na mobile wyłączamy domyślny zoom przy focusie ustawiając font-size na 16px (text-base)
                className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600 pr-12 disabled:opacity-50"
              />
              <button onClick={handleSendMessage} disabled={isLoading} className="absolute right-2 top-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}