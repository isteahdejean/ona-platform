// Enregistre la liste officielle des bureaux et annexes de l'ONA.
// Peut etre relance sans risque : un bureau deja present n'est pas duplique.
// Utilisation : node prisma/seed-annexes.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANNEXES = [
  // Zone metropolitaine
  "Siège social",
  "Delmas 17 (Bureau central)",
  "Delmas 31",
  "Annexe de Port-au-Prince",
  "Carrefour",
  "Pétion-Ville",
  "SONAPI",
  "Shada",
  // Provinces
  "Cap-Haïtien",
  "Cayes",
  "Fort-Liberté",
  "Gonaïves",
  "Hinche",
  "Jacmel",
  "Jérémie",
  "Miragoâne",
  "Mirebalais",
  "Ouanaminthe",
  "Port-de-Paix",
  "Saint-Marc",
];

async function main() {
  for (const nom of ANNEXES) {
    await prisma.annexe.upsert({
      where: { nom },
      update: {},
      create: { nom },
    });
  }
  const total = await prisma.annexe.count();
  console.log(`Annexes enregistrees : ${total}`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
