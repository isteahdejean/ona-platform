import { ImageResponse } from "next/og";

export const runtime = "edge";

// Image d'apercu affichee quand le lien du site est partage
// (WhatsApp, Facebook, LinkedIn...). Generee automatiquement par Next.js
// au format recommande de 1200 x 630 pixels.

export const alt = "SI-ONA — Espace collaboratif indépendant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Couleurs de SI-ONA (a ajuster si besoin selon globals.css)
const BLEU_FONCE = "#0b2a66";
const BLEU = "#0f3d9d";
const ROUGE = "#e40d37";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: BLEU_FONCE,
        color: "#ffffff",
      }}
    >
      {/* Bande bleu et rouge en haut, comme dans l'en-tete du site */}
      <div style={{ display: "flex", width: "100%", height: 12 }}>
        <div style={{ width: "50%", height: "100%", backgroundColor: BLEU }} />
        <div style={{ width: "50%", height: "100%", backgroundColor: ROUGE }} />
      </div>

      {/* Anneaux de la page d'accueil, a droite */}
      <svg
        width="620"
        height="620"
        viewBox="0 0 400 400"
        style={{ position: "absolute", right: -120, top: -40, opacity: 0.22 }}
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          stroke="#ffffff"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="150"
          stroke={ROUGE}
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="110"
          stroke="#ffffff"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="200"
          cy="200"
          r="70"
          stroke="#ffffff"
          strokeWidth="14"
          fill="none"
        />
      </svg>

      {/* Contenu */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "64px 80px 56px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 1 }}>
            SI-ONA
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
              marginTop: 8,
            }}
          >
            Espace collaboratif indépendant
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 780,
          }}
        >
          Penser la protection sociale, ensemble.
        </div>

        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)" }}>
          ona-platform.vercel.app
        </div>
      </div>
    </div>,
    { ...size },
  );
}
