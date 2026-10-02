"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Boutons Modifier / Supprimer d'une reflexion, avec un formulaire de
// modification qui s'ouvre sur place. Les droits sont verifies aussi par
// le serveur : ces boutons ne font que les refleter.
export default function ActionsReflexion({
  reflexionId,
  titreInitial,
  contenuInitial,
  peutModifier,
  peutSupprimer,
}: {
  reflexionId: string;
  titreInitial: string;
  contenuInitial: string;
  peutModifier: boolean;
  peutSupprimer: boolean;
}) {
  const router = useRouter();
  const [edition, setEdition] = useState(false);
  const [titre, setTitre] = useState(titreInitial);
  const [contenu, setContenu] = useState(contenuInitial);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/reflexions/${reflexionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, contenu }),
      });
      if (!reponse.ok) {
        setErreur(
          "Impossible d'enregistrer. Le titre doit faire au moins 3 caractères.",
        );
        return;
      }
      setEdition(false);
      router.refresh();
    } catch {
      setErreur("Connexion impossible. Vérifiez votre accès Internet.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer() {
    if (
      !window.confirm(
        "Supprimer définitivement cette réflexion et tous ses commentaires ?",
      )
    )
      return;
    setErreur(null);
    try {
      const reponse = await fetch(`/api/reflexions/${reflexionId}`, {
        method: "DELETE",
      });
      if (!reponse.ok) {
        setErreur("Impossible de supprimer la réflexion, réessayez.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setErreur("Connexion impossible. Vérifiez votre accès Internet.");
    }
  }

  if (!peutModifier && !peutSupprimer) return null;

  return (
    <div className="mt-4">
      {!edition && (
        <div className="flex gap-4 text-sm">
          {peutModifier && (
            <button
              type="button"
              onClick={() => setEdition(true)}
              className="font-medium text-ona-primary hover:underline"
            >
              Modifier
            </button>
          )}
          {peutSupprimer && (
            <button
              type="button"
              onClick={supprimer}
              className="font-medium text-ona-text-muted hover:text-ona-accent hover:underline"
            >
              Supprimer
            </button>
          )}
        </div>
      )}

      {edition && (
        <div className="space-y-3 rounded-lg border border-ona-border bg-ona-surface p-4">
          <label
            htmlFor="modif-titre"
            className="text-sm font-medium text-ona-text"
          >
            Titre
          </label>
          <input
            id="modif-titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            maxLength={200}
            className="w-full rounded-md border border-ona-border px-3 py-2 text-sm"
          />
          <label
            htmlFor="modif-contenu"
            className="text-sm font-medium text-ona-text"
          >
            Texte
          </label>
          <textarea
            id="modif-contenu"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={10}
            className="w-full rounded-md border border-ona-border px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={envoi}
              onClick={enregistrer}
              className="rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {envoi ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEdition(false);
                setTitre(titreInitial);
                setContenu(contenuInitial);
              }}
              className="rounded-md px-4 py-2 text-sm font-medium text-ona-text-muted hover:text-ona-text"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {erreur && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
    </div>
  );
}
