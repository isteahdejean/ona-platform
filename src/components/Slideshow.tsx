"use client";

import { useEffect, useState } from "react";

type Diapo = { src: string; alt: string; legende: string };

// Carrousel simple, auto-defilant (5s), avec puces cliquables. Client
// component car il gere son propre minuteur (useEffect/useState).
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
      <div className="relative h-64 sm:h-80">
        {diapos.map((d, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={d.src}
            src={d.src}
            alt={d.alt}
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
