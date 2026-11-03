import Script from "next/script";

/**
 * Mesure d'audience facultative, sans cookie (Plausible ou Umami).
 * Désactivée par défaut : définir NEXT_PUBLIC_ANALYTICS_DOMAIN pour l'activer.
 *  - Plausible : NEXT_PUBLIC_ANALYTICS_DOMAIN=mondomaine.fr
 *  - Umami : définir aussi NEXT_PUBLIC_ANALYTICS_PROVIDER=umami, NEXT_PUBLIC_ANALYTICS_SRC
 *    (URL du script) et NEXT_PUBLIC_ANALYTICS_WEBSITE_ID.
 * Ces deux outils ne déposent pas de cookie : aucun bandeau de consentement n'est nécessaire.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;
  if (!domain) return null;

  if (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "umami") {
    const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
    const websiteId = process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID;
    if (!src || !websiteId) return null;
    return <Script src={src} data-website-id={websiteId} strategy="afterInteractive" />;
  }

  return (
    <Script
      src="https://plausible.io/js/script.js"
      data-domain={domain}
      strategy="afterInteractive"
    />
  );
}
