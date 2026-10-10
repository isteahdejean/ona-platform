import { Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReflexionCard from "@/components/ReflexionCard";

// Page recalculee a chaque visite : la Revue est toujours a jour (sinon
// Vercel servirait une "photo" prise au moment du deploiement).
export const dynamic = "force-dynamic";

export default async function Revue() {
  const entrees = await prisma.reflexion.findMany({
    where: { publie: true, type: "REVUE" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      auteur: { select: { id: true, name: true, role: true } },
      _count: { select: { commentaires: { where: { supprime: false } } } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-4 rounded-xl border border-ona-border bg-ona-red-bg p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/70">
          <Newspaper className="h-6 w-6 text-ona-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ona-text">
            Revue
          </h1>
          <p className="mt-0.5 text-sm text-ona-text-muted">
            La sélection hebdomadaire de l&apos;équipe éditoriale de SI-ONA,
            ouverte à toutes et tous.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {entrees.map((r, i) => (
          <ReflexionCard key={r.id} reflexion={r} featured={i === 0} />
        ))}
        {entrees.length === 0 && (
          <p className="text-sm text-ona-text-muted">
            Aucune revue publiée pour le moment. Revenez bientôt.
          </p>
        )}
      </div>
    </div>
  );
}
