"use client";

import { useEffect } from "react";
import Link from "next/link";

// Page affichee en cas de probleme technique (par exemple si la base de
// donnees ne repond pas). Next.js exige que ce soit un composant client.
export default function PageErreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Garde une trace de l'erreur dans la console, utile pour le diagnostic
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <div className="mx-auto flex h-1 w-16 overflow-hidden rounded-full">
        <div className="w-1/2 bg-ona-primary" />
        <div className="w-1/2 bg-ona-accent" />
      </div>
      <h1 className="mt-8 font-display text-2xl font-semibold text-ona-text">
        Le service est momentanément indisponible
      </h1>
      <p className="mt-3 text-ona-text-muted">
        Un problème technique nous empêche d&apos;afficher cette page. Réessayez
        dans quelques instants.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-ona-text-muted">
          Référence de l&apos;erreur : {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-ona-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-ona-primary-dark"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-md border border-ona-primary px-5 py-2.5 text-sm font-medium text-ona-primary hover:bg-ona-blue-bg"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
