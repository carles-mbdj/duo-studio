import { z } from "zod";

/*
 * Désactive la compilation JIT de Zod (qui sonde `new Function`) : le gain est négligeable
 * ici et la sonde déclenche une violation de la CSP du site (pas de 'unsafe-eval').
 * Ce module doit être importé avant toute création de schéma.
 */
z.config({ jitless: true });

// Messages d'erreur par défaut en français.
z.config(z.locales.fr());
