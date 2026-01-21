import { MetadataRoute } from 'next';

const BASE_URL = 'https://playagain.store';
// Upewnij się, że ten URL API jest poprawny i dostępny publicznie
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://playagain.onrender.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. POBIERANIE DYNAMICZNYCH PRODUKTÓW (Gotowe zestawy)
  let products = [];
  try {
    const res = await fetch(`${API_URL}/api/prebuilts`, { 
      next: { revalidate: 3600 } // Odświeżaj mapę co godzinę
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("Błąd generowania sitemapy (produkty):", error);
  }

  // Mapowanie produktów na format sitemapy
  const productEntries: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${BASE_URL}/gotowe-konfiguracje/${product._id}`,
    lastModified: new Date(), // Jeśli masz pole updatedAt w bazie, użyj go tutaj
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 2. DEFINIOWANIE PODSTRON STATYCZNYCH
  const staticRoutes = [
    '',                   // Strona główna
    '/konfigurator',      // Twój najważniejszy landing page
    '/gotowe-konfiguracje',
    '/o-nas',
    '/kontakt',
    '/koszyk',
    '/login',
    '/rejestracja',
    '/regulamin',
    '/prywatnosc',
    '/gwarancja',
    '/faq',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : 0.8, // Strona główna ma najwyższy priorytet
  }));

  // 3. POŁĄCZENIE WSZYSTKIEGO
  return [...staticEntries, ...productEntries];
}