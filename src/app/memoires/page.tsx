import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DOMAINES_MEMOIRE } from "@/lib/memoires";
import AuteurBadge from "@/components/AuteurBadge";

// La liste depend des filtres choisis : page calculee a chaque visite
export const dynamic = "force-dynamic";

const CHAMP = "rounded-md border border-ona-border bg-white px-3 py-2 text-sm";

export default async function PageMemoires({
  searchParams,
}: {
  searchParams: { domaine?: string; annee?: string };
}) {
  // On n'accepte que des filtres valides
  const domaine = (DOMAINES_MEMOIRE as readonly string[]).includes(
    searchParams.domaine ?? "",
  )
    ? searchParams.domaine
    : undefined;
  const anneeNombre = Number(searchParams.annee);
  const annee =
    Number.isInteger(anneeNombre) && anneeNombre > 0 ? anneeNombre : undefined;

  const [memoires, anneesDisponibles] = await Promise.all([
    prisma.reflexion.findMany({
      where: {
        type: "MEMOIRE",
        publie: true,
        ...(domaine ? { domaine } : {}),
        ...(annee ? { anneeSoutenance: annee } : {}),
      },
      orderBy: [{ anneeSoutenance: "desc" }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true,
        titre: true,
        contenu: true,
        etablissement: true,
        anneeSoutenance: true,
        domaine: true,
        auteur: { select: { id: true, name: true } },
      },
    }),
    // Les annees pour lesquelles au moins un memoire existe
    prisma.reflexion.findMany({
      where: { type: "MEMOIRE", publie: true },
      distinct: ["anneeSoutenance"],
      select: { anneeSoutenance: true },
      orderBy: { anneeSoutenance: "desc" },
    }),
  ]);

  const filtreActif = Boolean(domaine || annee);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold text-ona-primary">
            Mémoires
          </h1>
          <p className="mt-2 text-ona-text-muted">
            Travaux de fin d&apos;études partagés par les membres de SI-ONA :
            une archive ouverte sur la sécurité sociale et les domaines qui la
            nourrissent.
          </p>
        </div>
        <Link
          href="/memoires/publier"
          className="rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white hover:bg-ona-primary-dark"
        >
          Publier un mémoire
        </Link>
      </div>

      {/* Filtres : formulaire classique, fonctionne meme sans JavaScript */}
      <form method="get" className="mt-8 flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="filtre-domaine"
            className="block text-xs font-medium text-ona-text-muted"
          >
            Domaine
          </label>
          <select
            id="filtre-domaine"
            name="domaine"
            defaultValue={domaine ?? ""}
            className={CHAMP}
          >
            <option value="">Tous les domaines</option>
            {DOMAINES_MEMOIRE.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="filtre-annee"
            className="block text-xs font-medium text-ona-text-muted"
          >
            Année
          </label>
          <select
            id="filtre-annee"
            name="annee"
            defaultValue={annee ?? ""}
            className={CHAMP}
          >
            <option value="">Toutes les années</option>
            {anneesDisponibles.map(
              ({ anneeSoutenance }) =>
                anneeSoutenance && (
                  <option key={anneeSoutenance} value={anneeSoutenance}>
                    {anneeSoutenance}
                  </option>
                ),
            )}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md border border-ona-primary px-4 py-2 text-sm font-medium text-ona-primary hover:bg-ona-blue-bg"
        >
          Filtrer
        </button>
        {filtreActif && (
          <Link
            href="/memoires"
            className="px-2 py-2 text-sm text-ona-text-muted hover:text-ona-text"
          >
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="mt-8 space-y-4">
        {memoires.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ona-border p-8 text-center">
            <p className="text-ona-text">
              {filtreActif
                ? "Aucun mémoire ne correspond à ces filtres."
                : "Aucun mémoire n'a encore été publié."}
            </p>
            {!filtreActif && (
              <Link
                href="/memoires/publier"
                className="mt-3 inline-block text-sm font-medium text-ona-primary hover:underline"
              >
                Soyez le premier à partager le vôtre
              </Link>
            )}
          </div>
        ) : (
          memoires.map((m) => (
            <Link
              key={m.id}
              href={`/reflexions/${m.id}`}
              className="block rounded-xl border border-ona-border bg-ona-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-medium text-ona-text-muted">
                {[m.domaine, m.etablissement, m.anneeSoutenance]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-ona-text">
                {m.titre}
              </p>
              <p className="mt-2 text-sm text-ona-text-muted">
                {m.contenu.length > 220
                  ? m.contenu.slice(0, 220).trim() + "…"
                  : m.contenu}
              </p>
              <div className="mt-3 text-xs text-ona-text-muted">
                <AuteurBadge auteur={m.auteur} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
