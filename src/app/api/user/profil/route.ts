import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Photo envoyee par la page profil : image JPEG deja redimensionnee dans le
// navigateur. On refuse tout autre format et les fichiers trop lourds.
const TAILLE_MAX_PHOTO = 300_000; // caracteres base64, environ 220 Ko

const profilSchema = z.object({
  bio: z.string().max(1000).default(""),
  poste: z.string().max(120).default(""),
  direction: z.string().max(150).default(""),
  annexeId: z.string().nullable().optional(),
  photo: z
    .string()
    .startsWith("data:image/jpeg;base64,")
    .max(TAILLE_MAX_PHOTO)
    .optional(),
});

// Supprime les espaces en trop ("  Direction   des  X " -> "Direction des X")
function nettoyer(texte: string) {
  return texte.trim().replace(/\s+/g, " ");
}

// GET : profil actuel de l'utilisateur connecte + liste des annexes,
// pour pre-remplir le formulaire.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const [user, annexes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        poste: true,
        bio: true,
        annexeId: true,
        direction: { select: { nom: true } },
      },
    }),
    prisma.annexe.findMany({
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json(
      { erreur: "Utilisateur introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    profil: {
      image: user.image,
      poste: user.poste ?? "",
      bio: user.bio ?? "",
      direction: user.direction?.nom ?? "",
      annexeId: user.annexeId,
    },
    annexes,
  });
}

// POST : enregistre le profil de l'utilisateur connecte, et uniquement le sien.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = profilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  const { bio, poste, direction, annexeId, photo } = parsed.data;

  // Verifie que l'annexe choisie existe vraiment
  if (annexeId) {
    const annexe = await prisma.annexe.findUnique({
      where: { id: annexeId },
      select: { id: true },
    });
    if (!annexe) {
      return NextResponse.json({ erreur: "Annexe inconnue." }, { status: 400 });
    }
  }

  // Direction / Service : texte libre pour l'instant (en attendant la liste
  // officielle issue de l'organigramme). Une entree identique est reutilisee.
  const nomDirection = nettoyer(direction);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: bio.trim() || null,
      poste: nettoyer(poste) || null,
      annexe: annexeId ? { connect: { id: annexeId } } : { disconnect: true },
      direction: nomDirection
        ? {
            connectOrCreate: {
              where: { nom: nomDirection },
              create: { nom: nomDirection },
            },
          }
        : { disconnect: true },
      // La photo n'est remplacee que si l'utilisateur en a choisi une nouvelle
      ...(photo ? { image: photo } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
