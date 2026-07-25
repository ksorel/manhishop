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
```

## Phase actuelle

**Phase 3 — Paiement** : commandes, paiement carte et Mobile Money via Paystack (agrégateur unique), webhook, page de confirmation, emails transactionnels. Voir section 11 de `manhishop-spec.md` pour la suite.
