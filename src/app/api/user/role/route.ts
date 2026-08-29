import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Roles qu'un utilisateur peut se donner lui-meme a l'inscription.
// DIRECTION et ADMIN restent attribues manuellement par un administrateur.
const roleSchema = z.object({
  role: z.enum(["PRODUCTEUR", "ASSURE", "PENSIONNE", "SYNDICAT"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erreur: "Non connecte." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Role invalide." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ role: user.role });
}
