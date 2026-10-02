import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const modificationSchema = z.object({
  titre: z.string().min(3).max(200),
  contenu: z.string().min(1),
});

// PATCH : modifier une reflexion. Reserve a son auteur : meme l'ADMIN ne
// peut pas changer les mots de quelqu'un d'autre.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    select: { auteurId: true },
  });
  if (!reflexion) {
    return NextResponse.json(
      { erreur: "Reflexion introuvable." },
      { status: 404 },
    );
  }
  if (reflexion.auteurId !== session.user.id) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = modificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  await prisma.reflexion.update({
    where: { id: params.id },
    data: { titre: parsed.data.titre, contenu: parsed.data.contenu },
  });

  return NextResponse.json({ ok: true });
}

// DELETE : supprimer une reflexion et tous ses commentaires.
// Autorise pour son auteur et pour l'ADMIN (moderation).
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const reflexion = await prisma.reflexion.findUnique({
    where: { id: params.id },
    select: { auteurId: true },
  });
  if (!reflexion) {
    return NextResponse.json(
      { erreur: "Reflexion introuvable." },
      { status: 404 },
    );
  }

  const estAdmin = session.user.role === "ADMIN";
  if (reflexion.auteurId !== session.user.id && !estAdmin) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  // Les commentaires sont supprimes automatiquement (onDelete: Cascade)
  await prisma.reflexion.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
