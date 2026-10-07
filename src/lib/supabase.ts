import { createClient } from "@supabase/supabase-js";

// Client Supabase reserve au SERVEUR : il utilise la cle secrete, qui donne
// un acces complet au projet. Ne jamais l'importer dans un composant
// marque "use client", sinon la cle serait envoyee aux navigateurs.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const BUCKET_DOCUMENTS = "documents";

// Formats acceptes et taille maximale des documents joints
export const TYPES_DOCUMENTS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word",
};
export const TAILLE_MAX_DOCUMENT = 20 * 1024 * 1024; // 20 Mo
