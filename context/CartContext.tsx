"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Definicja pojedynczego produktu w koszyku
// Może to być pojedyncza część LUB cały skonfigurowany PC
export type CartItem = {
  id: string; // Unikalne ID wpisu w koszyku (np. timestamp)
  name: string;
  price: number;
  image?: string | null;
  type: "single_part" | "custom_build";
  components?: string[]; // Lista nazw komponentów (dla zestawu PC)
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Opcjonalnie: Ładowanie z LocalStorage przy starcie
  useEffect(() => {
    const savedCart = localStorage.getItem("playagain_cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Zapisywanie do LocalStorage przy zmianach
  useEffect(() => {
    localStorage.setItem("playagain_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}