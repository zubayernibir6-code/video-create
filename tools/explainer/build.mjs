#!/usr/bin/env node
// build.mjs — a voiced EXPLAINER, style EXP1 "ব্যাখ্যা বোর্ড": his (cloned) voice + a scene list → a finished
// HyperFrames page. No footage: every picture is drawn (simplified app windows, diagrams, cards, drawn icons).
//   node tools/explainer/build.mjs projects/<name> [--no-mix] [--estimate] [--times] [--no-captions]
//   (--no-captions: the same page without the burned caption pill, for a YouTube upload that uses the .srt only)
// Reads projects/<name>/build/explainer.json:
//   { "title", "script": "build/voice-script.txt" (gemini.mjs format: [tag] lines, [pause n]),
//     "voice": "assets/media/voice/voice.wav",  "minMatch": 0.8,
//     "lead": 0.25, "tail": 2.5, "holds": { "<line>": seconds of silence added after that line },
//     "music": { "file": "assets/media/music/bgm.mp3", "from": 0, "lufsUnder": -35, "lufsGap": -30 },
//     "display": { "<voice spelling>": "<caption spelling>" }   e.g. "স্কিল ডট এমডি": "SKILL.md",
//     "chapters": [{ "at": "L4", "name": "সমস্যা" }, …],   "brand": "Claude Skills",
//     "scenes": [{ "type": <scenes.mjs type>, "at": "L4" (start ref), "desc": "<PLAN row text>", …type data }],
//     "plan": { header fields + goal/hook/needs/style/questions for PLAN.md } }
// Time refs (any "…At"/"at" field): "L12" line 12's first word · "L12e" its last word's end · "L12:নাম" the first
//   word of line 12 that contains "নাম" ("@2" = second such word, ">" = its end) · "+0.3"/"-0.2" offsets · "start"
//   = the scene's own start · a number = seconds on the video. A ref to a word the line does not have STOPS the build.
// Writes index.html (one paused GSAP timeline, seek-safe; captions and the chapter bar are ONE onUpdate tween that
// reads data arrays), assets/media/voice/voice-edit.wav (holds inserted), assets/media/mix.wav (promo-mix: voice,
// ducked BGM at measured loudness, every SFX at its moment minus lead_s), build/timeline.json, build/captions.json,
// and PLAN.md (header + script with measured starts + a shot table built from the scenes) for plan-check.
// --estimate: no voice yet; lines timed at 2.3 words/s, a silent preview to check the pictures.
// Verified 2026-11-02 on projects/claude-skills-tutorial (5:05, 22 scenes, his voice talha-g).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildMix } from "../screen/promo-mix.mjs";
import { voiceTimes } from "../autocap/voice-times.mjs";
import { norm } from "../reel/align.mjs";
import { SCENES, CSS as SCENE_CSS, esc, bn } from "./scenes.mjs";

const FF = process.env.HYPERFRAMES_FFMPEG_PATH || "ffmpeg";
const f3 = (x) => Number(x).toFixed(3);
const argv = process.argv.slice(2);
const has = (k) => argv.includes(`--${k}`);
const proj = path.resolve(argv.find((a) => !a.startsWith("--")) ?? "");
const cfgFile = path.join(proj, "build", "explainer.json");
if (!fs.existsSync(cfgFile)) { console.error("usage: node tools/explainer/build.mjs projects/<name>   (needs build/explainer.json)"); process.exit(1); }
const C = JSON.parse(fs.readFileSync(cfgFile, "utf8").replace(/^\uFEFF/, ""));
const fail = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// ── 1. the script: one entry per spoken line (tags and pauses stripped) ──
const lines = fs.readFileSync(path.join(proj, C.script), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)
  .map((l) => l.trim().replace(/^\[([^\]]+)\]\s*/, (m, t) => (/^pause\s/i.test(t) ? "\u0000" : "")))
  .filter((l) => l && !l.startsWith("\u0000"));
console.log(`• ${lines.length} script lines`);

// ── 2. where every line and word sits in the voice file ──
const voiceFile = path.join(proj, C.voice);
let V;
if (!has("estimate") && fs.existsSync(voiceFile)) {
  try { V = voiceTimes(voiceFile, lines, [], { minMatch: C.minMatch ?? 0.8 }); } catch (e) { fail(e.message); }
  console.log(`• voice ${V.dur.toFixed(1)} s, script matched ${Math.round(V.matched * 100)} %`);
} else {
  // reading-pace estimate: a silent preview
  let t = 0; const words = [], out = [];
  lines.forEach((l, li) => {
    const ws = l.split(/\s+/); const a = t;
    ws.forEach((w) => { words.push({ text: w, start: t, end: t + 0.38, line: li }); t += 1 / 2.3; });
    out.push({ a, b: t, cutIn: Math.max(0, a - 0.2), cutOut: t + 0.2 }); t += 0.55;
  });
  V = { dur: t, matched: 1, lines: out, words };
  console.log(`• estimate (no voice): ${t.toFixed(1)} s`);
}

// ── 3. holds: silence added after a line (a picture that needs a beat) → video time of every voice second ──
const LEAD = C.lead ?? 0.25, TAIL = C.tail ?? 2.5, holds = C.holds ?? {};
const segs = []; // { li, v0, v1, t0 }
{
  let t = LEAD;
  V.lines.forEach((l, li) => {
    const v0 = li === 0 ? 0 : l.cutIn, v1 = li === V.lines.length - 1 ? V.dur : l.cutOut;
    segs.push({ li, v0, v1, t0: t });
    t += v1 - v0 + (holds[li + 1] ?? 0);
  });
}
const vt = (v, li) => { const s = segs[li]; return s.t0 + Math.min(Math.max(v, s.v0), s.v1) - s.v0; };
const lastSeg = segs.at(-1);
const TOTAL = +(lastSeg.t0 + (lastSeg.v1 - lastSeg.v0) + TAIL).toFixed(3);
const W = V.words.map((w) => ({ ...w, s: vt(w.start, w.line), e: vt(w.end, w.line) }));
const L = V.lines.map((l, li) => ({ a: vt(l.a, li), b: vt(l.b, li) }));
console.log(`• video ${TOTAL.toFixed(2)} s (lead ${LEAD}, holds ${Object.values(holds).reduce((x, y) => x + y, 0).toFixed(2)} s, tail ${TAIL})`);

if (has("times")) {
  L.forEach((l, i) => console.log(`L${i + 1}  ${l.a.toFixed(2)}–${l.b.toFixed(2)}  ${lines[i].slice(0, 70)}`));
  process.exit(0);
}

// ── 4. time refs ──
function resolve(ref, sceneStart) {
  if (typeof ref === "number") return ref;
  if (ref == null) throw new Error("missing time ref");
  let s = String(ref).trim(), off = 0;
  const m = s.match(/([+-]\d+(?:\.\d+)?)$/);
  if (m && !/^L\d+$/.test(s)) { off = +m[1]; s = s.slice(0, -m[1].length); }
  if (s === "start") return sceneStart + off;
  if (s === "end") return TOTAL + off;
  let mm = s.match(/^L(\d+)(e?)$/);
  if (mm) { const l = L[+mm[1] - 1]; if (!l) throw new Error(`no line ${mm[1]} (ref "${ref}")`); return (mm[2] ? l.b : l.a) + off; }
  mm = s.match(/^L(\d+):(.+?)(@\d+)?(>)?$/);
  if (mm) {
    const li = +mm[1] - 1, want = mm[2].startsWith("#") ? null : norm(mm[2]), nth = mm[3] ? +mm[3].slice(1) : 1;
    const ws = W.filter((w) => w.line === li);
    if (!ws.length) throw new Error(`no line ${mm[1]} (ref "${ref}")`);
    let w;
    if (!want) w = ws[+mm[2].slice(1)];
    else w = ws.filter((x) => norm(x.text).includes(want))[nth - 1];
    if (!w) throw new Error(`line ${mm[1]} has no word "${mm[2]}"${nth > 1 ? ` #${nth}` : ""} (ref "${ref}"): "${lines[li]}"`);
    return (mm[4] ? w.e : w.s) + off;
  }
  throw new Error(`bad time ref "${ref}"`);
}

// ── 5. scenes ──
const starts = C.scenes.map((sc, i) => (i === 0 ? 0 : resolve(sc.at, 0) - (sc.lead ?? 0.3)));
starts.forEach((t, i) => { if (i && t <= starts[i - 1] + 0.8) fail(`scene ${i + 1} (${C.scenes[i].type}) starts ${t.toFixed(2)} s, too close to scene ${i} (${starts[i - 1].toFixed(2)} s)`); });
const tweens = [], cues = [], sceneHtml = [], shotRows = [];
C.scenes.forEach((sc, i) => {
  const id = `s${i + 1}`, T0 = starts[i], T1 = i + 1 < starts.length ? starts[i + 1] : TOTAL;
  sc.id = id;
  const K = {
    T0, T1,
    id: (s) => `${id}-${s}`,
    t: (ref) => resolve(ref, T0),
    tw: (line) => tweens.push(line),
    snd: (ref, file, vol = 0.4, delay = 0) => cues.push({ t: +(resolve(ref, T0) + delay).toFixed(3), file, vol }),
    rv(el, ref, kind = "up", o = {}) {
      const t = resolve(ref, T0) + (o.delay ?? 0), d = o.dur ?? (kind === "wipe" ? 0.6 : kind === "pop" ? 0.42 : 0.45);
      const dy = o.dy ?? 26;
      const V2 = {
        up: [`{ opacity: 0, y: ${dy} }`, `{ opacity: 1, y: 0`, "power3.out"],
        down: [`{ opacity: 0, y: ${-dy} }`, `{ opacity: 1, y: 0`, "power3.out"],
        left: [`{ opacity: 0, x: -48 }`, `{ opacity: 1, x: 0`, "power3.out"],
        right: [`{ opacity: 0, x: 48 }`, `{ opacity: 1, x: 0`, "power3.out"],
        pop: [`{ opacity: 0, scale: 0.6 }`, `{ opacity: 1, scale: 1`, "back.out(1.7)"],
        fade: [`{ opacity: 0 }`, `{ opacity: 1`, "power1.out"],
        grow: [`{ opacity: 1, scaleX: 0 }`, `{ opacity: 1, scaleX: 1`, "power2.out"],
        wipe: [`{ opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }`, `{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)"`, "none"],
      }[kind];
      if (!V2) throw new Error(`scene ${id}: no reveal "${kind}"`);
      if (t < T0 - 0.01 || t > T1) console.log(`  ⚠ ${id} (${sc.type}): #${el} appears at ${t.toFixed(2)} s, outside its scene ${T0.toFixed(2)}–${T1.toFixed(2)}`);
      // Time guard (2026-11-02: the hook's skill list hung on the line's LAST word and showed 0.5 s before the cut)
      else if (T1 - t < 1.2 && i + 1 < C.scenes.length) console.log(`  ⚠ ${id} (${sc.type}): #${el} appears ${(T1 - t).toFixed(2)} s before its scene ends: anchor it on an earlier word or add a hold after that line`);
      tweens.push(`tl.fromTo("#${el}", ${V2[0]}, ${V2[1]}, duration: ${f3(d)}, ease: "${V2[2]}" }, ${f3(t)});`);
    },
    out(el, ref, o = {}) {
      const t = resolve(ref, T0) + (o.delay ?? 0);
      tweens.push(`tl.fromTo("#${el}", { opacity: 1 }, { opacity: 0, duration: ${f3(o.dur ?? 0.3)}, ease: "power1.in", immediateRender: false }, ${f3(t)});`);
    },
  };
  const make = SCENES[sc.type];
  if (!make) fail(`scene ${i + 1}: no type "${sc.type}" (types: ${Object.keys(SCENES).join(", ")})`);
  let html;
  try { html = make(sc, K); } catch (e) { fail(`scene ${i + 1} (${sc.type}): ${e.message}`); }
  sceneHtml.push(`<div class="scene" id="${id}">${html}</div>`);
  tweens.push(`tl.fromTo("#${id}", { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, ${f3(T0)});`);
  if (i + 1 < starts.length) {
    tweens.push(`tl.fromTo("#${id}", { opacity: 1, scale: 1 }, { opacity: 0, scale: 1, duration: 0.35, ease: "power1.in", immediateRender: false }, ${f3(T1)});`);
    cues.push({ t: +T1.toFixed(3), file: i % 3 === 2 ? "whoosh" : "whoosh-short", vol: 0.42 });
  }
  shotRows.push({ t: T0, scene: i, desc: sc.desc, text: sc.text });
  for (const b of sc.shots ?? []) shotRows.push({ t: resolve(b.at, T0), scene: i, desc: b.desc, text: b.text });
});

// State guard (2026-11-02: every click ring showed from its scene's start until its click — a fromTo renders its FROM
// state at build time unless told not to, the same trap compose.mjs met on 2026-11-01): a tween that STARTS visible
// (from opacity > 0) and fades out must carry immediateRender: false, or the build stops.
{
  const startsVisible = /^tl\.fromTo\("[^"]+", \{ opacity: (?:0?\.\d*[1-9]\d*|1)\b[^}]*\}, \{ opacity: 0\b/;
  const bad = tweens.filter((t) => startsVisible.test(t) && !/immediateRender: false/.test(t));
  if (bad.length) fail(`${bad.length} one-shot tween(s) start visible without immediateRender: false (they would show from frame 0):\n  ${bad.slice(0, 5).join("\n  ")}`);
}

// ── 6. chapter bar: brand + current chapter + progress segments ──
const chapters = (C.chapters ?? []).map((c) => ({ t: resolve(c.at, 0) - 0.3, name: c.name }));
const chapHtml = chapters.length ? `<div id="chap"><div class="brand"><i></i>${esc(C.brand ?? "")}</div><div class="cname">${chapters.map((c, i) => `<span id="cn${i}">${esc(c.name)}</span>`).join("")}</div>
<div class="segs">${chapters.map((_, i) => `<b id="cs${i}"></b>`).join("")}</div></div>` : "";

// ── 7. captions: the script's words with the voice's time, in short phrases; the spoken word turns gold ──
const disp = Object.entries(C.display ?? {}).map(([k, v]) => [k.split(/\s+/).map(norm), v]);
const capWords = [];
for (let i = 0; i < W.length; ) {
  const hit = disp.find(([ks]) => ks.every((k, j) => W[i + j] && W[i + j].line === W[i].line && norm(W[i + j].text) === k));
  if (hit) {
    const n = hit[0].length, last = W[i + n - 1], tail = last.text.match(/[।,:;?!]+$/)?.[0] ?? "";
    capWords.push({ text: hit[1] + tail, s: W[i].s, e: last.e, line: W[i].line }); i += n;
  } else { capWords.push({ text: W[i].text, s: W[i].s, e: W[i].e, line: W[i].line }); i++; }
}
const phrases = [];
{
  let cur = [];
  const flush = () => { if (cur.length) phrases.push(cur); cur = []; };
  capWords.forEach((w, i) => {
    if (cur.length && cur[0].line !== w.line) flush();
    cur.push(w);
    const len = cur.map((x) => x.text).join(" ").length, next = capWords[i + 1];
    let stop = /[।?!:]$/.test(w.text) || (/,$/.test(w.text) && cur.length >= 3) || len >= 38 || (next && len + next.text.length > 46);
    // never leave one word alone on the next phrase: when the line (or its sentence) ends with the next word, keep it here
    if (stop && !/[।?!]$/.test(w.text) && next && next.line === w.line && /[।?!:]$/.test(next.text) && len + next.text.length <= 54) stop = false;
    if (stop) flush();
  });
  flush();
}
const P = phrases.map((ws, k) => {
  const nxt = phrases[k + 1];
  let s = ws[0].s - 0.08, e = ws.at(-1).e + 0.3;
  if (nxt && nxt[0].s - 0.08 - e < 0.6) e = nxt[0].s - 0.08;
  if (nxt) e = Math.min(e, nxt[0].s - 0.08);
  return { s: +s.toFixed(3), e: +e.toFixed(3), w: ws.map((x) => +x.s.toFixed(3)), text: ws.map((x) => x.text) };
});
const capHtml = P.map((p, k) => `<div class="cp" id="cp${k}">${p.text.map((t) => `<span>${esc(t)}</span>`).join(" ")}</div>`).join("\n");

// ── 8. the page ──
const fonts = [["Inter", "100 900", "Inter-Variable.ttf"], ["Hind Siliguri", "500", "HindSiliguri-Medium.ttf"], ["Hind Siliguri", "600", "HindSiliguri-SemiBold.ttf"],
  ["Hind Siliguri", "700", "HindSiliguri-Bold.ttf"], ["Baloo Da 2", "400 800", "BalooDa2-Variable.ttf"], ["JetBrains Mono", "100 800", "JetBrainsMono-Variable.ttf"]];
for (const [, , f] of fonts) if (!fs.existsSync(path.join(proj, "assets", "fonts", f))) fail(`font assets/fonts/${f} missing (copy it from assets/fonts/)`);
const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(C.title)}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>
${fonts.map(([fam, w, f]) => `@font-face { font-family: "${fam}"; font-weight: ${w}; src: url("assets/fonts/${f}") format("truetype"); font-display: block; }`).join("\n")}
:root { --bg: #0E0C0A; --panel: #1A1714; --panel2: #221E1A; --edge: rgba(255,236,214,0.09); --text: #F3EDE4; --muted: #A89F94; --coral: #E07A55; --gold: #F2B84B; --green: #5BC48A; --red: #E5604F; }
body { margin: 0; background: var(--bg); }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: "Hind Siliguri", sans-serif; color: var(--text);
  background: radial-gradient(1400px 900px at 50% 40%, #1C1712 0%, #120F0C 55%, #0B0908 100%); }
#grid { position: absolute; inset: 0; opacity: 0.5; background-image: radial-gradient(rgba(255,230,200,0.07) 1.5px, transparent 1.6px); background-size: 40px 40px; }
#glow { position: absolute; left: 360px; top: 140px; width: 1200px; height: 800px; border-radius: 50%; background: radial-gradient(closest-side, rgba(224,122,85,0.13), transparent); }
#chap { position: absolute; left: 60px; right: 60px; top: 30px; height: 56px; display: flex; align-items: center; gap: 22px; }
#chap .brand { display: flex; align-items: center; gap: 12px; font: 700 26px/1 "Inter", sans-serif; color: var(--text); }
#chap .brand i { width: 16px; height: 16px; border-radius: 5px; background: var(--coral); display: block; }
#chap .cname { position: relative; height: 40px; min-width: 520px; }
#chap .cname span { position: absolute; left: 0; top: 0; white-space: nowrap; font: 600 28px/40px "Hind Siliguri", sans-serif; color: var(--muted); opacity: 0; }
#chap .segs { margin-left: auto; display: flex; gap: 8px; }
#chap .segs b { width: 46px; height: 8px; border-radius: 4px; background: #2E2823; display: block; }
#cap { position: absolute; left: 0; right: 0; bottom: 40px; height: 96px; display: flex; justify-content: center; align-items: center; }
.cp { position: absolute; max-width: 1560px; padding: 14px 34px 18px; border-radius: 20px; background: rgba(14,12,10,0.88); box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,236,214,0.08);
  font: 700 44px/1.4 "Hind Siliguri", sans-serif; color: #F3EDE4; white-space: nowrap; display: none; text-wrap: balance; }
.cp span.on { color: var(--gold); }
${SCENE_CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${f3(TOTAL)}">
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(TOTAL)}" data-track-index="5" data-volume="1"></audio>
      <div id="grid"></div><div id="glow"></div>
${sceneHtml.join("\n")}
      ${chapHtml}
      ${has("no-captions") ? "" : `<div id="cap">
${capHtml}
      </div>`}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      // captions + chapter bar: one clock, state is a pure function of time (seek-safe)
      const P = ${JSON.stringify(P.map((p) => [p.s, p.e, p.w]))};
      const CH = ${JSON.stringify(chapters.map((c) => +c.t.toFixed(3)))};
      const cps = P.map((_, k) => document.getElementById("cp" + k)).filter(Boolean);
      if (!cps.length) P.length = 0;
      let curP = -2, curW = -2, curC = -2;
      function place(t) {
        let k = -1;
        for (let i = 0; i < P.length; i++) { if (t >= P[i][0] && t < P[i][1]) { k = i; break; } }
        if (k !== curP) { if (curP >= 0) cps[curP].style.display = "none"; if (k >= 0) cps[k].style.display = "block"; curP = k; curW = -2; }
        if (k >= 0) {
          let j = -1; const ws = P[k][2];
          for (let i = 0; i < ws.length; i++) if (t >= ws[i] - 0.03) j = i;
          if (j !== curW) { const sp = cps[k].children; for (let i = 0; i < sp.length; i++) sp[i].className = i === j ? "on" : ""; curW = j; }
        }
        let c = -1;
        for (let i = 0; i < CH.length; i++) if (t >= CH[i]) c = i;
        if (c !== curC) {
          for (let i = 0; i < CH.length; i++) {
            const n = document.getElementById("cn" + i), s = document.getElementById("cs" + i);
            if (n) n.style.opacity = i === c ? 1 : 0;
            if (s) s.style.background = i < c ? "#7A4632" : i === c ? "#E07A55" : "#2E2823";
          }
          curC = c;
        }
      }
      const clock = { t: 0 };
      tl.to(clock, { t: ${f3(TOTAL)}, duration: ${f3(TOTAL)}, ease: "none", onUpdate: () => place(clock.t) }, 0);
      place(0);
      tl.fromTo("#glow", { opacity: 0.6, scale: 0.92, x: -60 }, { opacity: 1, scale: 1.05, x: 60, duration: ${f3(TOTAL)}, ease: "sine.inOut" }, 0);
      tl.fromTo("#chap", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, ${f3(chapters[0]?.t ?? 0)});
${tweens.map((t) => "      " + t).join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(proj, "index.html"), html);
console.log(`• index.html: ${C.scenes.length} scenes, ${tweens.length} tweens, ${P.length} caption phrases, ${cues.length} sounds`);

// ── 9. soundtrack ──
const media = path.join(proj, "assets", "media");
const editVoice = path.join(media, "voice", "voice-edit.wav");
if (!has("no-mix") && !has("estimate")) {
  // the voice with the holds: each line's stretch of the file, then its hold of silence
  const parts = [], inputs = ["-i", voiceFile];
  segs.forEach((s, k) => {
    const pad = (holds[s.li + 1] ?? 0) + (k === 0 ? 0 : 0);
    parts.push(`[0:a]atrim=${f3(s.v0)}:${f3(s.v1)},asetpts=PTS-STARTPTS${pad > 0 ? `,apad=pad_dur=${f3(pad)}` : ""}[g${k}]`);
  });
  const graph = `${parts.join(";")};${segs.map((_, k) => `[g${k}]`).join("")}concat=n=${segs.length}:v=0:a=1,adelay=${Math.round(LEAD * 1000)}:all=1[v]`;
  const gfile = path.join(proj, "build", "voice-edit.graph.txt");
  fs.writeFileSync(gfile, graph);
  const r = spawnSync(FF, ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-/filter_complex", gfile, "-map", "[v]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", editVoice]);
  if (r.status !== 0) fail(`voice edit failed: ${r.stderr}`);
  // music: measured loudness → gains for under-voice and between-lines
  const musicFile = C.music?.file ? path.join(proj, C.music.file) : null;
  const music = [];
  if (musicFile && fs.existsSync(musicFile)) {
    const lufsCache = path.join(proj, "build", "music-lufs.json");
    let lufs;
    const st = fs.statSync(musicFile).mtimeMs;
    const cached = fs.existsSync(lufsCache) && JSON.parse(fs.readFileSync(lufsCache, "utf8"));
    if (cached && cached.file === C.music.file && cached.mtime === st) lufs = cached.lufs;
    else {
      const m = spawnSync(FF, ["-hide_banner", "-nostats", "-i", musicFile, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
      lufs = +(m.stderr.match(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/) ?? m.stderr.match(/I:\s+(-?[\d.]+) LUFS/g)?.at(-1)?.match(/-?[\d.]+/) ?? [0, -14])[1];
      fs.writeFileSync(lufsCache, JSON.stringify({ file: C.music.file, mtime: st, lufs }));
    }
    const under = (C.music.lufsUnder ?? -35) - lufs, gap = (C.music.lufsGap ?? -30) - lufs;
    const iv = [];
    for (const w of W) { const l = iv.at(-1); if (l && w.s - l[1] < 0.7) l[1] = w.e; else iv.push([w.s, w.e]); }
    const lvl = (t) => (iv.some(([a, b]) => t >= a - 0.1 && t < b + 0.2) ? under : gap);
    const env = [[0, null], [0.4, gap]];
    let prev = gap;
    for (let t = 0.42; t < TOTAL - 3; t += 0.02) {
      const v = lvl(t);
      if (v === prev) continue;
      const a = +(t - 0.25).toFixed(3);
      if (a > env.at(-1)[0]) env.push([a, prev]);
      env.push([+t.toFixed(3), v]);
      prev = v;
    }
    env.push([+(TOTAL - 3).toFixed(3), gap], [+TOTAL.toFixed(3), null]);
    music.push({ file: musicFile.replace(/\\/g, "/"), at: 0, from: C.music.from ?? 0, env });
    console.log(`• music ${lufs.toFixed(1)} LUFS → ${under.toFixed(1)} dB under speech, ${gap.toFixed(1)} dB between lines`);
  }
  buildMix({ total: TOTAL, out: path.join(media, "mix.wav"), voice: { file: editVoice.replace(/\\/g, "/"), eq: true }, music, cues: cues.filter((c) => c.t < TOTAL - 0.05), graphFile: path.join(proj, "build", "mix.graph.txt") });
  // the music alone on the same timeline: Reels cut from this video (tools/cutdown "bed") lay it under their pieces
  if (music.length) buildMix({ total: TOTAL, out: path.join(media, "bed.wav"), music, graphFile: path.join(proj, "build", "bed.graph.txt") });
  console.log(`• mix.wav${music.length ? " + bed.wav" : ""} written`);
}

// ── 10. records: timeline.json, captions.json, PLAN.md ──
fs.writeFileSync(path.join(proj, "build", "timeline.json"), JSON.stringify({ style: "EXP1", total: TOTAL, matched: +V.matched.toFixed(3), lines: L.map((l, i) => ({ n: i + 1, a: +l.a.toFixed(3), b: +l.b.toFixed(3), text: lines[i] })), scenes: C.scenes.map((s, i) => ({ id: s.id, type: s.type, start: +starts[i].toFixed(3) })), cues }, null, 1));
fs.writeFileSync(path.join(proj, "build", "captions.json"), JSON.stringify(P.map((p) => ({ s: p.s, e: p.e, text: p.text.join(" ") })), null, 1));
// every spoken word in VIDEO seconds with the caption spelling: the .srt (tools/release/srt-export.mjs) and the Reels'
// captions (tools/cutdown captions.json "extra") read this instead of a new speech-to-text run
fs.writeFileSync(path.join(proj, "build", "master.words.json"), JSON.stringify({ total: TOTAL, words: capWords.map((w) => ({ text: w.text, start: +w.s.toFixed(3), end: +w.e.toFixed(3) })) }, null, 1));

const clk = (t) => bn(`${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`);
const sec = (t) => (t < 60 ? t.toFixed(1) : `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`);
if (C.plan) {
  const p = C.plan;
  // shot rows: scene starts + described beats, sorted; each runs to the next; sounds and voice lines inside it
  const rows = shotRows.filter((r) => r.desc).sort((a, b) => a.t - b.t);
  rows[0].t = 0;
  const table = rows.map((r, k) => {
    const t0 = r.t, t1 = k + 1 < rows.length ? rows[k + 1].t : TOTAL;
    const snd = {};
    for (const c of cues) if (c.t >= t0 - 0.001 && c.t < t1 - 0.001) snd[c.file] = (snd[c.file] ?? 0) + 1;
    const voice = L.map((l, i) => (l.a >= t0 - 0.001 && l.a < t1 - 0.001 ? `ভয়েস ${bn(i + 1)}` : null)).filter(Boolean);
    const sounds = [...Object.entries(snd).map(([f, n]) => `\`${f}\`${n > 1 ? ` ×${bn(n)}` : ""}`), ...voice].join(" ") || (L.some((l) => l.a < t1 && l.b > t0) ? "ভয়েস চলছে" : "মিউজিক");
    return `| ${sec(t0)}–${sec(t1)} | ${r.desc.replace(/\|/g, "\\|")} | ${(r.text ?? "—").replace(/\|/g, "\\|")} | ${sounds} |`;
  });
  const plan = `# প্ল্যান: ${C.title}

ফরম্যাট: ${p.format ?? "16:9"}
দৈর্ঘ্য: ${TOTAL.toFixed(1)} সেকেন্ড
প্ল্যাটফর্ম: ${p.platform}
ধরন: ${p.kind}
ভয়েস: ${p.voice}
মিউজিক: ${p.music}
আউটপুট: ${p.output}
পুরো ভিডিও জুড়ে: ${p.whole}

## লক্ষ্য

${p.goal}

## হুক (প্রথম ২ সেকেন্ড)

${p.hook}

## স্ক্রিপ্ট

${lines.map((l, i) => `${bn(i + 1)}. (${clk(L[i].a)}) ${l}`).join("\n")}

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${table.join("\n")}

## যা লাগবে

${p.needs.map((x) => `- ${x}`).join("\n")}

## STYLE.md আর LESSONS.md থেকে যা মানছি

${p.style.map((x) => `- ${x}`).join("\n")}

## আপনার কাছে প্রশ্ন

${(p.questions ?? []).map((x) => `- ${x}`).join("\n") || "- নেই"}
`;
  fs.writeFileSync(path.join(proj, "PLAN.md"), plan);
  console.log(`• PLAN.md: ${rows.length} shot rows`);
}
console.log(`✓ built ${path.relative(process.cwd(), proj)} — ${clk(TOTAL)}`);
