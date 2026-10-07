import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  supabaseAdmin,
  BUCKET_DOCUMENTS,
  TAILLE_MAX_DOCUMENT,
} from "@/lib/supabase";

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const demandeSchema = z.object({
  typeMime: z.string(),
  taille: z.number().int().positive(),
});

// POST : donne au navigateur une autorisation temporaire pour envoyer un
// document directement dans Supabase Storage. Tout utilisateur ayant un role
// peut envoyer un document (tout le monde peut publier un memoire) ; les
// droits de publication propres a chaque type sont verifies ensuite.
// Le nom du fichier stocke est genere par le serveur et place dans un
// dossier propre a l'auteur.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.role) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = demandeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  const extension = EXTENSIONS[parsed.data.typeMime];
  if (!extension) {
    return NextResponse.json(
      { erreur: "Formats acceptes : PDF ou Word (.docx)." },
      { status: 400 },
    );
  }
  if (parsed.data.taille > TAILLE_MAX_DOCUMENT) {
    return NextResponse.json(
      { erreur: "Document trop lourd (20 Mo maximum)." },
      { status: 400 },
    );
  }

  const chemin = `${session.user.id}/${randomUUID()}.${extension}`;
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .createSignedUploadUrl(chemin);

  if (error || !data) {
    console.error("Autorisation d'envoi impossible :", error);
    return NextResponse.json(
      { erreur: "Envoi impossible pour le moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ chemin, jeton: data.token });
}
