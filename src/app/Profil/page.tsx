"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";

// Redimensionne et compresse l'image choisie (max 480x480, JPEG) avant
// envoi, pour eviter d'envoyer des photos de plusieurs Mo telles quelles.
function redimensionner(fichier: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const image = new Image();
      image.onload = () => {
        const taille = 480;
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

export default function CompleterProfil() {
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [poste, setPoste] = useState("");
  const [direction, setDirection] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setErreur("Merci de choisir une image.");
      return;
    }
    setErreur(null);
    const dataUrl = await redimensionner(fichier);
    setPhoto(dataUrl);
  }

  function tableauDeBord() {
    const role = (session?.user as any)?.role;
    return role === "SYNDICAT"
      ? "/dashboard/syndicat"
      : "/dashboard/producteur";
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    const reponse = await fetch("/api/user/profil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio,
        poste,
        direction,
        photo: photo ?? undefined,
      }),
    });
    setEnvoi(false);
    if (!reponse.ok) {
      setErreur("Impossible d'enregistrer le profil, réessayez.");
      return;
    }
    router.push(tableauDeBord());
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ona-primary">
        Complétez votre profil
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
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-ona-border bg-ona-blue-bg"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Aperçu"
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
              JPG ou PNG, redimensionnée automatiquement.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={choisirPhoto}
            className="hidden"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ona-text">
            Poste / fonction
          </label>
          <input
            value={poste}
            onChange={(e) => setPoste(e.target.value)}
            placeholder="Ex. Agent de recouvrement"
            className="mt-1 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ona-text">Direction</label>
          <input
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Ex. Direction des Prestations"
            className="mt-1 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ona-text">
            Biographie
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Quelques lignes de présentation..."
            className="mt-1 w-full rounded-md border border-ona-border px-3 py-2 text-sm"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

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
            Passer cette étape
          </button>
        </div>
      </form>
    </div>
  );
}
