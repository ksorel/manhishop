import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Pages liées à l'authentification, au compte ou à l'admin : jamais de
// cache (données propres à l'utilisateur / protection d'accès). Sans
// cette règle, le service worker pouvait reservir une page /admin déjà
// visitée sans repasser par la vérification serveur du rôle.
const SENSITIVE_PATH_SEGMENTS = [
  "/admin",
  "/compte",
  "/connexion",
  "/inscription",
  "/panier",
  "/checkout",
  "/commandes",
  "/adresses",
  "/favoris",
  "/confirmation",
];

const noCacheForSensitivePages: RuntimeCaching = {
  matcher: ({ request, url }) =>
    request.mode === "navigate" &&
    SENSITIVE_PATH_SEGMENTS.some((segment) => url.pathname.includes(segment)),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // Network-first pour les données dynamiques (stock/prix), cache-first
  // pour les images/assets — comportement par défaut de Serwist. La
  // règle ci-dessus est évaluée en premier et prend le pas dessus pour
  // les pages sensibles.
  runtimeCaching: [noCacheForSensitivePages, ...defaultCache],
});

serwist.addEventListeners();
