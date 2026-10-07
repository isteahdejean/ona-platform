import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  supabaseAdmin,
  BUCKET_DOCUMENTS,
  TAILLE_MAX_DOCUMENT,
} from "@/lib/supabase";
import { verifierDocument } from "@/lib/documents";
import {
  DOMAINES_MEMOIRE,
  ANNEE_MIN_MEMOIRE,
  anneeMaxMemoire,
} from "@/lib/memoires";

const memoireSchema = z.object({
  titre: z.string().trim().min(3).max(200),
  resume: z.string().trim().min(20).max(5000),
  etablissement: z.string().trim().min(2).max(200),
  anneeSoutenance: z.number().int().min(ANNEE_MIN_MEMOIRE),
  domaine: z.enum(DOMAINES_MEMOIRE),
  // L'attestation doit avoir ete cochee
  attestation: z.literal(true),
  // Le document est obligatoire pour un memoire
  document: z.object({
    chemin: z.string().min(1).max(300),
    nom: z.string().min(1).max(255),
  }),
});

// POST : publier un memoire. Tout utilisateur connecte ayant un role peut
// publier ; le memoire est visible immediatement (l'ADMIN peut le supprimer).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.role) {
    return NextResponse.json(
      { erreur: "Connectez-vous pour publier." },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = memoireSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: "Informations incompletes ou invalides." },
      { status: 400 },
    );
  }

  const donnees = parsed.data;

  if (donnees.anneeSoutenance > anneeMaxMemoire()) {
    return NextResponse.json(
      { erreur: "Annee de soutenance invalide." },
      { status: 400 },
    );
  }

  // Un auteur ne peut joindre que les fichiers de son propre dossier
  if (!donnees.document.chemin.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ erreur: "Document invalide." }, { status: 400 });
  }

  const infos = await verifierDocument(donnees.document.chemin);
  if (
    !infos ||
    !Number.isFinite(infos.taille) ||
    infos.taille > TAILLE_MAX_DOCUMENT
  ) {
    await supabaseAdmin.storage
      .from(BUCKET_DOCUMENTS)
      .remove([donnees.document.chemin]);
    return NextResponse.json(
      {
        erreur:
          "Document refuse : seuls les vrais fichiers PDF ou Word sont acceptes.",
      },
      { status: 400 },
    );
  }

  const memoire = await prisma.reflexion.create({
    data: {
      type: "MEMOIRE",
      titre: donnees.titre,
      contenu: donnees.resume,
      etablissement: donnees.etablissement,
      anneeSoutenance: donnees.anneeSoutenance,
      domaine: donnees.domaine,
      attesteLe: new Date(),
      publie: true,
      auteurId: session.user.id,
      documents: {
        create: {
          nom: donnees.document.nom.replace(/[\\/]/g, "_").trim(),
          typeMime: infos.typeMime,
          taille: infos.taille,
          chemin: donnees.document.chemin,
        },
      },
    },
    select: { id: true },
  });

  return NextResponse.json(memoire, { status: 201 });
}
