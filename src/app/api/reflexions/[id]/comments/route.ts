import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  contenu: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

// Tous les roles connectes peuvent commenter : aucune limite de nombre
// n'est imposee par l'API (seule la pagination cote lecture limite l'affichage).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Commentaire invalide." }, { status: 400 });
  }

  const commentaire = await prisma.commentaire.create({
    data: {
      contenu: parsed.data.contenu,
      parentId: parsed.data.parentId,
      auteurId: session.user.id,
      reflexionId: params.id,
    },
  });

  return NextResponse.json(commentaire, { status: 201 });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const commentaires = await prisma.commentaire.findMany({
    where: { reflexionId: params.id },
    orderBy: { createdAt: "asc" },
    include: { auteur: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json({ commentaires });
}
