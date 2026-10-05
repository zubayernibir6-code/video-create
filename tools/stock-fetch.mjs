#!/usr/bin/env node
// stock-fetch.mjs — find and download stock photos or b-roll video clips that are safe for videos you sell.
//
//   node "E:/Video Create/tools/stock-fetch.mjs" "<search words>" [--type=photo|video] [--count=3]
//        [--provider=auto|openverse|pexels|pixabay] [--orientation=landscape|portrait|square] [--out=<folder>]
//
// Providers:
//   openverse  no key needed — PHOTOS only, restricted to CC0 / Public Domain photographs (no attribution,
//              commercial OK). Mostly Flickr/Wikimedia/rawpixel, so quality varies; the keyed providers are better.
//   pexels     free key in E:/Video Create/.env.local as PEXELS_API_KEY=…  (photos AND video, Pexels License:
//              commercial OK, no attribution required; credit the photographer when you can).
//   pixabay    free key in .env.local as PIXABAY_API_KEY=…  (photos AND video, Pixabay Content License).
//   auto       pexels → pixabay → openverse, using whatever keys exist.
// Every file gets a sidecar <file>.json (source page, author, licence, query, date) and a line in
// <out>/CREDITS.md, so the licence trail travels with the asset. Keys are never printed.
// ⚠ Free-licence photos come with NO model release: avoid clearly recognisable people in advertising.
// Default output: assets/images (photos) or assets/footage (video) of the workspace.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WORKSPACE = path.resolve(import.meta.dirname, "..");

// fail() throws instead of calling process.exit(): exiting while fetch sockets are still open trips a libuv
// assertion on Windows ("!(handle->flags & UV_HANDLE_CLOSING)", seen 2026-10-06).
class Fail extends Error {}
function fail(msg) {
  throw new Fail(msg);
}

function loadEnv() {
  const env = {};
  const f = path.join(WORKSPACE, ".env.local");
  if (!existsSync(f)) return env;
  for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*?)"?\s*(#.*)?$/);
    if (m && m[2]) env[m[1]] = m[2];
  }
  return env;
}

async function getJson(url, headers = {}) {
  const r = await fetch(url, { headers: { "User-Agent": "VideoCreate-local/1.0", ...headers } });
  if (!r.ok) throw new Error(`HTTP ${r.status} from ${new URL(url).host}`);
  return r.json();
}

function sniff(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return "jpg";
  if (b[0] === 0x89 && b.toString("latin1", 1, 4) === "PNG") return "png";
  if (b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP") return "webp";
  if (b.toString("latin1", 4, 8) === "ftyp") return "mp4";
  return null;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";

// Each provider returns [{ url, ext, author, page, licence, width, height, id }]
const PROVIDERS = {
  async openverse(q, { type, count, orientation }) {
    if (type !== "photo") throw new Error("Openverse has no video — use pexels or pixabay for b-roll");
    const aspect = { landscape: "wide", portrait: "tall", square: "square" }[orientation] ?? "";
    // Photographs only (category filter), at least 1000 px wide (Flickr images arrive at 1024 px), in Openverse's
    // relevance order, from up to two pages of 20. Largest-first was tried and rejected: the biggest CC0 files are
    // mostly old museum scans, while the 1024 px Flickr results are modern and more relevant (2026-10-06).
    const found = [];
    for (let page = 1; page <= 2 && found.length < count; page++) {
      const j = await getJson(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&category=photograph&page_size=20&page=${page}${aspect ? `&aspect_ratio=${aspect}` : ""}`);
      found.push(...j.results.filter((x) => (x.width ?? 0) >= 1000));
      if (j.page_count <= page) break;
    }
    return found
      .slice(0, count)
      .map((x) => ({ url: x.url, ext: (x.filetype || path.extname(new URL(x.url).pathname).slice(1) || "jpg").toLowerCase(), author: x.creator || "unknown", page: x.foreign_landing_url, licence: `${x.license.toUpperCase()} ${x.license_version ?? ""} (via Openverse, ${x.source})`.trim(), width: x.width, height: x.height, id: x.id }));
  },
  async pexels(q, { type, count, orientation }, key) {
    const h = { Authorization: key };
    if (type === "photo") {
      const j = await getJson(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${count}${orientation ? `&orientation=${orientation}` : ""}`, h);
      return j.photos.map((p) => ({ url: p.src.large2x || p.src.original, ext: "jpg", author: p.photographer, page: p.url, licence: "Pexels License", width: p.width, height: p.height, id: p.id }));
    }
    const j = await getJson(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${count}${orientation ? `&orientation=${orientation}` : ""}`, h);
    return j.videos.map((v) => {
      const files = v.video_files.filter((f) => f.file_type === "video/mp4" && f.width && f.width <= 1920).sort((a, b) => b.width - a.width);
      const f = files[0] ?? v.video_files[0];
      return { url: f.link, ext: "mp4", author: v.user?.name ?? "unknown", page: v.url, licence: "Pexels License", width: f.width, height: f.height, id: v.id };
    });
  },
  async pixabay(q, { type, count, orientation }, key) {
    const n = Math.max(3, count); // the API minimum is 3
    if (type === "photo") {
      const j = await getJson(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(q)}&image_type=photo&per_page=${n}${orientation === "portrait" ? "&orientation=vertical" : orientation === "landscape" ? "&orientation=horizontal" : ""}`);
      return j.hits.slice(0, count).map((h) => ({ url: h.largeImageURL, ext: path.extname(new URL(h.largeImageURL).pathname).slice(1) || "jpg", author: h.user, page: h.pageURL, licence: "Pixabay Content License", width: h.imageWidth, height: h.imageHeight, id: h.id }));
    }
    const j = await getJson(`https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(q)}&per_page=${n}`);
    return j.hits.slice(0, count).map((h) => {
      const v = h.videos.large?.url ? h.videos.large : h.videos.medium;
      return { url: v.url, ext: "mp4", author: h.user, page: h.pageURL, licence: "Pixabay Content License", width: v.width, height: v.height, id: h.id };
    });
  },
};

async function main() {
  const args = process.argv.slice(2);
  const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=")]; }));
  const query = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!query) {
    console.log(`Usage: node stock-fetch.mjs "<search words>" [--type=photo|video] [--count=3]
         [--provider=auto|openverse|pexels|pixabay] [--orientation=landscape|portrait|square] [--out=<folder>]`);
    process.exit(2);
  }
  const type = flags.type === "video" ? "video" : "photo";
  const count = Math.min(10, Math.max(1, Number(flags.count ?? 3)));
  const orientation = flags.orientation || undefined;
  const env = { ...loadEnv(), ...process.env };
  const keys = { pexels: env.PEXELS_API_KEY, pixabay: env.PIXABAY_API_KEY, openverse: "none-needed" };
  let order = flags.provider && flags.provider !== "auto" ? [flags.provider] : ["pexels", "pixabay", "openverse"];
  order = order.filter((p) => {
    if (!PROVIDERS[p]) fail(`Unknown provider "${p}".`);
    return keys[p] && !(p === "openverse" && type === "video");
  });
  if (!order.length) {
    fail(type === "video"
      ? "Video clips need a free key: put PEXELS_API_KEY=… or PIXABAY_API_KEY=… in E:/Video Create/.env.local (see START-HERE.md §16)."
      : `No provider available for "${flags.provider}" — is its key in .env.local?`);
  }

  const outDir = path.resolve(flags.out ?? path.join(WORKSPACE, "assets", type === "video" ? "footage" : "images"));
  mkdirSync(outDir, { recursive: true });

  let items = [], used = null;
  for (const p of order) {
    try {
      items = await PROVIDERS[p](query, { type, count, orientation }, keys[p]);
      if (items.length) { used = p; break; }
      console.log(`  ${p}: nothing found`);
    } catch (e) {
      console.log(`  ${p}: ${e.message}`);
    }
  }
  if (!items.length) fail(`No ${type}s found for "${query}".`);

  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; // local date, not UTC
  let n = 0;
  for (const it of items) {
    let file = path.join(outDir, `${slug(query)}-${used}-${it.id}.${it.ext}`);
    if (existsSync(file)) { console.log(`  already have ${path.basename(file)}`); continue; }
    const r = await fetch(it.url, { headers: { "User-Agent": "VideoCreate-local/1.0" } });
    if (!r.ok) { console.log(`  skip ${it.id}: HTTP ${r.status}`); continue; }
    const data = Buffer.from(await r.arrayBuffer());
    // Trust the bytes, not the URL: rawpixel serves WebP under a .jpg name.
    const real = sniff(data);
    if (real && real !== it.ext) file = file.replace(/\.[a-z0-9]+$/i, `.${real}`);
    writeFileSync(file, data);
    const meta = { file: path.basename(file), provider: used, query, author: it.author, source_page: it.page, licence: it.licence, width: it.width, height: it.height, downloaded: stamp };
    writeFileSync(`${file}.json`, JSON.stringify(meta, null, 2));
    appendFileSync(path.join(outDir, "CREDITS.md"), `- \`${meta.file}\` — ${it.author}, ${it.page} — ${it.licence} (${stamp})\n`);
    const small = type === "photo" && Math.max(it.width, it.height) < 1920 ? "  (smaller than 1080p: use in a panel or with a slow zoom, not full-screen)" : "";
    console.log(`  ✓ ${path.basename(file)}  ${it.width}x${it.height}  by ${it.author}  [${it.licence}]${small}`);
    n++;
  }
  console.log(`\n${n} ${type}(s) from ${used} → ${outDir}`);
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}`);
  if (!(e instanceof Fail)) console.error(e.stack);
  process.exitCode = 1;
});
