"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
    ArrowLeft, Trash2, CheckCircle, XCircle, ExternalLink,
    Plus, Edit2, ShoppingBag, Globe, Save, X, CircuitBoard, AlertTriangle, Wand2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5009";

export default function ComponentDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [data, setData] = useState<any>(null);
    const [compatibleMobos, setCompatibleMobos] = useState<any[]>([]); // Stan dla płyt
    const [loading, setLoading] = useState(true);
    const [loadingMobos, setLoadingMobos] = useState(false); // Ładowanie tworzenia płyt

    // Modal Ofert
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
    const [offerForm, setOfferForm] = useState<any>({
        title: "", price: "", url: "", platform: "Allegro", externalId: ""
    });

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/api/components/${id}`);
            if (!res.ok) throw new Error("404");
            const json = await res.json();
            setData(json);

            // Jeśli to CPU, pobierz kompatybilne płyty
            if (json.component && json.component.type === 'CPU' && json.component.socket) {
                fetchCompatibleMobos(json.component.socket);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Funkcja pobierająca płyty dla socketu
    const fetchCompatibleMobos = async (socket: string) => {
        try {
            const res = await fetch(`${API_URL}/api/components?type=Motherboard&socket=${encodeURIComponent(socket)}`);
            const mobos = await res.json();
            setCompatibleMobos(mobos);
        } catch (e) {
            console.error("Błąd pobierania płyt:", e);
        }
    };

    // Funkcja generująca szablony płyt
    const handleCreateTemplates = async () => {
        if (!token) return alert("Brak autoryzacji");
        if (!data?.component?.socket) return alert("Brak danych o sockecie");

        if (!confirm(`Czy chcesz automatycznie utworzyć 3 szablony płyt głównych (ATX, Micro-ATX, Mini-ITX) dla socketu ${data.component.socket}?`)) return;

        setLoadingMobos(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/create-mobo-templates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ socket: data.component.socket })
            });

            if (!res.ok) throw new Error("Błąd tworzenia");

            // Odśwież listę płyt
            await fetchCompatibleMobos(data.component.socket);
            alert("Szablony utworzone pomyślnie!");

        } catch (err: any) {
            alert("Błąd: " + err.message);
        } finally {
            setLoadingMobos(false);
        }
    };

    // --- AKCJE NA OFERTACH (BEZ ZMIAN) ---
    const handleDeleteOffer = async (offerId: string) => {
        if (!confirm("Usunąć tę ofertę?")) return;
        if (!token) return alert("Brak autoryzacji.");
        await fetch(`${API_URL}/api/components/offer/${offerId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
        fetchDetails();
    };

    const handleToggleActive = async (offerId: string, currentStatus: boolean) => {
        if (!token) return alert("Brak autoryzacji.");
        await fetch(`${API_URL}/api/components/offer/${offerId}`, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ isActive: !currentStatus }) });
        fetchDetails();
    };

    const handleSaveOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return alert("Brak autoryzacji.");
        const url = editingOfferId ? `${API_URL}/api/components/offer/${editingOfferId}` : `${API_URL}/api/components/${id}/offers`;
        const method = editingOfferId ? "PUT" : "POST";
        const payload = { ...offerForm };
        if (!editingOfferId && !payload.externalId) payload.externalId = "manual-" + Date.now();

        try {
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error("Błąd zapisu");
            setIsOfferModalOpen(false); setEditingOfferId(null); fetchDetails();
        } catch (err: any) { alert("Błąd: " + err.message); }
    };

    const openAddOffer = () => { setEditingOfferId(null); setOfferForm({ title: "", price: "", url: "", platform: "Allegro", externalId: "" }); setIsOfferModalOpen(true); };
    const openEditOffer = (offer: any) => { setEditingOfferId(offer._id); setOfferForm({ title: offer.title, price: offer.price, url: offer.url, platform: offer.platform, externalId: offer.externalId }); setIsOfferModalOpen(true); };

    if (loading) return <div className="min-h-screen bg-black pt-32 text-center text-zinc-500">Ładowanie danych...</div>;
    if (!data) return <div className="min-h-screen bg-black pt-32 text-center text-red-500">Komponent nie istnieje.</div>;

    const { component, offers } = data;
    const isCpu = component.type === 'CPU';

    return (
        <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
            <div className="max-w-6xl mx-auto">

                <button onClick={() => router.back()} className="text-zinc-500 hover:text-white flex items-center gap-2 mb-6 text-sm uppercase font-bold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Lista Komponentów
                </button>

                {/* INFO O KOMPONENCIE */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 mb-8 rounded-lg flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-600 text-xs px-2 py-1 font-bold uppercase rounded">{component.type}</span>
                            <h1 className="text-3xl font-black uppercase tracking-tight">{component.name}</h1>
                        </div>
                        <p className="text-zinc-500 font-mono text-sm">Query: <span className="text-zinc-300">"{component.searchQuery}"</span></p>
                        {/* Wyświetlanie specyfikacji w nagłówku */}
                        <div className="flex gap-4 mt-4 text-sm text-zinc-400 font-mono">
                            {component.socket && <span>Socket: <strong className="text-white">{component.socket}</strong></span>}
                            {component.chipset && <span>Chipset: <strong className="text-white">{component.chipset}</strong></span>}
                            {component.formFactor && <span>Format: <strong className="text-white">{component.formFactor}</strong></span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase font-mono mb-1">Średnia Rynkowa</p>
                        <p className="text-3xl font-bold text-green-500">{component.stats?.averagePrice || 0} <span className="text-sm text-zinc-600">PLN</span></p>
                    </div>
                </div>

                {/* --- SEKCJA KOMPATYBILNOŚCI (TYLKO DLA CPU) --- */}
                {isCpu && (
                    <div className={`mb-12 border rounded-lg p-6 ${compatibleMobos.length === 0 ? 'bg-red-950/10 border-red-900/30' : 'bg-zinc-900/20 border-zinc-800'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                                {compatibleMobos.length === 0 ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <CircuitBoard className="w-5 h-5 text-blue-500" />}
                                Kompatybilne Płyty Główne ({component.socket})
                            </h2>

                            {/* Przycisk generowania */}
                            {compatibleMobos.length === 0 && (
                                <button
                                    onClick={handleCreateTemplates}
                                    disabled={loadingMobos}
                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-xs font-bold uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {loadingMobos ? "Tworzenie..." : "Utwórz Szablony (3)"} <Wand2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {compatibleMobos.length === 0 ? (
                            <p className="text-red-400 text-sm font-mono">
                                UWAGA: Ten procesor nie ma zdefiniowanych kompatybilnych płyt głównych w bazie dla socketu <strong>{component.socket}</strong>.
                                Klienci nie będą mogli skonfigurować zestawu! Kliknij przycisk powyżej, aby naprawić.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {compatibleMobos.map((mobo: any) => (
                                    <Link key={mobo._id} href={`/admin/components/${mobo._id}`} className="block">
                                        <div className="bg-black border border-zinc-800 hover:border-blue-500 p-3 rounded group transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-zinc-500 uppercase">{mobo.formFactor}</span>
                                                <span className="text-xs text-green-500 font-mono">{mobo.stats?.lowestPrice} zł</span>
                                            </div>
                                            <h4 className="font-bold text-white text-sm group-hover:text-blue-400 truncate">{mobo.name}</h4>
                                            <div className="text-[10px] text-zinc-600 mt-1">Ofert: {mobo.stats?.offersCount || 0}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- HEADER SEKCJI OFERT --- */}
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                        Oferty <span className="text-zinc-500 text-sm font-normal">({offers.length})</span>
                    </h2>
                    <button onClick={openAddOffer} className="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded font-bold uppercase flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Dodaj Ofertę Ręcznie
                    </button>
                </div>

                {/* LISTA OFERT (Bez zmian) */}
                <div className="space-y-2">
                    {offers.map((offer: any) => (
                        <div key={offer._id} className={`p-4 border rounded flex items-center justify-between transition-colors group ${offer.isActive ? 'bg-zinc-900 border-zinc-800' : 'bg-red-950/20 border-red-900/30 opacity-70'}`}>
                            <div className="flex items-center gap-4 flex-grow">
                                <button onClick={() => handleToggleActive(offer._id, offer.isActive)} title={offer.isActive ? "Dezaktywuj" : "Aktywuj"}>
                                    {offer.isActive ? <CheckCircle className="w-5 h-5 text-green-500 hover:text-green-400" /> : <XCircle className="w-5 h-5 text-red-500 hover:text-red-400" />}
                                </button>
                                <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-700">
                                    {offer.imageUrl ? <img src={offer.imageUrl} className="w-full h-full object-contain" alt="" /> : <ShoppingBag className="w-6 h-6 text-black/30" />}
                                </div>
                                <div className="min-w-0">
                                    <a href={offer.url} target="_blank" className="font-bold text-sm text-zinc-200 hover:text-blue-400 line-clamp-1 flex items-center gap-2 transition-colors">
                                        {offer.title} <ExternalLink className="w-3 h-3 text-zinc-600" />
                                    </a>
                                    <div className="flex gap-3 text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wide">
                                        <span className={`font-bold flex items-center gap-1 ${offer.platform === 'Allegro' ? 'text-orange-500' : 'text-blue-500'}`}><Globe className="w-3 h-3" /> {offer.platform}</span>
                                        <span>ID: {offer.externalId}</span>
                                        <span>Data: {new Date(offer.lastChecked).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 pl-4">
                                <span className="block font-bold font-mono text-white text-lg text-right w-24">{offer.price} zł</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditOffer(offer)} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteOffer(offer._id)} className="p-2 bg-zinc-800 hover:bg-red-900/50 text-red-500 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {offers.length === 0 && (
                        <div className="p-12 text-center text-zinc-500 border border-zinc-800 border-dashed rounded bg-zinc-900/20">
                            Brak ofert dla tego komponentu. Uruchom scraper lub dodaj ofertę ręcznie.
                        </div>
                    )}
                </div>

                {/* MODAL (Bez zmian) */}
                {isOfferModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-6 rounded shadow-2xl">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-lg font-bold uppercase text-white">{editingOfferId ? "Edytuj Ofertę" : "Dodaj Ofertę"}</h2><button onClick={() => setIsOfferModalOpen(false)}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button></div>
                            <form onSubmit={handleSaveOffer} className="space-y-4">
                                <div className="space-y-1"><label className="text-xs text-zinc-500 uppercase">Tytuł Oferty</label><input className="w-full bg-zinc-900 border border-zinc-700 p-2 text-sm text-white focus:border-blue-500 rounded outline-none" value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} required /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs text-zinc-500 uppercase">Cena (PLN)</label><input type="number" step="0.01" className="w-full bg-zinc-900 border border-zinc-700 p-2 text-sm text-white focus:border-blue-500 rounded outline-none" value={offerForm.price} onChange={e => setOfferForm({ ...offerForm, price: e.target.value })} required /></div>
                                    <div className="space-y-1"><label className="text-xs text-zinc-500 uppercase">Platforma</label><select className="w-full bg-zinc-900 border border-zinc-700 p-2 text-sm text-white focus:border-blue-500 rounded outline-none" value={offerForm.platform} onChange={e => setOfferForm({ ...offerForm, platform: e.target.value })}><option value="Allegro">Allegro</option><option value="eBay">eBay</option><option value="Sklep">Sklep (Inny)</option></select></div>
                                </div>
                                <div className="space-y-1"><label className="text-xs text-zinc-500 uppercase">URL do oferty</label><input className="w-full bg-zinc-900 border border-zinc-700 p-2 text-sm text-white focus:border-blue-500 rounded outline-none" value={offerForm.url} onChange={e => setOfferForm({ ...offerForm, url: e.target.value })} placeholder="https://..." required /></div>
                                {!editingOfferId && <div className="space-y-1"><label className="text-xs text-zinc-500 uppercase">Zewnętrzne ID (Opcjonalne)</label><input className="w-full bg-zinc-900 border border-zinc-700 p-2 text-sm text-zinc-400 focus:border-blue-500 rounded outline-none" value={offerForm.externalId} onChange={e => setOfferForm({ ...offerForm, externalId: e.target.value })} placeholder="Pozostaw puste dla auto-generowania" /></div>}
                                <button type="submit" className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded font-bold uppercase mt-4 flex items-center justify-center gap-2 transition-colors"><Save className="w-4 h-4" /> Zapisz Ofertę</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}