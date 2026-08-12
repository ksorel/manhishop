# Manhishop

Boutique en ligne mobile-first (PWA) — Next.js 14+ (App Router), Supabase, Paystack, agrégateur Mobile Money, Serwist.

Voir `manhishop-spec.md` pour le cahier des charges complet et `CLAUDE.md` pour les règles de travail.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les clés (voir CLAUDE.md)
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) (redirige vers `/fr`).

## Commandes

```bash
npm run dev          # serveur de développement
npm run build         # build production
npm run lint          # lint
npm run test          # tests unitaires (Vitest)
npm run test:e2e      # tests end-to-end (Playwright)
node scripts/generate-pwa-icons.mjs   # régénère public/icons/ à partir du logo
node scripts/create-e2e-admin.mjs     # crée/met à jour le compte admin dédié aux tests e2e
```

### Tests e2e — prérequis

Certains tests (`tests/e2e/admin-*.spec.ts`) se connectent au back-office avec un
compte admin dédié aux tests (jamais le vrai compte admin). Avant de lancer
`npm run test:e2e` la première fois :

1. Ajouter dans `.env.local` :
   ```
   E2E_ADMIN_EMAIL=e2e-admin@manhishop.test
   E2E_ADMIN_PASSWORD=<mot de passe généré, à toi de le choisir>
   ```
2. Exécuter `node scripts/create-e2e-admin.mjs` (une fois) pour créer ce compte
   dans Supabase avec le rôle admin.

Sans ces variables, les tests admin échouent avec un avertissement explicite
au lancement — les autres tests (catalogue, panier, tailles) fonctionnent
normalement sans elles.

## Phase actuelle

**Phase 3 — Paiement** : commandes, paiement carte et Mobile Money via Paystack (agrégateur unique), webhook, page de confirmation, emails transactionnels. Voir section 11 de `manhishop-spec.md` pour la suite.
