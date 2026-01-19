"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";
interface ChatbotProps {
  externalOpen?: boolean;
  onClose?: () => void;
  // Przekazujemy uproszczoną listę produktów, aby AI wiedziało co mamy
  inventory: Array<{
    id: string;
    name: string;
    type: string; // np. 'gpu', 'cpu' (zmapowane z API type na ID kategorii)
    price: number;
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
  const executeCommand = (category: string, id: string) => {
    console.log(`🤖 AI zmienia: ${category} -> ${id}`);

    // Pobieramy aktualne parametry URL
    const currentParams = new URLSearchParams(searchParams.toString());

    // Ustawiamy nową wartość
    currentParams.set(category, id);

    // Aktualizujemy URL bez przeładowania strony (shallow routing)
    router.replace(`?${currentParams.toString()}`, { scroll: false });
  };

  const processResponse = (fullResponse: string) => {
    // 1. Podział odpowiedzi
    const parts = fullResponse.split(/\*\*commands\*\*/i);
    const textForUser = parts[0].trim();
    const commandsBlock = parts[1];

    if (commandsBlock) {
      // 2. Inicjalizacja parametrów na bazie OBECNEGO stanu URL
      // Używamy searchParams.toString(), żeby mieć kopię, na której będziemy pracować
      const newParams = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      // 3. Wyciąganie wszystkich komend
      const regex = /setComponent\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
      let match;

      while ((match = regex.exec(commandsBlock)) !== null) {
        const category = match[1]; // np. 'gpu'
        const id = match[2];       // np. '12345'

        console.log(`🤖 AI ustawia: ${category} -> ${id}`);

        // 4. Aplikowanie zmian do TEGO SAMEGO obiektu params
        newParams.set(category, id);
        hasChanges = true;
      }

      // 5. Wykonanie router.replace TYLKO RAZ, jeśli były zmiany
      if (hasChanges) {
        console.log("🚀 Aktualizacja URL:", newParams.toString());
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
      // Przygotowanie historii rozmowy (ostatnie 6 wiadomości dla kontekstu)
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
          inventory: inventory // Wysyłamy kontekst produktów do AI
        }),
      });

      if (!res.ok) throw new Error("Błąd sieci");

      const data = await res.json();
      const cleanText = processResponse(data.reply);
      console.log(data)
      setMessages((prev) => [...prev, { text: cleanText, sender: "bot" }]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { text: "Ups, coś przerwało mi połączenie. Spróbuj ponownie.", sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
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

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[60vh] max-h-[600px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">

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

          <div className="p-4 border-t border-zinc-800 bg-black/40 backdrop-blur-sm">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Np. tani zestaw do CS:GO..."
                disabled={isLoading}
                className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600 pr-12 disabled:opacity-50"
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