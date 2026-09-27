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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/logo-si-ona.jpg"
            alt="SI-ONA"
            width={56}
            height={56}
            className="h-10 w-10 rounded-full sm:h-14 sm:w-14"
            priority
          />
          <div className="leading-tight">
            <span className="block font-display text-base font-semibold text-ona-primary sm:text-lg">
              SI-ONA
            </span>
            <span className="hidden text-[11px] uppercase tracking-wide text-ona-text-muted sm:block">
              Espace collaboratif indépendant
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 text-sm sm:gap-4">
          <Link
            href="/institution"
            className="hidden font-medium text-ona-text-muted hover:text-ona-primary sm:inline"
          >
            L&apos;institution
          </Link>
          <Link
            href="/revue"
            className="hidden font-medium text-ona-text-muted hover:text-ona-primary sm:inline"
          >
            Revue
          </Link>

          {status === "authenticated" && (
            <Link
              href="/profil"
              className="flex items-center gap-1.5 hover:opacity-80"
              title="Mon profil"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profil"}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ona-blue-bg text-xs font-medium text-ona-primary">
                  {(session?.user?.name ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden text-sm font-medium text-ona-text sm:inline">
                {session?.user?.name?.split(" ")[0]}
              </span>
            </Link>
          )}

          {status === "authenticated" && role && (
            <Link
              href={TABLEAU_PAR_ROLE[role] ?? "/"}
              className="hidden font-medium text-ona-text-muted hover:text-ona-primary sm:inline"
            >
              {LIBELLE_ROLE[role]}
            </Link>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full border border-ona-border px-3 py-1.5 text-xs text-ona-text transition hover:border-ona-accent hover:text-ona-accent sm:px-4 sm:text-sm"
            >
              Se déconnecter
            </button>
          ) : (
            status !== "loading" && (
              <Link
                href="/connexion"
                className="rounded-full bg-ona-primary px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-ona-primary-dark sm:px-5 sm:text-sm"
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
