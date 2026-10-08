"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { LIBELLE_ROLE, TABLEAU_PAR_ROLE } from "@/lib/roles";

// Liens de navigation du site, communs a l'ordinateur et au telephone
const LIENS_SITE = [
  { href: "/institution", libelle: "L'institution" },
  { href: "/revue", libelle: "Revue" },
  { href: "/memoires", libelle: "Mémoires" },
];

// Ordinateur : liens masques sur les petits ecrans
const LIEN_NAV = "hidden font-medium hover:text-ona-primary sm:inline";
// Telephone : grandes lignes faciles a toucher (au moins 44 px de haut)
const LIEN_MOBILE =
  "block w-full rounded-md px-3 py-3 text-left text-base font-medium hover:bg-ona-blue-bg hover:text-ona-primary";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const enteteRef = useRef<HTMLElement>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [photoIndisponible, setPhotoIndisponible] = useState(false);

  const role = (session?.user as any)?.role as string | null | undefined;
  const connecte = status === "authenticated";
  const prenom = session?.user?.name?.split(" ")[0];
  const libelleRole = role ? LIBELLE_ROLE[role] : undefined;
  const photo = session?.user?.image;
  const lienEspace = connecte && role ? (TABLEAU_PAR_ROLE[role] ?? "/") : null;

  // La page actuelle est mise en evidence dans la navigation
  function estActif(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Ferme le menu quand on change de page
  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);

  // Ferme le menu avec la touche Echap ou un clic en dehors de l'en-tete
  useEffect(() => {
    if (!menuOuvert) return;
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOuvert(false);
    }
    function surClic(e: MouseEvent) {
      if (enteteRef.current && !enteteRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    }
    document.addEventListener("keydown", surTouche);
    document.addEventListener("mousedown", surClic);
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("mousedown", surClic);
    };
  }, [menuOuvert]);

  const fermerMenu = () => setMenuOuvert(false);

  return (
    <header
      ref={enteteRef}
      className="sticky top-0 z-10 border-b border-ona-border bg-ona-surface/95 backdrop-blur"
    >
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

        <div className="flex items-center gap-2 text-sm sm:gap-4">
          {/* Navigation sur ordinateur */}
          <nav
            aria-label="Navigation principale"
            className="flex items-center gap-4"
          >
            {LIENS_SITE.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                aria-current={estActif(lien.href) ? "page" : undefined}
                className={`${LIEN_NAV} ${estActif(lien.href) ? "text-ona-primary" : "text-ona-text-muted"}`}
              >
                {lien.libelle}
              </Link>
            ))}
            {lienEspace && (
              <Link
                href={lienEspace}
                aria-current={estActif(lienEspace) ? "page" : undefined}
                className={`${LIEN_NAV} ${estActif(lienEspace) ? "text-ona-primary" : "text-ona-text-muted"}`}
              >
                Mon espace
              </Link>
            )}
          </nav>

          {/* Bloc utilisateur */}
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
                    referrerPolicy="no-referrer"
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

              {/* Sur telephone, la deconnexion est dans le menu */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-full border border-ona-border px-4 py-1.5 text-sm text-ona-text transition hover:border-ona-accent hover:text-ona-accent sm:inline-flex"
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

          {/* Bouton du menu, uniquement sur telephone */}
          <button
            type="button"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
            aria-expanded={menuOuvert}
            aria-controls="menu-mobile"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-10 w-10 items-center justify-center rounded-md text-ona-text hover:bg-ona-blue-bg sm:hidden"
          >
            {menuOuvert ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Menu deroulant sur telephone */}
      {menuOuvert && (
        <nav
          id="menu-mobile"
          aria-label="Menu mobile"
          className="border-t border-ona-border bg-ona-surface px-4 py-3 sm:hidden"
        >
          <ul className="space-y-1">
            {LIENS_SITE.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  onClick={fermerMenu}
                  aria-current={estActif(lien.href) ? "page" : undefined}
                  className={`${LIEN_MOBILE} ${estActif(lien.href) ? "bg-ona-blue-bg text-ona-primary" : "text-ona-text"}`}
                >
                  {lien.libelle}
                </Link>
              </li>
            ))}
            {lienEspace && (
              <li>
                <Link
                  href={lienEspace}
                  onClick={fermerMenu}
                  aria-current={estActif(lienEspace) ? "page" : undefined}
                  className={`${LIEN_MOBILE} ${estActif(lienEspace) ? "bg-ona-blue-bg text-ona-primary" : "text-ona-text"}`}
                >
                  Mon espace
                </Link>
              </li>
            )}
          </ul>

          {connecte && (
            <div className="mt-3 border-t border-ona-border pt-3">
              <p className="px-3 text-sm text-ona-text-muted">
                {session?.user?.name}
                {libelleRole ? ` · ${libelleRole}` : ""}
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <Link
                    href="/profil"
                    onClick={fermerMenu}
                    className={`${LIEN_MOBILE} ${estActif("/profil") ? "bg-ona-blue-bg text-ona-primary" : "text-ona-text"}`}
                  >
                    Mon profil
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className={`${LIEN_MOBILE} text-ona-accent`}
                  >
                    Se déconnecter
                  </button>
                </li>
              </ul>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
