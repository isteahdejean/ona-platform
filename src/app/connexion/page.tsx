import { Suspense } from "react";
import ConnexionFormulaire from "@/components/ConnexionFormulaire";

export default function Connexion() {
  return (
    <Suspense fallback={null}>
      <ConnexionFormulaire />
    </Suspense>
  );
}
