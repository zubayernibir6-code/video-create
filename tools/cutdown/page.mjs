// page.mjs — the vertical page (HyperFrames index.html) of a cut-down Reel, plus its sound-effect cue list.
// The Reel's own build-page.mjs supplies the data: hook, chips, pans of the screen crop, camera jump-cuts.
//
// Layout (1080×1920), inside Meta's Reels safe area (top 14 %, bottom 35 %, 6 % sides):
//   y 272        series tag                          y 314–438   hook (on screen from frame 0)
//   y 448–552    chip band (one group at a time; chips never sit on the picture)
//   y 562–1110   the picture window, 1000×548: the master at 1:1 (a crop that pans to the action)
//   face pieces  faceMode "full" (default): the camera fills the whole 9:16 frame (eyebrows→chin on y 585–1110),
//                and the frame MORPHS smoothly (0.7 s, clip-path + a glowing outline) into the 16:9 window when the
//                screen comes, and back out when the face returns (his rule 2026-10-30: he records vertically).
//                faceMode "window": the camera inside the window too (claude-reel-1..4).
//   y ≈ 1170     word-by-word caption pill (61 % from the top), the spoken word turns gold
//   tail         optional cliff (freeze, dark veil, the open question) then the end card (CTA to the full video)
// Rules kept by construction: pushes land on scale 1 (CLAUDE.md §0d.1), Bengali has no letter-spacing, every font
// name is quoted, ticks and arrows are SVG (icon()).
import { writeFileSync } from "node:fs";
import path from "node:path";
import { C, FONT_CSS, beatsToJs, captionPages, esc } from "../episode/page-core.mjs";
import { readJSON, writeJSON } from "../episode/lib.mjs";

const f3 = (x) => Number(x).toFixed(3);
export const WIN = { x: 40, y: 562, w: 1000, h: 548 };

// ctx: the cut (map.json), the caption words and M(), which turns a MASTER second into a Reel second
export function cutdownContext(dir) {
  const cfg = readJSON(path.join(dir, "cutdown.json"));
  const map = readJSON(path.join(cfg.work, "map.json"));
  const M = (m) => {
    // a master second can sit in two pieces (a silent cold open flashes forward to a moment played later):
    // the spoken piece wins, so beats and pans land where the moment really plays
    const hits = map.segments.filter((x) => m >= x.from - 1e-6 && m <= x.to + 1e-6);
    const s = hits.find((x) => !x.mute) ?? hits[0];
    if (!s) throw new Error(`master ${m} s is not in any piece of the cut`);
    return Number(f3(s.out0 + (m - s.from) / s.speed));
  };
  // caption words, corrected by hand in captions.json. Sources:
  //   asr      the Reel's own ASR (Reel seconds) + fix { index: text | null }
  //   reuse    ["../other-reel", …] other cut-downs of the SAME master: their corrected words, carried over by master
  //            time (no new ASR, no second round of fixes — claude-ig-1..2 reused claude-reel-1/2/4)
  //   extra    [{ asr, at, range?, fix? }] any words.json whose second 0 is master second `at` (e.g. a short ASR of
  //            one piece no other Reel covered)
  const cap = readJSON(path.join(dir, "captions.json"));
  const load = (file) => { const r = readJSON(file); return Array.isArray(r) ? r : r.words; };
  const words = [];
  const list = cap.asr || (!cap.reuse && !cap.extra) ? load(path.join(cfg.work, cap.asr ?? "asr.words.json")) : [];
  list.forEach((w, i) => {
    const fix = cap.fix?.[String(i)];
    if (fix === null || cap.drop?.includes(i)) return;
    const seg = map.segments.find((s) => w.start >= s.out0 - 0.05 && w.start < s.out1);
    if (!seg || seg.mute) return; // music under a silent piece or the tail is not speech
    words.push({ text: fix ?? w.text, start: Number(w.start), end: Math.min(Number(w.end), seg.out1), part: "main" });
  });
  const mw = []; // master-timed words from reuse / extra, in source order
  for (const rel of cap.reuse ?? []) {
    const od = path.resolve(dir, rel), oc = readJSON(path.join(od, "cutdown.json")), om = readJSON(path.join(oc.work, "map.json"));
    const ocap = readJSON(path.join(od, "captions.json"));
    load(path.join(oc.work, ocap.asr ?? "asr.words.json")).forEach((w, i) => {
      const fix = ocap.fix?.[String(i)];
      if (fix === null) return;
      const sg = om.segments.find((x) => w.start >= x.out0 - 0.05 && w.start < x.out1);
      if (!sg || sg.mute) return;
      mw.push({ src: rel, text: fix ?? w.text, m0: sg.from + (w.start - sg.out0) * sg.speed, m1: sg.from + (Math.min(w.end, sg.out1) - sg.out0) * sg.speed });
    });
  }
  for (const x of cap.extra ?? []) load(path.resolve(dir, x.asr)).forEach((w, i) => {
    const fix = x.fix?.[String(i)];
    const m0 = x.at + w.start, m1 = x.at + w.end;
    if (fix === null || (x.range && (m0 < x.range[0] || m0 >= x.range[1]))) return;
    mw.push({ src: x.asr, text: fix ?? w.text, m0, m1 });
  });
  // the first source to cover a stretch of the master wins; a later source's words that overlap it are dropped
  const kept = [];
  for (const w of mw) if (!kept.some((k) => k.src !== w.src && w.m0 < k.m1 - 0.05 && w.m1 > k.m0 + 0.05)) kept.push(w);
  for (const w of kept) {
    const sg = map.segments.find((x) => !x.mute && w.m0 >= x.from - 0.02 && w.m0 < x.to);
    if (!sg) continue;
    words.push({ text: w.text, start: Number(f3(sg.out0 + Math.max(0, w.m0 - sg.from) / sg.speed)), end: Number(f3(Math.min(sg.out1, sg.out0 + (w.m1 - sg.from) / sg.speed))), part: "main" });
  }
  words.sort((a, b) => a.start - b.start);
  // W(["word"], near, win): the Reel second a corrected caption word starts (warns and falls back to near)
  const W = (needles, near, win = 4) => {
    let best = null;
    for (const w of words) if (Math.abs(w.start - near) <= win && needles.some((n) => w.text.includes(n)) && (!best || Math.abs(w.start - near) < Math.abs(best.start - near))) best = w;
    if (!best) console.warn(`WARN word ${needles.join("/")} not found within ${win} s of ${near}; using ${near}`);
    return best ? best.start : near;
  };
  return { dir, cfg, map, M, W, words };
}

// opts: { tag, hook, cta: [l1, l2], cliff?: { text, sub, d }, pans: [[t, cx, cy, d?]], pushes: [[t, d]],
//         jumps: [t], chips: [{ at, out?, html, beats?, sfx? }], sfx: [[t, file, vol, from?, d?]] } — Reel seconds
export function buildCutdown(ctx, opts) {
  const { dir, map, words } = ctx;
  const total = map.total, tail0 = map.tail.out0;
  const cliffD = opts.cliff ? opts.cliff.d ?? 2.5 : 0, end0 = tail0 + cliffD;
  const js = [], sfx = [];
  const cue = (t, file, vol, from, d) => sfx.push({ t: Number(f3(t)), file: file.endsWith(".mp3") ? file : `${file}.mp3`, vol, ...(from != null && { from }), ...(d != null && { d }) });

  // captions: 2–4 words, the spoken word gold with a small pop
  const pages = captionPages(words, { maxWords: 4, minWords: 2, maxChars: 24, gapBreak: 0.7 });
  let capsHtml = "", wi = 0;
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    const show = Math.max(0, p[0].start - 0.06);
    let hide = Math.min(p.at(-1).end + 0.35, tail0 - 0.05);
    if (next) hide = Math.min(hide, next[0].start - 0.06);
    capsHtml += `<div class="cue" id="cue${i}"><div class="pill">${p.map((w) => `<span class="w" id="w${wi++}">${esc(w.text)}</span>`).join("")}</div></div>\n`;
    js.push(`  tl.set("#cue${i}", { opacity: 1 }, ${f3(show)}); tl.set("#cue${i}", { opacity: 0 }, ${f3(hide)});`);
  });
  wi = 0;
  for (const p of pages) for (const w of p) {
    const id = `#w${wi++}`;
    js.push(`  tl.set("${id}", { color: "${C.gold}" }, ${f3(w.start)}); tl.fromTo("${id}", { scale: 1 }, { scale: 1.05, duration: 0.09, yoyo: true, repeat: 1, immediateRender: false }, ${f3(w.start)}); tl.set("${id}", { color: "#FFFFFF" }, ${f3(Math.max(w.start + 0.08, w.end))});`);
  }

  // the picture: screen crop (1:1) or the camera, switched per piece; every state set from the timeline alone
  // a view is [cx, cy, s]: the master point at the window's centre and its scale (1 = native pixels; 0.52 shows
  // the whole 16:9 frame). Pans are [t, cx, cy, d = 0.6, s = 1]; d = 0 cuts.
  const pos = (cx, cy, k = 1) => ({ x: WIN.w / 2 - cx * k, y: WIN.h / 2 - cy * k, scale: k });
  const p0 = pos(...(opts.start ?? [960, 540, 1]));
  js.push(`  gsap.set("#scrv", { x: ${f3(p0.x)}, y: ${f3(p0.y)}, scale: ${f3(p0.scale)}, transformOrigin: "0 0" });`);
  for (const [t, cx, cy, d = 0.6, k = 1] of opts.pans ?? []) {
    const p = pos(cx, cy, k);
    js.push(d > 0 ? `  tl.to("#scrv", { x: ${f3(p.x)}, y: ${f3(p.y)}, scale: ${f3(p.scale)}, duration: ${f3(d)}, ease: "power2.inOut" }, ${f3(t)});`
      : `  tl.set("#scrv", { x: ${f3(p.x)}, y: ${f3(p.y)}, scale: ${f3(p.scale)} }, ${f3(t)});`);
  }
  // a push: ease back to 0.965 in 0.5 s, then settle on 1 (no one-frame jump; preflight "snap" on claude-reel-3)
  for (const [t, d] of opts.pushes ?? []) {
    js.push(`  tl.to("#scrwrap", { scale: 0.965, duration: 0.5, ease: "sine.inOut" }, ${f3(Math.max(0, t - 0.5))});`);
    js.push(`  tl.to("#scrwrap", { scale: 1, duration: ${f3(d)}, ease: "power1.out" }, ${f3(t)});`);
  }
  const full = (map.faceMode ?? "window") === "full", segs = map.segments;
  const FULL = "inset(0px 0px 0px 0px round 0px)", WCLIP = `inset(${WIN.y}px ${1080 - WIN.x - WIN.w}px ${1920 - WIN.y - WIN.h}px ${WIN.x}px round 28px)`;
  // the morph outline is an SVG rect whose attributes tween sub-pixel (HyperFrames refuses left/top tweens:
  // gsap_non_transform_motion, claude-ig-1)
  const FULLBOX = { x: 1, y: 1, width: 1078, height: 1918, rx: 0 }, WINBOX = { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: 28 };
  const box = (b) => `attr: { ${Object.entries(b).map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
  const MORPH = 0.7;
  if (!full) {
    js.push(`  gsap.set("#facewrap", { opacity: 0 });`);
    for (const s of segs) if (s.face)
      js.push(`  tl.set("#facewrap", { opacity: 1 }, ${f3(s.out0)}); tl.set("#facewrap", { opacity: 0 }, ${f3(s.out1 >= tail0 - 1e-3 ? total + 1 : s.out1)});`);
  } else {
    // full mode: the face layer covers the whole frame; it shrinks into the window before a screen piece and grows
    // out of it after one. The window (screen) shows only on screen pieces.
    js.push(`  gsap.set("#ffwrap", { clipPath: "${FULL}", autoAlpha: ${segs[0].face ? 1 : 0} }); gsap.set("#ffrect", { ${box(FULLBOX)} }); gsap.set("#ffframe", { opacity: 0 });`);
    js.push(`  gsap.set("#win", { autoAlpha: ${segs[0].face ? 0 : 1} });`);
    segs.forEach((s, i) => {
      const prev = segs[i - 1], next = segs[i + 1];
      if (!s.face) { js.push(`  tl.set("#win", { autoAlpha: 1 }, ${f3(s.out0)});`); return; }
      js.push(`  tl.set("#win", { autoAlpha: 0 }, ${f3(s.out0)});`);
      if (prev && !prev.face) {
        js.push(`  tl.set("#ffwrap", { autoAlpha: 1, clipPath: "${WCLIP}" }, ${f3(s.out0)}); tl.set("#ffrect", { ${box(WINBOX)} }, ${f3(s.out0)}); tl.set("#ffframe", { opacity: 1 }, ${f3(s.out0)});`);
        js.push(`  tl.to("#ffwrap", { clipPath: "${FULL}", duration: ${MORPH}, ease: "power3.inOut" }, ${f3(s.out0 + 0.05)});`);
        js.push(`  tl.to("#ffrect", { ${box(FULLBOX)}, duration: ${MORPH}, ease: "power3.inOut" }, ${f3(s.out0 + 0.05)});`);
        js.push(`  tl.to("#ffframe", { opacity: 0, duration: ${MORPH}, ease: "power3.inOut" }, ${f3(s.out0 + 0.05)});`);
      } else js.push(`  tl.set("#ffwrap", { autoAlpha: 1, clipPath: "${FULL}" }, ${f3(s.out0)});`);
      if (next && !next.face) {
        const m0 = s.out1 - MORPH;
        js.push(`  tl.fromTo("#ffwrap", { clipPath: "${FULL}" }, { clipPath: "${WCLIP}", duration: ${MORPH}, ease: "power3.inOut", immediateRender: false }, ${f3(m0)});`);
        js.push(`  tl.fromTo("#ffrect", { ${box(FULLBOX)} }, { ${box(WINBOX)}, duration: ${MORPH}, ease: "power3.inOut", immediateRender: false }, ${f3(m0)});`);
        js.push(`  tl.fromTo("#ffframe", { opacity: 0 }, { opacity: 1, duration: ${MORPH}, ease: "power3.inOut", immediateRender: false }, ${f3(m0)});`);
        js.push(`  tl.set("#ffwrap", { autoAlpha: 0 }, ${f3(s.out1)}); tl.set("#ffframe", { opacity: 0 }, ${f3(s.out1)});`);
      }
    });
  }
  // camera jump-cuts: alternate 1.0 / 1.07 framing, each with a slow settle
  const jumps = [...(opts.jumps ?? [])].sort((a, b) => a - b);
  const faceV = full ? "#ffv" : "#facev";
  js.push(`  gsap.set("${faceV}", { scale: 1 });`);
  jumps.forEach((t, i) => {
    const z = i % 2 ? 1.0 : full ? 1.05 : 1.07, nextT = jumps[i + 1] ?? tail0;
    js.push(`  tl.fromTo("${faceV}", { scale: ${f3(z + 0.02)} }, { scale: ${f3(z)}, duration: ${f3(Math.max(0.3, nextT - t - 0.05))}, ease: "none", immediateRender: false }, ${f3(t)});`);
  });
  // a soft flash at every cut between pieces
  map.segments.slice(1).forEach((s) => js.push(`  tl.fromTo("#cutfx", { opacity: 0.55 }, { opacity: 0, duration: 0.22, ease: "power2.out", immediateRender: false }, ${f3(s.out0)});`));

  js.push(`  tl.fromTo("#prog i", { scaleX: 0 }, { scaleX: 1, duration: ${f3(end0)}, ease: "none" }, 0);`);
  js.push(`  tl.set("#prog", { visibility: "hidden" }, ${f3(end0 + 0.3)});`);
  // entrances at frame 0
  js.push(`  tl.fromTo("#hook", { opacity: 1, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0);`);
  js.push(`  tl.fromTo("#tag", { opacity: 1, y: -8 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0);`);
  if (!full || !segs[0].face) js.push(`  tl.fromTo("#win", { opacity: 0.4, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }, 0);`);

  // chips in the band, one group at a time
  let chipsHtml = "";
  const chips = [...(opts.chips ?? [])].sort((a, b) => a.at - b.at);
  chips.forEach((g, i) => {
    const next = chips[i + 1];
    const out = g.out ?? Math.min(next ? next.at - 0.3 : tail0 - 0.3, tail0 - 0.3);
    if (next && next.at < out + 0.25 - 1e-6) throw new Error(`chip group ${i} (out ${out.toFixed(2)}) overlaps the next at ${next.at.toFixed(2)}`);
    chipsHtml += `<div class="band" id="g${i}">${g.html}</div>\n`;
    js.push(`  tl.fromTo("#g${i}", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, ${f3(g.at)});`);
    js.push(`  tl.to("#g${i}", { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" }, ${f3(out)});`);
    if (g.beats) js.push(beatsToJs(g.beats));
    for (const s of g.sfx ?? []) cue(...s);
  });
  for (const s of opts.sfx ?? []) cue(...s);

  // cliff: frozen picture, dark veil, the question slams in and pulses
  let cliffHtml = "";
  if (opts.cliff) {
    const c0 = tail0, c1 = end0;
    cliffHtml = `<div id="cliff"><div id="cq">${opts.cliff.text}</div>${opts.cliff.sub ? `<div id="cs">${opts.cliff.sub}</div>` : ""}</div>`;
    js.push(`  tl.set("#caps", { opacity: 0 }, ${f3(c0)});`);
    js.push(`  tl.fromTo("#cliff", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${f3(c0)});`);
    js.push(`  tl.fromTo("#cq", { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${f3(c0 + 0.05)});`);
    js.push(`  tl.fromTo("#cq", { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 3, ease: "none", immediateRender: false }, ${f3(c0 + 0.4)});`);
    for (let t = c0 + 0.9; t < c1 - 0.5; t += 0.8) js.push(`  tl.fromTo("#cq", { scale: 1 }, { scale: 1.045, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, ${f3(t)});`);
    if (opts.cliff.sub) js.push(`  tl.fromTo("#cs", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35 }, ${f3(c0 + 0.8)});`);
    js.push(`  tl.to("#cliff", { opacity: 0, duration: 0.2, ease: "power1.in" }, ${f3(c1 - 0.22)});`);
    cue(c0, "impact-bass-2.mp3", 0.4, 0, 1.4);
    cue(c0 + 0.5, "heartbeat.mp3", 0.4, 0, Math.max(0.5, c1 - c0 - 0.5));
  }

  // end card: the CTA to the full video
  js.push(`  tl.fromTo("#endc", { opacity: 0 }, { opacity: 1, duration: 0.35 }, ${f3(end0 - 0.05)});`);
  js.push(`  tl.set(["#tag", "#hook", "#win", "#caps"${cliffHtml ? `, "#cliff"` : ""}], { visibility: "hidden" }, ${f3(end0 + 0.3)});`);
  js.push(`  tl.fromTo("#endc .k", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, ${f3(end0 + 0.1)});`);
  js.push(`  tl.fromTo("#endc .e1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${f3(end0 + 0.2)});`);
  js.push(`  tl.fromTo("#endc .wml", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, ${f3(end0 + 0.35)});`);
  js.push(`  tl.fromTo("#endc .e2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${f3(end0 + 0.5)});`);
  js.push(`  tl.fromTo("#endc .e2", { scale: 1 }, { scale: 1.04, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut", immediateRender: false }, ${f3(end0 + 1.4)});`);
  cue(end0, "chime.mp3", 0.28);

  const hookLen = [...opts.hook.replace(/<[^>]+>/g, "")].length, hookPx = hookLen > 38 ? 44 : 52;
  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${esc(opts.title ?? opts.tag)}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${FONT_CSS}
body { margin: 0; background: ${C.bg}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.bg}; font-family: "Hind Siliguri", "Inter", sans-serif; color: ${C.ink}; }
#bg { position: absolute; inset: 0;
  background-image: radial-gradient(ellipse at 50% 44%, rgba(0,245,212,0.13), rgba(11,15,25,0) 58%),
    radial-gradient(ellipse at 50% 92%, rgba(255,215,0,0.06), rgba(11,15,25,0) 45%),
    linear-gradient(rgba(0,245,212,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.055) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px; }
#tag { position: absolute; left: 0; right: 0; top: 272px; display: flex; justify-content: center; opacity: 0; }
#tag span { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-weight: 700; font-size: 24px; color: ${C.bg}; background: ${C.cyan}; border-radius: 8px; padding: 4px 14px 2px; }
#hook { position: absolute; left: 60px; right: 60px; top: 314px; height: 124px; display: flex; align-items: center; justify-content: center; text-align: center; opacity: 0;
  font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: ${hookPx}px; line-height: 1.12; color: #fff; text-wrap: balance; }
#hook em { font-style: normal; color: ${C.gold}; }
.band { position: absolute; left: 50px; right: 50px; top: 448px; height: 104px; display: flex; align-items: center; justify-content: center; gap: 14px; opacity: 0; }
.chip { display: inline-flex; align-items: center; gap: 12px; border-radius: 999px; border: 2px solid rgba(0,245,212,0.6); background: rgba(6,9,18,0.86); padding: 10px 24px 8px; font-weight: 700; font-size: 34px; line-height: 1.25; color: #fff; white-space: nowrap; }
.chip.gold { border-color: rgba(255,215,0,0.85); color: ${C.gold}; box-shadow: 0 0 24px rgba(255,215,0,0.18); }
.chip.red { border-color: rgba(255,77,109,0.85); }
.chip.green { border-color: rgba(16,185,129,0.9); }
.chip.dim { opacity: 0.55; }
.chip .ico { color: ${C.cyan}; display: block; flex: none; }
.chip.gold .ico { color: ${C.gold}; }
.chip.red .ico { color: ${C.red}; }
.chip.green .ico { color: ${C.green}; }
.chip .n { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; color: ${C.gold}; }
.arw { color: ${C.muted}; display: block; flex: none; }
.meter { width: 150px; height: 16px; border-radius: 8px; background: rgba(255,255,255,0.12); overflow: hidden; flex: none; }
.meter i { display: block; height: 100%; border-radius: 8px; transform-origin: 0 50%; }
#win { position: absolute; left: ${WIN.x}px; top: ${WIN.y}px; width: ${WIN.w}px; height: ${WIN.h}px; border-radius: 28px; overflow: hidden; background: #05070d; opacity: 0; }
#winframe { position: absolute; inset: 0; border-radius: 28px; border: 2px solid rgba(0,245,212,0.75); box-shadow: 0 0 34px rgba(0,245,212,0.30), inset 0 0 22px rgba(0,245,212,0.10); box-sizing: border-box; pointer-events: none; }
#scrwrap { position: absolute; inset: 0; transform-origin: 50% 50%; }
#scrv { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
#facewrap { position: absolute; inset: 0; overflow: hidden; }
#facev { position: absolute; inset: 0; width: ${WIN.w}px; height: ${WIN.h}px; transform-origin: 50% 40%; }
${full ? `#ffwrap { position: absolute; inset: 0; overflow: hidden; }
#ffv { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 540px 835px; }
#ffshade { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(rgba(4,6,12,0.78), rgba(4,6,12,0.30) 470px, rgba(4,6,12,0) 640px, rgba(4,6,12,0) 1120px, rgba(4,6,12,0.55) 1320px, rgba(4,6,12,0.85)); }
#ffframe { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; pointer-events: none; filter: drop-shadow(0 0 14px rgba(0,245,212,0.55)); }
#hook { text-shadow: 0 2px 14px rgba(0,0,0,0.55); }
` : ""}#cutfx { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
#prog { position: absolute; left: ${WIN.x}px; width: ${WIN.w}px; top: 1232px; height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden; }
#prog i { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); transform-origin: 0 50%; box-shadow: 0 0 12px rgba(255,215,0,0.5); }
#caps { position: absolute; left: 0; right: 0; top: 1124px; height: 92px; }
.cue { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; }
.cue .pill { display: flex; gap: 18px; white-space: nowrap; padding: 8px 30px 12px; border-radius: 999px; background: rgba(6,9,18,0.9); border: 1px solid rgba(255,255,255,0.14);
  font-weight: 700; font-size: 50px; line-height: 1.3; color: #fff; }
.cue .w { display: inline-block; transform-origin: 50% 80%; }
#cliff { position: absolute; inset: 0; background: rgba(4,6,12,0.78); opacity: 0; }
#cq { position: absolute; left: 80px; right: 80px; top: 640px; height: 400px; display: flex; align-items: center; justify-content: center; text-align: center;
  font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 96px; line-height: 1.15; color: ${C.gold}; text-wrap: balance; text-shadow: 0 0 40px rgba(255,215,0,0.35); }
#cs { position: absolute; left: 80px; right: 80px; top: 1150px; text-align: center; font-weight: 700; font-size: 40px; color: #E6ECF5; opacity: 0; }
#endc { position: absolute; inset: 0; background: ${C.bg}; opacity: 0;
  background-image: radial-gradient(ellipse at 50% 42%, rgba(0,245,212,0.16), rgba(11,15,25,0) 60%), linear-gradient(rgba(0,245,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px; }
#endc .inner { position: absolute; left: 70px; right: 70px; top: 470px; height: 640px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 26px; }
#endc .k { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-weight: 700; font-size: 28px; color: ${C.bg}; background: ${C.cyan}; border-radius: 8px; padding: 4px 16px 2px; }
.e1 { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 70px; line-height: 1.15; color: #fff; text-wrap: balance; }
.e1 em { font-style: normal; color: ${C.gold}; }
.wml { width: 480px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); transform-origin: 50% 50%; }
.e2 { display: inline-flex; align-items: center; gap: 14px; border-radius: 999px; border: 2px solid rgba(255,215,0,0.85); padding: 12px 30px 10px; font-weight: 700; font-size: 40px; color: ${C.gold}; background: rgba(6,9,18,0.8); }
.e2 .ico { color: ${C.gold}; display: block; flex: none; }
${opts.css ?? ""}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${f3(total)}">
      <div id="bg"></div>${full ? `
      <div id="ffwrap"><video id="ffv" src="assets/media/face.mp4" muted playsinline data-start="0" data-duration="${f3(total)}" data-track-index="1"></video><div id="ffshade"></div></div>
      <svg id="ffframe" width="1080" height="1920" viewBox="0 0 1080 1920"><rect id="ffrect" x="1" y="1" width="1078" height="1918" rx="0" fill="none" stroke="rgba(0,245,212,0.9)" stroke-width="2"/></svg>` : ""}
      <div id="tag"><span>${esc(opts.tag)}</span></div>
      <div id="hook"><div>${opts.hook}</div></div>
${chipsHtml}
      <div id="win" data-layout-allow-overflow>
        <div id="scrwrap"><video id="scrv" src="assets/media/screen.mp4" muted playsinline data-start="0" data-duration="${f3(total)}" data-track-index="0"></video></div>
${full ? "" : `        <div id="facewrap"><video id="facev" src="assets/media/face.mp4" muted playsinline data-start="0" data-duration="${f3(total)}" data-track-index="1"></video></div>`}
        <div id="cutfx"></div>
        <div id="winframe"></div>
      </div>
      <div id="prog"><i></i></div>
      <div id="caps">
${capsHtml}
      </div>
${cliffHtml}
      <div id="endc"><div class="inner"><div class="k">${esc(opts.endTag ?? opts.tag)}</div><div class="e1">${opts.cta[0]}</div><div class="wml"></div><div class="e2">${opts.cta[1]}</div></div></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const BND = "০১২৩৪৫৬৭৮৯";
      function bnNum(v, dec) { return v.toFixed(dec).replace(/[0-9]/g, (d) => BND[d]); }
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  writeFileSync(path.join(dir, "index.html"), html);
  sfx.sort((a, b) => a.t - b.t);
  writeJSON(path.join(ctx.cfg.work, "sfx.json"), sfx);
  console.log(`index.html: ${total} s, ${map.segments.length} pieces, ${chips.length} chip groups, ${pages.length} caption pages, ${sfx.length} new sounds`);
}
