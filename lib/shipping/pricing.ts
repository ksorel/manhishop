import type { ShippingRate } from "./types";

/** N'intervient que si aucun tarif n'est configuré pour un pays donné
 * (ne devrait normalement jamais arriver, les 6 pays cibles sont
 * pré-remplis) — évite une livraison gratuite par accident. */
export const FALLBACK_SHIPPING_FEE_XOF = 2000;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Résout le tarif de livraison applicable : une ligne spécifique à la
 * ville (si elle existe et correspond) prime sur le tarif par défaut
 * du pays (city = null).
 */
export function resolveShippingFee(
  rates: ShippingRate[],
  country: string,
  city: string,
): number {
  const normalizedCountry = normalize(country);
  const normalizedCity = normalize(city);

  const cityMatch = rates.find(
    (rate) =>
      normalize(rate.country) === normalizedCountry &&
      rate.city !== null &&
      normalize(rate.city) === normalizedCity,
  );
  if (cityMatch) return cityMatch.fee;

  const countryDefault = rates.find(
    (rate) => normalize(rate.country) === normalizedCountry && rate.city === null,
  );
  if (countryDefault) return countryDefault.fee;

  return FALLBACK_SHIPPING_FEE_XOF;
}
