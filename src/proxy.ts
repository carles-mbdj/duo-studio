import fs from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Vraie erreur 404 pour un projet inexistant.
 *
 * Les pages /projets/[slug] connues sont prérendues. Pour un slug inconnu, Next.js commencerait
 * à envoyer la page (statut 200) avant de savoir qu'elle n'existe pas : on vérifie donc ici,
 * avant tout rendu, qu'un fichier content/projets/<slug>.mdx existe.
 */
const PROJECTS_DIR = path.join(process.cwd(), "content", "projets");

export function proxy(request: NextRequest) {
  let slug = "";
  try {
    slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  } catch {
    // URL mal encodée (ex. %E0) : traitée comme un projet inexistant.
  }

  // Si le dossier de contenu n'est pas accessible, on laisse la page gérer (404 sans statut).
  if (!fs.existsSync(PROJECTS_DIR)) return NextResponse.next();

  const exists =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    fs.existsSync(path.join(PROJECTS_DIR, `${slug}.mdx`));
  if (exists) return NextResponse.next();

  // Réécriture vers une route qui n'existe pas : Next.js renvoie la page 404 avec le statut 404.
  return NextResponse.rewrite(new URL("/introuvable", request.url));
}

export const config = {
  // Uniquement les pages de détail (pas /projets ni les images Open Graph des projets).
  matcher: "/projets/:slug",
};
