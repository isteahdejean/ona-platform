"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PenLine, ShieldCheck, HeartHandshake, Megaphone, type LucideIcon } from "lucide-react";

const ROLES: {
  valeur: string;
  titre: string;
  texte: string;
  tableau: string;
  Icone: LucideIcon;
  couleur: string;
  fond: string;
}[] = [
  {
    valeur: "PRODUCTEUR",
    titre: "Employé / producteur d'idées",
    texte: "Je publie des réflexions sur la sécurité sociale.",
    tableau: "/dashboard/producteur",
    Icone: PenLine,
    couleur: "text-ona-primary",
    fond: "bg-ona-blue-bg",
  },
  {
    valeur: "ASSURE",
    titre: "Assuré",
    texte: "J'accède à l'espace dédié aux assurés.",
    tableau: "/dashboard/assure",
    Icone: ShieldCheck,
    couleur: "text-ona-teal",
    fond: "bg-ona-teal-bg",
  },
  {
    valeur: "PENSIONNE",
    titre: "Pensionné",
    texte: "J'accède à l'espace dédié aux pensionnés.",
    tableau: "/dashboard/pensionne",
    Icone: HeartHandshake,
    couleur: "text-ona-gold",
    fond: "bg-ona-gold-bg",
  },
  {
    valeur: "SYNDICAT",
    titre: "Syndicat / groupe organisé",
    texte: "Je représente un syndicat ou un groupe organisé de l'institution.",
    tableau: "/dashboard/syndicat",
    Icone: Megaphone,
    couleur: "text-ona-violet",
    fond: "bg-ona-violet-bg",
  },
];

// Le role "Direction" n'apparait pas ici : il est attribue manuellement
// par un administrateur, pour eviter qu'un compte externe se l'auto-attribue.
export default function Inscription() {
  const { status } = useSession();
  const router = useRouter();
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  if (status === "unauthenticated") {
    router.replace("/connexion");
    return null;
  }

  async function choisirRole(role: string, tableau: string) {
    setEnCours(role);
    setErreur(null);
    const reponse = await fetch("/api/user/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!reponse.ok) {
      setErreur("Impossible d'enregistrer ce rôle, réessayez.");
      setEnCours(null);
      return;
    }
    router.push(tableau);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-2xl font-semibold text-ona-primary">
        Quel est votre profil ?
      </h1>
      <p className="mt-2 text-sm text-ona-text-muted">
        Ce choix détermine l&apos;espace de travail auquel vous accédez. Un administrateur pourra
        l&apos;ajuster si besoin.
      </p>

      <div className="mt-8 grid gap-3">
        {ROLES.map(({ valeur, titre, texte, tableau, Icone, couleur, fond }) => (
          <button
            key={valeur}
            disabled={enCours !== null}
            onClick={() => choisirRole(valeur, tableau)}
            className="flex items-start gap-4 rounded-xl border border-ona-border bg-ona-surface p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-ona-primary/40 disabled:opacity-60"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${fond}`}>
              <Icone className={`h-5 w-5 ${couleur}`} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ona-text">{titre}</p>
              <p className="mt-1 text-sm text-ona-text-muted">{texte}</p>
              {enCours === valeur && <p className="mt-2 text-xs text-ona-accent">Enregistrement...</p>}
            </div>
          </button>
        ))}
      </div>
      {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
