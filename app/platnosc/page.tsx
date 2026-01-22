"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // <--- Import Auth
import { useRouter } from "next/navigation";
import {
    User, Truck, CreditCard, CheckCircle2,
    MapPin, Mail, ArrowRight, ShieldCheck, Loader2
} from "lucide-react";
import Link from "next/link";

const server_port = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";
export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth(); // <--- Sprawdzamy czy user jest zalogowany
    const router = useRouter();

    const [authMethod, setAuthMethod] = useState<"guest" | "login">("guest");
    const [isProcessing, setIsProcessing] = useState(false);

    // Stan formularza
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        zipCode: "",
        city: "",
    });

    // Autouzupełnianie, jeśli użytkownik jest zalogowany
    useEffect(() => {
        if (user) {
            setAuthMethod("guest"); // Ukrywamy taby, traktujemy to jako wypełnianie formularza
            setFormData(prev => ({
                ...prev,
                email: user.email,
                firstName: user.firstName || "",
                // Można tu dodać resztę, jeśli backend zwracałby pełny profil
            }));
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const res = await fetch(`${server_port}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerDetails: formData,
                    items: items,
                    totalAmount: totalPrice,
                    userId: user?.id || null,
                }),
            });

            const data = await res.json();

            if (res.ok && data.paymentUrl) {
                // --- ZMIANA: PRZEKIEROWANIE DO TPAY ---
      
                window.location.href = data.paymentUrl;
            } else {
                alert("Błąd zamówienia: " + (data.error || "Brak linku do płatności"));
            }
        } catch (error) {
            console.error("Błąd połączenia:", error);
            alert("Nie udało się połączyć z serwerem.");
        } finally {
            // Nie wyłączamy processingu, bo zaraz nastąpi przekierowanie
            // setIsProcessing(false); 
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-32 text-center bg-black text-white">
                <h1 className="text-2xl font-bold mb-4">Twój koszyk jest pusty.</h1>
                <Link href="/konfigurator" className="text-blue-500 hover:underline">Wróć do sklepu</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-20">

            {/* PROGRESS BAR */}
            <div className="max-w-6xl mx-auto px-4 mb-12">
                <div className="flex items-center justify-center gap-4 text-sm font-mono uppercase tracking-widest text-zinc-500">
                    <span className="text-zinc-600">1. Koszyk</span>
                    <span className="w-8 h-px bg-zinc-800" />
                    <span className="text-blue-500 font-bold">2. Dane i Dostawa</span>
                    <span className="w-8 h-px bg-zinc-800" />
                    <span>3. Potwierdzenie</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* --- LEWA KOLUMNA: FORMULARZE --- */}
                <div className="lg:col-span-8 space-y-8">

                    <div className="flex items-end justify-between border-b border-zinc-800 pb-4 mb-8">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Dane Odbiorcy</h1>
                        {user && (
                            <span className="text-xs font-mono text-green-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Zalogowano jako {user.firstName || user.email}
                            </span>
                        )}
                    </div>

                    {/* 1. WYBÓR METODY (Tylko jeśli NIE zalogowany) */}
                    {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {/* Opcja: Bez logowania */}
                            <button
                                onClick={() => setAuthMethod("guest")}
                                className={`p-6 border text-left transition-all group relative overflow-hidden ${authMethod === "guest"
                                        ? "border-blue-600 bg-blue-900/10"
                                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`p-2 rounded-full ${authMethod === "guest" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <span className={`font-bold uppercase tracking-wide ${authMethod === "guest" ? "text-white" : "text-zinc-400"}`}>
                                        Zamawiam jako Gość
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 pl-[3.25rem]">Szybkie zakupy bez zakładania konta.</p>
                                {authMethod === "guest" && <div className="absolute top-2 right-2 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>}
                            </button>

                            {/* Opcja: Logowanie */}
                            <button
                                onClick={() => setAuthMethod("login")}
                                className={`p-6 border text-left transition-all group relative overflow-hidden ${authMethod === "login"
                                        ? "border-blue-600 bg-blue-900/10"
                                        : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-600"
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`p-2 rounded-full ${authMethod === "login" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className={`font-bold uppercase tracking-wide ${authMethod === "login" ? "text-white" : "text-zinc-400"}`}>
                                        Mam już konto
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 pl-[3.25rem]">Zaloguj się, aby użyć zapisanych danych.</p>
                                {authMethod === "login" && <div className="absolute top-2 right-2 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>}
                            </button>
                        </div>
                    )}

                    {/* 2. LOGIKA WYŚWIETLANIA FORMULARZA */}
                    {authMethod === "login" && !user ? (
                        // Panel przekierowania do logowania
                        <div className="p-8 border border-zinc-800 bg-zinc-900/20 text-center animate-in fade-in">
                            <h3 className="text-white font-bold mb-2">Posiadasz konto PlayAgain?</h3>
                            <p className="text-zinc-400 text-sm mb-6">Zaloguj się, aby automatycznie uzupełnić dane do wysyłki.</p>

                            <button
                                onClick={() => router.push("/login?redirect=/platnosc")}
                                className="bg-white text-black px-6 py-2 font-bold uppercase text-sm hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                Przejdź do logowania
                            </button>

                            <div className="mt-4 border-t border-zinc-800 pt-4">
                                <button
                                    onClick={() => setAuthMethod("guest")}
                                    className="text-zinc-500 hover:text-white text-xs underline"
                                >
                                    Wróć do zakupu bez rejestracji
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Formularz (Dla Gościa LUB Zalogowanego)
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            <div className="border border-zinc-800 bg-black p-6 relative">
                                <h3 className="text-sm font-mono font-bold uppercase text-zinc-500 mb-6 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Dane Kontaktowe
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Email" name="email" type="email" placeholder="jan@example.com" value={formData.email} onChange={handleInputChange} required />
                                    <InputGroup label="Telefon" name="phone" type="tel" placeholder="+48 000 000 000" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="border border-zinc-800 bg-black p-6 relative">
                                <h3 className="text-sm font-mono font-bold uppercase text-zinc-500 mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Adres Dostawy
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <InputGroup label="Imię" name="firstName" placeholder="Jan" value={formData.firstName} onChange={handleInputChange} required />
                                    <InputGroup label="Nazwisko" name="lastName" placeholder="Kowalski" value={formData.lastName} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-6">
                                    <InputGroup label="Ulica i numer" name="address" placeholder="ul. Cybernetyki 10/24" value={formData.address} onChange={handleInputChange} required />
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="col-span-1">
                                            <InputGroup label="Kod Pocztowy" name="zipCode" placeholder="00-000" value={formData.zipCode} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-span-2">
                                            <InputGroup label="Miasto" name="city" placeholder="Warszawa" value={formData.city} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </form>
                    )}
                </div>

                {/* --- PRAWA KOLUMNA: PODSUMOWANIE (STICKY) --- */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">

                        <div className="bg-zinc-950 border border-zinc-800 p-6">
                            <h3 className="font-bold text-lg mb-6 uppercase flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-500" /> Podsumowanie
                            </h3>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <span className="text-zinc-300 line-clamp-2 pr-4">{item.name}</span>
                                        <span className="font-mono text-zinc-500 whitespace-nowrap">{item.price} zł</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Suma części</span>
                                    <span>{totalPrice} PLN</span>
                                </div>
                                <div className="flex justify-between text-zinc-400">
                                    <span>Dostawa</span>
                                    <span className="text-green-500">0 PLN</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-zinc-800/50 mt-2">
                                    <span>Razem brutto</span>
                                    <span className="text-blue-500">{totalPrice} PLN</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing || (authMethod === 'login' && !user)}
                                className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Przetwarzanie...</>
                                ) : (
                                    <>Zamawiam i Płacę <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" /> SSL Secure Payment
                            </div>
                        </div>

                        <div className="p-4 border border-blue-900/30 bg-blue-900/10 rounded text-xs text-blue-200/70 leading-relaxed">
                            <span className="font-bold text-blue-400 block mb-1">Gwarancja Satysfakcji</span>
                            Kupując jako gość czuj się jak u siebie :)
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

// --- KOMPONENT INPUT (Reusable) ---
const InputGroup = ({ label, name, type = "text", placeholder, value, onChange, required }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider block">
            {label} {required && <span className="text-blue-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-600 text-white px-4 py-3 text-sm transition-colors focus:outline-none placeholder:text-zinc-700"
        />
    </div>
);