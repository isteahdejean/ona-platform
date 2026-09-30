"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LIBELLE_ROLE, TABLEAU_PAR_ROLE } from "@/lib/roles";

// Classe commune aux liens de navigation (masques sur mobile)
const LIEN_NAV =
  "hidden font-medium text-ona-text-muted hover:text-ona-primary sm:inline";

export default function Header() {
  const { data: session, status } = useSession();
  const [photoIndisponible, setPhotoIndisponible] = useState(false);
  const role = (session?.user as any)?.role as string | null | undefined;
  const connecte = status === "authenticated";
  const prenom = session?.user?.name?.split(" ")[0];
  const libelleRole = role ? LIBELLE_ROLE[role] : undefined;
  const photo = session?.user?.image;

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

        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {/* Navigation du site */}
          <nav
            aria-label="Navigation principale"
            className="flex items-center gap-4"
          >
            <Link href="/institution" className={LIEN_NAV}>
              L&apos;institution
            </Link>
            <Link href="/revue" className={LIEN_NAV}>
              Revue
            </Link>
            {connecte && role && (
              <Link href={TABLEAU_PAR_ROLE[role] ?? "/"} className={LIEN_NAV}>
                Mon espace
              </Link>
            )}
          </nav>

          {/* Bloc utilisateur, separe de la navigation */}
          {connecte ? (
            <div className="flex items-center gap-3 sm:border-l sm:border-ona-border sm:pl-4">
              <Link
                href="/profil"
                className="flex items-center gap-2 rounded-full hover:opacity-80"
                title="Mon profil"
              >
                {photo && !photoIndisponible ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={session?.user?.name ?? "Profil"}
                    onError={() => setPhotoIndisponible(true)}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ona-blue-bg text-xs font-medium text-ona-primary">
                    {(session?.user?.name ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden leading-tight sm:block">
                  <span className="block text-sm font-medium text-ona-text">
                    {prenom}
                  </span>
                  {libelleRole && (
                    <span className="block text-xs text-ona-text-muted">
                      {libelleRole}
                    </span>
                  )}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-ona-border px-3 py-1.5 text-xs text-ona-text transition hover:border-ona-accent hover:text-ona-accent sm:px-4 sm:text-sm"
              >
                Se déconnecter
              </button>
            </div>
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
        </div>
      </div>
    </header>
  );
}
