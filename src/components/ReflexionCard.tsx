import Link from "next/link";
import { MessageSquare } from "lucide-react";
import AuteurBadge from "@/components/AuteurBadge";

const STYLE_ROLE: Record<
  string,
  { texte: string; fond: string; bordure: string; libelle: string }
> = {
  PRODUCTEUR: {
    texte: "text-ona-primary",
    fond: "bg-ona-blue-bg",
    bordure: "border-ona-primary",
    libelle: "Producteur",
  },
  ASSURE: {
    texte: "text-ona-teal",
    fond: "bg-ona-teal-bg",
    bordure: "border-ona-teal",
    libelle: "Assuré",
  },
  PENSIONNE: {
    texte: "text-ona-gold",
    fond: "bg-ona-gold-bg",
    bordure: "border-ona-gold",
    libelle: "Pensionné",
  },
  SYNDICAT: {
    texte: "text-ona-violet",
    fond: "bg-ona-violet-bg",
    bordure: "border-ona-violet",
    libelle: "Syndicat",
  },
  DIRECTION: {
    texte: "text-ona-accent",
    fond: "bg-ona-red-bg",
    bordure: "border-ona-accent",
    libelle: "Direction",
  },
  ADMIN: {
    texte: "text-ona-accent",
    fond: "bg-ona-red-bg",
    bordure: "border-ona-accent",
    libelle: "Direction",
  },
};

type ReflexionListe = {
  id: string;
  titre: string;
  contenu: string;
  auteur: { name: string | null; image?: string | null; role?: string | null };
  _count: { commentaires: number };
};

// Carte utilisee pour afficher une reflexion dans une liste (tableaux de
// bord, revue, accueil). "featured" agrandit la carte (titre plus grand,
// extrait du texte) ; les autres restent compactes. L'accent de couleur
// suit le role de l'auteur, pour reperer d'un coup d'oeil qui publie quoi.
export default function ReflexionCard({
  reflexion,
  featured = false,
}: {
  reflexion: ReflexionListe;
  featured?: boolean;
}) {
  const style =
    STYLE_ROLE[reflexion.auteur.role ?? ""] ?? STYLE_ROLE.PRODUCTEUR;
  const extrait =
    reflexion.contenu.length > 160
      ? reflexion.contenu.slice(0, 160).trim() + "…"
      : reflexion.contenu;

  return (
    <Link
      href={`/reflexions/${reflexion.id}`}
      className={`block rounded-xl border-l-4 ${style.bordure} border-y border-r border-ona-border bg-ona-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        featured ? "p-6" : "p-4"
      }`}
    >
      <p
        className={`font-display font-semibold text-ona-text ${featured ? "text-2xl" : "text-lg"}`}
      >
        {reflexion.titre}
      </p>
      {featured && (
        <p className="mt-2 text-sm text-ona-text-muted">{extrait}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ona-text-muted">
        <AuteurBadge auteur={reflexion.auteur} />
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.fond} ${style.texte}`}
        >
          {style.libelle}
        </span>
        <span className="text-ona-border">·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {reflexion._count.commentaires}
        </span>
      </div>
    </Link>
  );
}
