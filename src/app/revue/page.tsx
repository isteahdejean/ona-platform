import Link from "next/link";
import { Newspaper, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Page publique : pas besoin d'etre connecte pour lire la revue hebdomadaire,
// seule la publication est reservee aux producteurs/direction.
export default async function Revue() {
  const entrees = await prisma.reflexion.findMany({
    where: { publie: true, type: "REVUE" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { auteur: { select: { name: true } }, _count: { select: { commentaires: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-4 rounded-xl border border-ona-border bg-ona-red-bg p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/70">
          <Newspaper className="h-6 w-6 text-ona-accent" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ona-text">Revue hebdomadaire</h1>
          <p className="mt-0.5 text-sm text-ona-text-muted">
            Une sélection publiée chaque semaine, ouverte à toutes et tous.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {entrees.map((r) => (
          <Link
            key={r.id}
            href={`/reflexions/${r.id}`}
            className="block rounded-xl border border-ona-border bg-ona-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ona-accent hover:shadow-md"
          >
            <p className="font-display text-lg font-semibold text-ona-text">{r.titre}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ona-text-muted">
              {r.auteur.name}
              <span className="text-ona-border">·</span>
              <MessageSquare className="h-3.5 w-3.5" />
              {r._count.commentaires}
            </p>
          </Link>
        ))}
        {entrees.length === 0 && (
          <p className="text-sm text-ona-text-muted">
            Aucune revue publiée pour le moment — revenez bientôt.
          </p>
        )}
      </div>
    </div>
  );
}
