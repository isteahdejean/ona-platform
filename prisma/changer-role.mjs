// Change le role d'un utilisateur, a partir de son email.
// Utilisation : node prisma/changer-role.mjs email@exemple.com ADMIN
// Sert notamment a attribuer DIRECTION ou ADMIN, qui ne peuvent pas
// etre choisis a l'inscription.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROLES = [
  "PRODUCTEUR",
  "ASSURE",
  "PENSIONNE",
  "SYNDICAT",
  "DIRECTION",
  "ADMIN",
];

const [email, role] = process.argv.slice(2);

async function main() {
  if (!email || !ROLES.includes(role)) {
    console.log(
      "Utilisation : node prisma/changer-role.mjs email@exemple.com ROLE",
    );
    console.log("Roles possibles : " + ROLES.join(", "));
    process.exit(1);
  }

  const utilisateur = await prisma.user.findUnique({ where: { email } });
  if (!utilisateur) {
    console.log(`Aucun utilisateur avec l'email : ${email}`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role } });
  console.log(`Role de ${email} : ${utilisateur.role ?? "aucun"} -> ${role}`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
