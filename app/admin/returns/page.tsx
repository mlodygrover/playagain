"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  RotateCcw, Loader2, Search, Calendar, MessageSquare, 
  User, Save, Clock, Mail, Phone, ShieldCheck, 
  Info, ArrowUpRight, CheckCircle2, AlertCircle
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

type ReturnStatus = 'REQUESTED' | 'SHIPPING' | 'COMPLETED' | 'REJECTED';

export default function AdminReturnsPage() {
  const { token, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push("/");
    if (token) fetchReturns();
  }, [token, authLoading, isAdmin]);

  const fetchReturns = async () => {
    try {
      const res = await fetch(`${API_URL}/api/returns/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Błąd pobierania");
      const data = await res.json();
      setReturns(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReturn = async (id: string, status: ReturnStatus, adminNotes: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/api/returns/admin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
      });
      if (!res.ok) throw new Error("Błąd aktualizacji");
      setReturns(prev => prev.map(r => r._id === id ? { ...r, status, adminNotes } : r));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReturns = returns.filter(r => 
    r.order?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              <RotateCcw className="w-10 h-10 text-orange-500" />
              Centrum RMA & Zwrotów
            </h1>
            <p className="text-zinc-500 mt-2">Przetwarzanie zgłoszeń, weryfikacja stanu technicznego i obsługa zwrotów.</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="ID zamówienia, email, telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-8">
          {filteredReturns.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-800 border-dashed rounded-2xl">
              <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 uppercase font-bold tracking-widest text-sm">Brak zgłoszeń do procesowania</p>
            </div>
          ) : (
            filteredReturns.map((item) => (
              <ReturnRow 
                key={item._id} 
                item={item} 
                onUpdate={handleUpdateReturn} 
                isUpdating={updatingId === item._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const ReturnRow = ({ item, onUpdate, isUpdating }: any) => {
  const [localStatus, setLocalStatus] = useState(item.status);
  const [localNotes, setLocalNotes] = useState(item.adminNotes || "");

  const statusColors: any = {
    REQUESTED: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    SHIPPING: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    COMPLETED: "text-green-500 bg-green-500/10 border-green-500/20",
    REJECTED: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLUMNA 1: INFO PODSTAWOWE I TYP */}
        <div className="lg:col-span-3 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${item.requestType === 'REFUND' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                    {item.requestType === 'REFUND' ? 'Odstąpienie od umowy' : 'Reklamacja / RMA'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-xl font-black text-white">#{item.order?.slice(-8).toUpperCase()}</p>
                <Link href={`/admin/orders/${item.order}`} className="text-zinc-600 hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>
          </div>

          <div className="space-y-2 bg-black/40 p-4 border border-zinc-900 rounded-xl">
            <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300 truncate">{item.contactEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300 font-mono">{item.contactPhone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex-1 text-center py-2 rounded font-black text-[10px] border uppercase tracking-widest ${statusColors[item.status]}`}>
                {item.status}
            </div>
            {item.legalAccepted && (
                <div className="bg-green-500/10 border border-green-500/30 p-2 rounded" title="Zaakceptowano warunki prawne">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
            )}
          </div>
        </div>

        {/* KOLUMNA 2: TREŚĆ UZASADNIENIA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                <MessageSquare className="w-3 h-3 text-blue-500" /> Opis problemu
            </div>
            <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3"/> {new Date(item.history.requestedAt).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl text-sm text-zinc-300 leading-relaxed italic relative">
            <Info className="absolute top-4 right-4 w-4 h-4 text-zinc-800" />
            "{item.reason}"
          </div>

          <div className="flex gap-4">
             {item.history.shippingAt && (
                <div className="text-[10px] text-orange-500 bg-orange-500/5 border border-orange-500/10 px-2 py-1 rounded">
                    📦 Wysłano do serwisu: {new Date(item.history.shippingAt).toLocaleDateString()}
                </div>
             )}
          </div>
        </div>

        {/* KOLUMNA 3: PANEL AKCJI ADMINA */}
        <div className="lg:col-span-4 space-y-4 border-l border-zinc-900 lg:pl-8">
          <div className="space-y-4">
            <div>
                <label className="text-[10px] text-zinc-600 uppercase font-black mb-2 block tracking-widest">Aktualizuj Status</label>
                <select 
                    value={localStatus}
                    onChange={(e) => setLocalStatus(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-orange-500 transition-colors"
                >
                    <option value="REQUESTED">Zgłoszony (Weryfikacja)</option>
                    <option value="SHIPPING">Wysłany (W drodze do nas)</option>
                    <option value="COMPLETED">Zatwierdzony (Koniec)</option>
                    <option value="REJECTED">Odrzucony / Zamknięty</option>
                </select>
            </div>

            <div>
                <label className="text-[10px] text-zinc-600 uppercase font-black mb-2 block tracking-widest">Twoja Notatka (Widoczna dla klienta)</label>
                <textarea 
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    placeholder="Np: 'Czekamy na odbiór przez kuriera', 'Zwrócono środki na konto'..."
                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-orange-500 min-h-[100px] resize-none transition-colors"
                />
            </div>

            <button
                onClick={() => onUpdate(item._id, localStatus, localNotes)}
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/10"
            >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Aktualizuj Zgłoszenie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};