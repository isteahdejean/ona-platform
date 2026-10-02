import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sert la photo de profil d'un utilisateur : /api/user/photo?id=...
// - photo enregistree dans SI-ONA (image JPEG en base) : renvoyee directement
// - photo Google (lien externe) : redirection vers ce lien
// - pas de photo : petite image avec l'initiale du nom (jamais d'erreur 404,
//   pour ne pas polluer la console du navigateur)

// Image de remplacement : initiale bleue... sur fond bleu clair SI-ONA
function avatarInitiale(nom: string | null | undefined) {
  const lettre = (nom ?? "?").trim().charAt(0).toUpperCase() || "?";
  // On n'accepte que lettres et chiffres, pour eviter tout contenu inattendu
  const initiale = /^[\p{L}\p{N}]$/u.test(lettre) ? lettre : "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#e8eefb"/>
  <text x="32" y="32" dy="0.35em" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#0f3d9d">${initiale}</text>
</svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return avatarInitiale(null);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { image: true, name: true },
  });
  const image = user?.image;

  if (image?.startsWith("data:image/")) {
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

  if (image && /^https?:\/\//.test(image)) {
    return NextResponse.redirect(image);
  }

  return avatarInitiale(user?.name);
}
