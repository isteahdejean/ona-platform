"use client";

import { useState } from "react";

type Auteur = { id?: string; name: string | null; image?: string | null };

// Affiche la photo (ou l'initiale) et le nom de l'auteur.
// Si l'identifiant de l'auteur est connu, la photo passe par
// /api/user/photo : elle n'est alors jamais chargee dans la page elle-meme,
// ce qui garde les listes de reflexions legeres. Si l'image ne peut pas
// etre affichee (ex. photo Google bloquee), on affiche l'initiale.
export default function AuteurBadge({
  auteur,
  taille = 20,
}: {
  auteur: Auteur;
  taille?: number;
}) {
  const [imageIndisponible, setImageIndisponible] = useState(false);
  const source = auteur.id ? `/api/user/photo?id=${auteur.id}` : auteur.image;

  return (
    <span className="inline-flex items-center gap-1.5">
      {source && !imageIndisponible ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source}
          alt=""
          width={taille}
          height={taille}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageIndisponible(true)}
          style={{ width: taille, height: taille }}
          className="rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ width: taille, height: taille }}
          className="flex items-center justify-center rounded-full bg-ona-blue-bg text-[10px] font-medium text-ona-primary"
        >
          {(auteur.name ?? "?").charAt(0).toUpperCase()}
        </span>
      )}
      {auteur.name}
    </span>
  );
}
