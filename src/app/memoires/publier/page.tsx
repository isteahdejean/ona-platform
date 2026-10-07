import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MemoireForm from "@/components/MemoireForm";

// Tout utilisateur connecte ayant un role peut publier un memoire
export default async function PagePublierMemoire() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");
  if (!session.user.role) redirect("/");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/memoires"
        className="text-sm text-ona-text-muted hover:text-ona-primary"
      >
        ← Retour aux mémoires
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ona-primary">
        Publier un mémoire
      </h1>
      <p className="mt-2 text-ona-text-muted">
        Partagez votre travail de fin d&apos;études. Il sera visible par tous
        les membres de SI-ONA, et pourra enrichir la réflexion de
        l&apos;institution.
      </p>
      <div className="mt-8">
        <MemoireForm />
      </div>
    </div>
  );
}
