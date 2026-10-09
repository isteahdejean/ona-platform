import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Deux façons de se connecter sont prevues :
// 1) Google (le plus simple pour les employes/producteurs)
// 2) Email + mot de passe (utile pour des assures/pensionnes sans compte Google)
// D'autres fournisseurs OAuth (Microsoft, Facebook...) peuvent etre ajoutes
// ici de la meme maniere que GoogleProvider.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;
        // On ne renvoie que le strict necessaire (jamais le mot de passe
        // chiffre, ni la photo qui peut etre volumineuse).
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          editeurRevue: user.editeurRevue,
        } as any;
      },
    }),
  ],
  callbacks: {
    // On propage le role et l'appartenance a l'equipe Revue dans le token
    // puis la session, pour que le middleware et les pages puissent decider
    // quoi afficher. Ils sont relus en base a chaque requete : un changement
    // de role ou d'equipe s'applique sans avoir a se reconnecter.
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? null;
        token.editeurRevue = Boolean((user as any).editeurRevue);
        token.id = user.id;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, editeurRevue: true },
        });
        token.role = dbUser?.role ?? null;
        token.editeurRevue = dbUser?.editeurRevue ?? false;
      }
      // La photo ne doit jamais etre stockee dans le cookie de session :
      // elle est servie par /api/user/photo.
      delete token.picture;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).editeurRevue = Boolean(token.editeurRevue);
        session.user.image = token.id ? `/api/user/photo?id=${token.id}` : null;
      }
      return session;
    },
  },
};
