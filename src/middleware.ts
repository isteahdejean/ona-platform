import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Fait correspondre chaque espace du tableau de bord au(x) role(s) autorise(s).
// DIRECTION et ADMIN peuvent tout consulter (supervision inter-espaces).
const ESPACES_PAR_ROLE: Record<string, string[]> = {
  "/dashboard/producteur": ["PRODUCTEUR", "DIRECTION", "ADMIN"],
  "/dashboard/assure": ["ASSURE", "DIRECTION", "ADMIN"],
  "/dashboard/pensionne": ["PENSIONNE", "DIRECTION", "ADMIN"],
  "/dashboard/syndicat": ["SYNDICAT", "DIRECTION", "ADMIN"],
  "/dashboard/direction": ["DIRECTION", "ADMIN"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | null;

    // Pas encore de role choisi -> on renvoie vers l'inscription pour le definir.
    if (!role && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/inscription", req.url));
    }

    const espace = Object.keys(ESPACES_PAR_ROLE).find((prefix) => pathname.startsWith(prefix));
    if (espace && role && !ESPACES_PAR_ROLE[espace].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // withAuth ne laisse passer que les requetes deja authentifiees ;
      // la logique de role ci-dessus s'execute ensuite.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/inscription"],
};
