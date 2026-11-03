# Duo Studio — portfolio et vitrine de services

Site de deux frères étudiants ingénieurs : **Carles** (Dev & Data) et **Gédéon** (Architecture).
Portfolio en deux parties, offres de services et formulaire de contact.

> ⚠️ **Contenu d'exemple.** Le nom « Duo Studio », le domaine `duostudio.example`, l'e-mail,
> les projets, les tarifs, les témoignages, les parcours et toutes les images sont des **données
> de démonstration**. Remplacez-les avant la mise en ligne (voir
> [Remplacer les données d'exemple](#remplacer-les-données-dexemple)).

## Sommaire

- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Commandes](#commandes)
- [Structure du projet](#structure-du-projet)
- [Ajouter un projet](#ajouter-un-projet)
- [Ajouter un service](#ajouter-un-service)
- [Remplacer les données d'exemple](#remplacer-les-données-dexemple)
- [Formulaire de contact](#formulaire-de-contact)
- [Variables d'environnement](#variables-denvironnement)
- [Déployer sur Vercel](#déployer-sur-vercel)
- [Checklist avant mise en ligne](#checklist-avant-mise-en-ligne)
- [Qualité et tests](#qualité-et-tests)
- [Évolutions prévues](#évolutions-prévues)

## Stack technique

| Domaine     | Choix                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Cache Components), React 19, TypeScript strict    |
| Style       | Tailwind CSS 4, composants maison, icônes `lucide-react`                  |
| Contenu     | Fichiers MDX dans `content/` (`gray-matter` + `next-mdx-remote/rsc`), Zod |
| Formulaire  | Server Action, validation Zod partagée, Resend (ou mode démo)             |
| Anti-spam   | Pot de miel, limite de débit en mémoire, Cloudflare Turnstile facultatif  |
| Polices     | `next/font` : Inter (texte), Fraunces (titres)                            |
| Qualité     | ESLint, Prettier, Vitest, Playwright + axe-core, GitHub Actions           |
| Hébergement | Vercel                                                                    |

Dépendances ajoutées hors cahier des charges :

- `server-only` : empêche d'importer par erreur le code d'envoi d'e-mails (et ses clés) côté navigateur.
- `@axe-core/playwright` (dev) : audit d'accessibilité WCAG automatique dans les tests de parcours.
- `@testing-library/react`, `jsdom`, `@vitejs/plugin-react` (dev) : environnement Vitest recommandé par Next.js.
- `prettier-plugin-tailwindcss`, `eslint-config-prettier` (dev) : ordre des classes Tailwind et cohabitation ESLint/Prettier.

## Installation

Prérequis : **Node.js 20.9 ou plus récent** (Node 24 recommandé) et npm.

```powershell
# Dans PowerShell, depuis le dossier du projet
npm install
Copy-Item .env.example .env.local   # facultatif : sans clé, le site tourne en mode démo
npm run dev
```

Le site est disponible sur <http://localhost:3000>. Aucune clé API n'est nécessaire.

## Commandes

| Commande              | Rôle                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`         | Serveur de développement                                                     |
| `npm run build`       | Build de production (échoue si un contenu MDX/JSON est invalide)             |
| `npm run start`       | Lance le build de production                                                 |
| `npm run lint`        | ESLint                                                                       |
| `npm run format`      | Formate le code avec Prettier (`format:check` pour vérifier)                 |
| `npm run typecheck`   | Génère les types de routes Next.js puis vérifie TypeScript                   |
| `npm test`            | Tests unitaires (Vitest)                                                     |
| `npm run test:e2e`    | Tests de parcours (Playwright) — construit et lance le site sur le port 3100 |
| `npm run demo:assets` | Régénère les visuels SVG, portraits et CV d'exemple dans `public/demo/`      |

Premier lancement des tests de parcours : installez le navigateur avec
`npx playwright install chromium`.

## Structure du projet

```
duo-studio/
├─ content/                 # TOUT le contenu éditable, sans toucher au code
│  ├─ projets/              # 1 fichier .mdx par projet (+ _modele.mdx commenté)
│  ├─ services/             # 1 fichier .mdx par offre (+ _modele.mdx commenté)
│  ├─ pages/                # a-propos, mentions-legales, confidentialite
│  └─ donnees/              # faq.json, temoignages.json, profil-dev.json, profil-architecture.json
├─ public/demo/             # visuels d'exemple générés (npm run demo:assets)
├─ scripts/                 # générateur des visuels d'exemple
├─ src/
│  ├─ app/                  # routes (App Router), sitemap, robots, images Open Graph
│  ├─ components/           # ui/, layout/, projets/, services/, forms/, profile/, mdx/
│  ├─ config/site.ts        # nom, baseline, coordonnées, liens, navigation (exemples)
│  ├─ proxy.ts              # vraie erreur 404 pour un projet inexistant
│  └─ lib/                  # content.ts, schemas.ts, contact-schema.ts, rate-limit.ts, seo.ts, email.ts
├─ tests/unit/              # Vitest
├─ tests/e2e/               # Playwright
└─ .github/workflows/ci.yml # CI
```

## Ajouter un projet

1. Copiez `content/projets/_modele.mdx` en `content/projets/mon-projet.mdx`
   (le nom du fichier devient l'URL : `/projets/mon-projet`).
2. Remplissez le frontmatter. Le modèle est commenté ; en résumé :

   ```yaml
   ---
   title: Titre du projet
   slug: mon-projet # identique au nom du fichier
   category: dev # dev | architecture
   summary: Deux phrases, 160 caractères maximum.
   year: 2026
   role: Votre rôle
   tags: [Python, Data]
   cover: /projets/mon-projet/cover.jpg # image dans public/
   gallery: # facultatif
     - src: /projets/mon-projet/1.jpg
       alt: Description pour les lecteurs d'écran
       caption: Légende (facultatif)
   link: # facultatif
     label: Voir la démo
     url: https://exemple.com
   featured: false # true = affiché en premier
   ---
   ```

3. Rédigez le corps en Markdown (sections conseillées : Contexte, Démarche, Résultat).
4. Placez les images dans `public/` au chemin indiqué. Le projet apparaît automatiquement dans
   `/projets`, sur la page du profil, dans les filtres, le sitemap et les projets similaires.

Si un champ est invalide, `npm run dev` et `npm run build` affichent un message précis, par exemple :

```
Contenu invalide dans content/projets/mon-projet.mdx :
  • summary : 160 caractères maximum
```

> Astuce : pour obtenir un visuel d'attente aux couleurs du site, utilisez un chemin
> commençant par `/demo/` dans `cover` et `gallery`, puis lancez `npm run demo:assets`.

## Ajouter un service

Copiez `content/services/_modele.mdx` en `content/services/mon-offre.mdx` et complétez-le.
Champs principaux : `domain` (`dev` ou `architecture`), `priceFrom` (nombre, ou `null` pour
« Sur devis »), `priceNote`, `duration`, `includes`, `forWho`, `deliverable`, `requestType`
(type pré-sélectionné dans le formulaire de contact) et `order` (ordre d'affichage).

L'offre apparaît sur `/services`, sur `/services/dev` ou `/services/architecture`, et son bouton
« Demander un devis » ouvre `/contact?service=mon-offre` avec le bon type de demande.

## Remplacer les données d'exemple

| Quoi                                          | Où                                                                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Nom, baseline, e-mail, ville, délai, réseaux  | `src/config/site.ts`                                                                                                              |
| Titres et objectifs des profils, liens des CV | `src/config/site.ts` (`people`)                                                                                                   |
| Compétences et parcours                       | `content/donnees/profil-dev.json`, `profil-architecture.json`                                                                     |
| Projets                                       | `content/projets/*.mdx`                                                                                                           |
| Offres et tarifs                              | `content/services/*.mdx`                                                                                                          |
| FAQ                                           | `content/donnees/faq.json`                                                                                                        |
| Témoignages (fictifs, `exemple: true`)        | `content/donnees/temoignages.json`                                                                                                |
| À propos, mentions légales, confidentialité   | `content/pages/*.mdx` (champs `[À COMPLÉTER]`)                                                                                    |
| Portraits                                     | `public/demo/portrait-dev.svg`, `portrait-architecture.svg` (ou changez le chemin dans `src/components/profile/profile-page.tsx`) |
| CV                                            | `public/demo/cv-exemple.pdf` (ou `people.*.cv` dans `site.ts`)                                                                    |
| Couleurs                                      | `src/app/globals.css` (variables `--accent-dev`, `--accent-architecture`…)                                                        |

Pensez à remplacer les vraies images dans un dossier hors de `public/demo/` : la commande
`npm run demo:assets` réécrit les fichiers de ce dossier.

## Formulaire de contact

- **Validation** : le même schéma Zod (`src/lib/contact-schema.ts`) est utilisé dans le navigateur
  et sur le serveur ; messages en français sous chaque champ.
- **Anti-spam** : champ pot de miel invisible, limite de 5 envois par heure et par IP
  (mémoire du serveur), Cloudflare Turnstile si les deux clés sont définies.
- **Envoi** : avec `RESEND_API_KEY`, une notification part vers `CONTACT_TO_EMAIL` (réponse
  directe possible à l'expéditeur) et un accusé de réception est envoyé au visiteur.
  Sans clé : **mode démo**, la demande est affichée dans la console du serveur et le visiteur
  voit un message de succès précisant qu'aucun e-mail n'est parti.
- **Pré-sélection** : `/contact?service=<slug>` choisit le type de demande correspondant à l'offre.

> La limite de débit en mémoire est propre à chaque instance serveur. Sur Vercel, plusieurs
> instances peuvent coexister : activez Turnstile pour une protection plus forte.

## Variables d'environnement

| Variable                                                                                          | Rôle                                                                               | Défaut                  |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                                            | URL publique (canoniques, sitemap, Open Graph)                                     | `http://localhost:3000` |
| `CONTACT_TO_EMAIL`                                                                                | Destinataire des demandes                                                          | e-mail de `site.ts`     |
| `RESEND_API_KEY`                                                                                  | Active l'envoi réel via Resend                                                     | vide = démo             |
| `RESEND_FROM_EMAIL`                                                                               | Expéditeur (domaine vérifié dans Resend), ex. `Duo Studio <contact@mondomaine.fr>` | adresse de test Resend  |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`                                                     | Active Cloudflare Turnstile (les deux sont nécessaires)                            | vide                    |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`                                                                    | Active Plausible (sans cookie) pour ce domaine                                     | vide = désactivé        |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `NEXT_PUBLIC_ANALYTICS_SRC`, `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` | Utiliser Umami à la place                                                          | —                       |
| `CONTACT_RATE_LIMIT`                                                                              | Envois autorisés par heure et par IP                                               | `5`                     |

Les variables `NEXT_PUBLIC_*`, Turnstile et analytics sont lues **au moment du build** (pages
statiques, en-têtes de sécurité) : après une modification, relancez un déploiement.

## Déployer sur Vercel

1. **Publier le code** sur GitHub (dépôt privé ou public) :
   ```powershell
   git remote add origin https://github.com/<compte>/duo-studio.git
   git push -u origin main
   ```
2. Sur <https://vercel.com>, connectez-vous avec GitHub puis **Add New… → Project**.
3. Importez le dépôt `duo-studio`. Vercel détecte Next.js : laissez les réglages par défaut
   (commande `npm run build`, dossier de sortie automatique).
4. Dans **Environment Variables**, ajoutez au minimum `NEXT_PUBLIC_SITE_URL`
   (ex. `https://mondomaine.fr`), puis `CONTACT_TO_EMAIL`, `RESEND_API_KEY` et
   `RESEND_FROM_EMAIL` si vous voulez recevoir les e-mails.
5. Cliquez sur **Deploy**. Une URL `*.vercel.app` est attribuée en une à deux minutes.
6. **Nom de domaine** : _Settings → Domains_, ajoutez votre domaine et suivez les
   instructions DNS indiquées par Vercel. Mettez ensuite `NEXT_PUBLIC_SITE_URL` à jour et
   redéployez (_Deployments → … → Redeploy_).
7. **Resend** : dans le tableau de bord Resend, ajoutez votre domaine, créez les enregistrements
   DNS demandés (SPF, DKIM), attendez la validation, puis créez une clé API.
8. Chaque `git push` sur `main` redéploie le site ; chaque pull request obtient une URL de prévisualisation.

## Checklist avant mise en ligne

- [ ] Nom de domaine acheté et configuré, `NEXT_PUBLIC_SITE_URL` à jour
- [ ] `src/config/site.ts` : nom, e-mail, ville, réseaux sociaux réels
- [ ] Mentions légales et confidentialité : tous les `[À COMPLÉTER]` renseignés (raison sociale, SIRET, adresse, responsable de publication)
- [ ] Coordonnées de l'hébergeur vérifiées
- [ ] Vrais projets, vraies images (plus aucun fichier de `public/demo/`), vrais portraits et CV
- [ ] Témoignages fictifs supprimés ou remplacés par de vrais témoignages (avec accord)
- [ ] Tarifs relus (indicatifs, non contractuels)
- [ ] Domaine vérifié dans Resend, `RESEND_API_KEY` et `RESEND_FROM_EMAIL` définis, envoi testé
- [ ] Turnstile activé (recommandé une fois le site public)
- [ ] Offres d'architecture : le titre d'« architecte » n'est jamais utilisé comme titre professionnel tant que le profil n'est pas diplômé et inscrit à l'Ordre
- [ ] Contrôle Lighthouse en mobile sur l'URL de production

## Qualité et tests

- **Unitaires (Vitest)** : lecture et validation du contenu, message d'erreur d'un frontmatter
  invalide, schéma de contact, limitation de débit.
- **Parcours (Playwright, bureau + mobile)** : accueil → projet → contact (envoi en mode démo),
  pré-sélection d'offre, page 404, filtres de projets et URL partageable, thème clair/sombre,
  menu mobile, absence de défilement horizontal, lightbox au clavier, lien d'évitement,
  statut 404 réel pour une page ou un projet inexistant.
- **Accessibilité** : audit axe-core (WCAG 2.2 AA) sur 10 pages, en thème clair et sombre.
- **CI** : `.github/workflows/ci.yml` exécute formatage, lint, types, tests unitaires, build puis
  tests de parcours à chaque pull request et sur `main`.

Mesures Lighthouse (mobile, build de production en local, novembre 2026) : performance 94 à 99,
accessibilité 100, bonnes pratiques 100, SEO 100 sur les pages principales. Les résultats réels
dépendent de l'hébergement et des images définitives : refaites la mesure après la mise en ligne.

## Évolutions prévues

La structure est prête à accueillir, sans refonte :

- `/devis` : assistant de devis avec estimation selon le type de projet ;
- `/espace-client` : authentification, suivi de projet, dépôt de fichiers, paiement d'acompte (Stripe) ;
- `/blog` : études de cas et articles (même mécanique MDX que les projets) ;
- version anglaise avec `next-intl` (textes déjà centralisés dans `content/` et `site.ts`) ;
- visionneuse 3D (Three.js) pour les modèles d'architecture ;
- base de données (PostgreSQL/Supabase) pour stocker les demandes et un tableau de bord interne.
