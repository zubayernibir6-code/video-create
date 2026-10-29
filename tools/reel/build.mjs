#!/usr/bin/env node
// build.mjs — a whole tools-reel from DATA (skill tools-reel). The model writes projects/<name>/reel.json (the script,
// the facts about each tool and one archetype per tool, see reel.example.json); this does everything else:
// transcribes the voice if needed, aligns the script's spelling to the voice's timing, lays out and times every
// scene, the captions, the terminal and the mascot, places every sound, writes index.html and the soundtrack
// (assets/media/mix.wav: voice EQ + ducked BGM with hit-stops + SFX), and with --plan writes PLAN.md for the plan gate.
//
//   node tools/reel/build.mjs projects/<name> [--plan | --plan=force] [--no-mix] [--check]
//     --check       validate reel.json and the voice only (fast; prints every problem in one go)
//     --plan        also write PLAN.md (only over the empty template; --plan=force overwrites)
//     --no-mix      skip the soundtrack (layout work)
//
// Then: hyperframes check → node tools/design-lint.mjs projects/<name> → snapshots → finish.mjs (skill tools-reel).
// Verified 2026-10-29 on projects/tools-reel-demo (5 tools, Kokoro test voice, a synthetic test bed).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { alignScript, norm } from "./align.mjs";
import { BASE_CSS, BOT_AT, COL, COLOR_BN, FONT_CSS, ORD_BN, PROP_FOR, TOOL_COLORS, botXY, captions, ctaScene, esc, f3, hookScene, idCard, light, mascot, monogram, terminal } from "./core.mjs";
import { ARCHETYPES, SCENE_CSS, SCHEMA, validateScene } from "./scenes.mjs";
import { buildMix } from "../screen/promo-mix.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
const bnd = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const argv = process.argv.slice(2);
const dir = path.resolve(argv.find((a) => !a.startsWith("--")) ?? ".");
const has = (f) => argv.some((a) => a === `--${f}` || a.startsWith(`--${f}=`));
const planForce = argv.includes("--plan=force");
const errors = [], warns = [];
const die = () => {
  for (const e of errors) console.error(`  ERROR  ${e}`);
  for (const w of warns) console.error(`  WARN   ${w}`);
  console.error(`\n✗ ${errors.length} error(s) — fix reel.json and run again.`);
  process.exit(1);
};

// ---- 1. reel.json -------------------------------------------------------------------------------------------
const specFile = path.join(dir, "reel.json");
if (!existsSync(specFile)) { console.error(`✗ ${specFile} not found. Copy .claude/skills/tools-reel/reel.example.json there and fill it in.`); process.exit(1); }
let R;
try { R = JSON.parse(readFileSync(specFile, "utf8").replace(/^﻿/, "")); } catch (e) { console.error(`✗ reel.json is not valid JSON: ${e.message}`); process.exit(1); }
const tools = R.tools ?? [];
const N = tools.length;
if (N < 3 || N > 7) errors.push(`tools: 3-7 tools (got ${N})`);
if (!R.hook?.line) errors.push(`hook.line: the first spoken sentence`);
if (!R.cta?.line) errors.push(`cta.line: the last spoken sentence (e.g. "Comment TOOLS, and I'll send you one link with all five.")`);
tools.forEach((t, k) => {
  const at = `tools[${k}]${t.name ? ` (${t.name})` : ""}`;
  if (!t.name || [...t.name].length > 24) errors.push(`${at}.name: 1-24 characters`);
  if (!t.intro) errors.push(`${at}.intro: the spoken line that names it ("The first is …")`);
  if (!t.body) errors.push(`${at}.body: the spoken line(s) that explain it`);
  if (t.maker && [...t.maker].length > 36) errors.push(`${at}.maker: ≤ 36 characters`);
  if (t.stat && [...t.stat].length > 32) errors.push(`${at}.stat: ≤ 32 characters`);
  if (t.install && [...t.install].length > 40) errors.push(`${at}.install: ≤ 40 characters (the terminal line)`);
  if (t.result && [...t.result].length > 40) errors.push(`${at}.result: ≤ 40 characters`);
  for (const m of validateScene(t.scene)) errors.push(`${at}.scene ${m}  · shape: ${SCHEMA[t.scene?.type] ?? Object.keys(SCHEMA).join(" | ")}`);
  if (t.stat && /\d/.test(t.stat) && !(R.facts ?? []).some((f) => f.source && String(f.claim ?? "").toLowerCase().includes(t.name.toLowerCase())))
    warns.push(`${at}.stat "${t.stat}" has no source in facts[] (claim must name the tool, source a URL): drop it or source it`);
});
if (errors.length) die();
// every tool gets its own badge letters ("Supabase MCP" and "Sentry MCP" would both be "SM")
{
  const used = new Set(tools.filter((t) => t.mono).map((t) => t.mono.toUpperCase()));
  tools.forEach((t, k) => {
    if (t.mono) return;
    const w = t.name.split(/\s+/);
    const cands = [monogram(t), w[0].slice(0, 2), w[0][0] + (w[1]?.[1] ?? w[0][2] ?? ""), `${w[0][0]}${k + 1}`];
    t.mono = cands.map((c) => c.toUpperCase()).find((c) => c.length && !used.has(c));
    used.add(t.mono);
  });
}

// ---- 2. the voice and its words --------------------------------------------------------------------------------
const lang = R.lang === "bn" ? "bn" : "en";
let voice = R.voice ? path.join(dir, R.voice) : null;
if (!voice || !existsSync(voice)) {
  const vd = path.join(dir, "assets", "voice");
  const found = existsSync(vd) ? readdirSync(vd).find((f) => /\.(wav|mp3|m4a|flac|ogg)$/i.test(f)) : null;
  if (!found) { console.error(`✗ no voice: put the voice-over in ${vd} (or set "voice" in reel.json). Without one, give the user the TTS prompt (PROMPT-PACK-tools-reel.md §৩).`); process.exit(1); }
  voice = path.join(vd, found);
}
const wordsFile = R.words ? path.join(dir, R.words) : voice.replace(/\.[^.]+$/, ".words.json");
if (!existsSync(wordsFile)) {
  console.log(`• transcribing ${path.basename(voice)} (${lang}) …`);
  const r = spawnSync("node", [path.join(WS, "tools", "transcribe.mjs"), voice, `--lang=${lang}`, `--model=${lang === "bn" ? "bengali" : "small"}`, `--out=${wordsFile.replace(/\.words\.json$/, "")}`], { stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0 || !existsSync(wordsFile)) { console.error("✗ transcription failed"); process.exit(1); }
}
const asr = JSON.parse(readFileSync(wordsFile, "utf8"));
const lines = [R.hook.line, ...tools.flatMap((t) => [t.intro, t.body]), R.cta.line];
const LCTA = lines.length - 1;
const { words, matched } = alignScript(lines, asr);
if (matched < 0.85) errors.push(`the script matches only ${Math.round(matched * 100)} % of the voice: reel.json's lines must be what the voice says (read ${path.relative(dir, wordsFile)})`);
const byLine = lines.map((_, li) => words.filter((w) => w.line === li));
byLine.forEach((ws, li) => { if (!ws.length) errors.push(`script line ${li + 1} has no words`); });
if (errors.length) die();
const first = (li) => byLine[li][0].start, last = (li) => byLine[li].at(-1).end;
const speech = last(LCTA) - first(0);
const pace = words.length / speech;
const total = +(last(LCTA) + 1.2).toFixed(2);
if (pace < 3.0) warns.push(`the voice speaks ${pace.toFixed(2)} words/s (the reference: 3.58); for this style ask for a faster read or speed it up ≤ 1.12× with atempo`);
if (total > 90) warns.push(`${total} s is longer than STYLE.md's 90 s for a Reel: cut a tool or shorten the bodies`);
if (has("check")) {
  for (const w of warns) console.log(`  WARN   ${w}`);
  console.log(`✓ reel.json OK: ${N} tools, ${total} s, ${words.length} words, ${pace.toFixed(2)} words/s, alignment ${Math.round(matched * 100)} %`);
  process.exit(0);
}

// ---- 3. timeline helpers -------------------------------------------------------------------------------------
const J = [], cues = [], rows = [], beats = [];
const js = (s) => J.push(`  ${s}`);
const identity = (k) => (k === "scale" ? 1 : k === "filter" ? "blur(0px)" : 0);
function show(sel, t, from = {}, d = 0.4, ease = "power3.out") {
  const to = { opacity: 1 };
  for (const k of Object.keys(from)) to[k] = identity(k);
  js(`tl.fromTo("${sel}", ${JSON.stringify({ opacity: 0, ...from })}, ${JSON.stringify({ ...to, duration: d, ease, immediateRender: false })}, ${f3(t)});`);
  beats.push(t);
}
const pop = (sel, t) => show(sel, t, { scale: 0.6 }, 0.45, "back.out(1.7)");
const hide = (sel, t, d = 0.3) => js(`tl.to("${sel}", { opacity: 0, duration: ${d}, ease: "power1.in" }, ${f3(t)});`);
const cue = (t, file, vol, dur) => { if (t >= 0 && t < total - 0.05) cues.push({ t: +t.toFixed(3), file, vol, ...(dur ? { dur } : {}) }); };
const row = (t, bn, text) => rows.push({ t: Math.max(0, t), bn, text: text ?? "—" });
const count = (sel, t, from, to, d, o = {}) => js(`{ const el = document.querySelector("${sel}"); const st = { v: ${from} }; tl.to(st, { v: ${to}, duration: ${d}, ease: "power2.out", onUpdate: () => { el.textContent = ${JSON.stringify(o.pre ?? "")} + fmtN(st.v, ${o.sep ? "true" : "false"}) + ${JSON.stringify(o.post ?? "")}; } }, ${f3(t)}); }`);
const flash = (t) => { js(`tl.fromTo("#flash", { opacity: 0 }, { opacity: 0.85, duration: 0.06, immediateRender: false }, ${f3(t)}); tl.to("#flash", { opacity: 0, duration: 0.38, ease: "power2.out" }, ${f3(t + 0.07)});`); beats.push(t); };
let botWhere = "perch", botProps = [];
function bot(t, where, prop) {
  if (where !== botWhere) { js(`tl.to("#bot", ${JSON.stringify({ ...botXY(BOT_AT[where]), duration: 0.5, ease: "power2.inOut" })}, ${f3(t)});`); botWhere = where; beats.push(t); }
  for (const p of botProps) hide(`#p-${p}`, t, 0.15);
  botProps = (prop ?? "").split("+").filter(Boolean);
  for (const p of botProps) js(`tl.to("#p-${p}", { opacity: 1, duration: 0.2 }, ${f3(t + 0.2)});`);
}
const paint = (t, color) => js(`tl.to("#bot .tip", { fill: "${color}", duration: 0.3 }, ${f3(t)});`);

// ---- 4. sections -----------------------------------------------------------------------------------------------
const secColor = (li) => (li === 0 ? COL.red : li === LCTA ? COL.blue : TOOL_COLORS[Math.floor((li - 1) / 2)]);
const nameToks = tools.map((t) => new Set(t.name.split(/\s+/).map(norm).filter((x) => x.length > 1)));
const kw = norm(R.keyword ?? "TOOLS");
const extra = new Set((R.emphasis ?? []).map(norm));
const capWords = words.map((w) => {
  const k = w.line === 0 || w.line === LCTA ? -1 : Math.floor((w.line - 1) / 2);
  const n = norm(w.text);
  const em = (k >= 0 && nameToks[k].has(n)) || /\d/.test(w.text) || n === kw || extra.has(n);
  return { ...w, part: w.line, color: secColor(w.line), em };
});

const sceneHtml = [], usedCss = new Set(), lightsHtml = [light("lt-h", COL.red)];
const termLines = [{ t: 0.15, kind: "cmd", text: R.terminalCommand ?? "claude" }, { t: 0.8, kind: "note", text: `resolving ${N} tools in parallel…` }];
const hitStops = [];
const voiceGaps = [...spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", voice, "-af", "silencedetect=noise=-42dB:d=0.12", "-f", "null", "-"], { encoding: "utf8" }).stderr
  .matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => ({ from: Number(m[1]), to: Number(m[2]) }));

// hook
const H0 = byLine[0];
const findIn = (ws, word) => ws.find((w) => norm(w.text).startsWith(norm(word)));
const tB = R.hook.on ? findIn(H0, R.hook.on)?.start ?? 0.9 : Math.min(0.9, first(1) - 1.6);
const banner = R.hook.banner ?? ["Don't start", `0 of ${N} tools installed`];
const hk = hookScene(tools, banner);
sceneHtml.push(hk.html);
show("#hbn", tB, { y: -24 }, 0.4); cue(tB, "whoosh-short", 0.45);
show("#hkp", tB + 0.3, { y: 30 }, 0.45);
tools.forEach((_, i) => { cue(tB + 0.32 + i * 0.1, "click-soft", 0.22); js(`tl.to("#hb${i}", { scaleX: ${f3(hk.pct[i] / 100)}, duration: ${f3(Math.max(0.6, first(1) - tB - 0.7))}, ease: "power1.out" }, ${f3(tB + 0.5)});`); });
cue(0.05, "impact-bass-1", 0.6, 0.6);
row(0, "ডট-গ্রিডের উপর নিচে টার্মিনাল, উপরে ক্যাপশন শুরু; মাসকট টার্মিনালে বসে", "—");
row(tB, `লাল ব্যানার নামে; তার নিচে ${bnd(N)}টা রঙিন প্রোগ্রেস-বার, নাম লুকানো (ধূসর দাগ)`, banner.join(" · "));

let prevScene = "#s-hook";
tools.forEach((tool, k) => {
  const color = TOOL_COLORS[k], LI = 1 + 2 * k, LB = 2 + 2 * k;
  const IW = byLine[LI], BW = byLine[LB];
  const sStart = Math.max(first(LI) - 0.12, 0.2);
  const sEnd = first(k < N - 1 ? LI + 2 : LCTA) - 0.12;
  const nameW = IW.find((w) => nameToks[k].has(norm(w.text)) || norm(w.text).startsWith(norm(tool.name.split(/\s+/)[0]))) ?? IW[Math.min(3, IW.length - 1)];
  const tName = nameW.start;
  const tCard = Math.max(sStart, tName - 0.32);
  const tMech = Math.min(Math.max(last(LI) + 0.12, tName + 1.25), sEnd - 2.0);
  // out with the old, in with the card: the old scene stays until just before the card lands (no empty stage), and
  // is gone before the card starts (no two texts at once)
  hide(prevScene, tCard - 0.2, 0.18);
  js(`tl.to("#lt-${k === 0 ? "h" : k - 1}", { opacity: 0, duration: 0.4 }, ${f3(sStart)}); tl.to("#lt-${k}", { opacity: 1, duration: 0.4 }, ${f3(sStart)});`);
  lightsHtml.push(light(`lt-${k}`, color));
  paint(sStart, color);
  bot(tCard - 0.25, "perch", null);
  if (k > 0) cue(sStart, "whoosh-cinematic", 0.3);
  sceneHtml.push(idCard(`c-${k}`, tool, color));
  show(`#c-${k}`, tCard, { scale: 0.9, filter: "blur(14px)" }, 0.45);
  cue(tCard - 0.3, "whoosh-short", 0.4); cue(tName, "impact-bass-1", 0.7, 0.6);
  hide(`#c-${k}`, tMech - 0.24, 0.2);
  // terminal
  const tCmd = tName + 0.15;
  if (tool.install) { termLines.push({ t: tCmd, kind: "cmd", text: tool.install, tool: k }); cue(tCmd + 0.05, "key-press", 0.25); cue(tCmd + 0.3, "key-press", 0.22); }
  termLines.push({ t: tCmd + (tool.install ? 0.75 : 0.3), kind: "ok", text: tool.result ?? `${tool.name} ready`, color, count: k + 1 });
  cue(tCmd + (tool.install ? 0.75 : 0.3), "click", 0.3);
  row(tCard, `${ORD_BN[k]} টুলের পরিচয়-কার্ড (${COLOR_BN[k]}) আছড়ে পড়ে; টার্মিনালে ইনস্টল আর টিক`, tool.name);
  // hit-stops: the whole mix goes silent for ≤ 0.3 s in a real gap of the voice (the reference does it after a
  // tool's name and before the next tool); no gap in the voice, no stop
  // placed inside the voice file's own measured silence (the ASR's word ends are ±0.1 s off)
  const stopIn = (a0, b0) => {
    const g = voiceGaps.find((x) => x.from < b0 + 0.15 && x.to > a0 - 0.15);
    if (!g) return;
    const a = g.from + 0.02, b = Math.min(a + 0.3, g.to - 0.02);
    if (b - a >= 0.12) hitStops.push([+a.toFixed(3), +b.toFixed(3)]);
  };
  if (k > 0) { stopIn(last(LI - 1), first(LI)); stopIn(last(LI), first(LB)); }
  // mechanism
  const sc = tool.scene, id = `m-${k}`;
  usedCss.add(sc.type);
  let cursor = tMech;
  const clamp = (t) => Math.min(Math.max(t, tMech + 0.05), sEnd - 0.35);
  const ctx = {
    id, color, t0: tMech, t1: sEnd, D: sEnd - tMech,
    at(word, frac) {
      if (word) {
        const hit = BW.find((w) => w.start >= cursor - 0.01 && norm(w.text).startsWith(norm(word)));
        if (hit) { cursor = hit.start + 0.01; return clamp(hit.start); }
        warns.push(`${tool.name}: the word "${word}" is not in its body line after ${cursor.toFixed(1)} s; timed by position instead`);
      }
      return clamp(tMech + (frac ?? 0.5) * (sEnd - tMech));
    },
    js, show, pop, hide, cue, row, count, flash, clamp,
    // a proof must stay on screen ≥ 1 s before the next tool takes over (the last body runs into the CTA)
    late: (t) => Math.max(tMech + 0.3, Math.min(t, sEnd - 1.0)),
    bot: (t, where, prop) => bot(t, where, prop === undefined ? PROP_FOR[sc.type] : prop),
  };
  sceneHtml.push(ARCHETYPES[sc.type](ctx, sc));
  prevScene = `#${id}`;
});

// cta
{
  const CW = byLine[LCTA], tC = first(LCTA) - 0.12, kwLabel = R.keyword ?? "TOOLS";
  hide(prevScene, tC - 0.22, 0.18);
  js(`tl.to("#lt-${N - 1}", { opacity: 0, duration: 0.4 }, ${f3(tC)}); tl.to("#lt-c", { opacity: 1, duration: 0.4 }, ${f3(tC)});`);
  lightsHtml.push(light("lt-c", COL.blue));
  paint(tC, COL.blue); bot(tC, "perch", null);
  sceneHtml.push(ctaScene(tools, R.handle ?? "@yourhandle", kwLabel, R.cta.dm ?? `All ${N} tools in one link:`));
  show("#s-cta", tC, {}, 0.3); show("#cbx", tC + 0.05, { y: 30 }, 0.4); cue(tC, "whoosh-cinematic", 0.3);
  termLines.push({ t: tC + 0.3, kind: "ok", text: `all ${N} tools ready`, color: COL.green });
  const tk = Math.max(findIn(CW, kwLabel)?.start ?? tC + 0.5, tC + 0.35);
  js(`tl.to("#ckw", { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "steps(${Math.max(1, [...kwLabel].length)})" }, ${f3(tk)});`);
  beats.push(tk);
  for (let i = 0; i < Math.min(5, [...kwLabel].length); i++) cue(tk + i * 0.08, "key-press", 0.22);
  const tS = tk + 0.5;
  js(`tl.fromTo("#csend", { scale: 1 }, { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, ${f3(tS)});`);
  cue(tS, "click", 0.45);
  const tD = tS + 0.25;
  show("#cdm", tD, { y: 40 }, 0.45); cue(tD, "notification", 0.45);
  const tF = Math.min(Math.max(tD + 1.0, last(LCTA) - 0.4), total - 1.0);
  pop("#cf1", tF); cue(tF, "pop", 0.3);
  const tF2 = Math.min(tF + 0.75, total - 0.3);
  hide("#cf1", tF2, 0.12); pop("#cf2", tF2 + 0.14); cue(tF2, "click", 0.4); cue(tF2 + 0.15, "chime", 0.35);
  row(tC, "কমেন্ট-বক্স আসে; টার্মিনালে সব টুল তৈরি", "—");
  row(tk, "কমেন্ট-বক্সে কিওয়ার্ড টাইপ হয়, পাঠানোর বোতাম চাপা", kwLabel);
  row(tD, `ডিএম-কার্ড আসে, ভেতরে ${bnd(N)}টা রঙিন চিপ`, R.cta.dm ?? `All ${N} tools in one link:`);
  row(tF, `"Follow for more" বোতাম, তারপর "Following"; শেষ ফ্রেম ধরে রাখা`, "Follow for more");
}

// terminal lines: scroll first (the line that leaves is hidden, so nothing sits clipped under the header), then the
// new line; commands type out character by character (JetBrains Mono at 26 px advances 15.6 px per character)
termLines.forEach((l, i) => {
  if (i >= 3) {
    js(`tl.to("#tl${i - 3}", { opacity: 0, duration: 0.1 }, ${f3(l.t - 0.34)});`);
    js(`tl.to("#tlines", { y: ${-(i - 2) * 40}, duration: 0.25, ease: "power2.out" }, ${f3(l.t - 0.28)});`);
  }
  js(`tl.to("#tl${i}", { opacity: 1, duration: 0.12 }, ${f3(l.t)});`);
  const n = [...l.text].length;
  if (l.kind === "cmd") js(`tl.to("#tl${i} .tx", { width: ${(n * 15.6 + 2).toFixed(1)}, duration: ${f3(Math.min(0.55, 0.04 * n + 0.15))}, ease: "steps(${Math.max(1, n)})" }, ${f3(l.t)});`);
  if (l.count) js(`tl.set("#cnt${l.count - 1}", { opacity: 0 }, ${f3(l.t)}); tl.set("#cnt${l.count}", { opacity: 1 }, ${f3(l.t)}); tl.to("#tbar", { scaleX: ${f3(l.count / N)}, duration: 0.4, ease: "power2.out" }, ${f3(l.t)});`);
});

// the mascot: idle bob and blinks the whole way through
js(`tl.to("#botb", { y: -6, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: ${Math.max(1, Math.floor(total / 0.5) - 1)} }, 0);`);
for (let t = 2.2; t < total - 0.5; t += 3.7) js(`tl.to("#eyes", { scaleY: 0.12, duration: 0.06, yoyo: true, repeat: 1 }, ${f3(t)});`);

// a visible change at least every 2.6 s (STYLE.md §৫): a gentle push that settles at scale 1 (CLAUDE.md §0d rule 1)
{
  const pts = [0, ...[...new Set(beats.map((b) => +b.toFixed(2)))].filter((b) => b > 0 && b < total).sort((a, b) => a - b), total];
  for (let i = 1; i < pts.length; i++) {
    let a = pts[i - 1];
    while (pts[i] - a > 2.6) {
      const t = a + Math.min(2.2, (pts[i] - a) / 2);
      js(`tl.fromTo("#stage", { scale: 0.975 }, { scale: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, ${f3(t)});`);
      cue(t, "whoosh-short", 0.18);
      row(t, "দৃশ্যে হালকা ক্যামেরা-ঠেলা (১ গুণে এসে থামে)", "—");
      a = t;
    }
  }
}

// sounds respect the hit-stops: one that would ring into a stop is cut at its start, one that starts inside it
// waits until it ends (lead_s and durations from assets/sfx/manifest.json)
{
  const man = JSON.parse(readFileSync(path.join(WS, "assets", "sfx", "manifest.json"), "utf8"));
  // buildMix starts a file lead_s before its cue time, so the audible span is [t − lead, t + (dur ?? length − lead)]
  for (const c of cues) {
    const m = man[c.file] ?? {}, lead = m.lead_s ?? 0;
    for (const [a, b] of hitStops) {
      const from = c.t - lead, to = c.t + (c.dur ?? Math.max(0.05, (m.duration ?? 1) - lead));
      if (from >= b || to <= a) continue;
      if (from >= a - 0.02 || c.t >= a) c.t = +(b + 0.01 + lead).toFixed(3);
      else c.dur = +Math.max(0.04, a - c.t).toFixed(3);
    }
  }
}

// ---- 5. the page -----------------------------------------------------------------------------------------------
const cap = captions(capWords);
js(cap.js.join("\n  "));
const css = FONT_CSS + BASE_CSS + [...usedCss].map((t) => SCENE_CSS[t]).join("\n");
const html = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${esc(R.title ?? path.basename(dir))}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${css}
    </style>
  </head>
  <body>
    <div id="root" class="${lang === "bn" ? "bn" : ""}" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${f3(total)}">
      <div id="bg"></div>
      <div id="lights">${lightsHtml.join("\n")}</div>
      <div id="stage">
${sceneHtml.join("\n")}
      </div>
      ${terminal(R.terminal ?? `claude — ~/${String(R.project ?? "my-app").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}`, termLines, N)}
      ${mascot(COL.red)}
      <div id="caps">
${cap.html}
      </div>
      <div id="flash"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const fmtN = (v, sep) => (sep ? Math.round(v).toLocaleString("en-US") : String(Math.round(v)));
      const tl = gsap.timeline({ paused: true });
      gsap.set("#lt-h", { opacity: 1 });
      gsap.set("#bot", ${JSON.stringify(botXY(BOT_AT.perch))});
${J.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(path.join(dir, "index.html"), html);
mkdirSync(path.join(dir, "build"), { recursive: true });
writeFileSync(path.join(dir, "build", "timeline.json"), JSON.stringify({ total, pace: +pace.toFixed(2), matched: +matched.toFixed(3), hitStops, cues, rows }, null, 1));

// ---- 6. the soundtrack -------------------------------------------------------------------------------------------
const musicFile = R.music?.file ? path.join(dir, R.music.file) : null;
if (musicFile && !existsSync(musicFile)) warns.push(`music.file ${R.music.file} not found: the mix has no BGM`);
if (!has("no-mix")) {
  const base = R.music?.db ?? -19, duck = base - (R.music?.duck ?? 4);
  const iv = [];
  for (const w of words) { const l = iv.at(-1); if (l && w.start - l[1] < 0.6) l[1] = w.end; else iv.push([w.start, w.end]); }
  const level = (t) => (hitStops.some(([a, b]) => t >= a && t < b) ? null : iv.some(([a, b]) => t >= a - 0.05 && t < b + 0.15) ? duck : base);
  const env = [[0, null], [0.35, base]];
  let prev = base;
  for (let t = 0.36; t < total - 1.6; t += 0.02) {
    const v = level(t);
    if (v === prev) continue;
    const r = v === null || prev === null ? 0.01 : 0.12;
    const a = +(t - r).toFixed(3);
    if (a > env.at(-1)[0]) env.push([a, prev]);
    env.push([+t.toFixed(3), v]);
    prev = v;
  }
  env.push([+(total - 1.6).toFixed(3), prev ?? base], [total, null]);
  mkdirSync(path.join(dir, "assets", "media"), { recursive: true });
  const music = musicFile && existsSync(musicFile) ? [{ file: musicFile.replace(/\\/g, "/"), at: 0, from: R.music.from ?? 0, env }] : [];
  console.log(`• mixing: voice + ${music.length ? "BGM" : "no BGM"} + ${cues.length} sounds …`);
  buildMix({ total, out: path.join(dir, "assets", "media", "mix.wav"), voice: { file: voice.replace(/\\/g, "/"), eq: true, gainDb: R.voiceGainDb ?? 0 }, music, cues, graphFile: path.join(dir, "build", "mix.graph.txt") });
}

// ---- 7. PLAN.md --------------------------------------------------------------------------------------------------
const clockBn = (t) => bnd(`${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`);
if (has("plan")) {
  const planFile = path.join(dir, "PLAN.md");
  const isTemplate = !existsSync(planFile) || readFileSync(planFile, "utf8").includes("Claude: copy this to projects/<name>/PLAN.md");
  if (!isTemplate && !planForce) warns.push("PLAN.md already filled: not overwritten (use --plan=force)");
  else {
    // rows: merge near ones, keep each ≤ 3 s by splitting at a real scene beat
    const sorted = rows.slice().sort((a, b) => a.t - b.t);
    const merged = [];
    for (const r of sorted) {
      const l = merged.at(-1);
      if (l && r.t - l.t < 0.9) { l.bn += `; ${r.bn}`; if (r.text !== "—") l.text = l.text === "—" ? r.text : `${l.text} · ${r.text}`; }
      else merged.push({ ...r });
    }
    merged[0].t = 0;
    const sceneBeats = [...new Set(beats.map((b) => +b.toFixed(1)))].sort((a, b) => a - b);
    for (let i = 0; i < merged.length; i++) {
      const end = i + 1 < merged.length ? merged[i + 1].t : total;
      if (end - merged[i].t > 3) {
        const mid = sceneBeats.filter((b) => b > merged[i].t + 1 && b < end - 1).sort((a, b) => Math.abs(a - (merged[i].t + end) / 2) - Math.abs(b - (merged[i].t + end) / 2))[0];
        merged.splice(i + 1, 0, { t: mid ?? merged[i].t + (end - merged[i].t) / 2, bn: "আরও উপাদান আসে, ক্যাপশন চলতে থাকে", text: "—" });
      }
    }
    const T = merged.map((r) => +r.t.toFixed(1)).concat(+total.toFixed(1));
    const tableRows = [];
    for (let i = 0; i < merged.length; i++) {
      if (T[i + 1] <= T[i]) continue;
      const inRow = (t) => t >= T[i] - 0.05 && t < T[i + 1] - 0.05;
      const counts = new Map();
      for (const c of cues) if (inRow(c.t)) counts.set(c.file, (counts.get(c.file) ?? 0) + 1);
      const voiceLines = lines.map((_, li) => li).filter((li) => inRow(first(li)));
      const sound = [...[...counts].map(([f, n]) => `\`${f}\`${n > 1 ? ` ×${bnd(n)}` : ""}`), ...(voiceLines.length ? [`ভয়েস ${voiceLines.map((li) => bnd(li + 1)).join(", ")}`] : [])].join(" ") || (musicFile ? "মিউজিক" : "ভয়েস চলছে");
      tableRows.push(`| ${T[i]}–${T[i + 1]} | ${merged[i].bn.replace(/\|/g, "/")} | ${String(merged[i].text).replace(/\|/g, "/")} | ${sound} |`);
    }
    const unsourced = tools.filter((t) => t.stat && /\d/.test(t.stat) && !(R.facts ?? []).some((f) => f.source && String(f.claim ?? "").toLowerCase().includes(t.name.toLowerCase())));
    const questions = [...(R.questions ?? []), ...(R.handle && R.handle !== "@yourhandle" ? [] : ["ডিএম-কার্ডে আপনার হ্যান্ডেল কী (@…)?"]), ...unsourced.map((t) => `${t.name}-এর "${t.stat}" সংখ্যাটা যাচাই করা যায়নি: রাখব, নাকি বাদ দেব?`)];
    const plan = `# প্ল্যান: ${R.title ?? path.basename(dir)}

ফরম্যাট: 9:16
দৈর্ঘ্য: ${total.toFixed(1)} সেকেন্ড
প্ল্যাটফর্ম: Instagram Reels আর Facebook Reels
ধরন: "${bnd(N)}টা টুল" রিল (tools-reel)
ভয়েস: ${R.voiceLabel ?? "রেকর্ড করা ভয়েস"} (${path.basename(voice)}), প্রতি সেকেন্ডে ${bnd(pace.toFixed(1))} শব্দ
মিউজিক: ${musicFile && existsSync(musicFile) ? path.basename(musicFile) : "নেই"}
আউটপুট: 9:16, সাথে 1:1
পুরো ভিডিও জুড়ে: ডট-গ্রিড পেছন, নিচের টার্মিনাল, ৩-শব্দের ক্যাপশন (বলা প্রতিটা শব্দ), বর্তমান টুলের রঙে স্টেজের আলো, মাসকট, ফাইনাল আওয়াজ −১৪ LUFS

## লক্ষ্য

${R.goal ?? `দর্শক জানবেন ${R.platform ?? "Claude Code"}-এর জন্য কোন ${bnd(N)}টা টুল কাজের, আর কমেন্টে ${R.keyword ?? "TOOLS"} লিখে লিংক চাইবেন।`}

## হুক (প্রথম ২ সেকেন্ড)

প্রথম কথা: "${R.hook.line}" পর্দায় ${clockBn(tB)} সেকেন্ডে লাল ব্যানার "${banner.join(" · ")}", তার নিচে ${bnd(N)}টা প্রোগ্রেস-বার, টুলের নাম লুকানো (কৌতূহল)। শুভেচ্ছা দিয়ে শুরু নয়।

## স্ক্রিপ্ট

${lines.map((l, li) => `${bnd(li + 1)}. (${clockBn(first(li))}) ${l}`).join("\n")}

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${tableRows.join("\n")}

## যা লাগবে

- ভয়েস: ${path.relative(dir, voice).replace(/\\/g, "/")} (আছে; শব্দের সময় মাপা, স্ক্রিপ্টের সাথে ${bnd(Math.round(matched * 100))}% মিল)।
- মিউজিক: ${musicFile && existsSync(musicFile) ? `${path.relative(dir, musicFile).replace(/\\/g, "/")} (আছে)` : "নেই: আপনার BGM লাগবে (PROMPT-PACK-tools-reel.md §৪)"}।
- সাউন্ড ইফেক্ট: সবই assets/sfx-এ আছে।
- ছবি: সব কোডে আঁকা। কোনো লোগো নেই: টুলের নামের লেখা বা রঙিন আদ্যক্ষর-ব্যাজ। মাসকট নিজের আঁকা পিক্সেল-বট।
- তথ্য: ${bnd((R.facts ?? []).length)}টা সূত্রসহ${unsourced.length ? `; সূত্র ছাড়া ${bnd(unsourced.length)}টা (প্রশ্নে আছে)` : ""}।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- STYLE §৫: প্রতি ২–৩ সেকেন্ডে পর্দায় কিছু বদলায়; প্রথম ২ সেকেন্ডে সবচেয়ে চমকানো কথা।
- STYLE §৬: পড়ার লেখা ১০৮০p-তে অন্তত ২৮ px, ছোট লেবেল অন্তত ২৪ px।
- STYLE §৭: প্রতি দৃশ্য বদলে শব্দ, শব্দ ঠিক ছবির মুহূর্তে; ভয়েসের নিচে মিউজিক; ফাইনাল −১৪ LUFS।
- STYLE §১৩: ভুয়া রিভিউ বা টেস্টিমোনিয়াল নয়; আসল টুলের সংখ্যা সূত্রসহ।
- LESSONS ২০২৬-১০-২৮: ক্যাপশন, টার্মিনাল আর স্টেজের আলো প্রথম ফ্রেম থেকে শেষ ফ্রেম পর্যন্ত (CLAUDE.md §০h)।
- LESSONS ২০২৬-১০-২৬: Claude-এর লোগো বা মাসকট নয়: নিজের আলাদা মাসকট।

## আপনার কাছে প্রশ্ন

${questions.length ? questions.map((q) => `- ${q}`).join("\n") : "- কোনো প্রশ্ন নেই।"}
`;
    writeFileSync(planFile, plan);
  }
}

for (const w of warns) console.log(`  WARN   ${w}`);
console.log(`✓ ${path.basename(dir)}: ${N} tools, ${total} s, ${words.length} words at ${pace.toFixed(2)} words/s, script↔voice ${Math.round(matched * 100)} %, ${cues.length} sounds, ${hitStops.length} hit-stops`);
console.log(`  wrote index.html${has("no-mix") ? "" : ", assets/media/mix.wav"}${has("plan") ? ", PLAN.md" : ""}, build/timeline.json`);
