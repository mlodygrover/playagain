"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus, Edit, Trash2, Save, X, Image as ImageIcon,
  Monitor, Cpu, Calculator, Package, Loader2, FileJson,
  RefreshCw // <--- 1. IMPORT NOWEJ IKONY
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

// SLOTY (W tym Service)
const SLOTS = [
  { id: 'cpu', label: 'Procesor', type: 'CPU' },
  { id: 'gpu', label: 'Karta Graficzna', type: 'GPU' },
  { id: 'mobo', label: 'Płyta Główna', type: 'Motherboard' },
  { id: 'ram', label: 'Pamięć RAM', type: 'RAM' },
  { id: 'disk', label: 'Dysk', type: 'Disk' },
  { id: 'psu', label: 'Zasilacz', type: 'PSU' },
  { id: 'case', label: 'Obudowa', type: 'Case' },
  { id: 'cool', label: 'Chłodzenie', type: 'Cooling' },
  { id: 'service', label: 'Usługa (Montaż)', type: 'Service' },
];

function AdminPrebuiltsContent() {
  const { token } = useAuth();

  const [prebuilts, setPrebuilts] = useState<any[]>([]);
  const [availableComponents, setAvailableComponents] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Stan dla przycisku rekalkulacji
  const [isRecalculating, setIsRecalculating] = useState(false);

  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "Gaming",
    components: [] as string[]
  });

  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPrebuilts();
    fetchComponents();
  }, []);

  const fetchPrebuilts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/prebuilts`);
      const data = await res.json();
      setPrebuilts(data);
    } catch (err) { console.error(err); }
  };

  const fetchComponents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/components?limit=1000`);
      const data = await res.json();
      setAvailableComponents(data);
    } catch (err) { console.error(err); }
  };

  // --- 2. NOWA FUNKCJA MASOWEJ AKTUALIZACJI CEN ---
  const handleRecalculateAll = async () => {
    if (!confirm("UWAGA: Ta operacja przeliczy ceny WSZYSTKICH zestawów na podstawie aktualnych cen części w bazie. Czy kontynuować?")) return;

    setIsRecalculating(true);
    try {
      const res = await fetch(`${API_URL}/api/prebuilts/recalculate-all`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Błąd aktualizacji cen");
      
      const data = await res.json();
      alert(data.message);
      
      // Odśwież widok
      fetchPrebuilts(); 
    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Otwieranie modala dodawania (z domyślną usługą)
  const handleOpenAdd = () => {
    setEditingId(null);
    
    const serviceComp = availableComponents.find(c => c.type === 'Service');
    const initialSlots: Record<string, string> = {};
    const initialComponents: string[] = [];
    
    if (serviceComp) {
      initialSlots['Service'] = serviceComp._id;
      initialComponents.push(serviceComp._id);
    }

    setFormData({ 
      name: "", description: "", price: 0, image: "", category: "Gaming", 
      components: initialComponents 
    });
    
    setSelectedSlots(initialSlots);
    setJsonMode(false);
    setJsonInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    setJsonMode(false);

    const slotsMap: Record<string, string> = {};
    if (item.components && Array.isArray(item.components)) {
      item.components.forEach((comp: any) => {
        const slot = SLOTS.find(s => s.type === comp.type);
        if (slot) slotsMap[slot.type] = comp._id;
      });
    }

    setSelectedSlots(slotsMap);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      components: item.components.map((c: any) => c._id)
    });
    setIsModalOpen(true);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      const newSlots: Record<string, string> = {};
      const componentIds: string[] = [];
      let calculatedPrice = 0;

      const inputComps = parsed.components && Array.isArray(parsed.components) ? parsed.components : [];

      inputComps.forEach((inputC: any) => {
        const id = typeof inputC === 'string' ? inputC : inputC._id || inputC.id;
        const found = availableComponents.find(ac => ac._id === id);
        
        if (found) {
          newSlots[found.type] = found._id;
          componentIds.push(found._id);
          const price = found.price || found.stats?.basePrice || found.stats?.averagePrice || 0;
          calculatedPrice += price;
        }
      });

      // Zabezpieczenie: dodaj usługę jeśli brakuje
      if (!newSlots['Service']) {
        const serviceComp = availableComponents.find(c => c.type === 'Service');
        if (serviceComp) {
          newSlots['Service'] = serviceComp._id;
          componentIds.push(serviceComp._id);
          const sPrice = serviceComp.price || serviceComp.stats?.basePrice || 0;
          calculatedPrice += sPrice;
        }
      }

      setSelectedSlots(newSlots);
      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        description: parsed.description || prev.description,
        image: parsed.image || prev.image,
        category: parsed.category || prev.category,
        components: componentIds,
        price: calculatedPrice
      }));

      if (!parsed.image && newSlots['Case']) {
        const caseComp = availableComponents.find(c => c._id === newSlots['Case']);
        if (caseComp && caseComp.image) {
          setFormData(prev => ({ ...prev, image: caseComp.image }));
        }
      }

      setJsonMode(false);
      alert(`Pomyślnie zaimportowano konfigurację.`);

    } catch (e) {
      alert("Nieprawidłowy format JSON!");
    }
  };

  const handleSlotChange = (type: string, componentId: string) => {
    const newSlots = { ...selectedSlots, [type]: componentId };
    if (!componentId) delete newSlots[type];

    setSelectedSlots(newSlots);

    setFormData(prev => {
      const newData = {
        ...prev,
        components: Object.values(newSlots).filter(Boolean)
      };

      if (type === 'Case' && componentId) {
        const selectedCase = availableComponents.find(c => c._id === componentId);
        if (selectedCase && selectedCase.image) {
          newData.image = selectedCase.image;
        }
      }
      return newData;
    });
  };

  const calculateAutoPrice = async () => {
    const ids = Object.values(selectedSlots).filter(Boolean);
    if (ids.length === 0) return alert("Wybierz najpierw komponenty!");

    try {
      const btn = document.getElementById('calc-btn');
      if (btn) btn.classList.add('animate-pulse');

      const res = await fetch(`${API_URL}/api/prebuilts/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ componentIds: ids })
      });

      if (!res.ok) throw new Error("Błąd obliczania ceny");
      const data = await res.json();

      setFormData(prev => ({ ...prev, price: data.totalPrice }));
      
      const priceInput = document.getElementById('price-input');
      if (priceInput) (priceInput as HTMLInputElement).select();

    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      const btn = document.getElementById('calc-btn');
      if (btn) btn.classList.remove('animate-pulse');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Brak autoryzacji");

    const url = editingId ? `${API_URL}/api/prebuilts/${editingId}` : `${API_URL}/api/prebuilts`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Błąd zapisu");
      setIsModalOpen(false);
      fetchPrebuilts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten zestaw?")) return;
    await fetch(`${API_URL}/api/prebuilts/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    fetchPrebuilts();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER Z PRZYCISKAMI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Gotowe Zestawy</h1>
            <p className="text-zinc-500 text-sm">Twórz i edytuj konfiguracje dostępne dla klientów</p>
          </div>
          
          <div className="flex gap-3">
            {/* PRZYCISK AKTUALIZACJI CEN */}
            <button 
              onClick={handleRecalculateAll} 
              disabled={isRecalculating}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white px-4 py-2.5 rounded font-bold uppercase flex items-center gap-2 text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? "Przeliczanie..." : "Aktualizuj Ceny"}
            </button>

            {/* PRZYCISK NOWY ZESTAW */}
            <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded font-bold uppercase flex items-center gap-2 text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Plus className="w-4 h-4" /> Nowy Zestaw
            </button>
          </div>
        </div>

        {/* LISTA ZESTAWÓW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prebuilts.map(pc => (
            <div key={pc._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group">
              <div className="h-48 bg-zinc-950 relative flex items-center justify-center overflow-hidden">
                {pc.image ? (
                  <img src={pc.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Monitor className="w-16 h-16 text-zinc-700" />
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase text-blue-400 border border-blue-500/30">
                  {pc.category}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-white">{pc.name}</h2>
                  <span className="font-mono text-green-400 font-bold">{pc.price} zł</span>
                </div>
                <div className="space-y-1 my-4">
                  {pc.components && pc.components.slice(0, 4).map((c: any) => (
                    <div key={c._id} className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                      <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full flex-shrink-0" />
                      {c.name}
                    </div>
                  ))}
                  {pc.components && pc.components.length > 4 && <div className="text-xs text-zinc-600 pl-3.5">...i {pc.components.length - 4} więcej</div>}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                  <button onClick={() => handleOpenEdit(pc)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2">
                    <Edit className="w-3 h-3" /> Edytuj
                  </button>
                  <button onClick={() => handleDelete(pc._id)} className="w-10 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6">
              
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-bold uppercase">
                  {editingId ? "Edytuj Zestaw" : "Nowy Zestaw PC"}
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setJsonMode(!jsonMode)}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-mono uppercase text-blue-400 transition-colors"
                  >
                    <FileJson className="w-4 h-4" /> {jsonMode ? "Ukryj JSON" : "Importuj JSON"}
                  </button>
                  <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-zinc-500 hover:text-white" /></button>
                </div>
              </div>

              {jsonMode && (
                <div className="mb-6 bg-zinc-950 p-4 rounded border border-zinc-800 animate-in slide-in-from-top-2">
                  <p className="text-xs text-zinc-500 mb-2 font-mono">
                    Wklej tutaj obiekt JSON.
                  </p>
                  <textarea 
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-32 bg-black border border-zinc-700 p-2 text-xs font-mono text-green-400 rounded focus:border-green-500 outline-none"
                    placeholder='{ "name": "Super PC", "components": ["id_cpu", "id_gpu", ...] }'
                  />
                  <button 
                    onClick={handleJsonImport}
                    className="mt-2 w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded text-xs font-bold uppercase transition-colors"
                  >
                    Wczytaj konfigurację i oblicz cenę
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Nazwa Zestawu</label>
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black border border-zinc-700 p-3 rounded text-sm text-white" placeholder="np. Cyber Slayer 3000" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Cena (PLN)</label>
                      <div className="relative">
                        <input
                          id="price-input"
                          type="number"
                          required
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                          className="w-full bg-black border border-zinc-700 p-3 rounded text-sm text-white font-mono text-green-400 focus:border-green-500 outline-none"
                        />
                        <button
                          id="calc-btn"
                          type="button"
                          onClick={calculateAutoPrice}
                          title="Oblicz ponownie z wybranych części"
                          className="absolute right-2 top-2 p-1.5 bg-zinc-800 rounded hover:bg-green-900/50 hover:text-green-400 text-zinc-400 transition-colors"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Zdjęcie URL</label>
                    <div className="flex gap-2">
                      <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-black border border-zinc-700 p-3 rounded text-sm text-white" placeholder="https://..." />
                      {formData.image && <img src={formData.image} className="w-12 h-12 object-cover rounded border border-zinc-700" />}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 uppercase mb-1">Opis (Opcjonalny)</label>
                    <textarea rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black border border-zinc-700 p-3 rounded text-sm text-white resize-none" placeholder="Krótki opis zestawu..." />
                  </div>
                </div>

                <div className="space-y-3 bg-black/30 p-4 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Konfiguracja
                  </h3>

                  {SLOTS.map(slot => {
                    const slotComponents = availableComponents.filter(c => c.type === slot.type);
                    return (
                      <div key={slot.id}>
                        <label className="block text-[10px] font-mono text-blue-500 uppercase mb-1">{slot.label}</label>
                        <select
                          value={selectedSlots[slot.type] || ""}
                          onChange={(e) => handleSlotChange(slot.type, e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 p-2 rounded text-xs text-white focus:border-blue-500 outline-none"
                        >
                          <option value="">-- Wybierz {slot.label} --</option>
                          {slotComponents.map(c => (
                            <option key={c._id} value={c._id}>
                              {c.name} ({c.stats?.basePrice || c.stats?.averagePrice || '?'} zł)
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                </div>

                <div className="col-span-1 lg:col-span-2 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded text-zinc-400 hover:text-white text-sm font-bold uppercase">Anuluj</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded font-bold uppercase flex items-center gap-2">
                    <Save className="w-4 h-4" /> Zapisz Zestaw
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPrebuiltsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <AdminPrebuiltsContent />
    </Suspense>
  );
}