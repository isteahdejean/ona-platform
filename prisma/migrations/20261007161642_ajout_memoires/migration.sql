-- AlterEnum
ALTER TYPE "TypeContenu" ADD VALUE 'MEMOIRE';

-- AlterTable
ALTER TABLE "Reflexion" ADD COLUMN     "anneeSoutenance" INTEGER,
ADD COLUMN     "attesteLe" TIMESTAMP(3),
ADD COLUMN     "domaine" TEXT,
ADD COLUMN     "etablissement" TEXT;

-- CreateIndex
CREATE INDEX "Reflexion_type_domaine_idx" ON "Reflexion"("type", "domaine");
