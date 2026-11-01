#!/usr/bin/env node
// series.mjs — one episode of a "5 tools / 5 repos" Reel SERIES from DATA, in one of the series looks (REEL2–REEL6,
// tools/reel/looks/*.mjs). Same contract as build.mjs (REEL1): the model writes projects/<name>/reel.json, this does
// the rest: transcribes the voice if needed, aligns the script to it, lays out and times every element, places every
// sound, writes index.html, the soundtrack (assets/media/mix.wav) and, with --plan, PLAN.md for the plan gate.
//
//   node tools/reel/series.mjs projects/<name> [--plan | --plan=force] [--no-mix] [--check]
//
// What every look shares (the series' recognisable frame, series/github-repos/SERIES-PLAN.md §৩):
//   · the universal-reel text-safe box x 65–886, y 288–1248 (data-safe-profile, design-lint safe_zone)
//   · the badge top-left "৫টা GitHub রিপো · পর্ব N" with five dots that fill as each tool is named
//   · word captions (Hind Siliguri Bold, the spoken word lights in the look's accent) centred near 60 % (y 1092–1232)
//   · per tool: the name lands big and centred, settles into a header, 2–4 features arrive on their spoken words, a
//     proof chip; the look decides the world, the hook, the entrances, the motion language and the sounds
//   · the end: the five repos as cards (3 + 2), then HOW to message (3 numbered steps) and the keyword typed and sent
//   · "what is this for" and "how do I use it" (his brief 2026-11-01: the viewer must be crystal clear what the video is
//     for, how to use each tool, and that they should message him): an optional promise card after the hook (kicker,
//     big title, sub, 2–3 rows lit on their words), per tool an optional "কীভাবে চালাবেন" panel whose numbered steps
//     replace the features on their words, and an inbox chip "ইনবক্সে <KEYWORD>" top right from the promise to the end
//     card that pulses whenever "ইনবক্স…" is said
// reel.json (series fields on top of tools-reel's): "style": "REEL2…REEL6", "series", "episode", per tool
// "features": [{label ≤ 16, on, icon}] (2–4), "proof": {text ≤ 22, on, tone: good|warn}, optional "stat": {text, on},
// "how": {line, steps: [{label ≤ 22, on}] (2–3)}, "short" (end-card name); "promise": {line, kicker, title ≤ 18,
// sub ≤ 34, rows: [{label ≤ 24, on, icon}] (≤ 3)}; "cta": {line, heading, ask, steps: [{label ≤ 16, on, icon}] (3),
// sent}. Looks may read extra fields (look header says which). The spoken order lives in series-lines.mjs, and
// voice-script.mjs writes the TTS script from it.
// Verified 2026-11-01 on projects/gh-ep01-phone … gh-ep05-ai (GitHub series episodes 1–5), and the promise / how /
// inbox-chip / two-phase end on the same five re-voiced in his cloned voice.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { alignScript, norm } from "./align.mjs";
import { seriesLines } from "./series-lines.mjs";
import { esc, f3, icon, iconExists, monogram, rgba, svgCheck } from "./core.mjs";
import { captionPages } from "../episode/page-core.mjs";
import { buildMix } from "../screen/promo-mix.mjs";

const WS = path.resolve(import.meta.dirname, "..", "..");
export const bnd = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const ORD_BN = ["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম"];
const LOOKS = { REEL1: "reel1-terminal", REEL2: "reel2-pocket-glass", REEL3: "reel3-speedrun", REEL4: "reel4-vault", REEL5: "reel5-film-reel", REEL6: "reel6-offline-night", REEL7: "reel7-paper-desk", REEL8: "reel8-knowledge-stairs", REEL9: "reel9-alpona", REEL10: "reel10-blueprint" };
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
const len = (s) => [...String(s ?? "")].length;

// ---- 1. reel.json -------------------------------------------------------------------------------------------
const specFile = path.join(dir, "reel.json");
if (!existsSync(specFile)) { console.error(`✗ ${specFile} not found`); process.exit(1); }
let R;
try { R = JSON.parse(readFileSync(specFile, "utf8").replace(/^﻿/, "")); } catch (e) { console.error(`✗ reel.json is not valid JSON: ${e.message}`); process.exit(1); }
if (!LOOKS[R.style]) { console.error(`✗ style must be one of ${Object.keys(LOOKS).join(", ")} (REEL1 here = the terminal look on the series engine; the original REEL1 engine is tools/reel/build.mjs)`); process.exit(1); }
const { look } = await import(`./looks/${LOOKS[R.style]}.mjs`);
const tools = R.tools ?? [];
const N = tools.length;
if (N < 3 || N > 5) errors.push(`tools: 3-5 tools (got ${N}); the end card holds 3 + 2`);
if (!R.hook?.line) errors.push("hook.line: the first spoken sentence");
if (!R.cta?.line) errors.push("cta.line: the last spoken sentence");
if (!R.keyword || len(R.keyword) > 10) errors.push("keyword: the inbox word, 1-10 characters");
tools.forEach((t, k) => {
  const at = `tools[${k}]${t.name ? ` (${t.name})` : ""}`;
  if (!t.name || len(t.name) > 24) errors.push(`${at}.name: 1-24 characters`);
  if (!t.intro || !t.body) errors.push(`${at}.intro / body: the spoken lines, exactly as voiced`);
  if (t.maker && len(t.maker) > 30) errors.push(`${at}.maker: ≤ 30 characters`);
  if (!Array.isArray(t.features) || t.features.length < 2 || t.features.length > 4) errors.push(`${at}.features: 2-4 items {label, on, icon}`);
  for (const f of t.features ?? []) {
    if (!f.label || len(f.label) > 16) errors.push(`${at}.features: "${f.label}" must be 1-16 characters`);
    if (f.icon && !iconExists(f.icon)) errors.push(`${at}.features: icon "${f.icon}" is not a Lucide name (assets/icons/lucide/icons)`);
  }
  if (!t.proof?.text || len(t.proof.text) > 22) errors.push(`${at}.proof.text: 1-22 characters`);
  if (t.stat && (!t.stat.text || len(t.stat.text) > 18)) errors.push(`${at}.stat.text: 1-18 characters`);
  if (t.stat && /[0-9০-৯]/.test(t.stat.text) && !(R.facts ?? []).some((f) => f.source && String(f.claim ?? "").toLowerCase().includes(t.name.toLowerCase())))
    warns.push(`${at}.stat "${t.stat.text}" has no source in facts[]`);
  if (t.how) {
    if (!t.how.line) errors.push(`${at}.how.line: the spoken "how to use it" line`);
    if (!Array.isArray(t.how.steps) || t.how.steps.length < 2 || t.how.steps.length > 3) errors.push(`${at}.how.steps: 2-3 items {label, on}`);
    for (const s of t.how.steps ?? []) if (!s.label || len(s.label) > 22) errors.push(`${at}.how.steps: "${s.label}" must be 1-22 characters`);
  }
  for (const m of look.validate?.(t, k) ?? []) errors.push(`${at}: ${m}`);
});
if (R.promise) {
  const p = R.promise;
  if (!p.line || !p.title || len(p.title) > 18) errors.push("promise: line + title (≤ 18 characters)");
  if (p.sub && len(p.sub) > 34) errors.push("promise.sub: ≤ 34 characters");
  for (const r of p.rows ?? []) {
    if (!r.label || len(r.label) > 24) errors.push(`promise.rows: "${r.label}" must be 1-24 characters`);
    if (r.icon && !iconExists(r.icon)) errors.push(`promise.rows: icon "${r.icon}" is not a Lucide name`);
  }
  if ((p.rows ?? []).length > 3) errors.push("promise.rows: at most 3");
}
for (const s of R.cta?.steps ?? []) {
  if (!s.label || len(s.label) > 16) errors.push(`cta.steps: "${s.label}" must be 1-16 characters`);
  if (s.icon && !iconExists(s.icon)) errors.push(`cta.steps: icon "${s.icon}" is not a Lucide name`);
}
if (R.cta?.steps && R.cta.steps.length !== 3) errors.push("cta.steps: exactly 3 (page · Message · keyword)");
if (errors.length) die();
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
const lang = R.lang === "en" ? "en" : "bn";
const voiceArg = argv.find((a) => a.startsWith("--voice="))?.slice(8);
if (voiceArg && /[\\/]dry[\\/]/.test(voiceArg) && has("plan")) { console.error("✗ a dry voice (tools/reel/dry-voice.mjs) is for checking a look only: no PLAN.md from it"); process.exit(1); }
let voice = voiceArg ? path.join(dir, voiceArg) : R.voice ? path.join(dir, R.voice) : null;
if (!voice || !existsSync(voice)) {
  const vd = path.join(dir, "assets", "voice");
  const found = existsSync(vd) ? readdirSync(vd).find((f) => /\.(wav|mp3|m4a|flac|ogg)$/i.test(f)) : null;
  if (!found) { console.error(`✗ no voice in ${vd}`); process.exit(1); }
  voice = path.join(vd, found);
}
const wordsFile = R.words ? path.join(dir, R.words) : voice.replace(/\.[^.]+$/, ".words.json");
if (!existsSync(wordsFile)) {
  console.log(`• transcribing ${path.basename(voice)} (${lang}) …`);
  // Bengali: chunks of ≤ 18 s cut in pauses (tools/episode/asr_chunks.py). The whole-file transcriber decodes 30-s
  // windows and the Bengali fine-tune can stop early inside one: on episode 3 it lost ~8 s of speech at a window's
  // end and the alignment fell to 73 % (2026-11-01).
  const r = lang === "bn"
    ? spawnSync(path.join(WS, "tools", "pyenv", "Scripts", "python.exe"), ["-I", path.join(WS, "tools", "episode", "asr_chunks.py"), voice, wordsFile, "--max-chunk", "18"], { stdio: ["ignore", "ignore", "inherit"] })
    : spawnSync("node", [path.join(WS, "tools", "transcribe.mjs"), voice, `--lang=${lang}`, "--model=small", `--out=${wordsFile.replace(/\.words\.json$/, "")}`], { stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0 || !existsSync(wordsFile)) { console.error("✗ transcription failed"); process.exit(1); }
}
const asr = JSON.parse(readFileSync(wordsFile, "utf8"));
const { lines, tool: lineTool, L: LN } = seriesLines(R);
const LCTA = LN.cta;
const { words, matched } = alignScript(lines, asr);
// a stretch the transcriber garbled (an English name heard as noise) comes back as words squeezed to 0 s next to one
// word stretched over seconds: spread such a run over the time between its good neighbours, by length
{
  const good = (w) => w.end - w.start >= 0.05 && w.end - w.start <= 1.0;
  for (let i = 0; i < words.length; ) {
    if (good(words[i])) { i++; continue; }
    let j = i;
    while (j < words.length && !good(words[j])) j++;
    if (j - i >= 2) {
      const a = i > 0 ? words[i - 1].end : words[i].start, b = j < words.length ? words[j].start : words[j - 1].end;
      const L = words.slice(i, j).map((w) => [...w.text].length + 2), sum = L.reduce((x, y) => x + y, 0);
      let t = a;
      for (let k = i; k < j; k++) { const d = ((b - a) * L[k - i]) / sum; words[k].start = +t.toFixed(3); words[k].end = +(t + d * 0.9).toFixed(3); t += d; }
    }
    i = j;
  }
}
const minMatch = R.minMatch ?? 0.85;
if (matched < minMatch) errors.push(`the script matches only ${Math.round(matched * 100)} % of the voice (minMatch ${minMatch}): reel.json's lines must be what the voice says (read ${path.relative(dir, wordsFile)})`);
{
  // a long run of script words with no spoken partner = the transcriber dropped a stretch (or the voice skipped it):
  // their caption times would be guesses spread over the gap
  let run = [], worst = [];
  for (const w of words) { if (w.guessed) { run.push(w); if (run.length > worst.length) worst = run.slice(); } else run = []; }
  if (worst.length >= 12) errors.push(`${worst.length} script words in a row have no spoken match (${worst[0].text} … ${worst.at(-1).text}, ~${worst[0].start.toFixed(1)} s): the transcript lost that stretch (re-run tools/episode/asr_chunks.py with --max-chunk 18) or the voice skipped it (listen there)`);
}
const byLine = lines.map((_, li) => words.filter((w) => w.line === li));
byLine.forEach((ws, li) => { if (!ws.length) errors.push(`script line ${li + 1} has no words`); });
if (errors.length) die();
const first = (li) => byLine[li][0].start, last = (li) => byLine[li].at(-1).end;
const speech = last(LCTA) - first(0);
const pace = words.length / speech;
const total = +(last(LCTA) + 1.3).toFixed(2);
if (total > 90) warns.push(`${total} s is longer than STYLE.md's 90 s for a Reel`);
if (has("check")) {
  for (const w of warns) console.log(`  WARN   ${w}`);
  console.log(`✓ reel.json OK (${R.style}): ${N} tools, ${total} s, ${words.length} words, ${pace.toFixed(2)} words/s, alignment ${Math.round(matched * 100)} %`);
  process.exit(0);
}

// ---- 3. timeline helpers (same contract as build.mjs) ---------------------------------------------------------
const J = [], P = [], cues = [], rows = [], beats = [];
const pre = (s) => P.push(`      ${s}`); // gsap.set before the timeline: the state at frame 0 (a tl.set at 0 does not render there)
const js = (s) => J.push(`  ${s}`);
const identity = (k) => (k === "scale" || k === "scaleX" || k === "scaleY" ? 1 : 0);
// every entrance starts hidden at frame 0, whatever the CSS says (preflight shown_early: the REEL3 hook window was on
// screen before its entrance at 0.1 s and blinked out and in again)
const preHidden = new Set();
function show(sel, t, from = {}, d = 0.4, ease = "power3.out") {
  if (t > 0.001 && !preHidden.has(sel)) { preHidden.add(sel); P.push(`      gsap.set("${sel}", { opacity: 0 });`); }
  const to = { opacity: 1 };
  for (const k of Object.keys(from)) if (k !== "opacity") to[k] = identity(k);
  js(`tl.fromTo("${sel}", ${JSON.stringify({ opacity: 0, ...from })}, ${JSON.stringify({ ...to, duration: d, ease, immediateRender: false })}, ${f3(t)});`);
  beats.push(t);
}
const pop = (sel, t, d = 0.5) => show(sel, t, { scale: 0.55 }, d, "back.out(1.8)");
const hide = (sel, t, d = 0.3, to = {}) => js(`tl.to("${sel}", ${JSON.stringify({ opacity: 0, ...to, duration: d, ease: "power2.in" })}, ${f3(t)});`);
const cue = (t, file, vol, dur) => { if (file && t >= 0 && t < total - 0.05) cues.push({ t: +t.toFixed(3), file, vol, ...(dur ? { dur } : {}) }); };
const row = (t, bn, text) => rows.push({ t: Math.max(0, t), bn, text: text ?? "—" });
const count = (sel, t, from, to, d, o = {}) => js(`{ const el = document.querySelector("${sel}"); const st = { v: ${from} }; tl.to(st, { v: ${to}, duration: ${d}, ease: "power2.out", onUpdate: () => { el.textContent = ${JSON.stringify(o.pre ?? "")} + bnN(st.v) + ${JSON.stringify(o.post ?? "")}; } }, ${f3(t)}); }`);
const flash = (t, a = 0.8) => { js(`tl.fromTo("#flash", { opacity: 0 }, { opacity: ${a}, duration: 0.06, immediateRender: false }, ${f3(t)}); tl.to("#flash", { opacity: 0, duration: 0.4, ease: "power2.out" }, ${f3(t + 0.07)});`); beats.push(t); };
const findIn = (ws, word) => ws.find((w) => norm(w.text).startsWith(norm(word)));

const C = look.colors;
const toolColor = (k) => tools[k].color ?? C.tool[k % C.tool.length];
const ctx = { R, tools, N, total, lang, LN, colors: C, toolColor, js, pre, show, pop, hide, cue, row, count, flash, beats, f3, esc, icon, rgba, svgCheck, bnd, byLine, first, last, findIn, norm, ORD_BN };

// ---- 4. hook ---------------------------------------------------------------------------------------------------
const tHookEnd = first(LN.promise ?? LN.tools[0].intro) - 0.15;
const hookHtml = look.hook(ctx, { t0: 0, t1: tHookEnd, words: byLine[0], line: R.hook.line });
const kw = R.keyword;
const isInbox = (w) => norm(w.text).startsWith(norm("ইনবক্স"));

// ---- 5. tools --------------------------------------------------------------------------------------------------
const nameToks = tools.map((t) => new Set(t.name.split(/[\s+]+/).map(norm).filter((x) => x.length > 1)));
const toolHtml = [];
const T = [];
tools.forEach((tool, k) => {
  const color = toolColor(k), { intro: LI, body: LB, how: LH } = LN.tools[k];
  const IW = byLine[LI], BW = byLine[LB];
  const sStart = Math.max(first(LI) - 0.15, 0.3);
  const sEnd = first(k < N - 1 ? LN.tools[k + 1].intro : LCTA) - 0.12;
  // with a "how" line the features and the proof belong to the body: they finish before the steps take their place
  const tHow = LH != null ? first(LH) - 0.1 : null;
  const bEnd = tHow ?? sEnd;
  const nameW = IW.find((w) => nameToks[k].has(norm(w.text)) || norm(w.text).startsWith(norm(tool.name.split(/\s+/)[0]))) ?? IW[Math.min(1, IW.length - 1)];
  const tName = nameW.start;
  const tCard = Math.max(sStart + 0.05, tName - 0.3);
  const f0 = tool.features?.[0]?.on && BW.find((w) => norm(w.text).startsWith(norm(tool.features[0].on)));
  const tSettle = Math.min(Math.max(tCard + 1.0, last(LI) + 0.1, f0 ? f0.start - 0.15 : 0), bEnd - 2.2, tCard + 3.0);
  let cursor = first(LB) - 0.3;
  const clamp = (t) => Math.min(Math.max(t, tSettle + 0.15), bEnd - 0.5);
  const at = (word, frac) => {
    if (word) {
      const hit = BW.find((w) => w.start >= cursor - 0.01 && norm(w.text).startsWith(norm(word)));
      if (hit) { cursor = hit.start + 0.01; return clamp(hit.start - 0.05); }
      warns.push(`${tool.name}: the word "${word}" is not in its body line after ${cursor.toFixed(1)} s; timed by position instead`);
    }
    return clamp(tSettle + (frac ?? 0.5) * (bEnd - tSettle));
  };
  // stat and proof may sit anywhere in the body: found from the start, not after the features' cursor
  const atFree = (word, frac) => {
    const hit = word && BW.find((w) => w.start >= tSettle - 0.4 && norm(w.text).startsWith(norm(word)));
    if (word && !hit) warns.push(`${tool.name}: the word "${word}" is not in its body line; timed by position instead`);
    return hit ? clamp(hit.start - 0.05) : clamp(tSettle + (frac ?? 0.5) * (bEnd - tSettle));
  };
  const tt = { k, color, LI, LB, LH, sStart, sEnd, bEnd, tHow, tName, tCard, tSettle, at, atFree, late: (t) => Math.max(tSettle + 0.3, Math.min(t, bEnd - (tHow != null ? 0.7 : 1.1))) };
  T.push(tt);
  // markup: header (badge + name + maker + stat), features, proof — skinned by the look's css
  // a name with a long unbreakable chunk ("free-programming-books") broke into 3 lines at hyphens: its font shrinks
  // until the longest chunk fits beside the badge (never under 32 px; names with spaces wrap at the spaces instead)
  const nmPx = (() => {
    const L = look.layout ?? {}, base = L.nm ?? 50, avail = (L.inner ?? 700) - (L.mono ?? 88) - 24;
    const chunk = Math.max(...tool.name.split(/\s+/).map((w) => [...w].length));
    return chunk * 0.6 * base > avail ? Math.max(32, Math.floor(avail / (0.6 * chunk))) : base;
  })();
  tool.nmPx = nmPx;
  const nm = tool.name.split(/\s+/);
  const name = nm.length > 1 ? `${esc(nm.slice(0, -1).join(" "))} <em>${esc(nm.at(-1))}</em>` : esc(tool.name);
  const fx = tool.features.map((f, i) => `<div class="fx" id="fx${k}_${i}"><span class="fi">${f.icon ? icon(f.icon, look.fxIcon ?? 34, color, 2.4) : svgCheck(30, color, 3.2)}</span><span class="fl">${esc(f.label)}</span>${look.fxExtra?.(k, i) ?? ""}</div>`).join("");
  const proofIcon = tool.proof.tone === "warn" ? icon("triangle-alert", 30, C.warn ?? "#F9AD26", 2.4) : svgCheck(30, C.good ?? "#30D28E", 3.4);
  toolHtml.push(`<div class="tool" id="t${k}" style="--c:${color};--cb:${rgba(color, 0.16)};--cg:${rgba(color, 0.4)}">
  <div class="hd" id="hd${k}"><div class="mono" id="mono${k}">${esc(tool.mono)}</div><div class="nmw"><div class="nm"${nmPx !== (look.layout?.nm ?? 50) ? ` style="font-size:${nmPx}px"` : ""}>${name}</div>${tool.maker ? `<div class="mk">${esc(tool.maker)}</div>` : ""}${tool.stat ? `<div class="st" id="st${k}">${icon("star", 26, color, 2.4)}<span>${esc(tool.stat.text)}</span></div>` : ""}</div></div>
  <div class="bx"><div class="fxs" id="fxs${k}">${fx}</div>
  <div class="pf ${tool.proof.tone === "warn" ? "warn" : "good"}" id="pf${k}">${proofIcon}<span>${esc(tool.proof.text)}</span></div>${tool.how ? `
  <div class="hws" id="hws${k}"><div class="hwk">${icon("list-checks", 30, color, 2.4)}<span>${esc(tool.how.title ?? R.howTitle ?? "কীভাবে চালাবেন")}</span></div>${tool.how.steps.map((s, i) => `<div class="hw" id="hw${k}_${i}"><span class="hn">${bnd(i + 1)}</span><span class="hl">${esc(s.label)}</span></div>`).join("")}</div>` : ""}</div>
  ${look.toolExtra?.(ctx, k) ?? ""}
</div>`);
});

// the promise: what this video is for, in the look's own card, while the hook's last visual leaves
let tChip = T[0].tCard;
if (R.promise) {
  const p = R.promise, PW = byLine[LN.promise], tP = first(LN.promise) - 0.15, tOut = T[0].tCard - 0.25;
  look.hookOut(ctx, tP + 0.05);
  toolHtml.unshift(`<div class="tool pr" id="tP" style="--c:${C.accent};--cb:${rgba(C.accent, 0.16)};--cg:${rgba(C.accent, 0.4)}">
  <div class="prk">${esc(p.kicker ?? "এই ভিডিওতে")}</div><div class="prt" id="prt">${esc(p.title)}</div>${p.sub ? `<div class="prs" id="prs">${esc(p.sub)}</div>` : ""}
  <div class="prl">${(p.rows ?? []).map((r, i) => `<div class="prr" id="prr${i}"><span class="fi">${r.icon ? icon(r.icon, 30, C.accent, 2.4) : svgCheck(28, C.accent, 3.2)}</span><span>${esc(r.label)}</span></div>`).join("")}</div>
</div>`);
  // the card cuts in (no opacity fade: a fading title measured 1.1:1 contrast mid-fade on REEL7) and springs into place
  pre(`gsap.set("#tP", { opacity: 0 });`);
  js(`tl.set("#tP", { opacity: 1 }, ${f3(tP + 0.1)}); tl.fromTo("#tP", { y: 50, scale: 0.95 }, { y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)", immediateRender: false }, ${f3(tP + 0.1)});`);
  beats.push(tP + 0.1);
  js(`tl.fromTo("#prt", { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "back.out(1.8)", immediateRender: false }, ${f3(tP + 0.1)});`);
  cue(tP + 0.1, "whoosh-short", 0.35); cue(tP + 0.2, look.sfx.name, 0.45);
  if (p.sub) show("#prs", tP + 0.45, { y: 16 }, 0.4);
  row(tP, "হুক সরে যায়; কার্ডে বড় করে লেখা ভিডিওটা কী নিয়ে", `${p.kicker ?? "এই ভিডিওতে"}: ${p.title}${p.sub ? ` · ${p.sub}` : ""}`);
  let cur = tP;
  (p.rows ?? []).forEach((r, i) => {
    const hit = r.on && PW.find((w) => w.start >= cur && norm(w.text).startsWith(norm(r.on)));
    if (r.on && !hit) warns.push(`promise: the word "${r.on}" is not in the promise line; timed by position instead`);
    if (hit) cur = hit.start + 0.01;
    const t = Math.min(Math.max(hit ? hit.start - 0.08 : tP + 0.8 + i * 0.6, tP + 0.7 + i * 0.3), tOut - 0.5);
    show(`#prr${i}`, t, { x: -36 }, 0.4, "back.out(1.6)");
    cue(t, look.sfx.feature, look.sfx.featureVol ?? 0.3);
    row(t, "প্রতিশ্রুতির একটা সারি জ্বলে", r.label);
    if (r.on && isInbox({ text: r.on })) tChip = t + 0.15;
  });
  js(`tl.to("#tP", { y: -80, opacity: 0, duration: 0.3, ease: "power2.in" }, ${f3(tOut)});`);
  cue(tOut, "whoosh-short", 0.25);
}

// schedule: the look's entrance, the shared settle + features + proof (+ how to use it), the look's exit
tools.forEach((tool, k) => {
  const tt = T[k];
  const prevOut = k === 0 ? tt.tCard - 0.05 : tt.tCard - 0.22;
  if (k === 0) { if (!R.promise) look.hookOut(ctx, prevOut); } else look.exit(ctx, T[k - 1], prevOut);
  look.enter(ctx, tt, { prevOut });
  js(`tl.fromTo("#mono${k}", { scale: 0.4, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2)", immediateRender: false }, ${f3(tt.tCard + 0.05)});`);
  pre(`gsap.set("#mono${k}", { scale: 0.4, rotation: -25 });`); // its start state before the card shows (preflight snap)
  // the name lands centred and large, then settles into the header (ends at scale 1: CLAUDE.md §0d rule 1)
  // grown and centred in the card before it settles: the header hugs its text (width: fit-content, origin at its left
  // edge), its width is estimated from the text (Inter ≈ 0.6 em per character, Hind ≈ 0.52 em), and the growth is
  // capped so the grown header stays inside the card (design-lint card_straddle / safe_zone caught the full-width
  // version on REEL3, 2026-11-01)
  const hdW = (() => {
    const L = look.layout ?? {}, inner = L.inner ?? 700, mono = L.mono ?? 88, px = tool.nmPx ?? L.nm ?? 50;
    const text = Math.max([...tool.name].length * 0.6 * px, [...(tool.maker ?? "")].length * 0.52 * 30, tool.stat ? [...tool.stat.text].length * 0.52 * 28 + 36 : 0);
    const w = Math.min(inner, mono + 24 + text);
    const sc = Math.max(1, Math.min(look.settleScale ?? 1.2, (0.94 * inner) / w));
    return { sc: +sc.toFixed(3), x: +Math.max(0, (inner - w * sc) / 2).toFixed(1) };
  })();
  js(`tl.fromTo("#hd${k}", { x: ${hdW.x}, y: ${look.settleDy ?? 230}, scale: ${hdW.sc} }, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.inOut", immediateRender: false }, ${f3(tt.tSettle - 0.6)});`);
  pre(`gsap.set("#hd${k}", { x: ${hdW.x}, y: ${look.settleDy ?? 230}, scale: ${hdW.sc}, transformOrigin: "0% 50%" });`);
  beats.push(tt.tSettle - 0.6);
  cue(tt.tName, look.sfx.name, look.sfx.nameVol ?? 0.6, look.sfx.nameDur);
  row(tt.tCard, `${ORD_BN[k]} রিপো: ${look.plan.enter(k, tool)}`, tool.name);
  if (tool.stat) {
    const ts = tool.stat.on ? tt.atFree(tool.stat.on) : tt.tSettle + 0.2;
    show(`#st${k}`, ts, { x: -20 }, 0.35); cue(ts, look.sfx.stat ?? "ping", 0.3);
    row(ts, "নামের নিচে প্রমাণের সংখ্যা জ্বলে ওঠে", tool.stat.text);
  }
  tool.features.forEach((f, i) => {
    const t = tt.at(f.on, (i + 0.5) / (tool.features.length + 1));
    show(`#fx${k}_${i}`, t, look.fxFrom ?? { x: 50 }, 0.45, look.fxEase ?? "back.out(1.6)");
    cue(t, look.sfx.feature, look.sfx.featureVol ?? 0.3);
    look.onFeature?.(ctx, tt, i, t);
    row(t, look.plan.feature(k, i, f), f.label);
  });
  const tp = tt.late(tool.proof.on ? tt.atFree(tool.proof.on, 0.85) : tt.sEnd - 1.4);
  show(`#pf${k}`, tp, look.pfFrom ?? { y: 30, scale: 0.9 }, 0.45, "back.out(1.7)");
  cue(tp, tool.proof.tone === "warn" ? look.sfx.warn ?? "error" : look.sfx.proof, look.sfx.proofVol ?? 0.4, tool.proof.tone === "warn" ? 0.7 : undefined);
  look.onProof?.(ctx, tt, tp);
  row(tp, look.plan.proof(k, tool), tool.proof.text);
  // how to use it: the features and the proof step aside, numbered steps land on their spoken words
  if (tool.how) {
    const tw = Math.max(tt.tHow, tp + 0.6), HW = byLine[tt.LH];
    hide(`#fxs${k}`, tw - 0.05, 0.25, { y: -20 }); hide(`#pf${k}`, tw - 0.05, 0.25, { y: -10 });
    show(`#hws${k}`, tw + 0.12, { y: 24 }, 0.4);
    cue(tw, "whoosh-short", 0.22);
    row(tw, "ফিচারগুলো সরে যায়, \"কীভাবে চালাবেন\" প্যানেল আসে", tool.how.title ?? R.howTitle ?? "কীভাবে চালাবেন");
    let cur = tw - 0.1;
    tool.how.steps.forEach((s, i) => {
      const hit = s.on && HW.find((w) => w.start >= cur && norm(w.text).startsWith(norm(s.on)));
      if (s.on && !hit) warns.push(`${tool.name}: the how-step word "${s.on}" is not in its how line; timed by position instead`);
      if (hit) cur = hit.start + 0.01;
      const t = Math.min(Math.max(hit ? hit.start - 0.08 : tw + 0.5 + (i * (tt.sEnd - tw - 1)) / tool.how.steps.length, tw + 0.35 + i * 0.3), tt.sEnd - 0.45);
      show(`#hw${k}_${i}`, t, { x: -40 }, 0.4, "back.out(1.6)");
      js(`tl.fromTo("#hw${k}_${i} .hn", { scale: 0.3 }, { scale: 1, duration: 0.4, ease: "back.out(2.2)", immediateRender: false }, ${f3(t)});`);
      cue(t, look.sfx.feature, look.sfx.featureVol ?? 0.3);
      row(t, `${bnd(i + 1)} নম্বর ধাপ আসে`, s.label);
    });
  }
  // the badge dot for this tool
  js(`tl.to("#bd${k}", { backgroundColor: "${tt.color}", scale: 1, boxShadow: "0 0 14px ${rgba(tt.color, 0.8)}", duration: 0.3 }, ${f3(tt.tName)});`);
});

// ---- 6. the end: five cards (3 + 2) and the inbox keyword ----------------------------------------------------------
const CW = byLine[LCTA], tC = first(LCTA) - 0.12;
{
  look.exit(ctx, T[N - 1], tC - 0.2);
  const cards = tools.map((t, k) => `<div class="ec" id="ec${k}" style="--c:${toolColor(k)};--cb:${rgba(toolColor(k), 0.16)}"><div class="emono">${esc(t.mono)}</div><div class="enm">${esc(t.short ?? t.name)}</div></div>`);
  const tk = Math.max(findIn(CW, kw)?.start ?? (last(LCTA) - 0.5), tC + 1.0);
  // phase A: the five cards; phase B: how to message (3 numbered steps on their words), the box, the keyword sent
  const steps = R.cta.steps ?? [{ label: "পেজে যান", on: "পেজে", icon: "house" }, { label: "Message চাপুন", on: "Message", icon: "message-circle" }, { label: `লিখুন ${kw}`, on: "লিখুন", icon: "keyboard" }];
  let cur = tC;
  const stepT = steps.map((s, i) => {
    const hit = s.on && CW.find((w) => w.start >= cur && norm(w.text).startsWith(norm(s.on)));
    if (s.on && !hit) warns.push(`cta: the step word "${s.on}" is not in the cta line; timed by position instead`);
    if (hit) cur = hit.start + 0.01;
    return hit ? hit.start - 0.08 : null;
  });
  const tB = Math.min(Math.max(tC + 2.4, (stepT[0] ?? tC + 3) - 0.5), tk - 1.3);
  toolHtml.push(`<div id="cta"><div class="cph" id="ctaA"><div class="eh" id="eh">${esc(R.cta.heading ?? `${bnd(N)}টা রিপো এক নজরে`)}</div>
  <div class="erow">${cards.slice(0, 3).join("")}</div><div class="erow">${cards.slice(3).join("")}</div></div>
  <div class="cph" id="ctaB"><div class="eh" id="eh2">${esc(R.cta.ask ?? "লিংক আর বাংলা গাইড পেতে")}</div>
    <div class="csr">${steps.map((s, i) => `<div class="cs" id="cs${i}"><span class="csn">${bnd(i + 1)}</span><span class="csi">${icon(s.icon ?? "circle-check", 44, C.accent, 2.4)}</span><span class="csl">${esc(s.label)}</span></div>`).join("")}</div>
    <div class="ibox" id="ibx"><span class="ikw" id="ikw">${esc(kw)}</span><i class="icar" id="icar"></i><span class="isend" id="isend">${icon("send", 34, "#FFFFFF", 2.6)}</span></div>
    <div class="isent" id="isent">${svgCheck(26, C.good ?? "#30D28E", 3.6)}<span>${esc(R.cta.sent ?? "গাইড পাঠানো হবে")}</span></div></div></div>`);
  look.cta?.(ctx, tC);
  show("#cta", tC, {}, 0.3);
  show("#eh", tC + 0.05, { y: -20 }, 0.4);
  tools.forEach((_, k) => { const t = tC + 0.15 + k * 0.13; show(`#ec${k}`, t, { y: 70, scale: 0.85 }, 0.5, "back.out(1.6)"); cue(t, look.sfx.card ?? "pop", 0.26); });
  row(tC, `শেষ পর্দা: ${bnd(N)}টা রিপোর কার্ড পাশাপাশি (৩ + ২) আসে`, R.cta.heading ?? `${bnd(N)}টা রিপো এক নজরে`);
  hide("#ctaA", tB - 0.05, 0.3, { y: -40 });
  // B comes in once A has gone (A fades over 0.3 s): no moment with both texts on screen (check content_overlap)
  show("#ctaB", tB + 0.26, {}, 0.01); show("#eh2", tB + 0.28, { y: -20 }, 0.4);
  cue(tB, "whoosh-short", 0.3);
  row(tB, "কার্ডগুলো সরে যায়; ইনবক্সে মেসেজ করার ৩টা ধাপ আসে", R.cta.ask ?? "লিংক আর বাংলা গাইড পেতে");
  steps.forEach((s, i) => {
    const t = Math.min(Math.max(stepT[i] ?? tB + 0.6 + i * 0.7, tB + 0.45 + i * 0.25), tk - 0.1);
    show(`#cs${i}`, t, { y: 50, scale: 0.85 }, 0.45, "back.out(1.7)");
    js(`tl.fromTo("#cs${i} .csn", { scale: 0.3 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)", immediateRender: false }, ${f3(t)});`);
    cue(t, look.sfx.card ?? "pop", 0.3);
    row(t, `মেসেজের ${bnd(i + 1)} নম্বর ধাপ আসে`, s.label);
  });
  const tI = Math.max(tB + 0.6, Math.min(tk - 0.9, (stepT[2] ?? tk) - 0.5));
  show("#ibx", tI, { y: 30 }, 0.4); cue(tI, "whoosh-short", 0.22);
  js(`tl.fromTo("#icar", { opacity: 1 }, { opacity: 0, duration: 0.01, repeat: ${Math.max(1, Math.floor((total - tI) / 0.45))}, repeatDelay: 0.44, yoyo: true, immediateRender: false }, ${f3(tI + 0.3)});`);
  js(`tl.fromTo("#ikw", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: ${f3(Math.min(0.6, 0.1 * len(kw) + 0.1))}, ease: "steps(${Math.max(1, len(kw))})", immediateRender: false }, ${f3(tk)});`);
  pre(`gsap.set("#ikw", { clipPath: "inset(0 100% 0 0)" });`);
  beats.push(tk);
  for (let i = 0; i < Math.min(6, len(kw)); i++) cue(tk + i * 0.09, "key-press", 0.24);
  const tS = Math.min(tk + 0.75, total - 0.9);
  js(`tl.fromTo("#isend", { scale: 1 }, { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, ${f3(tS)});`);
  cue(tS, "click", 0.4);
  show("#isent", tS + 0.2, { y: 14 }, 0.35); cue(tS + 0.2, "notification", 0.4);
  row(tk, "মেসেজ-বক্সে কিওয়ার্ড টাইপ হয়, পাঠানোর বোতাম চাপা, টিক", kw);
}

// ---- 6b. the inbox chip: "ইনবক্সে <KEYWORD>" top right from the promise (or the first repo) to the end card --------
{
  show("#ichip", tChip, { x: 40, scale: 0.9 }, 0.45, "back.out(1.7)");
  cue(tChip, "ping", 0.28);
  row(tChip, `উপরে ডানে "ইনবক্সে ${kw}" চিহ্ন আসে, শেষ পর্দা পর্যন্ত থাকে`, `ইনবক্সে ${kw}`);
  for (const w of words) {
    if (w.line === LCTA || !isInbox(w) || w.start < tChip + 0.5 || w.start > tC - 0.8) continue;
    js(`tl.fromTo("#ichip", { scale: 1 }, { scale: 1.14, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, ${f3(w.start - 0.05)});`);
    cue(w.start - 0.05, "ping", 0.22);
  }
  hide("#ichip", tC - 0.2, 0.3);
}

// ---- 7. a visible change at least every 2.6 s: a gentle push that settles at scale 1 ---------------------------
{
  const pts = [0, ...[...new Set(beats.map((b) => +b.toFixed(2)))].filter((b) => b > 0 && b < total).sort((a, b) => a - b), total];
  let lastPush = -9;
  for (let i = 1; i < pts.length; i++) {
    let a = pts[i - 1];
    while (pts[i] - a > 2.6) {
      const t = a + Math.min(2.2, (pts[i] - a) / 2);
      if (t - 0.4 < lastPush + 0.85) { a = t; continue; } // never start a breath before the last one has settled
      lastPush = t;
      // a breath, not a snap: ease out to 0.975, then settle back on 1 (preflight "snap" caught the jump, 2026-11-01)
      js(`tl.fromTo("#stage", { scale: 1 }, { scale: 0.975, duration: 0.38, ease: "sine.inOut", immediateRender: false }, ${f3(t - 0.4)}); tl.fromTo("#stage", { scale: 0.975 }, { scale: 1, duration: 0.8, ease: "power2.out", immediateRender: false }, ${f3(t)});`);
      cue(t, look.sfx.push ?? "whoosh-short", 0.16);
      row(t, "দৃশ্যে হালকা ক্যামেরা-ঠেলা (১ গুণে এসে থামে)", "—");
      a = t;
    }
  }
}

// ---- 8. captions ---------------------------------------------------------------------------------------------------
const capWords = words.map((w) => {
  const k = lineTool[w.line];
  const n = norm(w.text);
  const em = (k >= 0 && nameToks[k].has(n)) || /[0-9০-৯]/.test(w.text) || n === norm(R.keyword) || (R.emphasis ?? []).map(norm).includes(n);
  return { ...w, part: w.line, em, color: k >= 0 ? toolColor(k) : C.accent };
});
const pages = captionPages(capWords, { maxWords: 3, minWords: 2, maxChars: 20, gapBreak: 0.45 });
let capHtml = "", wi = 0;
pages.forEach((p, i) => {
  const next = pages[i + 1];
  const on = Math.max(0, p[0].start - 0.1);
  let off = p.at(-1).end + 0.4;
  if (next) off = Math.min(off, next[0].start - 0.12);
  capHtml += `<div class="cp" id="cp${i}">${p.map((w) => { w.id = `cw${wi++}`; return `<span class="cw${w.em ? " em" : ""}" id="${w.id}"${w.em ? ` style="--wc:${w.color}"` : ""}>${esc(w.text)}</span>`; }).join(" ")}</div>\n`;
  js(`tl.set("#cp${i}", { opacity: 1 }, ${f3(on)}); tl.set("#cp${i}", { opacity: 0 }, ${f3(off)});`);
  p.forEach((w, k) => {
    const t = Math.max(on + 0.01, w.start - 0.06);
    js(`tl.to("#${w.id}", { opacity: 1, color: "${w.em ? w.color : C.capOn}", scale: 1.06, duration: 0.1, ease: "power1.out" }, ${f3(t)});`);
    const nx = p[k + 1];
    if (nx) js(`tl.to("#${w.id}", { color: "${w.em ? w.color : C.capDone}", scale: 1, duration: 0.12 }, ${f3(Math.max(t + 0.12, nx.start - 0.06))});`);
  });
});

// ---- 9. the page ---------------------------------------------------------------------------------------------------
const FONT_CSS = `
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "JetBrains Mono"; font-weight: 100 800; src: url("assets/fonts/JetBrainsMono-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Baloo Da 2"; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }`;
const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
const BASE_CSS = `
body { margin: 0; background: ${C.bg}; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${C.bg}; font-family: ${S}; color: ${C.ink}; }
#world { position: absolute; inset: 0; }
#stage { position: absolute; left: 65px; top: 372px; width: 821px; height: 690px; transform-origin: 50% 50%; }
.tool, #cta, .hook { position: absolute; inset: 0; opacity: 0; }
.mono { flex: none; display: flex; align-items: center; justify-content: center; font: 900 34px/1 ${S}; color: var(--c); }
.hd { position: relative; display: flex; align-items: center; gap: 24px; width: fit-content; max-width: 100%; align-self: flex-start; transform-origin: 0% 50%; }
.nm { font: 900 54px/1.08 ${S}; color: #FFFFFF; text-wrap: balance; }
.nm em { font-style: normal; color: var(--c); }
.mk { font: 700 30px/1.3 ${B}; color: ${C.muted}; margin-top: 6px; text-wrap: balance; }
.st { display: inline-flex; align-items: center; gap: 10px; margin-top: 12px; font: 700 28px/1.2 ${B}; color: #FFFFFF; opacity: 0; }
.fxs { position: relative; display: flex; flex-direction: column; }
.fx { position: relative; display: flex; align-items: center; gap: 20px; opacity: 0; }
.fx .fi { flex: none; display: flex; align-items: center; justify-content: center; }
.fx .fl { font: 700 34px/1.3 ${B}; color: #FFFFFF; white-space: nowrap; }
.pf { position: relative; display: inline-flex; align-items: center; gap: 14px; font: 700 32px/1.25 ${B}; color: #FFFFFF; white-space: nowrap; opacity: 0; }
/* badge */
#badge { position: absolute; left: 65px; top: 298px; height: 52px; display: flex; align-items: center; gap: 16px; padding: 0 22px; border-radius: 999px; box-sizing: border-box; }
#badge .bt { font: 700 26px/1 ${B}; white-space: nowrap; }
#badge .bdots { display: flex; gap: 8px; }
#badge .bdots i { width: 13px; height: 13px; border-radius: 50%; display: block; background: ${rgba("#FFFFFF", 0.22)}; transform: scale(0.8); }
/* captions */
#caps { position: absolute; left: 65px; top: 1092px; width: 821px; height: 140px; }
.cp { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; gap: 18px; opacity: 0; }
.cw { position: relative; display: inline-block; font: 700 62px/1.3 ${B}; color: ${C.capOff}; white-space: nowrap; transform-origin: 50% 60%; }
/* the end */
#cta { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 18px; padding-top: 6px; box-sizing: border-box; }
#cta .eh { font: 800 40px/1.3 ${B}; color: #FFFFFF; opacity: 0; }
.erow { display: flex; gap: 18px; justify-content: center; }
.ec { width: 255px; height: 164px; box-sizing: border-box; border-radius: 24px; padding: 18px 16px 14px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;
  background: var(--cb); border: 3px solid var(--c); opacity: 0; }
.ec .emono { width: 56px; height: 56px; border-radius: 50%; background: var(--c); color: ${C.bg}; display: flex; align-items: center; justify-content: center; font: 900 24px/1 ${S}; flex: none; }
.ec .enm { font: 800 28px/1.12 ${S}; color: #FFFFFF; text-align: center; text-wrap: balance; }
#cta .cph { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 18px; padding-top: 6px; box-sizing: border-box; }
#cta #ctaB { justify-content: center; gap: 26px; padding-top: 0; opacity: 0; }
#ctaB .eh { opacity: 0; }
.csr { display: flex; gap: 18px; justify-content: center; }
.cs { position: relative; width: 255px; height: 172px; box-sizing: border-box; border-radius: 24px; padding: 18px 12px 14px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 12px;
  background: ${rgba("#FFFFFF", 0.07)}; border: 3px solid ${rgba(C.accent, 0.75)}; opacity: 0; }
.cs .csn { position: absolute; left: 14px; top: 14px; width: 42px; height: 42px; border-radius: 50%; background: ${C.accent}; color: ${C.bg}; display: flex; align-items: center; justify-content: center; font: 800 28px/1 "Baloo Da 2", ${B}; }
.cs .csi { display: flex; align-items: center; justify-content: center; height: 48px; }
.cs .csl { font: 700 30px/1.25 ${B}; color: #FFFFFF; text-align: center; text-wrap: balance; }
.ibox { position: relative; width: 600px; height: 104px; border-radius: 999px; box-sizing: border-box; padding: 0 16px 0 44px; display: flex; align-items: center; opacity: 0;
  background: ${rgba("#FFFFFF", 0.1)}; border: 3px solid ${C.accent}; box-shadow: 0 0 40px ${rgba(C.accent, 0.35)}; }
/* the promise card and the how-to steps (inside the look's own card skin) */
.tool .bx { position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: inherit; }
.hws { position: absolute; left: 0; right: 0; top: 0; display: flex; flex-direction: column; gap: 14px; opacity: 0; }
.hwk { display: flex; align-items: center; gap: 12px; font: 700 28px/1.3 ${B}; color: var(--c); }
.hw { display: flex; align-items: center; gap: 18px; opacity: 0; }
.hw .hn { flex: none; width: 54px; height: 54px; border-radius: 50%; background: var(--c); color: ${C.bg}; display: flex; align-items: center; justify-content: center; font: 800 32px/1 "Baloo Da 2", ${B}; }
.hw .hl { font: 700 32px/1.25 ${B}; color: #FFFFFF; text-wrap: balance; }
.tool.pr { justify-content: center; }
.pr .prk { font: 700 28px/1.3 ${B}; color: ${C.muted}; }
.pr .prt { font: 800 72px/1.3 "Baloo Da 2", ${B}; color: var(--c); transform-origin: 0% 60%; }
.pr .prs { font: 700 34px/1.3 ${B}; color: #FFFFFF; text-wrap: balance; opacity: 0; }
.pr .prl { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
.pr .prr { display: flex; align-items: center; gap: 16px; font: 700 30px/1.3 ${B}; color: #FFFFFF; opacity: 0; }
.pr .prr .fi { flex: none; width: 46px; height: 46px; border-radius: 50%; background: var(--cb); display: flex; align-items: center; justify-content: center; }
/* the inbox chip, top right, opposite the badge: one top band (#top) so design-lint counts badge + chip as one zone */
#top { position: absolute; left: 0; top: 0; width: 1080px; height: 360px; pointer-events: none; }
#ichip { position: absolute; right: 194px; top: 298px; height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 22px 0 16px; border-radius: 999px; box-sizing: border-box;
  background: ${rgba(C.accent, 0.16)}; border: 2px solid ${C.accent}; transform-origin: 100% 50%; opacity: 0; }
#ichip span { font: 700 26px/1 ${B}; color: #FFFFFF; white-space: nowrap; }
#ichip b { font: 900 26px/1 ${S}; color: ${C.accent}; white-space: nowrap; }
.ikw { font: 900 60px/1 ${S}; color: #FFFFFF; white-space: nowrap; }
.icar { display: block; width: 4px; height: 58px; margin-left: 6px; background: ${C.accent}; }
.isend { margin-left: auto; width: 76px; height: 76px; border-radius: 50%; background: ${C.accent}; display: flex; align-items: center; justify-content: center; flex: none; }
.isent { display: flex; align-items: center; gap: 10px; font: 700 28px/1.3 ${B}; color: ${C.muted}; opacity: 0; }
#flash { position: absolute; inset: 0; background: #FFFFFF; opacity: 0; pointer-events: none; }
`;
const badge = `<div id="badge"><span class="bt">${esc(R.series ?? "৫টা GitHub রিপো")} · পর্ব ${bnd(R.episode ?? 1)}</span><span class="bdots">${tools.map((_, k) => `<i id="bd${k}"></i>`).join("")}</span></div>`;
const html = `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${esc(R.title ?? path.basename(dir))}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${FONT_CSS}${BASE_CSS}${look.css(ctx)}
    </style>
  </head>
  <body>
    <div id="root" data-safe-profile="universal-reel" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${f3(total)}">
      <div id="world">${look.world(ctx)}</div>
      <div id="stage">
${look.stageBack?.(ctx) ?? ""}
${hookHtml}
${toolHtml.join("\n")}
${look.stageFront?.(ctx) ?? ""}
      </div>
      ${look.front?.(ctx) ?? ""}
      <div id="top">${badge}
      <div id="ichip">${icon("message-circle", 28, C.accent, 2.4)}<span>ইনবক্সে</span><b>${esc(kw)}</b></div></div>
      <div id="caps">
${capHtml}      </div>
      <div id="flash"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const bnN = (v) => String(Math.round(v)).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
      const tl = gsap.timeline({ paused: true });
${P.join("\n")}
${J.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
writeFileSync(path.join(dir, "index.html"), html);
mkdirSync(path.join(dir, "build"), { recursive: true });
writeFileSync(path.join(dir, "build", "timeline.json"), JSON.stringify({ style: R.style, total, pace: +pace.toFixed(2), matched: +matched.toFixed(3), tools: T.map(({ at, atFree, late, ...x }) => x), cues, rows }, null, 1));

// ---- 10. the soundtrack ------------------------------------------------------------------------------------------
const musicFile = R.music?.file ? path.join(dir, R.music.file) : null;
if (musicFile && !existsSync(musicFile)) warns.push(`music.file ${R.music.file} not found: the mix has no BGM`);
if (!has("no-mix")) {
  const base = R.music?.db ?? -19, duck = base - (R.music?.duck ?? 4);
  const iv = [];
  for (const w of words) { const l = iv.at(-1); if (l && w.start - l[1] < 0.6) l[1] = w.end; else iv.push([w.start, w.end]); }
  const level = (t) => (iv.some(([a, b]) => t >= a - 0.05 && t < b + 0.15) ? duck : base);
  const env = [[0, null], [0.35, base]];
  let prev = base;
  for (let t = 0.36; t < total - 1.8; t += 0.02) {
    const v = level(t);
    if (v === prev) continue;
    const a = +(t - 0.12).toFixed(3);
    if (a > env.at(-1)[0]) env.push([a, prev]);
    env.push([+t.toFixed(3), v]);
    prev = v;
  }
  env.push([+(total - 1.8).toFixed(3), prev ?? base], [total, null]);
  mkdirSync(path.join(dir, "assets", "media"), { recursive: true });
  const music = musicFile && existsSync(musicFile) ? [{ file: musicFile.replace(/\\/g, "/"), at: 0, from: R.music.from ?? 0, env }] : [];
  console.log(`• mixing: voice + ${music.length ? "BGM" : "no BGM"} + ${cues.length} sounds …`);
  buildMix({ total, out: path.join(dir, "assets", "media", "mix.wav"), voice: { file: voice.replace(/\\/g, "/"), eq: true, gainDb: R.voiceGainDb ?? 0 }, music, cues, graphFile: path.join(dir, "build", "mix.graph.txt") });
}

// ---- 11. PLAN.md -------------------------------------------------------------------------------------------------
const clockBn = (t) => bnd(`${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`);
if (has("plan")) {
  const planFile = path.join(dir, "PLAN.md");
  const isTemplate = !existsSync(planFile) || readFileSync(planFile, "utf8").includes("Claude: copy this to projects/<name>/PLAN.md");
  if (!isTemplate && !planForce) warns.push("PLAN.md already filled: not overwritten (use --plan=force)");
  else {
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
    const Tm = merged.map((r) => +r.t.toFixed(1)).concat(+total.toFixed(1));
    const tableRows = [];
    for (let i = 0; i < merged.length; i++) {
      if (Tm[i + 1] <= Tm[i]) continue;
      const inRow = (t) => t >= Tm[i] - 0.05 && t < Tm[i + 1] - 0.05;
      const counts = new Map();
      for (const c of cues) if (inRow(c.t)) counts.set(c.file, (counts.get(c.file) ?? 0) + 1);
      const voiceLines = lines.map((_, li) => li).filter((li) => inRow(first(li)));
      const sound = [...[...counts].map(([f, n]) => `\`${f}\`${n > 1 ? ` ×${bnd(n)}` : ""}`), ...(voiceLines.length ? [`ভয়েস ${voiceLines.map((li) => bnd(li + 1)).join(", ")}`] : [])].join(" ") || (musicFile ? "মিউজিক" : "ভয়েস চলছে");
      tableRows.push(`| ${Tm[i]}–${Tm[i + 1]} | ${merged[i].bn.replace(/\|/g, "/")} | ${String(merged[i].text).replace(/\|/g, "/")} | ${sound} |`);
    }
    const questions = [...(R.questions ?? [])];
    const plan = `# প্ল্যান: ${R.title ?? path.basename(dir)}

ফরম্যাট: 9:16
দৈর্ঘ্য: ${total.toFixed(1)} সেকেন্ড
প্ল্যাটফর্ম: Facebook Reels, Instagram Reels, YouTube Shorts আর X (একই ফাইল, universal-reel)
ধরন: "${bnd(N)}টা GitHub রিপো" সিরিজ, স্টাইল ${R.style} ${look.nameBn}
ভয়েস: ${R.voiceLabel ?? "রেকর্ড করা ভয়েস"} (${path.basename(voice)}), প্রতি সেকেন্ডে ${bnd(pace.toFixed(1))} শব্দ
মিউজিক: ${musicFile && existsSync(musicFile) ? path.basename(musicFile) : "নেই"}${R.music?.label ? ` (${R.music.label})` : ""}
আউটপুট: 9:16, সাথে 1:1
পুরো ভিডিও জুড়ে: ${look.plan.world}; উপরে বাঁয়ে সিরিজের ব্যাজ "${R.series ?? "৫টা GitHub রিপো"} · পর্ব ${bnd(R.episode ?? 1)}" আর ${bnd(N)}টা বিন্দু; উপরে ডানে "ইনবক্সে ${kw}" চিহ্ন (প্রথম রিপো থেকে শেষ পর্দা পর্যন্ত, "ইনবক্স" বললেই একটু লাফায়); ৩-শব্দের ক্যাপশন (বলা প্রতিটা শব্দ, উপর থেকে প্রায় ৬০%); সব লেখা প্ল্যাটফর্মের নিরাপদ এলাকায়; ফাইনাল আওয়াজ −১৪ LUFS

## লক্ষ্য

${R.goal}

## হুক (প্রথম ২ সেকেন্ড)

প্রথম কথা: "${R.hook.line}" ${look.plan.hook(R)}। শুভেচ্ছা দিয়ে শুরু নয়।

## স্ক্রিপ্ট

${lines.map((l, li) => `${bnd(li + 1)}. (${clockBn(first(li))}) ${l}`).join("\n")}

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${tableRows.join("\n")}

## যা লাগবে

- ভয়েস: ${path.relative(dir, voice).replace(/\\/g, "/")} (আছে; শব্দের সময় মাপা, স্ক্রিপ্টের সাথে ${bnd(Math.round(matched * 100))}% মিল)।
- মিউজিক: ${musicFile && existsSync(musicFile) ? `${path.relative(dir, musicFile).replace(/\\/g, "/")} (আছে)` : "নেই"}।
- সাউন্ড ইফেক্ট: সবই assets/sfx-এ আছে।
- ছবি: সব কোডে আঁকা (${look.plan.drawn})। কোনো আসল লোগো নেই: রিপোর নামের লেখা আর রঙিন আদ্যক্ষর-ব্যাজ।
- তথ্য: ${bnd((R.facts ?? []).length)}টা সূত্রসহ (৩০ অক্টোবর ২০২৬-এ রিপোর নিজের পাতা থেকে যাচাই)।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- STYLE §৫: প্রতি ২–৩ সেকেন্ডে পর্দায় কিছু বদলায়; প্রথম ২ সেকেন্ডে সবচেয়ে চমকানো কথা।
- STYLE §৬: পড়ার লেখা ১০৮০p-তে অন্তত ২৮ px, ছোট লেবেল অন্তত ২৪ px।
- STYLE §৭: প্রতি দৃশ্য বদলে শব্দ, শব্দ ঠিক ছবির মুহূর্তে; ভয়েসের নিচে মিউজিক; ফাইনাল −১৪ LUFS।
- STYLE §১৩: ভুয়া রিভিউ নয়; রিপোর সংখ্যা সূত্রসহ।
- LESSONS ২০২৬-১০-২৮: ক্যাপশন, ব্যাজ আর পেছনের দুনিয়া প্রথম ফ্রেম থেকে শেষ ফ্রেম পর্যন্ত (CLAUDE.md §০h)।
- SERIES-PLAN §৩: প্রতিটা পর্ব আলাদা দুনিয়া আর নড়াচড়া, কিন্তু ব্যাজ, ক্যাপশন আর শেষের কার্ড সব পর্বে একই।
- LESSONS ২০২৬-১১-০১: দর্শক যেন পরিষ্কার বোঝে ভিডিওটা কী নিয়ে (শুরুর কার্ড), প্রতিটা টুল কীভাবে চালাবে (ধাপ ১-২-৩), আর লিংক পেতে কীভাবে ইনবক্সে মেসেজ করবে (শেষ পর্দার ৩ ধাপ + পুরো ভিডিওতে "ইনবক্সে ${kw}" চিহ্ন)।

## আপনার কাছে প্রশ্ন

${questions.length ? questions.map((q) => `- ${q}`).join("\n") : "- কোনো প্রশ্ন নেই।"}
`;
    writeFileSync(planFile, plan);
  }
}

for (const w of warns) console.log(`  WARN   ${w}`);
console.log(`✓ ${path.basename(dir)} (${R.style}): ${N} tools, ${total} s, ${words.length} words at ${pace.toFixed(2)} words/s, script↔voice ${Math.round(matched * 100)} %, ${cues.length} sounds`);
console.log(`  wrote index.html${has("no-mix") ? "" : ", assets/media/mix.wav"}${has("plan") ? ", PLAN.md" : ""}, build/timeline.json`);
