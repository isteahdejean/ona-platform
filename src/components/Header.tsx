"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const LIBELLE_ROLE: Record<string, string> = {
  PRODUCTEUR: "Producteur d'idées",
  ASSURE: "Assuré",
  PENSIONNE: "Pensionné",
  SYNDICAT: "Groupe syndical",
  DIRECTION: "Direction",
  ADMIN: "Administration",
};

const TABLEAU_PAR_ROLE: Record<string, string> = {
  PRODUCTEUR: "/dashboard/producteur",
  ASSURE: "/dashboard/assure",
  PENSIONNE: "/dashboard/pensionne",
  SYNDICAT: "/dashboard/syndicat",
  DIRECTION: "/dashboard/direction",
  ADMIN: "/dashboard/direction",
};

export default function Header() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as string | null | undefined;

  return (
    <header className="sticky top-0 z-10 border-b border-ona-border bg-ona-surface/95 backdrop-blur">
      <div className="flex h-1.5 w-full">
        <div className="w-1/2 bg-ona-primary" />
        <div className="w-1/2 bg-ona-accent" />
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-si-ona.jpg"
            alt="SI-ONA"
            width={56}
            height={56}
            className="rounded-full"
            priority
          />
          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold text-ona-primary">
              SI-ONA
            </span>
            <span className="block text-[11px] uppercase tracking-wide text-ona-text-muted">
              Espace collaboratif indépendant
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/revue"
            className="hidden font-medium text-ona-text-muted hover:text-ona-primary sm:inline"
          >
            Revue hebdomadaire
          </Link>

          {status === "authenticated" && role && (
            <Link
              href={TABLEAU_PAR_ROLE[role] ?? "/"}
              className="font-medium text-ona-text-muted hover:text-ona-primary"
            >
              {LIBELLE_ROLE[role]}
            </Link>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full border border-ona-border px-4 py-1.5 text-ona-text transition hover:border-ona-accent hover:text-ona-accent"
            >
              Se déconnecter
            </button>
          ) : (
            status !== "loading" && (
              <Link
                href="/connexion"
                className="rounded-full bg-ona-primary px-5 py-1.5 font-medium text-white shadow-sm transition hover:bg-ona-primary-dark"
              >
                Se connecter
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
