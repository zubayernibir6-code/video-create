// signal-core.ts — "Signal Core", a 6-second motion-graphics B-roll (docs/broll-motion-spec.md v2), written as a
// HyperFrames page. Zero raster assets (SVG + CSS only); spring physics (k 170, c 14) for entrances, the
// cubic-bezier(0.16, 1, 0.3, 1) settle for scale/rotation and the camera; three parallax layers (bg 0.4×, subject
// 1×, fg 1.2×); slate palette with one luminous cyan; per-frame procedural grain (overlay, 5 %); every value a
// function of the timeline time (seek-safe, deterministic).
//   node tools/broll/signal-core.ts projects/<name> [--res=4k|1080] [--silent]
//     → <project>/index.html (+ build/cues.json and assets/media/mix.wav unless --silent)
//   then: npx hyperframes snapshot … / node tools/finish.mjs projects/<name> --formats=16x9
// The design is in 4K units; --res=1080 scales the stage to 1920×1080 for previews (same timeline).
// Guards: refuses to write a page that references a raster file or uses a linear ease.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { GOLDEN_ANGLE, PHI, goldenPoint, grainTile, mulberry32, pageScript, phyllotaxis } from "./motion.ts";
import type { Vec2 } from "./motion.ts";

interface Cue { t: number; file: string; vol: number; dur?: number }

const argv = process.argv.slice(2);
const dir = path.resolve(argv.find((a) => !a.startsWith("--")) ?? "");
const res: "4k" | "1080" = argv.includes("--res=1080") ? "1080" : "4k";
const silent = argv.includes("--silent");
const W = 3840, H = 2160, FPS = 60, DUR = 6;
const OUT_W = res === "4k" ? W : 1920, OUT_H = res === "4k" ? H : 1080, K = OUT_W / W;
const f2 = (x: number): string => x.toFixed(2);

// ── design tokens (one family for every B-roll) ──
const C = { bg0: "#05080F", bg1: "#0B1324", bg2: "#13203A", line: "#22324F", lineHi: "#3A5276", accent: "#5CF2FF", hot: "#EAFFFF" };
const STROKE = { hair: 2, thin: 4, bold: 8 };

// ── composition: the focal point on the φ grid; the nodes on a sunflower spiral (golden angle) ──
const F: Vec2 = goldenPoint(W, H);                      // (2373, 825)
const N = 34;                                           // a Fibonacci number
const nodes = phyllotaxis(N, 118, F, -Math.PI / 2);     // r_max ≈ 688 px
const rnd = mulberry32(20261030);
const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
const rMax = Math.max(...nodes.map((p) => dist(p, F)));

// links: every node to the core (spokes) + the Fibonacci neighbours i→i+13 and i→i+21 (the spiral's parastichies)
const links: Array<{ a: Vec2; b: Vec2; i: number; kind: "spoke" | "arc" }> = [];
nodes.forEach((p, i) => links.push({ a: p, b: F, i, kind: "spoke" }));
for (const step of [13, 21]) for (let i = 0; i + step < N; i++) links.push({ a: nodes[i], b: nodes[i + step], i: i + step, kind: "arc" });

// the hook's streak: a golden spiral r = a·e^(bθ), b = ln φ / (π/2), from off-frame into F
const B = Math.log(PHI) / (Math.PI / 2);
const spiral: Vec2[] = [];
for (let th = 3.2 * Math.PI; th >= 0; th -= Math.PI / 48) { const r = 26 * Math.exp(B * th); spiral.push({ x: F.x + r * Math.cos(th + 0.6), y: F.y + r * Math.sin(th + 0.6) }); }
const spiralD = spiral.map((p, i) => `${i ? "L" : "M"}${f2(p.x)} ${f2(p.y)}`).join(" ");
let spiralLen = 0; for (let i = 1; i < spiral.length; i++) spiralLen += dist(spiral[i - 1], spiral[i]);

// ── timeline (beats from the spec) ──
const T = { hook: 0, impact: 0.3, nodes0: 0.6, nodeStep: 0.064, charge: 2.8, lock: 4.2, hold: 5.2 };
const js: string[] = [], cues: Cue[] = [];
const cue = (t: number, file: string, vol: number, dur?: number): void => { cues.push({ t: +t.toFixed(3), file, vol, ...(dur ? { dur } : {}) }); };
const tw = (sel: string, from: string, to: string, at: number, d: number, ease: string): void => {
  js.push(`  tl.fromTo(${sel}, { ${from} }, { ${to}, duration: ${d.toFixed(3)}, ease: ${ease}, immediateRender: false }, ${at.toFixed(3)});`);
};
const SPRING = (d: number): string => `springEase(${d}, 170, 14, 1)`; // the brief's spring, for a tween of d seconds
const SETTLE = "settle";                                              // cubic-bezier(0.16, 1, 0.3, 1)

// fade up from black, then the camera: dolly-in 0.93 → 1 and a drift that land exactly on 1× and 0 (§0d.1)
tw(`"#black"`, `opacity: 1`, `opacity: 0`, 0, 0.35, `"power2.out"`);
for (const [id, f] of [["#bgL", 0.4], ["#subL", 1.0], ["#fgL", 1.2]] as Array<[string, number]>) {
  tw(`"${id}"`, `scale: ${(1 - 0.07 * f).toFixed(4)}, x: ${f2(70 * f)}, y: ${f2(-36 * f)}`, `scale: 1, x: 0, y: 0`, 0, T.hold, SETTLE);
}
// hook: the streak whips along the spiral into the core (accelerating), then fades
tw(`"#streak"`, `strokeDashoffset: ${f2(spiralLen)}`, `strokeDashoffset: 0`, T.hook + 0.02, T.impact - 0.02, `"power3.in"`);
tw(`"#streak"`, `opacity: 1`, `opacity: 0`, T.impact, 0.35, SETTLE);
cue(0, "whoosh-cinematic", 0.5);
// impact: the core springs in, the glow blooms, ring 1 draws
tw(`"#coreDot"`, `scale: 0`, `scale: 1`, T.impact, 0.9, SPRING(0.9));
tw(`"#coreGlow"`, `scale: 0.2, opacity: 0`, `scale: 1, opacity: 0.85`, T.impact, 0.9, SETTLE);
tw(`"#ring1"`, `strokeDashoffset: ${f2(2 * Math.PI * 92)}`, `strokeDashoffset: 0`, T.impact + 0.05, 0.7, SETTLE);
tw(`"#ring2"`, `rotation: -40, opacity: 0`, `rotation: 0, opacity: 0.8`, T.impact + 0.15, 1.6, SETTLE);
cue(T.impact, "impact-bass-1", 0.55, 0.6);
// build: nodes spring in along the spiral order; every 3rd pings; links draw as their node lands
nodes.forEach((p, i) => {
  const t = T.nodes0 + i * T.nodeStep;
  tw(`"#n${i}"`, `scale: 0`, `scale: 1`, t, 0.9, SPRING(0.9));
  if (i % 3 === 0) { tw(`"#p${i}"`, `scale: 0.6, opacity: 0.9`, `scale: 3.2, opacity: 0`, t + 0.04, 0.6, SETTLE); if (i % 6 === 0) cue(t + 0.02, "click-soft", 0.22); }
});
links.forEach((l, k) => {
  const t = T.nodes0 + l.i * T.nodeStep + (l.kind === "spoke" ? 0.05 : 0.12);
  tw(`"#l${k}"`, `strokeDashoffset: ${f2(dist(l.a, l.b))}`, `strokeDashoffset: 0`, t, 0.55, SETTLE);
});
// charge: pulses run in along 12 spokes, accelerating into the core; each arrival bumps the core (micro-interaction)
const pulseFrom = nodes.map((p, i) => ({ p, i })).filter(({ i }) => i >= N - 18 && i % 1 === 0).slice(0, 12);
const arrivals: number[] = [];
pulseFrom.forEach(({ p }, k) => {
  const t = T.charge + k * 0.1, d = 0.5;
  tw(`"#q${k}"`, `x: ${f2(p.x)}, y: ${f2(p.y)}, opacity: 0`, `x: ${f2(F.x)}, y: ${f2(F.y)}, opacity: 1`, t, d, `"power2.in"`);
  tw(`"#q${k}"`, `opacity: 1`, `opacity: 0`, t + d, 0.08, `"power1.out"`);
  arrivals.push(+(t + d).toFixed(3));
});
// each arrival kicks the core like a struck spring (impulse response e^(−ζω₀t)·sin(ω_d t), normalised to a 6 % peak);
// the kicks add up (a linear system), evaluated per frame in the page
const ZW = 14 / 2, WD = Math.sqrt(170 - ZW * ZW);           // ζω₀ = c/2m, ω_d = √(k/m − (c/2m)²)
const tPeak = Math.atan(WD / ZW) / WD, BUMP = 0.06 / (Math.exp(-ZW * tPeak) * Math.sin(WD * tPeak));
cue(T.charge, "riser", 0.3, T.lock - T.charge);
tw(`"#ring2"`, `rotation: 0`, `rotation: 120`, T.charge, T.lock - T.charge + 0.6, SETTLE);
// lock: anticipation (the shell pulls out 3 %), then springs home and settles its rotation; flash; nodes breathe in
tw(`"#shell"`, `scale: 1.32, rotation: -24, opacity: 0`, `scale: 1.36, rotation: -26, opacity: 0.9`, T.lock - 0.22, 0.22, `"power2.out"`);
tw(`"#shell"`, `scale: 1.36`, `scale: 1`, T.lock, 0.9, SPRING(0.9));
tw(`"#shell"`, `rotation: -26`, `rotation: 0`, T.lock, 1.0, SETTLE);
tw(`"#flash"`, `scale: 0.6, opacity: 0.85`, `scale: 2.6, opacity: 0`, T.lock + 0.02, 0.8, SETTLE);
tw(`"#coreGlow"`, `opacity: 1, scale: 1.25`, `opacity: 0.85, scale: 1`, T.lock + 0.02, 0.9, SETTLE);
tw(`"#nodes"`, `scale: 1`, `scale: 0.965`, T.lock + 0.08, 0.35, `"power2.out"`);   // follow-through: an inward breath…
tw(`"#nodes"`, `scale: 0.965`, `scale: 1`, T.lock + 0.43, 0.9, SPRING(0.9));     // …that springs back
cue(T.lock - 0.02, "impact-bass-2", 0.5);
cue(T.lock + 0.05, "sparkle", 0.38);
// hold: the glow breathes once (a sin² swell on its wrapper, per frame) and ends exactly where it started
cue(T.hold + 0.1, "sparkle", 0.18);
// the grid and the bokeh drift (sine, the parallax camera does the rest)
tw(`"#grid"`, `x: 0, y: 0`, `x: -40, y: -20`, 0, DUR, `"sine.inOut"`);
tw(`"#bokeh"`, `x: 0, y: 0`, `x: 60, y: -30`, 0, DUR, `"sine.inOut"`);

// ── SVG layers (4K units) ──
const hex = (r: number): string => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 6 + k * Math.PI / 3; return `${f2(F.x + r * Math.cos(a))},${f2(F.y + r * Math.sin(a))}`; }).join(" ");
let grid = "";
for (let x = -160; x <= W + 160; x += 160) grid += `<line x1="${x}" y1="-160" x2="${x}" y2="${H + 160}"/>`;
for (let y = -160; y <= H + 160; y += 160) grid += `<line x1="-160" y1="${y}" x2="${W + 160}" y2="${y}"/>`;
const bgHexes = [520, 900, 1400, 2000].map((r, k) => `<polygon points="${hex(r)}" fill="none" stroke="${C.line}" stroke-width="${STROKE.thin}" opacity="${(0.5 - k * 0.1).toFixed(2)}"/>`).join("");
const linkSvg = links.map((l, k) => {
  const L = dist(l.a, l.b), fall = Math.max(0.15, 1 - dist(l.a, F) / (rMax * 1.1)); // light falls off away from the core
  const col = l.kind === "spoke" ? C.lineHi : C.accent, op = l.kind === "spoke" ? 0.35 + 0.45 * fall : 0.12 + 0.25 * fall;
  return `<line id="l${k}" x1="${f2(l.a.x)}" y1="${f2(l.a.y)}" x2="${f2(l.b.x)}" y2="${f2(l.b.y)}" stroke="${col}" stroke-width="${l.kind === "spoke" ? STROKE.hair : STROKE.thin}" stroke-linecap="round" opacity="${op.toFixed(3)}" stroke-dasharray="${f2(L)}" stroke-dashoffset="${f2(L)}"/>`;
}).join("");
const nodeSvg = nodes.map((p, i) => {
  const r = 9 + 9 * (dist(p, F) / rMax);
  return `<g id="n${i}" class="nd"><circle cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r * 3.2)}" fill="url(#halo)"/><circle cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r)}" fill="${C.hot}"/></g>` +
    (i % 3 === 0 ? `<circle id="p${i}" class="pg" cx="${f2(p.x)}" cy="${f2(p.y)}" r="${f2(r * 2)}" fill="none" stroke="${C.accent}" stroke-width="${STROKE.thin}" opacity="0"/>` : "");
}).join("");
const pulses = pulseFrom.map((_, k) => `<circle id="q${k}" cx="0" cy="0" r="12" fill="${C.hot}" opacity="0" filter="url(#soft)"/>`).join("");
const bokeh = Array.from({ length: 14 }, () => {
  const edge = rnd() < 0.5, x = edge ? (rnd() < 0.5 ? rnd() * 700 : W - rnd() * 700) : rnd() * W, y = edge ? rnd() * H : (rnd() < 0.5 ? rnd() * 380 : H - rnd() * 420);
  return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(24 + rnd() * 60)}" fill="${rnd() < 0.35 ? C.accent : C.hot}" opacity="${(0.06 + rnd() * 0.12).toFixed(3)}"/>`;
}).join("");

// SFX: the soundtrack is the cues alone (no voice, no music); a --silent page carries no audio
const media = path.join(dir, "assets", "media");
const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${OUT_W}, height=${OUT_H}" />
    <title>Signal Core B-roll</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>
body { margin: 0; background: ${C.bg0}; }
#root { position: relative; width: ${OUT_W}px; height: ${OUT_H}px; overflow: hidden; background: ${C.bg0}; }
#stage { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; transform: scale(${K}); }
.layer { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: ${f2(F.x)}px ${f2(F.y)}px; }
.layer svg { position: absolute; left: 0; top: 0; overflow: visible; }
#bgL { z-index: 1; background: radial-gradient(ellipse 62% 70% at ${f2(F.x / W * 100)}% ${f2(F.y / H * 100)}%, ${C.bg2} 0%, ${C.bg1} 38%, ${C.bg0} 100%); }
#subL { z-index: 5; } #streakL { z-index: 8; } #fgL { z-index: 10; }
#vignette { position: absolute; inset: 0; z-index: 20; background: radial-gradient(ellipse 75% 75% at ${f2(F.x / W * 100)}% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%); }
#grain { position: absolute; left: -256px; top: -256px; width: ${W + 512}px; height: ${H + 512}px; z-index: 30; background-image: url("${grainTile(512, 0.85, 7)}"); background-size: 512px 512px; mix-blend-mode: overlay; opacity: 0.05; }
#black { position: absolute; inset: 0; z-index: 40; background: #000000; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${OUT_W}" data-height="${OUT_H}" data-fps="${FPS}" data-duration="${DUR}">
      <div id="stage">
        <div class="layer" id="bgL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <defs><radialGradient id="gmask"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
            <mask id="gm"><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#gmask)"/></mask></defs>
          <g id="grid" mask="url(#gm)" stroke="${C.line}" stroke-width="${STROKE.hair}" opacity="0.6">${grid}</g>${bgHexes}</svg></div>
        <div class="layer" id="subL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <defs><radialGradient id="halo"><stop offset="0" stop-color="${C.accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
            <radialGradient id="glowG"><stop offset="0" stop-color="${C.hot}" stop-opacity="0.95"/><stop offset="0.18" stop-color="${C.accent}" stop-opacity="0.6"/><stop offset="0.55" stop-color="${C.accent}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
            <filter id="soft" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="5"/></filter></defs>
          <g id="glowB"><circle id="coreGlow" cx="${f2(F.x)}" cy="${f2(F.y)}" r="420" fill="url(#glowG)" opacity="0"/></g>
          <g id="links">${linkSvg}</g>
          <g id="nodes">${nodeSvg}</g>
          <circle id="ring1" cx="${f2(F.x)}" cy="${f2(F.y)}" r="92" fill="none" stroke="${C.accent}" stroke-width="${STROKE.thin}" stroke-dasharray="${f2(2 * Math.PI * 92)}" stroke-dashoffset="${f2(2 * Math.PI * 92)}"/>
          <circle id="ring2" cx="${f2(F.x)}" cy="${f2(F.y)}" r="156" fill="none" stroke="${C.accent}" stroke-width="${STROKE.hair}" stroke-dasharray="10 22" opacity="0"/>
          <polygon id="shell" points="${hex(236)}" fill="none" stroke="${C.accent}" stroke-width="${STROKE.bold}" stroke-linejoin="round" opacity="0"/>
          <circle id="flash" cx="${f2(F.x)}" cy="${f2(F.y)}" r="236" fill="none" stroke="${C.hot}" stroke-width="${STROKE.bold}" opacity="0"/>
          <g id="coreBump"><circle id="coreDot" cx="${f2(F.x)}" cy="${f2(F.y)}" r="34" fill="${C.hot}"/></g>
          <g id="pulses">${pulses}</g></svg></div>
        <div class="layer" id="streakL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <path id="streak" d="${spiralD}" fill="none" stroke="${C.hot}" stroke-width="${STROKE.bold}" stroke-linecap="round" stroke-dasharray="${f2(spiralLen * 0.28)} ${f2(spiralLen * 2)}" stroke-dashoffset="${f2(spiralLen)}"/></svg></div>
        <div class="layer" id="fgL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <defs><filter id="dof" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="16"/></filter></defs>
          <g id="bokeh" filter="url(#dof)">${bokeh}</g></svg></div>
        <div id="vignette"></div>
        <div id="grain"></div>
        <div id="black"></div>
      </div>${silent ? "" : `
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${DUR}" data-track-index="30" data-volume="1"></audio>`}
    </div>
    <script>
${pageScript()}
      const settle = cubicBezier(0.16, 1, 0.3, 1);
      gsap.set("#coreDot, #coreGlow, #ring2, #shell, #flash, #nodes", { svgOrigin: "${f2(F.x)} ${f2(F.y)}" });
      gsap.set(".nd, .pg", { transformOrigin: "50% 50%" });
      gsap.set(".nd, #coreDot", { scale: 0 });   // hidden until their spring; set once, before the timeline
      const tl = gsap.timeline({ paused: true });
      // per frame: the grain is re-seeded from the frame number (dither that never slides, never repeats a pattern)
      const grain = document.getElementById("grain"), bump = document.getElementById("coreBump"), glowB = document.getElementById("glowB");
      const ARR = ${JSON.stringify(arrivals)}, FX = ${f2(F.x)}, FY = ${f2(F.y)};
      const around = (s) => "translate(" + FX + " " + FY + ") scale(" + s.toFixed(5) + ") translate(" + (-FX) + " " + (-FY) + ")";
      tl.to({}, { duration: ${DUR}, ease: "sine.inOut", onUpdate() {
        const t = this.time(), f = Math.round(t * ${FPS}), r = mulberry32(f * 7919 + 13);
        grain.style.transform = "translate(" + Math.floor(r() * 256) + "px," + Math.floor(r() * 256) + "px)";
        let k = 0; for (const a of ARR) { const d = t - a; if (d > 0) k += ${BUMP.toFixed(6)} * Math.exp(-${ZW} * d) * Math.sin(${WD.toFixed(6)} * d); }
        bump.setAttribute("transform", around(1 + k));
        const u = Math.min(1, Math.max(0, (t - ${T.hold}) / ${(DUR - T.hold).toFixed(3)})), sw = Math.sin(Math.PI * u);
        glowB.setAttribute("transform", around(1 + 0.04 * sw * sw));
      } }, 0);
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

// guards (spec §4): no raster, no linear ease
const raster = page.match(/\.(png|jpe?g|webp|gif)\b|data:image\/(png|jpe?g|webp|gif)/i);
if (raster) throw new Error(`raster asset referenced: ${raster[0]}`);
const linear = js.find((l) => /ease: "(none|linear)"/.test(l));
if (linear) throw new Error(`linear ease: ${linear.trim()}`);
mkdirSync(path.join(dir, "build"), { recursive: true });
writeFileSync(path.join(dir, "index.html"), page);
cues.sort((a, b) => a.t - b.t);
writeFileSync(path.join(dir, "build", "cues.json"), JSON.stringify(cues));
if (!silent) buildMix({ total: DUR, out: path.join(media, "mix.wav"), graphFile: path.join(dir, "build", "mix.graph.txt"), cues });
console.log(`✓ ${path.relative(process.cwd(), path.join(dir, "index.html"))} (${OUT_W}×${OUT_H}, ${FPS} fps, ${DUR} s) · ${N} nodes, ${links.length} links, ${js.length} tweens, ${cues.length} sound cues${silent ? " (silent)" : ""} · no raster, no linear ease`);
console.log(`  focal point ${f2(F.x)}, ${f2(F.y)} (φ grid) · golden angle ${(GOLDEN_ANGLE * 180 / Math.PI).toFixed(3)}° · spiral ${f2(spiralLen)} px`);
