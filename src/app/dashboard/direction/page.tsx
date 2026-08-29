import { getServerSession } from "next-auth";
import { Building2, FileText, MessageSquare, Users } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EnteteEspace from "@/components/EnteteEspace";

const LIBELLE_ROLE: Record<string, string> = {
  PRODUCTEUR: "Producteurs",
  ASSURE: "Assurés",
  PENSIONNE: "Pensionnés",
  SYNDICAT: "Syndicats",
  DIRECTION: "Direction",
  ADMIN: "Administration",
};

const STYLE_CARTE = [
  { fond: "bg-ona-blue-bg", couleur: "text-ona-primary" },
  { fond: "bg-ona-red-bg", couleur: "text-ona-accent" },
  { fond: "bg-ona-teal-bg", couleur: "text-ona-teal" },
  { fond: "bg-ona-gold-bg", couleur: "text-ona-gold" },
  { fond: "bg-ona-violet-bg", couleur: "text-ona-violet" },
];

export default async function TableauDirection() {
  const session = await getServerSession(authOptions);
  const [utilisateursParRole, totalReflexions, totalCommentaires] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    prisma.reflexion.count(),
    prisma.commentaire.count(),
  ]);

  const cartes = [
    { label: "Réflexions", valeur: totalReflexions, Icone: FileText },
    { label: "Commentaires", valeur: totalCommentaires, Icone: MessageSquare },
    ...utilisateursParRole.map((g) => ({
      label: LIBELLE_ROLE[g.role ?? ""] ?? "Sans rôle",
      valeur: g._count.role,
      Icone: Users,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <EnteteEspace
        titre="Espace direction"
        sousTitre={`Bonjour ${session?.user?.name}. Vue d'ensemble de l'activité de la plateforme.`}
        Icone={Building2}
        couleur="text-ona-accent"
        fond="bg-ona-red-bg"
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cartes.map((c, i) => {
          const style = STYLE_CARTE[i % STYLE_CARTE.length];
          return (
            <div key={c.label} className="rounded-xl border border-ona-border bg-ona-surface p-4 shadow-sm">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${style.fond}`}>
                <c.Icone className={`h-4 w-4 ${style.couleur}`} />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-ona-text">{c.valeur}</p>
              <p className="text-xs text-ona-text-muted">{c.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
