// Régénère les icônes PWA (public/icons/) à partir du logo (public/logo/).
// Usage : node scripts/generate-pwa-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "public/logo/manhishop.jpeg";
const OUT_DIR = "public/icons";
const BACKGROUND = "#fdfdfb";

async function generate(size, { maskable = false } = {}) {
  const suffix = maskable ? `icon-maskable-${size}` : `icon-${size}`;
  const target = `${OUT_DIR}/${suffix}.png`;

  if (maskable) {
    // Safe zone: contenu réduit à ~70% et centré, pour respecter le
    // "maskable icon" (les OS peuvent recadrer en cercle/rond de squircle).
    const contentSize = Math.round(size * 0.7);
    const content = await sharp(SOURCE)
      .resize(contentSize, contentSize, { fit: "contain", background: BACKGROUND })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BACKGROUND,
      },
    })
      .composite([{ input: content, gravity: "center" }])
      .png()
      .toFile(target);
  } else {
    await sharp(SOURCE)
      .resize(size, size, { fit: "contain", background: BACKGROUND })
      .png()
      .toFile(target);
  }

  console.log(`✓ ${target}`);
}

await mkdir(OUT_DIR, { recursive: true });
await generate(192);
await generate(512);
await generate(192, { maskable: true });
await generate(512, { maskable: true });
