// Generates PWA/app icons from an inline SVG (no font dependency).
// Run from apps/web:  node scripts/generate-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#1f7a5c"/>
  <path d="M256 104a120 120 0 0 1 120 120c0 90-120 224-120 224S136 314 136 224A120 120 0 0 1 256 104z" fill="#ffffff"/>
  <circle cx="256" cy="222" r="48" fill="#1f7a5c"/>
</svg>`;

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-icon-180.png", size: 180 },
];

for (const { name, size } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(publicDir, name));
  console.log("wrote", name);
}
