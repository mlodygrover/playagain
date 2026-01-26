"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { 
  Loader2, ArrowLeft, Package, CreditCard, 
  RotateCcw, MapPin, Calendar, ShieldCheck, 
  ChevronRight, AlertCircle, Printer
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [returnInfo, setReturnInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrderAndReturn = async () => {
      try {
        // 1. Pobierz dane zamówienia
        const orderRes = await fetch(`${API_URL}/api/orders/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!orderRes.ok) throw new Error("Nie znaleziono zamówienia.");
        const orderData = await orderRes.json();
        setOrder(orderData);
        console.log("TEST1", orderData)
        // 2. Pobierz dane zwrotu (jeśli zamówienie jest PAID)
        if (orderData.status === "PAID") {
          const returnRes = await fetch(`${API_URL}/api/returns/by-order/${id}`, { // Szukamy po orderId wg Opcji B
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (returnRes.ok) {
            const returnData = await returnRes.json();
            setReturnInfo(returnData);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndReturn();
  }, [id, token, router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-xl font-bold uppercase mb-4 text-white">Wystąpił błąd</h1>
      <p className="text-zinc-500 mb-8">{error}</p>
      <Link href="/profil" className="bg-zinc-900 px-6 py-2 text-white text-xs font-bold uppercase tracking-widest">Wróć do profilu</Link>
    </div>
  );
  console.log(order)
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* NAGŁÓWEK I POWRÓT */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/profil" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Powrót do historii
          </Link>
          <button onClick={() => window.print()} className="text-zinc-500 hover:text-white transition-colors">
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLUMNA LEWA: STATUSY I INFO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'PAID' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Status zamówienia</span>
                        <h2 className={`text-2xl font-black uppercase tracking-tight ${order.status === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {order.status === 'PAID' ? 'Opłacone' : 'Oczekuje na płatność'}
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Data złożenia</span>
                        <p className="font-mono text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* AKCJA: PŁATNOŚĆ (jeśli PENDING) */}
                {order.status === 'PENDING' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-8 h-8 text-yellow-500" />
                            <p className="text-sm text-yellow-200">Zamówienie nie zostało jeszcze opłacone. Dokończ płatność przez Tpay.</p>
                        </div>
                        {/* Zakładamy, że w modelu Order przechowujesz paymentUrl lub generujesz go na nowo */}
                        <button 
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 uppercase text-[10px] tracking-widest transition-all w-full sm:w-auto"
                            onClick={() => window.location.href = order.paymentUrl || '/koszyk'} 
                        >
                            Zapłać teraz
                        </button>
                    </div>
                )}

                {/* AKCJA: ZWROT (jeśli PAID) */}
                {order.status === 'PAID' && returnInfo && (
                    <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <RotateCcw className={`w-8 h-8 ${returnInfo.status !== 'NONE' ? 'text-blue-500' : 'text-zinc-500'}`} />
                            <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">Odstąpienie od umowy</p>
                                <p className="text-[11px] text-zinc-400">Masz 14 dni na zwrot sprzętu bez podania przyczyny.</p>
                            </div>
                        </div>
                        <Link 
                            href={`/returns/${returnInfo._id}`}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 uppercase text-[10px] tracking-widest transition-all w-full sm:w-auto text-center"
                        >
                            {returnInfo.status === 'NONE' ? 'Zgłoś zwrot' : 'Sprawdź status zwrotu'}
                        </Link>
                    </div>
                )}
            </div>

            {/* List of items */}
            <div className="bg-zinc-900/10 border border-zinc-800 p-8">
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-6 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Zawartość paczki
                </h3>
                <div className="space-y-4">
                    {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-4 border-b border-zinc-800/50 last:border-0">
                            <div>
                                <p className="font-bold text-white">{item.name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-mono">Pojedynczy komponent</p>
                            </div>
                            <p className="font-mono font-bold text-zinc-300">{item.price} PLN</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* KOLUMNA PRAWA: PODSUMOWANIE & ADRES */}
          <div className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Adres Dostawy
                </h3>
                <div className="text-sm text-zinc-300 space-y-1">
                    <p className="font-bold text-white mb-2">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</p>
                    <p>{order.customerDetails?.address}</p>
                    <p>{order.customerDetails?.zipCode} {order.customerDetails?.city}</p>
                    <p className="pt-2 text-zinc-500">{order.customerDetails?.email}</p>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-xs font-black uppercase text-zinc-500 mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Finanse
                </h3>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 font-mono">Kwota netto</span>
                        <span className="text-zinc-300 font-mono">{(order.totalAmount * 0.77).toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 font-mono">Podatek (0%)</span>
                        <span className="text-zinc-300 font-mono">0.00 PLN</span>
                    </div>
                </div>
                <div className="border-t border-zinc-800 pt-4 flex justify-between items-end">
                    <span className="font-black uppercase text-xs">Razem</span>
                    <span className="text-2xl font-black text-blue-500 font-mono">{order.totalAmount} PLN</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}