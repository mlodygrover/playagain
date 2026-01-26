"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  User, Package, Lock, LogOut, Loader2,
  Save, AlertCircle, CheckCircle2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const server_port = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "security">("profile");
  const [loading, setLoading] = useState(true);

  // Dane z API
  const [profileData, setProfileData] = useState({ firstName: "", lastName: "", email: "" });
  const [orders, setOrders] = useState<any[]>([]); // Inicjalizacja pustą tablicą jest kluczowa

  // Formularze
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // 1. Ochrona trasy i pobieranie danych
  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Pobierz dane usera
        const userRes = await fetch(`${server_port}/api/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfileData(userData);
        }

        // Pobierz zamówienia
        const ordersRes = await fetch(`${server_port}/api/orders/my-orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const ordersData = await ordersRes.json();

        // --- POPRAWKA: SPRAWDZENIE CZY DANE TO TABLICA ---
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.warn("API zwróciło nietablicowe dane dla zamówień:", ordersData);
          setOrders([]); // Fallback do pustej tablicy, aby .map() nie wywalił błędu
        }

      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setOrders([]); // W razie błędu sieci ustaw pustą tablicę
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  // 2. Obsługa aktualizacji profilu
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${server_port}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName
        })
      });
      if (res.ok) setMessage({ type: "success", text: "Dane zaktualizowane." });
      else setMessage({ type: "error", text: "Błąd aktualizacji." });
    } catch (err) {
      setMessage({ type: "error", text: "Błąd serwera." });
    }
  };

  // 3. Obsługa zmiany hasła
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${server_port}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Hasło zmienione pomyślnie." });
        setPasswordForm({ oldPassword: "", newPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Błąd zmiany hasła." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Błąd serwera." });
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* SIDEBAR */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-zinc-900/50 p-6 border border-zinc-800 mb-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
              {profileData.firstName?.[0] || "U"}
            </div>
            <h2 className="font-bold">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-xs text-zinc-500 break-all">{profileData.email}</p>
          </div>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-bold uppercase transition-colors ${activeTab === "profile" ? "bg-blue-600 text-white" : "bg-zinc-900/30 text-zinc-400 hover:bg-zinc-800"}`}
          >
            <User className="w-4 h-4" /> Moje Dane
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-bold uppercase transition-colors ${activeTab === "orders" ? "bg-blue-600 text-white" : "bg-zinc-900/30 text-zinc-400 hover:bg-zinc-800"}`}
          >
            <Package className="w-4 h-4" /> Zamówienia
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-bold uppercase transition-colors ${activeTab === "security" ? "bg-blue-600 text-white" : "bg-zinc-900/30 text-zinc-400 hover:bg-zinc-800"}`}
          >
            <Lock className="w-4 h-4" /> Bezpieczeństwo
          </button>

          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-bold uppercase text-red-500 hover:bg-red-900/10 transition-colors border-t border-zinc-800 mt-4"
          >
            <LogOut className="w-4 h-4" /> Wyloguj się
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-3">

          {/* Komunikaty błędów/sukcesu */}
          {message && (
            <div className={`p-4 mb-6 border flex items-center gap-3 ${message.type === "success"
                ? "bg-green-900/20 border-green-800 text-green-400"
                : "bg-red-900/20 border-red-800 text-red-400"
              }`}>
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* --- TAB 1: PROFIL --- */}
          {activeTab === "profile" && (
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 animate-in fade-in">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Edytuj Dane
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase font-bold">Imię</label>
                    <input
                      type="text"
                      value={profileData.firstName || ""}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full bg-black border border-zinc-700 p-3 text-sm focus:border-blue-500 outline-none text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase font-bold">Nazwisko</label>
                    <input
                      type="text"
                      value={profileData.lastName || ""}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full bg-black border border-zinc-700 p-3 text-sm focus:border-blue-500 outline-none text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase font-bold">Email (Nieedytowalny)</label>
                  <input
                    type="email"
                    value={profileData.email || ""}
                    disabled
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>

                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> Zapisz zmiany
                </button>
              </form>
            </div>
          )}

          {/* --- TAB 2: ZAMÓWIENIA --- */}
          {activeTab === "orders" && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> Historia Zamówień
              </h3>

              {/* POPRAWKA: Sprawdzamy czy to tablica i czy ma elementy */}
              {!Array.isArray(orders) || orders.length === 0 ? (
                <div className="text-center py-12 border border-zinc-800 border-dashed text-zinc-500">
                  Brak zamówień.
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order._id} className="bg-zinc-900/30 border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-mono">ID Zamówienia</span>
                        <p className="font-mono text-sm text-zinc-300">#{order._id.slice(-6)}</p>
                      </div>
                      <Link
                        href={`/orders/${order._id}`}
                        className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors"
                      >
                        Szczegóły <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-zinc-800/50">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-mono">ID Zamówienia</span>
                        <p className="font-mono text-sm text-zinc-300">#{order._id ? order._id.slice(-6) : '???'}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-zinc-500 font-mono block">Data</span>
                          <span className="text-sm text-zinc-300">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${order.status === 'PAID' ? 'bg-green-900/20 text-green-400 border-green-900' :
                            order.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-900' :
                              'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* POPRAWKA: Optional chaining dla items */}
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                            <span className="text-zinc-300">{item.name}</span>
                          </div>
                          <span className="font-mono text-zinc-500">{item.price} PLN</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-xs uppercase text-zinc-500 font-bold">Razem</span>
                      <span className="text-lg font-bold text-white font-mono">{order.totalAmount} PLN</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* --- TAB 3: BEZPIECZEŃSTWO --- */}
          {activeTab === "security" && (
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 animate-in fade-in">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" /> Zmień Hasło
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase font-bold">Obecne hasło</label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full bg-black border border-zinc-700 p-3 text-sm focus:border-blue-500 outline-none text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase font-bold">Nowe hasło</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-black border border-zinc-700 p-3 text-sm focus:border-blue-500 outline-none text-white"
                    required
                  />
                </div>

                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> Aktualizuj Hasło
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}