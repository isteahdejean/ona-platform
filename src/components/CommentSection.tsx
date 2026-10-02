"use client";

import { useState } from "react";
import Avatar from "@/components/Avatar";

type Commentaire = {
  id: string;
  contenu: string;
  parentId: string | null;
  createdAt: string;
  supprime?: boolean;
  supprimeLe?: string | null;
  auteur: {
    id: string;
    name: string | null;
    role: string | null;
  };
};

type Noeud = Commentaire & { enfants: Noeud[] };

// Construit l'arbre des reponses. Si le parent d'un commentaire n'est pas
// dans la liste (par exemple parce qu'il a ete supprime), le commentaire
// est affiche directement sous la reflexion.
function construireArbre(liste: Commentaire[]): Noeud[] {
  const parNoeud = new Map<string, Noeud>(
    liste.map((c) => [c.id, { ...c, enfants: [] }]),
  );
  const racines: Noeud[] = [];
  for (const c of parNoeud.values()) {
    if (c.parentId && parNoeud.has(c.parentId)) {
      parNoeud.get(c.parentId)!.enfants.push(c);
    } else {
      racines.push(c);
    }
  }
  return racines;
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Port-au-Prince",
  });
}

export default function CommentSection({
  reflexionId,
  commentairesInitiaux,
  utilisateurId,
  estAdmin = false,
}: {
  reflexionId: string;
  commentairesInitiaux: Commentaire[];
  utilisateurId: string | null;
  estAdmin?: boolean;
}) {
  const [commentaires, setCommentaires] = useState(commentairesInitiaux);
  const [texte, setTexte] = useState("");
  const [reponseA, setReponseA] = useState<string | null>(null);
  const [texteReponse, setTexteReponse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const visibles = commentaires.filter((c) => !c.supprime);

  async function envoyer(contenu: string, parentId?: string) {
    if (!contenu.trim()) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch(`/api/reflexions/${reflexionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu, parentId }),
      });
      if (!reponse.ok) {
        setErreur(
          reponse.status === 401
            ? "Connectez-vous pour commenter."
            : "Impossible d'envoyer le commentaire, réessayez.",
        );
        return;
      }
      const nouveau = await reponse.json();
      setCommentaires((prev) => [
        ...prev,
        {
          ...nouveau,
          createdAt: nouveau.createdAt,
          auteur: { id: nouveau.auteurId, name: "Vous", role: null },
        },
      ]);
      if (parentId) {
        setReponseA(null);
        setTexteReponse("");
      } else {
        setTexte("");
      }
    } catch {
      setErreur("Connexion impossible. Vérifiez votre accès Internet.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(commentaireId: string) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    setErreur(null);
    try {
      const reponse = await fetch(
        `/api/reflexions/${reflexionId}/comments?commentaireId=${commentaireId}`,
        { method: "DELETE" },
      );
      if (!reponse.ok) {
        setErreur("Impossible de supprimer le commentaire, réessayez.");
        return;
      }
      setCommentaires((prev) =>
        estAdmin
          ? // L'ADMIN continue de voir le commentaire, marque comme supprime
            prev.map((c) =>
              c.id === commentaireId
                ? { ...c, supprime: true, supprimeLe: new Date().toISOString() }
                : c,
            )
          : // Pour tous les autres, il disparait
            prev.filter((c) => c.id !== commentaireId),
      );
    } catch {
      setErreur("Connexion impossible. Vérifiez votre accès Internet.");
    }
  }

  function afficherNoeud(noeud: Noeud, profondeur: number) {
    const peutSupprimer =
      !noeud.supprime && (noeud.auteur.id === utilisateurId || estAdmin);

    return (
      <div
        key={noeud.id}
        className="relative mt-4"
        style={{ marginLeft: Math.min(profondeur, 6) * 24 }}
      >
        {profondeur > 0 && (
          <span
            className="absolute -left-4 top-0 h-full w-px bg-ona-border"
            aria-hidden
          />
        )}
        <div className="flex gap-3">
          <Avatar id={noeud.auteur.id} nom={noeud.auteur.name} taille={32} />
          <div
            className={`flex-1 rounded-md border p-3 ${
              noeud.supprime
                ? "border-dashed border-ona-accent bg-ona-red-bg"
                : "border-ona-border bg-ona-surface"
            }`}
          >
            <p className="text-sm font-medium text-ona-primary">
              {noeud.auteur.name ?? "Membre"}
            </p>
            {noeud.supprime && (
              <p className="mt-1 text-xs font-medium text-ona-accent">
                Supprimé
                {noeud.supprimeLe
                  ? ` le ${formaterDate(noeud.supprimeLe)}`
                  : ""}{" "}
                · visible uniquement par l&apos;administration
              </p>
            )}
            <p className="mt-1 whitespace-pre-wrap text-sm text-ona-text">
              {noeud.contenu}
            </p>
            <div className="mt-2 flex gap-4">
              {!noeud.supprime && (
                <button
                  type="button"
                  onClick={() =>
                    setReponseA(reponseA === noeud.id ? null : noeud.id)
                  }
                  className="text-xs text-ona-primary hover:underline"
                >
                  Répondre
                </button>
              )}
              {peutSupprimer && (
                <button
                  type="button"
                  onClick={() => supprimer(noeud.id)}
                  className="text-xs text-ona-text-muted hover:text-ona-accent hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
        {reponseA === noeud.id && (
          <div className="mt-2 flex gap-2 pl-11">
            <input
              autoFocus
              value={texteReponse}
              onChange={(e) => setTexteReponse(e.target.value)}
              placeholder="Votre réponse..."
              aria-label="Votre réponse"
              className="flex-1 rounded-md border border-ona-border px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              disabled={envoi}
              onClick={() => envoyer(texteReponse, noeud.id)}
              className="rounded-md bg-ona-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
            >
              Envoyer
            </button>
          </div>
        )}
        {noeud.enfants.map((enfant) => afficherNoeud(enfant, profondeur + 1))}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <p className="font-display text-lg font-medium text-ona-primary">
        Commentaires ({visibles.length})
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Ajouter un commentaire..."
          aria-label="Ajouter un commentaire"
          className="flex-1 rounded-md border border-ona-border px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={envoi}
          onClick={() => envoyer(texte)}
          className="rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Envoyer
        </button>
      </div>
      {erreur && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
      {construireArbre(commentaires).map((noeud) => afficherNoeud(noeud, 0))}
    </div>
  );
}
