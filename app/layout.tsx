import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

// Ładujemy czcionki: Inter dla tekstów, Mono dla cyfr/detali technicznych
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// --- SEO START ---
export const metadata: Metadata = {
  title: "PlayAgain.tech | Konfigurator PC Refurbished",
  description: "Zbuduj swój wymarzony komputer z certyfikowanych części używanych. Oszczędź do 40% ceny i graj ekologicznie. Gwarancja 24 miesiące.",
  keywords: ["konfigurator pc", "komputery używane", "refurbished", "gaming pc", "tanie komputery"],
  openGraph: {
    title: "PlayAgain - Zbuduj PC z części Refurbished",
    description: "Interaktywny konfigurator 3D. Sprawdź, ile możesz zaoszczędzić.",
    type: "website",
    // images: ['/og-image.jpg'], // W przyszłości dodasz tu obrazek do social media
  },
};
// --- SEO END ---

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-black text-zinc-100 antialiased selection:bg-blue-600 selection:text-white">
        
        {/* Navbar jest tutaj, więc będzie widoczny NA KAŻDEJ podstronie */}
        <Navbar />
        
        {/* To jest miejsce, gdzie wstrzykiwana jest treść strony (np. Landing Page lub Konfigurator) */}
        {children}

      </body>
    </html>
  );
}