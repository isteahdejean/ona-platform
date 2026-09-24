type Auteur = { name: string | null; image?: string | null };

export default function AuteurBadge({
  auteur,
  taille = 20,
}: {
  auteur: Auteur;
  taille?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {auteur.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={auteur.image}
          alt={auteur.name ?? "Auteur"}
          style={{ width: taille, height: taille }}
          className="rounded-full object-cover"
        />
      ) : (
        <span
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
