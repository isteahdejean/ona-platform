import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sert la photo de profil d'un utilisateur : /api/user/photo?id=...
// - photo enregistree dans SI-ONA (image JPEG en base) : renvoyee directement
// - photo Google (lien externe) : redirection vers ce lien
// - pas de photo : 404 (l'interface affiche alors l'initiale du nom)
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return new NextResponse(null, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { image: true },
  });
  const image = user?.image;
  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  if (image.startsWith("data:image/")) {
    const virgule = image.indexOf(",");
    const type = image.slice(5, image.indexOf(";"));
    const octets = new Uint8Array(
      Buffer.from(image.slice(virgule + 1), "base64"),
    );
    return new NextResponse(octets, {
      headers: {
        "Content-Type": type,
        // Garde la photo en cache 5 minutes pour ne pas la relire a chaque page
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  if (/^https?:\/\//.test(image)) {
    return NextResponse.redirect(image);
  }

  return new NextResponse(null, { status: 404 });
}
