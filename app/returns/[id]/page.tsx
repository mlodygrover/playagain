"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    Loader2, AlertOctagon, ArrowRight, CheckCircle2, MessageSquare, 
    ClipboardList, Mail, Phone, ShieldCheck, AlertTriangle, Clock, 
    PackageCheck, User, Info
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function ReturnPage() {
    // 1. Zmieniamy parametr na orderId zgodnie z nową strukturą folderów
    const params = useParams();
    const orderId = params?.orderId as string;
    
    const router = useRouter();
    const { user, token } = useAuth();

    const [loadingData, setLoadingData] = useState(true);
    const [returnDoc, setReturnDoc] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        reason: "",
        requestType: "REFUND",
        contactEmail: "",
        contactPhone: "",
        legalAccepted: false
    });
    const [submitting, setSubmitting] = useState(false);

    // 2. Poprawiona funkcja pobierania danych
    const fetchData = useCallback(async () => {
        if (!orderId) return;
        setLoadingData(true);
        setError(null);

        try {
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            // Pobieramy zwrot na podstawie ID ZAMÓWIENIA
            const res = await fetch(`${API_URL}/api/returns/by-order/${orderId}`, {
                headers
            });
            
            const data = await res.json();

            if (!res.ok) {
                // Obsługa autoryzacji dla zalogowanych
                if (res.status === 401 || res.status === 403) {
                    router.push(`/login?redirect=${window.location.pathname}`);
                    return;
                }
                throw new Error(data.error || "Błąd podczas pobierania danych zwrotu.");
            }

            setReturnDoc(data);

            // Pobieramy szczegóły zamówienia (wymaga tokena jeśli przypisane do konta)
            const orderRes = await fetch(`${API_URL}/api/orders/${data.order}`, {
                headers
            });
            const oData = await orderRes.json();
            
            if (orderRes.ok) {
                setOrderData(oData);
                // Ustawiamy domyślne dane kontaktowe tylko jeśli formularz jest czysty (status NONE)
                if (data.status === "NONE") {
                    setFormData(prev => ({
                        ...prev,
                        contactEmail: oData.customerDetails?.email || "",
                        contactPhone: oData.customerDetails?.phone || ""
                    }));
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingData(false);
        }
    }, [orderId, token, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnDoc) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/returns/request/${returnDoc.order}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json", 
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Błąd serwera");
            }
            
            await fetchData(); // Odśwież widok, aby pokazać status
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Inicjalizacja procedury...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
            <AlertOctagon className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2 uppercase">Błąd</h1>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link href="/" className="text-blue-500 underline text-sm">Wróć do strony głównej</Link>
        </div>
    );

    // --- WIDOK PODGLĄDU ZŁOŻONEGO ZGŁOSZENIA ---
    if (returnDoc && returnDoc.status !== "NONE") {
        const statusConfig: any = {
            REQUESTED: { label: "Oczekiwanie na weryfikację", color: "text-blue-500", bg: "bg-blue-500/10", icon: <Clock className="w-5 h-5" /> },
            SHIPPING: { label: "W drodze do serwisu", color: "text-orange-500", bg: "bg-orange-500/10", icon: <PackageCheck className="w-5 h-5" /> },
            COMPLETED: { label: "Zrealizowano", color: "text-green-500", bg: "bg-green-500/10", icon: <CheckCircle2 className="w-5 h-5" /> },
            REJECTED: { label: "Odrzucono", color: "text-red-500", bg: "bg-red-500/10", icon: <AlertOctagon className="w-5 h-5" /> }
        };

        const config = statusConfig[returnDoc.status] || statusConfig.REQUESTED;

        return (
            <div className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto animate-in fade-in duration-500">
                <div className="mb-10 flex justify-between items-end border-b border-zinc-900 pb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase text-white tracking-tighter">Status Zgłoszenia</h1>
                        <p className="text-zinc-500 mt-2 font-mono text-xs uppercase tracking-widest">Zamówienie #{orderId?.slice(-12)}</p>
                    </div>
                    <div className={`${config.bg} ${config.color} px-4 py-2 rounded-lg border border-zinc-800 flex items-center gap-3 font-bold text-xs uppercase tracking-widest`}>
                        {config.icon} {config.label}
                    </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-8 shadow-2xl space-y-8 relative">
                    <div className={`absolute top-0 left-0 w-full h-1 ${config.color.replace('text', 'bg')}`} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3 text-blue-600" /> Szczegóły
                            </h3>
                            <div className="space-y-2 text-sm text-zinc-400">
                                <p>Typ: <span className="text-white font-bold">{returnDoc.requestType === 'REFUND' ? 'Zwrot środków' : 'Naprawa/RMA'}</span></p>
                                <p>Data: <span className="text-white font-bold">{new Date(returnDoc.history.requestedAt).toLocaleDateString()}</span></p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3 text-blue-600" /> Kontakt
                            </h3>
                            <div className="space-y-2 text-sm text-zinc-400">
                                <p>E-mail: <span className="text-white font-bold">{returnDoc.contactEmail}</span></p>
                                <p>Telefon: <span className="text-white font-bold">{returnDoc.contactPhone}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-zinc-900">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-blue-600" /> Uzasadnienie
                        </h3>
                        <div className="bg-black border border-zinc-900 p-6 rounded-xl text-zinc-300 italic text-sm leading-relaxed">
                            "{returnDoc.reason}"
                        </div>
                    </div>

                    {returnDoc.adminNotes && (
                        <div className="bg-blue-600/5 border border-blue-600/20 p-6 space-y-2 rounded-xl">
                            <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Wiadomość od administratora</h4>
                            <p className="text-sm text-zinc-300">{returnDoc.adminNotes}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- WIDOK FORMULARZA ---
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
                <h1 className="text-4xl font-black uppercase text-white tracking-tighter flex items-center gap-4">
                    <ShieldCheck className="text-blue-600 w-10 h-10" /> Procedura Zwrotu
                </h1>
                <p className="text-zinc-500 mt-2 font-mono uppercase text-xs tracking-widest">Obsługa zamówienia #{orderId?.slice(-12)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-950 border border-zinc-900 p-8 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono text-blue-500">Typ zgłoszenia</label>
                        <select 
                            value={formData.requestType}
                            onChange={e => setFormData({...formData, requestType: e.target.value})}
                            className="w-full bg-black border border-zinc-800 p-4 text-sm text-white focus:border-blue-600 outline-none transition-colors"
                        >
                            <option value="REFUND">Zwrot pieniędzy (14 dni)</option>
                            <option value="REPAIR">Reklamacja techniczna</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Telefon do kontaktu</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
                            <input 
                                type="text"
                                value={formData.contactPhone}
                                onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                                className="w-full bg-black border border-zinc-800 py-4 pl-12 pr-4 text-sm text-white focus:border-blue-600 outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-blue-600" /> Uzasadnienie
                    </label>
                    <textarea 
                        required
                        value={formData.reason}
                        onChange={e => setFormData({...formData, reason: e.target.value})}
                        placeholder="Podaj szczegółowy powód zwrotu..."
                        className="w-full bg-black border border-zinc-800 p-4 text-sm text-white min-h-[140px] focus:border-blue-600 outline-none resize-none transition-all"
                    />
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase text-red-600 flex items-center gap-2 tracking-widest">
                        <AlertTriangle className="w-4 h-4" /> Informacje prawne
                    </h4>
                    <div className="text-[11px] text-zinc-500 leading-relaxed font-sans space-y-3">
                        <p>Oświadczam, że zapoznałem się z regulaminem zwrotów sklepu PlayAgain. Towar musi zostać odesłany w stanie niezmienionym w ciągu 14 dni od zgłoszenia na adres: <strong>Poznań, ul. Sofoklesa 32</strong>.</p>
                    </div>
                    <label className="flex items-start gap-4 cursor-pointer group pt-2">
                        <input 
                            type="checkbox" 
                            checked={formData.legalAccepted}
                            onChange={e => setFormData({...formData, legalAccepted: e.target.checked})}
                            className="mt-1 w-5 h-5 accent-blue-600"
                            required
                        />
                        <span className="text-[10px] text-zinc-400 uppercase font-bold group-hover:text-white transition-colors leading-tight">
                            Potwierdzam kompletność towaru i akceptuję procedurę RMA/Zwrotu.
                        </span>
                    </label>
                </div>

                <button 
                    type="submit"
                    disabled={submitting || !formData.legalAccepted}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.25em] py-5 flex items-center justify-center gap-3 transition-all disabled:opacity-20 disabled:grayscale shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <>Finalizuj Zgłoszenie <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>
        </div>
    );
}