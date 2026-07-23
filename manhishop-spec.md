# Manhishop — Spécifications produit & techniques
### Boutique en ligne — Progressive Web App (PWA)

Document de cadrage à fournir à Claude Code pour le développement. Objectif : donner un brief suffisamment complet pour qu'un agent de développement puisse construire l'application sans allers-retours, tout en laissant la liberté d'implémentation sur les détails de code.

---

## 1. Vision produit

Manhishop est une boutique en ligne mobile-first vendant des articles (mode, accessoires ou catégorie à préciser par le client final). L'application doit :

- Fonctionner comme une PWA installable sur mobile (icône, écran de démarrage, mode hors-ligne partiel), sans passer par les stores.
- Offrir un parcours d'achat complet : découverte → fiche produit → panier → paiement → suivi de commande.
- Être gérable au quotidien via un back-office (produits, stock, commandes) sans intervention technique.
- Rester 100% serverless, sans Firebase, en n'utilisant que des briques gratuites (voir section 2.1) — aucun coût fixe tant que le volume reste raisonnable.
- Utiliser le logo fourni par le client comme identité visuelle (couleurs et déclinaisons du design system dérivées du logo).
- Proposer un **mode clair/sombre** avec bascule manuelle et détection de la préférence système.
- Être **multilingue** : français par défaut, anglais disponible, sélecteur de langue accessible depuis toutes les pages.

---

## 2. Stack technique recommandée (serverless, sans Firebase, 100% gratuit pour démarrer)

| Couche | Choix | Rôle | Coût |
|---|---|---|---|
| Frontend + API | **Next.js 14+ (App Router)** | Rendu hybride (SSR/ISR/CSR), routes API serverless intégrées | Gratuit (open source) |
| Base de données | **Supabase (PostgreSQL)** | Base relationnelle managée, Row Level Security native | Plan Free (500 Mo DB, 1 Go stockage, 50k utilisateurs auth/mois) |
| Authentification | **Supabase Auth** | Email/mot de passe, magic link, OAuth (Google) | Inclus dans le plan Free |
| Stockage fichiers | **Supabase Storage** | Images produits, avatars, logo | Inclus dans le plan Free (1 Go) |
| Paiement carte | **Stripe** (Checkout ou Payment Intents) | Paiement carte, gestion des remboursements | Pas d'abonnement, uniquement des frais par transaction réussie |
| Paiement Mobile Money | **Agrégateur unifié (ex. CinetPay ou PayDunya)** | Orange Money, MTN Mobile Money, Moov Money, Wave selon pays | Pas d'abonnement, commission par transaction réussie uniquement (à négocier avec le fournisseur) |
| Hébergement | **Vercel (plan Hobby)** | Déploiement serverless du frontend + API routes, CDN edge | Gratuit (usage personnel/petit projet) |
| PWA | **Serwist** (successeur de next-pwa) | Service worker, manifest, cache offline | Gratuit (open source) |
| Emails transactionnels | **Resend (plan Free)** | Confirmation commande, reset mot de passe | Gratuit jusqu'à 3 000 emails/mois |
| Recherche produits | **Postgres full-text search (`tsvector`)** | Recherche/filtre catalogue | Inclus dans Supabase, aucun service tiers payant |
| Internationalisation | **next-intl** | Traduction fr/en, routage localisé | Gratuit (open source) |
| Thème clair/sombre | **next-themes** + Tailwind CSS (`dark:` variant) | Bascule et persistance du thème | Gratuit (open source) |
| Polices | **Google Fonts** (ex. Inter, Poppins) | Typographie | Gratuit |

Pourquoi ce choix : chaque brique dispose d'un plan gratuit suffisant pour un MVP et une montée en charge modérée, sans carte bancaire obligatoire (sauf Stripe et l'agrégateur Mobile Money, qui ne facturent qu'à la vente réalisée — donc sans coût fixe tant qu'il n'y a pas de commande). Supabase remplace Firebase (DB + Auth + Storage) mais reste relationnel (SQL), open-source, et auto-hébergeable si besoin plus tard. Vercel + Next.js API routes évitent de gérer des serveurs.

Point de vigilance budget : Algolia et les CDN d'images payants sont volontairement exclus au profit d'alternatives incluses dans Supabase/Next.js. Si le projet dépasse les quotas gratuits (trafic, stockage), il faudra revoir cette section — mais aucune limite n'est un problème dès le lancement.

### 2.1 Mobile Money — choix de l'agrégateur

Le marché ciblé est l'Afrique de l'Ouest francophone (Côte d'Ivoire, Sénégal, Mali, Burkina Faso, Togo, Bénin...). Plutôt que d'intégrer séparément chaque opérateur (Orange Money, MTN Mobile Money, Moov Money, Wave), on passe par un **agrégateur unique** qui expose une seule API/page de paiement hébergée pour tous les opérateurs :

- **CinetPay** : bonne couverture régionale (CI, Sénégal, Mali, Burkina, Togo, Bénin, Cameroun, RDC, Guinée), page de paiement hébergée + API REST, mode sandbox gratuit pour développer sans argent réel, commission au pourcentage par transaction (dégressive selon volume) — pas d'abonnement.
- **PayDunya** : couverture régionale équivalente, API/facture de paiement, également sans abonnement.
- **FedaPay** / **Kkiapay** : plus pertinents si le lancement se concentre sur le Bénin dans un premier temps.
- **Wave** : commissions parmi les plus basses du marché en Sénégal/Côte d'Ivoire, mais l'intégration marchand directe est plus limitée selon les pays — souvent accessible via CinetPay/PayDunya en tant qu'opérateur au sein de l'agrégateur plutôt qu'en direct.

Recommandation par défaut : **CinetPay** comme agrégateur principal (couverture large, sandbox gratuit, un seul point d'intégration pour tous les opérateurs + cartes bancaires). PayDunya en solution de repli si le compte marchand CinetPay n'est pas validé dans le pays visé.

Important : les frais exacts, délais de validation du compte marchand et pays couverts évoluent régulièrement — à reconfirmer directement sur la documentation du fournisseur choisi avant intégration, et à valider avec le client final avant de committer un choix définitif (voir section "points à trancher").

Alternatives envisagées (non retenues par défaut) : AWS Amplify/Lambda+DynamoDB (plus lourd à mettre en place pour un MVP, quotas gratuits moins généreux), Neon+Clerk (stack séparée équivalente à Supabase mais moins intégrée).

---

## 3. Architecture globale

```
[PWA Next.js — Vercel Edge]
        │
        ├── Routes API (serverless functions Next.js)
        │        ├── /api/checkout/card          → Stripe
        │        ├── /api/checkout/mobile-money   → CinetPay (ou agrégateur choisi)
        │        ├── /api/webhooks/stripe         → confirmation paiement carte
        │        ├── /api/webhooks/mobile-money   → confirmation paiement Mobile Money
        │        └── /api/orders, /api/products (si logique custom)
        │
        ├── Supabase Client (frontend + server)
        │        ├── Auth (JWT, RLS)
        │        ├── Postgres (produits, commandes, users)
        │        └── Storage (images)
        │
        ├── Stripe (Checkout Session / Payment Intent + Webhooks)
        │
        └── Agrégateur Mobile Money (page de paiement hébergée + Webhook de confirmation)
```

Principe clé : le frontend interroge Supabase directement pour la lecture (catalogue, produit) via le client Supabase avec Row Level Security, et passe par des routes API Next.js uniquement pour les opérations sensibles (paiement, écriture protégée, logique métier). Le paiement Mobile Money suit le même principe que Stripe : la commande est créée en statut `pending`, l'utilisateur est redirigé vers la page de paiement hébergée par l'agrégateur (choix de l'opérateur + numéro de téléphone), puis un webhook confirme le paiement et fait passer la commande en `paid` — jamais de confirmation basée sur une simple redirection côté client (qui peut être falsifiée).

---

## 4. Modèle de données (Postgres / Supabase)

Tables principales à créer avec RLS activée sur chacune :

- **profiles** : id (uuid, lié à auth.users), nom, email, téléphone, rôle (`customer` / `admin`), created_at
- **categories** : id, nom, slug, image, ordre_affichage
- **products** : id, nom, slug, description, prix, prix_promo, category_id, images (array/table liée), stock, statut (actif/brouillon), created_at, updated_at
- **product_variants** (optionnel si tailles/couleurs) : id, product_id, taille, couleur, stock, sku
- **carts** : id, user_id (nullable si invité), created_at
- **cart_items** : id, cart_id, product_id, variant_id, quantité
- **addresses** : id, user_id, nom, ligne1, ligne2, ville, code_postal, pays, téléphone
- **orders** : id, user_id, statut (`pending`/`paid`/`shipped`/`delivered`/`cancelled`), total, adresse_livraison_id, méthode_paiement (`card`/`mobile_money`), fournisseur_paiement (`stripe`/`cinetpay`/…), référence_transaction_externe, opérateur_mobile_money (`orange_money`/`mtn`/`moov`/`wave`, si applicable), created_at
- **order_items** : id, order_id, product_id, variant_id, quantité, prix_unitaire
- **reviews** (optionnel v2) : id, product_id, user_id, note, commentaire, created_at

Règles RLS essentielles :
- Un client ne lit/modifie que ses propres commandes, adresses, panier.
- Les produits/catégories sont en lecture publique, écriture réservée au rôle `admin`.
- Les commandes ne sont jamais modifiables côté client après paiement (seul le webhook Stripe via service role peut changer le statut).

---

## 5. Fonctionnalités (e-commerce complet)

### Côté client
- Page d'accueil : mise en avant produits phares, catégories, promotions
- Catalogue avec filtres (catégorie, prix, disponibilité) et tri (prix, nouveauté, popularité)
- Recherche produit (barre de recherche avec suggestions)
- Fiche produit : galerie images, description, prix, variantes (taille/couleur), avis, produits similaires
- Panier persistant (invité + connecté, fusion à la connexion)
- Wishlist / favoris
- Tunnel de commande : adresse → livraison → **choix du moyen de paiement (carte bancaire via Stripe ou Mobile Money via l'agrégateur)** → confirmation
  - Paiement carte : formulaire Stripe classique.
  - Paiement Mobile Money : sélection de l'opérateur (Orange Money, MTN, Moov, Wave selon disponibilité pays), saisie du numéro de téléphone, redirection vers la page de paiement hébergée par l'agrégateur (ou prompt USSD selon opérateur), puis retour sur Manhishop en attente de confirmation.
  - Tant que le webhook de confirmation n'est pas reçu, la commande reste en statut `pending` avec un écran "paiement en cours de vérification" (le paiement Mobile Money n'est pas toujours instantané).
- Compte client : historique commandes, suivi statut, gestion adresses, informations personnelles
- Notifications (email a minima ; push en option via PWA)

### Côté administration (back-office)
- Authentification admin séparée (rôle `admin` via RLS)
- Gestion catalogue : créer/modifier/supprimer produits, catégories, upload images, gestion stock
- Gestion commandes : liste, détail, changement de statut, export
- Tableau de bord simple : ventes du jour/semaine, produits en rupture, commandes en attente

---

## 6. UI/UX Design

### 6.1 Principes directeurs
- **Mobile-first strict** : conception d'abord sur viewport 375–414px, puis adaptation tablette/desktop.
- **Accessibilité WCAG 2.1 AA** : contraste suffisant, tailles de tap cible ≥ 44px, navigation clavier, attributs ARIA sur les composants interactifs (menu, carrousel, modales).
- **Performance perçue** : squelettes de chargement (skeletons) plutôt que spinners bruts, images en lazy-loading avec `next/image`, transitions courtes (150–250ms).
- **Confiance et clarté transactionnelle** : prix, frais de livraison et délais visibles avant le paiement, jamais de coût caché en dernière étape.

### 6.2 Design system

**Palette** :
- Couleur primaire (CTA, liens) et couleurs secondaires extraites du **logo Manhishop** fourni par le client — Claude Code doit générer la palette (primaire, secondaire, neutres) à partir des couleurs dominantes du logo.
- Neutres : blanc cassé (fond clair) / gris très foncé (fond sombre), gris foncé (texte principal en mode clair) / blanc cassé (texte principal en mode sombre), gris moyen (texte secondaire dans les deux modes).
- Sémantique (identique dans les deux thèmes, ajustée en luminosité) : vert (succès/stock dispo), rouge (erreur/rupture), orange (promotion).

**Mode clair / sombre** :
- Implémentation via `next-themes` + variables CSS (Tailwind `dark:` variant) — pas de duplication de composants, uniquement des tokens de couleur qui changent de valeur selon le thème.
- Deux jeux de tokens à définir dès la Phase 0 : `--background`, `--foreground`, `--surface`, `--border`, `--primary`, `--primary-foreground`, déclinés en version claire et sombre.
- Bascule manuelle accessible (icône soleil/lune) dans le header et dans le compte utilisateur ; valeur par défaut = préférence système (`prefers-color-scheme`) ; choix de l'utilisateur persisté (cookie ou localStorage) pour éviter le flash de thème au chargement.
- Tester chaque écran clé (section 6.4) dans les deux modes, en particulier les images produits sur fond sombre (éviter les cartes blanches qui tranchent trop).

**Typographie** :
- Une police sans-serif lisible (ex. Inter, Poppins ou General Sans) pour l'ensemble de l'UI.
- Échelle suggérée : 12 / 14 / 16 (base) / 20 / 24 / 32 px, ratio ~1.25.

**Espacement** : grille en base 4px (4, 8, 12, 16, 24, 32, 48) pour cohérence entre composants.

**Composants clés à standardiser** :
- Bouton primaire / secondaire / texte, avec états hover, focus, disabled, loading
- Card produit (image, nom, prix, badge promo, bouton ajout rapide au panier)
- Champ de formulaire (label, aide, erreur inline)
- Barre de navigation mobile (bottom tab bar : Accueil, Catalogue, Recherche, Panier, Compte)
- Bandeau de notification (succès ajout panier, erreur stock)

### 6.3 Parcours utilisateurs clés
1. **Découverte → achat** : Accueil → Catégorie → Fiche produit → Ajout panier → Panier → Checkout → Confirmation
2. **Retour client** : Connexion → Compte → Historique commandes → Détail suivi
3. **Achat invité** : Panier sans compte → Checkout → Création compte optionnelle post-paiement

### 6.4 Écrans à concevoir en priorité (wireframes texte)
- Accueil (hero, catégories, produits mis en avant)
- Liste catégorie/catalogue (grille produits + filtres)
- Fiche produit (galerie, infos, CTA sticky "Ajouter au panier" sur mobile)
- Panier (liste articles, quantités, total, CTA commander)
- Checkout (étapes : livraison → choix moyen de paiement carte/Mobile Money → détail opérateur si Mobile Money → récap)
- Confirmation de commande
- Espace compte (profil, commandes, adresses)
- Back-office : liste produits (tableau), formulaire produit, liste commandes

### 6.5 États à ne pas oublier
- Chargement (skeleton), vide (panier vide, aucun résultat de recherche), erreur (paiement refusé, rupture de stock), succès (confirmation visuelle claire).

### 6.6 Internationalisation (fr par défaut, en disponible)
- Librairie : **next-intl**, intégrée à l'App Router Next.js.
- Langue par défaut : **français** (`fr`) ; langue additionnelle : **anglais** (`en`). Architecture pensée pour ajouter facilement une 3e langue plus tard.
- Détection initiale de la langue du navigateur, avec possibilité de forcer via le sélecteur (drapeau ou libellé "FR / EN" dans le header), choix persisté (cookie).
- Tous les textes d'interface (boutons, labels, messages d'erreur, emails transactionnels) dans des fichiers de traduction (`messages/fr.json`, `messages/en.json`) — aucun texte en dur dans les composants.
- Le contenu produit (nom, description) reste géré côté back-office : prévoir dès le modèle de données (section 4) des champs traduisibles si le catalogue doit exister dans les deux langues (ex. `products.name_fr`, `products.name_en`, ou table `product_translations`). À trancher avec le client avant la Phase 1.
- URLs localisées si pertinent pour le SEO (`/fr/produit/...`, `/en/product/...`) ou langue gérée uniquement côté affichage — à décider en Phase 0.

---

## 7. Spécificités PWA

- **Manifest** : nom, icônes (192/512px + maskable), couleur de thème, `display: standalone`, orientation portrait par défaut.
- **Service worker (Serwist)** : cache des assets statiques et des pages de catalogue déjà visitées ; stratégie network-first pour les données dynamiques (stock, prix), cache-first pour les images/assets.
- **Mode hors-ligne** : afficher une page/état "vous êtes hors-ligne" gracieuse pour le panier et le catalogue déjà chargé ; pas de paiement possible hors-ligne (bloquer clairement avec message).
- **Installabilité** : bannière/bouton "Installer l'application" respectant les critères des navigateurs (HTTPS, manifest valide, service worker enregistré).
- **Notifications push** (optionnel v2) : suivi de commande via Web Push API.

---

## 8. Sécurité

- Row Level Security activée sur toutes les tables Supabase, testée table par table (lecture/écriture par rôle).
- Aucune clé secrète (Stripe secret key, clé API de l'agrégateur Mobile Money, Supabase service role key) exposée côté client — uniquement dans les routes API serverless / variables d'environnement Vercel.
- Validation des webhooks Stripe **et** des webhooks de l'agrégateur Mobile Money (vérification de signature/hash selon le fournisseur) avant mise à jour du statut de commande.
- Idempotence des webhooks : un même événement de confirmation (rejoué par l'agrégateur) ne doit pas créer de doublon de commande payée.
- Tester intégralement le parcours Mobile Money en mode sandbox/test fourni par l'agrégateur avant tout passage en clés réelles.
- Validation des entrées utilisateur côté serveur (formulaires, quantités, prix jamais recalculés côté client au paiement — toujours recalculés serveur pour éviter la manipulation de prix).
- Conformité RGPD : consentement cookies, politique de confidentialité, droit à l'export/suppression des données client.
- Rate limiting basique sur les routes sensibles (checkout, login) pour limiter les abus.

---

## 9. Performance & SEO

- Images produits optimisées (`next/image`, formats WebP/AVIF, tailles responsives).
- ISR (Incremental Static Regeneration) pour les pages catalogue/produit afin de limiter les appels DB tout en gardant les prix/stock à jour périodiquement.
- Métadonnées SEO par page produit (title, description, Open Graph, données structurées `Product` en JSON-LD pour le référencement e-commerce).
- Objectif Core Web Vitals : LCP < 2.5s, CLS < 0.1, INP < 200ms sur mobile milieu de gamme.

---

## 10. Structure de projet suggérée

```
manhishop/
├── app/
│   ├── [locale]/                   # routage i18n (fr/en) via next-intl
│   │   ├── (shop)/
│   │   │   ├── page.tsx            # Accueil
│   │   │   ├── catalogue/[category]/
│   │   │   ├── produit/[slug]/
│   │   │   ├── panier/
│   │   │   └── checkout/
│   │   ├── (account)/
│   │   │   ├── compte/
│   │   │   └── commandes/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   └── layout.tsx
│   └── api/
│       ├── checkout/card/route.ts
│       ├── checkout/mobile-money/route.ts
│       ├── webhooks/stripe/route.ts
│       └── webhooks/mobile-money/route.ts
├── components/
│   ├── ui/                         # boutons, cards, inputs (design system)
│   ├── shop/                       # composants métier (ProductCard, CartItem…)
│   ├── checkout/                   # PaymentMethodSelector, MobileMoneyForm…
│   ├── admin/
│   └── theme-toggle.tsx / language-switcher.tsx
├── lib/
│   ├── supabase/                   # clients server/browser
│   ├── stripe/
│   └── mobile-money/                # client agrégateur (CinetPay ou équivalent)
├── messages/
│   ├── fr.json                     # traductions françaises (défaut)
│   └── en.json                     # traductions anglaises
├── public/
│   ├── manifest.json
│   ├── logo/                       # logo Manhishop fourni par le client
│   └── icons/                      # icônes PWA générées à partir du logo
├── supabase/
│   └── migrations/                 # schéma SQL versionné
└── tests/
```

---

## 11. Plan de développement par phases

**Phase 0 — Setup** : init Next.js + Supabase + Vercel, configuration PWA de base, mise en place de next-intl (fr/en) et next-themes (clair/sombre), design system (tokens couleurs extraits du logo, typo, composants UI de base incluant sélecteur de langue et bascule de thème).

**Phase 1 — Catalogue** : modèle de données produits/catégories, pages catalogue et fiche produit, recherche/filtres.

**Phase 2 — Compte & panier** : auth Supabase, panier persistant, wishlist.

**Phase 3 — Paiement** : intégration Stripe Checkout (carte) + intégration agrégateur Mobile Money (CinetPay ou équivalent, en mode sandbox d'abord), sélecteur de moyen de paiement, webhooks de confirmation pour les deux, page de confirmation, emails transactionnels.

**Phase 4 — Compte client avancé** : historique commandes, suivi statut, gestion adresses.

**Phase 5 — Back-office admin** : CRUD produits/catégories, gestion commandes, dashboard simple.

**Phase 6 — PWA & polish** : service worker, installabilité, offline, performance, tests, SEO.

**Phase 7 — Tests & déploiement** : tests unitaires (composants critiques), tests e2e (parcours d'achat), CI/CD Vercel, recette finale.

---

## 12. Qualité & tests

- Tests unitaires sur la logique métier sensible (calcul de panier, total commande).
- Tests end-to-end (Playwright) sur le parcours critique : ajout panier → checkout → paiement test Stripe.
- Linting/formatage (ESLint + Prettier) et vérification TypeScript stricte.
- CI sur chaque pull request (build + tests) avant déploiement Vercel.

---

## 13. Déploiement

- Environnements séparés : `development` (local), `preview` (branches Vercel), `production`.
- Variables d'environnement gérées via Vercel (jamais commit de clés secrètes).
- Migrations Supabase versionnées et appliquées via CLI avant chaque déploiement de schéma.
- Mode test Stripe en preview, clés live uniquement en production.

---

## 14. Comment utiliser ce document avec Claude Code

Suggestion de prompt de démarrage à donner à Claude Code une fois ce document en main :

> « Voici le cahier des charges de Manhishop (fichier joint). Initialise le projet Next.js + Supabase + Stripe + PWA en suivant la Phase 0 et la structure de projet section 10. Mets en place le design system (section 6.2) avant tout composant métier. Avance phase par phase, et propose-moi une revue avant de passer à la phase suivante. »

Points à trancher avec le client final avant/pendant le développement (à ne pas laisser à l'agent de code) :
- Identité de marque définitive (logo, palette de couleurs, ton éditorial)
- Catégories de produits réelles et données initiales du catalogue
- Zones de livraison et grille tarifaire de livraison
- Choix définitif de l'agrégateur Mobile Money (CinetPay vs PayDunya vs autre) selon la validation du compte marchand et les pays réellement couverts au moment du lancement — à reconfirmer avec la documentation à jour du fournisseur
- Opérateurs Mobile Money à activer en priorité (Orange Money, MTN, Moov, Wave) selon le ou les pays de lancement
