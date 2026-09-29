import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Newsreader (titres) + Inter (texte courant), telechargees et auto-hebergees
// par Next.js. Necessite un acces internet au demarrage du serveur.
//
// Newsreader n'a pas de mesures connues de Next.js pour ajuster
// automatiquement la police de secours : on desactive donc cet ajustement
// (ce qui supprime l'avertissement "Failed to find font override values")
// et on definit une police de secours a empattements, proche de Newsreader.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  adjustFontFallback: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ona-platform.vercel.app"),
  title: "SI-ONA — Espace collaboratif indépendant",
  description:
    "Espace collaboratif indépendant des employés, assurés, pensionnés et syndicats de l'ONA : réflexions, échanges et revue hebdomadaire.",
  icons: { icon: "/logo-si-ona.jpg" },
  openGraph: {
    title: "SI-ONA — Espace collaboratif indépendant",
    description: "Assurons les jeunes, protégeons les vieux.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
