// Filigrane decoratif : les anneaux de SI-ONA, tres transparents, places
// a moitie hors du cadre dans un coin. Le parent doit avoir les classes
// "relative overflow-hidden", et son contenu la classe "relative" pour
// rester au-dessus du filigrane.

type Coin = "haut-droite" | "haut-gauche" | "bas-droite" | "bas-gauche";

const POSITIONS: Record<Coin, string> = {
  "haut-droite": "-right-20 -top-20 sm:-right-28 sm:-top-28",
  "haut-gauche": "-left-20 -top-20 sm:-left-28 sm:-top-28",
  "bas-droite": "-right-20 -bottom-20 sm:-right-28 sm:-bottom-28",
  "bas-gauche": "-left-20 -bottom-20 sm:-left-28 sm:-bottom-28",
};

const BLEU = "#0f3d9d";
const ROUGE = "#e40d37";

export default function FiligraneAnneaux({
  coin = "haut-droite",
  opacite = 0.06,
}: {
  coin?: Coin;
  opacite?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 400 400"
      fill="none"
      style={{ opacity: opacite }}
      className={`pointer-events-none absolute h-56 w-56 sm:h-80 sm:w-80 ${POSITIONS[coin]}`}
    >
      <circle cx="200" cy="200" r="190" stroke={BLEU} strokeWidth="2" />
      <circle cx="200" cy="200" r="150" stroke={ROUGE} strokeWidth="10" />
      <circle cx="200" cy="200" r="110" stroke={BLEU} strokeWidth="2" />
      <circle cx="200" cy="200" r="70" stroke={BLEU} strokeWidth="14" />
    </svg>
  );
}
