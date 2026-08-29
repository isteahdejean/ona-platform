import Link from "next/link";

// Coordonnees de contact : le numero et l'email sont des PLACEHOLDERS a
// remplacer par les vraies coordonnees. Tous les liens sont deja
// fonctionnels (tel:, mailto:, https:) : il suffit de changer les valeurs.
const CONTACT = {
  telephone: "+509 00 00 0000", // A_REMPLACER
  telephoneHref: "tel:+50900000000", // A_REMPLACER
  email: "contact@si-ona.org", // A_REMPLACER
  siteWeb: "https://www.ona.ht",
};

export default function Footer() {
  return (
    <footer className="border-t-4 border-ona-accent bg-ona-primary-dark text-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-medium">SI-ONA</p>
          <p className="mt-2 text-sm text-white/70">
            Espace collaboratif indépendant des employés, assurés, pensionnés
            et syndicats de l&apos;ONA.
            <br />
            Assurons les jeunes, protégeons les vieux.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Nous contacter</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={CONTACT.telephoneHref} className="hover:underline">
                {CONTACT.telephone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:underline">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={CONTACT.siteWeb} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Site officiel de l&apos;ONA
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Liens utiles</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/revue" className="hover:underline">Revue hebdomadaire</Link>
            </li>
            <li>
              <Link href="/connexion" className="hover:underline">Se connecter</Link>
            </li>
            <li>
              <Link href="/inscription" className="hover:underline">S&apos;inscrire</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} SI-ONA — Espace collaboratif indépendant
      </div>
    </footer>
  );
}
