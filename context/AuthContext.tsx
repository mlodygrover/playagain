"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 1. Definiujemy adres API (lub importujemy go)
const server_port = process.env.NEXT_PUBLIC_API_URL || "https://playagain.onrender.com";
interface User {
    id: string;
    email: string;
    firstName?: string;
}

// 2. Dodajemy isAdmin do typu kontekstu
interface AuthContextType {
    user: User | null;
    token: string | null;
    isAdmin: boolean; // <--- WAŻNE: Dodano tutaj
    loading: boolean; // Opcjonalnie: warto dodać stan ładowania
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true); // Stan ładowania
    const router = useRouter();

    // Funkcja sprawdzająca admina
    const checkAdminStatus = async (currentToken: string) => {
        try {
            const res = await fetch(`${server_port}/api/auth/is-admin`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            const data = await res.json();
            setIsAdmin(!!data.isAdmin); // Rzutowanie na boolean dla pewności
        } catch (err) {
            console.error("Błąd sprawdzania admina", err);
            setIsAdmin(false);
        }
    };

    // 1. Inicjalizacja z LocalStorage (tylko raz przy starcie)
    useEffect(() => {
        const storedToken = localStorage.getItem("playagain_token");
        const storedUser = localStorage.getItem("playagain_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Sprawdź admina od razu przy odświeżeniu
            checkAdminStatus(storedToken); 
        }
        setLoading(false);
    }, []);

    // 2. Nasłuchuj zmian tokena (np. po logowaniu)
    useEffect(() => {
        if (token) {
            checkAdminStatus(token);
        } else {
            setIsAdmin(false);
        }
    }, [token]);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("playagain_token", newToken);
        localStorage.setItem("playagain_user", JSON.stringify(userData));
        // useEffect [token] sam odpali checkAdminStatus
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAdmin(false); // Reset admina
        localStorage.removeItem("playagain_token");
        localStorage.removeItem("playagain_user");
        router.push("/");
    };

    return (
        // 3. Przekazujemy isAdmin i loading do reszty aplikacji
        <AuthContext.Provider value={{ user, token, isAdmin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}