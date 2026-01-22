"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  cartEntryId: string; // UNIKALNE ID dla wpisu w koszyku
  id: string;          // ID produktu z bazy danych
  name: string;
  price: number;
  image?: string | null;
  type: "single_part" | "custom_build";
  components?: string[];
};

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "cartEntryId">) => void; // Przy dodawaniu nie musisz podawać cartEntryId
  removeFromCart: (cartEntryId: string) => void; // Usuwamy po unikalnym ID wpisu
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("playagain_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Błąd parsowania koszyka", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("playagain_cart", JSON.stringify(items));
  }, [items]);

  // Funkcja dodawania generuje teraz unikalny klucz dla każdego wpisu
  const addToCart = (item: Omit<CartItem, "cartEntryId">) => {
    const newItem: CartItem = {
      ...item,
      cartEntryId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Funkcja usuwania filtruje po cartEntryId zamiast zwykłym id produktu
  const removeFromCart = (cartEntryId: string) => {
    setItems((prev) => {
      // Znajdujemy indeks pierwszego elementu o tym ID wpisu
      const index = prev.findIndex(item => item.cartEntryId === cartEntryId);
      if (index !== -1) {
        const newItems = [...prev];
        newItems.splice(index, 1); // Usuwa dokładnie jeden element
        return newItems;
      }
      return prev;
    });
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