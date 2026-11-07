#!/usr/bin/env node
// render-queue.mjs — renders Motion Studio pieces ONE AT A TIME (the laptop holds one render: RAM ~3 GB, C: temp)
// and collects the finished masters into renders/portfolio/ with their catalog names (kit v1, 2026-11-07).
//
//   node tools/studio/render-queue.mjs <project> [<project> …] [--quality=high] [--force]
//   node tools/studio/render-queue.mjs --portfolio          (every catalog sample whose project exists)
//
// For each project: sound.mjs (fresh audio tags) → finish.mjs --release --quality=high (check, design-lint,
// render, −14 LUFS, QC, thumbnail, GIF) through tools/studio/slot.mjs "render" 1 → copy the master to
// renders/portfolio/<CODE>_<Brand>.mp4 (+ -thumb.jpg) → append the result to renders/portfolio/queue.json.
// A project whose newest render is newer than its index.html + piece.json is skipped unless --force.
// Start it detached for a batch (Bash run_in_background / Start-Process); read queue.json once at the end.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const catalog = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
let projects = args.filter((a) => !a.startsWith("--"));
if (args.includes("--portfolio")) projects = catalog.services.map((s) => s.sample && s.sample.project).filter((p) => p && p.startsWith("pf-") && existsSync(path.join(WS, "projects", p)));
if (!projects.length) { console.log("Usage: node tools/studio/render-queue.mjs <project…> | --portfolio [--quality=high] [--force]"); process.exit(1); }
const OUT = path.join(WS, "renders", "portfolio");
mkdirSync(OUT, { recursive: true });
const logFile = path.join(OUT, "queue.json");
const log = existsSync(logFile) ? JSON.parse(readFileSync(logFile, "utf8")) : [];
const quality = opt("quality", "high");
const mtime = (f) => (existsSync(f) ? statSync(f).mtimeMs : 0);

for (const p of projects) {
  const dir = path.join(WS, "projects", p);
  if (!existsSync(dir)) { console.error(`✗ ${p}: no such project`); continue; }
  const piece = existsSync(path.join(dir, "piece.json")) ? JSON.parse(readFileSync(path.join(dir, "piece.json"), "utf8")) : { code: p, brand: p };
  const rdir = path.join(WS, "renders", p);
  const newest = existsSync(rdir) ? readdirSync(rdir).filter((d) => /^\d{4}-\d\d-\d\d_\d{4}$/.test(d)).sort().pop() : null;
  const srcTime = Math.max(mtime(path.join(dir, "index.html")), mtime(path.join(dir, "piece.json")));
  if (newest && !args.includes("--force") && mtime(path.join(rdir, newest, `${p}.mp4`)) > srcTime) { console.log(`= ${p}: render ${newest} is newer than the sources — skipped (--force to redo)`); continue; }
  const t0 = Date.now();
  console.log(`▶ ${p} (${piece.code} ${piece.brand}) — ${new Date().toTimeString().slice(0, 5)}`);
  if (existsSync(path.join(dir, "piece.json"))) {
    const s = spawnSync(process.execPath, [path.join(import.meta.dirname, "sound.mjs"), dir], { encoding: "utf8" });
    process.stdout.write(s.stdout || ""); process.stderr.write(s.stderr || "");
    if (s.status !== 0) { log.push({ project: p, ok: false, step: "sound", when: new Date().toISOString() }); writeFileSync(logFile, JSON.stringify(log, null, 1)); continue; }
  }
  const r = spawnSync(process.execPath, [path.join(import.meta.dirname, "slot.mjs"), "render", "1", "--", process.execPath, path.join(WS, "tools", "finish.mjs"), dir, `--quality=${quality}`, "--release"], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/✓ DONE[^\n]*\n\s*(.+renders[\\/][^\r\n]+)/);
  const folder = m ? m[1].trim() : null;
  const master = folder ? path.join(folder, `${p}.mp4`) : null;
  const entry = { project: p, code: piece.code, brand: piece.brand, ok: r.status === 0 && !!master && existsSync(master), seconds: Math.round((Date.now() - t0) / 1000), when: new Date().toISOString() };
  if (entry.ok) {
    const nice = `${piece.code}_${String(piece.brand).replace(/[^A-Za-z0-9]+/g, "")}`;
    copyFileSync(master, path.join(OUT, `${nice}.mp4`));
    const thumb = path.join(folder, `${p}-thumb.jpg`);
    if (existsSync(thumb)) copyFileSync(thumb, path.join(OUT, `${nice}-thumb.jpg`));
    try { const q = JSON.parse(readFileSync(path.join(folder, "qc.json"), "utf8")); entry.qc = (q.master?.checks || []).filter((c) => c.level !== "PASS").map((c) => `${c.level} ${c.name}: ${c.value ?? ""}`); entry.lufs = q.loudness?.after; } catch {}
    entry.file = path.join(OUT, `${nice}.mp4`);
    console.log(`✓ ${p} → ${entry.file}  (${entry.seconds} s)${entry.qc?.length ? "  " + entry.qc.join("; ") : ""}`);
  } else {
    entry.tail = out.slice(-1500);
    console.error(`✗ ${p} failed after ${entry.seconds} s\n${out.slice(-1200)}`);
  }
  log.push(entry);
  writeFileSync(logFile, JSON.stringify(log, null, 1));
}
console.log("queue done");
