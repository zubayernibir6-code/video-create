#!/usr/bin/env node
// check.mjs — every check a Motion Studio piece must pass before it may be rendered (kit v1, 2026-11-07).
//
//   node tools/studio/check.mjs projects/<piece> [--at=0.5,2.4,6] [--every=1.5] [--no-snap] [--slots=2]
//
// 1. Studio static rules on index.html (the traps that cost runs — CLAUDE.md §0d/§0i, R3 research):
//      no network URLs (CDN scripts/fonts break determinism and offline renders), no Math.random / Date /
//      performance.now, the timeline registered in the page, S.done() called, root size/duration = piece.json,
//      tl.from() (use fromTo), <br> inside text, a font-size under 24 px on text, an unquoted multi-word or
//      digit font family name.
// 2. `npx hyperframes check` (lint + runtime + layout + motion + contrast). studio.js guard notes (linear ease,
//      camera not at rest, > 3 flashes/s, timeline past the end) arrive as console_warning lines here.
// 3. `node tools/design-lint.mjs` (sizes, overlaps, safe zones, orphan words, font fallbacks).
// 4. Snapshots at --at times (or every --every s, default ~12 frames over the piece) → snapshots/ + the
//      contact sheet snapshots/contact-sheet.jpg. LOOK at it: no checker judges taste.
// Heavy steps (2, 4) go through tools/studio/slot.mjs "chrome" so parallel agents never start more Chromes than
// the machine holds (--slots, default 2 on win32, 3 elsewhere).
// Exit 1 on any ERROR (static or hyperframes check). Warnings print but do not fail.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const args = process.argv.slice(2);
const dirArg = args.find((a) => !a.startsWith("--"));
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (!dirArg) { console.log("Usage: node tools/studio/check.mjs projects/<piece> [--at=t1,t2] [--every=s] [--no-snap]"); process.exit(1); }
const dir = path.resolve(dirArg);
const html = readFileSync(path.join(dir, "index.html"), "utf8");
const piece = existsSync(path.join(dir, "piece.json")) ? JSON.parse(readFileSync(path.join(dir, "piece.json"), "utf8")) : null;
const slots = opt("slots", process.platform === "win32" ? "2" : "3");
const errors = [], warns = [];

// ---------- 1. static rules
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
const noComments = html.replace(/<!--[\s\S]*?-->/g, "");
for (const m of noComments.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']|url\(\s*["']?(https?:\/\/[^)"']+)/g)) {
  const u = m[1] || m[2];
  if (!/hyperframes\.heygen\.com\/schema/.test(u)) errors.push(`network URL in the page: ${u} — copy the file into assets/ (renders must not fetch)`);
}
for (const m of scripts.matchAll(/from\s+["'](https?:\/\/[^"']+)["']|import\(\s*["'](https?:\/\/[^"']+)["']/g)) errors.push(`network import: ${m[1] || m[2]} — use the local import map (assets/js/three)`);
if (/Math\.random\s*\(/.test(scripts)) errors.push("Math.random() in the page — use S.rnd() (seeded)");
if (/Date\.now\s*\(|new Date\s*\(|performance\.now\s*\(/.test(scripts)) errors.push("a clock (Date / performance.now) in the page — every state must come from the timeline time");
if (!/window\.__timelines\s*\[\s*["']main["']\s*\]\s*=/.test(scripts)) errors.push('the timeline is not registered in the page: end with  window.__timelines["main"] = S.done().tl;');
if (/\bS\.init\b|Studio\.init/.test(scripts) && !/S\.done\s*\(/.test(scripts)) errors.push("Studio.init() without S.done() — the guards never run");
if (/\btl\.from\s*\(/.test(scripts)) warns.push("tl.from() found — use tl.fromTo() (from() renders its start state early under seeking)");
// The HyperFrames runtime registers its own eases named spring / hold / wiggle / custom after load — a studio tween
// that names one of them silently plays the RUNTIME's version ("spring" became linear in every render, 2026-11-07).
for (const name of ["spring", "hold", "wiggle", "custom"]) {
  const re = new RegExp(`(["'])${name}\\1`);
  const code = scripts.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  if (re.test(code)) errors.push(`ease name "${name}" is taken by the HyperFrames runtime (it plays the runtime's curve, "spring" = linear) — use "houseSpring" / springSoft / springPop or pass a function`);
}
// Honesty (docs/studio/QUALITY.md, B): text a viewer could copy must not point at something real. CD1 showed
// `npm i -g kernel` (a real npm package) and its hero typed `kernel deploy`, the CLI command of Kernel, a real
// developer company (critic + builder, 2026-11-08). Portfolio pieces (pf-* or a "fictional" client line):
//   - an on-screen address with a real top-level domain → error (use <name>.example, reserved by RFC 2606);
//   - an install command that names a package → error, unless piece.json "honesty.checked" lists the name (you made it
//     up AND looked it up: `npm view <name>` 404, PyPI/Homebrew have none) — the reserved form is
//     `curl -fsSL <brand>.example/install | sh`;
//   - a fictional brand (piece.json concept: true) without "nameCheck" → warning: search "<brand> <industry>" and write what you found (a famous product of
//     the same kind with the same name is a rename, e.g. Kernel → Kerf).
// Client pieces get warnings only (their real domain is correct there).
{
  const portfolio = path.basename(dir).startsWith("pf-") || /fictional/i.test(String(piece?.brief?.client || ""));
  const flag = (msg) => (portfolio ? errors : warns).push(msg);
  const checked = new Set((piece?.honesty?.checked || []).map((s) => String(s).toLowerCase()));
  // what can reach the screen: the page's text nodes + string literals in its scripts (comments removed first, so an
  // apostrophe pair in a comment is not read as a string; literals that look like code — ( ) { } ; = — are skipped)
  const code = scripts.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1");
  const shown = [
    noComments.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " "),
    ...[...code.matchAll(/(["'`])((?:(?!\1)[^\\\n]|\\.){3,240})\1/g)].map((m) => m[2].replace(/\$\{[^}]*\}/g, " ")).filter((s) => !/[(){};=]/.test(s)),
  ].join("\n");
  const seen = new Set();
  for (const m of shown.matchAll(/(?<![\w.@/-])((?:[a-z0-9-]+\.)+(?:com|io|dev|app|ai|co|net|org|sh|so|xyz|tech|cloud|gg|me|ly|to|fm|tv|us|uk|in|bd))(?![\w-]|\.[a-z])/gi)) {
    const d = m[1].toLowerCase();
    if (seen.has(d) || /(^|\.)w3\.org$|hyperframes\.heygen\.com$/.test(d)) continue;
    if (/^(power\d|back|elastic|bounce|circ|expo|sine|quad|cubic|quart|quint|strong|linear|none)\.(in|out|inout)$/.test(d)) continue; // GSAP ease names
    seen.add(d);
    flag(`on-screen address "${m[1]}" is a real domain — a viewer could visit it; use ${d.replace(/\.[a-z]+$/, "")}.example`);
  }
  const inst = /\b(?:npm (?:i|install)(?:\s+-[gD])?|npx|pnpm (?:add|dlx)|yarn (?:global )?add|bun (?:add|x)|pipx? install|pip3 install|brew install|cargo install|go install|gem install)\s+(@?[\w./@-]+)/g;
  for (const m of shown.matchAll(inst)) {
    const name = m[1].toLowerCase();
    if (seen.has("pkg:" + name) || checked.has(name)) continue;
    seen.add("pkg:" + name);
    flag(`on-screen install command "${m[0]}" names a package — use \`curl -fsSL <brand>.example/install | sh\`, or make one up, look it up (npm view ${m[1]} → 404) and list it in piece.json honesty.checked`);
  }
  if (piece?.concept === true && !String(piece.nameCheck || "").trim()) warns.push(`brand "${piece.brand}" has no piece.json "nameCheck" — search "<brand> <industry>" and note what you found (a famous product of the same kind with this name → rename it)`);
}
if (/<(h1|h2|h3|p|span|div)[^>]*>[^<]*<br\s*\/?>/i.test(noComments)) warns.push("<br> inside text — let it wrap with max-width (§ determinism layout rules)");
const root = html.match(/<div[^>]*data-composition-id="main"[^>]*>/);
if (!root) errors.push('no root <div data-composition-id="main">');
else if (piece) {
  const get = (a) => { const m = root[0].match(new RegExp(`${a}="([^"]+)"`)); return m ? +m[1] : NaN; };
  if (get("data-width") !== piece.width || get("data-height") !== piece.height) errors.push(`root size ${get("data-width")}×${get("data-height")} ≠ piece.json ${piece.width}×${piece.height}`);
  if (Math.abs(get("data-duration") - piece.duration) > 0.001) errors.push(`root data-duration ${get("data-duration")} ≠ piece.json duration ${piece.duration}`);
  const vp = html.match(/name="viewport"\s+content="width=(\d+),\s*height=(\d+)"/);
  if (vp && (+vp[1] !== piece.width || +vp[2] !== piece.height)) warns.push(`viewport meta ${vp[1]}×${vp[2]} ≠ ${piece.width}×${piece.height}`);
}
// font sizes: every CSS rule and inline style; page furniture is exempt — a rule whose selector names .concept /
// .furniture / [data-design-ignore], or an element that carries data-design-ignore (the "Concept work" label).
const styleText = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
let small = null;
for (const r of styleText.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (/concept|furniture|data-design-ignore/i.test(r[1])) continue;
  const m = r[2].match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/);
  if (m && +m[1] > 0 && +m[1] < 24) { small = `${m[1]}px in "${r[1].trim().slice(0, 60)}"`; break; }
}
if (!small) for (const t of noComments.matchAll(/<[a-z][^>]*\sstyle="([^"]*)"[^>]*>/gi)) {
  if (/data-design-ignore/.test(t[0])) continue;
  const m = t[1].match(/font-size\s*:\s*(\d+(?:\.\d+)?)px/);
  if (m && +m[1] > 0 && +m[1] < 24) { small = `${m[1]}px inline on ${t[0].slice(0, 60)}`; break; }
}
if (small) warns.push(`font-size ${small} — readable text ≥ 28 px, labels ≥ 24 px (≤ 15 px only for furniture: class "concept"/"furniture" or data-design-ignore)`);
const styles = styleText + "\n" + [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]).join(";\n");
for (const m of styles.matchAll(/font-family\s*:\s*([^;}{]+)/g)) {
  for (const part of m[1].split(",").map((s) => s.trim())) {
    if (!part || /^["']/.test(part) || /^var\(/.test(part)) continue;
    if (/\s|\d/.test(part)) errors.push(`unquoted font family "${part}" — Chrome drops the whole list (§0d.10)`);
  }
}
for (const e of errors) console.error("✗ " + e);
for (const w of warns) console.warn("⚠ " + w);
// --static: only the rules above (no Chrome, ~0.2 s) — a quick pass while editing; the full check still gates a render.
if (args.includes("--static")) {
  console.log(errors.length ? `✗ static rules: ${errors.length} error(s), ${warns.length} warning(s)` : `✓ static rules passed${warns.length ? ` with ${warns.length} warning(s)` : ""}`);
  process.exitCode = errors.length ? 1 : 0;
} else {

// ---------- 2. hyperframes check (through the chrome slot)
const node = process.execPath;
const slot = (cmd) => spawnSync(node, [path.join(import.meta.dirname, "slot.mjs"), "chrome", slots, "--", ...cmd], { cwd: dir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
let hfFail = false;
{
  const r = slot(["npx", "hyperframes", "check", "."]);
  const out = (r.stdout || "") + (r.stderr || "");
  const keep = out.split(/\r?\n/).filter((l) => /✗|⚠|error\(s\)|Check (passed|failed)|pass WCAG|sample\(s\)/.test(l) && !/nested_structure_needs_subcomposition/.test(l));
  console.log("— hyperframes check");
  for (const l of keep) console.log("  " + l.trim());
  if (/Check failed/.test(out) || r.status !== 0) hfFail = true;
}

// ---------- 3. design-lint
{
  const r = slot([node, path.join(WS, "tools", "design-lint.mjs"), dir]); // design-lint drives a Chrome too
  const out = ((r.stdout || "") + (r.stderr || "")).trim().split(/\r?\n/);
  console.log("— design-lint");
  for (const l of out.slice(-14)) console.log("  " + l);
}

// ---------- 4. snapshots + contact sheet
if (!args.includes("--no-snap")) {
  const D = piece ? piece.duration : 10;
  let at = opt("at", "");
  if (!at) {
    const every = +opt("every", Math.max(0.5, Math.round((D / 12) * 2) / 2));
    const ts = [];
    for (let t = Math.min(0.4, D / 4); t < D - 0.05; t += every) ts.push(+t.toFixed(2));
    ts.push(+(D - 0.1).toFixed(2));
    at = [...new Set(ts)].join(",");
  }
  rmSync(path.join(dir, "snapshots"), { recursive: true, force: true });
  const r = slot(["npx", "hyperframes", "snapshot", ".", "-o", "snapshots", "--at", at, "--no-end", "--describe", "false", "--timeout", "45000"]);
  // hyperframes writes contact-sheet.jpg, or contact-sheet-1.jpg, -2 … when there are more than 9 frames
  const sheets = existsSync(path.join(dir, "snapshots")) ? readdirSync(path.join(dir, "snapshots")).filter((f) => /^contact-sheet.*\.jpg$/.test(f)) : [];
  const ok = sheets.length > 0;
  console.log(`— snapshots at ${at}`);
  console.log(ok ? sheets.map((s) => `  → ${path.join(dir, "snapshots", s)}`).join("\n") + "  (+ frame-NN-at-Xs.png at full size)" : `  ✗ snapshot failed: ${((r.stdout || "") + (r.stderr || "")).slice(-400)}`);
  if (!ok) hfFail = true;
}

const fail = errors.length > 0 || hfFail;
// the count is the studio's own warnings (listed with ⚠ above); hyperframes' own warning lines are shown in its section
console.log(fail ? `✗ studio check FAILED (${errors.length} static error(s)${hfFail ? ", hyperframes check/snapshot failed" : ""})` : `✓ studio check passed${warns.length ? ` with ${warns.length} studio warning(s) (⚠ lines above)` : ""}`);
process.exitCode = fail ? 1 : 0; // not process.exit(): on Windows a piped stdout could lose the last warning lines (AI1/FD1 report)
} // end of the full check (not --static)
