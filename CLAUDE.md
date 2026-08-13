# CLAUDE.md — Manhishop

Ce fichier est chargé automatiquement par Claude Code au démarrage. Il sert de mémoire de projet : lis `manhishop-spec.md` (à la racine) pour le cahier des charges complet avant toute action. Ce fichier-ci contient les règles de travail, contraintes et conventions à respecter en continu.

## Contexte du projet

Manhishop est une boutique en ligne (PWA mobile-first) en cours de construction. Spécifications complètes : voir `manhishop-spec.md`. Résumé des points non négociables :

- **Stack** : Next.js 14+ (App Router) + Supabase (DB Postgres, Auth, Storage) + Paystack (paiement carte ET Mobile Money, agrégateur unique) + Vercel (hébergement) + Serwist (PWA). Pas de Firebase.
- **100% gratuit** : n'utiliser que des services avec un plan gratuit suffisant (Supabase Free, Vercel Hobby, Resend Free, next-intl, next-themes, Google Fonts). Ne jamais introduire une dépendance payante (Algolia, CDN image payant, police payante, etc.) sans le signaler explicitement avant de l'ajouter. Paystack est accepté malgré sa commission par transaction : pas d'abonnement fixe, donc pas de coût tant qu'il n'y a pas de vente.
- **Paiement carte + Mobile Money (Paystack)** : agrégateur unique choisi par le client (basé en Côte d'Ivoire, Stripe n'y opère pas). Paystack couvre carte bancaire et Mobile Money (Orange Money, MTN, Wave) en Côte d'Ivoire via une seule page de paiement hébergée (Paystack Checkout, paramètre `channels`) — le client choisit son moyen de paiement directement sur cette page, pas dans notre UI. Décision confirmée définitive le 2026-07-29 (un temps question de passer à CinetPay, finalement écarté). Toujours développer et tester en mode Test Paystack avant de basculer sur des clés live. Vérifier les pays/opérateurs couverts directement sur la doc Paystack au moment de l'implémentation (ces informations changent souvent).
- Le checkout doit proposer les deux moyens de paiement (carte et Mobile Money) — le client choisit à l'étape paiement.
- **Mode clair/sombre** : implémenté avec `next-themes` + tokens CSS Tailwind (`dark:`), bascule manuelle + détection système, dès la Phase 0.
- **Multilingue** : `next-intl`, français par défaut, anglais disponible, sélecteur de langue visible partout, aucun texte d'UI en dur (tout dans `messages/fr.json` et `messages/en.json`).
- **Logo** : le client fournit un logo (à placer dans `public/logo/`). La palette du design system (couleurs primaire/secondaire) doit être dérivée des couleurs du logo — proposer une palette et la faire valider avant de l'appliquer partout.
- **Serverless uniquement** : pas de serveur à gérer, pas de conteneur/VM. Toute logique custom passe par les routes API Next.js (serverless functions Vercel).

## Règles de travail

1. **Avance phase par phase** (voir section 11 de `manhishop-spec.md`). Ne pas sauter une phase ni anticiper la suivante sans validation.
2. **Marque une pause de revue à la fin de chaque phase** : résume ce qui a été fait, montre comment le tester en local, attends un go avant de continuer.
3. **Ne jamais committer de secret** (clés Paystack, service role key Supabase) — tout passe par des variables d'environnement (`.env.local`, jamais commit ; documenter les clés attendues dans `.env.example`).
3bis. **Webhook de paiement (Paystack)** : toujours vérifier la signature (`x-paystack-signature`, HMAC SHA512), gérer l'idempotence (rejouer un webhook ne doit jamais créer deux commandes payées), ne jamais faire confiance à une simple redirection côté client pour valider un paiement.
4. **RLS d'abord** : toute nouvelle table Supabase doit avoir ses policies Row Level Security écrites et testées avant d'être utilisée côté client.
5. **Prix recalculés côté serveur** : jamais confiance dans un prix/total envoyé par le client au moment du paiement.
6. **Mobile-first** : concevoir et tester chaque écran d'abord en viewport ~375–414px.
7. **Accessibilité** : respecter WCAG 2.1 AA de base (contraste, tap targets ≥44px, navigation clavier) sur les composants du design system.
8. **Pas de texte en dur** : tout texte visible par l'utilisateur passe par les fichiers de traduction, y compris messages d'erreur et emails.
9. **Tester les deux thèmes et les deux langues** avant de considérer un écran terminé.

## Commandes

```bash
npm run dev          # serveur de développement
npm run build        # build production
npm run lint          # lint
npm run test          # tests unitaires
npm run test:e2e      # tests end-to-end (Playwright)
```

(à adapter si un autre gestionnaire de paquets ou des scripts différents sont mis en place par Claude Code)

## Variables d'environnement attendues (`.env.local`, ne jamais commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
RESEND_API_KEY=
# Monitoring d'erreurs (Sentry, gratuit, optionnel) :
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
# Alerte stock faible (cron Vercel, gratuit) :
CRON_SECRET=
```

## Structure du projet

Voir section 10 de `manhishop-spec.md` pour l'arborescence cible (routage `[locale]`, dossier `messages/`, `public/logo/`, etc.).

## Démarrage

Prompt de départ suggéré (Phase 0) :

> Lis `manhishop-spec.md` en entier. Initialise le projet Next.js + Supabase + Stripe + PWA en respectant la structure de la section 10, avec next-intl (fr par défaut, en) et next-themes (clair/sombre) configurés dès le départ. Mets en place le design system de la section 6.2 en dérivant la palette du logo présent dans `public/logo/`. N'utilise que des services avec plan gratuit. Fais une revue avec moi avant de passer à la Phase 1.

## À trancher avec le client (ne pas décider seul)

Décisions déjà prises pendant le développement (pour référence) :
- Palette : vert `#3F7D33` / or `#C9950E`, dérivée du logo — validée Phase 0
- Catalogue traduit fr/en (pas seulement l'UI) — validé avant la Phase 1
- Livraison : tarif fixe 1000 FCFA, zone unique pour démarrer — à affiner par zone plus tard
- Paiement : agrégateur unique Paystack (carte + Mobile Money : Orange Money, MTN, Wave en Côte d'Ivoire), remplace Stripe (non disponible en CI) et CinetPay — reconfirmé définitivement le 2026-07-29 (piste CinetPay écartée, le client ne veut plus en entendre parler)

Rien d'autre en attente pour l'instant — remettre à jour cette liste si de nouveaux points ouverts apparaissent en Phase 4/5 (ex. zones de livraison élargies, catégories/catalogue réel).
