"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
const server_port = "http://localhost:5009";
function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Weryfikacja tokena...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Brak tokena weryfikacyjnego.");
      return;
    }

    // Strzał do backendu (Port 5009)
    fetch(`${server_port}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Twoje konto zostało aktywowane!");
        } else {
          setStatus("error");
          setMessage(data.error || "Weryfikacja nieudana.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Błąd połączenia z serwerem.");
      });
  }, [token]);

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 bg-black">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Dekoracja */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          status === "success" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-blue-500"
        }`} />

        <div className="flex justify-center mb-6">
          {status === "loading" && <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in" />}
          {status === "error" && <XCircle className="w-16 h-16 text-red-500 animate-in zoom-in" />}
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">
          {status === "loading" && "Weryfikacja..."}
          {status === "success" && "Sukces!"}
          {status === "error" && "Błąd!"}
        </h1>

        <p className="text-zinc-400 mb-8 font-mono text-sm">{message}</p>

        {status === "success" && (
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest px-8 py-3 transition-all"
          >
            Zaloguj się teraz <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        {status === "error" && (
          <Link href="/login" className="text-zinc-500 hover:text-white underline text-sm">
            Wróć do logowania
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VerifyContent />
    </Suspense>
  );
}