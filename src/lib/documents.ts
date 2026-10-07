import { supabaseAdmin, BUCKET_DOCUMENTS } from "@/lib/supabase";

export const TYPE_PDF = "application/pdf";
export const TYPE_WORD =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Verifie le VRAI format d'un document envoye, a partir de ses premiers
// octets (et non de son extension, facile a falsifier) :
// un PDF commence par "%PDF", un fichier Word .docx par "PK" (format zip).
// Renvoie le type et la taille reelle du fichier, ou null s'il est refuse.
export async function verifierDocument(chemin: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCUMENTS)
    .createSignedUrl(chemin, 60);
  if (error || !data) return null;

  const reponse = await fetch(data.signedUrl, {
    headers: { Range: "bytes=0-7" },
  });
  if (!reponse.ok) return null;

  const octets = new Uint8Array(await reponse.arrayBuffer()).slice(0, 8);
  const plage = reponse.headers.get("content-range"); // ex. "bytes 0-7/123456"
  const taille = plage
    ? Number(plage.split("/")[1])
    : Number(reponse.headers.get("content-length"));

  const estPdf =
    octets[0] === 0x25 &&
    octets[1] === 0x50 &&
    octets[2] === 0x44 &&
    octets[3] === 0x46;
  const estDocx =
    octets[0] === 0x50 &&
    octets[1] === 0x4b &&
    octets[2] === 0x03 &&
    octets[3] === 0x04;

  if (estPdf) return { typeMime: TYPE_PDF, taille };
  if (estDocx) return { typeMime: TYPE_WORD, taille };
  return null;
}
