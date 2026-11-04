// build.mjs — a client promo from DATA (style CP1, first client: Mohona Agro Food). The model writes
// projects/<name>/promo.json (script, clips' baked text, shots with the word each cut lands on, texts, sounds;
// see projects/mohona-promo-01/promo.json); this makes everything else:
//   1. word times: tools/autocap/voice-times.mjs (Bengali ASR + script alignment), then every word START is snapped to
//      the audio itself (the fine-tuned model has no timestamp tokens: the first word after a pause came 0.6 s early),
//   2. the cut list on the 24-fps frame grid: a shot with "at" starts on that word (a transition's MIDDLE sits on
//      it), the shot before it is trimmed, slowed (speed > 1) or held to meet it exactly,
//   3. every shot pre-cut by FFmpeg to an exact frame count (trim, speed, crop off baked text, Lanczos 1080p, grade),
//   4. the soundtrack (tools/promo/mix.py, sample-exact): voice at voice.at, ducked music beds, every sound on its frame,
//   5. index.html for 16:9 (this project) and 9:16 (projects/<name>-9x16: the 16:9 picture in a window over its
//      blurred copy, texts below it inside the Reels safe zone), both from ONE timeline,
//   6. build/timeline.json (every resolved time) and PLAN.md (shot table from the data).
//
//   node tools/promo/build.mjs projects/<name> [--check] [--no-shots] [--no-mix]
//     --check      words + cut list + layout only, print them (nothing rendered or cut)
// Then: node tools/finish.mjs projects/<name> --formats= ; node tools/finish.mjs projects/<name>-9x16 --formats=
// (see .claude/skills — CP1 notes in CLOUD.md / docs). Verified 2026-11-04 on projects/mohona-promo-01 (cloud).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { voiceTimes } from "../autocap/voice-times.mjs";
import { norm } from "../reel/align.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const argv = process.argv.slice(2);
const proj = path.resolve(argv.find((a) => !a.startsWith("--")) ?? "");
const CHECK = argv.includes("--check"), NOSHOTS = argv.includes("--no-shots"), NOMIX = argv.includes("--no-mix");
if (!fs.existsSync(path.join(proj, "promo.json"))) { console.error("usage: node tools/promo/build.mjs projects/<name> [--check]"); process.exit(1); }
const P = JSON.parse(fs.readFileSync(path.join(proj, "promo.json"), "utf8"));
const NAME = path.basename(proj);
const FPS = P.fps ?? 24;
const MEDIA = fs.realpathSync(path.join(proj, "assets", "media"));
const PY = path.join(WS, "tools", "pyenv", "Scripts", "python.exe");
const F = (s) => Math.round(s * FPS + 1e-6), T = (f) => f / FPS, f3 = (x) => (+x).toFixed(3), f2 = (x) => (+x).toFixed(2);
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const warns = [];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- 1. words -----------------------------------------------------------------------------------------------------
const voiceFile = path.join(MEDIA, P.voice.file);
const AT = P.voice.at ?? 0.3;
const vt = voiceTimes(voiceFile, P.script, [], { minMatch: P.minMatch ?? 0.85 });
// loudness every 10 ms of the voice (dB), smoothed over 30 ms
const raw = spawnSync("ffmpeg", ["-v", "error", "-i", voiceFile, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 }).stdout;
const pcm = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4));
const db0 = [];
for (let i = 0; i + 160 <= pcm.length; i += 160) { let e = 0; for (let k = i; k < i + 160; k++) e += pcm[k] * pcm[k]; db0.push(10 * Math.log10(e / 160 + 1e-12)); }
const db = db0.map((_, i) => (db0[Math.max(0, i - 1)] + db0[i] + db0[Math.min(db0.length - 1, i + 1)]) / 3);
const sorted = [...db].sort((a, b) => a - b), p90 = sorted[Math.floor(sorted.length * 0.9)];
const LOUD = p90 - 18, MID = p90 - 24, QUIET = p90 - 30;
const onsets = [], dips = [];
for (let i = 8; i < db.length; i++) {
  if (db[i] >= LOUD && db[i - 1] < LOUD && Math.min(...db.slice(i - 8, i)) < LOUD - 6) { let j = i; while (j > 0 && db[j - 1] >= QUIET && i - j < 12) j--; onsets.push(j / 100); }
}
for (let i = 6; i < db.length - 6; i++) {
  const w = db.slice(i - 6, i + 7);
  if (db[i] !== Math.min(...w)) continue;
  const l = Math.max(...db.slice(Math.max(0, i - 15), i)), r = Math.max(...db.slice(i + 1, i + 16));
  if (Math.min(l, r) - db[i] >= 6) dips.push(i / 100);
}
// first speech after a pause: where the level passes MID and reaches LOUD within 0.4 s (breath noise never does)
const speechStart = (from) => {
  for (let i = Math.max(0, Math.round(from * 100)); i < db.length; i++) {
    if (db[i] >= MID && db.slice(i, i + 40).some((d) => d >= LOUD)) { let j = i; while (j > 0 && db[j - 1] >= QUIET && i - j < 8) j--; return j / 100; }
  }
  return null;
};
const words = vt.words.map((w, i) => {
  let s = w.start;
  const prevEnd = i ? vt.words[i - 1].end : 0, lineStart = !i || vt.words[i - 1].line !== w.line;
  let how = "asr";
  if (lineStart) {
    const st = speechStart(Math.max(0, s - 0.2));
    if (st != null && st - s < 0.8) { s = st; how = "speech start"; }
  } else {
    const c = [...onsets, ...dips].filter((t) => Math.abs(t - s) <= 0.15).sort((a, b) => Math.abs(a - s) - Math.abs(b - s));
    if (c.length) { s = c[0]; how = onsets.includes(c[0]) ? "onset" : "dip"; }
  }
  return { text: w.text, n: norm(w.text), t: +(AT + s).toFixed(3), asr: +(AT + w.start).toFixed(3), end: +(AT + w.end).toFixed(3), line: w.line, how, guessed: !!w.guessed, prevEnd };
});
const lines = vt.lines.map((l, i) => ({ a: +(AT + Math.min(l.a, words.find((w) => w.line === i).t - AT)).toFixed(3), b: +(AT + l.b).toFixed(3) }));
lines.forEach((l, i) => { l.a = words.find((w) => w.line === i).t; });
const lastWordEnd = lines.at(-1).b;

// word refs: "আটা", "মানসম্মত#3", "আটা-0.15", 6.2, "end", "shot:s3a", "shot:s2a:in"
let SHOT = null, TOTAL = null;
function ref(r, what = "") {
  if (typeof r === "number") return r;
  const s = String(r).trim();
  if (s === "end") { if (TOTAL == null) die(`"end" used before the length is known (${what})`); return TOTAL; }
  const m = s.match(/^(.*?)(?:#(\d+))?([+-]\d*\.?\d+)?$/u);
  const off = m[3] ? +m[3] : 0;
  if (m[1].startsWith("shot:")) {
    const [, id, edge] = m[1].split(":");
    const sh = SHOT?.find((x) => x.id === id);
    if (!sh) die(`unknown shot "${id}" in ${what}`);
    return T(edge === "in" ? sh.f0 + sh.dIn : sh.f0) + off;
  }
  const k = norm(m[1]), nth = +(m[2] ?? 1);
  let hits = words.filter((w) => w.n === k);
  if (hits.length < nth) hits = words.filter((w) => w.n.startsWith(k));
  if (hits.length < nth) die(`the word "${m[1]}"${m[2] ? ` #${nth}` : ""} is not in the script (${what})`);
  if (hits[nth - 1].guessed) warns.push(`"${m[1]}" (${what}) was not clearly heard: its time is a guess`);
  return hits[nth - 1].t + off;
}

// ---- 2. cut list on the frame grid --------------------------------------------------------------------------------
const clipDur = {};
for (const c of new Set(P.shots.map((s) => s.clip))) {
  const f = path.join(MEDIA, c);
  if (!fs.existsSync(f)) die(`clip ${c} is missing from assets/media`);
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries", "stream=nb_read_packets,width,height,r_frame_rate", "-of", "json", f], { encoding: "utf8" });
  const st = JSON.parse(r.stdout).streams[0];
  clipDur[c] = { frames: +st.nb_read_packets, w: st.width, h: st.height, fps: eval(st.r_frame_rate) };
  if (Math.abs(clipDur[c].fps - FPS) > 0.01) warns.push(`${c} is ${clipDur[c].fps} fps, the video is ${FPS}: its motion is re-timed`);
}
const shots = P.shots.map((s) => ({ ...s, speed: s.speed ?? 1, hold: s.hold ?? 0 }));
shots.forEach((s, k) => {
  s.tin = k ? shots[k - 1].to?.type ?? "cut" : "none";
  s.dIn = k ? F(shots[k - 1].to?.d ?? 0) : 0;
  s.motionNat = F((s.out - s.in) / s.speed);
  s.natural = s.motionNat + F(s.hold);
});
shots[0].f0 = 0;
for (let k = 1; k < shots.length; k++) {
  const s = shots[k], p = shots[k - 1];
  s.f0 = s.at != null ? F(ref(s.at, `shot ${s.id}`)) - Math.floor(s.dIn / 2) : p.f0 + p.natural - s.dIn;
  p.len = s.f0 + s.dIn - p.f0;
}
shots.at(-1).len = shots.at(-1).natural;
SHOT = shots;
TOTAL = T(shots.at(-1).f0 + shots.at(-1).len);
for (const s of shots) {
  if (s.len < s.dIn + 6) die(`shot ${s.id} would be only ${s.len} frames long: its word comes too soon after the previous cut`);
  // fill the slot: trim the end, slow a sped-up shot (never below 90 % of its speed), else hold the last frame
  s.motion = Math.min(s.len, s.motionNat);
  if (s.len > s.natural && s.maxOut != null) {   // more of the clip is usable: play on instead of freezing
    s.motion = Math.min(s.len - F(s.hold), F((s.maxOut - s.in) / s.speed));
  } else if (s.len > s.natural && s.speed > 1) {
    const sp = ((s.out - s.in) * FPS) / (s.len - F(s.hold));
    if (sp >= s.speed * 0.9) { s.speed = +sp.toFixed(4); s.motion = s.len - F(s.hold); }
  }
  s.holdF = s.len - s.motion;
  s.srcFrames = Math.round(s.motion * s.speed);
  s.srcIn = F(s.in);
  if (s.srcIn + s.srcFrames > clipDur[s.clip].frames) die(`shot ${s.id} needs frames up to ${s.srcIn + s.srcFrames} of ${s.clip}, which has ${clipDur[s.clip].frames}`);
  const extra = s.holdF - F(s.hold);
  if (extra > 4 && !s.move && !(s.to && T(F(s.to.d)) >= T(extra))) warns.push(`shot ${s.id}: its last frame is held ${f2(T(extra))} s longer than planned with no zoom or transition hiding it`);
  s.t0 = T(s.f0); s.t1 = T(s.f0 + s.len); s.mid = T(s.f0 + Math.floor(s.dIn / 2));
}

// ---- texts, bug, sounds -------------------------------------------------------------------------------------------
const texts = P.texts.map((t, i) => {
  const at = ref(t.at, `text ${i + 1}`), out = ref(t.out, `text ${i + 1} out`);
  const items = (t.items ?? t.parts ?? (t.text ? [{ text: t.text, at: t.at }] : [])).map((it, j) => ({ ...it, t: ref(it.at, `text ${i + 1} item ${j + 1}`) }));
  if (out - at < 0.8) die(`text ${i + 1} ("${t.label ?? t.text ?? items[0]?.text}") is on screen only ${f2(out - at)} s`);
  for (const it of items) if (it.t > out - 0.4) die(`text ${i + 1}: "${it.text}" appears at ${f2(it.t)} s, after or right before the text leaves (${f2(out)} s)`);
  return { ...t, i, t0: at, t1: out, items };
});
const bug = P.bug && { text: P.bug.text, t0: ref(P.bug.from, "bug"), t1: ref(P.bug.to, "bug") };
const manifest = JSON.parse(fs.readFileSync(path.join(WS, "assets", "sfx", "manifest.json"), "utf8"));
const lead = (n) => manifest[n]?.lead_s ?? 0;
const sfx = [];
shots.forEach((s, k) => {
  if (!k || s.tin === "cut") return;
  if (s.tin === "whip") sfx.push({ name: "whoosh", start: s.t0 - lead("whoosh"), vol: 0.42, why: `whip into ${s.id}` });
  else sfx.push({ name: "whoosh-short", start: s.mid - 0.12 - lead("whoosh-short"), vol: 0.3, why: `${s.tin} into ${s.id}` });
});
for (const t of texts) if (t.type === "chips" || t.type === "icons") for (const it of t.items) sfx.push({ name: "click-soft", start: it.t - lead("click-soft"), vol: 0.3, why: it.text });
for (const x of P.sfx ?? []) sfx.push({ name: x.file, start: ref(x.t, "sfx") - lead(x.file), vol: x.vol ?? 0.3, why: x.why ?? "" });
sfx.sort((a, b) => a.start - b.start);
for (const x of sfx) if (!fs.existsSync(path.join(proj, "assets", "sfx", `${x.name}.mp3`))) die(`sound ${x.name}.mp3 is missing from the project's assets/sfx`);

// music envelope (dB on the BGM file): open, under each voice line, up a little in the pauses, up after the last word
const M = P.music, R = M.ramp ?? 0.35;
const env = [[0, M.openDb], [Math.max(0, lines[0].a - R), M.openDb], [lines[0].a, M.underVoiceDb]];
for (let i = 0; i + 1 < lines.length; i++) {
  const b = lines[i].b, a = lines[i + 1].a, gap = a - b;
  if (gap >= 2 * R + 0.1) env.push([b, M.underVoiceDb], [b + R, M.gapDb], [a - R, M.gapDb], [a, M.underVoiceDb]);
  else if (gap >= 0.3) env.push([b, M.underVoiceDb], [b + gap / 2, M.underVoiceDb + (M.gapDb - M.underVoiceDb) * Math.min(1, gap / 2 / R)], [a, M.underVoiceDb]);
}
env.push([lastWordEnd, M.underVoiceDb], [lastWordEnd + R, M.endDb], [TOTAL, M.endDb]);
const songLen = +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(MEDIA, M.file)], { encoding: "utf8" }).stdout;
const lastBed = M.beds.at(-1);
if (lastBed.from + (TOTAL - lastBed.at) > songLen - 0.05) die(`the music runs out at ${f2(lastBed.at + songLen - lastBed.from)} s, the video is ${f2(TOTAL)} s: add a later bed`);

// ---- report ---------------------------------------------------------------------------------------------------------
console.log(`${NAME}: ${f2(TOTAL)} s (${shots.at(-1).f0 + shots.at(-1).len} frames at ${FPS} fps), voice ${f2(lines[0].a)}–${f2(lastWordEnd)} s, script↔voice ${Math.round(vt.matched * 100)} %`);
console.log("  shot   start    on word (time)              len    src frames  speed  hold");
for (const s of shots) {
  const w = s.at != null ? `${s.at} (${f2(ref(s.at))})` : "";
  console.log(`  ${s.id.padEnd(5)} ${f2(s.t0).padStart(6)}  ${s.tin.padEnd(8)} ${w.padEnd(26)} ${f2(T(s.len)).padStart(5)}  ${String(s.srcFrames).padStart(4)}+${s.srcIn}`.padEnd(70) + `${s.speed}`.padEnd(7) + f2(T(s.holdF)));
}
const moved = words.filter((w) => Math.abs(w.t - w.asr) >= 0.08);
if (moved.length) console.log(`  word starts moved to the audio: ${moved.map((w) => `${w.text} ${f2(w.asr)}→${f2(w.t)}`).join(", ")}`);
const endHold = TOTAL - lastWordEnd;
if (endHold > 3.05) warns.push(`the end card holds ${f2(endHold)} s after the last word (STYLE §১১: at most 3 s)`);
if (endHold < 0.5) warns.push(`the video ends ${f2(endHold)} s after the last word: the last word may be cut`);
for (const w of warns) console.log(`  ⚠ ${w}`);

// timeline.json: every resolved time, for checking and for the next build
fs.mkdirSync(path.join(proj, "build"), { recursive: true });
fs.writeFileSync(path.join(proj, "build", "timeline.json"), JSON.stringify({
  fps: FPS, total: +f3(TOTAL), frames: F(TOTAL), voiceAt: AT, lastWordEnd,
  lines, words: words.map(({ text, t, asr, end, line, how }) => ({ text, t, asr, end, line, how })),
  shots: shots.map((s) => ({ id: s.id, clip: s.clip, start: +f3(s.t0), end: +f3(s.t1), mid: +f3(s.mid), frames: s.len, in: s.tin, dIn: s.dIn, at: s.at ?? null,
    atTime: s.at != null ? +f3(ref(s.at)) : null, srcIn: s.srcIn, srcFrames: s.srcFrames, speed: s.speed, holdFrames: s.holdF })),
  texts: texts.map((t) => ({ type: t.type, t0: +f3(t.t0), t1: +f3(t.t1), items: t.items.map((it) => ({ text: it.text, t: +f3(it.t) })) })),
  bug, sfx: sfx.map((x) => ({ ...x, start: +f3(x.start) })), musicEnv: env.map(([t, d]) => [+f3(t), d]), warnings: warns,
}, null, 1) + "\n");
if (CHECK) process.exit(0);

// ---- 3. shots -------------------------------------------------------------------------------------------------------
const shotDir = path.join(MEDIA, "shots");
fs.mkdirSync(shotDir, { recursive: true });
const COLOUR = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"];
for (const s of shots) {
  const out = path.join(shotDir, `${s.id}.mp4`), key = path.join(shotDir, `${s.id}.json`);
  const vf = [`trim=start_frame=${s.srcIn}:end_frame=${s.srcIn + s.srcFrames}`, "setpts=PTS-STARTPTS"];
  if (s.speed > 1) vf.push(`setpts=PTS/${s.speed}`, `fps=${FPS}`);
  if (s.speed < 1) vf.push(`setpts=PTS/${s.speed}`, `framerate=fps=${FPS}`);
  if (s.crop) vf.push(`crop=${s.crop[2]}:${s.crop[3]}:${s.crop[0]}:${s.crop[1]}`);
  vf.push("scale=1920:1080:flags=lanczos:out_color_matrix=bt709", "unsharp=5:5:0.35:5:5:0");
  if (P.grade) vf.push(P.grade);
  vf.push("format=yuv420p", `tpad=stop_mode=clone:stop=${s.holdF + 2}`);
  const sig = JSON.stringify({ vf, len: s.len, src: fs.statSync(path.join(MEDIA, s.clip)).size });
  if (!NOSHOTS && !(fs.existsSync(out) && fs.existsSync(key) && fs.readFileSync(key, "utf8") === sig)) {
    const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", path.join(MEDIA, s.clip), "-vf", vf.join(","), "-frames:v", String(s.len), "-r", String(FPS),
      "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-g", String(FPS), ...COLOUR, "-movflags", "+faststart", out], { stdio: "inherit" });
    if (r.status !== 0) die(`FFmpeg failed on shot ${s.id}`);
    const n = +spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout;
    if (n !== s.len) die(`shot ${s.id} came out ${n} frames, needs ${s.len}`);
    fs.writeFileSync(key, sig);
  }
}
if (!NOSHOTS) console.log(`✓ ${shots.length} shots cut to exact frame counts → assets/media/shots/`);

// ---- 4. soundtrack --------------------------------------------------------------------------------------------------
if (!NOMIX) {
  const spec = { total: +f3(TOTAL), out: MEDIA, voice: { file: voiceFile, at: AT },
    music: { file: path.join(MEDIA, M.file), beds: M.beds, xfade: M.xfade ?? 1.5, fadeOut: M.fadeOut ?? 1.0, env,
      duck: { lines: lines.map((l) => [l.a, l.b]), target: M.duckLU ?? 14, open: M.openDb, end: M.endDb, lift: M.gapDb - M.underVoiceDb, ramp: R } },
    sfx: sfx.map((x) => ({ file: path.join(proj, "assets", "sfx", `${x.name}.mp3`), start: x.start, vol: x.vol })) };
  fs.writeFileSync(path.join(proj, "build", "mix.spec.json"), JSON.stringify(spec, null, 1));
  const r = spawnSync(PY, ["-I", path.join(WS, "tools", "promo", "mix.py"), path.join(proj, "build", "mix.spec.json")], { encoding: "utf8" });
  if (r.status !== 0) die(`mix failed:\n${r.stderr}`);
  const rep = JSON.parse(r.stdout.trim().split("\n").at(-1));
  console.log(`✓ soundtrack: voice at ${AT} s, ${M.beds.length} music beds, ${sfx.length} sounds → assets/media/mix.wav; music under each line: ${rep.gap_lu.map((x) => x.toFixed(1)).join(" / ")} LU (target ${M.duckLU ?? 14})`);
  const bad = rep.gap_lu.filter((x) => x < 11.5 || x > 17);
  if (bad.length) warns.push(`music sits ${bad.join(", ")} LU under some voice lines (want 12-16): check build/mix.report`);
}

// ---- 5. pages -------------------------------------------------------------------------------------------------------
const ICONS = path.join(WS, "assets", "icons", "lucide", "icons");
const icon = (name, size, cls = "") => {
  const svg = fs.readFileSync(path.join(ICONS, `${name}.svg`), "utf8");
  const inner = svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim()
    .replace(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="1"');
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#EDC060" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
};
const GOLD = "#EDC060", CREAM = "#FFF5E1";
const coverBox = (s) => {   // a source-pixel box → stage pixels after the shot's crop and scale
  const [cx, cy, cw, ch] = s.crop ?? [0, 0, clipDur[s.clip].w, clipDur[s.clip].h], k = 1920 / cw;
  const [x, y, w, h] = s.cover.box;
  return [Math.round((x - cx) * k), Math.round((y - cy) * k), Math.round(w * k), Math.round(h * k)];
};

// three pages from ONE timeline: "16x9" (the master), "picture" (the 16:9 picture alone, no text: rendered once to
// assets/media/picture.mp4) and "9x16" (that picture in a window over its own FFmpeg-blurred copy, texts below):
// the vertical version shows the very same frames, and a 9:16 page with two live copies of every shot and a CSS blur
// over 3,400 px was too heavy for software GL (its check passed 5 min, 2026-11-04 cloud)
function page(fmt) {
  const V = fmt === "9x16", PIC = fmt === "picture";
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const leaks = shots.filter((s) => s.tin === "leak");
  const stage = (copy, track0) => `
      <div class="stage ${copy}">
${shots.map((s, k) => {
    const cov = s.cover ? (() => { const [x, y, w, h] = coverBox(s); return `<div class="cover" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.max(h, 1080 - y)}px"></div>`; })() : "";
    return `        <div class="shot sh-${s.id}" data-layout-allow-overflow style="z-index:${k + 1}"><div class="mv mv-${s.id}" data-layout-allow-overflow><video id="v${copy}-${s.id}" src="assets/media/shots/${s.id}.mp4" muted playsinline data-start="${f3(s.t0)}" data-duration="${f3(T(s.len))}" data-track-index="${track0 + (k % 2)}"></video></div>${cov}</div>`;
  }).join("\n")}
${leaks.map((s) => `        <div class="leak lk-${s.id}" data-layout-allow-overflow></div>`).join("\n")}
        <div class="vig"></div>
      </div>`;

  // ---- texts
  const uis = texts.map((t) => {
    const id = `t${t.i}`;
    if (t.type === "kicker") {
      const parts = t.items.map((p, j) => `${j ? `<i class="dot dt${j}"></i>` : ""}<span class="part pt${j}">${esc(p.text)}</span>`).join("");
      const pos = V ? "v" : t.pos;
      return `<div class="tx kick ${pos}" id="${id}"><i class="rule"></i><div class="kline">${parts}</div></div>`;
    }
    if (t.type === "chips") {
      return `<div class="tx chips ${V ? "v" : t.pos}" id="${id}"><div class="lab">${esc(t.label)}</div><div class="pills">${t.items.map((it, j) => `<span class="pill it${j}"><i class="gd"></i>${esc(it.text)}</span>`).join("")}</div></div>`;
    }
    if (t.type === "icons") {
      const inline = t.inline && !V;
      const items = t.items.map((it, j) => `${j && !V ? `<i class="sep sp${j}"></i>` : ""}<div class="it it${j}">${icon(it.icon, V ? 46 : 54)}<span>${esc(it.text)}</span></div>`).join("");
      const lab = `<div class="lab">${esc(t.label)}</div>`;
      return `<div class="tx icons ${V ? "v" : t.pos}${inline ? " inline" : ""}" id="${id}">${inline ? `<div class="irow">${lab}<i class="sep sp0"></i>${items}</div>` : `${lab}<div class="irow">${items}</div>`}</div>`;
    }
    die(`unknown text type ${t.type}`);
  }).join("\n      ");

  // ---- timeline (the renderer SEEKS: every fromTo after the earliest one on the same target gets
  // immediateRender:false, so a seek before it keeps the earliest tween's starting state — CLAUDE.md §0i State)
  const tws = [], sets = [];
  const tw = (sel, from, to, at) => tws.push({ sel, from, to: { ...to }, at });
  const set = (sel, v, at) => sets.push(`tl.set(${JSON.stringify(sel)}, ${JSON.stringify(v)}, ${f3(at)});`);
  const emit = () => {
    const seen = new Map();
    for (const l of sets) { const m = l.match(/^tl\.set\(("[^"]+"), .*, ([\d.]+)\);$/); const k = `${m[1]}@${m[2]}`; if (seen.has(k)) die(`page ${fmt}: two settings on ${m[1]} at ${m[2]} s (the seeking renderer keeps an unpredictable one)`); seen.set(k, l); }
    const first = {};
    for (const t of tws) if (!(t.sel in first) || t.at < first[t.sel].at) first[t.sel] = t;
    return [...sets, ...tws.map((t) => { if (first[t.sel] !== t) t.to.immediateRender = false;
      return `tl.fromTo(${JSON.stringify(t.sel)}, ${JSON.stringify(t.from)}, ${JSON.stringify(t.to)}, ${f3(t.at)});`; })];
  };
  if (!V) shots.forEach((s, k) => {
    const sel = `.sh-${s.id}`, dIn = T(s.dIn);
    const next = shots[k + 1], dOut = next ? T(next.dIn) : 0;
    // the first shot is shown by ONE set at 0: a hide-set and a show-set at the same instant left it hidden for its
    // whole slot when the renderer seeks (black first 10 s, render 1 of 2026-11-04; emit() now refuses that pattern)
    set(sel, { autoAlpha: s.tin === "none" ? 1 : 0, scale: 1, filter: "blur(0px)" }, 0);
    if (s.tin === "whip") {
      set(sel, { autoAlpha: 1 }, s.t0 + dIn / 2);
      tw(sel, { scale: 1.2, filter: "blur(18px)" }, { scale: 1, filter: "blur(0px)", duration: dIn / 2, ease: "power2.out" }, s.t0 + dIn / 2);
    } else if (s.tin === "leak" || s.tin === "dissolve") {
      tw(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: dIn, ease: "sine.inOut" }, s.t0);
    } else if (s.tin !== "none") set(sel, { autoAlpha: 1 }, s.t0);
    if (next?.tin === "whip") {
      tw(sel, { scale: 1, filter: "blur(0px)" }, { scale: 1.22, filter: "blur(18px)", duration: dOut / 2, ease: "power2.in" }, s.t1 - dOut);
      set(sel, { autoAlpha: 0 }, s.t1 - dOut / 2);
    } else if (next) set(sel, { autoAlpha: 0 }, s.t1);
    if (s.move) tw(`.mv-${s.id}`, { scale: s.move[0] }, { scale: s.move[1], duration: s.t1 - s.t0, ease: "sine.out" }, s.t0);
    if (s.tin === "leak") {
      const a = s.t0 - 0.25, d = dIn + 0.5;
      tw(`.lk-${s.id}`, { x: -1500 }, { x: 1100, duration: d, ease: "sine.inOut" }, a);
      tw(`.lk-${s.id}`, { opacity: 0 }, { opacity: 0.9, duration: d / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, a);
    }
  });
  const scrimSpans = [];
  if (!PIC) for (const t of texts) {
    const id = `#t${t.i}`, out = t.t1, OUT = 0.3;
    if (t.type === "kicker") {
      tw(`${id} .rule`, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power3.out" }, t.t0 - 0.05);
      t.items.forEach((p, j) => {
        tw(`${id} .pt${j}`, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, p.t);
        if (j && !V) tw(`${id} .dt${j}`, { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, p.t - 0.05);
      });
    } else if (t.type === "chips") {
      tw(`${id} .lab`, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.t0);
      t.items.forEach((it, j) => tw(`${id} .it${j}`, { opacity: 0, scale: 0.6, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(2.2)" }, it.t));
    } else if (t.type === "icons") {
      tw(`${id} .lab`, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.t0);
      if (!V && t.inline) tw(`${id} .sp0`, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "power2.out" }, t.t0 + 0.1);
      t.items.forEach((it, j) => {
        tw(`${id} .it${j} svg`, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, it.t);   // undrawn strokes show their round caps as dots
        tw(`${id} .it${j} svg *`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", stagger: 0.05 }, it.t);
        tw(`${id} .it${j} span`, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, it.t + 0.05);
        if (j && !V) tw(`${id} .sp${j}`, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: "power2.out" }, it.t - 0.12);
      });
    }
    if (out < TOTAL - 0.01) tw(id, { opacity: 1, y: 0 }, { opacity: 0, y: -10, duration: OUT, ease: "power2.in" }, out - OUT);
    if (!V && t.scrim !== false && t.pos !== "band") scrimSpans.push([t.t0 - 0.2, out]);
  }
  if (fmt === "16x9") {   // the bottom scrim rises only while a bottom text is on screen
    scrimSpans.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const s of scrimSpans) { const m = merged.at(-1); if (m && s[0] <= m[1] + 0.6) m[1] = Math.max(m[1], s[1]); else merged.push([...s]); }
    for (const [a, b] of merged) {
      tw("#scrim", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.out" }, a);
      if (b < TOTAL - 0.01) tw("#scrim", { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "sine.in" }, b - 0.3);
    }
    if (bug) { tw("#bug", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.out" }, bug.t0); tw("#bug", { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "sine.in" }, bug.t1 - 0.4); }
  }
  if (!PIC) tw("#black", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, TOTAL - 0.5);
  const js = emit();

  const fontFace = `
@font-face { font-family: "Baloo Da 2"; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-weight: 400 800; font-display: block; }
@font-face { font-family: "Hind Siliguri"; src: url("assets/fonts/HindSiliguri-Medium.ttf") format("truetype"); font-weight: 500; font-display: block; }
@font-face { font-family: "Hind Siliguri"; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-weight: 600; font-display: block; }
@font-face { font-family: "Hind Siliguri"; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-weight: 700; font-display: block; }
@font-face { font-family: "Inter"; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-weight: 100 900; font-display: block; }`;
  const css = `${fontFace}
body { margin: 0; background: #000; }
#root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #04120b; font-family: "Hind Siliguri", "Inter", sans-serif; color: ${CREAM}; }
.stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; background: #000; transform-origin: 0 0; }
.shot { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; visibility: hidden; opacity: 0; transform-origin: 50% 50%; }
.mv { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 50% 50%; }
.mv video { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
.cover { position: absolute; background: linear-gradient(180deg, #0B2E1E 0%, #061E13 100%); border-top: 3px solid ${GOLD}; box-sizing: border-box; }
.leak { position: absolute; left: 0; top: -560px; width: 2200px; height: 2200px; margin-left: -1100px; opacity: 0; mix-blend-mode: screen; z-index: 40;
  background: radial-gradient(closest-side, rgba(255,214,140,0.95) 0%, rgba(255,170,70,0.55) 42%, rgba(255,170,70,0) 100%); }
.vig { position: absolute; inset: 0; z-index: 50; background: radial-gradient(ellipse 80% 78% at 50% 50%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.38) 100%); }
#black { position: absolute; inset: 0; background: #000; opacity: 0; z-index: 90; }
.tx { position: absolute; z-index: 60; }
.tx .lab { font-weight: 600; font-size: 34px; line-height: 1.4; color: ${GOLD}; text-shadow: 0 2px 10px rgba(0,0,0,0.6); opacity: 0; }
.kick .rule { display: block; width: 120px; height: 4px; background: ${GOLD}; border-radius: 2px; transform-origin: 0 50%; transform: scaleX(0); margin-bottom: 18px; }
.kick .kline { display: flex; align-items: center; column-gap: 22px; font-weight: 600; font-size: 46px; line-height: 1.45; text-shadow: 0 2px 14px rgba(0,0,0,0.65); }
.kick .part { opacity: 0; white-space: nowrap; }
.kick .dot { display: block; flex: none; width: 11px; height: 11px; border-radius: 50%; background: ${GOLD}; box-shadow: 0 0 10px rgba(237,192,96,0.8); transform: scale(0); }
.pills { display: flex; justify-content: center; gap: 16px; margin-top: 12px; }
.pill { position: relative; display: flex; align-items: center; gap: 14px; padding: 8px 28px 10px 22px; border-radius: 999px; font-weight: 600; font-size: 40px; line-height: 1.4; white-space: nowrap;
  color: ${CREAM}; background: linear-gradient(180deg, #1D6440 0%, #0D3A26 100%); box-shadow: inset 0 0 0 2px rgba(237,192,96,0.85), 0 10px 26px rgba(0,0,0,0.45); opacity: 0; }
.pill .gd { display: block; width: 12px; height: 12px; border-radius: 50%; background: ${GOLD}; box-shadow: 0 0 10px 2px rgba(237,192,96,0.75); }
.irow { display: flex; align-items: center; justify-content: center; }
.it { display: flex; align-items: center; gap: 14px; }
.it span { font-weight: 600; font-size: 44px; line-height: 1.4; white-space: nowrap; text-shadow: 0 2px 12px rgba(0,0,0,0.65); opacity: 0; }
.it svg { flex: none; opacity: 0; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6)); }
.it svg * { stroke-dasharray: 1; stroke-dashoffset: 1; }
.sep { display: block; flex: none; width: 2px; height: 58px; margin: 0 34px; background: rgba(237,192,96,0.6); transform: scaleY(0); }
${V ? `
#bg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }
#shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,18,11,0.72) 0%, rgba(4,18,11,0.55) 40%, rgba(4,18,11,0.72) 100%); }
#win { position: absolute; left: 0; top: 360px; width: 1080px; height: 608px; overflow: hidden; border-radius: 18px; box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 6px 18px rgba(0,0,0,0.5); }
#win video { position: absolute; left: 0; top: 0; width: 1080px; height: 608px; object-fit: cover; }
#edge { position: absolute; left: 0; top: 360px; width: 1080px; height: 608px; border-radius: 18px; box-shadow: inset 0 0 0 2px rgba(237,192,96,0.45); z-index: 55; }
#brand { position: absolute; left: 0; top: 252px; width: 1080px; height: 60px; display: flex; align-items: center; justify-content: center; gap: 14px; z-index: 60;
  font-weight: 600; font-size: 34px; line-height: 1.4; text-shadow: 0 2px 10px rgba(0,0,0,0.6); }
.tx.v { left: 70px; width: 940px; top: 1002px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.kick.v .rule { transform-origin: 50% 50%; }
.kick.v .kline { flex-direction: column; row-gap: 2px; }
.kick.v .dot { display: none; }
.chips.v .pills { flex-wrap: wrap; row-gap: 14px; width: 940px; }
.icons.v .irow { flex-wrap: wrap; column-gap: 34px; row-gap: 12px; width: 940px; margin-top: 10px; }
.icons.v .it span { font-size: 40px; }` : `
#scrim { position: absolute; left: 0; bottom: 0; width: 1920px; height: 520px; opacity: 0; z-index: 55; background: linear-gradient(0deg, rgba(4,18,11,0.78) 0%, rgba(4,18,11,0.45) 45%, rgba(4,18,11,0) 100%); }
#bug { position: absolute; right: 116px; top: 58px; display: flex; align-items: center; gap: 12px; opacity: 0; z-index: 60; font-weight: 600; font-size: 30px; line-height: 1.4; text-shadow: 0 2px 10px rgba(0,0,0,0.7); }
.tx.bl { left: 120px; bottom: 132px; }
.tx.bc { left: 0; width: 1920px; bottom: 112px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.kick.bc .rule { transform-origin: 50% 50%; }
.tx.band { left: 0; width: 1920px; top: ${(() => { const s4 = shots.find((s) => s.cover); return s4 ? coverBox(s4)[1] + 3 : 904; })()}px; bottom: 0; display: flex; align-items: center; justify-content: center; }
.tx.band .lab { font-size: 40px; }`}`;

  const dur = f3(TOTAL);
  const body = V ? `      <video id="bg" src="assets/media/vertical-bg.mp4" muted playsinline data-start="0" data-duration="${dur}" data-track-index="0"></video>
      <div id="shade"></div>
      <div id="win"><video id="winv" src="assets/media/vertical-win.mp4" muted playsinline data-start="0" data-duration="${dur}" data-track-index="1"></video></div>
      <div id="edge"></div>
      <div id="brand">${icon("wheat", 38, "on")}<span>${esc(P.brand.name)}</span></div>`
    : `${stage("a", 0)}${PIC ? "" : `
      <div id="scrim"></div>
      ${bug ? `<div id="bug">${icon("wheat", 34, "on")}<span>${esc(bug.text)}</span></div>` : ""}`}`;
  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(P.title)} ${fmt}</title>
    <script src="assets/js/gsap.min.js"></script>
    <style>${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${dur}" data-fps="${FPS}">
${body}${PIC ? "" : `
      ${uis}
      <div id="black"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${dur}" data-track-index="9" data-volume="1"></audio>`}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${js.map((l) => "      " + l).join("\n")}
      tl.set({}, {}, ${dur});
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  return html.replace(/<svg class="on"([^>]*)>/g, '<svg$1 style="flex:none">').replace(/(<svg[^>]*style="flex:none"[^>]*>[\s\S]*?<\/svg>)/g, (m) => m.replace(/ pathLength="1"/g, ""));
}

// the two sibling projects share this project's media folder (shots, mix, picture)
const sib = (suffix) => {
  const d = path.join(path.dirname(proj), `${NAME}-${suffix}`);
  fs.mkdirSync(path.join(d, "assets"), { recursive: true });
  for (const x of ["fonts", "js", "sfx"]) fs.cpSync(path.join(proj, "assets", x), path.join(d, "assets", x), { recursive: true });
  if (!fs.existsSync(path.join(d, "assets", "media"))) fs.symlinkSync(MEDIA, path.join(d, "assets", "media"), "junction");
  fs.copyFileSync(path.join(proj, "hyperframes.json"), path.join(d, "hyperframes.json"));
  fs.writeFileSync(path.join(d, "README.md"), `Built by tools/promo/build.mjs from ../${NAME}/promo.json (${suffix}). Do not edit by hand.\n`);
  return d;
};
const vPic = sib("picture"), v9 = sib("9x16");
fs.writeFileSync(path.join(proj, "index.html"), page("16x9"));
fs.writeFileSync(path.join(vPic, "index.html"), page("picture"));
fs.writeFileSync(path.join(v9, "index.html"), page("9x16"));
console.log(`✓ pages: projects/${NAME} (16:9 master), projects/${NAME}-picture (16:9 picture only), projects/${NAME}-9x16 (uses the rendered picture), ${FPS} fps, ${f2(TOTAL)} s`);

// --vertical: render the picture page once, then the window layer and the blurred background for the 9:16 page
if (argv.includes("--vertical")) {
  const pic = path.join(MEDIA, "picture.mp4");
  const hf = path.join(spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim(), "hyperframes", "bin", "hyperframes.mjs");
  const env = { ...process.env, HYPERFRAMES_NO_AUTO_INSTALL: "1", HYPERFRAMES_SKIP_SKILLS: "1" };
  console.log("• rendering the 16:9 picture (no text) …");
  const r = spawnSync(process.execPath, [hf, "render", "--quality", "high", "--workers", "1", "--fps", String(FPS), "--frames-cache-dir", path.join(MEDIA, "..", "frames-cache"), "--output", pic], { cwd: vPic, env, stdio: "inherit" });
  if (r.status !== 0 || !fs.existsSync(pic)) die("the picture render failed");
  const n = F(TOTAL);
  // a keyframe every second: HyperFrames warns "sparse keyframes … seek failures and frame freezing" at x264's default
  // 10 s (the 2026-11-04 Reel was still frame-exact, checked frame by frame, but do not rely on that)
  const enc = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", String(FPS), "-pix_fmt", "yuv420p", "-r", String(FPS), "-frames:v", String(n), ...COLOUR, "-movflags", "+faststart"];
  const ff = (vf, out) => { const x = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", pic, "-vf", vf, ...enc, path.join(MEDIA, out)], { stdio: "inherit" }); if (x.status !== 0) die(`FFmpeg failed on ${out}`); };
  ff("scale=1080:608:flags=lanczos,format=yuv420p", "vertical-win.mp4");
  ff("scale=-2:480:flags=bicubic,crop=270:480,gblur=sigma=7,scale=1080:1920:flags=bicubic,eq=saturation=1.1,format=yuv420p", "vertical-bg.mp4");
  for (const f of ["picture.mp4", "vertical-win.mp4", "vertical-bg.mp4"]) {
    const c = +spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path.join(MEDIA, f)], { encoding: "utf8" }).stdout;
    if (c !== n) die(`${f} has ${c} frames, the video has ${n}`);
  }
  console.log(`✓ assets/media/picture.mp4, vertical-win.mp4 (1080x608), vertical-bg.mp4 (1080x1920 blurred): ${n} frames each`);
}

// ---- 6. PLAN.md -----------------------------------------------------------------------------------------------------
const bn = (s) => String(s).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const into = { leak: "সোনালি আলোর ঝলক পেরিয়ে", whip: "জুম-ব্লার ট্রানজিশনে", dissolve: "মিলিয়ে গিয়ে", cut: "কাট:", none: "" };
const cuts = new Set();
shots.forEach((s) => cuts.add(+f2(s.tin === "none" ? 0 : s.mid)));
for (const t of texts) { for (const it of t.items) cuts.add(+f2(it.t)); if (t.t1 < TOTAL - 0.01) cuts.add(+f2(t.t1)); }
lines.forEach((l) => cuts.add(+f2(l.a)));
let bounds = [...cuts].filter((x) => x >= 0 && x < TOTAL - 0.3).sort((a, b) => a - b);
bounds = bounds.filter((x, i) => i === 0 || x - bounds[i - 1] >= 0.35);
bounds.push(+f2(TOTAL));
const rows = [];
for (let i = 0; i + 1 < bounds.length; i++) {
  let [a, b] = [bounds[i], bounds[i + 1]];
  while (b - a > 3.0) { const m = +f2(a + Math.min(3.0, (b - a) / 2)); rows.push([a, m]); a = m; }
  rows.push([a, b]);
}
const seen = new Set();
const table = rows.map(([a, b]) => {
  const sh = [...shots].reverse().find((s) => (s.tin === "none" ? 0 : s.mid) <= a + 0.001);
  let what;
  if (!seen.has(sh.id)) { seen.add(sh.id); what = `${into[sh.tin]} ${sh.clip.replace(".mp4", "")} নং ক্লিপ: ${sh.what}`.trim(); }
  else what = `একই শট${b >= TOTAL - 0.01 && b - lastWordEnd > 0.5 ? ", দম: শেষ ফ্রেম ধীরে জুম-আউট, শেষে কালোয় মিলিয়ে যায়" : ""}`;
  if (sh.id === shots[0].id && a >= 6.0 && !texts.some((t) => t.t0 < b && t.t1 > a + 0.3)) what += " (দম: সোনালি নাম পুরো স্পষ্ট)";
  const shown = [];
  for (const t of texts) {
    if (t.t0 >= a - 0.001 && t.t0 < b && t.label) shown.push(t.label);
    for (const it of t.items) if (it.t >= a - 0.001 && it.t < b) shown.push(it.text);
  }
  const snd = [];
  const cnt = {};
  for (const x of sfx) { const hit = x.start + lead(x.name); if (hit >= a - 0.001 && hit < b) cnt[x.name] = (cnt[x.name] ?? 0) + 1; }
  for (const [n, c] of Object.entries(cnt)) snd.push(`\`${n}\`${c > 1 ? ` ×${bn(c)}` : ""}`);
  lines.forEach((l, li) => { if (l.a >= a - 0.001 && l.a < b) snd.push(`ভয়েস ${bn(li + 1)}`); });
  if (a === 0) snd.push("মিউজিক");
  if (!snd.length) snd.push(a < lastWordEnd ? "ভয়েস চলছে" : "মিউজিক");
  return `| ${a}–${b} | ${what} | ${shown.length ? shown.join(" · ") : "—"} | ${snd.join(", ")} |`;
});
const removed = Object.entries(P.clips ?? {}).flatMap(([c, v]) => (v.baked ?? []).map((b) => `- ${c}: "${b.text}" — ${b.ok ? "ঠিক আছে, রাখা হয়েছে" : `দেখা যাবে না (${b.why})`}`));
fs.writeFileSync(path.join(proj, "PLAN.md"), `# প্ল্যান: ${P.title} (ক্লায়েন্টের কাজ, স্টাইল CP1)

ফরম্যাট: 16:9
দৈর্ঘ্য: ${f2(TOTAL)} সেকেন্ড
প্ল্যাটফর্ম: Facebook পেজ আর বিজ্ঞাপন, YouTube, Facebook/Instagram Reels
ধরন: অফার বা প্রোমো (ক্লায়েন্টের ব্যবসার পরিচিতি)
ভয়েস: ক্লায়েন্টের দেওয়া রেকর্ড করা ভয়েস (${P.voice.file}, ${f2(vt.dur)} সেকেন্ড), ${AT} সেকেন্ড পর শুরু
মিউজিক: ক্লায়েন্টের দেওয়া ${M.file} (${f2(songLen)} সেকেন্ড; শেষটা মেলাতে ${f2(lastBed.at)} সেকেন্ডে গানের ${f2(lastBed.from)} সেকেন্ড থেকে দ্বিতীয় অংশ, ${M.xfade} সেকেন্ডে মিলিয়ে)
আউটপুট: 16:9 1920×1080 আর 9:16 1080×1920 (আলাদা লেআউট: পুরো ছবি একটা জানালায়, পেছনে তারই ঝাপসা কপি), ${FPS} fps (ক্লিপগুলোর নিজের গতি)
পুরো ভিডিও জুড়ে: হালকা কালার গ্রেড আর কোণে ভিনিয়েট (প্রথম থেকে শেষ ফ্রেম); 16:9-এ উপরের ডান কোণে ছোট নাম ${f2(bug?.t0 ?? 0)}–${f2(bug?.t1 ?? 0)} সেকেন্ড (যতক্ষণ বড় নাম পর্দায় নেই); 9:16-এ জানালার উপরে নাম পুরো ভিডিও

## লক্ষ্য

দর্শক বুঝবেন: খুলনার বটিয়াঘাটার মোহনা অ্যাগ্রো ফুড আটা, ময়দা, সুজি, গম, ভূষি আর মেইস ফ্লাওয়ার বানায়, আমদানি-রপ্তানি করে আর সরবরাহ করে, আর মানের উপর ভরসা রাখা যায়।

## হুক (প্রথম ২ সেকেন্ড)

সূর্যোদয়ের সোনালি গমক্ষেতের উপর দিয়ে ড্রোন ছুটে যায়, মিউজিক শুরু থেকেই, ভয়েস ${f2(lines[0].a)} সেকেন্ডে, নিচে বাঁয়ে লেখা ওঠে "${texts[0].items[0]?.text ?? ""}"।

## স্ক্রিপ্ট

${P.script.map((l, i) => `${bn(i + 1)}. (${bn(`0:${f2(lines[i].a).padStart(5, "0")}`)}) ${l}`).join("\n")}

## শট টেবিল

ভয়েসই মেরুদণ্ড: প্রতিটা কাট আর লেখা তার নিজের শব্দের শুরুর ফ্রেমে (শব্দের শুরু ভয়েসের আওয়াজ থেকে মাপা)। পর্দার লেখার মাঝের বিন্দুগুলো (·) লেখা নয়, সোনালি গোল দাগ। আইকন (কারখানা, জাহাজ, ট্রাক, ব্যাজ, তারা, হাত মেলানো) রেখা টেনে আঁকা হয়।

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${table.join("\n")}

## যা লাগবে

- সবকিছু ক্লায়েন্টের দেওয়া: ${Object.keys(clipDur).length}টা AI ক্লিপ (${clipDur[shots[0].clip].w}×${clipDur[shots[0].clip].h}, ${FPS} fps), ভয়েস, BGM। নতুন কিছু কিনতে হবে না, কোনো খরচ নেই।
- ক্লিপের ভেতরের লেখা (AI-র বসানো):
${removed.join("\n")}
- ক্রপ আর 720p থেকে 1080p-এ বড় করায় ছবি সামান্য নরম; Lanczos দিয়ে বড় করে হালকা শার্প করা।
- শব্দ: সবগুলো \`assets/sfx\`-এ আছে।
- মিউজিক ক্লায়েন্টের নিজের দেওয়া, তাই assets/music-এ নেই (প্রজেক্টের assets/media-তে আছে)।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- ফন্ট শুধু দুটো: লেখা Hind Siliguri, বড় নাম Baloo Da 2; বাংলায় letter-spacing নেই; বিন্দু আর আইকন ছবি হিসেবে আঁকা (STYLE §৩)।
- পড়ার লেখা ৩৪ px-এর বেশি, ছোট নাম ৩০ px (STYLE §৬)।
- প্রতিটা দৃশ্য বদলে শব্দ, ছোট ঘটনায় হালকা click; শব্দ ঠিক ছবির মুহূর্তে (STYLE §৭)।
- মিউজিক ভয়েসের অনেক নিচে, কথার ফাঁকে একটু ওঠে, শেষে আস্তে থামে (STYLE §৭)।
- জুম সবসময় ১ গুণে এসে থামে (STYLE §৫)।
- শেষ পর্দা শেষ কথার পর ${f2(TOTAL - lastWordEnd)} সেকেন্ড (STYLE §১১: ৩ সেকেন্ডের কম)।
- পুরো ভিডিওর জিনিস (গ্রেড, ভিনিয়েট, নাম) প্রথম থেকে শেষ পর্যন্ত (LESSONS 2026-10-28)।
- কাজ দিয়ে "বানাও" বললে সিদ্ধান্ত Claude নেবে, বানিয়ে দেখাবে, মতামত এলে বদলাবে (LESSONS 2026-11-01)।
- নতুন (২০২৬-১১-০৪): প্রতিটা কাট শব্দের আসল শুরুতে। ASR শব্দের শুরু শ্বাসের উপর বসায় ("আটা" ৯.৩০ → আসলে ৯.৯০), তাই শুরুটা ভয়েসের আওয়াজ থেকে মাপা।

## আপনার কাছে প্রশ্ন

১. শেষ পর্দায় ক্লায়েন্টের ফোন নম্বর বা Facebook পেজের নাম দেব? ভয়েসে নেই, তাই এখন দিইনি।
২. ভয়েসে "দীর্ঘমেয়াদী ব্যবসায়ী সম্পর্ক"; পর্দায় ছোট করে বাংলা একাডেমির বানানে "দীর্ঘমেয়াদি সম্পর্ক"। ক্লায়েন্ট "দীর্ঘমেয়াদী" চাইলে বদলে দেব।
`);
console.log(`✓ PLAN.md (${table.length} rows) and build/timeline.json`);
