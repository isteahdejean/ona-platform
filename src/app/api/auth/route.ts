import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const inscriptionSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// Creation d'un compte email/mot de passe. Le role n'est pas defini ici :
// une fois connecte, le nouvel utilisateur passe par /inscription pour
// choisir son profil (producteur, assure, pensionne, syndicat), comme les
// comptes crees via Google.
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = inscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Donnees invalides." }, { status: 400 });
  }

  const existant = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existant) {
    return NextResponse.json(
      { erreur: "Un compte existe deja avec cet email." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  return NextResponse.json({ ok: true });
}
