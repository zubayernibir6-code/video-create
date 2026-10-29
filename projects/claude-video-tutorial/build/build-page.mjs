// The tutorial's page (PLAN.md shot table): writes index.html + build/cues.json (the sound effects mix.mjs places).
//   node build/build-page.mjs
// Inputs: timeline.mjs (all times), build/specs.json (blurs are burnt into screen.mp4; camera views, anchors and
// clicks in SOURCE time/pixels, from the per-scene frame review 2026-10-29), build/cursor.json (tracked cursor tip,
// source time). Layout: a cyber-grid canvas; intro and outro = his facecam in a glass portrait frame + cards on the
// right; the screen part plays inside a floating monitor (1712×963 viewport, K = 0.8917) under a 2D camera.
// Kept capture-fast on purpose (docs §4i): no CSS filter / perspective / clip-path animation (each forces screenshot
// capture); depth comes from shadows and gradients; per-frame motion (cursor glow, trails, waveform, count-up) runs
// in ONE onUpdate tween that reads data arrays, instead of thousands of tweens.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TL } from "./timeline.mjs";

const PROJECT = path.resolve(import.meta.dirname, "..");
const spec = JSON.parse(readFileSync(path.join(import.meta.dirname, "specs.json"), "utf8"));
const track = JSON.parse(readFileSync(path.join(import.meta.dirname, "cursor.json"), "utf8"));
const { S, V, FPS, TOTAL } = TL;
const K = 1712 / 1920, MX = 104, MY = 38; // monitor viewport: source px → page px = M + px × K (camera at 1×)
const SA = TL.screen.at, SE = TL.screen.end;
const f3 = (x) => Number(x).toFixed(3);
const js = [], cues = [], warn = [];
const cue = (t, file, vol, dur) => cues.push({ t: +f3(t), file, vol, ...(dur ? { dur: +f3(dur) } : {}) });
const A = (id) => { const a = spec.anchors[id]; if (!a) throw new Error(`anchor ${id} missing in specs.json`); return a; };

// ── icons (Lucide paths, stroke) ──
const ICON = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  rocket: '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  chat: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  clapper: '<path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/>',
  ccheck: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bomb: '<circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>',
  ff: '<path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z"/><path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};
const icon = (name, size, color, sw = 2.2) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

// show / hide helpers (autoAlpha = opacity + visibility, so hidden layers never count as painted)
const show = (sel, t, from = { y: 24, scale: 0.96 }, d = 0.45, ease = "back.out(1.6)") =>
  js.push(`  tl.fromTo("${sel}", { autoAlpha: 0, ${Object.entries(from).map(([k, v]) => `${k}: ${v}`).join(", ")} }, { autoAlpha: 1, ${Object.keys(from).map((k) => `${k}: ${k === "scale" ? 1 : 0}`).join(", ")}, duration: ${d}, ease: "${ease}", immediateRender: false }, ${f3(t)});`);
const hide = (sel, t, to = { y: -16 }, d = 0.35) =>
  js.push(`  tl.to("${sel}", { autoAlpha: 0, ${Object.entries(to).map(([k, v]) => `${k}: ${v}`).join(", ")}, duration: ${d}, ease: "power2.in" }, ${f3(t)});`);
const T = (sel, t, vars, d, ease = "power2.inOut") =>
  js.push(`  tl.to("${sel}", { ${Object.entries(vars).map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`).join(", ")}, duration: ${f3(d)}, ease: "${ease}" }, ${f3(t)});`);

// ════════════════ INTRO (0 – 45.17): glass facecam + cards ════════════════
const I = { c1: 1.35, c2: 6.1, b2: 10.9, b3: 12.95, c3: 18.2, drain: 23.5, c4: 24.8, max: 25.97, l2: 31.0, ten: 32.95, out: 37.0, mon: 38.4, dive: 42.0 };
// starting states of things that animate in later, so nothing sits visible and then jumps (preflight 'snap', 2026-10-29):
// the glass sheen rested in the middle of the frame for its first second; the icons popped from full size
js.push(`  tl.set("#faceA .streak, #faceB .streak", { x: -700 }, 0);`);
js.push(`  tl.set("#c1 .icbox", { scale: 0.4, rotation: -30 }, 0);`);
js.push(`  tl.set("#o1 .icbox", { scale: 0.3 }, 0);`);
show("#faceA", 0.05, { x: -140, scale: 0.92 }, 0.9, "power3.out");
cue(0.05, "whoosh-cinematic", 0.5);
js.push(`  tl.fromTo("#faceA .streak", { x: -700 }, { x: 900, duration: 2.2, ease: "power2.inOut", immediateRender: false }, 1.0);`);
js.push(`  tl.fromTo("#faceA .streak", { x: -700 }, { x: 900, duration: 2.2, ease: "power2.inOut", immediateRender: false }, 19.0);`);
// C1 red
show("#c1", I.c1, { x: 80 }, 0.5, "power3.out"); cue(I.c1, "error", 0.35);
js.push(`  tl.fromTo("#c1 .icbox", { scale: 0.4, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.4)", immediateRender: false }, ${f3(I.c1 + 0.15)});`);
hide("#c1", I.c2 - 0.35, { x: -60 });
// C2 diagram
show("#c2", I.c2, { y: 30 }, 0.4, "power3.out");
show("#d1", I.c2 + 0.1, { scale: 0.7 }, 0.45); cue(I.c2 + 0.1, "pop", 0.45);
js.push(`  tl.fromTo("#a1 .shaft", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f3(I.b2 - 0.5)});`);
show("#a1 .head", I.b2 - 0.05, { x: -20 }, 0.2, "power2.out");
show("#d2", I.b2, { scale: 0.7 }, 0.45); cue(I.b2, "pop", 0.45);
js.push(`  tl.fromTo("#a2 .shaft", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f3(I.b3 - 0.5)});`);
show("#a2 .head", I.b3 - 0.05, { x: -20 }, 0.2, "power2.out");
show("#d3", I.b3, { scale: 0.7 }, 0.5, "back.out(2)"); cue(I.b3, "sparkle", 0.4);
js.push(`  tl.to("#d3", { boxShadow: "0px 0px 0px 3px rgba(255,214,120,0.95), 0px 0px 60px 6px rgba(240,180,70,0.55)", duration: 0.6, ease: "sine.out" }, ${f3(I.b3 + 0.3)});`);
for (const [a, t0] of [["#a1", I.b2 + 0.6], ["#a2", I.b3 + 0.6], ["#a1", I.b3 + 2.4], ["#a2", I.b3 + 2.9]])
  js.push(`  tl.fromTo("${a} .pulse", { x: 0, autoAlpha: 1 }, { x: 64, autoAlpha: 0, duration: 0.7, ease: "power1.in", immediateRender: false }, ${f3(t0)});`);
hide("#c2", I.c3 - 0.35, { y: -30 });
// C3 yellow + draining meter
show("#c3", I.c3, { x: 80 }, 0.5, "power3.out"); cue(I.c3, "notification", 0.4);
js.push(`  tl.fromTo("#c3 .fill", { scaleX: 1 }, { scaleX: 0.12, duration: 1.6, ease: "power2.inOut", immediateRender: false }, ${f3(I.drain - 1.2)});`);
js.push(`  tl.to("#c3 .fill", { backgroundColor: "#FF4D5E", duration: 0.6, ease: "none" }, ${f3(I.drain - 0.2)});`);
hide("#c3", I.c4 - 0.3, { x: -60 });
// C4 gold
show("#c4", I.c4, { scale: 0.86 }, 0.5, "back.out(1.8)");
js.push(`  tl.fromTo("#c4 .big", { scale: 1.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.24, ease: "power4.in", immediateRender: false }, ${f3(I.max - 0.24)});`);
[[10, -6], [-7, 4], [4, -2], [0, 0]].forEach(([x, y], i) => js.push(`  tl.to("#c4", { x: ${x}, y: ${y}, duration: ${f3(1 / 60)}, ease: "none" }, ${f3(I.max + i / 30)});`));
cue(I.max, "impact-bass-1", 0.55, 0.9);
js.push(`  tl.fromTo("#c4 .fill", { scaleX: 0.12 }, { scaleX: 1, duration: 2.2, ease: "power2.inOut", immediateRender: false }, ${f3(I.max + 0.3)});`);
js.push(`  tl.fromTo("#c4 .big .metal", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: 1.1, ease: "sine.inOut", immediateRender: false }, ${f3(I.max + 0.5)});`);
show("#c4 .l2", I.l2, { y: 20 }, 0.45, "power3.out"); cue(I.l2, "whoosh-short", 0.3);
cue(I.ten, "typing", 0.22, 1.4);
js.push(`  tl.fromTo("#c4 .big .metal", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: 1.1, ease: "sine.inOut", immediateRender: false }, ${f3(I.ten + 1.6)});`);
hide("#c4", I.out, { x: 120 }, 0.5);
// face shrinks aside, the monitor floats in, then the dive
T("#faceA", I.mon - 0.2, { x: -60, y: 40, scale: 0.8 }, 1.6, "power3.inOut");
js.push(`  tl.fromTo("#stage", { autoAlpha: 0, x: 330, y: 30, scale: 0.46, skewY: -3 }, { autoAlpha: 1, x: 300, y: 10, scale: 0.5, skewY: -2, duration: 1.4, ease: "power3.out", immediateRender: false }, ${f3(I.mon)});`);
js.push(`  tl.to("#stage", { y: -4, skewY: -1.2, duration: ${f3(I.dive - I.mon - 1.4)}, ease: "sine.inOut" }, ${f3(I.mon + 1.4)});`);
cue(I.dive - 4.12, "riser", 0.32, 4.12);
T("#faceA", I.dive, { x: -760, autoAlpha: 0 }, 0.9, "power3.in");
js.push(`  tl.to("#stage", { x: 0, y: 0, scale: 1, skewY: 0, duration: ${f3(SA - I.dive - 0.25)}, ease: "power3.inOut" }, ${f3(I.dive + 0.1)});`);
cue(I.dive + 0.1, "whoosh-cinematic", 0.55);
js.push(`  tl.set("#faceA", { display: "none" }, ${f3(SA + 0.5)});`);

// ════════════════ SCREEN PART (45.17 – SE) ════════════════
// monitor float: ±4 px, 3 s each way, 2D only
const floatN = Math.floor((SE - 0.8 - SA) / 3);
js.push(`  tl.to("#mon", { y: -4, duration: 3, ease: "sine.inOut", repeat: ${floatN - 1}, yoyo: true }, ${f3(SA)});`);
cue(SA + 0.05, "whoosh-short", 0.35);

// camera views (source → final), each eased in ~0.8 s before it is reached, out to 1× unless the next follows
const views = spec.camera.map((v) => ({ ...v, a: S(v.from), b: S(v.to) })).sort((x, y) => x.a - y.a);
let prevV = { s: 1, l: 0, tp: 0 }, freeAt = SA; // freeAt: when the camera may start its next move
const camTo = (v, t, d, ease) => {
  js.push(`  tl.to("#cam", { x: ${f3(-v.l * v.s)}, y: ${f3(-v.tp * v.s)}, scale: ${f3(v.s)}, duration: ${f3(d)}, ease: "${ease}" }, ${f3(t)});`);
  prevV = v;
};
views.forEach((v, i) => {
  v.l = Math.max(0, Math.min(v.l, 1920 - 1920 / v.s)); v.tp = Math.max(0, Math.min(v.tp, 1080 - 1080 / v.s));
  const slow = v.s < 1.2, din = slow ? 1.4 : 0.8;
  const t0 = Math.max(freeAt + 0.02, v.a - din);
  if (t0 > v.b - 0.2) { warn.push(`camera view ${i} (${v.what}) has no room (${f3(v.a)}–${f3(v.b)})`); return; }
  camTo(v, t0, Math.min(din, v.b - t0 - 0.1), slow ? "sine.inOut" : "power2.inOut");
  if (!slow) cue(t0, "whoosh-short", 0.28);
  const nx = views[i + 1];
  if (nx && nx.a - v.b < 1.4) { freeAt = v.b; return; }
  const dout = slow ? 1.1 : 0.8;
  camTo({ s: 1, l: 0, tp: 0 }, v.b, dout, "power2.inOut");
  freeAt = v.b + dout;
});
if (prevV.s !== 1) camTo({ s: 1, l: 0, tp: 0 }, SE - 1.2, 0.8, "power2.inOut");

// cursor glow, drag trails, waveform: one onUpdate tween reading sampled data, one sample per frame (at 25 Hz the
// glow ran up to ~290 px ahead of the cursor on fast flicks in sped-up pieces)
const GH = FPS;
// inside a freeze (specs.freezes) the picture shows the frame at `use`, so the glow stays on that frame's cursor
const unfreeze = (s) => (spec.freezes ?? []).find((z) => s >= z.from && s <= z.to)?.use ?? s;
const okT = track.map((f) => f.s >= 0.85);
for (let pass = 0; pass < 2; pass++) for (let i = 0; i < track.length; i++) { // weak matches next to a confirmed one, < 60 px apart
  if (okT[i] || track[i].s < 0.72) continue;
  const near = (j) => j >= 0 && j < track.length && okT[j] && Math.hypot(track[j].x - track[i].x, track[j].y - track[i].y) < 60;
  if (near(i - 1) || near(i + 1)) okT[i] = true;
}
for (let i = 0; i < track.length;) { // bridge misses ≤ 0.4 s
  if (okT[i]) { i++; continue; }
  let j = i; while (j < track.length && !okT[j]) j++;
  if (i > 0 && j < track.length && track[j].t - track[i - 1].t <= 0.45) for (let k = i; k < j; k++) {
    const u = (track[k].t - track[i - 1].t) / (track[j].t - track[i - 1].t);
    track[k] = { ...track[k], x: track[i - 1].x + (track[j].x - track[i - 1].x) * u, y: track[i - 1].y + (track[j].y - track[i - 1].y) * u };
    okT[k] = true;
  }
  i = j;
}
const at = (s) => { // cursor at source time s (linear between samples), visible flag
  let lo = 0, hi = track.length - 1;
  if (s <= track[0].t) return { x: track[0].x, y: track[0].y, v: okT[0] };
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (track[m].t <= s) lo = m; else hi = m; }
  const a = track[lo], b = track[hi], u = Math.max(0, Math.min(1, (s - a.t) / (b.t - a.t || 1)));
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, v: okT[lo] && okT[hi] };
};
const GX = [], GY = [], GV = [];
for (let t = SA; t <= SE; t += 1 / GH) {
  const s = TL.Sinv(t); const c = s === null ? { x: 0, y: 0, v: false } : at(unfreeze(s));
  GX.push(Math.round(c.x)); GY.push(Math.round(c.y)); GV.push(c.v ? 1 : 0);
}
const coverage = GV.reduce((a, b) => a + b, 0) / GV.length;
const lastSeen = SA + GV.lastIndexOf(1) / GH;
if (SE - lastSeen > 15) warn.push(`whole-video coverage gap: the cursor glow is last seen at ${f3(lastSeen)} s, the screen part runs to ${f3(SE)} s (§0h)`);
const drags = (spec.drags ?? []).map(([a, b]) => [S(a), S(b)]);
const waits = TL.screen.pieces.filter((p) => p.kind === "play" && p.wait && p.frames / FPS >= 1.2).map((p) => ({ a: p.at / FPS, b: (p.at + p.frames) / FPS, sp: p.speed }));

// click shockwaves: the cursor tip at the click if tracked, else the reviewed point
const clicks = spec.clicks.map((c) => {
  const t = S(c.t); const kept = TL.Sinv(t + 0.001); if (kept === null || Math.abs(kept - c.t) > 0.25) return null;
  const p = at(c.t);
  return { t, x: p.v ? p.x : c.x, y: p.v ? p.y : c.y };
}).filter(Boolean).sort((a, b) => a.t - b.t);
// x/y go in BOTH vars: when they were only in the from-vars, a seeked render left 5 of 128 rings at the position of
// the previous click on the same ring element (render review 2026-10-29)
clicks.forEach((c, i) => {
  const r = `#ring${i % 4}`, x = Math.round(c.x), y = Math.round(c.y);
  js.push(`  tl.fromTo("${r}", { x: ${x}, y: ${y}, scale: 0.15, autoAlpha: 1 }, { x: ${x}, y: ${y}, scale: 2.6, autoAlpha: 0, duration: 0.55, ease: "power2.out", immediateRender: false }, ${f3(c.t)});`);
  cue(c.t, "click-soft", 0.3);
});

// speed chip + waveform during every ramp ≥ 1.2 s
waits.forEach((w, i) => {
  const sp = (Math.round(w.sp * 10) / 10).toFixed(1).replace(/\.0$/, "");
  js.push(`  tl.set("#chipv", { textContent: "${sp}×" }, ${f3(w.a)});`);
  show("#chip", w.a, { x: 30 }, 0.3, "power3.out");
  hide("#chip", w.b - 0.3, { x: 30 }, 0.3);
  show("#wave", w.a, { y: 30 }, 0.3, "power3.out");
  hide("#wave", w.b - 0.3, { y: 30 }, 0.3);
  cue(w.b - Math.min(4.12, w.b - w.a), "riser", 0.22, Math.min(4.12, w.b - w.a));
});

// scene changes inside the screen part
for (const [s, f, vol] of [[82.02, "whoosh-short", 0.35], [109.2, "whoosh-short", 0.35], [166.7, "whoosh-short", 0.35], [214.25, "whoosh", 0.4],
  [269.5, "whoosh-short", 0.35], [292.5, "whoosh-short", 0.35], [326.8, "whoosh-short", 0.35], [349.6, "whoosh-short", 0.35], [424.6, "whoosh-short", 0.35],
  [442.85, "whoosh-short", 0.35], [483.4, "whoosh", 0.4], [517.35, "whoosh", 0.4], [526.2, "whoosh-short", 0.3]]) cue(S(s), f, vol);

// S1: the prompt's four parts, a panel in the free area right of Gemini's reply
const P = spec.anchors.s1panel; // source px of the free area
const s1t = [V(9.05), V(12.71), V(15.21), V(20.87)];
show("#s1p", s1t[0] - 0.25, { x: 40 }, 0.4, "power3.out");
s1t.forEach((t, i) => { show(`#s1i${i}`, t, { x: 40, scale: 0.9 }, 0.45); cue(t, "pop", 0.4); });
hide("#s1p", S(75.9) - 1.6, { x: 40 }, 0.4);

// cam-space labels: place at an anchor (source px), show/hide at final times
const tag = (sel, id, dx, dy, t0, t1, sound) => {
  const a = A(id);
  js.push(`  tl.set("${sel}", { x: ${Math.round(a.x + dx)}, y: ${Math.round(a.y + dy)} }, 0);`);
  show(sel, t0, { scale: 0.6 }, 0.4, "back.out(2)");
  if (t1) hide(sel, t1, { scale: 0.9 }, 0.3);
  if (sound) cue(t0, ...sound);
};
tag("#t_folder", "s3_folder", -674, 77, S(127.6), S(136.0) - 0.15); // left of Explorer, level with the rename row: above it, it covered two file names
cue(S(127.4), "typing", 0.22, Math.max(0.5, S(135.1) - S(127.4)));
tag("#t_files", "s3_files", 0, 70, S(159.5), Math.min(S(166.7) - 0.3, S(159.5) + 5.5), ["success", 0.38]); // the 2nd file lands at 159.48
tag("#t_chip", "s5_chip", 0, 0, S(254.7), S(258.3) - 0.35, ["success", 0.38]); // gone before the cut at 258.3
// the Explorer window closes at 323.85: the ticks are gone by then
for (const [id, s] of [["s6_bgm1", 311.0], ["s6_bgm2", 317.0], ["s6_video", 322.5]]) tag(`#t_${id}`, id, 0, 0, S(s), S(323.85) - 0.4, ["success", 0.36]);
// left of the Speaker settings panel (x ≥ 1080), level with its filter chips: above them it hid "Search 2,000+ voices"
tag("#t_masc", "s7a_masc", -590, 35, S(375.72), S(379.3) - 0.2); // when the Pitch chip first reads 'Medium'
tag("#t_sad", "s7b_sad", -285, 60, S(401.7), S(401.7) + 3.6, ["ping", 0.45]); // left of the Sadaltager row (above it hid Rasalgethi)
tag("#t_temp", "s7b_temp", -38, 139, S(420.7) + 0.25, S(420.9) - 0.25, ["pop", 0.4]); // under the slider (above it hid 'Model settings')
tag("#t_vo", "s7b_type", 900, 36, S(429.7), S(434.6) - 0.2); // right of the renamed row, past the Explorer window
cue(S(429.6), "typing", 0.22, Math.max(0.5, S(433.3) - S(429.6)));
tag("#t_4", "s7b_4files", 216, 265, S(439.05), S(441.8) - 0.3, ["success", 0.45]); // under the 4 rows; Explorer starts closing at 441.8
tag("#t_opus", "s8_opus", 40, 406, S(452.65), S(455.0) - 0.2); // below the model badge (nothing free beside it); after the cursor leaves the badge
(spec.anchors.s8_ticks ?? []).forEach((a, i) => {
  const t0 = S(483.4) + 4.4 + i * 0.85;
  js.push(`  tl.set("#tk${i}", { x: ${Math.round(a.x)}, y: ${Math.round(a.y)} }, 0);`);
  show(`#tk${i}`, t0, { scale: 0.3 }, 0.35, "back.out(2.6)");
  hide(`#tk${i}`, S(506.7) - 0.3, { scale: 0.8 }, 0.25); // gone before the cut at 506.7 (S(517.35) is after it)
  cue(t0, "click-soft", 0.32);
});
// drag trails (ghosts of the glow) come from the onUpdate tween

// S8: the DM banner (page space)
const dmA = V(419.86) - 0.15, dmB = S(517.35) - 0.35;
show("#dm", dmA, { y: 90, scale: 0.92 }, 0.55, "back.out(1.7)"); cue(dmA, "impact-bass-2", 0.5);
for (let t = dmA + 1.2; t < dmB - 0.8; t += 1.4) {
  js.push(`  tl.to("#dm", { boxShadow: "0px 0px 0px 3px rgba(120,235,255,1), 0px 0px 70px 12px rgba(60,210,255,0.55), 0px 18px 50px 0px rgba(0,0,0,0.6)", duration: 0.55, ease: "sine.out" }, ${f3(t)});`);
  js.push(`  tl.to("#dm", { boxShadow: "0px 0px 0px 2px rgba(120,235,255,0.75), 0px 0px 36px 2px rgba(60,210,255,0.35), 0px 18px 50px 0px rgba(0,0,0,0.6)", duration: 0.6, ease: "sine.in" }, ${f3(t + 0.56)});`);
}
hide("#dm", dmB, { y: 60 }, 0.35); cue(dmB, "whoosh-short", 0.3);

// S9 callouts (page space, top centre)
const call = (sel, t0, t1, sound) => { show(sel, t0, { y: -40, scale: 0.9 }, 0.45, "back.out(1.8)"); hide(sel, t1, { y: -30 }, 0.3); cue(t0, ...sound); };
call("#k1", S(526.2) + 0.5, S(533.1) - 0.2, ["sparkle", 0.42]);
call("#k2", S(538.5) + 0.1, S(545.5), ["whoosh-short", 0.34]);
call("#k3", S(555.45) + 0.12, SE - 0.4, ["impact-bass-1", 0.6]);
cue(S(555.45), "glitch-1", 0.35);

// ════════════════ OUTRO (SE – TOTAL) ════════════════
const O = { in: SE, o1: SE + 0.55, o1out: SE + 7.6, cod: S(575.33) - 0.1, vid: S(577.41) - 0.1, aut: S(579.07) - 0.1, dm: S(584.45) - 0.4, dmout: S(591.0) - 0.6, vip: S(591.0) - 0.1, l2: S(595.31) + 2.6, cut: TL.outro[1].at };
// the clip ends at SE but the monitor flies off until SE + 0.35: its last frame stands in (the first-frame poster showed)
js.push(`  tl.set("#posterEnd", { autoAlpha: 1 }, ${f3(SE - 0.5)});`);
js.push(`  tl.to("#stage", { x: 520, y: 30, scale: 0.42, autoAlpha: 0, skewY: -2, duration: 0.7, ease: "power3.in" }, ${f3(SE - 0.35)});`);
cue(SE - 0.3, "whoosh-cinematic", 0.5);
js.push(`  tl.set("#faceB", { display: "block" }, ${f3(SE - 0.4)});`);
show("#faceB", O.in, { x: -160, scale: 0.92 }, 0.8, "power3.out");
js.push(`  tl.fromTo("#faceB .streak", { x: -700 }, { x: 900, duration: 2.2, ease: "power2.inOut", immediateRender: false }, ${f3(O.in + 1.2)});`);
show("#o1", O.o1, { x: 80 }, 0.5, "power3.out"); cue(O.o1, "success", 0.4);
js.push(`  tl.fromTo("#o1 .icbox", { scale: 0.3 }, { scale: 1, duration: 0.5, ease: "back.out(2.6)", immediateRender: false }, ${f3(O.o1 + 0.15)});`);
hide("#o1", O.o1out, { x: -60 });
show("#o2", O.cod - 0.3, { y: 0 }, 0.2, "none");
[["#o2a", O.cod], ["#o2b", O.vid], ["#o2c", O.aut]].forEach(([sel, t]) => { show(sel, t, { y: 40, scale: 0.7 }, 0.45, "back.out(2.2)"); cue(t, "pop", 0.42); });
show("#o3", O.dm, { y: 40, scale: 0.9 }, 0.5, "back.out(1.8)"); cue(O.dm, "notification", 0.42);
for (let t = O.dm + 1.0; t < O.dmout - 0.6; t += 1.25) {
  js.push(`  tl.to("#o3", { scale: 1.04, duration: 0.5, ease: "sine.out" }, ${f3(t)});`);
  js.push(`  tl.to("#o3", { scale: 1, duration: 0.55, ease: "sine.in" }, ${f3(t + 0.52)});`);
}
hide("#o2", O.dmout, { y: -30 }); hide("#o3", O.dmout, { y: 30 });
show("#o4", O.vip, { scale: 0.85 }, 0.55, "back.out(1.7)"); cue(O.vip, "impact-bass-2", 0.5);
js.push(`  tl.fromTo("#o4 .big .metal", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: 1.2, ease: "sine.inOut", immediateRender: false }, ${f3(O.vip + 0.7)});`);
show("#o4 .l2", O.l2, { y: 20 }, 0.45, "power3.out"); cue(O.l2, "sparkle", 0.4);
js.push(`  tl.fromTo("#o4 .big .metal", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: 1.2, ease: "sine.inOut", immediateRender: false }, ${f3(O.l2 + 0.6)});`);
// the outro cut: a small push hides the jump, settling back to 1× by the end
js.push(`  tl.fromTo("#faceB .vid", { scale: 1.07 }, { scale: 1, duration: ${f3(TOTAL - O.cut - 0.05)}, ease: "sine.out", immediateRender: false }, ${f3(O.cut)});`);
cue(TOTAL - 1.7, "chime", 0.3);
js.push(`  tl.fromTo("#fade", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "sine.in", immediateRender: false }, ${f3(TOTAL - 0.55)});`);

// background drift for the whole video
js.push(`  tl.fromTo("#grid", { y: 0 }, { y: -96, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);
js.push(`  tl.fromTo("#dust1", { y: 0 }, { y: -260, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);
js.push(`  tl.fromTo("#dust2", { y: 0 }, { y: -420, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);

// ── particles: one element per layer, many gradients ──
let seed = 9;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const dust = (n, col, rmax) => Array.from({ length: n }, () => {
  const x = Math.round(rnd() * 1920), y = Math.round(rnd() * 1500), r = (1.5 + rnd() * rmax).toFixed(1);
  return `radial-gradient(circle at ${x}px ${y}px, ${col} 0px, rgba(0,0,0,0) ${r}px)`;
}).join(",");

const s1labels = ["Video Analysis", "Voice Script", "BGM Prompts", "Claude Code Prompt"];
const css = `
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
body { margin: 0; background: #07090E; }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #07090E; font-family: "Inter", "Hind Siliguri", sans-serif; color: #EAF2FF; }
#bg { position: absolute; inset: 0; background: linear-gradient(160deg, #07090E 0%, #0B0F18 45%, #111622 100%); }
#grid { position: absolute; left: -40px; top: -40px; width: 2000px; height: 1300px;
  background-image: linear-gradient(rgba(90,200,255,0.07) 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, rgba(90,200,255,0.07) 1px, rgba(0,0,0,0) 1px);
  background-size: 96px 96px; }
#vgn { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 75% at 50% 45%, rgba(7,9,14,0) 40%, rgba(7,9,14,0.85) 100%); }
.dust { position: absolute; left: 0; top: 0; width: 1920px; height: 1500px; opacity: 0.7; }
.ic { display: block; }
/* glass portrait frame */
.face { position: absolute; left: 170px; top: 60px; width: 540px; height: 960px; border-radius: 30px; overflow: hidden; visibility: hidden; opacity: 0;
  box-shadow: 0px 0px 0px 2px rgba(150,230,255,0.55), 0px 0px 0px 6px rgba(255,214,140,0.10), 0px 0px 60px 6px rgba(60,200,255,0.22), 0px 40px 90px 0px rgba(0,0,0,0.7); }
.face .vid { position: absolute; inset: 0; transform-origin: 50% 40%; }
.face video { position: absolute; left: 0; top: 0; width: 540px; height: 960px; object-fit: cover; }
.face .gl { position: absolute; inset: 0; border-radius: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0) 55%, rgba(120,220,255,0.06) 100%); }
.face .streak { position: absolute; left: 0; top: -200px; width: 160px; height: 1400px; transform: rotate(18deg); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%); }
#faceB { display: none; }
/* cards (intro / outro), right column */
.card { position: absolute; left: 800px; width: 980px; box-sizing: border-box; padding: 46px 54px; border-radius: 28px; visibility: hidden; opacity: 0;
  background: linear-gradient(160deg, rgba(24,31,46,0.94) 0%, rgba(11,14,23,0.95) 100%); }
.card .row { display: flex; align-items: center; gap: 34px; }
.icbox { flex: none; width: 112px; height: 112px; border-radius: 26px; display: flex; align-items: center; justify-content: center; }
.kick { font-size: 34px; font-weight: 600; color: #A9B8D3; line-height: 1.25; text-wrap: balance; }
.main { font-size: 62px; font-weight: 800; line-height: 1.1; color: #FFFFFF; margin-top: 6px; text-wrap: balance; }
.meter { position: relative; margin-top: 34px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.08); overflow: hidden; }
.meter .fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; border-radius: 10px; transform-origin: 0 50%; }
#c1 { top: 360px; box-shadow: 0px 0px 0px 2px rgba(255,90,105,0.8), 0px 0px 50px 2px rgba(255,77,94,0.25), 0px 30px 70px 0px rgba(0,0,0,0.6); }
#c1 .icbox { background: rgba(255,77,94,0.16); box-shadow: inset 0px 0px 0px 2px rgba(255,90,105,0.7); }
#c2 { top: 300px; padding: 52px 40px; box-shadow: 0px 0px 0px 2px rgba(110,220,255,0.6), 0px 0px 50px 2px rgba(60,200,255,0.18), 0px 30px 70px 0px rgba(0,0,0,0.6); }
#c2 .flow { display: flex; align-items: center; justify-content: center; gap: 0px; }
.node { width: 252px; height: 190px; box-sizing: border-box; border-radius: 22px; padding: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center;
  background: rgba(14,20,32,0.95); box-shadow: 0px 0px 0px 2px rgba(110,220,255,0.65); visibility: hidden; opacity: 0; }
.node span { font-size: 30px; font-weight: 700; line-height: 1.15; }
#d3 span { color: #FFE2A0; }
.arw { position: relative; width: 84px; height: 24px; flex: none; }
.arw .shaft { position: absolute; left: 6px; top: 10px; width: 64px; height: 4px; border-radius: 2px; background: #6EDCFF; transform-origin: 0 50%; transform: scaleX(0); }
.arw .head { position: absolute; left: 56px; top: 0px; visibility: hidden; opacity: 0; }
.arw .pulse { position: absolute; left: 4px; top: 6px; width: 12px; height: 12px; border-radius: 6px; background: #FFFFFF; box-shadow: 0px 0px 14px 4px rgba(120,230,255,0.9); visibility: hidden; opacity: 0; }
#c3 { top: 340px; box-shadow: 0px 0px 0px 2px rgba(255,200,61,0.85), 0px 0px 50px 2px rgba(255,200,61,0.2), 0px 30px 70px 0px rgba(0,0,0,0.6); }
#c3 .icbox { background: rgba(255,200,61,0.14); box-shadow: inset 0px 0px 0px 2px rgba(255,200,61,0.7); }
#c3 .fill { background: #FFC83D; }
#c4 { top: 270px; padding: 50px 56px 54px; background: linear-gradient(160deg, rgba(46,34,12,0.96) 0%, rgba(16,12,6,0.97) 100%);
  box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.9), 0px 0px 80px 6px rgba(240,180,70,0.35), 0px 30px 80px 0px rgba(0,0,0,0.65); }
#c4 .icbox { background: rgba(246,200,100,0.16); box-shadow: inset 0px 0px 0px 2px rgba(246,214,138,0.8); }
#c4 .big { font-size: 88px; font-weight: 900; line-height: 1.05; transform-origin: 0% 60%; visibility: hidden; opacity: 0; } /* slams in at I.max; visible before it, the card showed it twice */
#c4 .fill { transform: scaleX(0.12); }
#c4 .fill { background: linear-gradient(90deg, #6EDCFF 0%, #F7D27A 100%); }
#c4 .l2 { margin-top: 30px; font-size: 40px; font-weight: 700; line-height: 1.25; color: #FFF3D6; visibility: hidden; opacity: 0; }
#c4 .l2 b { color: #F7D27A; }
.metal { color: #E9C46A; -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(100deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 58%),
    linear-gradient(180deg, #FFF5D6 0%, #F7DA8E 20%, #DDAD4F 42%, #A9762A 55%, #E2B456 70%, #FFF2C6 90%);
  background-size: 260% 100%, 100% 100%; background-position: 160% 0%, 0% 0%; background-repeat: no-repeat; }
/* the monitor */
#stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 50% 50%; visibility: hidden; opacity: 0; }
#floor { position: absolute; left: 260px; top: 990px; width: 1400px; height: 120px; border-radius: 50%; background: radial-gradient(ellipse closest-side, rgba(70,200,255,0.20) 0%, rgba(70,200,255,0) 100%); }
#mon { position: absolute; left: 92px; top: 26px; width: 1736px; height: 987px; border-radius: 24px; background: linear-gradient(180deg, #1B2333 0%, #0C111B 100%);
  box-shadow: 0px 0px 0px 1px rgba(150,230,255,0.45), 0px 0px 44px 2px rgba(60,200,255,0.25), 0px 0px 110px 10px rgba(230,180,80,0.10), 0px 36px 90px 0px rgba(0,0,0,0.7); }
#scr { position: absolute; left: 12px; top: 12px; width: 1712px; height: 963px; border-radius: 14px; overflow: hidden; background: #000000; }
#camk { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; transform: scale(${K}); }
#cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
#cam video, #cam img.poster { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
#posterEnd { visibility: hidden; opacity: 0; }
#scr .gl { position: absolute; inset: 0; border-radius: 14px; background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 30%); }
#glow { position: absolute; left: 0; top: 0; width: 140px; height: 140px; margin: -70px 0 0 -70px; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, rgba(110,230,255,0) 0%, rgba(110,230,255,0.10) 14%, rgba(255,205,110,0.30) 26%, rgba(110,230,255,0.12) 46%, rgba(110,230,255,0) 70%); }
#glow::after { content: ""; position: absolute; left: 53px; top: 53px; width: 34px; height: 34px; box-sizing: border-box; border-radius: 50%; border: 3px solid rgba(130,235,255,0.95);
  box-shadow: 0px 0px 12px 2px rgba(255,200,90,0.75), inset 0px 0px 8px 1px rgba(255,200,90,0.45); }
.ghost { position: absolute; left: 0; top: 0; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; opacity: 0; background: rgba(140,235,255,0.55); box-shadow: 0px 0px 16px 4px rgba(255,205,110,0.5); }
.ring { position: absolute; left: 0; top: 0; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; box-sizing: border-box; visibility: hidden; opacity: 0;
  border: 4px solid rgba(150,240,255,0.95); box-shadow: 0px 0px 30px 4px rgba(255,200,90,0.7), inset 0px 0px 22px 2px rgba(255,200,90,0.45); }
/* cam-space labels (source px; x,y = their centre-bottom point) */
.tag { position: absolute; left: 0; top: 0; visibility: hidden; opacity: 0; white-space: nowrap; transform-origin: 0 0; }
.tag .in { position: relative; left: 0; transform: translate(-50%, -100%); display: flex; align-items: center; gap: 14px; padding: 12px 26px; border-radius: 999px;
  font-size: 34px; font-weight: 800; color: #FFFFFF; background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.9), 0px 0px 28px 2px rgba(60,200,255,0.35), 0px 12px 30px 0px rgba(0,0,0,0.6); }
.tag.gold .in { color: #FFF3D6; box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 40px 4px rgba(240,180,70,0.45), 0px 12px 30px 0px rgba(0,0,0,0.6); }
.tag.green .in { box-shadow: 0px 0px 0px 2px rgba(80,230,150,0.95), 0px 0px 28px 2px rgba(60,220,140,0.35), 0px 12px 30px 0px rgba(0,0,0,0.6); }
.tag.bn .in { font-family: "Hind Siliguri", "Inter", sans-serif; font-weight: 700; letter-spacing: 0; }
.tag.box .in { transform: translate(-50%, -50%); padding: 0; border-radius: 16px; background: rgba(0,0,0,0); }
.tick { position: absolute; left: 0; top: 0; visibility: hidden; opacity: 0; transform-origin: 0 0; }
.tick .in { transform: translate(-50%, -50%); width: 46px; height: 46px; border-radius: 23px; background: #1FC77A; display: flex; align-items: center; justify-content: center;
  box-shadow: 0px 0px 0px 3px rgba(10,30,20,0.9), 0px 0px 22px 4px rgba(60,230,150,0.6); }
.tick.sm .in { width: 26px; height: 26px; border-radius: 13px; box-shadow: 0px 0px 0px 2px rgba(10,30,20,0.9), 0px 0px 14px 3px rgba(60,230,150,0.6); } /* on Claude's 18 px task circles, 42 px apart */
/* page-space overlays */
#s1p { position: absolute; left: 0; top: 0; width: 328px; visibility: hidden; opacity: 0; display: flex; flex-direction: column; gap: 14px; }
.s1i { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-radius: 18px; visibility: hidden; opacity: 0;
  background: rgba(8,12,20,0.95); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.85), 0px 0px 26px 2px rgba(60,200,255,0.3), 0px 12px 30px 0px rgba(0,0,0,0.55); }
.s1i .n { flex: none; width: 52px; height: 52px; border-radius: 26px; background: linear-gradient(180deg, #F9DE98 0%, #D9A443 100%); color: #1A1205; font-family: "Hind Siliguri", "Inter", sans-serif; font-weight: 700; font-size: 32px; display: flex; align-items: center; justify-content: center; letter-spacing: 0; }
.s1i span { font-size: 29px; font-weight: 800; line-height: 1.15; color: #FFFFFF; }
#chip { position: absolute; left: 1590px; top: 66px; visibility: hidden; opacity: 0; display: flex; align-items: center; gap: 12px; padding: 10px 24px 10px 18px; border-radius: 999px;
  background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(255,210,120,0.95), 0px 0px 30px 4px rgba(240,180,70,0.4); }
#chipv { font-size: 38px; font-weight: 900; color: #FFE2A0; }
#wave { position: absolute; left: 660px; top: 880px; width: 600px; height: 90px; visibility: hidden; opacity: 0; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 26px; box-sizing: border-box;
  border-radius: 45px; background: rgba(8,12,20,0.88); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.7), 0px 0px 30px 2px rgba(60,200,255,0.3); }
#wave i { display: block; width: 7px; height: 56px; border-radius: 4px; background: linear-gradient(180deg, #8CEBFF 0%, #F7D27A 100%); transform-origin: 50% 50%; }
#dm { position: absolute; left: 160px; top: 892px; width: 1600px; box-sizing: border-box; visibility: hidden; opacity: 0; display: flex; align-items: center; justify-content: center; gap: 22px; padding: 20px 34px; border-radius: 999px;
  background: linear-gradient(180deg, rgba(10,18,32,0.97) 0%, rgba(6,10,18,0.97) 100%); box-shadow: 0px 0px 0px 2px rgba(120,235,255,0.75), 0px 0px 36px 2px rgba(60,210,255,0.35), 0px 18px 50px 0px rgba(0,0,0,0.6); }
#dm span { font-size: 34px; font-weight: 800; color: #FFFFFF; white-space: nowrap; }
#dm b { color: #F7D27A; }
.call { position: absolute; top: 60px; left: 0; width: 1920px; display: flex; justify-content: center; visibility: hidden; opacity: 0; }
.call .in { display: flex; align-items: center; gap: 18px; padding: 16px 34px; border-radius: 999px; background: rgba(8,12,20,0.95);
  box-shadow: 0px 0px 0px 2px rgba(120,235,255,0.9), 0px 0px 40px 4px rgba(60,210,255,0.35), 0px 16px 40px 0px rgba(0,0,0,0.6); }
.call span { font-size: 42px; font-weight: 800; color: #FFFFFF; }
#k1 { top: 996px; } /* below the effort submenu's 'Extra' row and its tooltip; the model dropdown opens at the top */
#k3 .in { box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 50px 6px rgba(240,180,70,0.45), 0px 16px 40px 0px rgba(0,0,0,0.6); }
#k3 span { color: #FFE9B8; }
/* outro */
#o1 { top: 330px; box-shadow: 0px 0px 0px 2px rgba(80,230,150,0.85), 0px 0px 50px 2px rgba(60,220,140,0.22), 0px 30px 70px 0px rgba(0,0,0,0.6); }
#o1 .icbox { background: rgba(60,220,140,0.14); box-shadow: inset 0px 0px 0px 2px rgba(80,230,150,0.7); }
#o2 { position: absolute; left: 800px; top: 230px; width: 980px; display: flex; justify-content: space-between; visibility: hidden; opacity: 0; }
.tile { width: 300px; height: 250px; box-sizing: border-box; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; visibility: hidden; opacity: 0;
  background: linear-gradient(160deg, rgba(24,31,46,0.95) 0%, rgba(11,14,23,0.96) 100%); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.7), 0px 0px 40px 2px rgba(60,200,255,0.2), 0px 24px 60px 0px rgba(0,0,0,0.6); }
.tile span { font-size: 38px; font-weight: 800; }
#o3 { position: absolute; left: 800px; top: 590px; width: 980px; box-sizing: border-box; visibility: hidden; opacity: 0; display: flex; align-items: center; gap: 22px; padding: 28px 36px; border-radius: 999px;
  background: linear-gradient(180deg, rgba(10,18,32,0.97) 0%, rgba(6,10,18,0.97) 100%); box-shadow: 0px 0px 0px 3px rgba(120,235,255,0.95), 0px 0px 50px 6px rgba(60,210,255,0.4), 0px 18px 50px 0px rgba(0,0,0,0.6); }
#o3 span { font-size: 38px; font-weight: 800; line-height: 1.2; }
#o3 b { color: #F7D27A; }
#o4 { top: 250px; padding: 54px 58px; background: linear-gradient(160deg, rgba(46,34,12,0.97) 0%, rgba(16,12,6,0.97) 100%);
  box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 90px 8px rgba(240,180,70,0.35), 0px 30px 80px 0px rgba(0,0,0,0.65); }
#o4 .icbox { background: rgba(246,200,100,0.16); box-shadow: inset 0px 0px 0px 2px rgba(246,214,138,0.8); }
#o4 .vip { font-size: 30px; font-weight: 800; color: #F7D27A; }
#o4 .big { font-size: 70px; font-weight: 900; line-height: 1.08; margin-top: 8px; }
#o4 .l2 { margin-top: 34px; visibility: hidden; opacity: 0; }
#o4 .l2 div { font-size: 42px; font-weight: 800; line-height: 1.25; color: #FFF3D6; }
#o4 .l2 .p { font-size: 36px; font-weight: 700; color: #F7D27A; margin-top: 6px; }
#fade { position: absolute; inset: 0; background: #000000; visibility: hidden; opacity: 0; }
`;

const tagHTML = (id, inner, cls = "") => `<div class="tag ${cls}" id="${id}"><div class="in">${inner}</div></div>`;
const NWAVE = 44;
const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Claude দিয়ে কমার্শিয়াল ভিডিও — টিউটোরিয়াল</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-fps="60" data-duration="${f3(TOTAL)}">
      <div id="bg"></div>
      <div id="grid" data-layout-allow-overflow></div>
      <i class="dust" id="dust1" data-layout-allow-overflow style="background-image:${dust(26, "rgba(140,230,255,0.75)", 2.6)}"></i>
      <i class="dust" id="dust2" data-layout-allow-overflow style="background-image:${dust(18, "rgba(255,214,140,0.7)", 3.2)}"></i>
      <div id="vgn"></div>

      <div class="face" id="faceA"><div class="vid"><video id="introvid" src="assets/media/intro.mp4" muted playsinline data-start="0" data-duration="${f3(TL.intro.b)}" data-track-index="0"></video></div><div class="gl"></div><div class="streak" data-layout-allow-overflow></div></div>

      <div class="card" id="c1"><div class="row"><div class="icbox">${icon("x", 66, "#FF5A69", 3)}</div><div><div class="kick">Traditional Ad Cost:</div><div class="main">High $$$ &amp; Slow Delivery</div></div></div></div>
      <div class="card" id="c2"><div class="flow">
        <div class="node" id="d1">${icon("sparkles", 58, "#8CEBFF")}<span>Claude AI</span></div>
        <div class="arw" id="a1"><i class="shaft"></i><i class="head">${icon("arrow", 24, "#6EDCFF", 3)}</i><i class="pulse"></i></div>
        <div class="node" id="d2">${icon("zap", 58, "#8CEBFF")}<span>Motion Graphics Engine</span></div>
        <div class="arw" id="a2"><i class="shaft"></i><i class="head">${icon("arrow", 24, "#6EDCFF", 3)}</i><i class="pulse"></i></div>
        <div class="node" id="d3">${icon("clapper", 58, "#F7D27A")}<span>Commercial Grade Ad</span></div>
      </div></div>
      <div class="card" id="c3"><div class="row"><div class="icbox">${icon("alert", 64, "#FFC83D", 2.6)}</div><div><div class="kick">Standard Pro Plan:</div><div class="main">Low Usage Limit</div></div></div><div class="meter"><i class="fill"></i></div></div>
      <div class="card" id="c4"><div class="row"><div class="icbox">${icon("rocket", 66, "#F7D27A", 2.4)}</div><div class="big"><span class="metal">CLAUDE MAX POWER</span></div></div>
        <div class="meter"><i class="fill"></i></div>
        <div class="l2">Massive Usage Limit + <b><span id="ten">10</span>x</b> Production Output</div></div>

      <div id="stage">
        <div id="floor" data-layout-allow-overflow></div>
        <div id="mon"><div id="scr"><div id="camk"><div id="cam">
          <img class="poster" id="poster" src="assets/media/screen_poster.jpg" alt="" />
          <img class="poster" id="posterEnd" src="assets/media/screen_last.jpg" alt="" />
          <video id="scrvid" src="assets/media/screen.mp4" muted playsinline data-start="${f3(SA)}" data-duration="${f3(SE - SA)}" data-track-index="1"></video>
          ${[0, 1, 2].map((i) => `<div class="ghost" id="gh${i}"></div>`).join("")}
          <div id="glow"></div>
          ${[0, 1, 2, 3].map((i) => `<div class="ring" id="ring${i}"></div>`).join("")}
          ${tagHTML("t_folder", `${icon("check", 30, "#8CEBFF", 3)}<span>ফোল্ডার: Claude Video Create</span>`, "bn")}
          ${tagHTML("t_files", `${icon("ccheck", 34, "#5BE39B", 2.6)}<span>২টা ফাইল জমা</span>`, "bn green")}
          ${tagHTML("t_chip", `<div style="width:${Math.round((A("s5_chip").w ?? 260) + 24)}px;height:${Math.round((A("s5_chip").h ?? 56) + 20)}px;border-radius:16px;box-shadow:0px 0px 0px 3px rgba(80,230,150,0.95),0px 0px 30px 6px rgba(60,220,140,0.5)"></div>`, "box")}
          ${["s6_bgm1", "s6_bgm2", "s6_video"].map((id) => `<div class="tick" id="t_${id}"><div class="in">${icon("check", 30, "#FFFFFF", 3.4)}</div></div>`).join("")}
          ${tagHTML("t_masc", `<span>Masculine · Medium</span>`)}
          ${tagHTML("t_sad", `${icon("sparkles", 32, "#F7D27A")}<span>Sadaltager</span>`, "gold")}
          ${tagHTML("t_temp", `<span>Temperature 0.7</span>`, "gold")}
          ${tagHTML("t_vo", `<span>VoiceOverClaude</span>`)}
          ${tagHTML("t_4", `${icon("flame", 36, "#FFB347", 2.6)}<span>All 4 Assets Ready!</span>`, "gold")}
          ${tagHTML("t_opus", `<span>Opus 5.5 · Extra</span>`, "gold")}
          ${(spec.anchors.s8_ticks ?? []).map((_, i) => `<div class="tick sm" id="tk${i}"><div class="in">${icon("check", 18, "#FFFFFF", 3.6)}</div></div>`).join("")}
        </div></div><div class="gl"></div></div></div>
      </div>

      <div id="s1p" style="left:${Math.round(MX + P.x * K)}px;top:${Math.round(MY + P.y * K)}px">${s1labels.map((l, i) => `<div class="s1i" id="s1i${i}"><div class="n">${"১২৩৪"[i]}</div><span>${l}</span></div>`).join("")}</div>
      <div id="chip">${icon("ff", 34, "#F7D27A", 2.4)}<span id="chipv">2×</span></div>
      <div id="wave">${Array.from({ length: NWAVE }, (_, i) => `<i id="wb${i}"></i>`).join("")}</div>
      <div id="dm">${icon("chat", 44, "#8CEBFF", 2.4)}<span>Comment <b>'DM'</b> Below to Get the Complete Claude Code Video Creation Prompt Pack!</span></div>
      <div class="call" id="k1"><div class="in">${icon("sparkles", 44, "#8CEBFF")}<span>Dynamic Cursor Glow</span></div></div>
      <div class="call" id="k2"><div class="in">${icon("ruler", 44, "#8CEBFF")}<span>3D Perspective Tilt</span></div></div>
      <div class="call" id="k3"><div class="in">${icon("bomb", 44, "#F7D27A")}<span>Bombastic Golden End-Screen Transition</span></div></div>

      <div class="face" id="faceB"><div class="vid"><video id="outrovid" src="assets/media/outro.mp4" muted playsinline data-start="${f3(SE)}" data-duration="${f3(TOTAL - SE)}" data-track-index="2"></video></div><div class="gl"></div><div class="streak" data-layout-allow-overflow></div></div>
      <div class="card" id="o1"><div class="row"><div class="icbox">${icon("ccheck", 66, "#5BE39B", 2.4)}</div><div><div class="main">100% Automated</div><div class="kick" style="margin-top:10px">via Claude Code + Max Plan</div></div></div></div>
      <div id="o2"><div class="tile" id="o2a">${icon("code", 80, "#8CEBFF", 2.4)}<span>Coding</span></div><div class="tile" id="o2b">${icon("clapper", 80, "#8CEBFF", 2.2)}<span>Video</span></div><div class="tile" id="o2c">${icon("zap", 80, "#F7D27A", 2.2)}<span>Automation</span></div></div>
      <div id="o3">${icon("mail", 56, "#8CEBFF", 2.2)}<span>Send Personal Message or Comment <b>'DM'</b></span></div>
      <div class="card" id="o4"><div class="row"><div class="icbox">${icon("key", 64, "#F7D27A", 2.4)}</div><div><div class="vip">VIP</div><div class="big"><span class="metal">CLAUDE CODE SETUP SERVICE</span></div></div></div>
        <div class="l2"><div>Full Terminal Setup + Guidance</div><div class="p">(Affordable Price)</div></div></div>
      <div id="fade"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(TOTAL)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      gsap.set("#cam", { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      gsap.set("#stage", { x: 0, y: 0, scale: 1, skewY: 0, transformOrigin: "50% 50%" });
      // per-frame layer: cursor glow (+ drag ghosts), waveform bars, the 10x count-up
      const GA = ${f3(SA)}, GE = ${f3(SE)}, GH = ${GH};
      const GX = [${GX.join(",")}];
      const GY = [${GY.join(",")}];
      const GV = "${GV.join("")}";
      const DRAG = ${JSON.stringify(drags.map(([a, b]) => [+f3(a), +f3(b)]))};
      const WAVE = ${JSON.stringify(waits.map((w) => [+f3(w.a), +f3(w.b)]))};
      const glow = document.getElementById("glow");
      const gh = [0, 1, 2].map((i) => document.getElementById("gh" + i));
      const wb = Array.from({ length: ${NWAVE} }, (_, i) => document.getElementById("wb" + i));
      const ten = document.getElementById("ten");
      const pos = (t) => {
        const u = (t - GA) * GH, i = Math.floor(u);
        if (i < 0 || i + 1 >= GX.length) return null;
        const f = u - i, v = (GV[i] === "1" ? 1 - f : 0) + (GV[i + 1] === "1" ? f : 0);
        return { x: GX[i] + (GX[i + 1] - GX[i]) * f, y: GY[i] + (GY[i + 1] - GY[i]) * f, v };
      };
      const inAny = (t, list) => list.some((w) => t >= w[0] && t < w[1]);
      tl.to({}, { duration: ${f3(TOTAL)}, ease: "none", onUpdate() {
        const t = this.time();
        const p = t >= GA && t < GE - 0.3 ? pos(t) : null;
        if (p) { glow.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)"; glow.style.opacity = p.v.toFixed(3); }
        else glow.style.opacity = "0";
        const dr = inAny(t, DRAG);
        gh.forEach((g, k) => {
          const q = dr ? pos(t - 0.07 * (k + 1)) : null;
          if (q) { g.style.transform = "translate(" + q.x.toFixed(1) + "px," + q.y.toFixed(1) + "px) scale(" + (1 - 0.22 * k).toFixed(2) + ")"; g.style.opacity = (q.v * (0.6 - 0.16 * k)).toFixed(3); }
          else g.style.opacity = "0";
        });
        if (inAny(t, WAVE)) wb.forEach((b, k) => {
          const h = 0.18 + 0.82 * Math.abs(Math.sin(t * 7.3 + k * 0.9) * Math.sin(t * 3.1 + k * 0.37 + 1.3));
          b.style.transform = "scaleY(" + h.toFixed(3) + ")";
        });
        const c = Math.min(1, Math.max(0, (t - ${f3(I.ten)}) / 1.3));
        ten.textContent = String(Math.max(1, Math.round(1 + 9 * c * c * (3 - 2 * c))));
      } }, 0);
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
if (warn.some((w) => w.startsWith("whole-video"))) throw new Error(warn.join("\n"));
writeFileSync(path.join(PROJECT, "index.html"), html);
writeFileSync(path.join(import.meta.dirname, "cues.json"), JSON.stringify(cues.sort((a, b) => a.t - b.t)));
console.log(`✓ index.html (${f3(TOTAL)} s) · ${views.length} camera views · ${clicks.length} clicks · ${waits.length} ramps · cursor seen ${(coverage * 100).toFixed(0)} % of the screen part · ${cues.length} sound cues`);
for (const w of warn) console.log(`  ! ${w}`);
