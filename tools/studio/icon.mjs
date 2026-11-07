#!/usr/bin/env node
// icon.mjs — prints Lucide icons (ISC licence, assets/icons/lucide) as inline SVG, ready to paste into a piece.
//
//   node tools/studio/icon.mjs database cloud users            → one <svg class="icon"> per name
//   node tools/studio/icon.mjs --find chart                    → names containing "chart"
//
// Inline SVG (not <img>) so the icon takes currentColor, can be drawn with S.draw(), and needs no file.
// Size it with font-size or width/height on the svg; stroke width comes from studio.css .icon (2).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve(import.meta.dirname, "..", "..", "assets", "icons", "lucide", "icons");
const args = process.argv.slice(2);
if (!args.length) { console.log("Usage: node tools/studio/icon.mjs <name…> | --find <word>"); process.exit(1); }
if (args[0] === "--find") {
  const w = (args[1] || "").toLowerCase();
  console.log(readdirSync(DIR).filter((f) => f.endsWith(".svg") && f.includes(w)).map((f) => f.slice(0, -4)).join("  "));
  process.exit(0);
}
for (const n of args) {
  const f = path.join(DIR, n + ".svg");
  if (!existsSync(f)) { console.error(`✗ no icon "${n}" — try: node tools/studio/icon.mjs --find ${n.split("-")[0]}`); continue; }
  const inner = readFileSync(f, "utf8").replace(/\r?\n/g, " ").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").replace(/\s+/g, " ").trim();
  console.log(`<svg class="icon" data-icon="${n}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`);
}
