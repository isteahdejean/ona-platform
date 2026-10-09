"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Paperclip, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Formats acceptes et taille maximale (verifies aussi par le serveur)
const FORMATS_DOCUMENT: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
};
const TAILLE_MAX_DOCUMENT = 20 * 1024 * 1024; // 20 Mo

function formaterTaille(octets: number) {
  if (octets >= 1024 * 1024) {
    return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
  }
  return `${Math.max(1, Math.round(octets / 1024))} Ko`;
}

// afficherChoixType : les producteurs/direction peuvent aussi publier la
// revue hebdomadaire depuis ce meme formulaire ; les autres espaces
// (syndicats) ne publient que des reflexions ordinaires.
export default function ReflexionForm({
  afficherChoixType = false,
}: {
  afficherChoixType?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  // Le choix Reflexion / Revue n'apparait que pour l'equipe editoriale
  const peutPublierRevue =
    Boolean((session?.user as any)?.editeurRevue) ||
    (session?.user as any)?.role === "ADMIN";
  const montrerChoixType = afficherChoixType && peutPublierRevue;
  const inputFichier = useRef<HTMLInputElement>(null);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [type, setType] = useState<"REFLEXION" | "REVUE">("REFLEXION");
  const [fichier, setFichier] = useState<File | null>(null);
  const [etape, setEtape] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const choisi = e.target.files?.[0];
    e.target.value = ""; // permet de rechoisir le meme fichier apres une erreur
    if (!choisi) return;
    if (!FORMATS_DOCUMENT[choisi.type]) {
      setErreur("Formats acceptés : PDF ou Word (.docx).");
      return;
    }
    if (choisi.size > TAILLE_MAX_DOCUMENT) {
      setErreur("Ce document est trop lourd (20 Mo maximum).");
      return;
    }
    setErreur(null);
    setFichier(choisi);
  }

  async function envoyerDocument(document: File) {
    // 1. Autorisation d'envoi donnee par notre serveur
    const autorisation = await fetch("/api/documents/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typeMime: document.type, taille: document.size }),
    });
    const infos = await autorisation.json().catch(() => null);
    if (!autorisation.ok || !infos?.jeton) {
      throw new Error(infos?.erreur ?? "L'envoi du document a échoué.");
    }

    // 2. Envoi direct du fichier vers Supabase Storage, avec la methode
    // officielle de Supabase et l'autorisation donnee par notre serveur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    );
    const { error: erreurEnvoi } = await supabase.storage
      .from("documents")
      .uploadToSignedUrl(infos.chemin, infos.jeton, document, {
        contentType: document.type,
      });
    if (erreurEnvoi) {
      console.error("Envoi du document :", erreurEnvoi);
      throw new Error("L'envoi du document a échoué. Réessayez.");
    }

    return { chemin: infos.chemin as string, nom: document.name };
  }

  async function publier(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    try {
      let documentJoint: { chemin: string; nom: string } | undefined;

      if (fichier) {
        setEtape("Envoi du document...");
        documentJoint = await envoyerDocument(fichier);
      }

      // 3. Publication de la reflexion
      setEtape("Publication...");
      const reponse = await fetch("/api/reflexions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre, contenu, type, document: documentJoint }),
      });
      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => null);
        throw new Error(donnees?.erreur ?? "La publication a échoué.");
      }

      setTitre("");
      setContenu("");
      setType("REFLEXION");
      setFichier(null);
      router.refresh();
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : "Connexion impossible. Vérifiez votre accès Internet.",
      );
    } finally {
      setEtape(null);
    }
  }

  return (
    <form
      onSubmit={publier}
      className="rounded-lg border border-ona-border bg-ona-surface p-5"
    >
      <p className="font-display text-lg font-medium text-ona-primary">
        Publier une réflexion
      </p>

      {montrerChoixType && (
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
            Revue
          </button>
        </div>
      )}

      <input
        required
        placeholder="Titre"
        aria-label="Titre"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="mt-4 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Votre réflexion..."
        aria-label="Votre réflexion"
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        rows={5}
        className="mt-3 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
      />

      {/* Document joint (facultatif) */}
      <div className="mt-3">
        {fichier ? (
          <div className="flex items-center gap-2 rounded-md border border-ona-border bg-ona-blue-bg px-3 py-2 text-sm">
            <Paperclip
              className="h-4 w-4 shrink-0 text-ona-primary"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-ona-text">
              {fichier.name}
            </span>
            <span className="shrink-0 text-xs text-ona-text-muted">
              {FORMATS_DOCUMENT[fichier.type]} · {formaterTaille(fichier.size)}
            </span>
            <button
              type="button"
              onClick={() => setFichier(null)}
              aria-label="Retirer le document"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ona-text-muted hover:text-ona-accent"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputFichier.current?.click()}
            className="inline-flex items-center gap-2 text-sm font-medium text-ona-primary hover:underline"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Joindre un document
          </button>
        )}
        <p className="mt-1 text-xs text-ona-text-muted">
          Facultatif · PDF ou Word (.docx), 20 Mo maximum
        </p>
        <input
          ref={inputFichier}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={choisirFichier}
          className="hidden"
        />
      </div>

      {erreur && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {erreur}
        </p>
      )}
      <button
        type="submit"
        disabled={etape !== null}
        className="mt-3 rounded-md bg-ona-primary px-4 py-2 text-sm font-medium text-white hover:bg-ona-primary-dark disabled:opacity-60"
      >
        {etape ?? "Publier"}
      </button>
    </form>
  );
}
