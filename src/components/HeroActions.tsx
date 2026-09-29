"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { TABLEAU_PAR_ROLE } from "@/lib/roles";

// Boutons du hero de la page d'accueil. Composant client car le bouton
// principal depend de la session : "Se connecter" pour un visiteur,
// "Mon espace" pour un utilisateur connecte.
export default function HeroActions() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | null | undefined;

  const boutonPrincipal =
    "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-ona-primary-dark transition hover:bg-white/90";

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {status === "loading" ? (
        // Espace reserve de la meme taille pendant le chargement de la
        // session, pour que la page ne "saute" pas (CLS reste a 0)
        <span
          aria-hidden="true"
          className="inline-block h-12 w-44 rounded-full bg-white/10"
        />
      ) : status === "authenticated" ? (
        role ? (
          <Link
            href={TABLEAU_PAR_ROLE[role] ?? "/profil"}
            className={boutonPrincipal}
          >
            Mon espace
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link href="/profil" className={boutonPrincipal}>
            Mon profil
            <ArrowRight className="h-4 w-4" />
          </Link>
        )
      ) : (
        <Link href="/connexion" className={boutonPrincipal}>
          Se connecter
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <Link
        href="/revue"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
      >
        Lire la revue
      </Link>
    </div>
  );
}
