"use client";

import { useState } from "react";

// Photo de profil ronde, servie par /api/user/photo. Si l'image ne peut
// pas s'afficher (photo Google bloquee, reseau...), on affiche l'initiale.
export default function Avatar({
  id,
  nom,
  taille,
}: {
  id?: string | null;
  nom: string | null;
  taille: number;
}) {
  const [indisponible, setIndisponible] = useState(false);
  const initiale = (nom ?? "?").charAt(0).toUpperCase();

  if (!id || indisponible) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: taille,
          height: taille,
          fontSize: Math.round(taille * 0.4),
        }}
        className="flex shrink-0 items-center justify-center rounded-full bg-ona-blue-bg font-medium text-ona-primary"
      >
        {initiale}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/user/photo?id=${id}`}
      alt=""
      width={taille}
      height={taille}
      referrerPolicy="no-referrer"
      onError={() => setIndisponible(true)}
      style={{ width: taille, height: taille }}
      className="shrink-0 rounded-full object-cover"
    />
  );
}
