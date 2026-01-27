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
    const params = useParams();
    // Skorelowane z Twoją ścieżką /returns/[id]
    const orderId = params?.id as string;

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

    // Wewnątrz fetchData w ReturnPage
    const fetchData = useCallback(async () => {
        if (!orderId) return;
        setLoadingData(true);
        setError(null);
        try {
            const headers: any = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/returns/by-order/${orderId}`, { headers });
            const data = await res.json();

            if (!res.ok) {
                // KLUCZOWA ZMIANA: Przekieruj na login TYLKO jeśli serwer wyraźnie 
                // mówi, że TO zamówienie wymaga zalogowania (nie każde!)
                if (res.status === 401 && token) { // Jeśli miałeś token a wygasł
                    router.push(`/login?redirect=${window.location.pathname}`);
                    return;
                }

                // Jeśli nie ma tokenu i dostaliśmy 401, a zamówienie jest Usera,
                // to backend powinien zwrócić jasny błąd, który wyświetlimy na ekranie
                throw new Error(data.error || "Błąd dostępu.");
            }

            setReturnDoc(data);
            // ... reszta pobierania danych

            const orderRes = await fetch(`${API_URL}/api/orders/${data.order}`, { headers });
            if (orderRes.ok) {
                const oData = await orderRes.json();
                setOrderData(oData);

                if (data.status === "NONE") {
                    setFormData(prev => ({
                        ...prev,
                        contactEmail: oData.customerDetails?.email || "",
                        contactPhone: oData.customerDetails?.phone || ""
                    }));
                }
            }
        } catch (err: any) {
            console.error("Fetch Error:", err);
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

            await fetchData();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Poniżej renderowanie Twojego UI (bez zmian) ---
    if (loadingData) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Weryfikacja sesji...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-center px-4">
            <AlertOctagon className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2 uppercase">Błąd dostępu</h1>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link href="/" className="bg-zinc-900 border border-zinc-800 px-6 py-2 text-white text-xs uppercase font-bold tracking-widest transition-colors hover:bg-zinc-800">
                Wróć do strony głównej
            </Link>
        </div>
    );

    if (returnDoc && returnDoc.status !== "NONE") {
        const statusConfig: any = {
            REQUESTED: { label: "Oczekiwanie", color: "text-blue-500", icon: <Clock className="w-5 h-5" /> },
            SHIPPING: { label: "W transporcie", color: "text-orange-500", icon: <PackageCheck className="w-5 h-5" /> },
            COMPLETED: { label: "Zakończono", color: "text-green-500", icon: <CheckCircle2 className="w-5 h-5" /> },
            REJECTED: { label: "Odrzucono", color: "text-red-500", icon: <AlertOctagon className="w-5 h-5" /> }
        };
        const config = statusConfig[returnDoc.status] || statusConfig.REQUESTED;

        return (
            <div className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto">
                <div className="mb-10 flex justify-between items-end border-b border-zinc-900 pb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase text-white tracking-tighter">Status RMA</h1>
                        <p className="text-zinc-500 mt-2 font-mono text-xs uppercase tracking-widest">Zamówienie #{orderId?.slice(-8)}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 ${config.color} text-[10px] font-black uppercase tracking-widest`}>
                        {config.icon} {config.label}
                    </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-8 shadow-2xl space-y-8 relative">
                    <div className={`absolute top-0 left-0 w-full h-1 ${config.color.replace('text', 'bg')}`} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Info className="w-3 h-3 text-blue-600" /> Szczegóły</h3>
                            <div className="space-y-2 text-sm text-zinc-400">
                                <p>Typ: <span className="text-white font-bold">{returnDoc.requestType === 'REFUND' ? 'Zwrot pieniędzy' : 'Naprawa'}</span></p>
                                <p>Zgłoszono: <span className="text-white font-bold">{new Date(returnDoc.history.requestedAt).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3 text-blue-600" /> Kontakt</h3>
                            <div className="space-y-2 text-sm text-zinc-400">
                                <p>E-mail: <span className="text-white font-bold">{returnDoc.contactEmail}</span></p>
                                <p>Telefon: <span className="text-white font-bold">{returnDoc.contactPhone}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-zinc-900">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-3 h-3 text-blue-600" /> Twoje uzasadnienie</h3>
                        <div className="bg-black border border-zinc-900 p-6 rounded-xl text-zinc-300 italic text-sm leading-relaxed">"{returnDoc.reason}"</div>
                    </div>
                    {returnDoc.adminNotes && (
                        <div className="bg-blue-600/5 border border-blue-600/20 p-6 space-y-2 rounded-xl">
                            <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Informacja od serwisu</h4>
                            <p className="text-sm text-zinc-300">{returnDoc.adminNotes}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 max-w-3xl mx-auto">
            <div className="mb-10">
                <h1 className="text-4xl font-black uppercase text-white tracking-tighter flex items-center gap-4">
                    <ShieldCheck className="text-blue-600 w-10 h-10" /> Formularz Zwrotu
                </h1>
                <p className="text-zinc-500 mt-2 font-mono uppercase text-xs tracking-widest">Dla zamówienia #{orderId?.slice(-12)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-950 border border-zinc-900 p-8 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono text-blue-500">Oczekiwanie</label>
                        <select
                            value={formData.requestType}
                            onChange={e => setFormData({ ...formData, requestType: e.target.value })}
                            className="w-full bg-black border border-zinc-800 p-4 text-sm text-white focus:border-blue-600 outline-none transition-colors"
                        >
                            <option value="REFUND">Zwrot pieniędzy (14 dni)</option>
                            <option value="REPAIR">Naprawa / Serwis</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Telefon do kontaktu</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-4 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                value={formData.contactPhone}
                                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                className="w-full bg-black border border-zinc-800 py-4 pl-12 pr-4 text-sm text-white focus:border-blue-600 outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-3 h-3 text-blue-600" /> Powód zwrotu</label>
                    <textarea
                        required
                        value={formData.reason}
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Podaj szczegółowy powód..."
                        className="w-full bg-black border border-zinc-800 p-4 text-sm text-white min-h-[140px] focus:border-blue-600 outline-none resize-none transition-all"
                    />
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 space-y-4">
                    <h4 className="text-xs font-black uppercase text-red-600 flex items-center gap-2 tracking-widest"><AlertTriangle className="w-4 h-4" /> Informacje prawne</h4>
                    <div className="text-[11px] text-zinc-500 leading-relaxed font-sans space-y-3">
                        <p>
                            Towar musi zostać odesłany w ciągu <strong>14 dni</strong> od daty zgłoszenia chęci zwrotu na adres:
                            <strong className="text-zinc-300"> Jan Wiczyński, Poznań, ul. Sofoklesa 32</strong>.
                        </p>

                        <ul className="list-disc pl-4 space-y-1 text-zinc-500">
                            <li>
                                <strong className="text-zinc-400 uppercase text-[9px]">Stan towaru:</strong> Produkt musi zostać zwrócony w stanie niezmienionym (brak śladów użytkowania, nienaruszone plomby gwarancyjne).
                            </li>
                            <li>
                                <strong className="text-zinc-400 uppercase text-[9px]">Odpowiedzialność:</strong> Konsument ponosi odpowiedzialność za zmniejszenie wartości rzeczy będące wynikiem korzystania z niej w sposób wykraczający poza konieczny do stwierdzenia charakteru, cech i funkcjonowania rzeczy. W takim przypadku kwota zwrotu zostanie pomniejszona o koszty przywrócenia towaru do stanu pierwotnego.
                            </li>
                            <li>
                                <strong className="text-zinc-400 uppercase text-[9px]">Koszty wysyłki:</strong> Bezpośredni koszt zwrotu towaru (wysyłka do sprzedawcy) ponosi <strong className="text-zinc-400">Kupujący</strong>.
                            </li>
                            <li>
                                <strong className="text-zinc-400 uppercase text-[9px]">Zabezpieczenie:</strong> Prosimy o staranne zapakowanie przesyłki, aby uniknąć uszkodzeń w transporcie.
                            </li>
                        </ul>
                    </div>
                    <label className="flex items-start gap-4 cursor-pointer group pt-2">
                        <input
                            type="checkbox"
                            checked={formData.legalAccepted}
                            onChange={e => setFormData({ ...formData, legalAccepted: e.target.checked })}
                            className="mt-1 w-5 h-5 accent-blue-600"
                            required
                        />
                        <span className="text-[10px] text-zinc-400 uppercase font-bold group-hover:text-white transition-colors leading-tight">Potwierdzam kompletność towaru i akceptuję regulamin.</span>
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={submitting || !formData.legalAccepted}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.25em] py-5 flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)]"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <>Prześlij Zgłoszenie <ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>
        </div>
    );
}