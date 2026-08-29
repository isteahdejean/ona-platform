import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Newsreader (titres) + Inter (texte courant), chargees et auto-hebergees par
// Next.js au build. Necessite un acces internet normal (celui de votre PC) :
// ca ne fonctionnait pas dans le bac a sable de Claude, mais fonctionnera chez vous.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "SI-ONA — Espace collaboratif indépendant",
  description: "Espace collaboratif independant des employes, assures, pensionnes et syndicats de l'ONA : reflexions, echanges et revue hebdomadaire.",
  icons: { icon: "/logo-si-ona.svg" },
  openGraph: {
    title: "SI-ONA — Espace collaboratif indépendant",
    description: "Assurons les jeunes, protégeons les vieux.",
    images: ["/ona-banner.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${inter.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
