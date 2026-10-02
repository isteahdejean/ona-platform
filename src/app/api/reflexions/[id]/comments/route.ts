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
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: "Commentaire invalide." },
      { status: 400 },
    );
  }

  // La reflexion doit exister et etre publiee
  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    select: { publie: true },
  });
  if (!reflexion?.publie) {
    return NextResponse.json(
      { erreur: "Reflexion introuvable." },
      { status: 404 },
    );
  }

  // Une reponse doit viser un commentaire de la meme reflexion, non supprime
  if (parsed.data.parentId) {
    const parent = await prisma.commentaire.findUnique({
      where: { id: parsed.data.parentId },
      select: { reflexionId: true, supprime: true },
    });
    if (!parent || parent.reflexionId !== params.id || parent.supprime) {
      return NextResponse.json(
        { erreur: "Commentaire introuvable." },
        { status: 400 },
      );
    }
  }

  const commentaire = await prisma.commentaire.create({
    data: {
      contenu: parsed.data.contenu.trim(),
      parentId: parsed.data.parentId,
      auteurId: session.user.id,
      reflexionId: params.id,
    },
  });

  return NextResponse.json(commentaire, { status: 201 });
}

// GET : les commentaires d'une reflexion. Les commentaires supprimes ne
// sont renvoyes qu'a l'ADMIN (moderation).
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const estAdmin = session?.user?.role === "ADMIN";

  const commentaires = await prisma.commentaire.findMany({
    where: {
      reflexionId: params.id,
      ...(estAdmin ? {} : { supprime: false }),
    },
    orderBy: { createdAt: "asc" },
    include: { auteur: { select: { id: true, name: true, role: true } } },
  });
  return NextResponse.json({ commentaires });
}

// DELETE : /api/reflexions/[id]/comments?commentaireId=...
// L'auteur du commentaire (ou l'ADMIN) le marque comme supprime. Il n'est
// pas efface : il disparait pour tous, mais reste visible par l'ADMIN.
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const commentaireId = new URL(req.url).searchParams.get("commentaireId");
  if (!commentaireId) {
    return NextResponse.json(
      { erreur: "Commentaire manquant." },
      { status: 400 },
    );
  }

  const commentaire = await prisma.commentaire.findUnique({
    where: { id: commentaireId },
    select: { auteurId: true, reflexionId: true, supprime: true },
  });
  if (!commentaire || commentaire.reflexionId !== params.id) {
    return NextResponse.json(
      { erreur: "Commentaire introuvable." },
      { status: 404 },
    );
  }

  const estAdmin = session.user.role === "ADMIN";
  if (commentaire.auteurId !== session.user.id && !estAdmin) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  if (!commentaire.supprime) {
    await prisma.commentaire.update({
      where: { id: commentaireId },
      data: { supprime: true, supprimeLe: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
