// icons.mjs — line icons for tools/explainer from the workspace's own Lucide set (assets/icons/lucide/icons, ISC
// licence; STYLE §৯: icons = Lucide). icon(name, size, color) inlines the SVG. Ticks, crosses and arrows are SVG here
// because the pack fonts have no ✓ / ✗ / → glyphs (CLAUDE.md §0d rule 11). Short names map to Lucide file names.
import { readFileSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve(import.meta.dirname, "..", "..", "assets", "icons", "lucide", "icons");
const ALIAS = { arrow: "arrow-right", file: "file-text", book: "book-open", shield: "shield-alert", message: "message-square" };
const cache = new Map();

export function icon(name, size = 32, color = "currentColor", extra = "") {
  const file = ALIAS[name] ?? name;
  if (!cache.has(file)) {
    const svg = readFileSync(path.join(DIR, `${file}.svg`), "utf8");
    cache.set(file, svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim());
  }
  return `<svg ${extra} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cache.get(file)}</svg>`;
}
