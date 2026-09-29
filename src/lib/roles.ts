// Libelles et tableaux de bord par role.
// Source unique, utilisee par le Header et par la page d'accueil.

export const LIBELLE_ROLE: Record<string, string> = {
  PRODUCTEUR: "Producteur d'idées",
  ASSURE: "Assuré",
  PENSIONNE: "Pensionné",
  SYNDICAT: "Groupe syndical",
  DIRECTION: "Direction",
  ADMIN: "Administration",
};

export const TABLEAU_PAR_ROLE: Record<string, string> = {
  PRODUCTEUR: "/dashboard/producteur",
  ASSURE: "/dashboard/assure",
  PENSIONNE: "/dashboard/pensionne",
  SYNDICAT: "/dashboard/syndicat",
  DIRECTION: "/dashboard/direction",
  ADMIN: "/dashboard/direction",
};
