# CLAUDE.md — Manhishop

Ce fichier est chargé automatiquement par Claude Code au démarrage. Il sert de mémoire de projet : lis `manhishop-spec.md` (à la racine) pour le cahier des charges complet avant toute action. Ce fichier-ci contient les règles de travail, contraintes et conventions à respecter en continu.

## Contexte du projet

Manhishop est une boutique en ligne (PWA mobile-first) en cours de construction. Spécifications complètes : voir `manhishop-spec.md`. Résumé des points non négociables :

- **Stack** : Next.js 14+ (App Router) + Supabase (DB Postgres, Auth, Storage) + Stripe (paiement carte) + agrégateur Mobile Money (CinetPay par défaut, voir ci-dessous) + Vercel (hébergement) + Serwist (PWA). Pas de Firebase.
- **100% gratuit** : n'utiliser que des services avec un plan gratuit suffisant (Supabase Free, Vercel Hobby, Resend Free, next-intl, next-themes, Google Fonts). Ne jamais introduire une dépendance payante (Algolia, CDN image payant, police payante, etc.) sans le signaler explicitement avant de l'ajouter. Stripe et l'agrégateur Mobile Money sont acceptés malgré leur commission par transaction : pas d'abonnement fixe, donc pas de coût tant qu'il n'y a pas de vente.
- **Paiement Mobile Money** : marché cible = Afrique de l'Ouest francophone (Côte d'Ivoire, Sénégal, Mali, Burkina Faso, Togo, Bénin...). Intégrer un agrégateur unique (CinetPay recommandé, PayDunya en repli) plutôt que chaque opérateur séparément — couvre Orange Money, MTN Mobile Money, Moov Money, Wave. Toujours développer et tester en mode sandbox du fournisseur avant de basculer sur des clés réelles. Vérifier les tarifs/pays couverts/délai de validation du compte marchand directement sur la doc du fournisseur au moment de l'implémentation (ces informations changent souvent).
- Le checkout doit proposer les deux moyens de paiement (carte et Mobile Money) — le client choisit à l'étape paiement.
- **Mode clair/sombre** : implémenté avec `next-themes` + tokens CSS Tailwind (`dark:`), bascule manuelle + détection système, dès la Phase 0.
- **Multilingue** : `next-intl`, français par défaut, anglais disponible, sélecteur de langue visible partout, aucun texte d'UI en dur (tout dans `messages/fr.json` et `messages/en.json`).
- **Logo** : le client fournit un logo (à placer dans `public/logo/`). La palette du design system (couleurs primaire/secondaire) doit être dérivée des couleurs du logo — proposer une palette et la faire valider avant de l'appliquer partout.
- **Serverless uniquement** : pas de serveur à gérer, pas de conteneur/VM. Toute logique custom passe par les routes API Next.js (serverless functions Vercel).

## Règles de travail

1. **Avance phase par phase** (voir section 11 de `manhishop-spec.md`). Ne pas sauter une phase ni anticiper la suivante sans validation.
2. **Marque une pause de revue à la fin de chaque phase** : résume ce qui a été fait, montre comment le tester en local, attends un go avant de continuer.
3. **Ne jamais committer de secret** (clés Stripe, clé API agrégateur Mobile Money, service role key Supabase) — tout passe par des variables d'environnement (`.env.local`, jamais commit ; documenter les clés attendues dans `.env.example`).
3bis. **Webhooks de paiement (Stripe et Mobile Money)** : toujours vérifier la signature, gérer l'idempotence (rejouer un webhook ne doit jamais créer deux commandes payées), ne jamais faire confiance à une simple redirection côté client pour valider un paiement.
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
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
RESEND_API_KEY=
```

(noms de variables Mobile Money à adapter si l'agrégateur retenu n'est finalement pas CinetPay)

## Structure du projet

Voir section 10 de `manhishop-spec.md` pour l'arborescence cible (routage `[locale]`, dossier `messages/`, `public/logo/`, etc.).

## Démarrage

Prompt de départ suggéré (Phase 0) :

> Lis `manhishop-spec.md` en entier. Initialise le projet Next.js + Supabase + Stripe + PWA en respectant la structure de la section 10, avec next-intl (fr par défaut, en) et next-themes (clair/sombre) configurés dès le départ. Mets en place le design system de la section 6.2 en dérivant la palette du logo présent dans `public/logo/`. N'utilise que des services avec plan gratuit. Fais une revue avec moi avant de passer à la Phase 1.

## À trancher avec le client (ne pas décider seul)

- Palette finale dérivée du logo (proposer, faire valider)
- Catalogue traduit en fr/en ou uniquement affichage d'interface traduit (contenu produit en une seule langue) — impacte le modèle de données (section 6.6 de la spec)
- Zones de livraison, grille tarifaire
- Agrégateur Mobile Money définitif (CinetPay vs PayDunya vs autre) selon validation réelle du compte marchand dans le(s) pays de lancement
- Opérateurs Mobile Money à activer en priorité (Orange Money, MTN, Moov, Wave)
