// page-core.mjs — the reusable half of an episode page: camera pieces (one <video> per kept piece of the cut
// list), the full-screen ⇄ side-card layout, word-by-word captions, keyword banners, title and end cards, the
// logo bug, and a small beat language for the graphics panel. The episode's own scenes come from its
// build-page.mjs; this module turns everything into one HyperFrames index.html plus a sound-effect cue list.
//
// Layout (1920×1080): full screen, or "split": the camera in a 640×790 rounded card on the left
// (x 72–712, y 110–900) and the graphics panel on the right (x 790–1850, y 110–900). Captions sit in a pill
// centred at y ≈ 985 in both layouts. Nothing scales past its resting size (CLAUDE.md §0d rule 1).

export const C = {
  bg: "#0B0F19", cyan: "#00F5D4", gold: "#FFD700", red: "#FF4D6D", green: "#10B981",
  ink: "#EAF0F8", muted: "#9FB0C8", line: "rgba(255,255,255,0.12)",
};

const BN = "০১২৩৪৫৬৭৮৯";
export const bn = (v) => String(v).replace(/[0-9]/g, (d) => BN[d]);
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const f3 = (x) => Number(x).toFixed(3);

// Camera geometry. The face sits near (1050, 470) in the 1920×1080 frame.
export const FACE = { x: 1050, y: 470 };
const CARD = { left: 72, top: 110, w: 640, h: 790, scale: 0.8, cx: 1050, cy: 540 };
const cardXf = () => {
  const s = CARD.scale, x = CARD.left + CARD.w / 2 - s * CARD.cx, y = CARD.top + CARD.h / 2 - s * CARD.cy;
  const sw = CARD.w / s, sh = CARD.h / s;
  const l = CARD.cx - sw / 2, t = CARD.cy - sh / 2;
  return { x, y, s, clip: `inset(${f3(t)}px ${f3(1920 - l - sw)}px ${f3(1080 - t - sh)}px ${f3(l)}px round ${f3(28 / s)}px)` };
};
export const CLIP_FULL = "inset(0px 0px 0px 0px round 0px)";

// Inline a Lucide icon (stroke icons, currentColor) at a size.
import { readFileSync } from "node:fs";
import path from "node:path";
const ICONS = path.resolve(import.meta.dirname, "..", "..", "assets", "icons", "lucide", "icons");
export function icon(name, size = 64, extra = "") {
  const svg = readFileSync(path.join(ICONS, `${name}.svg`), "utf8");
  const body = svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim();
  return `<svg class="ico" ${extra} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
// A drawn arrow (no glyph arrows: they are not in the pack fonts, CLAUDE.md §0d rule 11).
export const arrow = (w = 90, id = "") => `<svg ${id ? `id="${id}"` : ""} class="arw" width="${w}" height="40" viewBox="0 0 ${w} 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20H${w - 8}"/><path d="M${w - 22} 8L${w - 6} 20L${w - 22} 32"/></svg>`;

export const FONT_CSS = `
@font-face { font-family: "Hind Siliguri"; font-weight: 500; src: url("assets/fonts/HindSiliguri-Medium.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Baloo Da 2"; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "JetBrains Mono"; font-weight: 100 800; src: url("assets/fonts/JetBrainsMono-Variable.ttf") format("truetype"); font-display: block; }`;

const BASE_CSS = `
body { margin: 0; background: ${C.bg}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.bg}; font-family: "Hind Siliguri", "Inter", sans-serif; color: ${C.ink}; }
#bg { position: absolute; inset: 0;
  background-image: radial-gradient(ellipse at 72% 38%, rgba(0,245,212,0.11), rgba(11,15,25,0) 58%),
    radial-gradient(ellipse at 12% 90%, rgba(255,215,0,0.05), rgba(11,15,25,0) 50%),
    linear-gradient(rgba(0,245,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 64px 64px, 64px 64px; }
#cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; overflow: hidden; }
.piece { position: absolute; inset: 0; transform-origin: ${FACE.x}px ${FACE.y}px; }
.piece video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#card-frame { position: absolute; left: ${CARD.left}px; top: ${CARD.top}px; width: ${CARD.w}px; height: ${CARD.h}px; box-sizing: border-box;
  border: 2px solid ${C.cyan}; border-radius: 28px; box-shadow: 0 0 30px rgba(0,245,212,0.35), inset 0 0 20px rgba(0,245,212,0.10); opacity: 0; }
#panel { position: absolute; left: 790px; top: 110px; width: 1060px; height: 790px; }
.sc { position: absolute; inset: 0; opacity: 0; }
.grp { position: absolute; left: 0; right: 0; top: 96px; bottom: 0; opacity: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding-bottom: 36px; box-sizing: border-box; }
.grp > * { align-self: stretch; }
.grp > .chip, .grp > .row.fit { align-self: flex-start; }
.grp.top { display: block; padding-bottom: 0; }
.chap { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 18px; font-weight: 600; font-size: 30px; color: ${C.muted}; }
.chap b { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-weight: 700; font-size: 26px; color: ${C.bg}; background: ${C.cyan}; border-radius: 10px; padding: 4px 12px 2px; }
.ttl { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 64px; line-height: 1.2; margin: 0; color: #fff; text-wrap: balance; }
.ttl em { font-style: normal; color: ${C.gold}; }
.sub { font-weight: 600; font-size: 34px; line-height: 1.45; color: #C9D4E6; margin: 0; text-wrap: balance; }
.small { font-weight: 500; font-size: 24px; color: ${C.muted}; }
.box { border-radius: 22px; background: rgba(255,255,255,0.045); border: 2px solid ${C.line}; padding: 26px 30px; box-sizing: border-box; }
.chip { display: inline-flex; align-items: center; gap: 14px; border-radius: 999px; border: 2px solid rgba(0,245,212,0.55); background: rgba(0,245,212,0.07);
  padding: 10px 26px 8px; font-weight: 600; font-size: 32px; color: ${C.ink}; }
.chip.gold { border-color: rgba(255,215,0,0.7); background: rgba(255,215,0,0.10); color: ${C.gold}; }
.chip.red { border-color: rgba(255,77,109,0.7); background: rgba(255,77,109,0.10); }
.chip.green { border-color: rgba(16,185,129,0.75); background: rgba(16,185,129,0.10); }
.ico { display: block; flex: none; }
.arw { display: block; flex: none; color: ${C.cyan}; }
.row { display: flex; align-items: center; gap: 26px; }
.col { display: flex; flex-direction: column; gap: 22px; }
.num { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; line-height: 1.1; }
#lowers .low { position: absolute; left: 80px; top: 84px; max-width: 860px; display: flex; gap: 22px; align-items: stretch; opacity: 0; }
.low .bar { width: 8px; border-radius: 4px; background: ${C.cyan}; flex: none; }
.low .txt { background: rgba(6,9,18,0.80); border: 1px solid rgba(255,255,255,0.10); border-radius: 18px; padding: 16px 30px 14px; }
.low .k { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 58px; line-height: 1.2; color: #fff; text-wrap: balance; }
.low .k em { font-style: normal; color: ${C.gold}; }
.low .s { font-weight: 600; font-size: 30px; color: #C9D4E6; margin-top: 4px; }
#caps { position: absolute; left: 0; right: 0; top: 936px; height: 100px; }
.cue { position: absolute; left: 0; right: 0; top: 0; height: 100px; display: flex; align-items: center; justify-content: center; opacity: 0; }
.cue .pill { display: flex; gap: 14px; white-space: nowrap; padding: 10px 36px 14px; border-radius: 999px; background: rgba(6,9,18,0.80);
  border: 1px solid rgba(255,255,255,0.10); font-weight: 700; font-size: 50px; line-height: 1.3; color: #fff; }
.cue .w { display: inline-block; transform-origin: 50% 80%; }
#bug { position: absolute; right: 64px; top: 40px; display: flex; align-items: center; gap: 12px; font-family: "Inter", sans-serif; font-weight: 800;
  font-size: 24px; letter-spacing: 0.22em; color: rgba(234,240,248,0.85); opacity: 0; }
#bug i { width: 12px; height: 12px; border-radius: 50%; background: ${C.cyan}; box-shadow: 0 0 12px ${C.cyan}; }
.card-full { position: absolute; inset: 0; }
`;

// ---- small beat language for scenes ------------------------------------------------------------------------
// A beat is [time, selector, preset, options]. Times are OUTPUT seconds (scenes compute them with T()).
const PRESETS = {
  in: (s, t, o) => `tl.fromTo(${s}, { opacity: 0, y: ${o.y ?? 26} }, { opacity: 1, y: 0, duration: ${o.d ?? 0.5}, ease: "power3.out", stagger: ${o.stagger ?? 0} }, ${f3(t)});`,
  inx: (s, t, o) => `tl.fromTo(${s}, { opacity: 0, x: ${o.x ?? 40} }, { opacity: 1, x: 0, duration: ${o.d ?? 0.5}, ease: "power3.out", stagger: ${o.stagger ?? 0} }, ${f3(t)});`,
  fade: (s, t, o) => `tl.fromTo(${s}, { opacity: 0 }, { opacity: 1, duration: ${o.d ?? 0.4}, ease: "power1.out", stagger: ${o.stagger ?? 0} }, ${f3(t)});`,
  pop: (s, t, o) => `tl.fromTo(${s}, { opacity: 0, scale: ${o.from ?? 0.6} }, { opacity: 1, scale: 1, duration: ${o.d ?? 0.45}, ease: "back.out(1.7)", stagger: ${o.stagger ?? 0} }, ${f3(t)});`,
  out: (s, t, o) => `tl.to(${s}, { opacity: 0, duration: ${o.d ?? 0.3}, ease: "power1.in" }, ${f3(t)});`,
  dim: (s, t, o) => `tl.to(${s}, { opacity: ${o.to ?? 0.3}, duration: ${o.d ?? 0.4}, ease: "power1.out" }, ${f3(t)});`,
  // a bar emptying to o.to of its width (a usage meter draining)
  shrink: (s, t, o) => `tl.fromTo(${s}, { scaleX: 1 }, { scaleX: ${o.to ?? 0.1}, duration: ${o.d ?? 1}, ease: "power1.inOut", immediateRender: false }, ${f3(t)});`,
  grow: (s, t, o) => `tl.fromTo(${s}, { scaleX: 0 }, { scaleX: 1, duration: ${o.d ?? 0.6}, ease: "${o.ease ?? "power2.out"}", stagger: ${o.stagger ?? 0} }, ${f3(t)});`,
  stamp: (s, t, o) => `tl.fromTo(${s}, { opacity: 0, scale: 1.9, rotation: ${o.r0 ?? -4} }, { opacity: 1, scale: 1, rotation: ${o.r ?? -9}, duration: 0.32, ease: "power4.in" }, ${f3(t)});`,
  glow: (s, t, o) => `tl.to(${s}, { borderColor: "${o.c ?? "rgba(255,215,0,0.9)"}", backgroundColor: "${o.bgc ?? "rgba(255,215,0,0.14)"}", color: "${o.tc ?? C.gold}", duration: 0.3, ease: "power1.out" }, ${f3(t)});`,
  color: (s, t, o) => `tl.to(${s}, { color: "${o.c}", duration: ${o.d ?? 0.3} }, ${f3(t)});`,
  wiggle: (s, t, o) => `tl.fromTo(${s}, { rotation: -${o.a ?? 2} }, { rotation: ${o.a ?? 2}, duration: ${o.d ?? 0.6}, ease: "sine.inOut", yoyo: true, repeat: ${o.n ?? 9} }, ${f3(t)});`,
  rise: (s, t, o) => `tl.fromTo(${s}, { y: 0 }, { y: ${o.y ?? -8}, duration: ${o.d ?? 3}, ease: "sine.inOut", yoyo: true, repeat: ${o.n ?? 1} }, ${f3(t)});`,
  draw: (s, t, o) => `tl.fromTo(${s}, { strokeDashoffset: ${o.len ?? 1000} }, { strokeDashoffset: 0, duration: ${o.d ?? 1.2}, ease: "${o.ease ?? "power2.inOut"}" }, ${f3(t)});`,
  fall: (s, t, o) => `tl.to(${s}, { y: ${o.y ?? 420}, rotation: (i) => [${(o.rot ?? [18, -22, 30, -14, 25, -30, 12, -18, 34, -26, 20, -12, 28, -20, 16]).join(",")}][i % 15], opacity: 0, duration: ${o.d ?? 0.9}, ease: "power2.in", stagger: ${o.stagger ?? 0.04} }, ${f3(t)});`,
  // count-up: o = { to, from=0, dec=0, pre="", post="" } writes Bengali digits
  count: (s, t, o) => `{ const el = document.querySelector(${s}); const st = { v: ${o.from ?? 0} };
  tl.to(st, { v: ${o.to}, duration: ${o.d ?? 1.4}, ease: "power2.out", onUpdate: () => { el.textContent = "${o.pre ?? ""}" + bnNum(st.v, ${o.dec ?? 0}) + "${o.post ?? ""}"; } }, ${f3(t)}); }`,
};

export function beatsToJs(beats) {
  return beats.map(([t, sel, preset, opts = {}]) => {
    const fn = PRESETS[preset];
    if (!fn) throw new Error(`unknown beat preset "${preset}"`);
    return "  " + fn(JSON.stringify(sel), t, opts);
  }).join("\n");
}

// ---- captions ----------------------------------------------------------------------------------------------
const SENT_END = /[।?!]$/;
const SOFT_END = /[,;:—–]$/;
export function captionPages(words, { maxWords = 6, minWords = 3, maxChars = 34, gapBreak = 0.75 } = {}) {
  const pages = [];
  let cur = [];
  const len = (arr) => arr.reduce((a, w) => a + [...w.text].length + 1, 0);
  for (const w of words) {
    const prev = cur.at(-1);
    const brk = prev && (
      prev.part !== w.part || w.start - prev.end > gapBreak || cur.length >= maxWords || len([...cur, w]) > maxChars ||
      (cur.length >= minWords && (SENT_END.test(prev.text) || (cur.length >= 4 && SOFT_END.test(prev.text)))));
    if (brk) { pages.push(cur); cur = []; }
    cur.push(w);
  }
  if (cur.length) pages.push(cur);
  // a lone last word joins the page before it when they are close and short enough
  for (let i = pages.length - 1; i > 0; i--) {
    const p = pages[i], q = pages[i - 1];
    if (p.length === 1 && p[0].part === q.at(-1).part && p[0].start - q.at(-1).end < 0.4 && len([...q, ...p]) <= maxChars + 4) {
      q.push(...p); pages.splice(i, 1);
    }
  }
  return pages;
}

function captionMarkup(pages) {
  let html = "", js = [], wi = 0;
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    const show = Math.max(0, p[0].start - 0.06);
    let hide = p.at(-1).end + 0.35;
    if (next && next[0].part === p[0].part && next[0].start - p.at(-1).end < 0.6) hide = next[0].start - 0.06;
    if (next) hide = Math.min(hide, next[0].start - 0.06);
    html += `<div class="cue" id="cue${i}"><div class="pill">${p.map((w) => `<span class="w" id="w${wi++}">${esc(w.text)}</span>`).join("")}</div></div>\n`;
    js.push(`  tl.set("#cue${i}", { opacity: 1 }, ${f3(show)}); tl.set("#cue${i}", { opacity: 0 }, ${f3(hide)});`);
  });
  wi = 0;
  for (const p of pages) for (const w of p) {
    const id = `#w${wi++}`;
    js.push(`  tl.set("${id}", { color: "${C.gold}" }, ${f3(w.start)}); tl.fromTo("${id}", { scale: 1 }, { scale: 1.1, duration: 0.09, ease: "power1.out", yoyo: true, repeat: 1, immediateRender: false }, ${f3(w.start)}); tl.set("${id}", { color: "#FFFFFF" }, ${f3(Math.max(w.start + 0.08, w.end))});`);
  }
  return { html, js: js.join("\n") };
}

// ---- the page ----------------------------------------------------------------------------------------------
// opts: { map, words (output-timed {text,start,end,part}), splits [{in,out}], scenes [{html, beats, js}],
//         lowers [{t, dur, k, s}], title {title,titleBn,byline}, end {...}, fps }
export function buildPage(opts) {
  const { map, words, splits, scenes, lowers, title, sfx } = opts;
  const total = map.total;
  const xf = cardXf();
  const js = [];
  const cue = (t, file, vol = 0.5) => sfx.push({ t: Number(t.toFixed(3)), file, vol });

  // camera pieces: one <video> per kept piece; even pieces at 1.0, odd at 1.07 (hides the jump cut), each
  // drifting 2.5 % down to its resting scale over its length
  // ONE clip: the camera already cut to the episode timeline (camcut.mjs). One <video data-media-start> per piece
  // made HyperFrames extract 59 times from one file and half the extractions failed in the full render.
  map.segments.forEach((s, i) => {
    const base = i % 2 ? 1.07 : 1.0;
    js.push(`  tl.fromTo("#camv", { scale: ${f3(base + 0.025)} }, { scale: ${f3(base)}, duration: ${f3(Math.max(0.2, s.out1 - s.out0 - 0.04))}, ease: "none", immediateRender: false }, ${f3(s.out0)});`);
  });
  const pieces = [`<div class="piece" id="camv"><video id="camvid" src="assets/media/cam_cut.mp4" muted playsinline data-start="0" data-duration="${f3(total)}" data-track-index="0"></video></div>`];
  js.unshift(`  gsap.set("#cam", { clipPath: "${CLIP_FULL}" });`, `  gsap.set("#camv", { scale: 1.025 });`);

  // layout switches
  for (const sp of splits) {
    js.push(`  tl.to("#cam", { x: ${f3(xf.x)}, y: ${f3(xf.y)}, scale: ${xf.s}, clipPath: "${xf.clip}", duration: 0.9, ease: "power3.inOut" }, ${f3(sp.in)});`);
    js.push(`  tl.to("#card-frame", { opacity: 1, duration: 0.45, ease: "power1.out" }, ${f3(sp.in + 0.55)});`);
    cue(sp.in, "whoosh.mp3", 0.45);
    if (sp.out != null) {
      js.push(`  tl.to("#card-frame", { opacity: 0, duration: 0.2 }, ${f3(sp.out - 0.05)});`);
      js.push(`  tl.to("#cam", { x: 0, y: 0, scale: 1, clipPath: "${CLIP_FULL}", duration: 0.85, ease: "power3.inOut" }, ${f3(sp.out)});`);
      cue(sp.out, "whoosh-short.mp3", 0.4);
    }
  }

  // scenes (panel)
  let scenesHtml = "";
  for (const sc of scenes) {
    scenesHtml += sc.html + "\n";
    js.push(`  // scene ${sc.id}`);
    js.push(`  tl.fromTo("#${sc.id}", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, ${f3(sc.in)});`);
    js.push(`  tl.to("#${sc.id}", { opacity: 0, x: -30, duration: 0.35, ease: "power2.in" }, ${f3(sc.out - 0.35)});`);
    js.push(beatsToJs(sc.beats));
    if (sc.js) js.push(sc.js);
    for (const s of sc.sfx ?? []) cue(s[0], s[1], s[2]);
  }

  // keyword banners over full-screen talk
  let lowersHtml = "";
  lowers.forEach((l, i) => {
    lowersHtml += `<div class="low" id="low${i}"><div class="bar"></div><div class="txt"><div class="k">${l.k}</div>${l.s ? `<div class="s">${l.s}</div>` : ""}</div></div>\n`;
    js.push(`  tl.fromTo("#low${i}", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${f3(l.t)});`);
    js.push(`  tl.fromTo("#low${i} .bar", { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, ${f3(l.t)});`);
    js.push(`  tl.to("#low${i}", { opacity: 0, x: -20, duration: 0.35, ease: "power2.in" }, ${f3(l.t + l.dur - 0.35)});`);
    cue(l.t, "click-soft.mp3", 0.5);
  });

  // captions
  const pages = captionPages(words);
  const caps = captionMarkup(pages);
  js.push(caps.js);

  // logo bug: in over the main talk, out for title and end cards
  js.push(`  tl.fromTo("#bug", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);`);
  if (map.title) {
    js.push(`  tl.to("#bug", { opacity: 0, duration: 0.25 }, ${f3(map.title.out0 - 0.1)});`);
    js.push(`  tl.to("#bug", { opacity: 1, duration: 0.5 }, ${f3(map.title.out1 + 0.4)});`);
  }
  if (map.end) js.push(`  tl.to("#bug", { opacity: 0, duration: 0.3 }, ${f3(map.end.out0 - 0.3)});`);

  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(title.title)}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${FONT_CSS}
${BASE_CSS}
${opts.css ?? ""}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${f3(total)}">
      <div id="bg"></div>
      <div id="cam">
${pieces.join("\n")}
      </div>
      <div id="card-frame"></div>
      <div id="panel">
${scenesHtml}
      </div>
      <div id="lowers">
${lowersHtml}
      </div>
${opts.extraHtml ?? ""}
      <div id="bug"><i></i>ZUBAYER</div>
      <div id="caps">
${caps.html}
      </div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const BND = "০১২৩৪৫৬৭৮৯";
      function bnNum(v, dec) { return v.toFixed(dec).replace(/[0-9]/g, (d) => BND[d]); }
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
${opts.extraJs ?? ""}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  return { html, pages };
}
