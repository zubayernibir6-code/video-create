#!/usr/bin/env node
// hf-postassemble.mjs — make a HyperFrames project render OFFLINE and keep its hand-placed sound.
// Run it after every `assemble-index.mjs` (faceless-explainer, product-launch-video, pr-to-video,
// music-to-video) and after every `hyperframes add`:
//
//   node "E:/Video Create/tools/hf-postassemble.mjs" <project> [--dry-run]
//
// What it fixes (all seen in this workspace, CLAUDE.md §0b / §4g):
//  1. CDN GSAP <script> tags (jsdelivr/unpkg/cdnjs) → the vendored assets/js/gsap/<name>.min.js
//     (copies assets/js into the project if missing). Otherwise every render needs the internet.
//  2. Fonts: copies assets/fonts in if missing; expands `@import …fonts.css` (lint cannot see through it);
//     and writes inline @font-face rules into every HTML file for each workspace-pack family it uses but
//     doesn't declare. The 0.8.33 compiler fetches Google Fonts for undeclared families (~25 s, needs the
//     internet), and lint wants @font-face per file. Google Fonts <link>s are removed when every requested
//     family is in the local pack.
//  3. <audio> cues: assemble-index rewrites index.html and silently drops hand-placed <audio> elements
//     (all 28 SFX in hishab-khata-promo; lint still reported 0 errors). Every run records the cues in
//     <project>/.hf-audio-cues.json and re-inserts any recorded id that has gone missing. Delete that file
//     (or the cue from it) when you remove a sound on purpose.

import { cpSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const dry = args.includes("--dry-run");
const project = path.resolve(args.find((a) => !a.startsWith("--")) ?? "");
if (!existsSync(path.join(project, "index.html"))) {
  console.log("Usage: node hf-postassemble.mjs <HyperFrames project folder> [--dry-run]");
  process.exit(2);
}
const changes = [];
const warn = [];
const write = (f, s) => { if (!dry) writeFileSync(f, s); };

// ── 0. assets present in the project ───────────────────────────────────────────────────────────
for (const [sub, probe] of [["js", "gsap/gsap.min.js"], ["fonts", "fonts.css"]]) {
  if (!existsSync(path.join(project, "assets", sub, probe))) {
    if (!dry) cpSync(path.join(WORKSPACE, "assets", sub), path.join(project, "assets", sub), { recursive: true });
    changes.push(`copied assets/${sub} into the project`);
  }
}

// ── font pack: family → @font-face rules (paths relative to the project root) ──────────────────
const fontsCss = readFileSync(path.join(WORKSPACE, "assets", "fonts", "fonts.css"), "utf8");
const faces = new Map();
for (const rule of fontsCss.match(/@font-face\s*\{[^}]*\}/g) ?? []) {
  const fam = rule.match(/font-family:\s*"([^"]+)"/)?.[1];
  if (!fam) continue;
  const r = rule.replace(/url\("(?!assets\/fonts\/)/g, 'url("assets/fonts/').replace(/\s+/g, " ");
  faces.set(fam, [...(faces.get(fam) ?? []), r]);
}
const vendored = new Set(readdirSync(path.join(WORKSPACE, "assets", "js", "gsap")).map((f) => f.replace(/\.min\.js$/, "").toLowerCase()));
const gsapFile = (name) => readdirSync(path.join(WORKSPACE, "assets", "js", "gsap")).find((f) => f.replace(/\.min\.js$/, "").toLowerCase() === name.toLowerCase());

function htmlFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (["node_modules", "renders", "assets", "snapshots", ".hyperframes", "capture"].includes(f)) continue;
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (/\.html$/i.test(f)) out.push(p);
  }
  return out;
}

for (const file of htmlFiles(project)) {
  const rel = path.relative(project, file).replace(/\\/g, "/");
  let s = readFileSync(file, "utf8");
  const before = s;

  // 1. CDN GSAP → local
  s = s.replace(/<script\b[^>]*\bsrc="https?:\/\/[^"]*?gsap[^"]*?\/([A-Za-z0-9]+)(?:\.min)?\.js"[^>]*>\s*<\/script>/g, (tag, name) => {
    const local = vendored.has(name.toLowerCase()) ? gsapFile(name) : null;
    if (!local) { warn.push(`${rel}: no local copy of GSAP "${name}" — left the CDN tag`); return tag; }
    changes.push(`${rel}: CDN ${name} → assets/js/gsap/${local}`);
    return `<script src="assets/js/gsap/${local}"></script>`;
  });

  // 2a. Google Fonts links → removed when the pack has every family
  s = s.replace(/<link\b[^>]*href="https:\/\/fonts\.googleapis\.com\/css2?\?([^"]+)"[^>]*>\s*/g, (tag, q) => {
    const fams = [...decodeURIComponent(q).matchAll(/family=([^:&]+)/g)].map((m) => m[1].replace(/\+/g, " "));
    const missing = fams.filter((f) => !faces.has(f));
    if (missing.length) { warn.push(`${rel}: Google Fonts link kept — not in the local pack: ${missing.join(", ")}`); return tag; }
    changes.push(`${rel}: removed Google Fonts link (${fams.join(", ")} are local)`);
    return "";
  });

  // 2b. @import of a fonts.css → expanded below as inline @font-face
  s = s.replace(/@import\s+url\(\s*["']?[^"')]*fonts\.css["']?\s*\)\s*;?/g, () => { changes.push(`${rel}: expanded @import fonts.css`); return ""; });

  // 2c. inline @font-face for each pack family used but not declared in this file
  // Family names from CSS declarations (incl. quoted names and inline style="…" attributes) and GSAP fontFamily.
  const used = new Set();
  const addList = (list) => {
    for (const part of list.split(",")) {
      const name = part.trim().replace(/^["']+|["']+$/g, "").trim();
      if (name && !/[<>=]/.test(name)) used.add(name);
    }
  };
  // Inline style="…" attributes are read on their own, so an unterminated value can't run into the markup.
  const attrStyles = [...s.matchAll(/\bstyle\s*=\s*"([^"]*)"/gi), ...s.matchAll(/\bstyle\s*=\s*'([^']*)'/gi)].map((m) => m[1]);
  const cssOnly = s.replace(/\bstyle\s*=\s*"[^"]*"/gi, "").replace(/\bstyle\s*=\s*'[^']*'/gi, "");
  for (const src of [cssOnly, ...attrStyles]) for (const m of src.matchAll(/font-family\s*:\s*([^;}\n]+)/gi)) addList(m[1]);
  for (const m of s.matchAll(/fontFamily\s*:\s*["'`]([^"'`]+)["'`]/g)) addList(m[1]);
  const declared = new Set([...s.matchAll(/@font-face\s*\{[^}]*font-family:\s*["']?([^"';]+)/g)].map((m) => m[1].trim()));
  const need = [...used].filter((f) => faces.has(f) && !declared.has(f));
  const GENERIC = /^(sans-serif|serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|inherit|initial|unset|emoji|math|var\(.*|-apple-system|BlinkMacSystemFont)$/i;
  const foreign = [...used].filter((f) => f && !GENERIC.test(f) && !faces.has(f) && !declared.has(f));
  if (foreign.length) warn.push(`${rel}: uses ${foreign.join(", ")} — not in the local font pack, so the render fetches it from Google Fonts (needs internet). Swap to a pack font (assets/fonts/fonts.css) or vendor it.`);
  if (need.length) {
    const block = `\n    /* local font pack — inlined by tools/hf-postassemble.mjs */\n${need.flatMap((f) => faces.get(f)).map((r) => `    ${r}`).join("\n")}\n`;
    if (/<style\b[^>]*>/i.test(s)) s = s.replace(/<style\b[^>]*>/i, (t) => t + block);
    else if (/<head\b[^>]*>/i.test(s)) s = s.replace(/<head\b[^>]*>/i, (t) => `${t}\n  <style>${block}  </style>`);
    else if (/<template\b[^>]*>/i.test(s)) s = s.replace(/<template\b[^>]*>/i, (t) => `${t}\n  <style>${block}  </style>`);
    else warn.push(`${rel}: uses ${need.join(", ")} but has no <style>/<head>/<template> to put @font-face in`);
    changes.push(`${rel}: inlined @font-face for ${need.join(", ")}`);
  }

  if (s !== before) write(file, s);
}

// ── 3. <audio> cue guard (index.html) ──────────────────────────────────────────────────────────
const indexFile = path.join(project, "index.html");
let index = readFileSync(indexFile, "utf8");
const cueFile = path.join(project, ".hf-audio-cues.json");
const recorded = existsSync(cueFile) ? JSON.parse(readFileSync(cueFile, "utf8")) : {};
const current = {};
for (const m of index.matchAll(/<audio\b[^>]*\bid="([^"]+)"[^>]*>(?:\s*<\/audio>)?/g)) current[m[1]] = m[0];
const missing = Object.keys(recorded).filter((id) => !(id in current));
if (missing.length) {
  const root = index.match(/<[a-z]+\b[^>]*\bdata-composition-id="[^"]*"[^>]*>/is)?.[0];
  if (!root) warn.push(`index.html: ${missing.length} <audio> cue(s) missing, but no root element to put them back in`);
  else {
    index = index.replace(root, `${root}\n      <!-- restored by tools/hf-postassemble.mjs -->\n${missing.map((id) => `      ${recorded[id]}`).join("\n")}`);
    write(indexFile, index);
    changes.push(`index.html: restored ${missing.length} dropped <audio> cue(s): ${missing.join(", ")}`);
  }
}
const all = { ...recorded, ...current };
if (!dry && Object.keys(all).length) writeFileSync(cueFile, JSON.stringify(all, null, 2));

console.log(`${dry ? "[dry run] " : ""}hf-postassemble: ${path.basename(project)}`);
for (const c of changes) console.log(`  ✓ ${c}`);
for (const w of warn) console.log(`  ⚠ ${w}`);
if (!changes.length && !warn.length) console.log("  nothing to fix");
console.log(`  <audio> cues guarded: ${Object.keys(all).length}`);
