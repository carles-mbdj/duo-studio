/**
 * Script exécuté dans <head> avant le premier rendu : applique le thème mémorisé
 * (localStorage) ou, à défaut, la préférence système. Évite tout flash au chargement.
 * Le contenu est exporté pour pouvoir calculer son empreinte dans la CSP.
 */
export const THEME_STORAGE_KEY = "duo-theme";

export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
