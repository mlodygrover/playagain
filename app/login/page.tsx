"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const server_port = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";
console.log(process.env.NEXT_PUBLIC_API_URL)
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    // Pobieramy parametr redirect (np. /platnosc) lub domyślnie /
    const redirectUrl = searchParams.get("redirect") || "/";

    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Wybór endpointu (Logowanie lub Rejestracja)
        const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
        // UWAGA: Port 5009 z Twojego loga
        const apiUrl = `${server_port}${endpoint}`;

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Wystąpił błąd");
            }

            if (isRegister) {
                // ZMIANA: Zamiast alertu, ustawiamy specjalny stan sukcesu rejestracji
                alert("Rejestracja udana! Wysłaliśmy link aktywacyjny na Twój email. Kliknij go, aby się zalogować.");
                setIsRegister(false); // Przełączamy na widok logowania
            } else {
                // Logowanie sukces
                login(data.token, data.user);
                router.push(redirectUrl);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">

                {/* Dekoracja tła */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                        {isRegister ? "Dołącz do Gry" : "Witaj Ponownie"}
                    </h1>
                    <p className="text-zinc-500 text-sm font-mono">
                        {isRegister ? "Stwórz konto i zapisz konfigurację." : "Zaloguj się, aby kontynuować."}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 mb-6 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {isRegister && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Imię</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                                    <input
                                        name="firstName"
                                        placeholder="Jan"
                                        onChange={handleInputChange}
                                        className="w-full bg-black border border-zinc-800 focus:border-blue-600 px-10 py-2 text-sm text-white outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-zinc-500 font-bold">Nazwisko</label>
                                <input
                                    name="lastName"
                                    placeholder="Kowalski"
                                    onChange={handleInputChange}
                                    className="w-full bg-black border border-zinc-800 focus:border-blue-600 px-4 py-2 text-sm text-white outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                            <input
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                onChange={handleInputChange}
                                className="w-full bg-black border border-zinc-800 focus:border-blue-600 px-10 py-2 text-sm text-white outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold">Hasło</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                onChange={handleInputChange}
                                className="w-full bg-black border border-zinc-800 focus:border-blue-600 px-10 py-2 text-sm text-white outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest py-3 mt-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRegister ? "Zarejestruj się" : "Zaloguj się")}
                    </button>

                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-500">
                        {isRegister ? "Masz już konto?" : "Nie masz konta?"}{" "}
                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-blue-500 hover:text-white font-bold underline transition-colors"
                        >
                            {isRegister ? "Zaloguj się" : "Zarejestruj się"}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <LoginContent />
        </Suspense>
    );
}