// reel-core.mjs — a vertical 9:16 clip (Instagram Reel / Shorts) cut from an episode, sharing its graded camera,
// mastered voice and caption words. The Reel's own build-page.mjs supplies the hook line and the graphics groups.
//
// Layout (1080×1920), kept inside Instagram's safe area (top 14 %, bottom 35 % and 6 % sides are covered by the app):
//   y 290–470   series tag + hook title (on screen from frame 1)
//   y 500–1100  the camera in a 950×600 rounded card (face ≈ y 660–905), jump-cut zoom alternation inside
//   y 920–1090  graphics band over the lower card (one group at a time)
//   y ≈ 1155    word-by-word caption pill (60 % from the top)
//   cliff       optional freeze after the last word: the picture holds, the screen darkens, the open question
//               slams in the middle (riser → hit → heartbeat) — a Reel that ends on a cliffhanger
//   last 3 s    end card: the episode CTA
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { C, FONT_CSS, beatsToJs, captionPages, esc } from "./page-core.mjs";
import { loadEpisode, makeMapper, readJSON, writeJSON } from "./lib.mjs";

const f3 = (x) => Number(x).toFixed(3);
const CARD = { x: 65, y: 500, w: 950, h: 600 }, CAM = { s: 0.7, cx: 1050, cy: 500 };

export function reelContext(dir) {
  const ep = loadEpisode(dir);
  const map = readJSON(path.join(ep.work, "cuts_map.json"));
  const src = existsSync(path.join(ep.work, "words.json")) ? readJSON(path.join(ep.work, "words.json")) : [];
  const T = makeMapper(map, "main");
  const W = (needles, near, win = 6) => {
    const list = Array.isArray(needles) ? needles : [needles];
    let best = null;
    for (const w of src) if (Math.abs(w.start - near) <= win && list.some((n) => w.text.includes(n)) && (!best || Math.abs(w.start - near) < Math.abs(best.start - near))) best = w;
    if (!best) console.warn(`WARN word ${list.join("/")} not found within ${win} s of ${near}; using ${near}`);
    return best ? best.start : near;
  };
  return { ep, map, src, T, TW: (n, near, win) => T(W(n, near, win)) };
}

// Replace the caption words between two source times with better-timed ones (e.g. a Bengali ASR pass of the
// Reel's last seconds): the subtitle-based estimate can be a second or more off, and a cliffhanger must not caption
// a word that is cut off.
export function patchWords(ctx, from, to, list) {
  ctx.src = ctx.src.filter((w) => w.start < from || w.start >= to).concat(list).sort((a, b) => a.start - b.start);
}

// opts: { hook, tag, groups: [{ at, html, beats, sfx: [[t, file, vol, from?, d?]] }], cta: [line1, line2], cliff?: { text, sub } }
export function buildReel(ctx, opts) {
  const { ep, map, src } = ctx;
  const total = map.total, endAt = map.end ? map.end.out0 : total;
  // speech, captions and graphics stop where the cliff freeze begins
  const stopAt = map.cliff ? map.cliff.out0 : endAt;
  const js = [], sfx = [];
  const cue = (t, file, vol, from, d) => sfx.push({ t: Number(t.toFixed(3)), file, vol, ...(from != null && { from }), ...(d != null && { d }) });

  // caption words on the clip timeline
  const words = [];
  for (const w of src) {
    const mid = (w.start + w.end) / 2;
    for (const s of map.segments) if (mid >= s.src0 && mid < s.src1)
      words.push({ text: w.text, start: s.out0 + (Math.max(w.start, s.src0) - s.src0), end: s.out0 + (Math.min(w.end, s.src1) - s.src0), part: s.part });
  }
  words.sort((a, b) => a.start - b.start);
  const pages = captionPages(words, { maxWords: 4, minWords: 2, maxChars: 24, gapBreak: 0.7 });
  let capsHtml = "", wi = 0;
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    const show = Math.max(0, p[0].start - 0.06);
    let hide = Math.min(p.at(-1).end + 0.35, stopAt - 0.05);
    if (next && next[0].start - p.at(-1).end < 0.6) hide = next[0].start - 0.06;
    if (next) hide = Math.min(hide, next[0].start - 0.06);
    capsHtml += `<div class="cue" id="cue${i}"><div class="pill">${p.map((w) => `<span class="w" id="w${wi++}">${esc(w.text)}</span>`).join("")}</div></div>\n`;
    js.push(`  tl.set("#cue${i}", { opacity: 1 }, ${f3(show)}); tl.set("#cue${i}", { opacity: 0 }, ${f3(hide)});`);
  });
  wi = 0;
  for (const p of pages) for (const w of p) {
    const id = `#w${wi++}`;
    js.push(`  tl.set("${id}", { color: "${C.gold}" }, ${f3(w.start)}); tl.fromTo("${id}", { scale: 1 }, { scale: 1.05, duration: 0.09, yoyo: true, repeat: 1, immediateRender: false }, ${f3(w.start)}); tl.set("${id}", { color: "#FFFFFF" }, ${f3(Math.max(w.start + 0.08, w.end))});`);
  }

  // camera: placed with gsap.set (never a CSS transform on a tweened node); zoom alternation per kept piece
  const tx = CARD.w / 2 - CAM.s * CAM.cx, ty = CARD.h / 2 - CAM.s * CAM.cy;
  js.push(`  gsap.set("#camwrap", { x: ${f3(tx)}, y: ${f3(ty)}, scale: ${CAM.s}, transformOrigin: "0 0" });`, `  gsap.set("#camv", { scale: 1.025 });`);
  map.segments.forEach((s, i) => {
    const base = i % 2 ? 1.07 : 1.0;
    js.push(`  tl.fromTo("#camv", { scale: ${f3(base + 0.025)} }, { scale: ${f3(base)}, duration: ${f3(Math.max(0.2, s.out1 - s.out0 - 0.04))}, ease: "none", immediateRender: false }, ${f3(s.out0)});`);
  });

  // entrances: hook and card in the first second
  js.push(`  tl.fromTo("#hook", { opacity: 1, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, 0);`);
  js.push(`  tl.fromTo("#tag", { opacity: 1, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.0);`);
  js.push(`  tl.fromTo("#card", { opacity: 0.35, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.0);`);
  cue(0.02, "whoosh.mp3", 0.45);

  // graphics groups in the band
  let groupsHtml = "";
  opts.groups.sort((a, b) => a.at - b.at);
  opts.groups.forEach((g, i) => { const n = opts.groups[i + 1]; if (n && n.at - g.at < 1.5) throw new Error(`graphics group ${i} at ${g.at.toFixed(2)} s is under 1.5 s before the next (${n.at.toFixed(2)} s)`); });
  opts.groups.forEach((g, i) => {
    const next = opts.groups[i + 1];
    const out = Math.min(next ? next.at : stopAt, stopAt) - 0.3;
    groupsHtml += `<div class="band" id="g${i}">${g.html}</div>\n`;
    js.push(`  tl.fromTo("#g${i}", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${f3(g.at)});`);
    js.push(`  tl.to("#g${i}", { opacity: 0, duration: 0.3 }, ${f3(out)});`);
    if (g.beats) js.push(beatsToJs(g.beats));
    for (const s of g.sfx ?? []) cue(s[0], s[1], s[2], s[3], s[4]);
  });

  // cliffhanger: frozen picture (camcut holds the last frame), dark veil, the question slams in and pulses
  let cliffHtml = "";
  if (map.cliff && opts.cliff) {
    const c0 = map.cliff.out0, c1 = map.cliff.out1, last = map.segments.filter((x) => x.part === "main").length - 1;
    const base = last % 2 ? 1.07 : 1.0;
    cliffHtml = `<div id="cliff"><div id="cq">${opts.cliff.text}</div>${opts.cliff.sub ? `<div id="cs">${opts.cliff.sub}</div>` : ""}</div>`;
    js.push(`  tl.fromTo("#camv", { scale: ${f3(base)} }, { scale: ${f3(base + 0.07)}, duration: ${f3(c1 - c0)}, ease: "power1.in", immediateRender: false }, ${f3(c0)});`);
    js.push(`  tl.set("#caps", { opacity: 0 }, ${f3(c0)});`);
    js.push(`  tl.fromTo("#cliff", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${f3(c0)});`);
    js.push(`  tl.fromTo("#cq", { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${f3(c0 + 0.05)});`);
    js.push(`  tl.fromTo("#cq", { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 3, ease: "none", immediateRender: false }, ${f3(c0 + 0.4)});`);
    for (let t = c0 + 0.9; t < c1 - 0.6; t += 0.85)
      js.push(`  tl.fromTo("#cq", { scale: 1 }, { scale: 1.045, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, ${f3(t)});`);
    if (opts.cliff.sub) js.push(`  tl.fromTo("#cs", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, ${f3(c0 + 1.0)});`);
    cue(c0 - 3.4, "riser.mp3", 0.3, 6.5, 3.45);
    cue(c0, "impact-bass-1.mp3", 0.3, 0, 1.6);
    cue(c0 + 0.6, "heartbeat.mp3", 0.4, 0, Math.min(3.6, c1 - c0 - 0.5));
  }

  // end card
  js.push(`  tl.fromTo("#endc", { opacity: 0 }, { opacity: 1, duration: 0.45 }, ${f3(endAt - 0.3)});`);
  js.push(`  tl.set(["#tag", "#hook", "#deco", "#card", "#caps"${cliffHtml ? `, "#cliff"` : ""}], { visibility: "hidden" }, ${f3(endAt + 0.2)});`);
  js.push(`  tl.fromTo("#endc .e1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${f3(endAt + 0.15)});`);
  js.push(`  tl.fromTo("#endc .e2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${f3(endAt + 0.45)});`);
  js.push(`  tl.fromTo("#endc .wml", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, ${f3(endAt + 0.3)});`);
  cue(endAt + 0.1, "chime.mp3", 0.25);

  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${esc(opts.hook)}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${FONT_CSS}
body { margin: 0; background: ${C.bg}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.bg}; font-family: "Hind Siliguri", "Inter", sans-serif; color: ${C.ink}; }
#bg { position: absolute; inset: 0;
  background-image: radial-gradient(ellipse at 50% 38%, rgba(0,245,212,0.12), rgba(11,15,25,0) 60%),
    linear-gradient(rgba(0,245,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px; }
#tag { position: absolute; left: 0; right: 0; top: 290px; display: flex; justify-content: center; opacity: 0; }
#tag span { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-weight: 700; font-size: 24px; color: ${C.bg}; background: ${C.cyan}; border-radius: 8px; padding: 4px 12px 2px; }
#hook { position: absolute; left: 65px; right: 65px; top: 334px; height: 140px; display: flex; align-items: center; justify-content: center; text-align: center; opacity: 0;
  font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 58px; line-height: 1.15; color: #fff; text-wrap: balance; }
#hook span { display: block; }
#hook em { font-style: normal; color: ${C.gold}; }
#deco { position: absolute; left: 0; top: 1400px; width: 1080px; height: 200px; background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDEwODAgMjAwIj48dGV4dCB4PSI1NDAiIHk9Ijk1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iOTIiIGZpbGw9InJnYmEoMCwyNDUsMjEyLDAuMDcpIj5USEUgQUdFIE9GIEFJPC90ZXh0Pjx0ZXh0IHg9IjU0MCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iSW50ZXIsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iNTgiIGZpbGw9InJnYmEoMjU1LDIxNSwwLDAuMDYpIj4mYW1wOyBTWVNURU1TIFRISU5LSU5HPC90ZXh0Pjwvc3ZnPg==") no-repeat; }
#card { position: absolute; left: ${CARD.x}px; top: ${CARD.y}px; width: ${CARD.w}px; height: ${CARD.h}px; border-radius: 30px; overflow: hidden; opacity: 0; background: #000; }
#cardframe { position: absolute; inset: 0; border-radius: 30px; border: 2px solid ${C.cyan}; box-shadow: 0 0 30px rgba(0,245,212,0.35), inset 0 0 20px rgba(0,245,212,0.10); box-sizing: border-box; pointer-events: none; }
#camwrap { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
#camv { position: absolute; inset: 0; transform-origin: 1050px 470px; }
#camv video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#shade { position: absolute; left: 0; right: 0; bottom: 0; height: 220px; background: linear-gradient(rgba(6,9,18,0), rgba(6,9,18,0.82)); }
.band { position: absolute; left: ${CARD.x + 25}px; right: ${1080 - CARD.x - CARD.w + 25}px; top: 920px; height: 170px; display: flex; align-items: center; justify-content: center; gap: 18px; opacity: 0; }
.chip { display: inline-flex; align-items: center; gap: 12px; border-radius: 999px; border: 2px solid rgba(0,245,212,0.6); background: rgba(6,9,18,0.82); padding: 10px 24px 8px; font-weight: 700; font-size: 34px; color: #fff; white-space: nowrap; }
.chip.gold { border-color: rgba(255,215,0,0.8); color: ${C.gold}; }
.chip.red { border-color: rgba(255,77,109,0.8); }
.chip.green { border-color: rgba(16,185,129,0.85); }
.chip .ico { color: ${C.cyan}; }
.chip.gold .ico { color: ${C.gold}; }
.stat { flex: 1; border-radius: 22px; background: rgba(6,9,18,0.86); border: 2px solid rgba(255,77,109,0.7); padding: 14px 20px 12px; text-align: center; }
.stat.green { border-color: rgba(16,185,129,0.8); }
.stat .num { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 64px; line-height: 1.05; color: ${C.red}; }
.stat.green .num { color: ${C.green}; }
.stat .sl { font-weight: 600; font-size: 28px; color: #E6ECF5; }
.panel { width: 100%; border-radius: 22px; background: rgba(6,9,18,0.86); border: 2px solid rgba(255,215,0,0.6); padding: 16px 26px; box-sizing: border-box;
  font-weight: 700; font-size: 36px; line-height: 1.3; color: #fff; text-align: center; text-wrap: balance; }
.panel em { font-style: normal; color: ${C.gold}; }
.col { display: flex; flex-direction: column; gap: 10px; align-items: stretch; width: 100%; }
.li { display: flex; align-items: center; gap: 14px; border-radius: 16px; background: rgba(6,9,18,0.86); border: 2px solid rgba(255,255,255,0.14); padding: 6px 20px; font-weight: 600; font-size: 30px; color: #fff; }
.li .ico { color: ${C.muted}; }
.stamp { position: absolute; right: 10px; top: 20px; border: 6px solid ${C.red}; border-radius: 12px; padding: 8px 20px 4px; color: ${C.red}; background: rgba(11,15,25,0.85);
  font-family: "Inter", sans-serif; font-weight: 900; font-size: 56px; letter-spacing: 0.06em; line-height: 1; opacity: 0; }
.bars { width: 100%; display: grid; grid-template-columns: 210px 1fr; gap: 10px 16px; align-items: center; }
.bl { font-weight: 700; font-size: 30px; color: #fff; text-align: right; }
.track { height: 48px; border-radius: 12px; background: rgba(6,9,18,0.86); border: 1px solid rgba(255,255,255,0.12); overflow: hidden; }
.hb { height: 100%; border-radius: 12px; transform-origin: 0 50%; display: flex; align-items: center; padding-left: 16px; box-sizing: border-box;
  font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 32px; color: #0B0F19; white-space: nowrap; }
.hb.red { width: 100%; background: ${C.red}; }
.hb.green { width: 36%; background: ${C.green}; }
.bub { max-width: 860px; border-radius: 24px; padding: 14px 24px; background: rgba(6,9,18,0.88); border: 2px solid rgba(255,255,255,0.18);
  font-weight: 700; font-size: 34px; line-height: 1.3; color: #fff; display: flex; gap: 14px; align-items: center; }
.bub .ico { color: ${C.muted}; flex: none; }
.bub.ai { border-color: rgba(255,215,0,0.85); color: ${C.gold}; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-size: 50px; }
.bub.ai .ico { color: ${C.gold}; }
.ico { display: block; flex: none; }
.steps { display: flex; align-items: flex-end; gap: 14px; height: 100%; }
.steps .chip:nth-child(2) { margin-bottom: 48px; }
.steps .chip:nth-child(3) { margin-bottom: 96px; }
.wrap { display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: 12px; width: 100%; }
.strike { position: relative; }
.strike .sk { position: absolute; left: -8px; right: -8px; top: 48%; height: 7px; border-radius: 4px; background: ${C.red}; transform-origin: 0 50%; }
.stamp.green { border-color: ${C.green}; color: ${C.green}; }
.rows { width: 100%; display: grid; grid-template-columns: 130px 1fr; gap: 12px 14px; align-items: center; }
.rows .rl { font-weight: 700; font-size: 30px; color: ${C.muted}; text-align: right; }
.rows .rc { display: flex; gap: 10px; flex-wrap: wrap; }
#caps { position: absolute; left: 0; right: 0; top: 1110px; height: 90px; }
.cue { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; }
.cue .pill { display: flex; gap: 18px; white-space: nowrap; padding: 8px 30px 12px; border-radius: 999px; background: rgba(6,9,18,0.86); border: 1px solid rgba(255,255,255,0.12);
  font-weight: 700; font-size: 50px; line-height: 1.3; color: #fff; }
.cue .w { display: inline-block; transform-origin: 50% 80%; }
#cliff { position: absolute; inset: 0; background: rgba(4,6,12,0.74); opacity: 0; }
#cq { position: absolute; left: 80px; right: 80px; top: 600px; height: 420px; display: flex; align-items: center; justify-content: center; text-align: center;
  font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 92px; line-height: 1.15; color: ${C.gold}; text-wrap: balance;
  text-shadow: 0 0 40px rgba(255,215,0,0.35); }
#cs { position: absolute; left: 80px; right: 80px; top: 1040px; text-align: center; font-weight: 700; font-size: 40px; color: #E6ECF5; opacity: 0; }
#endc { position: absolute; inset: 0; background: ${C.bg}; opacity: 0;
  background-image: radial-gradient(ellipse at 50% 42%, rgba(0,245,212,0.16), rgba(11,15,25,0) 60%), linear-gradient(rgba(0,245,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px; }
#endc .inner { position: absolute; left: 65px; right: 65px; top: 520px; height: 560px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 22px; }
.wm { font-family: "Inter", sans-serif; font-weight: 900; font-size: 104px; letter-spacing: 0.12em; color: #fff; line-height: 1; }
.wml { width: 460px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); transform-origin: 50% 50%; }
.e1 { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 56px; line-height: 1.25; color: #fff; text-wrap: balance; }
.e1 em { font-style: normal; color: ${C.gold}; }
.e2 { font-weight: 600; font-size: 34px; color: #C9D4E6; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${f3(total)}">
      <div id="bg"></div>
      <div id="tag"><span>${esc(opts.tag)}</span></div>
      <div id="hook"><span>${opts.hook}</span></div>
      <div id="deco"></div>
      <div id="card" data-layout-allow-overflow>
        <div id="camwrap"><div id="camv"><video id="camvid" src="assets/media/cam_cut.mp4" muted playsinline data-start="0" data-duration="${f3(total)}" data-track-index="0"></video></div></div>
        <div id="shade"></div>
        <div id="cardframe"></div>
      </div>
${groupsHtml}
${cliffHtml}
      <div id="caps">
${capsHtml}
      </div>
      <div id="endc"><div class="inner"><div class="wm">ZUBAYER</div><div class="wml"></div><div class="e1">${opts.cta[0]}</div><div class="e2">${opts.cta[1]}</div></div></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const BND = "০১২৩৪৫৬৭৮৯";
      function bnNum(v, dec) { return v.toFixed(dec).replace(/[0-9]/g, (d) => BND[d]); }
      const tl = gsap.timeline({ paused: true });
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  writeFileSync(path.join(ep.dir, "index.html"), html);
  sfx.sort((a, b) => a.t - b.t);
  writeJSON(path.join(ep.work, "sfx.json"), sfx);
  console.log(`index.html: ${total} s, ${map.segments.length} pieces, ${opts.groups.length} graphics groups, ${pages.length} caption pages, ${sfx.length} sounds`);
}
