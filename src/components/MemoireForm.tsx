"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  DOMAINES_MEMOIRE,
  ANNEE_MIN_MEMOIRE,
  ATTESTATION_MEMOIRE,
} from "@/lib/memoires";

const FORMATS_DOCUMENT: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
};
const TAILLE_MAX_DOCUMENT = 20 * 1024 * 1024; // 20 Mo

const CHAMP =
  "mt-1 w-full rounded-md border border-ona-border bg-white px-3 py-2 text-sm";
const ETIQUETTE = "text-sm font-medium text-ona-text";

function formaterTaille(octets: number) {
  if (octets >= 1024 * 1024) {
    return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
  }
  return `${Math.max(1, Math.round(octets / 1024))} Ko`;
}

// Annees proposees, de la plus recente a la plus ancienne
const ANNEE_ACTUELLE = new Date().getFullYear();
const ANNEES: number[] = [];
for (let a = ANNEE_ACTUELLE; a >= ANNEE_MIN_MEMOIRE; a--) ANNEES.push(a);

export default function MemoireForm() {
  const router = useRouter();
  const inputFichier = useRef<HTMLInputElement>(null);
  const [titre, setTitre] = useState("");
  const [resume, setResume] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [annee, setAnnee] = useState("");
  const [domaine, setDomaine] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [attestation, setAttestation] = useState(false);
  const [etape, setEtape] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function choisirFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const choisi = e.target.files?.[0];
    e.target.value = "";
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

    // 2. Envoi direct du fichier vers Supabase Storage
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

    // Verifications avant tout envoi
    if (!fichier) {
      setErreur("Le document du mémoire est obligatoire.");
      return;
    }
    if (resume.trim().length < 20) {
      setErreur("Le résumé doit contenir au moins 20 caractères.");
      return;
    }
    if (!attestation) {
      setErreur("Merci de cocher l'attestation avant de publier.");
      return;
    }

    try {
      setEtape("Envoi du document...");
      const document = await envoyerDocument(fichier);

      setEtape("Publication...");
      const reponse = await fetch("/api/memoires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre,
          resume,
          etablissement,
          anneeSoutenance: Number(annee),
          domaine,
          attestation: true,
          document,
        }),
      });
      const donnees = await reponse.json().catch(() => null);
      if (!reponse.ok || !donnees?.id) {
        throw new Error(donnees?.erreur ?? "La publication a échoué.");
      }

      router.push(`/reflexions/${donnees.id}`);
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
      className="space-y-5 rounded-lg border border-ona-border bg-ona-surface p-5"
    >
      <div>
        <label htmlFor="memoire-titre" className={ETIQUETTE}>
          Titre du mémoire
        </label>
        <input
          id="memoire-titre"
          required
          minLength={3}
          maxLength={200}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className={CHAMP}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="memoire-etablissement" className={ETIQUETTE}>
            Établissement
          </label>
          <input
            id="memoire-etablissement"
            required
            minLength={2}
            maxLength={200}
            placeholder="Ex. Université d'État d'Haïti"
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            className={CHAMP}
          />
        </div>
        <div>
          <label htmlFor="memoire-annee" className={ETIQUETTE}>
            Année de soutenance
          </label>
          <select
            id="memoire-annee"
            required
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            className={CHAMP}
          >
            <option value="">Choisir l&apos;année</option>
            {ANNEES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="memoire-domaine" className={ETIQUETTE}>
          Domaine
        </label>
        <select
          id="memoire-domaine"
          required
          value={domaine}
          onChange={(e) => setDomaine(e.target.value)}
          className={CHAMP}
        >
          <option value="">Choisir le domaine</option>
          {DOMAINES_MEMOIRE.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="memoire-resume" className={ETIQUETTE}>
          Résumé
        </label>
        <textarea
          id="memoire-resume"
          required
          rows={6}
          maxLength={5000}
          placeholder="Présentez en quelques lignes le sujet, la démarche et les principales conclusions."
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          className={CHAMP}
        />
      </div>

      {/* Document du memoire (obligatoire) */}
      <div>
        <p className={ETIQUETTE}>Document du mémoire</p>
        {fichier ? (
          <div className="mt-1 flex items-center gap-2 rounded-md border border-ona-border bg-ona-blue-bg px-3 py-2 text-sm">
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
            className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-ona-primary hover:underline"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Joindre le document
          </button>
        )}
        <p className="mt-1 text-xs text-ona-text-muted">
          Obligatoire · PDF ou Word (.docx), 20 Mo maximum
        </p>
        <input
          ref={inputFichier}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={choisirFichier}
          className="hidden"
        />
      </div>

      {/* Attestation obligatoire */}
      <label className="flex items-start gap-3 rounded-md border border-ona-border bg-white p-3 text-sm text-ona-text">
        <input
          type="checkbox"
          checked={attestation}
          onChange={(e) => setAttestation(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>{ATTESTATION_MEMOIRE}</span>
      </label>

      {erreur && (
        <p role="alert" className="text-sm text-red-600">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={etape !== null}
        className="rounded-md bg-ona-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-ona-primary-dark disabled:opacity-60"
      >
        {etape ?? "Publier le mémoire"}
      </button>
    </form>
  );
}
