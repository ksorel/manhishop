import type { SizeGuideHeader } from "./types";

export interface SizeGuideTemplate {
  key: string;
  labelFr: string;
  labelEn: string;
  titleFr: string;
  titleEn: string;
  headers: SizeGuideHeader[];
  rows: string[][];
}

/** Tableaux de correspondance standards (type Zalando/grandes enseignes) —
 * point de départ pour l'admin, à ajuster/affiner ensuite si besoin. */
export const SIZE_GUIDE_TEMPLATES: SizeGuideTemplate[] = [
  {
    key: "clothing-women",
    labelFr: "Vêtements — Femme",
    labelEn: "Clothing — Women",
    titleFr: "Guide des tailles — Vêtements femme",
    titleEn: "Size guide — Women's clothing",
    headers: [
      { fr: "Taille", en: "Size" },
      { fr: "Tour de poitrine (cm)", en: "Chest (cm)" },
      { fr: "Tour de taille (cm)", en: "Waist (cm)" },
      { fr: "Tour de hanches (cm)", en: "Hips (cm)" },
    ],
    rows: [
      ["XS", "78-81", "58-61", "84-87"],
      ["S", "82-85", "62-65", "88-91"],
      ["M", "86-90", "66-70", "92-96"],
      ["L", "91-95", "71-75", "97-101"],
      ["XL", "96-101", "76-81", "102-107"],
      ["XXL", "102-108", "82-88", "108-114"],
    ],
  },
  {
    key: "clothing-men",
    labelFr: "Vêtements — Homme",
    labelEn: "Clothing — Men",
    titleFr: "Guide des tailles — Vêtements homme",
    titleEn: "Size guide — Men's clothing",
    headers: [
      { fr: "Taille", en: "Size" },
      { fr: "Tour de poitrine (cm)", en: "Chest (cm)" },
      { fr: "Tour de taille (cm)", en: "Waist (cm)" },
    ],
    rows: [
      ["XS", "84-88", "71-75"],
      ["S", "89-93", "76-80"],
      ["M", "94-98", "81-85"],
      ["L", "99-104", "86-91"],
      ["XL", "105-110", "92-97"],
      ["XXL", "111-117", "98-104"],
    ],
  },
  {
    key: "shoes-women",
    labelFr: "Chaussures — Femme",
    labelEn: "Shoes — Women",
    titleFr: "Guide des tailles — Chaussures femme",
    titleEn: "Size guide — Women's shoes",
    headers: [
      { fr: "EU", en: "EU" },
      { fr: "UK", en: "UK" },
      { fr: "US", en: "US" },
      { fr: "Longueur du pied (cm)", en: "Foot length (cm)" },
    ],
    rows: [
      ["36", "3.5", "5.5", "23"],
      ["37", "4", "6.5", "23.5"],
      ["38", "5", "7.5", "24.5"],
      ["39", "6", "8.5", "25"],
      ["40", "6.5", "9", "25.5"],
      ["41", "7.5", "10", "26.5"],
    ],
  },
  {
    key: "shoes-men",
    labelFr: "Chaussures — Homme",
    labelEn: "Shoes — Men",
    titleFr: "Guide des tailles — Chaussures homme",
    titleEn: "Size guide — Men's shoes",
    headers: [
      { fr: "EU", en: "EU" },
      { fr: "UK", en: "UK" },
      { fr: "US", en: "US" },
      { fr: "Longueur du pied (cm)", en: "Foot length (cm)" },
    ],
    rows: [
      ["40", "6.5", "7.5", "25.5"],
      ["41", "7.5", "8.5", "26.5"],
      ["42", "8", "9", "27"],
      ["43", "9", "10", "27.5"],
      ["44", "9.5", "10.5", "28.5"],
      ["45", "10.5", "11.5", "29"],
    ],
  },
];
