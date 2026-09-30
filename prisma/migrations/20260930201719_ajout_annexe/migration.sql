-- AlterTable
ALTER TABLE "User" ADD COLUMN     "annexeId" TEXT;

-- CreateTable
CREATE TABLE "Annexe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Annexe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Annexe_nom_key" ON "Annexe"("nom");

-- CreateIndex
CREATE INDEX "User_annexeId_idx" ON "User"("annexeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_annexeId_fkey" FOREIGN KEY ("annexeId") REFERENCES "Annexe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
