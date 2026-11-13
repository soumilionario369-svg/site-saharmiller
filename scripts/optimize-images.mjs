// Derives optimized WebP + PNG-fallback files from assets/original (originals are never modified).
// Run: npm install && npm run optimize
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'assets/original/';
const OUT = 'assets/optimized/';
fs.mkdirSync(OUT, { recursive: true });

// alias -> exact source filename (punctuation / repeated spaces are intentional)
export const ASSETS = {
  'hero-transparent': 'Asset 01 A — Mockup 3D da capa principal fundo transparente.png', // real alpha channel
  'hero-portrait': 'Asset 01 A — Mockup 3D da capa principal.png',
  'hero-square': 'Asset 01 C — Mockup 3D da capa principal.png',
  'tablet-meal': 'Asset 02 — A Mockup do livro com páginas internas visíveis.png',
  'tablet-dessert': 'Asset 02 — B Mockup do livro com páginas internas visíveis.png',
  'preview-meal': 'Asset 03 — A Seis previews de páginas internas comida.png',
  'preview-dessert': 'Asset 03 — B - Seis previews de páginas internas sobremesas.png',
  'sarah-portrait': 'Asset 04 — Retrato da Sarah Miller.png',
  'meal-feature': 'Asset 05 — 1 Lemon-Oregano Chicken with Couscous & Zucchini.png',
  'dessert-feature': 'Asset 05 —  86 Strawberry Banana Nice Cream.png',
  'gallery-meal-1': 'Asset 05 —  028  Turkey Spinach Burgers with Sweet Potato Wedges.png',
  'gallery-meal-2': 'Asset 05 —  52 - Balsamic Pork Tenderloin with Broccoli & Couscous.png',
  'gallery-meal-3': 'Asset 05 — 62 - Cod in Tomato-Olive Sauce with Couscous.png',
  'gallery-dessert-1': 'Asset 05 —  87 Chocolate Frozen Yogurt.png',
  'gallery-dessert-2': 'Asset 05 —  96 Maple Cinnamon Baked Apples.png',
  'gallery-dessert-3': 'Asset 05 —  97 Mixed Berry Crisp.png',
};

// text-heavy images get higher WebP quality
const TEXTY = new Set(['hero-transparent', 'preview-meal', 'preview-dessert', 'tablet-meal', 'tablet-dessert', 'hero-portrait', 'hero-square']);
const WIDTHS = [480, 768, 1024];

for (const [alias, file] of Object.entries(ASSETS)) {
  const src = SRC + file;
  if (!fs.existsSync(src)) throw new Error('Missing source asset: ' + file);
  const meta = await sharp(src).metadata();
  const q = TEXTY.has(alias) ? 90 : 80;
  const widths = [...new Set(WIDTHS.filter((w) => w < meta.width).concat(meta.width))];
  for (const w of widths) {
    const img = sharp(src).resize({ width: w, withoutEnlargement: true });
    await img.clone().webp({ quality: q, effort: 5 }).toFile(`${OUT}${alias}-${w}.webp`);
  }
  // compatible fallback: PNG for images with alpha, JPEG for photos
  if (meta.hasAlpha) { await sharp(src).png({ compressionLevel: 9, palette: false }).toFile(`${OUT}${alias}.png`); console.log(alias, 'alpha PNG fallback'); continue; }
  await sharp(src).jpeg({ quality: TEXTY.has(alias) ? 90 : 82, mozjpeg: true }).toFile(`${OUT}${alias}.jpg`);
  console.log(alias, meta.width + 'x' + meta.height, '->', widths.join(','));
}
