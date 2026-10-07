// Reglages communs aux travaux de memoire, utilises par le formulaire,
// le serveur et la section "Memoires".

export const DOMAINES_MEMOIRE = [
  "Sécurité sociale et protection sociale",
  "Droit",
  "Économie et finances",
  "Gestion et administration",
  "Comptabilité et audit",
  "Actuariat et statistiques",
  "Informatique, mathématiques et systèmes d'information",
  "Ingénieries",
  "Ressources humaines",
  "Sciences humaines et sociales",
  "Agronomie et environnement",
  "Autre",
] as const;

export type DomaineMemoire = (typeof DOMAINES_MEMOIRE)[number];

// Annees de soutenance acceptees
export const ANNEE_MIN_MEMOIRE = 1960;
export function anneeMaxMemoire() {
  return new Date().getFullYear();
}

// Texte de l'attestation que l'auteur doit cocher avant de publier
export const ATTESTATION_MEMOIRE =
  "J'atteste être l'auteur de ce document, et qu'il ne contient aucune donnée personnelle d'assurés ou de pensionnés.";
