import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, BUCKET_DOCUMENTS } from "@/lib/supabase";

// GET /api/documents/[id] : ouvre (PDF) ou telecharge (Word) un document.
// Le bucket etant prive, on cree un lien temporaire valable 60 secondes,
// uniquement si le visiteur a le droit de voir la reflexion.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    select: {
      nom: true,
      typeMime: true,
      chemin: true,
      reflexion: { select: { publie: true, auteurId: true } },
    },
  });
  if (!document) {
    return NextResponse.json(
      { erreur: "Document introuvable." },
      { status: 404 },
    );
  }

  // Document d'une reflexion non publiee : seulement l'auteur et l'ADMIN
  if (!document.reflexion.publie) {
    const session = await getServerSession(authOptions);
    const autorise =
      session?.user?.id === document.reflexion.auteurId ||
      session?.user?.role === "ADMIN";
    if (!autorise) {
      return NextResponse.json(
        { erreur: "Document introuvable." },
        { status: 404 },
      );
    }
  }

  // Un PDF s'ouvre dans le navigateur ; un Word est telecharge avec son nom
  const estPdf = document.typeMime === "application/pdf";
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .createSignedUrl(
      document.chemin,
      60,
      estPdf ? undefined : { download: document.nom },
    );

  if (error || !data) {
    console.error("Lien de document impossible :", error);
    return NextResponse.json(
      { erreur: "Document indisponible." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
