import { getServerSession } from "next-auth";
import { Megaphone } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReflexionForm from "@/components/ReflexionForm";
import EnteteEspace from "@/components/EnteteEspace";
import ReflexionCard from "@/components/ReflexionCard";

export default async function TableauSyndicat() {
  const session = await getServerSession(authOptions);
  const reflexions = await prisma.reflexion.findMany({
    where: { publie: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      auteur: { select: { name: true, image: true, role: true } },
      _count: { select: { commentaires: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <EnteteEspace
        titre="Espace syndicats & groupes organisés"
        sousTitre={`Bonjour ${session?.user?.name}. Publiez un communiqué ou consultez les échanges en cours.`}
        Icone={Megaphone}
        couleur="text-ona-violet"
        fond="bg-ona-violet-bg"
      />

      <div className="mt-8">
        <ReflexionForm />
      </div>

      <div className="mt-10 space-y-4">
        {reflexions.map((r, i) => (
          <ReflexionCard key={r.id} reflexion={r} featured={i === 0} />
        ))}
        {reflexions.length === 0 && (
          <p className="text-sm text-ona-text-muted">
            Aucune réflexion publiée pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
