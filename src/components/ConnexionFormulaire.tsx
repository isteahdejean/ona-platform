"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus } from "lucide-react";

// Separe de page.tsx car useSearchParams() exige une frontiere Suspense
// (voir le wrapper dans page.tsx). ?mode=inscription pre-selectionne
// l'onglet creation de compte (utilise par le lien "S'inscrire").
export default function ConnexionFormulaire() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"connexion" | "inscription">(
    searchParams.get("mode") === "inscription" ? "inscription" : "connexion",
  );
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function connexionParEmail(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const resultat = await signIn("credentials", {
      email,
      password: motDePasse,
      redirect: false,
      callbackUrl: "/inscription",
    });
    setEnvoi(false);
    if (resultat?.error) {
      setErreur("Identifiants incorrects.");
    } else if (resultat?.url) {
      window.location.href = resultat.url;
    }
  }

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);

    const reponse = await fetch("/api/auth/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nom, email, password: motDePasse }),
    });

    if (!reponse.ok) {
      const data = await reponse.json().catch(() => ({}));
      setErreur(data.erreur ?? "Impossible de créer le compte.");
      setEnvoi(false);
      return;
    }

    const resultat = await signIn("credentials", {
      email,
      password: motDePasse,
      redirect: false,
      callbackUrl: "/inscription",
    });
    setEnvoi(false);
    if (resultat?.url) {
      window.location.href = resultat.url;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ona-primary-dark px-6 py-16">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-ona-surface shadow-xl">
        <div className="flex h-1.5 w-full">
          <div className="w-1/2 bg-ona-primary" />
          <div className="w-1/2 bg-ona-accent" />
        </div>
        <div className="p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ona-blue-bg">
            {mode === "connexion" ? (
              <LogIn className="h-5 w-5 text-ona-primary" />
            ) : (
              <UserPlus className="h-5 w-5 text-ona-primary" />
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ona-text">
            {mode === "connexion" ? "Se connecter" : "Créer un compte"}
          </h1>
          <p className="mt-1 text-sm text-ona-text-muted">
            Employés, assurés, pensionnés et membres des directions se
            retrouvent ici.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/inscription" })}
            className="mt-7 w-full rounded-lg border border-ona-border bg-white px-4 py-2.5 text-sm font-medium text-ona-text transition hover:border-ona-primary hover:shadow-sm"
          >
            Continuer avec Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-ona-text-muted">
            <div className="h-px flex-1 bg-ona-border" />
            ou avec un email
            <div className="h-px flex-1 bg-ona-border" />
          </div>

          <form
            onSubmit={mode === "connexion" ? connexionParEmail : creerCompte}
            className="space-y-3"
          >
            {mode === "inscription" && (
              <input
                type="text"
                required
                placeholder="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-lg border border-ona-border px-3 py-2.5 text-sm focus:border-ona-primary"
              />
            )}
            <input
              type="email"
              required
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ona-border px-3 py-2.5 text-sm focus:border-ona-primary"
            />
            <input
              type="password"
              required
              minLength={mode === "inscription" ? 8 : undefined}
              placeholder={
                mode === "inscription"
                  ? "Mot de passe (8 caractères min.)"
                  : "Mot de passe"
              }
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-ona-border px-3 py-2.5 text-sm focus:border-ona-primary"
            />
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}
            <button
              type="submit"
              disabled={envoi}
              className="w-full rounded-lg bg-ona-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ona-primary-dark disabled:opacity-60"
            >
              {envoi
                ? "Un instant..."
                : mode === "connexion"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "connexion" ? "inscription" : "connexion");
              setErreur(null);
            }}
            className="mt-5 w-full text-center text-sm text-ona-primary hover:underline"
          >
            {mode === "connexion"
              ? "Pas encore de compte ? Créer un compte"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
