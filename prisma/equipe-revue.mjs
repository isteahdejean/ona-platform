// Ajoute ou retire un utilisateur de l'equipe editoriale de la Revue.
// Utilisation :
//   node prisma/equipe-revue.mjs email@exemple.com oui   (ajouter)
//   node prisma/equipe-revue.mjs email@exemple.com non   (retirer)
//   node prisma/equipe-revue.mjs liste                   (voir l'equipe)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const [premier, decision] = process.argv.slice(2);

async function main() {
  if (premier === "liste") {
    const equipe = await prisma.user.findMany({
      where: { editeurRevue: true },
      select: { email: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
    if (equipe.length === 0) {
      console.log("L'equipe de la Revue est vide.");
    } else {
      console.log("Equipe de la Revue :");
      for (const membre of equipe) {
        console.log(
          `- ${membre.name ?? "(sans nom)"} <${membre.email}> (${membre.role ?? "aucun role"})`,
        );
      }
    }
    return;
  }

  if (!premier || !["oui", "non"].includes(decision)) {
    console.log("Utilisation :");
    console.log("  node prisma/equipe-revue.mjs email@exemple.com oui");
    console.log("  node prisma/equipe-revue.mjs email@exemple.com non");
    console.log("  node prisma/equipe-revue.mjs liste");
    process.exit(1);
  }

  const utilisateur = await prisma.user.findUnique({
    where: { email: premier },
  });
  if (!utilisateur) {
    console.log(`Aucun utilisateur avec l'email : ${premier}`);
    process.exit(1);
  }

  const membre = decision === "oui";
  await prisma.user.update({
    where: { email: premier },
    data: { editeurRevue: membre },
  });
  console.log(
    membre
      ? `${premier} fait maintenant partie de l'equipe de la Revue.`
      : `${premier} ne fait plus partie de l'equipe de la Revue.`,
  );
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
