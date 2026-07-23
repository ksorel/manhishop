/**
 * Client agrégateur Mobile Money (CinetPay par défaut — voir CLAUDE.md
 * pour PayDunya en repli). Implémentation complète prévue en Phase 3 :
 * création de paiement (page hébergée) + vérification de signature webhook.
 */
export const CINETPAY_CONFIG = {
  apiKey: process.env.CINETPAY_API_KEY ?? "",
  siteId: process.env.CINETPAY_SITE_ID ?? "",
  secretKey: process.env.CINETPAY_SECRET_KEY ?? "",
} as const;
