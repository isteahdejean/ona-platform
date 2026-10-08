import Link from "next/link";
import { GraduationCap } from "lucide-react";

// Invitation a publier un memoire, affichee dans les espaces des membres
// qui ne publient pas de reflexions (assures, pensionnes).
export default function EncartMemoire() {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-lg border border-ona-border bg-ona-surface p-5 sm:flex-row sm:items-center">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ona-blue-bg">
        <GraduationCap
          className="h-5 w-5 text-ona-primary"
          aria-hidden="true"
        />
      </span>
      <div className="flex-1">
        <p className="font-display text-lg font-semibold text-ona-text">
          Vous avez soutenu un mémoire ?
        </p>
        <p className="mt-1 text-sm text-ona-text-muted">
          Partagez votre travail de fin d&apos;études avec la communauté SI-ONA.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/memoires/publier"
          className="rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white hover:bg-ona-primary-dark"
        >
          Publier un mémoire
        </Link>
        <Link
          href="/memoires"
          className="rounded-md px-4 py-2 text-sm font-medium text-ona-primary hover:underline"
        >
          Voir les mémoires
        </Link>
      </div>
    </div>
  );
}
