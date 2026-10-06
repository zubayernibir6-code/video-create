#!/usr/bin/env node
// fix-frame.mjs — check (and with --apply, repair) the frame.md design spec that the workflow skills'
// build-frame.mjs writes. Run it right after build-frame, before any frame is built:
//
//   node "E:/Video Create/tools/fix-frame.mjs" <project or frame.md> [--apply] [--body="Hind Siliguri"]
//
// Why: build-frame maps brand tokens onto preset roles mechanically. In this workspace it put the alert red on
// `paper-2` (a page surface) and the amber on `ink-soft` (secondary TEXT — 1.76:1, unreadable); it gives the
// reading text the display face (`bBody = nonMono[0]`, still true in the 2026-10-05 skills); and it can keep
// preset fonts that aren't in the local pack (DM Mono, Newsreader…), which the render fetches from the internet.
//
// Checks: ink and ink-soft must reach WCAG 4.5:1 on paper (ink-soft is mixed toward ink until it does);
// paper-2 must stay a surface (≤1.25:1 against paper, else it becomes paper with 6 % ink); reading-ramp
// fonts (body, body-lede, micro…, caption, label) must not be the display face; every fontFamily must exist in
// assets/fonts (others are mapped: mono → JetBrains Mono, serif → Tiro Bangla, display roles → Baloo Da 2,
// everything else → Hind Siliguri); and roles set in a Bengali font must have no positive tracking (the preset's
// tracked "micro" labels break the matra line). --apply writes the fixes, keeping the original once as frame.md.orig.

import { copyFileSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=") || true]; }));
let target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.log('Usage: node fix-frame.mjs <project folder | frame.md> [--apply] [--body="Hind Siliguri"]');
  process.exit(2);
}
target = path.resolve(target);
const file = existsSync(target) && statSync(target).isDirectory() ? path.join(target, "frame.md") : target;
if (!existsSync(file)) { console.error(`✗ No frame.md at ${file}`); process.exit(1); }
let md = readFileSync(file, "utf8");
const notes = [];

// ── colours ───────────────────────────────────────────────────────────────────────────────────
const hexRe = (key) => new RegExp(`^(\\s+${key}:\\s*")(#[0-9a-fA-F]{6})(")`, "m");
const get = (key) => md.match(hexRe(key))?.[2];
const set = (key, v) => { md = md.replace(hexRe(key), `$1${v}$3`); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => "#" + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, b, t) => hex(rgb(a).map((x, i) => x + (rgb(b)[i] - x) * t));
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const paper = get("paper"), ink = get("ink"), paper2 = get("paper-2"), inkSoft = get("ink-soft");
if (paper && ink) {
  const c = contrast(ink, paper);
  if (c < 4.5) notes.push(`⚠ ink ${ink} on paper ${paper} is only ${c.toFixed(2)}:1 (needs 4.5) — choose a darker ink by hand`);
  if (inkSoft && contrast(inkSoft, paper) < 4.5) {
    let t = 0.35, fixed = mix(ink, paper, t);
    while (contrast(fixed, paper) < 4.5 && t > 0) { t -= 0.05; fixed = mix(ink, paper, Math.max(t, 0)); }
    notes.push(`fix ink-soft ${inkSoft} (${contrast(inkSoft, paper).toFixed(2)}:1, unreadable as text) → ${fixed} (${contrast(fixed, paper).toFixed(2)}:1)`);
    set("ink-soft", fixed);
  }
  if (paper2 && contrast(paper2, paper) > 1.25) {
    const fixed = mix(paper, ink, 0.06);
    notes.push(`fix paper-2 ${paper2} (${contrast(paper2, paper).toFixed(2)}:1 against paper — that is an accent, not a surface) → ${fixed}`);
    set("paper-2", fixed);
  }
} else notes.push("⚠ no paper/ink colours found — colour checks skipped");

// ── fonts ─────────────────────────────────────────────────────────────────────────────────────
const pack = new Set([...readFileSync(path.join(WORKSPACE, "assets", "fonts", "fonts.css"), "utf8").matchAll(/font-family:\s*"([^"]+)"/g)].map((m) => m[1]));
const typoLine = /^(\s+)([a-z][a-z0-9-]*)(:\s*\{[^}\n]*fontFamily:\s*")([^"]+)(")/gm;
const entries = [...md.matchAll(typoLine)].map((m) => ({ key: m[2], family: m[4] }));
const isReading = (k) => /^(body|caption|micro|label|small|footnote|lede)/.test(k);
const isDisplay = (k) => /(display|headline|hero|title|numeral|quote|chapter)/.test(k);
const displayFam = entries.find((e) => isDisplay(e.key))?.family;
const bodyFont = flags.body || "Hind Siliguri";
const mapForeign = (fam, key) =>
  /mono|code|consol|courier/i.test(fam) || /mono/.test(key) ? "JetBrains Mono"
    : /serif|newsreader|garamond|times|georgia|playfair|merriweather|lora/i.test(fam) && !/sans/i.test(fam) ? "Tiro Bangla"
    : isDisplay(key) ? "Baloo Da 2" : bodyFont;
md = md.replace(typoLine, (all, ind, key, mid, fam, end) => {
  let to = fam;
  if (!pack.has(fam)) to = mapForeign(fam, key);
  if (isReading(key) && displayFam && to === displayFam && displayFam !== bodyFont) to = bodyFont;
  if (to !== fam) notes.push(`fix typography.${key}: "${fam}" → "${to}"${pack.has(fam) ? " (reading text must not use the display face)" : " (not in the local font pack)"}`);
  return `${ind}${key}${mid}${to}${end}`;
});
if (!entries.length) notes.push("⚠ no typography entries with fontFamily found — font checks skipped");

// ── Bengali takes no tracking ─────────────────────────────────────────────────────────────────
// Presets come from Latin design, where small tracked caps ("micro", 0.16em) read as labels. On Bengali
// the same spacing breaks the matra (headline) into pieces: "সং খ্যা য়". Negative display tracking is fine.
const fontsCss = readFileSync(path.join(WORKSPACE, "assets", "fonts", "fonts.css"), "utf8");
const bengaliFams = new Set([...fontsCss.matchAll(/@font-face\s*\{[^}]*?font-family:\s*"([^"]+)"[^}]*?url\(["']?[^)"']*bengali\//g)].map((m) => m[1]));
md = md.replace(/^(\s+)([a-z][a-z0-9-]*)(:\s*\{[^}\n]*fontFamily:\s*")([^"]+)("[^}\n]*tracking:\s*")([^"]+)(")/gm, (all, ind, key, a, fam, b, tr, c) => {
  if (!bengaliFams.has(fam) || !(parseFloat(tr) > 0)) return all;
  notes.push(`fix typography.${key}: tracking ${tr} → 0 (Bengali takes no letter-spacing: it breaks the matra line)`);
  return `${ind}${key}${a}${fam}${b}0${c}`;
});

// ── report / apply ────────────────────────────────────────────────────────────────────────────
const fixes = notes.filter((n) => n.startsWith("fix"));
console.log(`fix-frame: ${path.relative(process.cwd(), file) || file}`);
for (const n of notes) console.log(`  ${n.startsWith("fix") ? (flags.apply ? "✓" : "•") : ""} ${n}`);
if (!notes.length) console.log("  ✓ colours readable, surfaces calm, fonts local and in the right roles");
if (fixes.length && flags.apply) {
  if (!existsSync(`${file}.orig`)) copyFileSync(file, `${file}.orig`);
  writeFileSync(file, md);
  console.log(`  applied ${fixes.length} fix(es); original kept as ${path.basename(file)}.orig`);
} else if (fixes.length) console.log(`  ${fixes.length} fix(es) proposed — run again with --apply to write them`);
process.exit(notes.some((n) => n.startsWith("⚠")) ? 1 : 0);
