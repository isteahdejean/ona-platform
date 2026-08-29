import type { LucideIcon } from "lucide-react";

// Bandeau colore reutilise en tete de chaque tableau de bord, pour que
// chaque espace (producteur/assure/pensionne/direction) ait son identite
// visuelle propre tout en restant dans la charte ONA.
export default function EnteteEspace({
  titre,
  sousTitre,
  Icone,
  couleur,
  fond,
}: {
  titre: string;
  sousTitre: string;
  Icone: LucideIcon;
  couleur: string;
  fond: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-ona-border p-6 ${fond}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/70">
        <Icone className={`h-6 w-6 ${couleur}`} />
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-ona-text">{titre}</h1>
        <p className="mt-0.5 text-sm text-ona-text-muted">{sousTitre}</p>
      </div>
    </div>
  );
}
