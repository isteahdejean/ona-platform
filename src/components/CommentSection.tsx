"use client";

import { useState } from "react";

type Commentaire = {
  id: string;
  contenu: string;
  parentId: string | null;
  createdAt: string;
  auteur: {
    id: string;
    name: string | null;
    role: string | null;
    image?: string | null;
  };
};

type Noeud = Commentaire & { enfants: Noeud[] };

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

export default function CommentSection({
  reflexionId,
  commentairesInitiaux,
}: {
  reflexionId: string;
  commentairesInitiaux: Commentaire[];
}) {
  const [commentaires, setCommentaires] = useState(commentairesInitiaux);
  const [texte, setTexte] = useState("");
  const [reponseA, setReponseA] = useState<string | null>(null);
  const [texteReponse, setTexteReponse] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(contenu: string, parentId?: string) {
    if (!contenu.trim()) return;
    setEnvoi(true);
    const reponse = await fetch(`/api/reflexions/${reflexionId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenu, parentId }),
    });
    setEnvoi(false);
    if (!reponse.ok) return;
    const nouveau = await reponse.json();
    setCommentaires((prev) => [
      ...prev,
      {
        ...nouveau,
        auteur: { id: nouveau.auteurId, name: "Vous", role: null, image: null },
      },
    ]);
    if (parentId) {
      setReponseA(null);
      setTexteReponse("");
    } else {
      setTexte("");
    }
  }

  function afficherNoeud(noeud: Noeud, profondeur: number) {
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
          {noeud.auteur.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={noeud.auteur.image}
              alt={noeud.auteur.name ?? "Membre"}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ona-blue-bg text-xs font-medium text-ona-primary">
              {(noeud.auteur.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1 rounded-md border border-ona-border bg-ona-surface p-3">
            <p className="text-sm font-medium text-ona-primary">
              {noeud.auteur.name ?? "Membre"}
            </p>
            <p className="mt-1 text-sm text-ona-text">{noeud.contenu}</p>
            <button
              onClick={() =>
                setReponseA(reponseA === noeud.id ? null : noeud.id)
              }
              className="mt-2 text-xs text-ona-accent hover:underline"
            >
              Répondre
            </button>
          </div>
        </div>
        {reponseA === noeud.id && (
          <div className="mt-2 flex gap-2 pl-11">
            <input
              autoFocus
              value={texteReponse}
              onChange={(e) => setTexteReponse(e.target.value)}
              placeholder="Votre réponse..."
              className="flex-1 rounded-md border border-ona-border px-3 py-1.5 text-sm"
            />
            <button
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
        Commentaires ({commentaires.length})
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 rounded-md border border-ona-border px-3 py-2 text-sm"
        />
        <button
          disabled={envoi}
          onClick={() => envoyer(texte)}
          className="rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Envoyer
        </button>
      </div>
      {construireArbre(commentaires).map((noeud) => afficherNoeud(noeud, 0))}
    </div>
  );
}
