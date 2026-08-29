"use client";

import { SessionProvider } from "next-auth/react";

// Composant client requis par next-auth pour exposer useSession()
// a toute l'application (App Router impose la frontiere "use client" ici).
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
