"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// afficherChoixType : les producteurs/direction peuvent aussi publier la
// revue hebdomadaire depuis ce meme formulaire ; les autres espaces
// (syndicats) ne publient que des reflexions ordinaires.
export default function ReflexionForm({ afficherChoixType = false }: { afficherChoixType?: boolean }) {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [type, setType] = useState<"REFLEXION" | "REVUE">("REFLEXION");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function publier(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    const reponse = await fetch("/api/reflexions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, contenu, type }),
    });
    setEnvoi(false);
    if (!reponse.ok) {
      setErreur("La publication a échoué.");
      return;
    }
    setTitre("");
    setContenu("");
    setType("REFLEXION");
    router.refresh();
  }

  return (
    <form onSubmit={publier} className="rounded-lg border border-ona-border bg-ona-surface p-5">
      <p className="font-display text-lg font-medium text-ona-primary">Publier une réflexion</p>

      {afficherChoixType && (
        <div className="mt-3 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setType("REFLEXION")}
            className={`rounded-full border px-3 py-1 ${type === "REFLEXION" ? "border-ona-primary bg-ona-blue-bg text-ona-primary" : "border-ona-border text-ona-text-muted"}`}
          >
            Réflexion
          </button>
          <button
            type="button"
            onClick={() => setType("REVUE")}
            className={`rounded-full border px-3 py-1 ${type === "REVUE" ? "border-ona-accent bg-ona-red-bg text-ona-accent" : "border-ona-border text-ona-text-muted"}`}
          >
            Revue hebdomadaire
          </button>
        </div>
      )}

      <input
        required
        placeholder="Titre"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="mt-4 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Votre réflexion..."
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        rows={5}
        className="mt-3 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
      />
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      <button
        type="submit"
        disabled={envoi}
        className="mt-3 rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white hover:bg-ona-primary-dark disabled:opacity-60"
      >
        {envoi ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
