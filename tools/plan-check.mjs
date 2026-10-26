#!/usr/bin/env node
// plan-check.mjs — check a video plan (PLAN.md) before it is shown to the user, so the user approves a
// plan that adds up and follows STYLE.md.
//
//   node "D:/Video Create/tools/plan-check.mjs" <project folder | PLAN.md>
//
// A plan is tools/plan/TEMPLATE.md filled in (example: tools/plan/EXAMPLE.md). ERROR means the plan
// cannot be shown yet; WARN means fix it or tell the user; INFO is a reminder. Exit code 1 on any ERROR.
//
// What it checks (CLAUDE.md §0e; STYLE.md §৫, §৭, §৮, §১১; CLAUDE.md §0d rules 7 and 11):
// - The header lines ফরম্যাট and দৈর্ঘ্য, and the sections লক্ষ্য, হুক, শট টেবিল and the STYLE.md/LESSONS.md one.
// - The shot table: every row has as many cells as the header (a stray | shifts the columns), no blank line
//   splits it, and the times run back to back from 0 to দৈর্ঘ্য.
// - Pace: on videos up to 90 s a row longer than 3 s (8 s on longer ones) should be split, one row per change
//   on screen, unless its পর্দায় কী cell has the word দম (a planned still).
// - Sound: every row has one; every `name` in backticks is a file in assets/sfx or the project's own; a দম row
//   longer than 1.5 s carries a voice line, music or a sound long enough (STYLE.md §৫: a still picture with
//   no sound for at most 1.5 s).
// - The end screen of a short video is at most 3 s, and on-screen text has no ✓ or arrow symbols.
// - Voice: a recorded voice (every line starts with its measured time in brackets, "৬. (০:২৮.৮) …") is checked
//   line by line against the shots that name it; otherwise the script fits the video, every numbered line is placed in a shot (ভয়েস N), and no line runs into
//   the next one or past the end. Piper speaks about 1.8 words a second, not counting the 0.25 s + 0.4 s of
//   silence bn-tts adds (measured on khata-cartoon's 38 lines, 2026-10-24), so the estimates err long.
// - Music only when assets/music has a track; a Piper voice needs its credit line.
// It also lists STYLE.md's open questions (bullet lines with "?") for the plan's question section.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { readSubtitleText } from "./srt.mjs";

const WORKSPACE = path.resolve(import.meta.dirname, "..");
const WORDS_PER_SECOND = 1.8;
const VOICE_LEAD = 0.25; // bn-tts.mjs starts every line with 0.25 s of silence…
const VOICE_TAIL = 0.4; // …and ends it with 0.4 s
const SHORT_FORM = 90; // seconds; up to this a video is short-form (Reels, Shorts)
const PACE = { short: 3, long: 8 }; // STYLE.md §৫: a change every 2–3 s on Reels, every 6–8 s on long videos
const END_SCREEN = 3; // STYLE.md §১১
const DEAD_AIR = 1.5; // STYLE.md §৫
const SLACK = 0.05; // seconds of rounding allowed where two shots meet
const AUDIO = /\.(mp3|wav|m4a|ogg|flac|aac)$/i;
const SECTIONS = ["লক্ষ্য", "হুক", "স্ক্রিপ্ট", "শট টেবিল", "যা লাগবে", "STYLE.md", "প্রশ্ন"];
const NUM = String.raw`\d+(?::\d+)?(?:\.\d+)?`; // 2, 2.5, 1:05, 0:02.5
const SYMBOLS = /[✓✔✗✘→←↑↓➜➔⇒]/;

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

const nfc = (s) => s.normalize("NFC");
const ascii = (s) => s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
const fmt = (t) => String(+t.toFixed(2));
const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu) ?? []).length;

// "2.5", "1:05", "0:02.5" → seconds
function seconds(s) {
  const m = s.match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  return m ? (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2]) : NaN;
}

// "0–2.5", "০:০০ — ০:০২.৫ সে.", "২ থেকে ৪.৫" → [start, end]
function range(cell) {
  const m = ascii(cell).replace(/থেকে/g, "-").match(new RegExp(`(${NUM})\\s*[–—−-]\\s*(${NUM})`));
  return m ? [seconds(m[1]), seconds(m[2])] : [NaN, NaN];
}

// "30 সেকেন্ড", "১ মিনিট ১০ সেকেন্ড", "১ মি. ৩০ সে.", "1:30", "45s" → seconds; anything in brackets is ignored.
function duration(value) {
  const t = ascii(value).replace(/\([^)]*\)/g, "");
  const mmss = t.match(/(\d+):(\d+(?:\.\d+)?)/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const min = t.match(/(\d+(?:\.\d+)?)\s*মি/), sec = t.match(/(\d+(?:\.\d+)?)\s*সে/);
  if (min || sec) return (min ? Number(min[1]) * 60 : 0) + (sec ? Number(sec[1]) : 0);
  const n = t.match(/\d+(?:\.\d+)?/);
  return n ? Number(n[0]) : NaN;
}

// A value that means "none" on its own (brackets and a full stop ignored): নেই, নাই, না, লাগবে না, none, no.
const none = (v) => /^(নেই|নাই|না|লাগবে না|none|no)$/i.test(nfc(v).replace(/\([^)]*\)/g, "").replace(/[।.]\s*$/, "").trim());
// A sound cell with nothing in it: empty, dashes, or নেই / চুপ / নীরব.
const quiet = (cell) => /^(নেই|নাই|চুপ|নীরব|none)?$/i.test(nfc(cell).replace(/[-–—\s।.]/g, ""));
// The word দম on its own (not inside একদম or কদম).
const still = (cell) => /(^|[^\p{L}\p{M}])দম($|[^\p{L}\p{M}])/u.test(nfc(cell));

// `name` and `name` ×3 in a sound cell → [{ name, count }]
function sfxIn(cell) {
  return [...ascii(cell).matchAll(/`([^`]+)`\s*(?:[×x]\s*(\d+))?/g)].map((m) => ({ name: path.parse(m[1].trim()).name.toLowerCase(), count: Number(m[2] ?? 1) }));
}

// "ভয়েস ২", "ভয়েস ৩, ৪", "ভয়েস ৪–৫" → [2], [3, 4], [4, 5]
function voiceIn(cell) {
  const out = [];
  for (const m of ascii(nfc(cell)).matchAll(new RegExp(`${nfc("ভয়েস")}\\s*(\\d+(?:\\s*(?:[,–—−-]|ও|আর)\\s*\\d+)*)`, "g"))) {
    for (const part of m[1].split(/\s*(?:,|ও|আর)\s*/)) {
      const [a, b = a] = part.split(/\s*[–—−-]\s*/).map(Number);
      for (let k = a; k <= Math.min(b, a + 50); k++) out.push(k);
    }
  }
  return out;
}

function listAudio(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).filter((f) => AUDIO.test(f));
}

const arg = process.argv[2];
if (!arg) {
  console.log("Usage: node plan-check.mjs <project folder | PLAN.md>");
  process.exit(2);
}
let file = path.resolve(arg);
if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "PLAN.md");
if (!existsSync(file)) fail(`No plan found: ${file}. Copy tools/plan/TEMPLATE.md there and fill it in.`);
const projectDir = path.dirname(file);

// UTF-8 with or without a BOM, UTF-16, CRLF; NFC (the same reader as the subtitle tools).
const text = readSubtitleText(file).replace(/<!--[\s\S]*?-->/g, "");
const errors = [], warns = [], infos = [];

// Sections are the headings that name one of SECTIONS; the header lines are everything above the first one.
const headings = [...text.matchAll(/^#{1,6}\s+(.*)$/gm)];
const known = (title) => SECTIONS.some((w) => title.includes(nfc(w)));
const sectionHeads = headings.filter((h) => known(h[1]));
const top = sectionHeads.length ? text.slice(0, sectionHeads[0].index) : text;
const sections = new Map(sectionHeads.map((h, i) => [h[1].trim(), text.slice(h.index + h[0].length, sectionHeads[i + 1]?.index ?? text.length).trim()]));
const section = (word) => [...sections].find(([title]) => title.includes(nfc(word)))?.[1] ?? null;
const header = (key) => top.match(new RegExp(`^[-*\\s]*\\**${nfc(key)}\\**\\s*:\\s*(.*)$`, "m"))?.[1].replace(/\*\*/g, "").trim() ?? null;

const formatLine = header("ফরম্যাট"), lengthLine = header("দৈর্ঘ্য");
const voiceLine = header("ভয়েস"), musicLine = header("মিউজিক");
const ratio = formatLine && ascii(formatLine).match(/(\d+)\s*[:x×]\s*(\d+)/);
if (!formatLine) errors.push("The header has no ফরম্যাট line (for example: ফরম্যাট: 9:16).");
else if (!ratio) warns.push(`Can't read the format "${formatLine}" (write 9:16, 16:9, 1:1 or 4:5).`);
const length = lengthLine ? duration(lengthLine) : NaN;
if (!(length > 0)) errors.push(lengthLine ? `Can't read the length "${lengthLine}" (write it like: দৈর্ঘ্য: 30 সেকেন্ড).` : "The header has no দৈর্ঘ্য line (for example: দৈর্ঘ্য: 30 সেকেন্ড).");
const short = !(length > SHORT_FORM);
const music = musicLine !== null && !none(musicLine);

for (const [word, name] of [["লক্ষ্য", "লক্ষ্য (goal)"], ["হুক", "হুক (hook)"], ["STYLE.md", "STYLE.md আর LESSONS.md থেকে যা মানছি"]]) {
  const body = section(word);
  if (body === null) warns.push(`The plan has no "${name}" section.`);
  else if (!body) warns.push(`The "${name}" section is empty.`);
}

// The shot table: the first Markdown table whose header has the সময়, পর্দা and শব্দ columns.
const cells = (line) => line.trim().replace(/^\|/, "").replace(/(?<!\\)\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim());
const delimiter = (line) => cells(line).every((c) => /^:?-+:?$/.test(c));
const tables = [[]];
for (const line of (section("শট টেবিল") ?? text).split("\n")) {
  if (line.trim().startsWith("|")) tables.at(-1).push(line);
  else if (tables.at(-1).length) tables.push([]);
}
const hasCols = (t, ws) => t.length > 0 && ws.every((w) => cells(t[0]).some((h) => h.includes(nfc(w))));
const at = tables.findIndex((t) => hasCols(t, ["সময়", "পর্দা", "শব্দ"]));
const table = at >= 0 ? tables[at] : [];

// Columns by name: an exact header first, then one that starts with the word, then one that contains it.
const head = table.length ? cells(table[0]) : [];
const norm = (h) => nfc(h).replace(/[*_`()/\\:.]/g, " ").replace(/\s+/g, " ").trim();
const taken = new Set();
const col = (...ws) => {
  for (const test of [(h, w) => h === w, (h, w) => h.startsWith(w), (h, w) => h.includes(w)]) {
    const i = head.findIndex((h, k) => !taken.has(k) && ws.some((w) => test(norm(h), nfc(w))));
    if (i >= 0) {
      taken.add(i);
      return i;
    }
  }
  return -1;
};
const C = { time: col("সময়"), sound: col("শব্দ"), screen: col("পর্দায় কী", "পর্দা"), caption: col("ক্যাপশন", "লেখা") };
const rows = table.slice(1).filter((l) => !delimiter(l)).map((l, i) => ({ n: i + 1, raw: cells(l) }));
if (!table.length) errors.push("No shot table found. It needs the columns: সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ.");
else if (!rows.length) errors.push("The shot table has no rows.");
if (table.length && C.caption < 0) warns.push("The shot table has no ক্যাপশন / লেখা column.");
for (const r of rows) {
  if (r.raw.length !== head.length)
    errors.push(`Shot ${r.n} has ${r.raw.length} cells but the header has ${head.length}: a | inside a cell splits it. Write \\| or remove it.`);
  Object.assign(r, { time: r.raw[C.time] ?? "", screen: r.raw[C.screen] ?? "", caption: r.raw[C.caption] ?? "", sound: r.raw[C.sound] ?? "" });
}
const next = at >= 0 ? tables.slice(at + 1).find((t) => t.length) : null;
if (next && !delimiter(next[0]) && range(cells(next[0])[C.time] ?? "")[0] >= 0)
  errors.push(`A blank line splits the shot table before shot ${rows.length + 1}; the rows after it are not read.`);

const shots = [];
for (const r of rows) {
  const [start, end] = range(r.time);
  if (!(start >= 0) || !(end >= 0)) errors.push(`Shot ${r.n}: can't read the time "${r.time}" (write it like 0–2.5).`);
  else if (end <= start) errors.push(`Shot ${r.n}: it ends (${fmt(end)} s) before it starts (${fmt(start)} s).`);
  else {
    if (!r.screen.trim()) errors.push(`Shot ${r.n}: the পর্দায় কী cell is empty.`);
    shots.push({ ...r, start, end });
  }
}

// Sound files: the workspace pack and the project's own; durations from the pack's manifest.
const sfxDirs = [path.join(WORKSPACE, "assets", "sfx"), path.join(projectDir, "assets", "sfx")];
const sfxFiles = new Set(sfxDirs.flatMap(listAudio).map((f) => path.parse(f).name.toLowerCase()));
const manifest = path.join(WORKSPACE, "assets", "sfx", "manifest.json");
const sfxSeconds = new Map(existsSync(manifest) ? Object.entries(JSON.parse(readFileSync(manifest, "utf8"))).map(([k, v]) => [k.toLowerCase(), v.duration]) : []);
const used = new Map();
for (const r of rows) {
  for (const { name, count } of sfxIn(r.sound)) {
    used.set(name, (used.get(name) ?? 0) + count);
    if (!sfxFiles.has(name)) warns.push(`Shot ${r.n}: the sound \`${name}\` is not in assets/sfx.`);
  }
  if (C.caption >= 0 && SYMBOLS.test(r.caption))
    warns.push(`Shot ${r.n}: the on-screen text has "${r.caption.match(SYMBOLS)[0]}", which the pack fonts don't have (CLAUDE.md §0d rule 11). Draw it as a picture and say so in পর্দায় কী.`);
}

if (shots.length) {
  if (shots[0].start > SLACK) errors.push(`The first shot starts at ${fmt(shots[0].start)} s, not 0.`);
  for (let i = 1; i < shots.length; i++) {
    const [a, b] = [shots[i - 1], shots[i]];
    if (b.start - a.end > SLACK) errors.push(`Nothing is planned between ${fmt(a.end)} and ${fmt(b.start)} s (shots ${a.n} and ${b.n}).`);
    if (a.end - b.start > SLACK) errors.push(`Shots ${a.n} and ${b.n} overlap (${fmt(b.start)}–${fmt(a.end)} s).`);
  }
  const last = shots.at(-1);
  if (length > 0 && Math.abs(last.end - length) > SLACK) errors.push(`The last shot ends at ${fmt(last.end)} s, but দৈর্ঘ্য is ${fmt(length)} s.`);

  const limit = short ? PACE.short : PACE.long;
  const endScreen = short && last.end - last.start > END_SCREEN + SLACK;
  for (const s of shots) {
    const d = s.end - s.start, when = `${fmt(s.start)}–${fmt(s.end)} s`;
    if (d > limit + SLACK && !still(s.screen) && !(endScreen && s === last))
      warns.push(`Shot ${s.n} (${when}) is ${fmt(d)} s long; STYLE.md §৫ asks for a change on screen every ${short ? "2–3" : "6–8"} s. Give each change (cut, zoom, new graphic) its own row, or write দম if the stillness is planned.`);
    if (quiet(s.sound)) warns.push(`Shot ${s.n} (${when}) has no sound (STYLE.md §৭: a sound at every scene change; no silent still picture).`);
    else if (still(s.screen) && d > DEAD_AIR + SLACK && !music && !voiceIn(s.sound).length) {
      const lens = sfxIn(s.sound).map((x) => sfxSeconds.get(x.name));
      const heard = Math.max(0, ...lens.filter((x) => x !== undefined));
      if (!lens.includes(undefined) && d - heard > DEAD_AIR + SLACK)
        warns.push(`Shot ${s.n} (${when}) is a planned still (দম) with about ${fmt(heard)} s of sound; STYLE.md §৫ allows a still, silent picture for at most ${DEAD_AIR} s. Add a voice line, a bed such as \`room-tone\`, or music.`);
    }
  }
  if (endScreen) warns.push(`The last shot is ${fmt(last.end - last.start)} s; STYLE.md §১১ keeps the end screen of a short video to ${END_SCREEN} s.`);
}

// Voice: the script must fit, every numbered line must be placed, and no line may run into the next one.
const script = section("স্ক্রিপ্ট");
const numbered = (script ?? "").split("\n").map((l) => ascii(l).match(/^\s*(?:[-*+]\s+)?\**\s*(\d+)\s*[.)।]\**\s*(.*)$/)).filter(Boolean)
  .map((m) => {
    // a recorded voice: the line's measured start in brackets, "৬. (০:২৮.৮) …"
    const at = m[2].match(/^\(\s*(\d+(?::\d+)?(?:\.\d+)?)\s*\)/);
    return { k: Number(m[1]), words: words(m[2].replace(/^\([^)]*\)/, "")), at: at ? seconds(at[1]) : null };
  });
const recorded = numbered.length > 0 && numbered.every((l) => l.at !== null);
const placed = rows.some((r) => voiceIn(r.sound).length);
if (voiceLine === null && (numbered.length || placed)) warns.push("The plan has a script or ভয়েস N in the shots, but the header has no ভয়েস line.");
if (voiceLine !== null && none(voiceLine) && placed) warns.push(`ভয়েস is "${voiceLine}", but shots name voice lines (ভয়েস N).`);
if (voiceLine === null ? numbered.length || placed : !none(voiceLine)) {
  if (!script || script.startsWith(nfc("ভয়েস নেই")))
    warns.push(`${voiceLine ? `ভয়েস is "${voiceLine}"` : "Shots name voice lines (ভয়েস N)"}, but the স্ক্রিপ্ট section is empty.`);
  else {
    const total = numbered.length ? numbered.reduce((sum, l) => sum + l.words, 0) : words(script);
    const speech = total / WORDS_PER_SECOND;
    if (recorded) infos.push(`Script: ${numbered.length} recorded lines with measured starts, ${total} words (video ${fmt(length)} s); timing checked against the shots, not estimated.`);
    else infos.push(`Script: ${numbered.length ? `${numbered.length} lines, ` : ""}${total} words, about ${fmt(speech)} s of speech at ${WORDS_PER_SECOND} words/s (video ${fmt(length)} s).`);
    if (!recorded && length > 0 && speech > length) warns.push(`The script needs about ${fmt(speech)} s at Piper's pace, longer than the ${fmt(length)} s video. Shorten it or lengthen the video.`);
    if (rows.length) {
      const spoken = new Set(rows.flatMap((r) => voiceIn(r.sound)));
      for (const l of numbered) if (!spoken.has(l.k)) warns.push(`Script line ${l.k} is not placed in any shot (write ভয়েস ${l.k} in the শব্দ cell).`);
      for (const k of spoken) if (numbered.length && !numbered.some((l) => l.k === k)) warns.push(`A shot says ভয়েস ${k}, but the script has no line ${k}.`);
      // A recorded voice: each line's measured start must fall inside the shot that names it, in order.
      if (recorded) {
        numbered.forEach((l, i) => {
          if (i && l.at < numbered[i - 1].at) warns.push(`Script line ${l.k} starts at ${fmt(l.at)} s, before line ${numbered[i - 1].k} (${fmt(numbered[i - 1].at)} s).`);
          if (length > 0 && l.at >= length) warns.push(`Script line ${l.k} starts at ${fmt(l.at)} s, after the end of the ${fmt(length)} s video.`);
          const s = shots.find((x) => voiceIn(x.sound).includes(l.k));
          if (s && (l.at < s.start - 0.5 || l.at > s.end + 0.5)) warns.push(`Script line ${l.k} starts at ${fmt(l.at)} s but is placed in shot ${s.n} (${fmt(s.start)}–${fmt(s.end)} s). Move "ভয়েস ${l.k}" to the shot that holds ${fmt(l.at)} s.`);
        });
      }
      // Each line starts with its shot; two lines in one shot play one after the other.
      const timeline = [];
      if (!recorded)
      for (const s of shots) {
        for (const k of voiceIn(s.sound)) {
          const line = numbered.find((l) => l.k === k);
          if (!line || timeline.some((t) => t.k === k)) continue;
          const prev = timeline.at(-1);
          const file = prev?.shot === s.n ? Math.max(s.start, prev.fileEnd) : s.start;
          const to = file + VOICE_LEAD + line.words / WORDS_PER_SECOND;
          timeline.push({ k, shot: s.n, file, from: file + VOICE_LEAD, to, fileEnd: to + VOICE_TAIL });
        }
      }
      timeline.forEach((l, i) => {
        const after = timeline[i + 1];
        if (after && l.to > after.from + SLACK)
          warns.push(`Voice line ${l.k} (about ${fmt(l.to - l.from)} s from ${fmt(l.file)} s) may still be playing when line ${after.k} starts at ${fmt(after.file)} s. Move line ${after.k} later or shorten line ${l.k}.`);
        if (length > 0 && l.to > length + SLACK) warns.push(`Voice line ${l.k} (about ${fmt(l.to - l.from)} s from ${fmt(l.file)} s) may run past the end of the ${fmt(length)} s video.`);
      });
    }
  }
  if (/piper/i.test(voiceLine ?? "")) infos.push("Piper voice: the video description needs the credit line in assets/voices/piper/CREDITS.md (STYLE.md §৮).");
}

// Music only from a real track.
if (music) {
  const tracks = [path.join(WORKSPACE, "assets", "music"), path.join(projectDir, "assets", "music")].flatMap(listAudio);
  if (!tracks.length) warns.push(`মিউজিক is "${musicLine}", but assets/music has no tracks yet (STYLE.md §৭: the user downloads them from Pixabay).`);
}

// What STYLE.md still asks, and how many lessons there are.
const read = (f) => (existsSync(f) ? readSubtitleText(f) : "");
const style = read(path.join(WORKSPACE, "STYLE.md"));
const questions = style.slice(Math.max(0, style.search(/^## /m))).split("\n")
  .filter((l) => /^\s*-\s/.test(l) && l.includes("?"))
  .map((l) => l.replace(/^\s*-\s*/, "").replace(/\*\*/g, "").replace(/\s*\((?:বদলান|শেখা)[^)]*\)\s*$/, "").trim());
const lessons = read(path.join(WORKSPACE, "LESSONS.md")).split("\n").filter((l) => /^\|\s*\d{4}-\d{2}-\d{2}/.test(l)).length;
if (lessons) infos.push(`LESSONS.md has ${lessons} lessons; name the ones that apply in the STYLE.md/LESSONS.md section.`);

// Report.
const spans = shots.map((s) => s.end - s.start);
const shape = spans.length ? ` · ${shots.length} shot${shots.length > 1 ? "s" : ""} (${fmt(Math.min(...spans))}–${fmt(Math.max(...spans))} s each)` : "";
console.log(`Plan: ${path.relative(WORKSPACE, file).replaceAll("\\", "/")} · ${formatLine ?? "?"} · ${length > 0 ? `${fmt(length)} s` : "?"}${shape}`);
for (const [tag, list] of [["ERROR", errors], ["WARN ", warns], ["INFO ", infos]]) for (const m of list) console.log(`  ${tag}  ${m}`);
if (used.size) console.log(`Sounds: ${[...used].map(([n, k]) => `${sfxFiles.has(n) ? "✓" : "✗"} ${n}${k > 1 ? ` ×${k}` : ""}`).join(", ")}`);
if (questions.length) {
  console.log(`STYLE.md still asks (put the ones that matter in "আপনার কাছে প্রশ্ন"):`);
  for (const q of questions) console.log(`  - ${q}`);
}
if (errors.length) {
  console.log(`\n✗ ${errors.length} error${errors.length > 1 ? "s" : ""}: fix the plan before showing it.`);
  process.exit(1);
}
console.log(warns.length
  ? `\n! ${warns.length} warning${warns.length > 1 ? "s" : ""}: fix them, or show the plan and tell the user about each one.`
  : "\n✓ No errors or warnings: show the plan to the user and wait for an OK.");
