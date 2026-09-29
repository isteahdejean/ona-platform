"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Diapo = { src: string; alt: string; legende: string; position?: string };

// Carrousel simple, auto-defilant (5s), avec puces cliquables. Client
// component car il gere son propre minuteur (useEffect/useState).
// "position" permet de cadrer chaque photo individuellement (ex. "top" pour
// les portraits ou les visages sont dans le tiers superieur de l'image).
//
// OPTIMISATION : next/image sert automatiquement chaque photo en WebP/AVIF,
// redimensionnee a la taille reelle de l'ecran. La premiere photo est
// chargee en priorite (c'est l'element LCP mesure par PageSpeed), les
// suivantes sont chargees ensuite.
//
// ACCESSIBILITE : chaque puce est dans un bouton de 24x24 px (taille
// minimale d'une cible tactile), meme si la puce visible reste petite.
export default function Slideshow({ diapos }: { diapos: Diapo[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Respecte le reglage "reduire les animations" du systeme de l'utilisateur
    const reduireAnimations = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduireAnimations) return;

    const minuteur = setInterval(() => {
      setIndex((i) => (i + 1) % diapos.length);
    }, 5000);
    return () => clearInterval(minuteur);
  }, [diapos.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ona-border shadow-sm">
      <div className="relative h-80 sm:h-[28rem] md:h-[32rem]">
        {diapos.map((d, i) => (
          <Image
            key={d.src}
            src={d.src}
            alt={d.alt}
            fill
            priority={i === 0}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            style={{ objectPosition: d.position ?? "center" }}
            className={`object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="absolute bottom-4 left-4 right-16 font-display text-sm font-medium text-white sm:text-base">
          {diapos[index].legende}
        </p>
      </div>
      <div className="absolute bottom-2 right-3 flex">
        {diapos.map((d, i) => (
          <button
            key={d.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Voir la diapositive ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
