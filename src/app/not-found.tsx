import Link from "next/link";

// Page affichee quand une adresse n'existe pas (lien casse, faute de
// frappe, reflexion supprimee...).
export default function PageIntrouvable() {
  return (
    <div className="relative overflow-hidden">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <div className="mx-auto flex h-1 w-16 overflow-hidden rounded-full">
          <div className="w-1/2 bg-ona-primary" />
          <div className="w-1/2 bg-ona-accent" />
        </div>
        <p className="mt-8 font-display text-6xl font-semibold text-ona-primary">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ona-text">
          Cette page est introuvable
        </h1>
        <p className="mt-3 text-ona-text-muted">
          L&apos;adresse est peut-être incorrecte, ou le contenu a été supprimé
          par son auteur.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-ona-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-ona-primary-dark"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/memoires"
            className="rounded-md border border-ona-primary px-5 py-2.5 text-sm font-medium text-ona-primary hover:bg-ona-blue-bg"
          >
            Voir les mémoires
          </Link>
          <Link
            href="/revue"
            className="rounded-md px-5 py-2.5 text-sm font-medium text-ona-primary hover:underline"
          >
            Lire la revue
          </Link>
        </div>
      </div>
    </div>
  );
}
