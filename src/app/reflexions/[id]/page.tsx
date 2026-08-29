import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentSection from "@/components/CommentSection";

export default async function PageReflexion({ params }: { params: { id: string } }) {
  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    include: {
      auteur: { select: { name: true, role: true } },
      commentaires: {
        orderBy: { createdAt: "asc" },
        include: { auteur: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!reflexion) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-ona-accent">{reflexion.auteur.role}</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-ona-primary">{reflexion.titre}</h1>
      <p className="mt-1 text-sm text-ona-text-muted">Par {reflexion.auteur.name}</p>
      <div className="mt-6 whitespace-pre-wrap text-ona-text">{reflexion.contenu}</div>

      <CommentSection
        reflexionId={reflexion.id}
        commentairesInitiaux={reflexion.commentaires.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
