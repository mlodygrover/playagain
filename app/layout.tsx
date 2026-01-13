import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext"; // <--- IMPORT
import { AuthProvider } from "@/context/AuthContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-black text-zinc-100 antialiased flex flex-col min-h-screen">

        {/* OWIJAMY WSZYSTKO W CART PROVIDER */}
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