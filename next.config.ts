import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * Politique de sécurité du contenu (CSP).
 * Les pages sont prérendues statiquement : pas de nonce possible, d'où 'unsafe-inline' pour
 * les scripts (script de thème et données de navigation injectés par Next.js).
 * Les domaines tiers ne sont autorisés que si le service correspondant est activé.
 */
const turnstile = process.env.TURNSTILE_SITE_KEY ? "https://challenges.cloudflare.com" : "";
const analyticsSrc = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN
  ? process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "umami"
    ? new URL(process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? "https://invalid.local").origin
    : "https://plausible.io"
  : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${turnstile} ${analyticsSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self' ${analyticsSrc}`,
  `frame-src ${turnstile || "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .map((directive) => directive.replace(/\s+/g, " ").trim())
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isDev
    ? []
    : [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Le contenu (MDX/JSON) est lu à l'exécution par le proxy et les pages rendues à la demande :
  // on l'inclut explicitement dans le paquet serveur déployé.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
