// growth-curve.ts — "Growth Curve" (style MG2), a 6-second motion-graphics B-roll: a glowing line climbs through nine
// points whose heights are the Fibonacci numbers 1, 2, 3, 5, 8 … 55 (each rise φ times the last: golden growth),
// the camera follows its tip, pulls back as it gains speed, and the line hits the peak on the φ point, where a hex
// marker locks and the points below hop once in a wave. Plan: projects/broll-growth-curve/PLAN.md.
//   node tools/broll/growth-curve.ts projects/<name> [--res=4k|1080] [--silent]
//     → <project>/index.html (+ build/cues.json and assets/media/mix.wav unless --silent)
// Built on scene.ts (tokens, page, guards) and motion.ts (fibonacci, monotoneCubic, spring, bezier). Every per-frame
// value (tip, camera, tail, hops) is precomputed here or is a pure function of t in the page: seek-safe.
// Guards here: the points fall in the plan's beats (2 · 3 · 2 between the spark, 1.6 s, 3.0 s and the peak), the tip
// stays inside the frame while the camera follows it, the camera is exactly 1× from the hold on.
import path from "node:path";
import { C, FPS, H, STROKE, W, backdrop, f2, scene } from "./scene.ts";
import { cubicBezier, fibonacci, goldenPoint, monotoneCubic, mulberry32 } from "./motion.ts";
import type { Vec2 } from "./motion.ts";

const argv = process.argv.slice(2);
const dir = path.resolve(argv.find((a) => !a.startsWith("--")) ?? "");
const res: "4k" | "1080" = argv.includes("--res=1080") ? "1080" : "4k";
const silent = argv.includes("--silent");
const DUR = 6, FRAMES = DUR * FPS;
const T = { impact: 0.3, riser: 3.0, lock: 4.2, hold: 5.2 };

// ── composition: the peak on the φ point, the baseline low; point k at X = k/8 with height F(k + 2) / 55 ──
const P: Vec2 = goldenPoint(W, H);                          // (2373, 825)
const X0 = 700, Y0 = 1880, CW = P.x - X0, CH = Y0 - P.y;
const at = (X: number): Vec2 => ({ x: X0 + CW * X, y: Y0 - CH * fibonacci(2 + 8 * X) / 55 });
const N = 9, pts = Array.from({ length: N }, (_, k) => at(k / 8));
const SAMPLES = 640;                                        // a multiple of 8: every point is a sample
const curve = Array.from({ length: SAMPLES + 1 }, (_, i) => at(i / SAMPLES));
const arc = [0];
for (let i = 1; i <= SAMPLES; i++) arc.push(arc[i - 1] + Math.hypot(curve[i].x - curve[i - 1].x, curve[i].y - curve[i - 1].y));
const LT = arc[SAMPLES], ptArc = pts.map((_, k) => arc[(k * SAMPLES) / 8]);
const pointAt = (len: number): Vec2 => {
  if (len <= 0) return curve[0];
  if (len >= LT) return curve[SAMPLES];
  let lo = 0, hi = SAMPLES;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (arc[m] <= len) lo = m; else hi = m; }
  const a = (len - arc[lo]) / (arc[hi] - arc[lo]);
  return { x: curve[lo].x + (curve[hi].x - curve[lo].x) * a, y: curve[lo].y + (curve[hi].y - curve[lo].y) * a };
};

// ── the tip: each segment 15 % faster than the last (momentum), spark at 0.3 s, peak at exactly 4.2 s ──
const R = 1.15;
const raw = ptArc.slice(1).map((a, k) => (a - ptArc[k]) / Math.pow(R, k));
const k0 = (T.lock - T.impact) / raw.reduce((s, v) => s + v, 0);
const tk = [T.impact];
raw.forEach((d) => tk.push(tk[tk.length - 1] + d * k0));
tk[N - 1] = T.lock;
const drawn = monotoneCubic(tk, ptArc);                     // t → drawn length, never backwards
const count = (a: number, b: number): number => tk.filter((t) => t > a && t < b).length;
if (count(T.impact, 1.6) !== 2 || count(1.6, T.riser) !== 3 || count(T.riser, T.lock) !== 2)
  throw new Error(`points off the plan's beats: ${tk.map((t) => t.toFixed(2)).join(", ")}`);
const speed = (t: number): number => (t <= T.impact || t > T.lock ? 0 : (drawn(t) - drawn(t - 1 / 240)) * 240);
const TL_LOCK = Math.min(560, speed(T.lock) * 0.24);

// ── the camera: a critically damped follower on the tip (ω 5.5) at 1.45×, the tip held left of centre; from 3.4 s
//    it pulls back (smoothstep into the expo-out settle) and is exactly 1×, offset 0 from the hold on (§0d.1) ──
const settle = cubicBezier(0.16, 1, 0.3, 1);
const ZOOM = 1.45, ANCHOR: Vec2 = { x: 0.45 * W, y: 0.6 * H }, OMEGA = 5.5, PULL = 3.4;
const cam: number[] = [], tip: number[] = [];
let c: Vec2 = { ...pts[0] }, v: Vec2 = { x: 0, y: 0 }, tSim = 0;
const dt = 1 / 1200;
for (let f = 0; f <= FRAMES; f++) {
  const t = f / FPS;
  while (tSim < t - 1e-9) {
    const p = pointAt(drawn(tSim));
    v = { x: v.x + (OMEGA * OMEGA * (p.x - c.x) - 2 * OMEGA * v.x) * dt, y: v.y + (OMEGA * OMEGA * (p.y - c.y) - 2 * OMEGA * v.y) * dt };
    c = { x: c.x + v.x * dt, y: c.y + v.y * dt };
    tSim += dt;
  }
  const u = Math.min(1, Math.max(0, (t - PULL) / (T.hold - PULL))), b = t >= T.hold ? 1 : settle(u * u * (3 - 2 * u));
  const z = ZOOM + (1 - ZOOM) * b;
  const ox = (ANCHOR.x - P.x - ZOOM * (c.x - P.x)) * (1 - b), oy = (ANCHOR.y - P.y - ZOOM * (c.y - P.y)) * (1 - b);
  cam.push(z, ox, oy);
  const L = drawn(t), p = pointAt(L);
  tip.push(+L.toFixed(2), +p.x.toFixed(2), +p.y.toFixed(2), +speed(t).toFixed(1));
  // guard (§0i Space): while the line is drawing, its tip is on screen with a margin
  if (t >= T.impact && t <= T.lock) {
    const sx = P.x + z * (p.x - P.x) + ox, sy = P.y + z * (p.y - P.y) + oy;
    if (sx < 0.06 * W || sx > 0.94 * W || sy < 0.08 * H || sy > 0.92 * H) throw new Error(`the tip leaves the frame at ${t.toFixed(3)} s (${sx.toFixed(0)}, ${sy.toFixed(0)})`);
  }
  if (t >= T.hold && (z !== 1 || ox !== 0 || oy !== 0)) throw new Error(`camera not at 1× during the hold (${t.toFixed(3)} s)`);
}

// ── beats ──
const S = scene({ dir, res, silent, dur: DUR, title: "Growth Curve", focus: P });
const { tw, burst, cue, SETTLE, SPRING } = S;
// hook: fade up, the grid wipes on left to right behind a scan light, the axis draws
tw(`"#black"`, `opacity: 1`, `opacity: 0`, 0, 0.12, `"power2.out"`);
tw(`"#wipeR"`, `attr: { width: 0 }`, `attr: { width: ${W + 3200} }`, 0, 0.42, `"power2.inOut"`);
tw(`"#scan"`, `x: 0`, `x: ${W + 3420}`, 0, 0.42, `"power2.inOut"`);
cue(0, "whoosh-cinematic", 0.5);
const AXL = P.x + 600 - (X0 - 260);
tw(`"#axis"`, `strokeDashoffset: ${f2(AXL)}`, `strokeDashoffset: 0`, 0.04, 0.5, SETTLE);
// impact: the spark at the first point; the line appears and starts to climb
burst("sparkFlash", T.impact, 0.45, 0.2, 1.6, 1, pts[0]);
burst("sparkRing", T.impact, 0.75, 0.4, 3.4, 0.9, pts[0]);
burst("rays", T.impact, 0.55, 0.35, 1.7, 1, pts[0]);
tw(`"#curveG"`, `opacity: 0`, `opacity: 1`, T.impact, 0.05, `"power1.out"`);
tw(`"#tipG"`, `opacity: 0`, `opacity: 1`, T.impact, 0.06, `"power1.out"`);
cue(T.impact, "impact-bass-1", 0.55, 0.6);
// build: each point springs in as the tip passes it; every second one pings; drop lines fall to the axis
const drops: Array<{ k: number; len: number }> = [];
pts.forEach((p, k) => {
  if (k === N - 1) return;                                   // the peak has its own beat
  tw(`"#n${k}"`, `scale: 0`, `scale: 1`, tk[k], 0.9, SPRING(0.9));
  if (k % 2 === 1) burst(`p${k}`, tk[k] + 0.04, 0.6, 0.6, 3.2, 0.9, p);
  const len = Y0 - (p.y + 36);
  if (len >= 60) { drops.push({ k, len }); tw(`"#d${k}"`, `strokeDashoffset: ${f2(len)}`, `strokeDashoffset: 0`, tk[k] + 0.06, 0.5, SETTLE); }
  if (k >= 1 && k <= 5) cue(tk[k], "click-soft", 0.26);
});
// momentum: the riser under the steep climb (the tail and the tip's glow grow with speed, per frame)
cue(T.riser, "riser", 0.3, T.lock - T.riser);
// lock: the hex marker anticipates (pulls out 3 %), springs home and settles its rotation; flash, ripples, glow
tw(`"#n${N - 1}"`, `scale: 0`, `scale: 1`, T.lock, 0.9, SPRING(0.9));
tw(`"#tipG"`, `opacity: 1`, `opacity: 0`, T.lock, 0.12, `"power1.out"`);
tw(`"#hexM"`, `scale: 1.32, rotation: -24, opacity: 0`, `scale: 1.36, rotation: -26, opacity: 0.9`, T.lock - 0.22, 0.22, `"power2.out"`);
tw(`"#hexM"`, `scale: 1.36`, `scale: 1`, T.lock, 0.9, SPRING(0.9));
tw(`"#hexM"`, `rotation: -26`, `rotation: 0`, T.lock, 1.0, SETTLE);
tw(`"#ringA"`, `rotation: -40, opacity: 0`, `rotation: 0, opacity: 0.8`, T.lock + 0.05, 1.2, SETTLE);
tw(`"#peakGlow"`, `scale: 0.2, opacity: 0`, `scale: 1, opacity: 0.85`, T.lock, 0.9, SETTLE);
burst("flash", T.lock + 0.02, 0.8, 0.6, 2.6, 0.85, P);
burst("rip1", T.lock + 0.02, 1.0, 0.5, 3.4, 0.55, P);
burst("rip2", T.lock + 0.2, 1.0, 0.5, 2.6, 0.35, P);
cue(T.lock - 0.02, "impact-bass-2", 0.5);
cue(T.lock + 0.05, "sparkle", 0.38);
// the points below hop once, a wave running down the curve from the peak: spring impulse responses, per frame
const ZW = 14 / 2, WD = Math.sqrt(170 - ZW * ZW), tPeak = Math.atan(WD / ZW) / WD, NORM = 1 / (Math.exp(-ZW * tPeak) * Math.sin(WD * tPeak));
const HOP = pts.slice(0, N - 1).map((_, k) => [+(T.lock + 0.04 + (N - 2 - k) * 0.045).toFixed(3), +(30 * (0.5 + 0.5 * k / (N - 2)) * NORM).toFixed(3)]);
// hold: settled, 1×; the peak glow breathes once; grid and bokeh drift (sine)
cue(T.hold + 0.1, "sparkle", 0.18);
tw(`"#grid"`, `x: 0, y: 0`, `x: -40, y: -20`, 0, DUR, `"sine.inOut"`);
tw(`"#bokeh"`, `x: 0, y: 0`, `x: 60, y: -30`, 0, DUR, `"sine.inOut"`);

// ── SVG (4K units) ──
const rnd = mulberry32(20261031);
const { grid, bokeh } = backdrop({ x: X0 + CW / 2, y: (Y0 + P.y) / 2 }, rnd, 2600, 0.85);
const d = curve.map((p, i) => `${i ? "L" : "M"}${f2(p.x)} ${f2(p.y)}`).join(" ");
const hex = (r: number): string => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + k * Math.PI / 3; return `${f2(P.x + r * Math.cos(a))},${f2(P.y + r * Math.sin(a))}`; }).join(" ");
const s0 = pts[0];
const rays = Array.from({ length: 8 }, (_, k) => {
  const a = k * Math.PI / 4 + Math.PI / 8, c1 = Math.cos(a), s1 = Math.sin(a);
  return `<line x1="${f2(s0.x + 44 * c1)}" y1="${f2(s0.y + 44 * s1)}" x2="${f2(s0.x + 120 * c1)}" y2="${f2(s0.y + 120 * s1)}"/>`;
}).join("");
const pointSvg = pts.map((p, k) => {
  const r = k === N - 1 ? 20 : 10 + 6 * k / 8;
  const node = `<g id="n${k}" class="nd"><circle cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r * 3.2)}" fill="url(#halo)"/><circle cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r)}" fill="${C.hot}"/></g>`;
  return (k < N - 1 ? `<g id="hop${k}">${node}</g>` : node) +
    (k % 2 === 1 && k < N - 1 ? `<circle id="p${k}" cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r * 2)}" fill="none" stroke="${C.accent}" stroke-width="${STROKE.thin}" opacity="0"/>` : "");
}).join("");
const dropSvg = drops.map(({ k, len }) => `<line id="d${k}" x1="${f2(pts[k].x)}" y1="${f2(pts[k].y + 36)}" x2="${f2(pts[k].x)}" y2="${Y0}" stroke="${C.lineHi}" stroke-width="${STROKE.thin}" stroke-linecap="round" stroke-dasharray="${f2(len)}" stroke-dashoffset="${f2(len)}" opacity="0.75"/>`).join("");

const bg = `<defs><clipPath id="wipe"><rect id="wipeR" x="-1600" y="-1600" width="0" height="${H + 3200}"/></clipPath>
    <linearGradient id="scanG" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}" stop-opacity="0"/><stop offset="1" stop-color="${C.hot}" stop-opacity="0.9"/></linearGradient></defs>
    <g clip-path="url(#wipe)">${grid}</g>
    <rect id="scan" x="-1820" y="-1600" width="220" height="${H + 3200}" fill="url(#scanG)" opacity="0.8"/>`;
const defs = `<radialGradient id="halo"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowG"><stop offset="0" stop-color="${C.hot}" stop-opacity="0.9"/><stop offset="0.16" stop-color="${C.accent}" stop-opacity="0.55"/><stop offset="0.55" stop-color="${C.accent}" stop-opacity="0.1"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="areaG" gradientUnits="userSpaceOnUse" x1="0" y1="${f2(P.y)}" x2="0" y2="${Y0}"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.3"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0.04"/></linearGradient>
    <linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="areaM" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect id="areaR" x="${X0 - 14}" y="0" width="0" height="${H}" fill="#fff"/><rect id="areaF" x="${X0 - 14}" y="0" width="0" height="${H}" fill="url(#fadeR)"/></mask>
    <filter id="soft" x="-0.5" y="-0.5" width="2" height="2"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="bloom" x="-0.2" y="-0.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation="10"/></filter>`;
const sub = `
    <line id="axis" x1="${X0 - 260}" y1="${Y0}" x2="${f2(P.x + 600)}" y2="${Y0}" stroke="${C.lineHi}" stroke-width="${STROKE.thin}" stroke-linecap="round" stroke-dasharray="${f2(AXL)}" stroke-dashoffset="${f2(AXL)}" opacity="0.9"/>
    <g id="drops">${dropSvg}</g>
    <path id="area" d="${d} L${f2(P.x)} ${Y0} L${X0} ${Y0} Z" fill="url(#areaG)" mask="url(#areaM)"/>
    <g id="glowB"><circle id="peakGlow" cx="${f2(P.x)}" cy="${f2(P.y)}" r="560" fill="url(#glowG)" opacity="0"/></g>
    <g id="curveG" opacity="0">
      <path id="lineGlow" d="${d}" fill="none" stroke="${C.accent}" stroke-width="26" stroke-linecap="round" opacity="0.35" filter="url(#bloom)" stroke-dasharray="${f2(LT)}" stroke-dashoffset="${f2(LT)}"/>
      <path id="line" d="${d}" fill="none" stroke="${C.accent}" stroke-width="${STROKE.bold}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${f2(LT)}" stroke-dashoffset="${f2(LT)}"/>
      <path id="tail" d="${d}" fill="none" stroke="${C.hot}" stroke-width="${STROKE.heavy}" stroke-linecap="round" filter="url(#soft)" stroke-dasharray="0 ${f2(2 * LT)}" opacity="0"/>
    </g>
    <circle id="ringA" cx="${f2(P.x)}" cy="${f2(P.y)}" r="172" fill="none" stroke="${C.accent}" stroke-width="${STROKE.hair}" stroke-dasharray="10 22" opacity="0"/>
    <circle id="rip1" cx="${f2(P.x)}" cy="${f2(P.y)}" r="120" fill="none" stroke="${C.accent}" stroke-width="${STROKE.thin}" opacity="0"/>
    <circle id="rip2" cx="${f2(P.x)}" cy="${f2(P.y)}" r="120" fill="none" stroke="${C.accent}" stroke-width="${STROKE.hair}" opacity="0"/>
    <g id="points">${pointSvg}</g>
    <polygon id="hexM" points="${hex(96)}" fill="none" stroke="${C.accent}" stroke-width="${STROKE.bold}" stroke-linejoin="round" opacity="0"/>
    <circle id="flash" cx="${f2(P.x)}" cy="${f2(P.y)}" r="120" fill="none" stroke="${C.hot}" stroke-width="${STROKE.bold}" opacity="0"/>
    <g id="tipG" opacity="0"><circle r="90" fill="url(#halo)"/><circle r="16" fill="${C.hot}"/></g>
    <circle id="sparkFlash" cx="${f2(s0.x)}" cy="${f2(s0.y)}" r="46" fill="${C.hot}" filter="url(#soft)" opacity="0"/>
    <circle id="sparkRing" cx="${f2(s0.x)}" cy="${f2(s0.y)}" r="60" fill="none" stroke="${C.hot}" stroke-width="${STROKE.thin}" opacity="0"/>
    <g id="rays" stroke="${C.hot}" stroke-width="${STROKE.thin}" stroke-linecap="round" opacity="0">${rays}</g>`;
const sets = `      gsap.set("#hexM, #ringA, #peakGlow", { svgOrigin: "${f2(P.x)} ${f2(P.y)}" });
      gsap.set(".nd", { transformOrigin: "50% 50%" });
      gsap.set(".nd", { scale: 0 });   // hidden until their spring; set once, before the timeline`;
const vars = `      const TIP = ${JSON.stringify(tip)}, HOP = ${JSON.stringify(HOP)};
      const LT = ${f2(LT)}, AX = ${X0 - 14}, LOCK = ${T.lock}, HOLD = ${T.hold}, TL_LOCK = ${f2(TL_LOCK)}, PX = ${f2(P.x)}, PY = ${f2(P.y)};
      const ZW = ${ZW}, WD = ${WD.toFixed(6)};
      const line = document.getElementById("line"), lineGlow = document.getElementById("lineGlow"), tail = document.getElementById("tail");
      const tipG = document.getElementById("tipG"), areaR = document.getElementById("areaR"), areaF = document.getElementById("areaF"), glowB = document.getElementById("glowB");
      const hops = HOP.map((_, k) => document.getElementById("hop" + k));`;
const onUpdate = `        const tp = perFrame(TIP, 4, t), Ld = tp(0), tx = tp(1), ty = tp(2), spd = tp(3), off = (LT - Ld).toFixed(2);
        line.style.strokeDashoffset = off;
        lineGlow.style.strokeDashoffset = off;
        lineGlow.style.opacity = (0.35 + (t > LOCK ? 0.45 * Math.exp(-5 * (t - LOCK)) : 0)).toFixed(4);
        const aw = Math.max(0, tx - AX), af = Math.min(1, Math.max(0, (t - LOCK) / 0.5)), fw = Math.min(aw, 160 * (1 - af * af * (3 - 2 * af)));
        areaR.setAttribute("width", (aw - fw).toFixed(2));
        areaF.setAttribute("x", (AX + aw - fw).toFixed(2));
        areaF.setAttribute("width", fw.toFixed(2));
        tipG.setAttribute("transform", "translate(" + tx.toFixed(2) + " " + ty.toFixed(2) + ") scale(" + (1 + 0.6 * Math.min(1, Math.max(0, (spd - 600) / 1400))).toFixed(4) + ")");
        const tlen = t > LOCK ? TL_LOCK * Math.exp(-14 * (t - LOCK)) : Math.min(560, spd * 0.24);
        const rp = Math.min(1, Math.max(0, (t - 2.9) / 0.5)), to = rp * rp * (3 - 2 * rp) * (t > LOCK ? Math.exp(-10 * (t - LOCK)) : 1);
        tail.style.strokeDasharray = tlen.toFixed(2) + " " + (2 * LT).toFixed(0);
        tail.style.strokeDashoffset = (tlen - Ld).toFixed(2);
        tail.style.opacity = to.toFixed(4);
        for (let k = 0; k < hops.length; k++) { const dh = t - HOP[k][0]; hops[k].setAttribute("transform", "translate(0 " + (dh > 0 ? -HOP[k][1] * Math.exp(-ZW * dh) * Math.sin(WD * dh) : 0).toFixed(3) + ")"); }
        const ub = Math.min(1, Math.max(0, (t - HOLD) / ${(DUR - T.hold).toFixed(3)})), sw = Math.sin(Math.PI * ub);
        glowB.setAttribute("transform", around(PX, PY, 1 + 0.04 * sw * sw));`;

S.write({ bg, sub, fg: bokeh, defs, sets, vars, onUpdate, camera: cam });
console.log(`  peak ${f2(P.x)}, ${f2(P.y)} (φ point) · curve ${f2(LT)} px · points at ${tk.map((t) => t.toFixed(2)).join(", ")} s · tip speed ${speed(T.impact + 0.05).toFixed(0)} → ${speed(T.lock).toFixed(0)} px/s · camera ${ZOOM}× → 1× from ${PULL} to ${T.hold} s`);
