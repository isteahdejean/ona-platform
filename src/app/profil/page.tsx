"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { TABLEAU_PAR_ROLE } from "@/lib/roles";

type Annexe = { id: string; nom: string };

// Formats de photo acceptes et taille maximale du fichier d'origine
const FORMATS_PHOTO = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX_FICHIER = 10 * 1024 * 1024; // 10 Mo

// Redimensionne et compresse l'image choisie (max 320x320, JPEG) avant
// envoi. Une photo de profil s'affiche en petit : 320 px suffisent et
// gardent le fichier leger.
function redimensionner(fichier: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const image = new Image();
      image.onload = () => {
        const taille = 320;
        const ratio = Math.min(taille / image.width, taille / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = image.width * ratio;
        canvas.height = image.height * ratio;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible"));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.onerror = reject;
      image.src = lecteur.result as string;
    };
    lecteur.onerror = reject;
    lecteur.readAsDataURL(fichier);
  });
}

const CHAMP =
  "mt-1 w-full rounded-md border border-ona-border px-3 py-2 text-sm";
const ETIQUETTE = "text-sm font-medium text-ona-text";

export default function CompleterProfil() {
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [chargement, setChargement] = useState(true);
  const [dejaRempli, setDejaRempli] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoModifiee, setPhotoModifiee] = useState(false);
  const [bio, setBio] = useState("");
  const [poste, setPoste] = useState("");
  const [direction, setDirection] = useState("");
  const [annexeId, setAnnexeId] = useState("");
  const [annexes, setAnnexes] = useState<Annexe[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Charge le profil actuel et la liste des annexes a l'ouverture
  useEffect(() => {
    let actif = true;
    async function charger() {
      try {
        const reponse = await fetch("/api/user/profil");
        if (!reponse.ok) throw new Error();
        const donnees = await reponse.json();
        if (!actif) return;
        const p = donnees.profil;
        setPhoto(p.image ?? null);
        setPoste(p.poste);
        setBio(p.bio);
        setDirection(p.direction);
        setAnnexeId(p.annexeId ?? "");
        setAnnexes(donnees.annexes);
        setDejaRempli(Boolean(p.poste || p.bio || p.direction || p.annexeId));
      } catch {
        if (actif) {
          setErreur("Impossible de charger votre profil. Rechargez la page.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }
    charger();
    return () => {
      actif = false;
    };
  }, []);

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = ""; // permet de rechoisir le meme fichier apres une erreur
    if (!fichier) return;
    if (!FORMATS_PHOTO.includes(fichier.type)) {
      setErreur("Formats acceptés : JPG, PNG ou WebP.");
      return;
    }
    if (fichier.size > TAILLE_MAX_FICHIER) {
      setErreur("Cette photo est trop lourde (10 Mo maximum).");
      return;
    }
    if (fichier.size > TAILLE_MAX_FICHIER) {
      setErreur("Cette photo est trop lourde (10 Mo maximum).");
      return;
    }
    setErreur(null);
    try {
      const dataUrl = await redimensionner(fichier);
      setPhoto(dataUrl);
      setPhotoModifiee(true);
    } catch {
      setErreur("Impossible de lire cette image. Essayez une autre photo.");
    }
  }

  function tableauDeBord() {
    const role = (session?.user as any)?.role as string | undefined;
    return TABLEAU_PAR_ROLE[role ?? ""] ?? "/";
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/user/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          poste,
          direction,
          annexeId: annexeId || null,
          // La photo n'est envoyee que si elle a ete changee
          photo: photoModifiee && photo ? photo : undefined,
        }),
      });
      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => null);
        setErreur(
          donnees?.erreur ?? "Impossible d'enregistrer le profil, réessayez.",
        );
        return;
      }
      router.push(tableauDeBord());
      router.refresh();
    } catch {
      setErreur("Connexion impossible. Vérifiez votre accès Internet.");
    } finally {
      setEnvoi(false);
    }
  }

  if (chargement) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <p className="text-sm text-ona-text-muted">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ona-primary">
        {dejaRempli ? "Modifier mon profil" : "Complétez votre profil"}
      </h1>
      <p className="mt-2 text-sm text-ona-text-muted">
        Votre photo et votre présentation apparaîtront à côté de vos
        publications. Vous pourrez modifier ceci plus tard.
      </p>

      <form onSubmit={enregistrer} className="mt-8 space-y-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Choisir une photo de profil"
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-ona-border bg-ona-blue-bg"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Aperçu de la photo de profil"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-6 w-6 text-ona-primary" />
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sm font-medium text-ona-primary hover:underline"
            >
              {photo ? "Changer la photo" : "Ajouter une photo"}
            </button>
            <p className="text-xs text-ona-text-muted">
              JPG, PNG ou WebP, 10 Mo maximum. Redimensionnée automatiquement.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={choisirPhoto}
            className="hidden"
          />
        </div>

        <div>
          <label htmlFor="poste" className={ETIQUETTE}>
            Poste / fonction
          </label>
          <input
            id="poste"
            value={poste}
            onChange={(e) => setPoste(e.target.value)}
            placeholder="Ex. Agent de recouvrement"
            maxLength={120}
            className={CHAMP}
          />
        </div>

        <div>
          <label htmlFor="direction" className={ETIQUETTE}>
            Direction / Service
          </label>
          <input
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Votre direction ou votre service"
            maxLength={150}
            className={CHAMP}
          />
        </div>

        <div>
          <label htmlFor="annexe" className={ETIQUETTE}>
            Annexe / Bureau
          </label>
          <select
            id="annexe"
            value={annexeId}
            onChange={(e) => setAnnexeId(e.target.value)}
            aria-describedby="annexe-aide"
            className={`${CHAMP} bg-white`}
          >
            <option value="">Aucune / Non concerné</option>
            {annexes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom}
              </option>
            ))}
          </select>
          <p id="annexe-aide" className="mt-1 text-xs text-ona-text-muted">
            Le bureau ou l&apos;annexe où vous travaillez.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className={ETIQUETTE}>
            Biographie
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Quelques lignes de présentation..."
            className={CHAMP}
          />
        </div>

        {erreur && (
          <p role="alert" className="text-sm text-red-600">
            {erreur}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={envoi}
            className="rounded-md bg-ona-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-ona-primary-dark disabled:opacity-60"
          >
            {envoi ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push(tableauDeBord())}
            className="rounded-md px-5 py-2.5 text-sm font-medium text-ona-text-muted hover:text-ona-text"
          >
            {dejaRempli ? "Annuler" : "Passer cette étape"}
          </button>
        </div>
      </form>
    </div>
  );
}
