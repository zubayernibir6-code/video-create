// scene.ts — the shared shell of every motion-graphics B-roll scene (MG2 onward; MG1 signal-core.ts predates it):
// the design tokens, the tween / burst / SFX helpers, the page (three parallax layers, vignette, per-frame grain,
// fade from black), an optional per-frame camera track, the guards (no raster, no linear ease, no SVG transform
// attributes, the camera lands on 1×) and the writing of index.html + cues + mix. A scene only describes its own SVG
// and beats (docs/broll-motion-spec.md v2, skill motion-broll).
//   import { scene, backdrop, C, STROKE, W, H } from "./scene.ts";
//   const S = scene({ dir, res, silent, dur: 6, title: "Growth Curve", focus: P });
//   S.tw('"#id"', "x: 0", "x: 100", at, dur, S.SETTLE);   a GSAP fromTo (entrances: from hidden)
//   S.burst("ring", at, dur, 0.5, 3.4, 0.6, centre);       a one-shot ping/flash, computed per frame (seek-safe)
//   S.cue(t, "click-soft", 0.26);  …  S.write({ bg, sub, fg, defs, sets, vars, onUpdate, camera });
// Written 2026-10-30; first user growth-curve.ts (MG2).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { grainTile, pageScript } from "./motion.ts";
import type { Vec2 } from "./motion.ts";

export interface Cue { t: number; file: string; vol: number; dur?: number }
export interface SceneOpts { dir: string; res: "4k" | "1080"; silent: boolean; dur: number; title: string; focus: Vec2 }
/** camera: one [zoom, x, y] per frame from t = 0 (frames 0 … dur·FPS), applied to the layers × their parallax factor. */
export interface Layers { bg: string; sub: string; fg: string; defs?: string; sets?: string; onUpdate?: string; vars?: string; camera?: number[] }

// one family for every B-roll: slate + a single luminous cyan
export const C = { bg0: "#05080F", bg1: "#0B1324", bg2: "#13203A", line: "#22324F", lineHi: "#3A5276", accent: "#5CF2FF", hot: "#EAFFFF" };
export const STROKE = { hair: 2, thin: 4, bold: 8, heavy: 12 };
export const W = 3840, H = 2160, FPS = 60;
export const PARALLAX: Array<[string, number]> = [["bgL", 0.4], ["subL", 1.0], ["fgL", 1.2]];
export const f2 = (x: number): string => x.toFixed(2);

export function scene(o: SceneOpts) {
  const OUT_W = o.res === "4k" ? W : 1920, OUT_H = o.res === "4k" ? H : 1080, K = OUT_W / W;
  const js: string[] = [], cues: Cue[] = [], bursts: Array<[string, number, number, number, number, number, number, number]> = [];
  const tw = (sel: string, from: string, to: string, at: number, d: number, ease: string): void => {
    js.push(`  tl.fromTo(${sel}, { ${from} }, { ${to}, duration: ${d.toFixed(3)}, ease: ${ease}, immediateRender: false }, ${at.toFixed(3)});`);
  };
  // a ping / flash / ripple that starts visible and fades: GSAP would show its from-state after a backward seek, so
  // its scale and opacity are a pure function of t (settle ease), and it is invisible outside [at, at + d]
  const burst = (id: string, at: number, d: number, s0: number, s1: number, o0: number, c: Vec2): void => {
    bursts.push([id, +at.toFixed(3), +d.toFixed(3), s0, s1, o0, +c.x.toFixed(2), +c.y.toFixed(2)]);
  };
  const cue = (t: number, file: string, vol: number, dur?: number): void => { cues.push({ t: +t.toFixed(3), file, vol, ...(dur ? { dur } : {}) }); };
  // a GSAP camera move on the three layers, scaled by their parallax factors, ending on 1× (or use Layers.camera)
  const camera = (from: { x: number; y: number; zoom: number }, at: number, d: number, ease: string): void => {
    for (const [id, f] of PARALLAX)
      tw(`"#${id}"`, `scale: ${(1 - (1 - from.zoom) * f).toFixed(4)}, x: ${f2(from.x * f)}, y: ${f2(from.y * f)}`, `scale: 1, x: 0, y: 0`, at, d, ease);
  };
  const write = (L: Layers): void => {
    const F = o.focus, media = path.join(o.dir, "assets", "media"), frames = Math.round(o.dur * FPS);
    if (L.camera) {
      if (L.camera.length !== (frames + 1) * 3) throw new Error(`camera track has ${L.camera.length / 3} frames, expected ${frames + 1}`);
      const [z, x, y] = L.camera.slice(-3);
      if (Math.abs(z - 1) > 1e-6 || Math.abs(x) > 1e-3 || Math.abs(y) > 1e-3) throw new Error(`camera ends at zoom ${z}, offset ${x}, ${y}: it must land on 1× and 0 (§0d.1)`);
      if (js.some((l) => /fromTo\("#(bgL|subL|fgL)"/.test(l))) throw new Error("a GSAP camera tween and a camera track on the same layers");
    }
    const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${OUT_W}, height=${OUT_H}" />
    <title>${o.title} B-roll</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>
body { margin: 0; background: ${C.bg0}; }
#root { position: relative; width: ${OUT_W}px; height: ${OUT_H}px; overflow: hidden; background: ${C.bg0}; }
#stage { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: 0 0; transform: scale(${K}); }
.layer { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; transform-origin: ${f2(F.x)}px ${f2(F.y)}px; }
.layer svg { position: absolute; left: 0; top: 0; overflow: visible; }
#bgL { z-index: 1; background: radial-gradient(ellipse 62% 70% at ${f2(F.x / W * 100)}% ${f2(F.y / H * 100)}%, ${C.bg2} 0%, ${C.bg1} 38%, ${C.bg0} 100%); }
#subL { z-index: 5; } #fgL { z-index: 10; }
#vignette { position: absolute; inset: 0; z-index: 20; background: radial-gradient(ellipse 75% 75% at ${f2(F.x / W * 100)}% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%); }
#grain { position: absolute; left: -256px; top: -256px; width: ${W + 512}px; height: ${H + 512}px; z-index: 30; background-image: url("${grainTile(512, 0.85, 7)}"); background-size: 512px 512px; mix-blend-mode: overlay; opacity: 0.05; }
#black { position: absolute; inset: 0; z-index: 40; background: #000000; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${OUT_W}" data-height="${OUT_H}" data-fps="${FPS}" data-duration="${o.dur}">
      <div id="stage">
        <div class="layer" id="bgL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.bg}</svg></div>
        <div class="layer" id="subL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${L.defs ?? ""}</defs>${L.sub}</svg></div>
        <div class="layer" id="fgL"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.fg}</svg></div>
        <div id="vignette"></div>
        <div id="grain"></div>
        <div id="black"></div>
      </div>${o.silent ? "" : `
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${o.dur}" data-track-index="30" data-volume="1"></audio>`}
    </div>
    <script>
${pageScript()}
      const settle = cubicBezier(0.16, 1, 0.3, 1);
${L.sets ?? ""}
      const tl = gsap.timeline({ paused: true });
      const grain = document.getElementById("grain");
      // per-frame lookup with linear interpolation between frames: arr holds n numbers per frame
      const perFrame = (arr, n, t) => { const last = arr.length / n - 1, fi = Math.min(last, Math.max(0, t * ${FPS})), i = Math.floor(fi), j = Math.min(i + 1, last), a = fi - i; return (k) => arr[i * n + k] + (arr[j * n + k] - arr[i * n + k]) * a; };
      const around = (cx, cy, s) => "translate(" + cx + " " + cy + ") scale(" + s.toFixed(5) + ") translate(" + (-cx) + " " + (-cy) + ")";
      const BURSTS = ${JSON.stringify(bursts)}.map((b) => ({ el: document.getElementById(b[0]), at: b[1], d: b[2], s0: b[3], s1: b[4], o0: b[5], cx: b[6], cy: b[7] }));${L.camera ? `
      const CAM = ${JSON.stringify(L.camera.map((v) => +v.toFixed(4)))};
      const LAYERS = ${JSON.stringify(PARALLAX)}.map(([id, f]) => [document.getElementById(id), f]);` : ""}
${L.vars ?? ""}
      tl.to({}, { duration: ${o.dur}, ease: "sine.inOut", onUpdate() {
        const t = this.time(), f = Math.round(t * ${FPS}), r = mulberry32(f * 7919 + 13);
        grain.style.transform = "translate(" + Math.floor(r() * 256) + "px," + Math.floor(r() * 256) + "px)";
        for (const b of BURSTS) {
          const u = (t - b.at) / b.d;
          if (u < 0 || u > 1) { b.el.style.opacity = "0"; continue; }
          const e = settle(u);
          b.el.setAttribute("transform", around(b.cx, b.cy, b.s0 + (b.s1 - b.s0) * e));
          b.el.style.opacity = (b.o0 * (1 - e)).toFixed(4);
        }${L.camera ? `
        const cm = perFrame(CAM, 3, t), cz = cm(0), cx = cm(1), cy = cm(2);
        for (const [el, k] of LAYERS) el.style.transform = "translate(" + (cx * k).toFixed(2) + "px," + (cy * k).toFixed(2) + "px) scale(" + (1 + (cz - 1) * k).toFixed(5) + ")";` : ""}
${L.onUpdate ?? ""}
      } }, 0);
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
    // guards (spec §4): no raster, no linear ease, no transform attributes on SVG parts (GSAP or onUpdate owns them)
    const raster = page.match(/\.(png|jpe?g|webp|gif)\b|data:image\/(png|jpe?g|webp|gif)/i);
    if (raster) throw new Error(`raster asset referenced: ${raster[0]}`);
    const linear = js.find((l) => /ease: "(none|linear)"/.test(l));
    if (linear) throw new Error(`linear ease: ${linear.trim()}`);
    if (/<(g|circle|rect|path|polygon|line)\b[^>]*\btransform="/.test(L.sub + L.bg + L.fg)) throw new Error("an SVG part carries a transform attribute: set start states with gsap.set (skill motion-broll trap 1)");
    const ids = new Set([...(L.bg + L.sub + L.fg).matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    const missing = bursts.filter((b) => !ids.has(b[0])).map((b) => b[0]);
    if (missing.length) throw new Error(`burst on a missing element: ${missing.join(", ")}`);
    const tweened = new Set(js.map((l) => l.match(/fromTo\("#([\w-]+)"/)?.[1]).filter(Boolean));
    const both = bursts.filter((b) => tweened.has(b[0])).map((b) => b[0]);
    if (both.length) throw new Error(`a burst element is also GSAP-tweened: ${both.join(", ")}`);
    mkdirSync(path.join(o.dir, "build"), { recursive: true });
    writeFileSync(path.join(o.dir, "index.html"), page);
    cues.sort((a, b) => a.t - b.t);
    writeFileSync(path.join(o.dir, "build", "cues.json"), JSON.stringify(cues));
    if (!o.silent) buildMix({ total: o.dur, out: path.join(media, "mix.wav"), graphFile: path.join(o.dir, "build", "mix.graph.txt"), cues });
    console.log(`✓ ${path.relative(process.cwd(), path.join(o.dir, "index.html"))} (${OUT_W}×${OUT_H}, ${FPS} fps, ${o.dur} s) · ${js.length} tweens, ${bursts.length} bursts, ${cues.length} sound cues${o.silent ? " (silent)" : ""}${L.camera ? ", camera track" : ""} · no raster, no linear ease`);
  };
  return { tw, burst, cue, camera, write, js, cues, SETTLE: "settle", SPRING: (d: number): string => `springEase(${d}, 170, 14, 1)` };
}

// the standard backdrop: a 160 px grid masked to fade out around `centre` (drawn far past the frame, so a camera
// move never shows its end), and seeded bokeh for the foreground layer
export function backdrop(centre: Vec2, rnd: () => number, radius = 2600, opacity = 0.6): { grid: string; bokeh: string } {
  const E = 1600;
  let g = "";
  for (let x = -E; x <= W + E; x += 160) g += `<line x1="${x}" y1="${-E}" x2="${x}" y2="${H + E}"/>`;
  for (let y = -E; y <= H + E; y += 160) g += `<line x1="${-E}" y1="${y}" x2="${W + E}" y2="${y}"/>`;
  const grid = `<defs><radialGradient id="gmask" gradientUnits="userSpaceOnUse" cx="${f2(centre.x)}" cy="${f2(centre.y)}" r="${radius}"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="gm" maskUnits="userSpaceOnUse" x="${-E - 200}" y="${-E - 200}" width="${W + 2 * E + 400}" height="${H + 2 * E + 400}"><rect x="${-E - 200}" y="${-E - 200}" width="${W + 2 * E + 400}" height="${H + 2 * E + 400}" fill="url(#gmask)"/></mask></defs>
    <g id="grid" mask="url(#gm)" stroke="${C.line}" stroke-width="${STROKE.hair}" opacity="${opacity}">${g}</g>`;
  const dots = Array.from({ length: 14 }, () => {
    const edge = rnd() < 0.5, x = edge ? (rnd() < 0.5 ? rnd() * 700 : W - rnd() * 700) : rnd() * W, y = edge ? rnd() * H : (rnd() < 0.5 ? rnd() * 380 : H - rnd() * 420);
    return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(24 + rnd() * 60)}" fill="${rnd() < 0.35 ? C.accent : C.hot}" opacity="${(0.06 + rnd() * 0.12).toFixed(3)}"/>`;
  }).join("");
  const bokeh = `<defs><filter id="dof" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="16"/></filter></defs><g id="bokeh" filter="url(#dof)">${dots}</g>`;
  return { grid, bokeh };
}
