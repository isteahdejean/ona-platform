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

const creationSchema = z.object({
  titre: z.string().min(3).max(200),
  contenu: z.string().min(1),
  type: z.enum(["REFLEXION", "REVUE"]).optional(),
  document: z
    .object({
      chemin: z.string().min(1).max(300),
      nom: z.string().min(1).max(255),
    })
    .optional(),
});

const TYPE_PDF = "application/pdf";
const TYPE_WORD =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Verifie le VRAI format d'un document envoye, a partir de ses premiers
// octets (et non de son extension, facile a falsifier) :
// un PDF commence par "%PDF", un fichier Word .docx par "PK" (format zip).
async function verifierDocument(chemin: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .createSignedUrl(chemin, 60);
  if (error || !data) return null;

  const reponse = await fetch(data.signedUrl, {
    headers: { Range: "bytes=0-7" },
  });
  if (!reponse.ok) return null;

  const octets = new Uint8Array(await reponse.arrayBuffer()).slice(0, 8);
  const plage = reponse.headers.get("content-range"); // ex. "bytes 0-7/123456"
  const taille = plage
    ? Number(plage.split("/")[1])
    : Number(reponse.headers.get("content-length"));

  const estPdf =
    octets[0] === 0x25 &&
    octets[1] === 0x50 &&
    octets[2] === 0x44 &&
    octets[3] === 0x46;
  const estDocx =
    octets[0] === 0x50 &&
    octets[1] === 0x4b &&
    octets[2] === 0x03 &&
    octets[3] === 0x04;

  if (estPdf) return { typeMime: TYPE_PDF, taille };
  if (estDocx) return { typeMime: TYPE_WORD, taille };
  return null;
}

// Liste des reflexions publiees, les plus recentes d'abord.
// ?type=REVUE permet de ne recuperer que la revue hebdomadaire.
// Pagination par curseur pour rester performant a grande echelle.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const type = searchParams.get("type");
  const take = 20;

  const reflexions = await prisma.reflexion.findMany({
    where: {
      publie: true,
      ...(type === "REVUE" || type === "REFLEXION" ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      auteur: { select: { id: true, name: true, role: true } },
      _count: { select: { commentaires: { where: { supprime: false } } } },
    },
  });

  return NextResponse.json({
    reflexions,
    nextCursor:
      reflexions.length === take ? reflexions[reflexions.length - 1].id : null,
  });
}

// Producteurs, syndicats (et direction/admin) peuvent publier des reflexions
// ou des entrees de la revue hebdomadaire, avec un document joint facultatif.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (
    !session?.user ||
    !role ||
    !["PRODUCTEUR", "SYNDICAT", "DIRECTION", "ADMIN"].includes(role)
  ) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = creationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  // La Revue est reservee a l'equipe editoriale (et a l'ADMIN)
  const estEditeurRevue =
    Boolean((session.user as any).editeurRevue) || role === "ADMIN";
  if (parsed.data.type === "REVUE" && !estEditeurRevue) {
    return NextResponse.json(
      { erreur: "La Revue est reservee a l'equipe editoriale." },
      { status: 403 },
    );
  }

  const doc = parsed.data.document;
  let infosDocument: { typeMime: string; taille: number } | null = null;

  if (doc) {
    // Un auteur ne peut joindre que les fichiers de son propre dossier
    if (!doc.chemin.startsWith(`${session.user.id}/`)) {
      return NextResponse.json(
        { erreur: "Document invalide." },
        { status: 400 },
      );
    }
    infosDocument = await verifierDocument(doc.chemin);
    if (
      !infosDocument ||
      !Number.isFinite(infosDocument.taille) ||
      infosDocument.taille > TAILLE_MAX_DOCUMENT
    ) {
      // Fichier refuse : on le retire du stockage
      await supabaseAdmin.storage.from(BUCKET_DOCUMENTS).remove([doc.chemin]);
      return NextResponse.json(
        {
          erreur:
            "Document refuse : seuls les vrais fichiers PDF ou Word sont acceptes.",
        },
        { status: 400 },
      );
    }
  }

  const reflexion = await prisma.reflexion.create({
    data: {
      titre: parsed.data.titre,
      contenu: parsed.data.contenu,
      type: parsed.data.type ?? "REFLEXION",
      auteurId: session.user.id,
      publie: true,
      ...(doc && infosDocument
        ? {
            documents: {
              create: {
                // Nom affiche aux lecteurs, sans caracteres de chemin
                nom: doc.nom.replace(/[\\/]/g, "_").trim(),
                typeMime: infosDocument.typeMime,
                taille: infosDocument.taille,
                chemin: doc.chemin,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json(reflexion, { status: 201 });
}
