"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Sparkles } from "lucide-react"; // Zmieniona ikona

// Mock AI logic
const generateResponse = (input: string) => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes("gpu") || lowerInput.includes("karta")) {
    return "Do gier w 1080p polecam RTX 3060. Jeśli celujesz w 1440p, wybierz RTX 4070 Ti.";
  }
  if (lowerInput.includes("cpu") || lowerInput.includes("procesor")) {
    return "Intel i5-12400F to świetny wybór budżetowy. i9-13900K to bestia do pracy i streamingu.";
  }
  return "Jestem asystentem konfiguracji. Zapytaj mnie o GPU, CPU lub RAM, a pomogę Ci wybrać!";
};

interface ChatbotProps {
  externalOpen?: boolean;
  onClose?: () => void;
}

export function Chatbot({ externalOpen = false, onClose }: ChatbotProps) {
  // Stan lokalny + synchronizacja z propsem externalOpen
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (externalOpen) setIsOpen(true);
  }, [externalOpen]);

  // Funkcja zamykania (obsługuje też reset flagi w rodzicu)
  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState && onClose) onClose(); // Informujemy rodzica o zamknięciu
  };

  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
    { text: "Cześć! Jestem Twoim asystentem AI. Nie wiesz co wybrać? Chętnie pomogę!", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { text: inputText, sender: "user" }]);
    setTimeout(() => {
      const response = generateResponse(inputText);
      setMessages((prev) => [...prev, { text: response, sender: "bot" }]);
    }, 1000);
    setInputText("");
  };

  return (
    <>
      {/* Przycisk Toggle (Pływający) */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-500 group ${
          isOpen 
            ? "bg-zinc-900 border border-zinc-700 rotate-90" 
            : "bg-gradient-to-tr from-blue-600 to-purple-600 hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          // Nowa ikona: Sparkles (sugeruje magię/AI)
          <div className="relative">
            <Sparkles className="w-6 h-6 text-white group-hover:animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border border-black"></span>
          </div>
        )}
      </button>

      {/* Okno Czatu */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[60vh] max-h-[600px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Header z gradientem */}
          <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI Configurator</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Neural Net Active</span>
              </div>
            </div>
          </div>

          {/* Wiadomości */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row animate-in fade-in slide-in-from-left-2"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-zinc-800" : "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"}`}>
                  {msg.sender === "user" ? <User className="w-4 h-4 text-zinc-400" /> : <Sparkles className="w-4 h-4 text-white" />}
                </div>
                <div className={`p-3 text-sm max-w-[85%] leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-zinc-800 text-white rounded-2xl rounded-tr-none" 
                      : "bg-zinc-900/80 border border-white/5 text-zinc-200 rounded-2xl rounded-tl-none shadow-sm"
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-800 bg-black/40 backdrop-blur-sm">
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Np. tani zestaw do CS:GO..."
                className="flex-grow bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600 pr-12"
              />
              <button onClick={handleSendMessage} className="absolute right-2 top-1.5 bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}