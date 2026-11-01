#!/usr/bin/env node
// plan.mjs — an auto-tutorial's PLAN.md written from its data, so the plan gate (CLAUDE.md §0e) needs no hand-made
// shot table: header, goal, hook, the script with each line's measured start, one shot row per change on screen
// (hook, rewind, camera drift, cursor travel, click, typing, page change, highlight, end) with the sounds in it.
//   node tools/autocap/compose.mjs projects/<name> --dry     (writes build/timeline.json; a full compose also works)
//   node tools/autocap/plan.mjs projects/<name>              → PLAN.md, then: node tools/plan-check.mjs projects/<name>
// demo.json may add "goal" (লক্ষ্য), "platform", per step "label" (how a target is named in the table, else its
// text / aria / id) and "result" (what the click or typing shows), and "questions" (an array, প্রশ্ন). Rows over 3 s are still beats and say দম (plan-check).
// Verified 2026-11-01 on projects/autotut-proof (silent preview and his cloned voice): plan-check clean.
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const proj = argv.find((a) => !a.startsWith("--"));
if (!proj) { console.error("usage: node tools/autocap/plan.mjs projects/<name>"); process.exit(1); }
const demo = JSON.parse(fs.readFileSync(path.join(proj, "demo.json"), "utf8").replace(/^﻿/, ""));
const T = JSON.parse(fs.readFileSync(path.join(proj, "build", "timeline.json"), "utf8"));
const cap = JSON.parse(fs.readFileSync(path.join(proj, "assets", "media", "capture", "capture.json"), "utf8"));
const bn = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const r2 = (x) => +(+x).toFixed(2);
const mmss = (t) => `${bn(Math.floor(t / 60))}:${bn((t % 60).toFixed(1).padStart(4, "0"))}`;
const label = (s) => s.label ?? s.target?.text ?? s.target?.aria ?? s.id;

// ── events: [time, what is on screen, extra text, sounds] ──
const ev = [];
const anchorT = (k) => T.lines[k].anchor ?? T.lines[k].start + (T.lines[k].end - T.lines[k].start) * 0.7;
if (T.hook) {
  ev.push([0, `শুরুতে ফলাফল: জানালা উড়ে এসে বসে শেষ ধাপের পাতায়, সোনালি ফ্রেমে ${label(demo.steps.at(-1))}`, "শেষে এখানে পৌঁছাব", ["`whoosh-short`", "`pop`"]]);
  ev.push([T.hook.r0, "রিওয়াইন্ড: আগের ধাপগুলো উল্টো দিকে ঝলক দেয়, ক্যামেরা পুরো পাতায় ফেরে, প্রথম পাতা", "শুরু থেকে দেখি", ["`whoosh`", `\`click-soft\` ×${bn(T.hook.flicks.length)}`]]);
} else ev.push([0, "ব্রাউজার জানালা উড়ে এসে বসে: প্রথম পাতা", "—", ["`whoosh-short`"]]);
const opening = T.views.find((v) => v[0] > (T.hook ? T.hook.r1 : 0.5) && v[0] < (T.hook ? T.hook.r1 + 0.3 : 1.6));
if (opening) ev.push([opening[0], "দম: ক্যামেরা ধীরে পাতার ভেতরে এগোয়", "—", []]);
T.moves.forEach((m) => ev.push([m.t0, "", "—", []])); // filled per step below
let mi = 0;
cap.steps.forEach((c, i) => {
  const s = demo.steps[i], A = anchorT(i);
  if (c.do === "click" || c.do === "hover") {
    const m = T.moves[mi++];
    const row = ev.find((e) => e[0] === m.t0 && e[1] === "");
    row[1] = `কার্সর বাঁকা পথে ${label(s)}-এ যায়, ক্যামেরা সেখানে জুম করে`;
    if (c.do === "click") {
      const nav = i > 0 && c.url.split("#")[0] !== cap.steps[i - 1].url.split("#")[0];
      const jump = i > 0 && !nav && c.scrollY !== cap.steps[i - 1].scrollY;
      const what = s.result ?? (nav ? "এক ঝলক অন্ধকার, নতুন পাতা খোলে" : jump ? "পাতা নিচে লাফায়" : "ক্লিকের ফল দেখা যায়");
      ev.push([A, `ক্লিক: সোনালি ঢেউ, ${what}`, "—", ["`click`", ...(nav || jump ? ["`whoosh-short`"] : [])]]);
      if (nav) ev.push([A + 0.25, "ক্যামেরা পুরো নতুন পাতা দেখায়", "—", []]);
    }
  } else if (c.do === "type") {
    ev.push([A + 0.05 - 0.6 > (ev.at(-1)?.[0] ?? 0) + 0.4 ? A + 0.05 - 0.6 : A, "দম: ক্যামেরা লেখার ঘরে জুম করে", "—", []]);
    ev.push([A + 0.05, `${c.text} টাইপ হয়, প্রতিটা অক্ষরে পর্দা বদলায়`, "—", [`\`key-press\` ×${bn(c.frames.length)}`]]);
    ev.push([A + 0.05 + c.frames.length * 0.12 + 0.3, `দম: ${s.result ?? "লেখার ফল দেখা যায়"}`, "—", []]);
  }
});
if (T.mark) ev.push([T.mark.t, "দম: সোনালি ফ্রেম জ্বলে ওঠে, ক্যামেরা ধরে রাখে", "—", ["`pop`"]]);
const endV = T.views.at(-1);
ev.push([endV[0], "ক্যামেরা পুরো পাতায় ফিরে আসে, শেষে ছবি মিলিয়ে যায়", "—", []]);
ev.sort((a, b) => a[0] - b[0]);
// rows: each event until the next; a row under 0.4 s joins the one before it
const rows = [];
for (const [t, what, text, snd] of ev) {
  const last = rows.at(-1);
  if (last && t - last.t < 0.4) { last.what += `; ${what.replace(/^দম: /, "")}`; last.snd.push(...snd); if (text !== "—") last.text = text; continue; }
  rows.push({ t: r2(t), what, text, snd: [...snd] });
}
rows.forEach((r, k) => {
  r.end = k < rows.length - 1 ? rows[k + 1].t : r2(T.TOTAL);
  if (r.end - r.t > 3 && !r.what.includes("দম")) r.what = `দম: ${r.what}`;
});
// sounds: the voice lines that start in the row, music under everything
T.lines.forEach((l, k) => { const r = rows.find((x) => l.start >= x.t - 0.001 && l.start < x.end); if (T.voiced && r) r.snd.unshift(`ভয়েস ${bn(k + 1)}`); });
if (demo.bgm) rows.forEach((r) => r.snd.push("মিউজিক"));

// the take compose used: a cloned voice leaves <voice>.cost.json from gemini.mjs (its "voice"); a phone take does not
const costFile = T.voiceFile ? path.join(proj, T.voiceFile).replace(/\.wav$/i, "") + ".cost.json" : null;
const cloned = costFile && fs.existsSync(costFile) ? JSON.parse(fs.readFileSync(costFile, "utf8")).voice : null;
const voiceName = cloned ? `ক্লোন (${cloned}, Gemini, পুরো স্ক্রিপ্ট এক অনুরোধে)` : "নিজের গলা (ফোনের রেকর্ডিং)";
const md = `# প্ল্যান: ${demo.title}

ফরম্যাট: 16:9
দৈর্ঘ্য: ${r2(T.TOTAL)} সেকেন্ড
প্ল্যাটফর্ম: ${demo.platform ?? "শুধু পরীক্ষা, প্রকাশ হবে না"}
ধরন: টিউটোরিয়াল, স্টাইল AT1 স্টুডিও জানালা (রোবট নিজে স্ক্রিন তোলে, মানুষের স্ক্রিন রেকর্ডিং নেই)
ভয়েস: ${T.voiced ? voiceName : "নেই"}
মিউজিক: ${demo.bgm ? path.basename(demo.bgm) : "নেই"}
আউটপুট: 16:9
পুরো ভিডিও জুড়ে: প্রতিটা লাইনের ক্যাপশন, ব্রাউজারের ঠিকানা-বার

## লক্ষ্য

${demo.goal ?? demo.title}

## হুক (প্রথম ২ সেকেন্ড)

${T.hook ? `শুরু থেকেই ফলাফল: শেষ ধাপের পাতা সোনালি ফ্রেমে, নিচে লেখা "শেষে এখানে পৌঁছাব"। কানে প্রথম লাইনের প্রশ্ন। "${demo.steps[0].anchor ?? "…"}" শব্দে রিওয়াইন্ড করে প্রথম পাতায় ফেরে (${bn(T.hook.r0)} সেকেন্ডে)।` : "ব্রাউজার জানালা উড়ে এসে বসে, কানে প্রথম লাইন।"}

## স্ক্রিপ্ট

${T.voiced ? T.lines.map((l, k) => `${bn(k + 1)}. (${mmss(l.start)}) ${l.text}`).join("\n") : `ভয়েস নেই। ক্যাপশনের লাইন:\n\n${T.lines.map((l, k) => `- ${l.text}`).join("\n")}`}

## শট টেবিল

| সময় | পর্দায় কী | ক্যাপশন / লেখা | শব্দ |
| --- | --- | --- | --- |
${rows.map((r) => `| ${r.t}–${r.end} | ${r.what} | ${r.text} | ${r.snd.length ? r.snd.join(", ") : "মিউজিক"} |`).join("\n")}

## যা লাগবে

- স্ক্রিন: রোবট নিজে তোলে (\`tools/autocap/capture.mjs\`, ${bn(T.states.length)}টা ছবি)। টাকা লাগে না।
- ভয়েস: ${T.voiced ? `${voiceName}, ${bn(r2(T.lines.at(-1).end - T.lines[0].start))} সেকেন্ড কথা (আনুমানিক আধা সেন্ট)।` : "নেই।"}
- মিউজিক: ${demo.bgm ? `${demo.bgm} (আগেই বানানো)।` : "নেই।"}
- শব্দ: assets/sfx-এর click, key-press, whoosh, pop, click-soft।

## STYLE.md আর LESSONS.md থেকে যা মানছি

- প্রথম ২ সেকেন্ডে ফলাফল (STYLE §৫)।
- বাংলায় letter-spacing নেই, ক্যাপশন Hind Siliguri, সংখ্যা বাংলায় (STYLE §৩, §৪)।
- প্রতিটা দৃশ্য বদলে শব্দ, ছোট ঘটনায় click (STYLE §৭); মিউজিক কথার নিচে আস্তে, শেষে মিলিয়ে যায়।
- ক্লিক পড়ে ঠিক সেই শব্দে, যেটা বলা হচ্ছে; পর্দার কাজ শেষ না হলে পরের লাইন অপেক্ষা করে।
- ক্যাপশন বাক্য ধরে, শেষ লাইনে একা শব্দ নয় (STYLE §৪)।

## আপনার কাছে প্রশ্ন

${(demo.questions ?? ["এটা শুধু প্রমাণ। আসল ভিডিওর আগে আলাদা প্ল্যান দেখাব।"]).map((q) => `- ${q}`).join("\n")}
`;
fs.writeFileSync(path.join(proj, "PLAN.md"), md);
console.log(`✓ ${path.join(proj, "PLAN.md")}: ${rows.length} shots, ${r2(T.TOTAL)} s`);
