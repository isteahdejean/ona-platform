import Link from "next/link";
import {
  PenLine,
  ShieldCheck,
  HeartHandshake,
  Building2,
  Megaphone,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import Slideshow from "@/components/Slideshow";

const DIAPOS = [
  {
    src: "/batiment-ona.gif",
    alt: "Bâtiment de l'ONA",
    legende: "Siège de l'Office National d'Assurance-Vieillesse",
  },
  {
    src: "/directrice-generale.jpg",
    alt: "Mme Lovely François",
    legende: "Mme Lovely François, Directrice Générale de l'ONA",
  },
  {
    src: "/direction-generale.jpg",
    alt: "Nomination du Directeur Général Adjoint",
    legende: "M. Job Pierre, Directeur Général Adjoint de l'ONA",
  },
];

const ESPACES = [
  {
    eyebrow: "Employés",
    titre: "Producteurs d'idées",
    texte:
      "Publient des réflexions sur la sécurité sociale et animent le débat interne.",
    Icone: PenLine,
    couleur: "text-ona-primary",
    fond: "bg-ona-blue-bg",
  },
  {
    eyebrow: "Bénéficiaires",
    titre: "Assurés",
    texte:
      "Un espace dédié pour suivre l'actualité de l'institution et échanger.",
    Icone: ShieldCheck,
    couleur: "text-ona-teal",
    fond: "bg-ona-teal-bg",
  },
  {
    eyebrow: "Bénéficiaires",
    titre: "Pensionnés",
    texte: "Un espace dédié, pensé pour rester simple et accessible.",
    Icone: HeartHandshake,
    couleur: "text-ona-gold",
    fond: "bg-ona-gold-bg",
  },
  {
    eyebrow: "Collectifs",
    titre: "Syndicats & groupes organisés",
    texte:
      "Un espace pour les syndicats et groupes organisés de l'institution.",
    Icone: Megaphone,
    couleur: "text-ona-violet",
    fond: "bg-ona-violet-bg",
  },
  {
    eyebrow: "Institution",
    titre: "Directions",
    texte: "Un accès transversal pour suivre les échanges de chaque espace.",
    Icone: Building2,
    couleur: "text-ona-accent",
    fond: "bg-ona-red-bg",
  },
];

export default async function Accueil() {
  const [dernieres, totalReflexions, totalMembres, totalCommentaires] =
    await Promise.all([
      prisma.reflexion.findMany({
        where: { publie: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          auteur: { select: { name: true } },
          _count: { select: { commentaires: true } },
        },
      }),
      prisma.reflexion.count({ where: { publie: true } }),
      prisma.user.count({ where: { role: { not: null } } }),
      prisma.commentaire.count(),
    ]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ona-primary-dark">
        {/* Motif decoratif : anneaux inspires du badge SI-ONA, pas le sceau officiel */}
        <svg
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.12] sm:h-[560px] sm:w-[560px]"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="190" stroke="#ffffff" strokeWidth="1" />
          <circle cx="200" cy="200" r="150" stroke="#e40d37" strokeWidth="10" />
          <circle cx="200" cy="200" r="110" stroke="#ffffff" strokeWidth="1" />
          <circle cx="200" cy="200" r="70" stroke="#ffffff" strokeWidth="14" />
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.08),transparent_45%)]" />

        <div className="relative mx-auto max-w-5xl px-6 pb-28 pt-24">
          <p className="font-display text-sm uppercase tracking-widest text-white/70">
            SI-ONA
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
            Le Système d&apos;Information de l&apos;ONA
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold italic leading-tight text-white sm:text-5xl">
            Penser la protection sociale, ensemble.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            Un espace où les employés publient leurs réflexions, où assurés,
            pensionnés et syndicats ont leur place, et où chaque direction garde
            une vue d&apos;ensemble.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-ona-primary-dark transition hover:bg-white/90"
            >
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/revue"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Lire la revue hebdomadaire
            </Link>
          </div>
        </div>

        {/* Transition en vague vers le reste de la page */}
        <svg
          className="absolute bottom-0 left-0 block h-14 w-full text-ona-bg"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,24 C240,60 480,0 720,18 C960,36 1200,60 1440,24 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* CHIFFRES CLES */}
      <section className="bg-ona-blue-bg">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-ona-primary/15 px-6 py-10 text-center">
          <div>
            <p className="font-display text-3xl font-semibold text-ona-primary sm:text-4xl">
              {totalReflexions}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ona-text-muted sm:text-sm">
              Réflexions publiées
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold text-ona-primary sm:text-4xl">
              {totalMembres}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ona-text-muted sm:text-sm">
              Membres inscrits
            </p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold text-ona-primary sm:text-4xl">
              {totalCommentaires}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ona-text-muted sm:text-sm">
              Commentaires échangés
            </p>
          </div>
        </div>
      </section>

      {/* SLIDESHOW */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <Slideshow diapos={DIAPOS} />
      </section>

      {/* ESPACES */}
      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-16 sm:grid-cols-2">
        {ESPACES.map(({ titre, texte, eyebrow, Icone, couleur, fond }) => (
          <div
            key={titre}
            className="group rounded-xl border border-ona-border bg-ona-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${fond}`}
            >
              <Icone className={`h-5 w-5 ${couleur}`} />
            </div>
            <p
              className={`mt-4 text-xs font-medium uppercase tracking-wide ${couleur}`}
            >
              {eyebrow}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ona-text">
              {titre}
            </h2>
            <p className="mt-2 text-sm text-ona-text-muted">{texte}</p>
          </div>
        ))}
      </section>

      {/* DEVISE — citation typographique */}
      <section className="border-y border-ona-border bg-ona-surface">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mx-auto flex h-1 w-16 overflow-hidden rounded-full">
            <div className="w-1/2 bg-ona-primary" />
            <div className="w-1/2 bg-ona-accent" />
          </div>
          <p className="mt-6 font-display text-3xl italic leading-snug text-ona-primary-dark sm:text-4xl">
            « Assurons les jeunes,
            <br />
            protégeons les vieux. »
          </p>
        </div>
      </section>

      {/* DERNIERES REFLEXIONS */}
      {dernieres.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-ona-text">
            Dernières réflexions
          </h2>
          <div className="mt-6 space-y-3">
            {dernieres.map((r) => (
              <Link
                key={r.id}
                href={`/reflexions/${r.id}`}
                className="block rounded-xl border border-ona-border bg-ona-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ona-primary hover:shadow-md"
              >
                <p className="font-display text-lg font-semibold text-ona-text">
                  {r.titre}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ona-text-muted">
                  {r.auteur.name}
                  <span className="text-ona-border">·</span>
                  <MessageSquare className="h-3.5 w-3.5" />
                  {r._count.commentaires}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
