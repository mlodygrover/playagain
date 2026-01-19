
export const dynamic = 'force-dynamic';
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    Plus, Edit, Trash2, Save, X, Search, RefreshCcw,
    Monitor, Cpu, CircuitBoard, HardDrive, Box, Zap, Fan, MemoryStick, TrendingUp,
    FileJson, CheckCircle, AlertTriangle, Sparkles, Loader2, CheckSquare, Square, Wand2,
    ArrowUpDown, Calculator
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

const Input = ({ label, name, val, set, type = "text", placeholder, required = false }: any) => (
    <div className="w-full">
        <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={val?.[name] || ""}
            onChange={(e) => set((prev: any) => ({ ...prev, [name]: e.target.value }))}
            placeholder={placeholder}
            required={required}
            className="w-full bg-zinc-900 border border-zinc-700 p-3 text-sm text-white focus:border-blue-500 outline-none rounded transition-colors"
        />
    </div>
);

export default function ComponentsManager() {
    const { token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [components, setComponents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreatingMobos, setIsCreatingMobos] = useState(false);

    const [isRecalculating, setIsRecalculating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 1. INICJALIZACJA STANU ---
    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        type: searchParams.get("type") || "ALL",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        sortBy: searchParams.get("sortBy") || "lowestPrice-asc"
    });

    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    const [type, setType] = useState("GPU");
    const [formData, setFormData] = useState<any>({});
    const [jsonInput, setJsonInput] = useState("");
    const [importType, setImportType] = useState("GPU");
    const [importStatus, setImportStatus] = useState<{ msg: string, type: 'info' | 'error' | 'success' } | null>(null);

    const [socketMoboMap, setSocketMoboMap] = useState<Record<string, boolean>>({});

    const normalizeSocket = (s: string | undefined) => {
        if (!s) return "UNKNOWN";
        return s.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
    };

    // --- POBIERANIE MAPY PŁYT ---
    useEffect(() => {
        fetchMoboMap();
    }, []);

    const fetchMoboMap = async () => {
        try {
            const res = await fetch(`${API_URL}/api/components?type=Motherboard`);
            const mobos = await res.json();
            const map: Record<string, boolean> = {};
            mobos.forEach((m: any) => {
                if (m.socket) map[normalizeSocket(m.socket)] = true;
            });
            setSocketMoboMap(map);
        } catch (err) {
            console.error("Błąd mapy płyt:", err);
        }
    };

    // --- 2. LOGIKA AKTUALIZACJI URL I DEBOUNCE ---
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);

            const params = new URLSearchParams();
            if (filters.search) params.set("search", filters.search);
            if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
            if (filters.minPrice) params.set("minPrice", filters.minPrice);
            if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
            if (filters.sortBy) params.set("sortBy", filters.sortBy);

            router.replace(`?${params.toString()}`, { scroll: false });
        }, 500);

        return () => clearTimeout(handler);
    }, [filters, router]);

    // --- 3. POBIERANIE DANYCH + SORTOWANIE FRONTENDOWE ---
    useEffect(() => {
        fetchComponents();
    }, [debouncedFilters]);

    const fetchComponents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedFilters.search) params.append("search", debouncedFilters.search);
            if (debouncedFilters.type !== "ALL") params.append("type", debouncedFilters.type);
            if (debouncedFilters.minPrice) params.append("minPrice", debouncedFilters.minPrice);
            if (debouncedFilters.maxPrice) params.append("maxPrice", debouncedFilters.maxPrice);

            const res = await fetch(`${API_URL}/api/components?${params.toString()}`);
            let data = await res.json();

            // --- LOGIKA SORTOWANIA CLIENT-SIDE ---
            if (debouncedFilters.sortBy && Array.isArray(data)) {
                const [sortKey, sortDir] = debouncedFilters.sortBy.split('-');
                const multiplier = sortDir === 'asc' ? 1 : -1;

                data.sort((a: any, b: any) => {
                    let valA = 0;
                    let valB = 0;

                    if (sortKey === 'lowestPrice') {
                        valA = a.stats?.lowestPrice || 0;
                        valB = b.stats?.lowestPrice || 0;
                    }
                    else if (sortKey === 'deviation') {
                        valA = a.stats?.standardDeviation || 0;
                        valB = b.stats?.standardDeviation || 0;
                    }
                    else if (sortKey === 'ratio') {
                        const avgA = a.stats?.averagePrice || 1;
                        const avgB = b.stats?.averagePrice || 1;
                        valA = (a.stats?.standardDeviation || 0) / avgA;
                        valB = (b.stats?.standardDeviation || 0) / avgB;
                    }

                    return (valA - valB) * multiplier;
                });
            }

            setComponents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- 4. PRZELICZANIE STATYSTYK (SELEKTYWNE LUB PEŁNE) ---
    const handleRecalculateStats = async () => {
        if (!token) return alert("Brak autoryzacji.");

        const count = selectedIds.size;
        const mode = count > 0 ? 'selected' : 'all';
        const msg = count > 0
            ? `Przeliczyć statystyki dla ${count} zaznaczonych elementów?`
            : `Czy na pewno chcesz przeliczyć statystyki dla WSZYSTKICH komponentów? Może to chwilę potrwać.`;

        if (!confirm(msg)) return;

        setIsRecalculating(true);
        try {
            const body = count > 0 ? { ids: Array.from(selectedIds) } : {};

            const res = await fetch(`${API_URL}/api/admin/update-all-stats`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Błąd aktualizacji");
            const data = await res.json();

            alert(`Sukces! ${data.message}`);
            fetchComponents();
            if (count > 0) setSelectedIds(new Set()); // Odznacz po sukcesie
        } catch (err: any) {
            alert("Błąd: " + err.message);
        } finally {
            setIsRecalculating(false);
        }
    };

    // --- HANDLERY UI ---
    const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
    const clearFilters = () => setFilters({ search: "", type: "ALL", minPrice: "", maxPrice: "", sortBy: "lowestPrice-asc" });

    const toggleSelect = (id: string, e?: React.MouseEvent) => {
        const newSet = new Set(selectedIds);
        if (e?.shiftKey && lastSelectedId) {
            const lastIndex = components.findIndex(c => c._id === lastSelectedId);
            const currentIndex = components.findIndex(c => c._id === id);
            if (lastIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastIndex, currentIndex);
                const end = Math.max(lastIndex, currentIndex);
                for (let i = start; i <= end; i++) newSet.add(components[i]._id);
            }
        } else {
            if (newSet.has(id)) { newSet.delete(id); setLastSelectedId(null); }
            else { newSet.add(id); setLastSelectedId(id); }
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === components.length) { setSelectedIds(new Set()); setLastSelectedId(null); }
        else { const allIds = components.map(c => c._id); setSelectedIds(new Set(allIds)); }
    };

    // --- AKCJE ADMINA ---
    const handleCreateMissingMobos = async () => {
        if (!token) return alert("Brak autoryzacji.");
        const selectedCpus = components.filter(c => selectedIds.has(c._id) && c.type === 'CPU' && c.socket);

        const socketsToProcess = Array.from(new Set(
            selectedCpus
                .filter(c => !socketMoboMap[normalizeSocket(c.socket)])
                .map(c => c.socket)
        ));

        if (socketsToProcess.length === 0) return alert("Wszystkie zaznaczone procesory mają już płyty główne!");

        if (!confirm(`Utworzyć płyty dla socketów: ${socketsToProcess.join(", ")}?`)) return;

        setIsCreatingMobos(true);
        try {
            let totalCreated = 0;
            for (const socket of socketsToProcess) {
                const res = await fetch(`${API_URL}/api/admin/create-mobo-templates`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ socket })
                });
                if (!res.ok) throw new Error("Błąd przy " + socket);
                const data = await res.json();
                if (data.created) totalCreated += data.created.length;
            }
            alert(`Gotowe! Utworzono ${totalCreated} szablonów.`);
            fetchMoboMap();
            fetchComponents();
        } catch (err: any) { alert("Błąd: " + err.message); } finally { setIsCreatingMobos(false); }
    };
    const handleGenerateOffers = async (useAi: boolean = true) => {
        if (!token) return alert("Brak autoryzacji.");
        if (selectedIds.size === 0) return;

        const modeText = useAi ? "AI + eBay" : "TYLKO eBay";
        if (!confirm(`Uruchomić pobieranie ofert (${modeText}) dla ${selectedIds.size} elementów?`)) return;

        setIsGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/generate-ai-offers`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                // Przekazujemy parametr 'ai' do backendu
                body: JSON.stringify({
                    componentIds: Array.from(selectedIds),
                    ai: useAi
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            alert(`Sukces! (${modeText}) Dodano ofert: ${result.details.offersCreated}`);
            setSelectedIds(new Set());
            fetchComponents();
        } catch (err: any) {
            alert("Błąd: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id: string) => { if (!confirm("Usunąć?")) return; await fetch(`${API_URL}/api/components/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } }); fetchComponents(); };

    const openEdit = (c: any) => { setEditingId(c._id); setType(c.type); setFormData({ ...c, blacklistedKeywords: c.blacklistedKeywords ? c.blacklistedKeywords.join(', ') : "" }); setIsModalOpen(true); };
    const openAdd = () => { setEditingId(null); setFormData({ name: "", searchQuery: "", blacklistedKeywords: "", image: "" }); setIsModalOpen(true); };

    const getTypeIcon = (t: string) => { switch (t) { case 'GPU': return <Monitor className="w-5 h-5" />; case 'CPU': return <Cpu className="w-5 h-5" />; case 'Motherboard': return <CircuitBoard className="w-5 h-5" />; case 'RAM': return <MemoryStick className="w-5 h-5" />; case 'Disk': return <HardDrive className="w-5 h-5" />; case 'Case': return <Box className="w-5 h-5" />; case 'PSU': return <Zap className="w-5 h-5" />; case 'Cooling': return <Fan className="w-5 h-5" />; default: return <Search className="w-5 h-5" />; } };

    const renderSpecificFields = () => {
        switch (type) {
            case 'CPU':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Socket" name="socket" val={formData} set={setFormData} placeholder="np. AM4, LGA1700" />
                            <Input label="Taktowanie (GHz)" name="clockSpeed" val={formData} set={setFormData} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Rdzenie" name="cores" val={formData} set={setFormData} type="number" />
                            <Input label="Wątki" name="threads" val={formData} set={setFormData} type="number" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={formData.integratedGraphics || false} onChange={e => setFormData({ ...formData, integratedGraphics: e.target.checked })} />
                            <label className="text-sm text-zinc-400">Zintegrowana grafika</label>
                        </div>
                    </>
                );
            case 'GPU':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="VRAM (GB)" name="vram" val={formData} set={setFormData} type="number" />
                        <Input label="Długość (mm)" name="length" val={formData} set={setFormData} type="number" />
                    </div>
                );
            case 'Motherboard':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Socket" name="socket" val={formData} set={setFormData} placeholder="np. AM4" />
                            <Input label="Chipset" name="chipset" val={formData} set={setFormData} placeholder="np. B550" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Format" name="formFactor" val={formData} set={setFormData} placeholder="ATX, Micro ATX" />
                            <Input label="Standard RAM" name="memoryType" val={formData} set={setFormData} placeholder="DDR4" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Sloty RAM" name="memorySlots" val={formData} set={setFormData} type="number" />
                            <Input label="Sloty M.2" name="m2Slots" val={formData} set={setFormData} type="number" />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={formData.wifi || false} onChange={e => setFormData({ ...formData, wifi: e.target.checked })} />
                            <label className="text-sm text-zinc-400">WiFi wbudowane</label>
                        </div>
                    </>
                );
            case 'RAM':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Typ" name="type" val={formData} set={setFormData} placeholder="DDR4" />
                            <Input label="Prędkość (MHz)" name="speed" val={formData} set={setFormData} type="number" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Pojemność (GB)" name="capacity" val={formData} set={setFormData} type="number" />
                            <Input label="Liczba modułów" name="modules" val={formData} set={setFormData} type="number" />
                        </div>
                    </>
                );
            case 'Disk':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Typ (SSD/HDD)" name="diskType" val={formData} set={setFormData} placeholder="SSD" />
                        <Input label="Interfejs" name="interface" val={formData} set={setFormData} placeholder="M.2 NVMe" />
                        <Input label="Pojemność (GB)" name="capacity" val={formData} set={setFormData} type="number" />
                    </div>
                );
            case 'PSU':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Moc (W)" name="power" val={formData} set={setFormData} type="number" />
                        <Input label="Certyfikat" name="certification" val={formData} set={setFormData} placeholder="80 Plus Gold" />
                        <Input label="Modularność" name="modularity" val={formData} set={setFormData} placeholder="Full / Semi / Non" />
                    </div>
                );
            case 'Case':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Max GPU (mm)" name="maxGpuLength" val={formData} set={setFormData} type="number" />
                        <Input label="Max CPU Cooler (mm)" name="maxCpuCoolerHeight" val={formData} set={setFormData} type="number" />
                        <div className="col-span-2">
                            <Input label="Standardy Płyt (po przecinku)" name="motherboardSupport" val={formData} set={setFormData} placeholder="ATX, Micro ATX" />
                        </div>
                    </div>
                );
            case 'Cooling':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Typ" name="coolingType" val={formData} set={setFormData} placeholder="Air / AIO" />
                        <Input label="Rozmiar (mm)" name="size" val={formData} set={setFormData} type="number" />
                        <div className="col-span-2">
                            <Input label="Sockety (po przecinku)" name="supportedSockets" val={formData} set={setFormData} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return alert("Brak autoryzacji");

        const payload = { ...formData, type };
        if (typeof payload.blacklistedKeywords === 'string') {
            payload.blacklistedKeywords = payload.blacklistedKeywords.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (payload.motherboardSupport && typeof payload.motherboardSupport === 'string') {
            payload.motherboardSupport = payload.motherboardSupport.split(',').map((s: string) => s.trim());
        }
        if (payload.supportedSockets && typeof payload.supportedSockets === 'string') {
            payload.supportedSockets = payload.supportedSockets.split(',').map((s: string) => s.trim());
        }

        const method = editingId ? "PUT" : "POST";
        const url = editingId ? `${API_URL}/api/components/${editingId}` : `${API_URL}/api/components`;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Błąd zapisu");

            setIsModalOpen(false);
            fetchComponents();
            if (!editingId) fetchMoboMap();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleJsonImport = async () => {
        if (!token) return;
        setImportStatus({ msg: "Przetwarzanie...", type: 'info' });
        try {
            const parsed = JSON.parse(jsonInput);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            const componentsToImport = items.map(item => ({ ...item, type: item.type || importType }));

            const res = await fetch(`${API_URL}/api/components/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(componentsToImport)
            });

            const result = await res.json();
            if (res.ok) {
                setImportStatus({ msg: `Zaimportowano: ${result.createdCount}, Zaktualizowano: ${result.updatedCount}`, type: 'success' });
                fetchComponents();
                fetchMoboMap();
                setTimeout(() => setIsImportModalOpen(false), 2000);
            } else {
                throw new Error(result.error || "Błąd importu");
            }
        } catch (err: any) {
            setImportStatus({ msg: "Błąd JSON: " + err.message, type: 'error' });
        }
    };

    const hasSelectedCpu = Array.from(selectedIds).some(id => components.find(c => c._id === id)?.type === 'CPU');

    return (
        <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20 select-none">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div><h1 className="text-3xl font-black uppercase tracking-tight">Baza Części</h1><p className="text-zinc-500 text-sm">Zarządzaj definicjami podzespołów</p></div>
                    <div className="flex gap-3">
                        {/* PRZYCISK PRZELICZANIA STATYSTYK */}
                        <button
                            onClick={handleRecalculateStats}
                            disabled={isRecalculating}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800 px-4 py-2.5 rounded font-bold uppercase flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                            {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                            {selectedIds.size > 0 ? `Przelicz Zaznaczone (${selectedIds.size})` : "Przelicz Wszystkie"}
                        </button>

                        <button onClick={() => { setIsImportModalOpen(true); setImportStatus(null); }} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded font-bold uppercase flex items-center gap-2 text-sm border border-zinc-700"><FileJson className="w-4 h-4" /> Importuj JSON</button>
                        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded font-bold uppercase flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Dodaj Komponent</button>
                    </div>
                </div>

                {/* PASEK AKCJI */}
                {selectedIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-4">
                        <span className="font-mono text-sm text-zinc-300">Zaznaczono: <strong className="text-white">{selectedIds.size}</strong></span>
                        <div className="h-6 w-px bg-zinc-700" />
                        {/* Przycisk 1: Pełne AI + eBay (Domyślny) */}
                        <button
                            onClick={() => handleGenerateOffers(true)}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isGenerating ? "Praca..." : "Generuj (AI + eBay)"}
                        </button>

                        {/* Przycisk 2: Tylko eBay (Szybki) */}
                        <button
                            onClick={() => handleGenerateOffers(false)}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {isGenerating ? "Praca..." : "Generuj (Tylko eBay)"}
                        </button>
                        {hasSelectedCpu && (
                            <button onClick={handleCreateMissingMobos} disabled={isCreatingMobos} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold uppercase text-sm flex items-center gap-2 disabled:opacity-50">
                                {isCreatingMobos ? <Loader2 className="w-4 h-4 animate-spin" /> : <CircuitBoard className="w-4 h-4" />} Utwórz Płyty (Mobo)
                            </button>
                        )}
                    </div>
                )}

                {/* FILTRY */}
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-grow min-w-[200px]"><label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Szukaj</label><input value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} placeholder="Szukaj..." className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm text-white rounded outline-none" /></div>

                    <div className="min-w-[150px]"><label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Typ</label><select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)} className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm text-white rounded outline-none"><option value="ALL">Wszystkie</option>{['GPU', 'CPU', 'Motherboard', 'RAM', 'Disk', 'Case', 'PSU', 'Cooling'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>

                    <div className="flex gap-2"><div><label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Cena Od</label><input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange("minPrice", e.target.value)} className="w-24 bg-black border border-zinc-700 px-3 py-2 text-sm text-white rounded outline-none" /></div><div><label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block">Cena Do</label><input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange("maxPrice", e.target.value)} className="w-24 bg-black border border-zinc-700 px-3 py-2 text-sm text-white rounded outline-none" /></div></div>

                    {/* --- DROPDOWN SORTOWANIA --- */}
                    <div className="min-w-[180px]">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1 block flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sortuj według</label>
                        <select value={filters.sortBy} onChange={(e) => handleFilterChange("sortBy", e.target.value)} className="w-full bg-black border border-zinc-700 px-3 py-2 text-sm text-white rounded outline-none">
                            <option value="lowestPrice-asc">Cena (Rosnąco)</option>
                            <option value="lowestPrice-desc">Cena (Malejąco)</option>
                            <option value="deviation-asc">Odchylenie (Stabilne)</option>
                            <option value="deviation-desc">Odchylenie (Zmienne)</option>
                            <option value="ratio-asc">Wsp. Zmienności (Mały)</option>
                            <option value="ratio-desc">Wsp. Zmienności (Duży)</option>
                        </select>
                    </div>

                    <button onClick={clearFilters} className="bg-zinc-800 px-4 py-2 rounded h-[38px] text-sm"><RefreshCcw className="w-4 h-4" /></button>
                </div>

                <div className="flex justify-end mb-2 px-1">
                    <button onClick={toggleSelectAll} className="text-xs text-zinc-500 hover:text-white uppercase font-mono flex items-center gap-2">{selectedIds.size > 0 && selectedIds.size === components.length ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />} Zaznacz wszystkie
                    </button>
                </div>

                {/* LISTA */}
                <div className="grid gap-3">
                    {components.map((comp) => {
                        const isSelected = selectedIds.has(comp._id);
                        const mySocketKey = normalizeSocket(comp.socket);
                        const hasMobo = comp.type === 'CPU' && comp.socket && socketMoboMap[mySocketKey];

                        // Obliczenie współczynnika zmienności (CV) do wyświetlenia w UI
                        const cv = comp.stats?.averagePrice > 0
                            ? Math.ceil((comp.stats?.standardDeviation / comp.stats?.averagePrice) * 100)
                            : 0;

                        return (
                            <div
                                key={comp._id}
                                onClick={(e) => toggleSelect(comp._id, e)}
                                className={`border p-4 rounded flex justify-between items-center group transition-colors relative cursor-pointer ${isSelected ? "bg-blue-950/20 border-blue-900" : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"}`}
                            >
                                <div className="flex items-center gap-4 pointer-events-none">
                                    <button className={`p-1 rounded transition-colors ${isSelected ? "text-blue-500" : "text-zinc-600 group-hover:text-white"}`}>
                                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                    <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center rounded overflow-hidden">
                                        {comp.image ? <img src={comp.image} className="w-full h-full object-cover" /> : getTypeIcon(comp.type)}
                                    </div>

                                    <div>
                                        {comp.type === 'Motherboard' ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-lg leading-tight">
                                                    {comp.socket} <span className="text-zinc-500">/</span> {comp.formFactor}
                                                </span>
                                                <span className="text-[9px] text-blue-400 uppercase tracking-widest font-mono mt-0.5">
                                                    GENERIC MOTHERBOARD TEMPLATE
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{comp.name}</h3>
                                                {comp.type === 'CPU' && (
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono ${hasMobo ? 'bg-green-900/20 text-green-500 border-green-900/50' : 'bg-red-900/20 text-red-500 border-red-900/50'}`}>
                                                        {hasMobo ? 'MOBO: OK' : 'MOBO: MISSING'}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-4 text-xs text-zinc-500 font-mono mt-1">
                                            <span className={`${comp.stats?.lowestPrice > 0 ? 'text-green-500' : 'text-zinc-600'} font-bold`}>
                                                Min: {comp.stats?.lowestPrice} zł
                                            </span>

                                            {/* NOWE POLE: BASE PRICE (WYŚWIETLANIE) */}
                                            <span className="text-zinc-400 font-bold border-l border-r border-zinc-700 px-2" title="Cena bazowa (używana do wyceny PC)">
                                                Base: <span className="text-white">{comp.stats?.basePrice || 0} zł</span>
                                            </span>

                                            <span className="flex items-center gap-1" title={`Współczynnik zmienności: ${cv}%`}>
                                                <TrendingUp className="w-3 h-3" /> ±{comp.stats?.standardDeviation} zł
                                                <span className={`ml-1 px-1 rounded font-bold ${cv > 25 ? 'text-red-400 bg-red-900/30' : cv > 15 ? 'text-yellow-400 bg-yellow-900/30' : 'text-zinc-500'}`}>
                                                    ({cv}%)
                                                </span>
                                            </span>
                                            <span className="text-zinc-500">
                                                Ofert: {comp.stats?.offersCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                    <Link href={`/admin/components/${comp._id}`} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded"><Search className="w-4 h-4" /></Link>
                                    <button onClick={() => openEdit(comp)} className="p-2 bg-blue-900/20 text-blue-400 rounded"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(comp._id)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- MODAL DODAWANIA / EDYCJI --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                                    <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                                        {editingId ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-green-500" />}
                                        {editingId ? "Edytuj Komponent" : "Nowy Komponent"}
                                    </h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Podstawowe Pola */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Typ Komponentu</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            disabled={!!editingId}
                                            className="w-full bg-black border border-zinc-700 p-3 text-sm text-white focus:border-blue-500 outline-none rounded"
                                        >
                                            {['GPU', 'CPU', 'Motherboard', 'RAM', 'Disk', 'Case', 'PSU', 'Cooling'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Input label="Nazwa (Display Name)" name="name" val={formData} set={setFormData} required placeholder="np. RTX 3060 Gaming X" />
                                    </div>
                                </div>

                                <Input label="Fraza Wyszukiwania (Allegro Query)" name="searchQuery" val={formData} set={setFormData} required placeholder="To wpisze bot w Allegro..." />
                                <Input label="Wykluczone słowa (po przecinku)" name="blacklistedKeywords" val={formData} set={setFormData} placeholder="uszkodzona, pudełko, wentylator..." />
                                <Input label="URL Obrazka" name="image" val={formData} set={setFormData} placeholder="https://..." />

                                {/* Pola Specyficzne dla Typu */}
                                <div className="bg-black/30 p-4 rounded border border-zinc-800/50 space-y-4">
                                    <h3 className="text-xs font-mono text-zinc-400 uppercase font-bold mb-2">Specyfikacja Techniczna: {type}</h3>
                                    {renderSpecificFields()}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-zinc-400 hover:text-white text-sm font-bold uppercase transition-colors">Anuluj</button>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded font-bold uppercase flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                        <Save className="w-4 h-4" /> Zapisz
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- MODAL IMPORTU JSON --- */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                                    <FileJson className="w-5 h-5 text-yellow-500" /> Import JSON
                                </h2>
                                <button onClick={() => setIsImportModalOpen(false)}><X className="w-6 h-6 text-zinc-500 hover:text-white" /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Domyślny Typ (jeśli brak w JSON)</label>
                                    <select value={importType} onChange={(e) => setImportType(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 text-sm text-white rounded">
                                        {['GPU', 'CPU', 'Motherboard', 'RAM', 'Disk', 'Case', 'PSU', 'Cooling'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Dane JSON (Tablica lub Obiekt)</label>
                                    <textarea
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        placeholder='[{"name": "RTX 3060", "searchQuery": "RTX 3060", "vram": 12}, ...]'
                                        className="w-full h-64 bg-black border border-zinc-700 p-4 text-xs font-mono text-green-400 rounded outline-none resize-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {importStatus && (
                                <div className={`p-3 rounded text-sm font-bold text-center ${importStatus.type === 'error' ? 'bg-red-900/20 text-red-400' :
                                    importStatus.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-blue-900/20 text-blue-400'
                                    }`}>
                                    {importStatus.msg}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 text-zinc-400 hover:text-white text-sm font-bold uppercase">Zamknij</button>
                                <button onClick={handleJsonImport} className="bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-2 rounded font-bold uppercase flex items-center gap-2">
                                    <FileJson className="w-4 h-4" /> Importuj
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}