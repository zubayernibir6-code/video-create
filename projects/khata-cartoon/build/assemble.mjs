#!/usr/bin/env node
// assemble.mjs — build index.html (and assets/story/plan.js) from story/plan.json, story/voice.json, story/lines.json:
//   node build/assemble.mjs                 → index.html (the whole film)
//   node build/assemble.mjs --only=s3       → previews/preview-s3.html: that scene alone from 0 s, with its voice, sfx and
//                                             captions (render it with: hyperframes render -c previews/preview-s3.html …)
// - scenes as sub-compositions, back to back, with a cartoon "dot wipe" between them (transform only, capture-safe)
// - one <audio> per voice line at scene start + its line time; SFX at their HEARD time minus the file's lead_s
//   (assets/sfx/manifest.json); "every" rows repeat a sound; ambience beds pre-looped to length with fades
// - Bengali captions with a speaker chip, chunked at sentence ends and timed by length across the speech
// - plan.js gives each scene its own line times and beats: HKPlan.scene("s3").line("s3-02"), .beat("erase")
// Checks: lines inside their scene, no two lines of a scene overlapping, every referenced beat defined.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const read = (p) => JSON.parse(readFileSync(path.join(ROOT, p), "utf8"));
const plan = read("story/plan.json"), voice = read("story/voice.json"), lines = read("story/lines.json");
const sfxManifest = read("assets/sfx/manifest.json");
const LEAD_VOICE = 0.25, TAIL_VOICE = 0.4;
const lead = {}; const fdur = {};
for (const e of Object.values(sfxManifest)) if (e && e.file) { lead[e.file] = e.lead_s ?? 0; fdur[e.file] = e.duration; }
const who = Object.fromEntries(lines.lines.map((l) => [l.id, l.who]));
const problems = [];
const r3 = (x) => Math.round(x * 1000) / 1000;
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);

// ── times ────────────────────────────────────────────────────────────────────────────────────────
let start = 0;
const allScenes = plan.scenes.map((s) => { const o = { ...s, start }; start += s.dur; return o; });
if (ONLY && !allScenes.some((s) => s.id === ONLY)) { console.error(`✗ no scene ${ONLY}`); process.exit(1); }
const scenes = ONLY ? allScenes.filter((s) => s.id === ONLY).map((s) => ({ ...s, start: 0 })) : allScenes;
const TOTAL = ONLY ? scenes[0].dur : start;
function beatTime(s, ref) {
  if (typeof ref === "number") return ref;
  const m = String(ref).match(/^([a-zA-Z][\w]*)?([+-][\d.]+)?$|^([\d.]+)$/);
  if (!m) { problems.push(`${s.id}: bad time "${ref}"`); return 0; }
  if (m[3]) return Number(m[3]);
  const base = s.beats[m[1]];
  if (base === undefined) { problems.push(`${s.id}: unknown beat "${m[1]}"`); return 0; }
  return base + Number(m[2] || 0);
}

// ── audio: voice, sfx, ambience ──────────────────────────────────────────────────────────────────
const voiceCues = [], sfxCues = [], ambCues = [], caps = [];
mkdirSync(path.join(ROOT, "assets", "amb"), { recursive: true });
for (const s of scenes) {
  const ids = Object.keys(s.lines).sort((a, b) => s.lines[a] - s.lines[b]);
  ids.forEach((id, i) => {
    const v = voice[id];
    if (!v) { problems.push(`${s.id}: no voice for ${id} (run build/voice.mjs)`); return; }
    const t = s.lines[id];
    if (t + v.d > s.dur + 0.01) problems.push(`${s.id}: ${id} ends at ${(t + v.d).toFixed(2)} s, after the scene (${s.dur} s)`);
    const next = ids[i + 1];
    if (next && t + v.d - TAIL_VOICE > s.lines[next] + LEAD_VOICE) problems.push(`${s.id}: ${id} still speaking when ${next} starts`);
    voiceCues.push({ id: `v-${id}`, src: `assets/voice/${id}.wav`, at: s.start + t, dur: v.d, vol: 1 });
    // captions: sentence chunks, timed by length across the spoken part
    const text = v.text.replace(/\s+/g, " ").trim();
    let chunks = text.split(/(?<=[।?!])\s+/).filter(Boolean);
    chunks = chunks.flatMap((c) => (c.length > 38 ? c.split(/(?<=,)\s+/) : [c]));
    const speechA = s.start + t + LEAD_VOICE, speechB = s.start + t + v.d - TAIL_VOICE;
    const total = chunks.reduce((a, c) => a + c.length, 0);
    let a = speechA;
    chunks.forEach((c, k) => {
      const b = k === chunks.length - 1 ? speechB + 0.25 : a + ((speechB - speechA) * c.length) / total;
      caps.push({ at: a - 0.05, dur: b - a + 0.05, text: c, who: who[id], bottom: (s.capBottom || {})[id] });
      a = b;
    });
  });
  for (const row of s.sfx || []) {
    const [ref, file, vol, d] = row;
    if (!existsSync(path.join(ROOT, "assets", "sfx", file))) { problems.push(`${s.id}: missing sfx ${file}`); continue; }
    const hit = beatTime(s, ref);
    sfxCues.push({ src: `assets/sfx/${file}`, at: Math.max(0, s.start + hit - (lead[file] ?? 0)), dur: d ?? fdur[file] ?? 1, vol });
  }
  for (const [file, vol, from, to, step] of s.every || []) {
    for (let t = from; t <= to + 1e-6; t += step) sfxCues.push({ src: `assets/sfx/${file}`, at: Math.max(0, s.start + t - (lead[file] ?? 0)), dur: fdur[file] ?? 0.2, vol });
  }
  (s.amb || []).forEach(([file, vol, from, to], k) => {
    const out = `assets/amb/${s.id}-${k}.wav`, len = to - from;
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-stream_loop", "-1", "-i", path.join(ROOT, "assets", "sfx", file), "-t", String(len),
      "-af", `afade=t=in:d=0.6,afade=t=out:st=${Math.max(0, len - 0.8)}:d=0.8`, "-ac", "1", "-ar", "48000", path.join(ROOT, out)], { encoding: "utf8" });
    if (r.status !== 0) problems.push(`${s.id}: ambience ${file}: ${r.stderr}`);
    ambCues.push({ src: out, at: s.start + from, dur: len, vol });
  });
}
if (problems.length) { console.error("✗ plan problems:\n  " + problems.join("\n  ")); process.exit(1); }

// pack overlapping cues onto lanes (lint: no overlapping clips on one data-track-index)
function pack(cues, base) {
  const ends = [];
  cues.sort((a, b) => a.at - b.at);
  for (const c of cues) {
    let k = ends.findIndex((e) => e <= c.at - 0.001);
    if (k < 0) { k = ends.length; ends.push(0); }
    ends[k] = c.at + c.dur;
    c.track = base + k;
  }
  return ends.length;
}
// every dot wipe gets a sound (CLAUDE.md §0d rule 7): a short whoosh centred on each cut, and one as the closing dot grows
for (const sc of scenes.slice(1)) sfxCues.push({ src: "assets/sfx/whoosh-short.mp3", at: sc.start - 0.3 - (lead["whoosh-short.mp3"] ?? 0), dur: fdur["whoosh-short.mp3"] ?? 0.5, vol: 0.32 });
sfxCues.push({ src: "assets/sfx/whoosh.mp3", at: TOTAL - 0.62 - (lead["whoosh.mp3"] ?? 0), dur: fdur["whoosh.mp3"] ?? 0.6, vol: 0.3 });
const nv = pack(voiceCues, 30), ns = pack(sfxCues, 10), na = pack(ambCues, 5);
sfxCues.forEach((c, i) => (c.id = `fx-${String(i + 1).padStart(3, "0")}`));
ambCues.forEach((c, i) => (c.id = `amb-${i + 1}`));

// ── plan.js for the scene scripts ────────────────────────────────────────────────────────────────
const planJs = { total: start, scenes: Object.fromEntries(allScenes.map((s) => [s.id, { start: s.start, dur: s.dur, lines: s.lines, beats: s.beats }])) };
mkdirSync(path.join(ROOT, "assets", "story"), { recursive: true });
writeFileSync(path.join(ROOT, "assets", "story", "plan.js"),
  "/* generated by build/assemble.mjs from story/plan.json — do not edit */\nwindow.HKPlan = " + JSON.stringify(planJs) + ";\n" +
  "window.HKPlan.scene = function (id) { var s = window.HKPlan.scenes[id]; return { dur: s.dur, line: function (l) { if (!(l in s.lines)) throw new Error(id + ': no line ' + l); return s.lines[l]; }, beat: function (b) { if (!(b in s.beats)) throw new Error(id + ': no beat ' + b); return s.beats[b]; } }; };\n");

// ── index.html ───────────────────────────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const audio = (c) => `<audio id="${c.id}" src="${c.src}" data-start="${r3(c.at)}" data-duration="${r3(c.dur)}" data-track-index="${c.track}" data-volume="${c.vol}"></audio>`;
const sp = plan.speakers;
const capHtml = caps.map((c, i) => `<div id="cap-${i + 1}" class="clip cap" data-start="${r3(c.at)}" data-duration="${r3(c.dur)}" data-track-index="${40 + (i % 2)}"${c.bottom ? ` style="bottom:${c.bottom}px"` : ""}><span class="who" style="background:${sp[c.who].color}">${sp[c.who].name}</span><span class="txt">${esc(c.text)}</span></div>`);
const cuts = scenes.slice(1).map((s) => r3(s.start));

const html = `<!doctype html>
<html lang="bn" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <!-- generated by build/assemble.mjs from story/*.json — edit the plan, not this file -->
    <script src="assets/js/gsap/gsap.min.js"></script>
    <script src="assets/cast/cast.js"></script>
    <script src="assets/cast/act.js"></script>
    <script src="assets/cast/sets.js"></script>
    <script src="assets/voice/lipsync.js"></script>
    <script src="assets/story/plan.js"></script>
    <style>
      @font-face { font-family: "Baloo Da 2"; font-style: normal; font-weight: 400 800; src: url("assets/fonts/bengali/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 500; src: url("assets/fonts/bengali/HindSiliguri-Medium.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 600; src: url("assets/fonts/bengali/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 700; src: url("assets/fonts/bengali/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #1B1410; }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #1B1410; }
      .scene { position: absolute; inset: 0; width: 100%; height: 100%; }
      /* captions: above the platform buttons/description zone (bottom ~420 px, right ~110 px) */
      .cap { position: absolute; left: 110px; right: 110px; bottom: 420px; display: flex; flex-direction: column; align-items: center; z-index: 50; }
      .cap .who { font-family: "Hind Siliguri", sans-serif; font-weight: 600; font-size: 30px; line-height: 1.2; color: #FFFFFF; padding: 5px 20px 3px; border-radius: 22px; margin-bottom: 10px; }
      .cap .txt { font-family: "Hind Siliguri", sans-serif; font-weight: 700; font-size: 50px; line-height: 1.32; color: #FFFFFF; background: rgba(20, 14, 10, 0.84); padding: 14px 30px 10px; border-radius: 24px; text-align: center; max-width: 860px; text-wrap: balance; }
      .wipe { position: absolute; left: -660px; top: -240px; width: 2400px; height: 2400px; border-radius: 50%; background: #1B1410; z-index: 60; transform: scale(0); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
${scenes.map((s, i) => `      <div id="el-${s.id}" class="scene" data-composition-id="${path.basename(s.file, ".html")}" data-composition-src="${s.file}" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${i % 2}"></div>`).join("\n")}

      <!-- captions (${caps.length}) -->
${capHtml.map((c) => "      " + c).join("\n")}

      <div id="wipe" class="wipe"></div>

      <!-- voice (${voiceCues.length} lines, Piper bn_BD — credit line in assets/voices/piper/CREDITS.md) -->
${voiceCues.map((c) => "      " + audio(c)).join("\n")}
      <!-- sound effects (${sfxCues.length}; assets/sfx/CREDITS.md) -->
${sfxCues.map((c) => "      " + audio(c)).join("\n")}
      <!-- ambience beds -->
${ambCues.map((c) => "      " + audio(c)).join("\n")}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      (function () {
        var tl = gsap.timeline({ paused: true });
        var wipe = document.getElementById("wipe");
        // open on a dot that grows away, close the same way at the very end
        tl.fromTo(wipe, { scale: 1 }, { scale: 0, duration: 0.55, ease: "power2.out" }, 0);
        [${cuts.join(", ")}].forEach(function (t) {
          tl.to(wipe, { scale: 1, duration: 0.42, ease: "power2.in" }, t - 0.42);
          tl.to(wipe, { scale: 0, duration: 0.5, ease: "power2.out" }, t);
        });
        tl.to(wipe, { scale: 1, duration: 0.6, ease: "power2.in" }, ${TOTAL} - 0.6);
        tl.to({}, { duration: ${TOTAL} }, 0);
        window.__timelines["main"] = tl;
      })();
    </script>
  </body>
</html>
`;
const outFile = ONLY ? `previews/preview-${ONLY}.html` : "index.html";
if (ONLY) mkdirSync(path.join(ROOT, "previews"), { recursive: true });
writeFileSync(path.join(ROOT, outFile), html);
if (!ONLY) rmSync(path.join(ROOT, ".hf-audio-cues.json"), { force: true });   // generated file; no stale cue restores
console.log(`assemble → ${outFile}: ${scenes.length} scenes, ${TOTAL} s · ${voiceCues.length} voice lines (${nv} lanes) · ${sfxCues.length} sfx (${ns} lanes) · ${ambCues.length} beds · ${caps.length} captions`);
