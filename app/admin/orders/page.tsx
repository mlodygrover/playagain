"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, Search, Eye, Truck, CheckCircle, 
  AlertCircle, XCircle, Calendar, DollarSign, Loader2, X, Trash2 // <--- IMPORT Trash2
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

// ... (komponent StatusBadge bez zmian) ...
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PAID: "bg-green-900/30 text-green-400 border-green-800",
    PENDING: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    SHIPPED: "bg-blue-900/30 text-blue-400 border-blue-800",
    CANCELLED: "bg-red-900/30 text-red-400 border-red-800",
  };

  const icons: Record<string, any> = {
    PAID: CheckCircle,
    PENDING: AlertCircle,
    SHIPPED: Truck,
    CANCELLED: XCircle,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase border ${styles[status] || styles.PENDING}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if(Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- NOWA FUNKCJA: USUWANIE ---
  const handleDeleteOrder = async (orderId: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation(); // Zapobiega otwarciu modala przy kliknięciu usuwania
    
    if(!confirm("⚠️ UWAGA: Czy na pewno chcesz trwale usunąć to zamówienie z bazy danych? Tej operacji nie można cofnąć.")) return;

    try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            // Usuń z lokalnego stanu (bez odświeżania strony)
            setOrders(prev => prev.filter(o => o._id !== orderId));
            // Jeśli usunięte zamówienie było otwarte w modalu - zamknij go
            if (selectedOrder?._id === orderId) setSelectedOrder(null);
            alert("Zamówienie usunięte.");
        } else {
            alert("Wystąpił błąd podczas usuwania.");
        }
    } catch (err) {
        console.error(err);
        alert("Błąd połączenia z serwerem.");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // ... (Twoja istniejąca funkcja statusu - bez zmian) ...
    if(!confirm(`Czy na pewno zmienić status na ${newStatus}?`)) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?._id === orderId) {
            setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert("Błąd aktualizacji statusu");
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'PAID' || o.status === 'SHIPPED')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
    
    return {
      count: orders.length,
      revenue: totalRevenue,
      pending: orders.filter(o => o.status === 'PENDING').length
    };
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      order.customerDetails.email.toLowerCase().includes(searchLower) ||
      order.customerDetails.lastName.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin w-8 h-8 text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & STATS (bez zmian) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Zarządzanie Zamówieniami</h1>
            <p className="text-zinc-500 text-sm">Przeglądaj i aktualizuj statusy zamówień klientów</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg min-w-[140px]">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Przychód (Opłacone)</p>
              <p className="text-xl font-mono text-green-400 font-bold">{stats.revenue.toLocaleString()} PLN</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg min-w-[140px]">
              <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Oczekujące</p>
              <p className="text-xl font-mono text-yellow-400 font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>

        {/* TOOLBAR (bez zmian) */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-t-lg flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Szukaj po ID, emailu lub nazwisku..." 
              className="w-full bg-black border border-zinc-700 pl-10 pr-4 py-2 text-sm text-white rounded outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            Wyświetlono: {filteredOrders.length} z {orders.length}
          </div>
        </div>

        {/* TABELA - DODANO PRZYCISK USUWANIA */}
        <div className="overflow-x-auto bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-black text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">ID Zamówienia</th>
                <th className="p-4">Klient</th>
                <th className="p-4">Data</th>
                <th className="p-4">Kwota</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 font-mono text-zinc-400">#{order._id.slice(-6)}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{order.customerDetails.firstName} {order.customerDetails.lastName}</div>
                    <div className="text-xs text-zinc-500">{order.customerDetails.email}</div>
                  </td>
                  <td className="p-4 text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3"/> {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{order.totalAmount} PLN</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-blue-600/10 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors inline-flex items-center gap-2"
                        >
                          <Eye className="w-3 h-3" /> Szczegóły
                        </button>
                        
                        {/* PRZYCISK USUWANIA */}
                        <button 
                          onClick={(e) => handleDeleteOrder(order._id, e)}
                          title="Usuń trwale"
                          className="bg-red-600/10 hover:bg-red-600/30 text-red-500 p-1.5 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-zinc-500">Nie znaleziono zamówień.</div>
          )}
        </div>

        {/* MODAL (Dodano przycisk usuwania w headerze modala) */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="bg-black border-b border-zinc-800 p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    Zamówienie #{selectedOrder._id}
                    <StatusBadge status={selectedOrder.status} />
                  </h2>
                  <p className="text-zinc-500 text-xs mt-1 font-mono">
                    ID Płatności: {selectedOrder.paymentId || "Brak (Płatność nieudana)"}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Przycisk usuwania w modalu */}
                    <button 
                        onClick={() => handleDeleteOrder(selectedOrder._id)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Usuń
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
              </div>

              {/* ... RESZTA MODALA BEZ ZMIAN ... */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                {/* Kolumna 1: Klient */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 flex items-center gap-2"><Truck className="w-4 h-4"/> Dane Wysyłkowe</h3>
                  <div className="bg-zinc-950/50 p-4 rounded border border-zinc-800 text-sm space-y-1 text-zinc-300">
                    <p className="font-bold text-white text-base mb-2">{selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</p>
                    <p>{selectedOrder.customerDetails.email}</p>
                    <p>{selectedOrder.customerDetails.phone}</p>
                    <hr className="border-zinc-800 my-2"/>
                    <p>{selectedOrder.customerDetails.address}</p>
                    <p>{selectedOrder.customerDetails.zipCode} {selectedOrder.customerDetails.city}</p>
                  </div>

                  {/* Zmiana Statusu */}
                  <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Zmień Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'].map(status => (
                        <button
                          key={status}
                          disabled={isUpdating || selectedOrder.status === status}
                          onClick={() => handleStatusChange(selectedOrder._id, status)}
                          className={`px-3 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                            selectedOrder.status === status 
                              ? "bg-zinc-800 border-zinc-600 text-white cursor-default opacity-50" 
                              : "bg-black border-zinc-800 text-zinc-400 hover:border-blue-500 hover:text-blue-500"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kolumna 2: Produkty */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> Zawartość Koszyka</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3 rounded flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          {item.type === 'custom_build' && (
                            <div className="mt-1 pl-2 border-l-2 border-zinc-800">
                              {item.components?.map((c: string, i: number) => (
                                <p key={i} className="text-[10px] text-zinc-500 truncate max-w-[200px]">{c}</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-blue-400 text-sm">{item.price} zł</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-end">
                    <span className="text-xs text-zinc-500 uppercase">Razem do zapłaty</span>
                    <span className="text-2xl font-black text-white">{selectedOrder.totalAmount} PLN</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}