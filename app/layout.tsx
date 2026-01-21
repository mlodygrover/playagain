import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// --- 1. KONFIGURACJA GŁÓWNA SEO ---
export const metadata: Metadata = {
  metadataBase: new URL("https://playagain.store"),

  title: "Konfigurator PC 3D | Złóż Tani Komputer Gamingowy z Części Używanych",
  description: "Pierwszy w Polsce konfigurator używanych komputerów gamingowych. Zbuduj PC w 3D taniej o 40%. Gwarancja 24 miesiące, części refurbished, RTX i Intel/AMD.",
  keywords: [
    "konfigurator komputera",
    "konfigurator pc",
    "używane komputery gamingowe",
    "składanie komputera online",
    "tani komputer do gier",
    "konfigurator pc 3d",
    "części używane z gwarancją",
    "komputery refurbished"
  ],

  icons: {
    icon: "/logo2.svg",
    shortcut: "/logo2.svg",
    apple: "/logo2.svg",
  },

  openGraph: {
    title: "PlayAgain - Next Gen Refurbished",
    description: "Wydajność klasy premium za ułamek ceny. Sprawdź nasze zestawy i interaktywny konfigurator.",
    url: "https://playagain.store",
    siteName: "PlayAgain Store",
    locale: "pl_PL",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PlayAgain Store - Konfigurator PC",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PlayAgain | Tanie Komputery Gamingowe",
    description: "Zbuduj swój PC w 3D. Gwarancja 24m. Oszczędź do 40%.",
    images: ["/og-image.jpg"],
  },

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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// --- 3. DANE STRUKTURALNE SKLEPU (GLOBALNE) ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ComputerStore", // Precyzyjny typ
  "name": "PlayAgain",
  "alternateName": "PlayAgain Store",
  "url": "https://playagain.store",
  "logo": "https://playagain.store/logo.svg",
  "image": "https://playagain.store/og-image.jpg",
  "description": "Sklep z używanymi komputerami gamingowymi i częściami PC. Konfigurator 3D, gwarancja 24 miesiące, sprzęt refurbished.",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    ],
    "opens": "09:00",
    "closes": "17:00"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ul. Cybernetyki 10",
    "addressLocality": "Warszawa",
    "postalCode": "02-677",
    "addressCountry": "PL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "52.1795",
    "longitude": "21.0000"
  },
  "priceRange": "$$",
  // Linki do Social Media (Ważne dla Brand Authority)
  "sameAs": [
    "https://www.facebook.com/playagainstore",
    "https://www.instagram.com/playagainstore",
    "https://www.tiktok.com/@playagainstore"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${mono.variable}`}>
      <head>
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