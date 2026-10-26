#!/usr/bin/env node
// build-page.mjs — zubayer-ep01 "The Age of AI & Systems Thinking": the episode's own graphics on top of the
// reusable tools/episode/page-core.mjs. Writes index.html and <work>/sfx.json.
//
//   node build-page.mjs            (after tools/episode cuts.mjs and align.mjs)
//
// All times below are SOURCE seconds (the raw recording, as in subtitle.txt). T() maps them through the cut list;
// W("word", near) finds the spoken word's own start near that time, so a graphic lands on the word itself.
import { cpSync, existsSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { C, arrow, bn, buildPage, icon } from "../../tools/episode/page-core.mjs";
import { WORKSPACE, loadEpisode, makeMapper, readJSON, writeJSON } from "../../tools/episode/lib.mjs";

const ep = loadEpisode(import.meta.dirname);
const map = readJSON(path.join(ep.work, "cuts_map.json"));
const srcWords = existsSync(path.join(ep.work, "words.json")) ? readJSON(path.join(ep.work, "words.json")) : [];
const Tm = makeMapper(map, "main"), Tc = makeMapper(map, "cold");
const T = (s) => Tm(s);

// spoken word nearest `near` whose text contains one of the needles
function W(needles, near, win = 9) {
  const list = Array.isArray(needles) ? needles : [needles];
  let best = null;
  for (const w of srcWords) {
    if (Math.abs(w.start - near) > win) continue;
    if (!list.some((n) => w.text.includes(n))) continue;
    if (!best || Math.abs(w.start - near) < Math.abs(best.start - near)) best = w;
  }
  return best ? best.start : near;
}
const TW = (needles, near, win) => T(W(needles, near, win));

// ---- caption words on the episode timeline -----------------------------------------------------------------
const words = [];
for (const w of srcWords) {
  const mid = (w.start + w.end) / 2;
  for (const s of map.segments) {
    if (mid >= s.src0 && mid < s.src1) {
      const a = Math.max(w.start, s.src0), b = Math.min(w.end, s.src1);
      words.push({ text: w.text, start: s.out0 + (a - s.src0), end: s.out0 + (b - s.src0), part: s.part });
    }
  }
}
words.sort((a, b) => a.start - b.start);

// a layout switch is nicest inside a pause: snap to the nearest cut within ±1.2 s
const cutTimes = [];
for (let i = 1; i < map.segments.length; i++) if (map.segments[i].part === map.segments[i - 1].part) cutTimes.push(map.segments[i].out0);
const snap = (t, win = 1.2) => {
  let best = null;
  for (const c of cutTimes) if (Math.abs(c - t) <= win && (best === null || Math.abs(c - t) < Math.abs(best - t))) best = c;
  return best ?? t;
};

// ---- scenes ------------------------------------------------------------------------------------------------
const chap = (n, label) => `<div class="chap"><b>${bn(String(n).padStart(2, "0"))}</b>${label}</div>`;
const tile = (id, ico, label, cls = "") => `<div class="tile ${cls}" id="${id}">${icon(ico, 76)}<div class="tl">${label}</div></div>`;
const scenes = [];
const sfx = [];
const S = (t, file, vol = 0.45) => sfx.push({ t, file, vol });

function scene(id, from, to, html, beats, extra = {}) {
  scenes.push({ id, in: snap(T(from)), out: T(to), html: `<div class="sc" id="${id}">${html}</div>`, beats, ...extra });
}
// group switch helper: [inTime, outTime] for a .grp
const grp = (sel, a, b) => [[a, sel, "in", { y: 30 }], ...(b ? [[b - 0.3, sel, "out", { d: 0.3 }]] : [])];

// 01 — confusion → micro-steps (0:06–0:48)
{
  const a = T(6.2), b = T(19.2), c = T(35.2), end = T(48.6);
  const qs = [["কোন কাজটা আগে?", ["আগে"], 11], ["কোনটা পরে?", ["পরে"], 12.5], ["কোনটা ইম্পর্টেন্ট?", ["ইম্প"], 14.5], ["কোনটা ডিস্ট্রাক্ট করছে?", ["ডিস্ট্র"], 17]];
  const pos = [[0, 40], [470, 130], [40, 250], [400, 370]];
  scene("s1", 6.2, 48.6, `${chap(1, "বিভ্রান্তি থেকে ছোট ছোট ধাপে")}
  <div class="grp" id="s1a"><p class="ttl">সবাই একটু <em>কনফিউজড</em></p>
    <div class="qbox">${qs.map(([q], i) => `<div class="chip q" id="s1q${i}" style="left:${pos[i][0]}px;top:${pos[i][1]}px">${icon("circle-question-mark", 34)}${q}</div>`).join("")}</div></div>
  <div class="grp" id="s1b"><p class="ttl">মূল কারণ <em>একটাই</em></p>
    <div class="col" style="margin-top:44px">
      <div class="box row" id="s1b1">${icon("target", 70)}<p class="sub hi">লক্ষ্যটা কত ভালোভাবে বুঝছি</p></div>
      <div class="box row" id="s1b2">${icon("list-checks", 70)}<p class="sub hi">কতটা অর্গানাইজডভাবে অ্যাকশন নিচ্ছি</p></div></div></div>
  <div class="grp" id="s1c"><p class="ttl">বড় লক্ষ্য = <em>ছোট ছোট ধাপ</em></p>
    <p class="sub" style="margin-top:22px">গবেষণা বলছে: প্রতিদিন একটা করে ধাপ শেষ করলে একদিন না একদিন গন্তব্যে পৌঁছানো যায়</p>
    <div class="row steps">
      <div class="step" id="s1s0">ধাপ ১</div>${arrow(70, "s1r0")}<div class="step" id="s1s1">ধাপ ২</div>${arrow(70, "s1r1")}<div class="step" id="s1s2">ধাপ ৩</div>${arrow(70, "s1r2")}
      <div class="step goal" id="s1s3">${icon("flag", 40)}লক্ষ্য</div></div>
    <div class="prog"><div class="fill" id="s1fill"></div></div>
    <div class="pct"><span id="s1pct" class="num">০%</span><span>লক্ষ্য অর্জন</span></div></div>`,
  [
    ...grp("#s1a", a, b),
    ...qs.map(([, n, t], i) => [TW(n, t, 4), `#s1q${i}`, "pop", {}]),
    [a + 0.5, "#s1a .q", "wiggle", { a: 1.6, d: 0.55, n: 20 }],
    ...grp("#s1b", b, c),
    [TW(["লক্ষ্যকে", "লক্ষ্য"], 24, 5), "#s1b1", "inx", {}],
    [TW(["অর্গানাইজ"], 30, 5), "#s1b2", "inx", {}],
    ...grp("#s1c", c, end),
    [c + 2.4, "#s1c .step, #s1c .arw", "pop", { stagger: 0.35, from: 0.7 }],
    [c + 4.0, "#s1fill", "grow", { d: Math.max(2, TW(["গন্তব্যে", "পৌঁছে"], 46, 5) - c - 4), ease: "power1.inOut" }],
    [c + 4.0, "#s1pct", "count", { to: 100, d: Math.max(2, TW(["গন্তব্যে", "পৌঁছে"], 46, 5) - c - 4), post: "%" }],
    [TW(["গন্তব্যে", "পৌঁছে"], 46, 5), "#s1s3", "glow", {}],
  ]);
  qs.forEach(([, n, t]) => S(TW(n, t, 4), "pop.mp3", 0.28));
  S(TW(["গন্তব্যে", "পৌঁছে"], 46, 5), "success.mp3", 0.3);
}

// 02 — empires → the AI power game (1:38–2:41)
{
  const a = T(98.2), b = T(102), c = TW(["ভেঙে", "ভেঙ্গে"], 121, 6) - 0.6, d = T(131.2), e = T(144.2), end = T(161);
  const bricks = Array.from({ length: 15 }, (_, i) => `<div class="brick" id="s2k${i}"></div>`).join("");
  scene("s2", 98.2, 161, `${chap(2, "সাম্রাজ্য থেকে AI পাওয়ার গেম")}
  <div class="grp" id="s2a"><div class="bigq">${icon("circle-question-mark", 120)}<p class="ttl big">এটা কেন হচ্ছে?</p></div></div>
  <div class="grp top" id="s2b"><p class="ttl">পরিশ্রমে গড়া <em>সাম্রাজ্য</em></p><p class="sub">অনেক মানুষের অনেক দিনের কষ্টে তৈরি</p></div>
  <div class="grp top" id="s2c"><p class="ttl">আরও <em>পাওয়ারফুল</em> সাম্রাজ্য এল</p><p class="sub">যে পাওয়ারফুল, সে তো ভাঙবেই</p></div>
  <div class="wall" id="s2wall">${icon("landmark", 96, 'id="s2lm"')}<div class="bricks">${bricks}</div></div>
  <div class="swords" id="s2sw">${icon("swords", 120)}</div>
  <div class="grp" id="s2d"><div class="bigq">${icon("crown", 120)}<p class="ttl big">এখন <em>পাওয়ারফুল</em> কে?</p></div>
    <p class="sub center">মানুষ? সৃষ্টিকর্তাই সবচেয়ে পাওয়ারফুল, এটা আমরা সবাই বিশ্বাস করি। কিন্তু দুনিয়ার পাওয়ার গেমটা?</p></div>
  <div class="grp" id="s2e"><div class="vs">
    <div class="box vcol" id="s2old">${icon("castle", 80)}<div class="vh">প্রাচীনকাল</div><div class="chip">সাম্রাজ্য বনাম সাম্রাজ্য</div><div class="chip">মানুষ বনাম মানুষ</div></div>
    <div class="box vcol now" id="s2now">${icon("cpu", 80)}<div class="vh">এখন</div><div class="chip" id="s2n0">কোম্পানি</div><div class="chip" id="s2n1">টেকনোলজি</div><div class="chip gold" id="s2n2">AI</div></div>
  </div></div>`,
  [
    ...grp("#s2a", a, b),
    [a, "#s2a .ico", "pop", {}],
    ...grp("#s2b", b, c + 0.3),
    [b + 0.2, "#s2wall", "fade", {}],
    [b + 0.4, "#s2wall .brick", "pop", { stagger: 0.12, from: 0.3 }],
    ...grp("#s2c", c + 0.3, d),
    [c, "#s2sw", "pop", { from: 1.6 }],
    [c + 0.6, "#s2wall .brick", "fall", { stagger: 0.035 }],
    [c + 0.9, "#s2lm", "out", { d: 0.5 }],
    [d - 0.3, "#s2sw", "out", {}],
    ...grp("#s2d", d, e),
    ...grp("#s2e", e, end),
    [e + 0.1, "#s2old", "inx", { x: -40 }],
    [TW(["বর্তমানে"], 154, 4), "#s2now", "inx", { x: 40 }],
    [TW(["কোম্পানি"], 155.5, 4), "#s2n0", "pop", {}],
    [TW(["টেকনোলজি"], 157, 4), "#s2n1", "pop", {}],
    [TW(["এআই", "এ আই", "AI"], 158.5, 4), "#s2n2", "pop", {}],
  ]);
  S(c, "impact-bass-1.mp3", 0.22); S(c + 0.6, "boom.mp3", 0.18);
  S(TW(["কোম্পানি"], 155.5, 4), "click.mp3", 0.3); S(TW(["টেকনোলজি"], 157, 4), "click.mp3", 0.3); S(TW(["এআই", "এ আই", "AI"], 158.5, 4), "ping.mp3", 0.3);
}

// 03 — 2030 job shift (3:36–4:07)
{
  const a = T(216.2), red = TW(["৯", "নয়", "নয়"], 222.5, 4), green = TW(["১৭", "সতের", "সতেরো"], 229.5, 4), ban = T(233.3);
  scene("s3", 216.2, 247, `${chap(3, "২০৩০: চাকরির বড় বদল")}
  <div class="grp" id="s3a" style="opacity:1"><p class="ttl"><em>২০৩০</em> সালের মধ্যে</p>
    <div class="stats">
      <div class="box stat red" id="s3r"><div class="num" id="s3rn">−০.০ কোটি</div><div class="sl">চাকরি অবসোলিট হয়ে যেতে পারে</div></div>
      <div class="box stat green" id="s3g"><div class="num" id="s3gn">+০ কোটি</div><div class="sl">নতুন চাকরি তৈরির সম্ভাবনা</div></div>
    </div>
    <p class="small" id="s3src">সূত্র: World Economic Forum, Future of Jobs Report 2025</p>
    <div class="box banner" id="s3ban">${icon("user-round-cog", 64)}<p class="sub hi">কিন্তু আসল প্রশ্ন: <em>আপনি</em> টেকনোলজিকে কীভাবে ব্যবহার করছেন?</p></div></div>`,
  [
    [red - 0.3, "#s3r", "inx", { x: -40 }],
    [red - 0.3, "#s3rn", "count", { to: 9.2, dec: 1, pre: "−", post: " কোটি", d: 1.3 }],
    [green - 0.3, "#s3g", "inx", { x: 40 }],
    [green - 0.3, "#s3gn", "count", { to: 17, pre: "+", post: " কোটি", d: 1.3 }],
    [green + 1.2, "#s3src", "fade", {}],
    [ban, "#s3ban", "in", {}],
  ]);
  S(red - 0.3, "impact-bass-2.mp3", 0.2); S(green - 0.3, "success.mp3", 0.25); S(ban, "click-soft.mp3", 0.4);
}

// 04 — the 3–6 month course trap (4:07–5:27)
{
  const a = T(247.2), b = T(273.3), c = T(283.2), d = T(296.2), stamp = TW(["উল্টে"], 323, 5), end = T(327.6);
  scene("s4", 247.2, 327.6, `${chap(4, "৩–৬ মাসের কোর্সের ফাঁদ")}
  <div class="grp" id="s4a"><p class="ttl">৩–৬ মাসের <em>কম্পিউটার কোর্স</em></p><p class="sub">দোকানে গিয়ে ট্রেনিং নিয়ে শেখা</p>
    <div class="tiles">${tile("s4t0", "file-text", "ওয়ার্ড")}${tile("s4t1", "sheet", "এক্সেল")}${tile("s4t2", "presentation", "পাওয়ারপয়েন্ট")}</div></div>
  <div class="grp" id="s4b"><div class="chip gold big" id="s4now">${icon("hourglass", 40)}আজও চলছে!</div>
    <p class="ttl" id="s4q" style="margin-top:40px">এই কোর্সগুলোর <em>ফিউচার</em> কী?</p></div>
  <div class="grp" id="s4c"><div class="bigq">${icon("award", 130)}<p class="ttl">সার্টিফিকেটের <em>ভ্যালু</em> কোন পর্যন্ত?</p></div>
    <p class="sub center">যাঁরা অনুমোদন দিচ্ছেন, তাঁরা আসলে কেমন দক্ষ মানুষ চাইছেন?</p></div>
  <div class="grp top" id="s4d"><p class="ttl">এখনো কি <em>হাতে হাতে?</em></p>
    <div class="col" style="margin-top:28px;gap:16px">
      <div class="box row li" id="s4l0">${icon("file-text", 54)}<p class="sub">ওয়ার্ডে ম্যানুয়ালি টেবিল বানানো</p></div>
      <div class="box row li" id="s4l1">${icon("sheet", 54)}<p class="sub">এক্সেলে হাতে ডাটা সাজানো</p></div>
      <div class="box row li" id="s4l2">${icon("presentation", 54)}<p class="sub">পাওয়ারপয়েন্টে হাতে ডিজাইন</p></div></div>
    <div class="stamp" id="s4st">OUTDATED<span>পুরনো পদ্ধতি</span></div>
    <div class="box newway" id="s4new">${icon("bot", 64)}<div><div class="vh">AI অটোমেটেড সিস্টেম</div><p class="sub">গেমটা পুরো উল্টে গেছে</p></div></div></div>`,
  [
    ...grp("#s4a", a, b),
    [TW(["ওয়ার্ড"], 262, 6), "#s4t0", "pop", {}],
    [TW(["এক্সেল"], 263.5, 6), "#s4t1", "pop", {}],
    [TW(["পাওয়ারপয়েন্ট", "পাওয়ার"], 265, 6), "#s4t2", "pop", {}],
    ...grp("#s4b", b, c),
    [b + 0.2, "#s4now", "pop", {}],
    [TW(["ফিউচার"], 281, 5), "#s4q", "in", {}],
    ...grp("#s4c", c, d),
    [c, "#s4c .ico", "pop", {}],
    ...grp("#s4d", d, end),
    [TW(["টেবিল"], 300, 6), "#s4l0", "inx", {}],
    [TW(["ডাটা", "ডেটা"], 303, 6), "#s4l1", "inx", {}],
    [TW(["পাওয়ারপয়েন্টে", "ডিজাইন"], 306, 6), "#s4l2", "inx", {}],
    [stamp - 1.2, "#s4st", "stamp", {}],
    [stamp - 1.2, "#s4d .li", "dim", { to: 0.35 }],
    [stamp + 0.3, "#s4new", "in", {}],
  ]);
  [["ওয়ার্ড", 262], ["এক্সেল", 263.5], ["পাওয়ার", 265]].forEach(([n, t]) => S(TW(n, t, 6), "pop.mp3", 0.25));
  S(stamp - 1.2 + 0.32, "impact-bass-2.mp3", 0.25); S(stamp + 0.3, "success.mp3", 0.25);
}

// 05 — the horsepower shift (5:28–6:42)
{
  const a = T(327.8), end = T(402.2);
  const chips = [["সিদ্ধান্ত", ["ডিসিশন"], 388.5], ["প্ল্যান", ["প্ল্যান", "প্লান"], 390.5], ["রিসার্চ", ["রিসার্চ"], 392.5], ["বিল্ড", ["বিল্ড"], 395]];
  scene("s5", 327.8, 402.2, `${chap(5, "হর্সপাওয়ারের শিফট")}
  <div class="grp" id="s5a" style="opacity:1">
    <div class="hrow" id="s5r1">${tile("s5h", "chess-knight", "ঘোড়ার গাড়ি")}${arrow(110, "s5a1")}${tile("s5e", "car-front", "গাড়ির ইঞ্জিন")}<div class="chip gold" id="s5hp">${icon("gauge", 36)}হর্সপাওয়ার</div></div>
    <p class="sub" id="s5n1">ঘোড়ার শক্তি এখন ইঞ্জিনের ভেতরে: গাড়ি ঘোড়ার চেয়ে বেশি দৌড়ায়</p>
    <div class="hrow" id="s5r2">${tile("s5m", "brain", "মানুষের রুটিন কাজ")}${arrow(110, "s5a2")}${tile("s5b", "bot", "অটোনোমাস AI ইঞ্জিন", "gold")}</div>
    <div class="row chips4">${chips.map(([t], i) => `<div class="chip" id="s5c${i}">${t}</div>`).join("")}<div class="chip gold" id="s5all">সব একাই!</div></div></div>`,
  [
    [a + 0.3, "#s5h", "pop", {}],
    [TW(["হর্সপাওয়ার", "হর্স"], 344, 9), "#s5hp", "pop", {}],
    [TW(["ইঞ্জিন"], 361, 7), "#s5a1", "pop", { from: 0.4 }],
    [TW(["ইঞ্জিন"], 361, 7) + 0.3, "#s5e", "pop", {}],
    [TW(["দৌড়"], 366, 6), "#s5n1", "in", {}],
    [T(369.4), "#s5m", "pop", {}],
    [TW(["অটোমেট"], 383, 7), "#s5a2", "pop", { from: 0.4 }],
    [TW(["অটোমেট"], 383, 7) + 0.3, "#s5b", "pop", {}],
    ...chips.map(([, n, t], i) => [TW(n, t, 3), `#s5c${i}`, "pop", {}]),
    ...chips.map(([, n, t], i) => [TW(n, t, 3) + 0.25, `#s5c${i}`, "glow", { c: "rgba(0,245,212,1)", bgc: "rgba(0,245,212,0.18)", tc: "#FFFFFF" }]),
    [TW(["একা"], 398, 4), "#s5all", "pop", {}],
  ]);
  chips.forEach(([, n, t]) => S(TW(n, t, 3), "click.mp3", 0.3));
  S(TW(["ইঞ্জিন"], 361, 7), "whoosh-short.mp3", 0.3); S(TW(["অটোমেট"], 383, 7), "whoosh-short.mp3", 0.3); S(TW(["একা"], 398, 4), "ping.mp3", 0.3);
}

// 06 — 3 days vs 3 hours (7:22–8:18)
{
  const a = T(442.2), b = T(471.2), c = T(488.4), end = T(498.2), fast = TW(["ঘণ্টা", "ঘন্টা"], 486, 5);
  scene("s6", 442.2, 498.2, `${chap(6, "৩ দিন বনাম ৩ ঘণ্টা")}
  <div class="grp" id="s6a"><div class="box company">${icon("factory", 90)}<div class="col" style="gap:14px">
      <div class="vh">একটা কোম্পানি</div>
      <div class="row li2" id="s6l0">${icon("layers", 44)}<p class="sub">হাজার রকমের কাজ</p></div>
      <div class="row li2" id="s6l1">${icon("clock", 44)}<p class="sub">একেকটা কাজে ৩–৪ দিন</p></div>
      <div class="row li2" id="s6l2">${icon("wallet", 44)}<p class="sub">মাসে আউটপুট: ধরুন লাখ টাকা</p></div></div></div></div>
  <div class="grp" id="s6b"><p class="ttl">একই কাজ, <em>দুই পথে</em></p>
    <div class="bars">
      <div class="bl">ম্যানুয়াল কাজ</div><div class="track"><div class="hbar red" id="s6b0"></div></div><div class="bv" id="s6v0">৩–৪ দিন</div>
      <div class="bl">অটোমেশন + সিস্টেম ডিজাইন</div><div class="track"><div class="hbar green" id="s6b1"></div></div><div class="bv gold" id="s6v1">৩–৪ ঘণ্টা</div>
    </div></div>
  <div class="grp" id="s6c"><p class="ttl">সময় বাঁচলে, <em>কোম্পানি দৌড়ায়</em></p>
    <svg class="chart" width="1000" height="300" viewBox="0 0 1000 300"><path d="M0 290H1000M0 290V10" stroke="rgba(255,255,255,0.18)" stroke-width="2" fill="none"/>
      <path id="s6line" d="M10 270 C 220 255, 360 230, 500 170 S 800 60, 980 24" stroke="${C.green}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="1200" stroke-dashoffset="1200"/></svg>
    <div class="row chips3"><div class="chip green" id="s6k0">বেশি আউটপুট</div><div class="chip green" id="s6k1">বাঁচা সময়ে মার্কেটিং</div><div class="chip gold" id="s6k2">${icon("trending-up", 34)}দ্রুত গ্রো</div></div></div>`,
  [
    ...grp("#s6a", a, b),
    [a + 0.2, "#s6a .company", "in", {}],
    [TW(["হাজার"], 446, 6), "#s6l0", "inx", {}],
    [TW(["দিন"], 449, 6), "#s6l1", "inx", {}],
    [TW(["লাখ"], 458, 8), "#s6l2", "inx", {}],
    ...grp("#s6b", b, c),
    [b + 0.6, "#s6b0", "grow", { d: 2.2, ease: "power1.out" }],
    [b + 2.6, "#s6v0", "fade", {}],
    [fast - 0.2, "#s6b1", "grow", { d: 0.5 }],
    [fast + 0.2, "#s6v1", "pop", {}],
    ...grp("#s6c", c, end),
    [c + 0.3, "#s6line", "draw", { len: 1200, d: 2.4 }],
    [TW(["আউটপুট"], 489.5, 4), "#s6k0", "pop", {}],
    [TW(["মার্কেটিং"], 492, 4), "#s6k1", "pop", {}],
    [TW(["গ্রো"], 495.5, 4), "#s6k2", "pop", {}],
  ]);
  S(fast - 0.2, "whoosh-short.mp3", 0.35); S(fast + 0.2, "ping.mp3", 0.3); S(TW(["গ্রো"], 495.5, 4), "success.mp3", 0.25);
}

// 07 — upgrade humans, don't discard them (8:18–8:57)
{
  const a = T(498.4), b = T(510.2), c = T(519.2), d = T(528.2), end = T(537.2);
  scene("s7", 498.4, 537.2, `${chap(7, "মানুষকে বাদ নয়, আপগ্রেড")}
  <div class="grp" id="s7a"><div class="row fit" style="gap:20px;color:${C.cyan}">${icon("bot", 96)}${icon("user-round", 96)}</div>
    <p class="ttl" style="margin-top:24px">এজেন্টিক সিস্টেম কাজ করলে, <em>মানুষ কি আউট?</em></p></div>
  <div class="grp" id="s7b"><div class="eq">${tile("s7e0", "bot", "AI সিস্টেম")}<div class="op" id="s7p">+</div>${tile("s7e1", "user-round-plus", "আপগ্রেড হওয়া মানুষ")}<div class="op" id="s7q">=</div>${tile("s7e2", "building", "ভবিষ্যতের কোম্পানি", "gold")}</div>
    <p class="sub center" id="s7n">মানুষের পটেনশিয়াল খুঁজে বের করাই কোম্পানির দায়িত্ব</p></div>
  <div class="grp" id="s7c"><div class="box quote">${icon("message-square-quote", 70)}<p class="qt">“আমি এআই ব্যবহার করছি বলে আমার মানুষকে ফেলে দিতে পারি না। তাকেও যোগ্য করে গড়ে তুলতে হবে।”</p></div></div>
  <div class="grp" id="s7d"><div class="box goldbox"><p class="ttl">এআই আসা মানে মানুষ <em>অযোগ্য</em> না</p><p class="sub">এআই আসা মানে আপডেট হতে হবে, নতুন কিছু শিখতে হবে</p></div></div>`,
  [
    ...grp("#s7a", a, b),
    ...grp("#s7b", b, c),
    [b + 0.2, "#s7e0", "pop", {}], [b + 0.7, "#s7p", "pop", {}], [b + 1.0, "#s7e1", "pop", {}], [b + 1.6, "#s7q", "pop", {}], [b + 1.9, "#s7e2", "pop", {}],
    [b + 2.8, "#s7n", "in", {}],
    ...grp("#s7c", c, d),
    ...grp("#s7d", d, end),
  ]);
  S(b + 1.9, "chime.mp3", 0.25); S(d, "click-soft.mp3", 0.4);
}

// 08 — elders and kids, then the road ahead (8:57–10:46)
{
  const a = T(537.4), b = T(568.2), c = T(598.4), end = T(648.2), nao = TW(["নাও"], 586, 7);
  scene("s8", 537.4, 648.2, `${chap(8, "বুজুর্গ বনাম পোলাপান")}
  <div class="grp" id="s8a"><p class="ttl">আগে: আমরাই ছিলাম <em>এক্সপার্ট</em></p>
    <div class="chat">
      <div class="bub l" id="s8m0">${icon("user-round", 44)}<p>“মোবাইলের এই ফাংশনটা একটু শিখিয়ে দাও তো”</p></div>
      <div class="bub r" id="s8m1"><p>ঘটঘট করে ঠিক করে দিলাম</p>${icon("smartphone", 44)}</div>
      <div class="bub l" id="s8m2">${icon("user-round", 44)}<p>“ও বাবা! এটা কীভাবে পসিবল হলো!”</p></div></div></div>
  <div class="grp" id="s8b"><p class="ttl">এখন: <em>ভূমিকা উল্টে গেছে</em></p>
    <div class="chat">
      <div class="bub l" id="s8m3">${icon("user-round-cog", 44)}<p>টেক এক্সপার্ট: “এই কাজটা পারছি না…”</p></div>
      <div class="bub r gold" id="s8m4"><p>“এই নাও!”</p>${icon("bot", 44)}</div></div>
    <div class="row fit" style="gap:24px;margin-top:30px"><div class="chip red big" id="s8t0">আমরা = পোলাপান</div><div class="chip gold big" id="s8t1">AI এজেন্ট = বুজুর্গ</div></div></div>
  <div class="grp" id="s8c"><div class="wordmark" id="s8wm">ZUBAYER</div><div class="wmline" id="s8wl"></div>
    <p class="sub" style="margin-top:18px">সামনের পর্বগুলোতে যা আসছে</p>
    <div class="col" style="gap:16px;margin-top:20px">
      <div class="chip big" id="s8n0">${icon("monitor-play", 40)}রিয়েল স্ক্রিনে লাইভ প্রজেক্ট</div>
      <div class="chip big" id="s8n1">${icon("rocket", 40)}অ্যাপ আর SaaS সিস্টেম বিল্ড</div>
      <div class="chip big gold" id="s8n2">${icon("sparkles", 40)}প্রম্পট ইঞ্জিনিয়ারিং</div></div>
    <p class="next" id="s8en">Next: Live AI · Prompt Engineering · SaaS System Builds</p></div>`,
  [
    ...grp("#s8a", a, b),
    [TW(["মোবাইলের", "ফাংশন"], 540, 6), "#s8m0", "in", {}],
    [TW(["ঘটঘট", "ঠিক"], 553, 8), "#s8m1", "in", {}],
    [TW(["বাবা"], 562, 8), "#s8m2", "in", {}],
    ...grp("#s8b", b, c),
    [TW(["এক্সপার্ট"], 572, 6), "#s8m3", "in", {}],
    [nao - 0.1, "#s8m4", "pop", {}],
    [TW(["পোলাপান"], 592, 6), "#s8t0", "pop", {}],
    [TW(["বুজুর্গ"], 596, 6), "#s8t1", "pop", {}],
    ...grp("#s8c", c, end),
    [c + 0.2, "#s8wm", "in", { y: 40, d: 0.7 }],
    [c + 0.6, "#s8wl", "grow", { d: 0.8 }],
    [TW(["রিয়েল", "স্ক্রিনে"], 607, 8), "#s8n0", "inx", {}],
    [TW(["সাস", "SaaS", "অ্যাপ"], 614, 9), "#s8n1", "inx", {}],
    [TW(["প্রম্পট", "প্রমট"], 633, 9), "#s8n2", "inx", {}],
    [TW(["প্রম্পট", "প্রমট"], 633, 9) + 1.5, "#s8en", "fade", {}],
  ]);
  S(nao - 0.1, "pop.mp3", 0.35); S(c + 0.2, "whoosh-cinematic.mp3", 0.3);
  [[["রিয়েল", "স্ক্রিনে"], 607, 8], [["সাস", "SaaS", "অ্যাপ"], 614, 9], [["প্রম্পট", "প্রমট"], 633, 9]].forEach(([n, t, w]) => S(TW(n, t, w), "click.mp3", 0.3));
}

// layout: split stretches (camera in the card) and full-screen stretches
const splits = [
  { in: scenes[0].in - 0.15, out: snap(T(48.8)) },
  { in: scenes[1].in - 0.15, out: snap(T(161.2)) },
  { in: scenes[2].in - 0.15, out: snap(T(402.4)) },
  { in: scenes[5].in - 0.15, out: snap(T(648.4)) },
];

// keyword banners over the full-screen talk (and the cold open)
const lowers = [
  { t: Tc(W(["৯", "নয়"], 222.5, 4)) - 0.2, dur: 4.6, k: "<em>৯.২ কোটি</em> চাকরি", s: "২০৩০ সালের মধ্যে অবসোলিট হতে পারে" },
  { t: TW(["অবসোলিট"], 63, 5) - 0.2, dur: 4.2, k: "ছোট কাজ এড়ালে: <em>অবসোলিট</em>", s: "ধীরে ধীরে পিছিয়ে পড়া" },
  { t: T(77), dur: 5.0, k: "আগে সবাই শিওর ছিল", s: "“এই ক্যারিয়ারটাই সেফ”" },
  { t: TW(["কম্পিটিশন"], 89.5, 5) - 0.2, dur: 5.0, k: "কম্পিটিশন <em>বেড়েছে</em>", s: "দায়িত্বও আরও বেড়েছে" },
  { t: T(161.8), dur: 6.0, k: "টিকে থাকতে <em>সবচেয়ে জরুরি</em> কী?" },
  { t: TW(["তলোয়ার", "তলোয়ার"], 171, 6) - 0.2, dur: 6.0, k: "তলোয়ার? আশ্রয়কেন্দ্র?", s: "নাকি কিছুই করার নেই?" },
  { t: TW(["এজিআই", "AGI"], 184, 8) - 0.3, dur: 5.0, k: "<em>AGI</em> আসছে", s: "সবচেয়ে পাওয়ারফুল টেকনোলজি এসে পড়েছে" },
  { t: TW(["ডিসরাপ্ট", "ডিসর"], 206, 9) - 0.2, dur: 4.6, k: "সবকিছু <em>ডিসরাপ্ট</em> হচ্ছে" },
  { t: T(403.4), dur: 6.0, k: "রুটিন কাজে মানুষ লাগবে?", s: "প্রয়োজনই নাই!" },
  { t: T(412), dur: 5.6, k: "“এআই চাকরি খেয়ে দিবে”", s: "ইউটিউবার আর ফেসবুকের গুরুদের কথা" },
  { t: T(425.5), dur: 7.0, k: "শেখার আগ্রহের চেয়ে <em>ভয়</em> বেশি", s: "এআই আসার পর মানুষের মনের অবস্থা" },
  { t: snap(T(648.4)) + 0.9, dur: Math.max(6, T(665) - snap(T(648.4)) - 1.4), k: "অতীত নিয়ে নয়, <em>ভবিষ্যৎ</em> গড়তে হবে", s: "বর্তমানের ভিত্তি শক্ত করে ভবিষ্যতের পৃথিবী গড়া" },
];

// a banner must be gone before the camera moves into the card (design-lint card_straddle at 3:36)
for (const l of lowers) {
  const next = splits.find((sp) => sp.in > l.t);
  if (next && l.t + l.dur > next.in - 0.25) l.dur = Math.max(1.5, next.in - 0.25 - l.t);
}

// title and end cards
const ti = map.title, en = map.end;
const extraHtml = `
      <div id="title-card" class="clip card-full" data-start="${ti.out0}" data-duration="${(ti.out1 - ti.out0).toFixed(3)}" data-track-index="2">
        <div class="tc-in" id="tcin"><div class="tc-ep" id="tcep">EP ০১</div>
          <div class="tc-t1" id="tct1">The Age of AI</div><div class="tc-t2" id="tct2">&amp; Systems Thinking</div>
          <div class="tc-line" id="tcl"></div><div class="tc-bn" id="tcbn">${ep.titleBn}</div><div class="tc-by" id="tcby">By <b>Zubayer</b></div></div></div>
      <div id="end-card" class="clip card-full" data-start="${en.out0}" data-duration="${(en.out1 - en.out0).toFixed(3)}" data-track-index="2">
        <div class="tc-in" id="ecin"><div class="wordmark big" id="ecwm">ZUBAYER</div><div class="wmline" id="ecl"></div>
          <div class="tc-bn" id="ecbn">ধন্যবাদ, পরের পর্বে আবার দেখা হবে</div><div class="tc-by" id="ecby">The Age of AI &amp; Systems Thinking · EP 01</div></div>
        <div class="blackout" id="ecbo"></div></div>`;
const t0 = ti.out0, e0 = en.out0;
const extraJs = `
  tl.fromTo("#tcep", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false }, ${t0 + 0.15});
  tl.fromTo("#tct1", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: "power4.out", immediateRender: false }, ${t0 + 0.3});
  tl.fromTo("#tct2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power4.out", immediateRender: false }, ${t0 + 0.55});
  tl.fromTo("#tcl", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, ${t0 + 0.8});
  tl.fromTo("#tcbn", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", immediateRender: false }, ${t0 + 1.05});
  tl.fromTo("#tcby", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, ${t0 + 1.35});
  tl.to("#tcin", { opacity: 0, y: -24, duration: 0.4, ease: "power2.in" }, ${ti.out1 - 0.45});
  tl.fromTo("#ecwm", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "power4.out", immediateRender: false }, ${e0 + 0.1});
  tl.fromTo("#ecl", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, ${e0 + 0.45});
  tl.fromTo("#ecbn", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, ${e0 + 0.7});
  tl.fromTo("#ecby", { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, ${e0 + 0.95});
  tl.fromTo("#ecbo", { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.in", immediateRender: false }, ${en.out1 - 0.75});`;
S(t0 + 0.05, "whoosh-cinematic.mp3", 0.35); S(t0 + 0.32, "impact-bass-1.mp3", 0.3); S(e0 + 0.1, "chime.mp3", 0.25);

const css = `
.hi { color: #fff; }
.ttl + .sub { margin-top: 22px; }
.bigq + .sub { margin-top: 30px; }
.center { text-align: center; }
.qbox { position: relative; height: 470px; margin-top: 24px; }
.qbox .chip { position: absolute; font-size: 34px; }
.qbox .chip .ico { color: ${C.gold}; }
.box.row { gap: 28px; padding: 24px 32px; }
.box.row .ico, .li2 .ico, .bigq .ico { color: ${C.cyan}; }
.steps { margin-top: 56px; gap: 14px; }
.step { border-radius: 18px; border: 2px solid rgba(0,245,212,0.55); background: rgba(0,245,212,0.07); padding: 18px 26px 14px; font-weight: 700; font-size: 36px; display: flex; gap: 12px; align-items: center; }
.step.goal { border-color: rgba(255,215,0,0.6); background: rgba(255,215,0,0.08); color: ${C.gold}; }
.prog { margin-top: 56px; height: 22px; border-radius: 11px; background: rgba(255,255,255,0.08); overflow: hidden; }
.prog .fill { height: 100%; width: 100%; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); transform-origin: 0 50%; border-radius: 11px; }
.pct { margin-top: 18px; display: flex; align-items: baseline; gap: 18px; font-weight: 600; font-size: 34px; color: #C9D4E6; }
.pct .num { font-size: 64px; color: ${C.gold}; }
.bigq { display: flex; flex-direction: column; align-items: center; gap: 26px; text-align: center; }
.ttl.big { font-size: 84px; }
.bigq .ico { color: ${C.gold}; }
.wall { position: absolute; left: 0; right: 0; top: 330px; display: flex; flex-direction: column; align-items: center; gap: 16px; opacity: 0; color: ${C.cyan}; }
.bricks { display: grid; grid-template-columns: repeat(5, 150px); gap: 12px; }
.brick { height: 62px; border-radius: 8px; background: linear-gradient(180deg, rgba(0,245,212,0.30), rgba(0,245,212,0.12)); border: 2px solid rgba(0,245,212,0.55); }
.swords { position: absolute; right: 30px; top: 110px; color: ${C.red}; opacity: 0; }
.vs { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 10px; }
.vcol { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; padding: 32px 34px; min-height: 520px; }
.vcol .ico { color: ${C.muted}; }
.vcol.now { border-color: rgba(255,215,0,0.55); background: rgba(255,215,0,0.05); }
.vcol.now .ico { color: ${C.gold}; }
.vh { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 50px; line-height: 1.2; color: #fff; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 36px; }
.stat { padding: 30px 34px; }
.stat .num { font-size: 92px; }
.stat.red { border-color: rgba(255,77,109,0.65); background: rgba(255,77,109,0.06); }
.stat.red .num { color: ${C.red}; }
.stat.green { border-color: rgba(16,185,129,0.7); background: rgba(16,185,129,0.06); }
.stat.green .num { color: ${C.green}; }
.stat .sl { font-weight: 600; font-size: 32px; color: #DCE4F0; margin-top: 8px; }
#s3src { margin: 18px 0 0; }
.banner { margin-top: 30px; display: flex; align-items: center; gap: 26px; border-color: rgba(255,215,0,0.55); background: rgba(255,215,0,0.06); }
.banner .ico { color: ${C.gold}; }
.tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 48px; }
.tile { display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 34px 20px 26px; border-radius: 22px; border: 2px solid ${C.line}; background: rgba(255,255,255,0.045); color: ${C.cyan}; text-align: center; }
.tile .tl { font-weight: 700; font-size: 34px; line-height: 1.3; color: #fff; }
.tile.gold { border-color: rgba(255,215,0,0.6); background: rgba(255,215,0,0.06); color: ${C.gold}; }
.chip.big { font-size: 38px; padding: 14px 30px 12px; }
.li .ico { color: ${C.muted}; }
.stamp { position: absolute; right: 30px; top: 150px; padding: 14px 30px 10px; border: 6px solid ${C.red}; border-radius: 14px; color: ${C.red}; font-family: "Inter", sans-serif; font-weight: 900; font-size: 64px; letter-spacing: 0.06em; line-height: 1; text-align: center; opacity: 0; background: rgba(11,15,25,0.7); }
.stamp span { display: block; font-family: "Hind Siliguri", sans-serif; font-weight: 700; font-size: 30px; letter-spacing: 0; margin-top: 8px; }
.newway { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 28px; border-color: rgba(16,185,129,0.75); background: rgba(16,185,129,0.10); opacity: 0; }
.newway .ico { color: ${C.green}; }
.hrow { display: flex; align-items: center; gap: 22px; }
.hrow .tile { width: 300px; padding: 22px 16px 18px; }
.hrow .tile .tl { font-size: 30px; }
#s5hp { margin-left: 14px; }
#s5n1 { margin: 16px 0 26px; }
.chips4 { margin-top: 34px; gap: 16px; flex-wrap: wrap; }
.company { display: flex; gap: 36px; align-items: flex-start; padding: 40px 44px; margin-top: 20px; }
.company > .ico { color: ${C.gold}; }
.li2 { gap: 18px; opacity: 0; }
.bars { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 50px; }
.bl { font-weight: 600; font-size: 32px; color: #DCE4F0; margin-top: 20px; }
.track { height: 54px; border-radius: 14px; background: rgba(255,255,255,0.06); overflow: hidden; }
.hbar { height: 100%; border-radius: 14px; transform-origin: 0 50%; }
.hbar.red { width: 100%; background: linear-gradient(90deg, rgba(255,77,109,0.55), ${C.red}); }
.hbar.green { width: 13%; background: linear-gradient(90deg, rgba(16,185,129,0.6), ${C.green}); }
.bv { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 46px; color: ${C.red}; opacity: 0; }
.bv.gold { color: ${C.gold}; }
.chart { display: block; margin-top: 30px; }
.chips3 { margin-top: 26px; gap: 18px; }
.eq { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 70px; }
.eq .tile { width: 280px; padding: 30px 14px 24px; }
.eq .tile .tl { font-size: 30px; }
.op { font-family: "Inter", sans-serif; font-weight: 800; font-size: 72px; color: ${C.cyan}; width: 54px; text-align: center; }
#s7n { margin-top: 50px; }
.quote { margin-top: 60px; display: flex; gap: 30px; align-items: flex-start; padding: 44px 46px; border-color: rgba(0,245,212,0.45); }
.quote .ico { color: ${C.cyan}; }
.qt { margin: 0; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 700; font-size: 50px; line-height: 1.35; color: #fff; text-wrap: balance; }
.goldbox { margin-top: 90px; padding: 46px 48px; border-color: rgba(255,215,0,0.65); background: rgba(255,215,0,0.07); }
.goldbox .sub { margin-top: 18px; }
.chat { display: flex; flex-direction: column; gap: 20px; margin-top: 40px; }
.bub { display: flex; align-items: center; gap: 18px; max-width: 860px; padding: 20px 28px; border-radius: 26px; background: rgba(255,255,255,0.06); border: 2px solid ${C.line}; color: ${C.muted}; opacity: 0; }
.bub p { margin: 0; font-weight: 600; font-size: 34px; line-height: 1.35; color: #fff; }
.bub.l { align-self: flex-start; border-bottom-left-radius: 6px; }
.bub.r { align-self: flex-end; border-bottom-right-radius: 6px; border-color: rgba(0,245,212,0.5); background: rgba(0,245,212,0.08); color: ${C.cyan}; }
.bub.r.gold { border-color: rgba(255,215,0,0.7); background: rgba(255,215,0,0.10); color: ${C.gold}; }
.bub.r.gold p { font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-weight: 800; font-size: 54px; color: ${C.gold}; }
.wordmark { font-family: "Inter", sans-serif; font-weight: 900; font-size: 104px; letter-spacing: 0.14em; line-height: 1; color: #fff; }
.wordmark.big { font-size: 150px; }
.wmline { width: 420px; height: 6px; margin-top: 18px; border-radius: 3px; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); transform-origin: 0 50%; }
.next { margin: 22px 0 0; font-family: "Inter", sans-serif; font-weight: 600; font-size: 26px; color: ${C.muted}; opacity: 0; }
#title-card, #end-card { background: ${C.bg};
  background-image: radial-gradient(ellipse at 50% 45%, rgba(0,245,212,0.14), rgba(11,15,25,0) 60%), linear-gradient(rgba(0,245,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 64px 64px, 64px 64px; display: flex; align-items: center; justify-content: center; }
.tc-in { display: flex; flex-direction: column; align-items: center; text-align: center; }
.tc-ep { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-weight: 700; font-size: 30px; color: ${C.bg}; background: ${C.cyan}; border-radius: 10px; padding: 6px 16px 4px; opacity: 0; }
.tc-t1 { font-family: "Inter", sans-serif; font-weight: 900; font-size: 132px; line-height: 1.05; color: #fff; margin-top: 30px; opacity: 0; }
.tc-t2 { font-family: "Inter", sans-serif; font-weight: 800; font-size: 84px; line-height: 1.1; color: ${C.cyan}; opacity: 0; }
.tc-line { width: 560px; height: 6px; margin-top: 32px; border-radius: 3px; background: linear-gradient(90deg, ${C.cyan}, ${C.gold}); }
.tc-bn { font-weight: 600; font-size: 44px; color: #DCE4F0; margin-top: 26px; opacity: 0; }
.tc-by { font-family: "Inter", sans-serif; font-weight: 500; font-size: 34px; color: ${C.muted}; margin-top: 14px; opacity: 0; }
.tc-by b { color: ${C.gold}; font-weight: 800; }
#end-card .wmline { width: 640px; transform-origin: 50% 50%; }
#ecwm, #ecbn, #ecby { opacity: 0; }
.blackout { position: absolute; inset: 0; background: #000; opacity: 0; }
`;

// ---- assemble ----------------------------------------------------------------------------------------------
const { html, pages } = buildPage({ map, words, splits, scenes, lowers, title: ep, sfx, css, extraHtml, extraJs });
writeFileSync(path.join(ep.dir, "index.html"), html);
sfx.sort((a, b) => a.t - b.t);
writeJSON(path.join(ep.work, "sfx.json"), sfx);

// project assets: fonts + GSAP copied in; the heavy media folder is a junction to the work drive
const A = path.join(ep.dir, "assets");
mkdirSync(path.join(A, "fonts"), { recursive: true });
for (const f of ["bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf"])
  cpSync(path.join(WORKSPACE, "assets", "fonts", f), path.join(A, "fonts", path.basename(f)));
cpSync(path.join(WORKSPACE, "assets", "js", "gsap"), path.join(A, "js", "gsap"), { recursive: true });
if (!existsSync(path.join(A, "media"))) symlinkSync(path.join(ep.work, "media"), path.join(A, "media"), "junction");
if (!existsSync(path.join(ep.dir, "hyperframes.json")))
  writeJSON(path.join(ep.dir, "hyperframes.json"), { $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } });
console.log(`index.html: ${map.total} s, ${map.segments.length} camera pieces, ${scenes.length} scenes, ${lowers.length} banners, ${pages.length} caption pages (${words.length} words), ${sfx.length} sound cues`);
