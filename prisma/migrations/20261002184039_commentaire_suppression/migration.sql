-- DropIndex
DROP INDEX "Commentaire_reflexionId_idx";

-- AlterTable
ALTER TABLE "Commentaire" ADD COLUMN     "supprime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supprimeLe" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Commentaire_reflexionId_supprime_idx" ON "Commentaire"("reflexionId", "supprime");
