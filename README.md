# Plateforme ONA — squelette de projet

Squelette fonctionnel Next.js 14 (App Router, TypeScript) + PostgreSQL (Prisma) +
NextAuth pour la plateforme collaborative de l'ONA.

## Ce qui est deja en place

- **Authentification** : connexion Google + connexion email/mot de passe
  (`src/lib/auth.ts`). D'autres fournisseurs (Microsoft, Facebook...) se
  branchent en ajoutant un provider NextAuth au meme endroit.
- **4 profils** : Producteur (employe qui publie des reflexions), Assure,
  Pensionne, Direction — + un role Admin non auto-attribuable
  (`prisma/schema.prisma`). Le choix se fait a l'inscription
  (`src/app/inscription`) et est verifie a chaque requete par
  `src/middleware.ts`.
- **Reflexions et commentaires illimites** : `Reflexion` et `Commentaire`
  (avec `parentId` pour les fils de reponses) sans limite de nombre imposee
  par le schema — voir `src/app/api/reflexions` et
  `src/app/api/reflexions/[id]/comments`.
- **4 tableaux de bord** : `src/app/dashboard/{producteur,assure,pensionne,direction}`.
- **Polices provisoires** : pile de polices systeme dans `src/app/globals.css`
  (`--font-display` / `--font-body`), pour eviter une dependance a Google
  Fonts a ce stade. Pour de vraies polices (ex. Newsreader + Inter), reprendre
  `next/font/google` dans `src/app/layout.tsx` — le code d'origine est en
  commentaire pour reference.
- **Identite visuelle ONA** : le vrai logo (`public/logo-ona.jpg`,
  `public/ona-banner.jpg`) et les couleurs officielles (bleu `#0f3d9d`,
  rouge `#e40d37`, marine `#173363` — echantillonnees directement depuis le
  logo, variables `--ona-*` dans `src/app/globals.css`) sont deja integres.
- **Pied de page** : liens cliquables (`tel:`, `mailto:`, site web) dans
  `src/components/Footer.tsx`. Le numero de telephone et l'email sont des
  PLACEHOLDERS a remplacer par les vraies coordonnees de l'ONA ; le lien
  vers www.ona.ht est deja correct.

## Demarrage

```bash
npm install
cp .env.example .env   # puis renseigner DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET
npx prisma migrate dev --name init
npm run dev
```

- `NEXTAUTH_SECRET` : generer avec `openssl rand -base64 32`.
- Identifiants Google OAuth : a creer sur console.cloud.google.com
  (type "application web", URI de redirection
  `http://localhost:3000/api/auth/callback/google` en developpement).

## Pour la suite (30 000 a 50 000 utilisateurs actifs)

- Ajouter la pagination par curseur (deja en place sur `GET /api/reflexions`)
  a toutes les listes qui peuvent grossir (commentaires, utilisateurs).
- Mettre un index/cache (Redis) devant les reflexions les plus consultees.
- Deployer avec une base PostgreSQL geree (connexions poolees, ex. via
  PgBouncer) plutot qu'une instance unique.
- Ajouter la moderation (signalement de commentaires) avant l'ouverture au
  grand public, vu le volume attendu.
- Peupler la table `Direction` avec l'organigramme reel de l'institution,
  et mettre en place un ecran d'administration pour attribuer le role
  `DIRECTION`/`ADMIN` (actuellement a faire directement en base ou via
  Prisma Studio : `npm run prisma:studio`).

## VS Code et GitHub

- **VS Code** : ouvrez le dossier (`code .`). `.vscode/extensions.json`
  proposera automatiquement les extensions utiles (Tailwind CSS IntelliSense,
  Prisma, ESLint, Prettier) et `.vscode/settings.json` active le formatage a
  l'enregistrement.
- **GitHub** : `.github/workflows/ci.yml` fait tourner automatiquement
  `npm install`, `prisma generate`, le lint et le build a chaque push/PR sur
  `main` — utile pour verifier que la plateforme "passe" avant de fusionner.

## Structure

```
src/
  app/            pages et routes API (App Router)
  components/     composants reutilisables
  lib/            connexion Prisma, config NextAuth
  middleware.ts   protection des routes par role
prisma/
  schema.prisma   modele de donnees
```
