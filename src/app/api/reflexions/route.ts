import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const creationSchema = z.object({
  titre: z.string().min(3).max(200),
  contenu: z.string().min(1),
  type: z.enum(["REFLEXION", "REVUE"]).optional(),
});

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
      _count: { select: { commentaires: true } },
    },
  });

  return NextResponse.json({
    reflexions,
    nextCursor: reflexions.length === take ? reflexions[reflexions.length - 1].id : null,
  });
}

// Producteurs, syndicats (et direction/admin) peuvent publier des reflexions
// ou des entrees de la revue hebdomadaire.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || !role || !["PRODUCTEUR", "SYNDICAT", "DIRECTION", "ADMIN"].includes(role)) {
    return NextResponse.json({ erreur: "Non autorise." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = creationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  const reflexion = await prisma.reflexion.create({
    data: {
      titre: parsed.data.titre,
      contenu: parsed.data.contenu,
      type: parsed.data.type ?? "REFLEXION",
      auteurId: session.user.id,
      publie: true,
    },
  });

  return NextResponse.json(reflexion, { status: 201 });
}
