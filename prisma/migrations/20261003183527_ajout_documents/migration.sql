-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeMime" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "chemin" TEXT NOT NULL,
    "reflexionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_chemin_key" ON "Document"("chemin");

-- CreateIndex
CREATE INDEX "Document_reflexionId_idx" ON "Document"("reflexionId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_reflexionId_fkey" FOREIGN KEY ("reflexionId") REFERENCES "Reflexion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
