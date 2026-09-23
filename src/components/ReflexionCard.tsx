import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";

const STYLE_ROLE: Record<
  string,
  { texte: string; fond: string; libelle: string }
> = {
  PRODUCTEUR: {
    texte: "text-ona-primary",
    fond: "bg-ona-blue-bg",
    libelle: "Producteur",
  },
  ASSURE: { texte: "text-ona-teal", fond: "bg-ona-teal-bg", libelle: "Assuré" },
  PENSIONNE: {
    texte: "text-ona-gold",
    fond: "bg-ona-gold-bg",
    libelle: "Pensionné",
  },
  SYNDICAT: {
    texte: "text-ona-violet",
    fond: "bg-ona-violet-bg",
    libelle: "Syndicat",
  },
  DIRECTION: {
    texte: "text-ona-accent",
    fond: "bg-ona-red-bg",
    libelle: "Direction",
  },
  ADMIN: {
    texte: "text-ona-accent",
    fond: "bg-ona-red-bg",
    libelle: "Direction",
  },
};

export default async function PageReflexion({
  params,
}: {
  params: { id: string };
}) {
  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    include: {
      auteur: {
        select: { name: true, role: true, image: true, poste: true, bio: true },
      },
      commentaires: {
        orderBy: { createdAt: "asc" },
        include: {
          auteur: { select: { id: true, name: true, role: true, image: true } },
        },
      },
    },
  });

  if (!reflexion) notFound();

  const style =
    STYLE_ROLE[reflexion.auteur.role ?? ""] ?? STYLE_ROLE.PRODUCTEUR;

  return (
    <article className="mx-auto max-w-2xl px-6 py-12">
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${style.fond} ${style.texte}`}
      >
        {style.libelle}
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ona-primary sm:text-4xl">
        {reflexion.titre}
      </h1>

      <div className="mt-5 flex items-center gap-3 border-b border-ona-border pb-6">
        {reflexion.auteur.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reflexion.auteur.image}
            alt={reflexion.auteur.name ?? "Auteur"}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ona-blue-bg text-lg font-medium text-ona-primary">
            {(reflexion.auteur.name ?? "?").charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-medium text-ona-text">{reflexion.auteur.name}</p>
          {reflexion.auteur.poste && (
            <p className="text-sm text-ona-text-muted">
              {reflexion.auteur.poste}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-ona-text first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-none first-letter:text-ona-primary">
        {reflexion.contenu}
      </div>

      {reflexion.auteur.bio && (
        <div className="mt-10 rounded-lg border border-ona-border bg-ona-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ona-text-muted">
            À propos de l&apos;auteur
          </p>
          <p className="mt-2 text-sm text-ona-text-muted">
            {reflexion.auteur.bio}
          </p>
        </div>
      )}

      <CommentSection
        reflexionId={reflexion.id}
        commentairesInitiaux={reflexion.commentaires.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </article>
  );
}
