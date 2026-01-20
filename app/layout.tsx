import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// --- 1. KONFIGURACJA GŁÓWNA SEO ---
export const metadata: Metadata = {
  // Ważne: Ustawienie domeny bazowej naprawia linki kanoniczne i OG Image
  metadataBase: new URL("https://playagain.store"), 

  title: {
    default: "PlayAgain | Używane Komputery Gamingowe i Konfigurator 3D",
    template: "%s | PlayAgain Store" // Na podstronach będzie: "Tytuł Strony | PlayAgain Store"
  },
  
  description: "Zbuduj wymarzony komputer gamingowy taniej o 40%. PlayAgain oferuje certyfikowany sprzęt refurbished z gwarancją 24 miesiące. Skorzystaj z konfiguratora PC 3D.",
  
  keywords: [
    "konfigurator pc", 
    "komputery używane", 
    "refurbished pc", 
    "tanie granie", 
    "sklep komputerowy", 
    "rtx używane", 
    "playagain",
    "komputery gamingowe poznań"
  ],

  // --- 2. USTAWIENIA IKON (LOGO W PASKU I GOOGLE) ---
  icons: {
    icon: "/logo2.svg", // Ikona w karcie przeglądarki i wynikach Google
    shortcut: "/logo2.svg",
    apple: "/logo2.svg", // Ikona dla iPhone/iPad
  },

  // Social Media (Facebook, Discord, LinkedIn)
  openGraph: {
    title: "PlayAgain - Next Gen Refurbished",
    description: "Wydajność klasy premium za ułamek ceny. Sprawdź nasze zestawy i interaktywny konfigurator.",
    url: "https://playagain.store",
    siteName: "PlayAgain Store",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Upewnij się, że masz plik og-image.jpg w folderze public (1200x630px)
        width: 1200,
        height: 630,
        alt: "PlayAgain Store - Konfigurator PC",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "PlayAgain | Tanie Komputery Gamingowe",
    description: "Zbuduj swój PC w 3D. Gwarancja 24m. Oszczędź do 40%.",
    images: ["/og-image.jpg"], // To samo zdjęcie co wyżej
  },

  // Roboty indeksujące
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Optymalizacja widoku mobilnego
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// --- 3. DANE STRUKTURALNE (SCHEMA.ORG) ---
// To pomaga Google zrozumieć, że to Sklep i przypisać logo do marki
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "PlayAgain",
  "url": "https://playagain.store",
  "logo": "https://playagain.store/logo.svg",
  "image": "https://playagain.store/og-image.jpg",
  "description": "Sklep z używanymi komputerami gamingowymi i częściami PC. Konfigurator 3D, gwarancja 24 miesiące, sprzęt refurbished.",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "17:00"
  },
  // Opcjonalnie: adres, jeśli masz fizyczny
  // "address": {
  //   "@type": "PostalAddress",
  //   "streetAddress": "Ulica",
  //   "addressLocality": "Poznań",
  //   "postalCode": "60-000",
  //   "addressCountry": "PL"
  // },
  "priceRange": "$$"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Wstrzyknięcie danych strukturalnych JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-zinc-100 antialiased flex flex-col min-h-screen selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}