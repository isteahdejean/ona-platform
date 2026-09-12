"use client";

import { useEffect, useState } from "react";

type Diapo = { src: string; alt: string; legende: string; position?: string };

// Carrousel simple, auto-defilant (5s), avec puces cliquables. Client
// component car il gere son propre minuteur (useEffect/useState).
// "position" permet de cadrer chaque photo individuellement (ex. "top" pour
// les portraits ou les visages sont dans le tiers superieur de l'image).
export default function Slideshow({ diapos }: { diapos: Diapo[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const minuteur = setInterval(() => {
      setIndex((i) => (i + 1) % diapos.length);
    }, 5000);
    return () => clearInterval(minuteur);
  }, [diapos.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ona-border shadow-sm">
      <div className="relative h-80 sm:h-[28rem] md:h-[32rem]">
        {diapos.map((d, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={d.src}
            src={d.src}
            alt={d.alt}
            style={{ objectPosition: d.position ?? "center" }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="absolute bottom-4 left-4 right-4 font-display text-sm font-medium text-white sm:text-base">
          {diapos[index].legende}
        </p>
      </div>
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {diapos.map((d, i) => (
          <button
            key={d.src}
            onClick={() => setIndex(i)}
            aria-label={`Voir la diapositive ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
