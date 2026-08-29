import Image from "next/image";
import { Landmark } from "lucide-react";

// Contenu factuel et public sur l'institution ONA elle-meme (decret de
// creation, mission). Les photos (batiment, direction) sont fournies par
// l'utilisateur, qui a indique disposer de l'autorisation necessaire pour
// les utiliser sur cette page.
export default function Institution() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ona-primary-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/batiment-ona.gif"
          alt="Bâtiment de l'Office National d'Assurance-Vieillesse"
          className="h-64 w-full object-cover opacity-40 sm:h-80"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ona-primary-dark via-ona-primary-dark/60 to-transparent">
          <div className="mx-auto w-full max-w-5xl px-6 pb-8">
            <p className="font-display text-sm uppercase tracking-widest text-white/70">
              L&apos;institution
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              Office National d&apos;Assurance-Vieillesse
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ona-blue-bg">
            <Landmark className="h-5 w-5 text-ona-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ona-text">
              Créée par le décret du 8 novembre 1965
            </h2>
            <p className="mt-3 text-ona-text-muted">
              L&apos;ONA a pour mission d&apos;assurer aux employés des
              établissements commerciaux, industriels, agricoles et assimilés
              ayant atteint l&apos;âge et le nombre d&apos;années de service
              requis, ou frappés d&apos;incapacité physique ou mentale, des
              prestations leur permettant de vivre dans des conditions décentes
              en compensation des services fournis durant leurs années
              productives.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-ona-border bg-ona-surface py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-display text-2xl font-semibold text-ona-text">
            Direction
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-ona-border">
              <Image
                src="/directrice-generale.jpg"
                alt="Mme Lovely François, Directrice Générale"
                width={400}
                height={480}
                className="h-64 w-full object-cover object-top"
              />
              <div className="p-4">
                <p className="font-display text-lg font-semibold text-ona-text">
                  Mme Lovely François
                </p>
                <p className="text-sm text-ona-text-muted">
                  Directrice Générale
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-ona-border">
              <Image
                src="/direction-generale.jpg"
                alt="Nomination de M. Job Pierre, Directeur Général Adjoint"
                width={400}
                height={480}
                className="h-64 w-full object-cover object-top"
              />
              <div className="p-4">
                <p className="font-display text-lg font-semibold text-ona-text">
                  M. Job Pierre
                </p>
                <p className="text-sm text-ona-text-muted">
                  Directeur Général Adjoint
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
