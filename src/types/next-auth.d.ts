import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

// Etend les types de next-auth pour exposer id/role sur la session et le token.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role | null;
  }
}
