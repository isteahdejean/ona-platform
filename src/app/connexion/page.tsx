"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  async function connexionParEmail(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const resultat = await signIn("credentials", {
      email,
      password: motDePasse,
      redirect: false,
      callbackUrl: "/inscription",
    });
    if (resultat?.error) {
      setErreur("Identifiants incorrects.");
    } else if (resultat?.url) {
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
            <LogIn className="h-5 w-5 text-ona-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ona-text">Se connecter</h1>
          <p className="mt-1 text-sm text-ona-text-muted">
            Employés, assurés, pensionnés et membres des directions se connectent ici.
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

          <form onSubmit={connexionParEmail} className="space-y-3">
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
              placeholder="Mot de passe"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-lg border border-ona-border px-3 py-2.5 text-sm focus:border-ona-primary"
            />
            {erreur && <p className="text-sm text-red-600">{erreur}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-ona-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ona-primary-dark"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
