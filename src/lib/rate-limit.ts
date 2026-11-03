/**
 * Limiteur de débit en mémoire (fenêtre glissante).
 *
 * Suffisant pour un petit site : la mémoire est propre à chaque instance serveur et se vide
 * au redémarrage. Pour une protection globale (plusieurs instances), utiliser un stockage
 * partagé (Redis, Upstash…) ou Cloudflare Turnstile.
 */
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Millisecondes avant qu'un nouvel envoi soit possible (0 si autorisé). */
  retryAfterMs: number;
};

export type RateLimiter = {
  check: (key: string) => RateLimitResult;
  reset: () => void;
};

export function createRateLimiter({
  limit,
  windowMs,
  now = () => Date.now(),
  maxKeys = 10_000,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
  /** Nombre maximal de clés suivies, pour borner la mémoire. */
  maxKeys?: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key) {
      const current = now();
      const recent = (hits.get(key) ?? []).filter((time) => current - time < windowMs);

      if (recent.length >= limit) {
        hits.set(key, recent);
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: windowMs - (current - recent[0]!),
        };
      }

      recent.push(current);
      hits.delete(key);
      hits.set(key, recent);
      // Éviction des clés les plus anciennes si la limite mémoire est atteinte.
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return { allowed: true, remaining: limit - recent.length, retryAfterMs: 0 };
    },
    reset() {
      hits.clear();
    },
  };
}

/**
 * Limiteur du formulaire de contact : 5 envois par heure et par adresse IP.
 * CONTACT_RATE_LIMIT permet d'ajuster la limite (les tests de bout en bout la relèvent).
 */
const configuredLimit = Number(process.env.CONTACT_RATE_LIMIT);
export const contactRateLimiter = createRateLimiter({
  limit: Number.isInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 5,
  windowMs: 60 * 60 * 1000,
});
