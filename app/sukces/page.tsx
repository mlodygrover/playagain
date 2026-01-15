"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useRef } from "react"; // <--- 1. Dodaj useRef
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();
  
  // 2. Flaga sprawdzająca, czy kod już się wykonał
  const hasRun = useRef(false);

  useEffect(() => {
    // 3. Wykonaj tylko jeśli mamy orderId I jeszcze nie czyściliśmy koszyka
    if (orderId && !hasRun.current) {
        clearCart();
        hasRun.current = true; // Zaznacz, że wykonano
    }
  }, [orderId, clearCart]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
        
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Płatność Przyjęta!</h1>
          <p className="text-zinc-400">
            Dziękujemy za zakupy w PlayAgain. Twoje zamówienie zostało przekazane do realizacji.
          </p>
          {orderId && (
             <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-500 inline-block rounded">
               Zamówienie #{orderId}
             </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            href="/profil" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> Śledź status zamówienia
          </Link>
          <Link 
            href="/" 
            className="text-zinc-500 hover:text-white underline text-sm"
          >
            Wróć do strony głównej
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SuccessContent />
    </Suspense>
  )
}