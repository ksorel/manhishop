// Validation serveur commune aux uploads d'image admin (produits,
// articles) — jamais confiance dans le seul `accept="image/*"` côté
// navigateur, trivialement contournable. Même principe que la validation
// du CV de candidature (lib/jobs/actions.ts).
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function assertValidImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("invalid_image_type");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("image_too_large");
  }
}
