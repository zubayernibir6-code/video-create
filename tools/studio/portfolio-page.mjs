#!/usr/bin/env node
// portfolio-page.mjs — the studio portfolio as one static web page: every rendered piece grouped by catalog family,
// with its CODE, name, what it is, who it is for and the price range (Motion Studio kit v1, 2026-11-07).
//
//   node tools/studio/portfolio-page.mjs [--name="Talha Zubayer"] [--out=renders/portfolio/site]
//
// Writes <out>/index.html + <out>/media/<CODE>_<Brand>.mp4 (web copies: 1280 px, H.264 CRF 25, faststart, about
// 1/5 of the master's size) + <out>/media/<CODE>_<Brand>.jpg posters (the frame at the piece's reel start + 1 s).
// The masters stay in renders/portfolio/. The folder is self-contained: open index.html in a browser, zip it, or
// deploy it as a static site (Vercel, Netlify, GitHub Pages) — deploying is Talha's decision (CLAUDE.md §0).
// Skips pieces that are not rendered and lists them. Re-run after new renders (existing web copies are reused when
// newer than the master).

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const NAME = opt("name", "Talha Zubayer");
const OUT = path.resolve(WS, opt("out", "renders/portfolio/site"));
const MEDIA = path.join(OUT, "media");
mkdirSync(MEDIA, { recursive: true });
const cat = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const mt = (f) => (existsSync(f) ? statSync(f).mtimeMs : 0);
const ff = (a) => spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { encoding: "utf8" });

const shown = [], missing = [];
for (const s of cat.services) {
  if (!s.sample?.brand) continue;
  const nice = `${s.code}_${s.sample.brand.replace(/[^A-Za-z0-9]+/g, "")}`;
  const master = path.join(WS, "renders", "portfolio", `${nice}.mp4`);
  if (!existsSync(master)) { missing.push(s.code); continue; }
  const web = path.join(MEDIA, `${nice}.mp4`), poster = path.join(MEDIA, `${nice}.jpg`);
  let reelFrom = 1;
  const pj = path.join(WS, "projects", s.sample.project || "", "piece.json");
  if (s.sample.project && existsSync(pj)) { try { reelFrom = (JSON.parse(readFileSync(pj, "utf8")).reel?.from ?? 0) + 1; } catch {} }
  if (mt(web) < mt(master)) {
    const r = ff(["-i", master, "-vf", "scale='min(1280,iw)':-2:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", web]);
    if (r.status !== 0) { console.error(`✗ ${nice}: web copy failed ${r.stderr.slice(-200)}`); continue; }
  }
  if (mt(poster) < mt(master)) ff(["-ss", String(reelFrom), "-i", master, "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2", "-q:v", "3", poster]);
  shown.push({ s, nice, mb: (statSync(web).size / 1e6).toFixed(1) });
}

const fams = cat.families.map((f) => ({ f, items: shown.filter((x) => x.s.family === f.id) })).filter((x) => x.items.length);
const price = (p) => (p ? `from $${p.starter.toLocaleString("en-US")}` : "");
const card = ({ s, nice }) => `
      <article class="card">
        <video controls preload="none" playsinline poster="media/${nice}.jpg" src="media/${nice}.mp4"></video>
        <div class="meta">
          <div class="top"><span class="code">${esc(s.code)}</span><span class="nm">${esc(s.name)}</span><span class="pr">${esc(price(s.price))}</span></div>
          <p>${esc(s.what)}</p>
          <p class="for">${esc(s.bestFor || "")}</p>
        </div>
      </article>`;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(NAME)} — Motion Design</title>
<style>
  :root { --bg: #08090c; --card: #111319; --ink: #f2f4f8; --ink2: #a8afbd; --line: rgba(255,255,255,.09); --accent: #ffb547; }
  @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { --bg: #f6f6f3; --card: #ffffff; --ink: #121318; --ink2: #5b6170; --line: rgba(0,0,0,.08); --accent: #b86e00; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, sans-serif; }
  header { max-width: 1240px; margin: 0 auto; padding: 72px 16px 24px; }
  header h1 { font-size: clamp(36px, 6vw, 72px); letter-spacing: -0.04em; line-height: 1; margin: 0 0 16px; }
  header p { color: var(--ink2); max-width: 720px; font-size: 18px; margin: 0; }
  .how { margin-top: 22px; display: inline-block; padding: 10px 16px; border: 1px solid var(--line); border-radius: 999px; color: var(--ink2); font-size: 14px; }
  .how b { color: var(--accent); }
  section { max-width: 1240px; margin: 0 auto; padding: 32px 16px; }
  section h2 { font-size: 22px; letter-spacing: -0.01em; margin: 0 0 16px; border-top: 1px solid var(--line); padding-top: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: 20px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
  .card video { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; background: #000; }
  .meta { padding: 16px 18px 18px; }
  .top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .code { font-family: ui-monospace, "Geist Mono", "JetBrains Mono", monospace; color: var(--accent); font-weight: 700; }
  .nm { font-weight: 650; }
  .pr { margin-left: auto; color: var(--ink2); font-size: 14px; }
  .meta p { margin: 8px 0 0; color: var(--ink2); font-size: 14px; }
  .meta p.for { font-size: 13px; opacity: .85; }
  footer { max-width: 1240px; margin: 0 auto; padding: 32px 16px 64px; color: var(--ink2); font-size: 13px; border-top: 1px solid var(--line); }
</style>
</head>
<body>
<header>
  <h1>${esc(NAME)}<br />Motion Design</h1>
  <p>Launch films, product demos, explainers, data stories and brand motion for SaaS, AI and fintech teams. Every format and captions included, first draft in 3–7 working days.</p>
  <div class="how">Pick a <b>code</b> below, send your brief, get a fixed price.</div>
</header>
${fams.map(({ f, items }) => `<section>
  <h2>${esc(f.name)}</h2>
  <div class="grid">${items.map(card).join("")}
  </div>
</section>`).join("\n")}
<footer>All samples are concept work for fictional brands, made to show each style. Prices are starting points for a standard scope.</footer>
</body>
</html>
`;
writeFileSync(path.join(OUT, "index.html"), html);
const total = shown.reduce((a, x) => a + +x.mb, 0).toFixed(1);
console.log(`✓ ${path.join(OUT, "index.html")} — ${shown.length} pieces in ${fams.length} families, web copies ${total} MB${missing.length ? `\n⚠ not rendered yet: ${missing.join(", ")}` : ""}`);
