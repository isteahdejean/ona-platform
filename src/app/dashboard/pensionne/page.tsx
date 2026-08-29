import Link from "next/link";
import { getServerSession } from "next-auth";
import { HeartHandshake, MessageSquare } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EnteteEspace from "@/components/EnteteEspace";

export default async function TableauPensionne() {
  const session = await getServerSession(authOptions);
  const reflexions = await prisma.reflexion.findMany({
    where: { publie: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { auteur: { select: { name: true } }, _count: { select: { commentaires: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <EnteteEspace
        titre="Espace pensionnés"
        sousTitre={`Bonjour ${session?.user?.name}. Retrouvez les réflexions publiées par l'institution.`}
        Icone={HeartHandshake}
        couleur="text-ona-gold"
        fond="bg-ona-gold-bg"
      />

      <div className="mt-8 space-y-3">
        {reflexions.map((r) => (
          <Link
            key={r.id}
            href={`/reflexions/${r.id}`}
            className="block rounded-xl border border-ona-border bg-ona-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ona-gold hover:shadow-md"
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
        {reflexions.length === 0 && (
          <p className="text-sm text-ona-text-muted">Aucune réflexion publiée pour le moment.</p>
        )}
      </div>
    </div>
  );
}
