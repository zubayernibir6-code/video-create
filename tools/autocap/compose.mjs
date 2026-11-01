#!/usr/bin/env node
// compose.mjs — an auto-tutorial's page from DATA: demo.json (steps + the line said during each) + the robot's
// capture.json (states, boxes) → index.html (HyperFrames) + assets/media/mix.wav + build/timeline.json.
//   node tools/autocap/compose.mjs projects/<name> [--dry] [--voice=<another take, relative to the project>]
// Timing source, best first: ONE voice file, assets/media/voice/voice.wav (his cloned voice made in one Gemini
// request, or his phone take), transcribed and aligned to the lines (voice-times.mjs) · otherwise a reading-pace
// estimate (0.9 s + words ÷ 2.3) = a silent preview with captions, so the visuals can be approved before any voice.
// The voice keeps its own pauses; a line waits (silence added in the quietest spot of the pause before it) while the
// screen is still busy with the last step (a page load, typing, the cursor's travel), so the voice never runs ahead.
// Hook (STYLE §৫: the result in the first 2 s; demo "hook": false turns it off): the window opens on the finished
// state with its gold highlight and a "শেষে এখানে পৌঁছাব" chip, then rewinds through the captured states to the start
// page on the first line's `anchor` word ("চলুন…").
// Each action lands on its line's `anchor` word: the cursor glides there on a curved minimum-jerk path (Fitts-law
// travel time), the hover state shows on arrival, the click lands on the word with a ring and a click sound; typing
// shows one captured frame per key with key sounds; a page change dips through dark with a whoosh; a jump down the
// page slides like a scroll. The camera frames each target (demo `view`, else 900 px around the point) and is capped
// at 2× (the capture is 2× pixel density, so every zoom stays sharp); it returns to the whole page at the end.
// Look "AT1" (স্টুডিও জানালা): dark canvas, a browser window with the live address, captions in a glass pill with the
// step number, gold highlight on the step's `mark`. Per-frame motion (cursor, press) is ONE onUpdate tween that reads
// data arrays (seek-safe: position is a pure function of time).
// Verified 2026-11-01 on projects/autotut-proof (code.claude.com docs, 5 steps): silent preview, then his voice.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { voiceTimes } from "./voice-times.mjs";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const f3 = (x) => Number(x).toFixed(3);
const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => String(s).normalize("NFKC").replace(/[^\p{L}\p{M}\p{N}]/gu, "").toLowerCase();

const argv = process.argv.slice(2);
const proj = argv.find((a) => !a.startsWith("--"));
if (!proj) { console.error("usage: node tools/autocap/compose.mjs projects/<name> [--dry]"); process.exit(1); }
const demo = JSON.parse(fs.readFileSync(path.join(proj, "demo.json"), "utf8").replace(/^﻿/, ""));
const media = path.join(proj, "assets", "media");
const cap = JSON.parse(fs.readFileSync(path.join(media, "capture", "capture.json"), "utf8"));
const [VW, VH] = cap.viewport;
if (cap.steps.length !== demo.steps.length) { console.error(`✗ capture has ${cap.steps.length} steps, demo.json ${demo.steps.length}: run capture.mjs again`); process.exit(1); }

// ── 1. time: one line per step ──
const LEAD = 0.5, GAP = 0.3, TAIL = 2.0, MAXZ = 2;
const vArg = argv.find((a) => a.startsWith("--voice=")); // another take to try (relative to the project)
const voiceFile = vArg ? path.resolve(proj, vArg.slice(8)) : path.join(media, "voice", "voice.wav");
if (vArg && !fs.existsSync(voiceFile)) { console.error(`✗ no voice at ${voiceFile}`); process.exit(1); }
const voiced = fs.existsSync(voiceFile);
const says = demo.steps.map((s) => s.say.trim());
// each line in its own clock (voice-file seconds, or from 0 for the estimate): speech a–b, anchor word, cut points
let src;
try {
  src = voiced
    // --min-match lowers the 85 % script-to-voice match only for TEST voices (Piper cannot say English UI words)
    ? voiceTimes(voiceFile, says, demo.steps.map((s) => s.anchor), { minMatch: +(argv.find((a) => a.startsWith("--min-match="))?.slice(12) ?? 0.85) }).lines
    : says.map((say, i) => {
        const words = say.split(/\s+/), d = 0.9 + words.length / 2.3, an = demo.steps[i].anchor;
        const k = an ? words.findIndex((w) => norm(w).includes(norm(an))) : -1;
        return { a: 0, b: d, cutIn: 0, cutOut: d, anchor: an ? d * ((k < 0 ? words.length * 0.7 : k + 0.5) / words.length) : null };
      });
} catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }

const markK = cap.steps.findLastIndex((c) => c.mark);
const hookOn = demo.hook !== false && markK >= 0;
const navAt = (i) => i > 0 && cap.steps[i].url.split("#")[0] !== cap.steps[i - 1].url.split("#")[0];
const jumpAt = (i) => i > 0 && !navAt(i) && cap.steps[i].scrollY !== cap.steps[i - 1].scrollY;
// how long the screen stays busy after a step's anchor word (the next line waits for it)
const busyAfter = (i) => {
  const c = cap.steps[i];
  if (c.do === "type") return 0.05 + c.frames.length * 0.12 + 0.45;
  if (c.do === "click") return c.mark ? 2.9 : navAt(i) ? 1.0 : jumpAt(i) ? 0.75 : 0.45;
  return c.do === "goto" ? 0 : 0.35;
};
const lines = [];
let hookT = null, free = 0; // hookT = [rewind start, rewind end]; free = the screen is busy until then
src.forEach((v, i) => {
  const c = cap.steps[i];
  let start = LEAD, waited = 0;
  if (i) {
    const p = lines[i - 1], own = p.end + (voiced ? v.a - src[i - 1].b : GAP);
    start = Math.max(own, free);
    // the cursor needs ≥ 0.55 s to travel to a click target after the previous line ends
    if (v.anchor !== null && (c.do === "click" || c.do === "hover")) start = Math.max(start, p.end + 0.51 - (v.anchor - v.a));
    waited = start - own;
  }
  const shift = start - v.a;
  const L = { i, start: +start.toFixed(3), end: +(v.b + shift).toFixed(3), anchor: v.anchor === null ? null : +(v.anchor + shift).toFixed(3),
    text: says[i], clip: [v.cutIn, v.cutOut], at: +(v.cutIn + shift).toFixed(3), waited: +waited.toFixed(3) };
  lines.push(L);
  const A = L.anchor ?? L.start + (L.end - L.start) * 0.7;
  if (!i && hookOn) {
    if (L.anchor === null) console.log("  ⚠ step 1 has no anchor: the hook rewinds at 70 % of its line (name the word to rewind on)");
    hookT = [+Math.max(1.45, A - 0.15).toFixed(3)];
    hookT.push(+(hookT[0] + 0.62).toFixed(3));
    free = hookT[1] + 0.3;
  } else free = A + busyAfter(i);
});
const anchorT = (k) => lines[k].anchor ?? lines[k].start + (lines[k].end - lines[k].start) * 0.7;
const last = lines.at(-1);
// the end: the highlight is held ≥ 1.3 s before the camera returns to the whole page, then a short hold and the fade
const endView = +Math.max(last.end + 0.25, markK >= 0 ? anchorT(markK) + 1.6 + 1.3 : 0).toFixed(3);
const TOTAL = +Math.max(last.end + TAIL, endView + 2.0).toFixed(3);

// ── 2. events from the steps ──
const views = [];   // [time, duration, view]
const states = [];  // { file, t, fade, kind }
const clicks = [], keys = [], moves = [], whooshes = [], urls = [];
const full = [0, 0, VW, VH];
const fit = (v) => {
  let [x, y, w] = v; w = Math.min(VW, Math.max(w, VW / MAXZ)); const h = (w * VH) / VW;
  const cx = x + v[2] / 2, cy = y + (v[3] ?? h) / 2;
  return [Math.min(Math.max(cx - w / 2, 0), VW - w), Math.min(Math.max(cy - h / 2, 0), VH - h), w, h].map((n) => +n.toFixed(1));
};
const around = (p, w = 900) => fit([p[0] - w / 2, p[1] - ((w * VH) / VW) / 2, w, (w * VH) / VW]);
let cur = [VW * 0.5, VH * 0.62]; // cursor rest point
const cursorIn = hookT ? hookT[1] + 0.2 : LEAD + 0.6;
urls.push({ t: 0, url: cap.steps[0].url });
cap.steps.forEach((c, i) => {
  const s = demo.steps[i], L = lines[i];
  if (c.do === "goto") { states.push({ file: c.after, t: 0, fade: 0 }); return; }
  const A = anchorT(i);
  if (c.do === "click" || c.do === "hover") {
    const p = c.point, dist = Math.hypot(p[0] - cur[0], p[1] - cur[1]);
    const D = Math.min(1.0, Math.max(0.55, 0.3 + 0.13 * Math.log2(dist / Math.max(20, Math.min(c.box[2], c.box[3])) + 1)));
    const arrive = A - 0.16, depart = Math.max(arrive - D, (i ? lines[i - 1].end - 0.2 : cursorIn));
    moves.push({ t0: depart, t1: arrive, p0: cur, p1: p });
    // the camera starts drifting toward the target while the line is being said and settles as the cursor arrives
    const vStart = Math.min(depart - 0.1, Math.max(L.start + 0.15, arrive - 2.0));
    views.push([vStart, Math.max(0.85, arrive - vStart), s.view ? fit(s.view) : around(p)]);
    if (c.before) states.push({ file: c.before, t: depart, fade: 0.1 });
    states.push({ file: c.hover, t: arrive, fade: 0.08 });
    cur = p;
    if (c.do === "click") {
      clicks.push({ t: A, p });
      const nav = navAt(i), jump = jumpAt(i);
      states.push({ file: c.after, t: A + 0.06, fade: nav ? 0.3 : jump ? 0.45 : 0.14, kind: jump ? "scroll" : nav ? "nav" : "pop" });
      if (nav || jump) whooshes.push(A + 0.04);
      if (c.url !== cap.steps[i - 1].url) urls.push({ t: A + 0.1, url: c.url });
      if (nav) views.push([A + 0.25, 0.9, full]);
      if (c.mark) views.push([A + 0.55, 1.0, around([c.mark[0] + c.mark[2] / 2, c.mark[1] + c.mark[3] / 2])]);
    }
  } else if (c.do === "type") {
    const t0 = A + 0.05;
    c.frames.forEach((f, k) => { states.push({ file: f, t: t0 + k * 0.12, fade: 0 }); keys.push(t0 + k * 0.12); });
    states.push({ file: c.after, t: t0 + c.frames.length * 0.12 + 0.2, fade: 0.12 });
    if (s.view) views.push([t0 - 0.6, 0.6, fit(s.view)]);
  } else if (c.after) {
    states.push({ file: c.after, t: A, fade: 0.2 });
  }
});
views.push([endView, 1.1, full]);
// the opening: a slow drift in while the first line plays (the next move takes over from wherever it ends)
const firstMove = Math.min(...views.map((v) => v[0]));
const opening = hookT ? hookT[1] + 0.15 : LEAD + 0.9;
if (firstMove - opening > 1.2) views.push([opening, firstMove - opening, fit([VW * 0.04, VH * 0.06, VW * 0.92])]);
// the hook: the finished state framed on its mark (the camera holds, so the chip under the highlight stays on it),
// then the rewind pulls back to the whole page; the flicks run back through up to 6 captured states, newest first,
// and the start page shows when they end. They are extra <img> copies of states, so `hyperframes check` warns
// duplicate_media_discovery_risk: its docs call that benign (both still render; seen correct frame by frame).
const hook = hookT ? (() => {
  const c = cap.steps[markK], m = c.mark, mid = [m[0] + m[2] / 2, m[1] + m[3] / 2];
  const pool = states.slice(1, -1).map((s) => s.file).filter((f, k, a) => f !== c.after && a.indexOf(f) === k).reverse();
  const n = Math.min(6, pool.length);
  const flicks = Array.from({ length: n }, (_, j) => pool[Math.round((j * (pool.length - 1)) / Math.max(1, n - 1))]);
  return { r0: hookT[0], r1: hookT[1], file: c.after, box: m, url: c.url, v: around(mid, 880), flicks };
})() : null;
if (hook) views.push([hook.r0, hook.r1 - hook.r0, full]);
// one camera move at a time: a move that would start before the previous one ends shortens it (≥ 0.35 s) or waits
views.sort((a, b) => a[0] - b[0]);
for (let k = 1; k < views.length; k++) {
  const p = views[k - 1];
  if (views[k][0] < p[0] + p[1]) { p[1] = Math.max(0.35, views[k][0] - p[0]); views[k][0] = Math.max(views[k][0], p[0] + p[1]); }
}
// the highlight pops when the camera has settled on it (the move that frames the mark ends)
const mark = (() => {
  if (markK < 0) return null;
  const v = views.find((w) => w[0] >= anchorT(markK) + 0.5);
  return { box: cap.steps[markK].mark, t: v ? v[0] + v[1] + 0.05 : anchorT(markK) + 0.95 };
})();

const voiceRel = voiced ? path.relative(proj, voiceFile).replaceAll("\\", "/") : null; // which take (plan.mjs names it)
const timeline = { TOTAL, voiced, voiceFile: voiceRel, lines, hook, states, clicks, keys, moves, views, urls, whooshes, mark };
fs.mkdirSync(path.join(proj, "build"), { recursive: true });
fs.writeFileSync(path.join(proj, "build", "timeline.json"), JSON.stringify(timeline, null, 1));
const waits = lines.filter((l) => l.waited > 0.05).map((l) => `${l.i + 1}: +${l.waited.toFixed(2)} s`);
console.log(`timing: ${voiced ? "one voice file, aligned" : "reading-pace estimate (silent preview)"} · ${lines.length} lines · ${states.length} states · ${clicks.length} clicks · ${keys.length} keys${hook ? ` · hook rewinds ${hook.r0}–${hook.r1} s` : ""} · total ${TOTAL} s`);
if (waits.length) console.log(`  lines that wait for the screen: ${waits.join(", ")}`);
if (argv.includes("--dry")) process.exit(0);

// ── 3. page ──
const WIN = { x: 160, y: 62, w: 1600, bar: 44 };
const K = WIN.w / VW, CH = Math.round(VH * K);
const latin = (s) => esc(s).replace(/([A-Za-z][A-Za-z0-9 .\-#/]*[A-Za-z0-9])/g, '<span class="en">$1</span>');
const host = (u) => u.replace(/^https?:\/\//, "");
const camAt = (v) => { const b = VW / v[2]; return { x: -v[0] * b, y: -v[1] * b, s: b }; };
const cam0 = camAt(hook ? hook.v : full);
// the hook chip sits just under the highlight (or above it when that would reach the caption), in window pixels
const tip = hook && (() => {
  const S = (VW / hook.v[2]) * K, b = hook.box;
  const x = (b[0] - 14 - hook.v[0]) * S, y0 = WIN.bar + (b[1] - 10 - hook.v[1]) * S, y1 = y0 + (b[3] + 20) * S;
  return { x: Math.round(Math.min(Math.max(x, 16), WIN.w - 420)), y: Math.round(y1 + 84 < WIN.bar + CH - 150 ? y1 + 24 : y0 - 84) };
})();
const ARROW = '<svg id="cursor" width="30" height="30" viewBox="0 0 30 30"><path d="M3 2 L3 24 L9 18.5 L13.2 27.5 L17 25.8 L12.8 17 L21 17 Z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const LOCK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0aa" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const REWIND = '<svg width="34" height="22" viewBox="0 0 34 22"><path d="M16 2 L2 11 L16 20 Z M32 2 L18 11 L32 20 Z" fill="#F2B84B"/></svg>';
const hlBox = (b) => `left:${b[0] - 14}px;top:${b[1] - 10}px;width:${b[2] + 28}px;height:${b[3] + 20}px`;

const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(demo.title)}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Baloo Da 2"; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }
body { margin: 0; background: #08080B; }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: "Inter", "Hind Siliguri", sans-serif; color: #EDEDF0;
  background: radial-gradient(1200px 700px at 50% 42%, #1B1712 0%, #0D0C10 55%, #08080B 100%); }
#grid { position: absolute; inset: 0; opacity: 0.35; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 48px 48px; }
#glow { position: absolute; left: 460px; top: 160px; width: 1000px; height: 760px; border-radius: 50%; background: radial-gradient(closest-side, rgba(217,119,87,0.16), transparent); }
#win { position: absolute; left: ${WIN.x}px; top: ${WIN.y}px; width: ${WIN.w}px; height: ${WIN.bar + CH}px; border-radius: 16px; overflow: hidden; opacity: 0;
  background: #121216; box-shadow: 0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08); transform-origin: 50% 50%; }
#bar { position: absolute; left: 0; top: 0; right: 0; height: ${WIN.bar}px; background: #18181D; border-bottom: 1px solid rgba(255,255,255,0.06); }
.dot { position: absolute; top: 15px; width: 13px; height: 13px; border-radius: 50%; }
#addr { position: absolute; left: 50%; top: 8px; width: 760px; height: 28px; margin-left: -380px; border-radius: 8px; background: #0E0E12; border: 1px solid rgba(255,255,255,0.07); }
#addr svg { position: absolute; left: 12px; top: 6px; }
.url { position: absolute; left: 38px; top: 0; line-height: 28px; font: 500 15px/28px "Inter", sans-serif; color: #B9BDC7; white-space: nowrap; opacity: 0; }
#view { position: absolute; left: 0; top: ${WIN.bar}px; width: ${WIN.w}px; height: ${CH}px; overflow: hidden; background: #0A0A0C; }
#scale { position: absolute; left: 0; top: 0; width: ${VW}px; height: ${VH}px; transform: scale(${K.toFixed(6)}); transform-origin: 0 0; }
#cam { position: absolute; left: 0; top: 0; width: ${VW}px; height: ${VH}px; transform-origin: 0 0; }
.st { position: absolute; left: 0; top: 0; width: ${VW}px; height: ${VH}px; opacity: 0; }
.ring { position: absolute; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%; border: 3px solid #F2B84B; opacity: 0; box-shadow: 0 0 18px rgba(242,184,75,0.55); }
.hl { position: absolute; border-radius: 10px; border: 3px solid #F2B84B; box-shadow: 0 0 0 6px rgba(242,184,75,0.16), 0 0 28px rgba(242,184,75,0.45); opacity: 0; }
#cursor { position: absolute; left: 0; top: 0; transform-origin: 3px 2px; opacity: 0; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.55)); }
.tip { position: absolute; opacity: 0; }
.chipw { position: absolute; left: 0; right: 0; top: ${Math.round(WIN.bar + CH / 2 - 32)}px; display: flex; justify-content: center; opacity: 0; }
.chip { display: flex; align-items: center; gap: 14px; padding: 9px 26px 11px 20px; border-radius: 999px; background: rgba(12,12,16,0.9);
  box-shadow: 0 14px 36px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(242,184,75,0.5); font: 600 30px/1.35 "Hind Siliguri", sans-serif; color: #F2B84B; white-space: nowrap; }
.chip .pin { width: 14px; height: 14px; border-radius: 50%; background: #F2B84B; box-shadow: 0 0 0 5px rgba(242,184,75,0.22); }
.cap { position: absolute; left: 0; right: 0; bottom: 74px; display: flex; justify-content: center; opacity: 0; }
.pill { max-width: 1320px; padding: 16px 30px 18px 22px; display: flex; align-items: center; gap: 18px; border-radius: 22px;
  background: rgba(12,12,16,0.86); box-shadow: 0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.09); }
.cap .n { flex: none; width: 50px; height: 50px; border-radius: 50%; background: #F2B84B; color: #1A1408; display: flex; align-items: center; justify-content: center; font: 700 30px/1 "Baloo Da 2", sans-serif; padding-top: 4px; box-sizing: border-box; }
.cap .t { font: 600 38px/1.42 "Hind Siliguri", sans-serif; color: #F4F4F6; text-wrap: balance; }
.cap .en { color: #F2B84B; font-family: "Inter", "Hind Siliguri", sans-serif; font-weight: 600; }
#fade { position: absolute; inset: 0; background: #000; opacity: 0; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${f3(TOTAL)}">
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(TOTAL)}" data-track-index="5" data-volume="1"></audio>
      <div id="grid"></div><div id="glow"></div>
      <div id="win">
        <div id="bar"><span class="dot" style="left:18px;background:#FF5F57"></span><span class="dot" style="left:40px;background:#FEBC2E"></span><span class="dot" style="left:62px;background:#28C840"></span>
          <div id="addr">${LOCK}${urls.map((u, k) => `<span class="url" id="u${k}"${k || hook ? "" : ' style="opacity:1"'}>${esc(host(u.url))}</span>`).join("")}${hook ? `<span class="url" id="uh" style="opacity:1">${esc(host(hook.url))}</span>` : ""}</div></div>
        <div id="view"><div id="scale"><div id="cam" data-layout-allow-overflow${hook ? ` style="transform: translate(${f3(cam0.x)}px, ${f3(cam0.y)}px) scale(${cam0.s.toFixed(4)})"` : ""}>
${states.map((s, k) => `          <img class="st" id="s${k}" src="assets/media/capture/${s.file}" alt=""${k ? "" : ' style="opacity:1"'} />`).join("\n")}
${hook ? [`          <img class="st" id="hk" src="assets/media/capture/${hook.file}" alt="" style="opacity:1" />`, ...hook.flicks.map((f, j) => `          <img class="st" id="w${j}" src="assets/media/capture/${f}" alt="" />`)].join("\n") : ""}
${clicks.map((c, k) => `          <div class="ring" id="r${k}" style="left:${c.p[0]}px;top:${c.p[1]}px"></div>`).join("\n")}
          ${hook ? `<div class="hl" id="hlh" style="${hlBox(hook.box)}"></div>` : ""}
          ${mark ? `<div class="hl" id="hl" style="${hlBox(mark.box)}"></div>` : ""}
          ${ARROW}
        </div></div></div>
${hook ? `        <div class="tip" id="hc" style="left:${tip.x}px;top:${tip.y}px"><div class="chip"><span class="pin"></span>শেষে এখানে পৌঁছাব</div></div>
        <div class="chipw" id="rc"><div class="chip">${REWIND}শুরু থেকে দেখি</div></div>` : ""}
      </div>
${lines.map((l, k) => `      <div class="cap" id="c${k}"><div class="pill">${k ? `<div class="n">${bn(k)}</div>` : ""}<div class="t">${latin(l.text)}</div></div></div>`).join("\n")}
      <div id="fade"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      const MOVES = ${JSON.stringify(moves.map((m) => [m.t0, m.t1, ...m.p0, ...m.p1].map((v) => +v.toFixed(3))))};
      const CLICKS = ${JSON.stringify(clicks.map((c) => +c.t.toFixed(3)))};
      const REST = ${JSON.stringify(moves.length ? moves[0].p0 : cur)};
      const cursor = document.getElementById("cursor");
      const mj = (s) => s * s * s * (10 - 15 * s + 6 * s * s);
      function place(t) {
        let x = REST[0], y = REST[1];
        for (const [t0, t1, x0, y0, x1, y1] of MOVES) {
          if (t >= t1) { x = x1; y = y1; continue; }
          if (t > t0) {
            const u = mj((t - t0) / (t1 - t0)), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
            const cx = (x0 + x1) / 2 - (dy / L) * L * 0.12, cy = (y0 + y1) / 2 + (dx / L) * L * 0.12;
            x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1;
            y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
          }
          break;
        }
        let press = 1;
        for (const c of CLICKS) { const d = t - c; if (d > -0.05 && d < 0.17) press = 1 - 0.16 * Math.sin(Math.PI * (d + 0.05) / 0.22); }
        cursor.style.transform = "translate(" + (x - 3).toFixed(2) + "px," + (y - 2).toFixed(2) + "px) scale(" + press.toFixed(3) + ")";
      }
      const clock = { t: 0 };
      tl.to(clock, { t: ${f3(TOTAL)}, duration: ${f3(TOTAL)}, ease: "none", onUpdate: () => place(clock.t) }, 0);
      place(0);
      tl.fromTo("#win", { opacity: 0, y: 36, scale: 0.955 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, 0.08);
      tl.fromTo("#glow", { opacity: 0.5, scale: 0.9 }, { opacity: 1, scale: 1.06, duration: ${f3(TOTAL)}, ease: "sine.inOut" }, 0);
      tl.fromTo("#cursor", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f3(cursorIn)});
${hook ? (() => {
  // the hook: highlight + chip on the finished state, then the flicks (each ~3 frames) and the rewind chip
  const dt = (hook.r1 - hook.r0) / Math.max(1, hook.flicks.length), out = [];
  out.push(`      tl.fromTo("#hlh", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.6); tl.fromTo("#hlh", { opacity: 1 }, { opacity: 0, duration: 0.12, ease: "power1.in", immediateRender: false }, ${f3(hook.r0)});`);
  out.push(`      tl.fromTo("#hc", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.75); tl.fromTo("#hc", { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "power1.in", immediateRender: false }, ${f3(Math.max(1.1, hook.r0 - 0.15))});`);
  out.push(`      tl.fromTo("#rc", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" }, ${f3(hook.r0)}); tl.fromTo("#rc", { opacity: 1 }, { opacity: 0, duration: 0.2, ease: "power1.in", immediateRender: false }, ${f3(hook.r1 + 0.25)});`);
  if (hook.flicks.length) {
    out.push(`      tl.set("#w0", { opacity: 1 }, ${f3(hook.r0)}); tl.set("#hk", { opacity: 0 }, ${f3(hook.r0)});`);
    for (let j = 1; j < hook.flicks.length; j++) out.push(`      tl.set("#w${j}", { opacity: 1 }, ${f3(hook.r0 + j * dt)}); tl.set("#w${j - 1}", { opacity: 0 }, ${f3(hook.r0 + j * dt)});`);
    out.push(`      tl.set("#w${hook.flicks.length - 1}", { opacity: 0 }, ${f3(hook.r1)});`);
  } else out.push(`      tl.set("#hk", { opacity: 0 }, ${f3(hook.r1)});`);
  out.push(`      tl.set("#u0", { opacity: 1 }, ${f3(hook.r1 - 0.05)}); tl.set("#uh", { opacity: 0 }, ${f3(hook.r1 - 0.05)});`);
  return out.join("\n");
})() : ""}
${urls.slice(1).map((u, j) => `      tl.set("#u${j + 1}", { opacity: 1 }, ${f3(u.t)}); tl.set("#u${j}", { opacity: 0 }, ${f3(u.t)});`).join("\n")}
${states.map((s, k) => {
  if (!k) return "";
  const prev = `tl.set("#s${k - 1}", { opacity: 0 }, ${f3(s.t + s.fade + 0.02)});`;
  // a jump down the page: the old view leaves upward first, the new one rises in a beat later (little double image)
  if (s.kind === "scroll") return `      tl.fromTo("#s${k - 1}", { opacity: 1, y: 0 }, { opacity: 0, y: -220, duration: ${f3(s.fade * 0.55)}, ease: "power2.in", immediateRender: false }, ${f3(s.t)}); tl.fromTo("#s${k}", { opacity: 0, y: 220 }, { opacity: 1, y: 0, duration: ${f3(s.fade * 0.7)}, ease: "power3.out" }, ${f3(s.t + s.fade * 0.3)});`;
  // a new page: a short dip through the dark page background, like a real page load (no blended double page)
  if (s.kind === "nav") return `      tl.fromTo("#s${k - 1}", { opacity: 1 }, { opacity: 0, duration: 0.1, ease: "power1.in", immediateRender: false }, ${f3(s.t)}); tl.fromTo("#s${k}", { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" }, ${f3(s.t + 0.12)});`;
  if (!s.fade) return `      tl.set("#s${k}", { opacity: 1 }, ${f3(s.t)}); ${prev}`;
  return `      tl.fromTo("#s${k}", { opacity: 0 }, { opacity: 1, duration: ${f3(s.fade)}, ease: "power1.out" }, ${f3(s.t)}); ${prev}`;
}).filter(Boolean).join("\n")}
${clicks.map((c, k) => `      tl.fromTo("#r${k}", { opacity: 0.95, scale: 0.35 }, { opacity: 0, scale: 2.3, duration: 0.55, ease: "power2.out", immediateRender: false }, ${f3(c.t)});`).join("\n")}
${(() => { let pv = hook ? hook.v : full; return views.map(([vt, vd, v]) => { const a = camAt(pv), b = camAt(v); const line = `      tl.fromTo("#cam", { x: ${f3(a.x)}, y: ${f3(a.y)}, scale: ${a.s.toFixed(4)} }, { x: ${f3(b.x)}, y: ${f3(b.y)}, scale: ${b.s.toFixed(4)}, duration: ${f3(vd)}, ease: "${hook && vt === hook.r0 ? "power2.inOut" : "power3.inOut"}", immediateRender: false }, ${f3(vt)});`; pv = v; return line; }).join("\n"); })()}
${mark ? `      tl.fromTo("#hl", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${f3(mark.t)});` : ""}
${lines.map((l, k) => {
  // the old caption is gone before the next one rises in the same spot (no two texts blended)
  const out = k < lines.length - 1 ? lines[k + 1].start - 0.32 : TOTAL - 0.5;
  return `      tl.fromTo("#c${k}", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, ${f3(Math.max(0.2, l.start - 0.1))}); tl.fromTo("#c${k}", { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: 0.16, ease: "power1.in", immediateRender: false }, ${f3(out)});`;
}).join("\n")}
      tl.to("#fade", { opacity: 1, duration: 0.45, ease: "power1.in" }, ${f3(TOTAL - 0.45)});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(proj, "index.html"), html);

// ── 4. sound: voice (if any) + BGM bed + a cue for every click, key, page change, highlight, hook ──
const cues = [
  { t: 0.08, file: "whoosh-short", vol: 0.22 },
  ...clicks.map((c) => ({ t: c.t, file: "click", vol: 0.34 })),
  ...keys.map((k) => ({ t: k, file: "key-press", vol: 0.24 })),
  ...whooshes.map((w) => ({ t: w, file: "whoosh-short", vol: 0.2 })),
  ...(mark ? [{ t: mark.t, file: "pop", vol: 0.3 }] : []),
  ...(hook ? [{ t: 0.6, file: "pop", vol: 0.26 }, { t: hook.r0, file: "whoosh", vol: 0.26 },
    ...hook.flicks.map((_, j) => ({ t: hook.r0 + (j * (hook.r1 - hook.r0)) / hook.flicks.length, file: "click-soft", vol: 0.12 }))] : []),
];
let voice = null;
if (voiced) {
  // each line's piece of the one voice file at its place on the timeline (the pause before a waiting line grows)
  const vo = path.join(media, "voice", "voice-timed.wav");
  const parts = [`[0:a]aresample=48000,asplit=${lines.length}${lines.map((_, k) => `[v${k}]`).join("")}`];
  lines.forEach((l, k) => {
    const len = l.clip[1] - l.clip[0];
    parts.push(`[v${k}]atrim=${f3(l.clip[0])}:${f3(l.clip[1])},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${f3(Math.max(0, len - 0.012))}:d=0.012,adelay=${Math.round(l.at * 1000)}:all=1[a${k}]`);
  });
  const r = spawnSync(FF, ["-y", "-v", "error", "-i", voiceFile, "-filter_complex", `${parts.join(";")};${lines.map((_, k) => `[a${k}]`).join("")}amix=inputs=${lines.length}:normalize=0[v]`, "-map", "[v]", "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", vo], { encoding: "utf8" });
  if (r.status !== 0) { console.error(`✗ ffmpeg (voice): ${r.stderr}`); process.exit(1); }
  voice = { file: vo, eq: true };
}
const bgm = demo.bgm ? path.resolve(proj, demo.bgm) : null;
buildMix({
  total: TOTAL, out: path.join(media, "mix.wav"), graphFile: path.join(proj, "build", "mix.graph.txt"),
  voice,
  music: bgm ? [{ file: bgm, at: 0, from: demo.bgm_from ?? 0, env: [[0, voiced ? -21 : -14], [TOTAL - 1.4, voiced ? -21 : -14], [TOTAL, null]] }] : [],
  cues,
});
console.log(`✓ index.html + mix.wav (${cues.length} sound cues${bgm ? ", BGM" : ""}${voiced ? ", voice" : ", no voice"})`);
