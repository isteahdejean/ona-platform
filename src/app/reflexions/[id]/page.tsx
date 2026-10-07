import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { FileText } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import CommentSection from "@/components/CommentSection";
import ActionsReflexion from "@/components/ActionsReflexion";

type StyleRole = { texte: string; fond: string; libelle: string };

const STYLE_ROLE: Record<string, StyleRole> = {
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

// "1,4 Mo" ou "380 Ko"
function formaterTaille(octets: number) {
  if (octets >= 1024 * 1024) {
    return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
  }
  return `${Math.max(1, Math.round(octets / 1024))} Ko`;
}

export default async function PageReflexion({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const utilisateurId = session?.user?.id ?? null;
  const estAdmin = session?.user?.role === "ADMIN";

  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    include: {
      auteur: {
        select: { id: true, name: true, role: true, poste: true, bio: true },
      },
      documents: {
        orderBy: { createdAt: "asc" },
        select: { id: true, nom: true, typeMime: true, taille: true },
      },
      commentaires: {
        // Les commentaires supprimes ne sont charges que pour l'ADMIN
        where: estAdmin ? {} : { supprime: false },
        orderBy: { createdAt: "asc" },
        include: {
          auteur: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });

  if (!reflexion) notFound();

  const estAuteur = reflexion.auteurId === utilisateurId;

  // Une reflexion non publiee n'est visible que par son auteur et l'ADMIN
  if (!reflexion.publie && !estAuteur && !estAdmin) notFound();

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
      {reflexion.type === "MEMOIRE" && (
        <p className="mt-3 text-sm font-medium text-ona-text-muted">
          Mémoire ·{" "}
          {[
            reflexion.domaine,
            reflexion.etablissement,
            reflexion.anneeSoutenance,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3 border-b border-ona-border pb-6">
        <Avatar
          id={reflexion.auteur.id}
          nom={reflexion.auteur.name}
          taille={56}
        />
        <div>
          <p className="font-medium text-ona-text">{reflexion.auteur.name}</p>
          {reflexion.auteur.poste && (
            <p className="text-sm text-ona-text-muted">
              {reflexion.auteur.poste}
            </p>
          )}
        </div>
      </div>

      <ActionsReflexion
        reflexionId={reflexion.id}
        titreInitial={reflexion.titre}
        contenuInitial={reflexion.contenu}
        peutModifier={estAuteur}
        peutSupprimer={estAuteur || estAdmin}
      />
      {reflexion.type === "MEMOIRE" && (
        <h2 className="mt-8 font-display text-xl font-semibold text-ona-primary">
          Résumé
        </h2>
      )}

      <div className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-ona-text first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-none first-letter:text-ona-primary">
        {reflexion.contenu}
      </div>

      {reflexion.documents.length > 0 && (
        <div className="mt-8 space-y-2">
          {reflexion.documents.map((d) => {
            const estPdf = d.typeMime === "application/pdf";
            return (
              <a
                key={d.id}
                href={`/api/documents/${d.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-ona-border bg-ona-surface p-4 transition hover:border-ona-primary"
              >
                <FileText
                  className="h-6 w-6 shrink-0 text-ona-primary"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ona-text">
                    {d.nom}
                  </span>
                  <span className="text-xs text-ona-text-muted">
                    {estPdf ? "PDF" : "Word"} · {formaterTaille(d.taille)} ·{" "}
                    {estPdf ? "Ouvrir" : "Télécharger"}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      )}

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
        utilisateurId={utilisateurId}
        estAdmin={estAdmin}
        commentairesInitiaux={reflexion.commentaires.map((c) => ({
          id: c.id,
          contenu: c.contenu,
          parentId: c.parentId,
          createdAt: c.createdAt.toISOString(),
          supprime: c.supprime,
          supprimeLe: c.supprimeLe ? c.supprimeLe.toISOString() : null,
          auteur: c.auteur,
        }))}
      />
    </article>
  );
}
