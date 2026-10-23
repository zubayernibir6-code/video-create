// Builds index.html from the word timings of voiceover1.
//   node build-page.mjs [words.json]
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const wordsPath = process.argv[2] || "D:/Video Create/.cache/voiceover1.words.json";
const words = JSON.parse(readFileSync(wordsPath, "utf8"));
// The full pass swallowed ~10 s into one word. A second pass of that slice recovered the line.
const gapFile = "D:/Video Create/.cache/vo1-gap.words.json";
if (wordsPath.includes("voiceover1") && existsSync(gapFile)) {
  const OFF = 37.2;
  const extra = JSON.parse(readFileSync(gapFile, "utf8"))
    .filter((w) => w.end - w.start > 0.04 && w.text !== "ফোর")
    .map((w) => ({ text: w.text, start: Math.round((w.start + OFF) * 1000) / 1000, end: Math.round((w.end + OFF) * 1000) / 1000 }))
    .filter((w) => w.start < 48.9);
  const kept = words.filter((w) => w.start < 37.15 || w.start >= 48.9);
  const merged = [...kept.filter((w) => w.start < 37.15), ...extra, ...kept.filter((w) => w.start >= 48.9)];
  merged.sort((a, b) => a.start - b.start);
  words.length = 0;
  merged.forEach((w, i) => words.push({ id: `w${i}`, text: w.text, start: w.start, end: Math.max(w.end, w.start + 0.04) }));
}
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  const next = words[i + 1];
  if (w.end - w.start > 1.5) w.end = Math.min(w.start + 0.8, next ? next.start : w.end);
}
const FPS = 24;
const q = (t) => Math.round(Math.max(0, t) * FPS) / FPS;
const PLATE = 1541 / FPS; // 64.208333 — the footage is exactly 1541 frames
const TOTAL = 88.5; // voice file is 88.48 s; 88.5 s is an exact frame

const ONE = new Map(Object.entries({
  "ক্লড": "Claude",
  "ক্লদ": "Claude",
  "ক্লট": "Claude",
  "ক্লদের": "Claude-এর",
  "ক্লটের": "Claude-এর",
  "ক্লডে": "Claude-এ",
  "ক্লটে": "Claude-এ",
  "ইউজেজ": "Usage",
  "ইউসেজ": "Usage",
  "লিমিট": "Limit",
  "এন্টারপ্রাইজ": "Enterprise",
  "ওয়ার্কস্পেস": "Workspace",
  "ওয়ার্কশপেস": "Workspace",
  "বিকাশ": "bKash",
  "নগদ": "Nagad",
  "নগদে": "Nagad-এ",
  "টেনএক্স": "10X",
  "প্লেবুক": "Playbook",
  "ইনবক্স": "inbox",
  "ম্যাক্স": "Max",
  "শেয়ার্ড": "shared",
  "কুকির": "cookie-র",
  "কুকি": "cookie",
  "কাউরেজ": "কভারেজ",
  "এক্সক্লুসি": "এক্সক্লুসিভ",
  "ইমেলে": "ইমেইলে",
  "ত্রুপুট": "throughput",
  "ফ্ল্যাগশিপ": "flagship",
  "শতভ": "শতভাগ",
  "ফাইভএক্স": "5X",
  "এজেন্টি": "এজেন্টিক",
  "এনভায়রনমেন্ট": "environment",
}));

const PHRASES = [
  [["ফাইভ", "এক্স", "ম্যাক্স"], "5X Max"],
  [["ফাইভ", "এক্স"], "5X"],
  [["টেন", "এক্স"], "10X"],
  [["নেক্সট", "চেন"], "next-gen"],
  [["ইউজেজ", "লিমিট"], "Usage Limit"],
  [["ইউসেজ", "লিমিট"], "Usage Limit"],
];

function displayWord(raw) {
  return ONE.get(raw) || raw;
}

function tokensFrom(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    let hit = null;
    for (const [seq, label] of PHRASES) {
      if (seq.every((s, k) => list[i + k] && list[i + k].text === s)) {
        hit = { seq, label };
        break;
      }
    }
    if (hit) {
      const slice = list.slice(i, i + hit.seq.length);
      out.push({
        id: slice[0].id,
        text: hit.label,
        start: slice[0].start,
        end: slice[slice.length - 1].end,
      });
      i += hit.seq.length - 1;
    } else {
      const w = list[i];
      out.push({ id: w.id, text: displayWord(w.text), start: w.start, end: w.end });
    }
  }
  return out;
}

function glen(s) {
  return [...s].length;
}

function splitLines(toks) {
  if (toks.length <= 4) return [toks];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < toks.length; i++) {
    const a = glen(toks.slice(0, i).map((t) => t.text).join(" "));
    const b = glen(toks.slice(i).map((t) => t.text).join(" "));
    const diff = Math.abs(a - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [toks.slice(0, best), toks.slice(best)];
}

function buildCues(toks) {
  const cues = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    cues.push({
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      lines: splitLines(cur),
    });
    cur = [];
  };
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i];
    const prev = cur[cur.length - 1];
    const gap = prev ? w.start - prev.end : 0;
    const dur = prev ? w.end - cur[0].start : 0;
    if (cur.length && (gap > 0.34 || cur.length >= 8 || dur > 3.15)) flush();
    cur.push(w);
  }
  flush();
  for (let i = 0; i < cues.length; i++) {
    const next = cues[i + 1];
    const cap = next ? next.start - 1 / FPS : cues[i].end + 0.28;
    if (next && next.start - cues[i].end < 0.42) cues[i].end = cap;
    else cues[i].end = Math.min(cues[i].end + 0.12, cap);
    cues[i].start = q(cues[i].start);
    cues[i].end = q(Math.max(cues[i].end, cues[i].start + 1 / FPS));
  }
  return cues;
}

function findAt(needle, after = 0) {
  const w = words.find((x) => x.start >= after && x.text.includes(needle));
  return w ? w.start : null;
}

const plateQ = q(PLATE);
const freeRaw = findAt("ফ্রি", plateQ - 0.3) ?? plateQ + 4;
const coverRaw = findAt("শতভাগ", freeRaw - 0.2) ?? findAt("ওয়ারেন্টি", plateQ) ?? freeRaw + 6;
const ctaRaw = findAt("কমেন্ট", plateQ) ?? coverRaw + 6;
const beats = [
  { id: "mail", t: plateQ },
  { id: "free", t: q(Math.max(freeRaw, plateQ + 3)) },
  { id: "cover", t: q(Math.max(coverRaw, freeRaw + 3)) },
  { id: "cta", t: q(Math.max(ctaRaw, coverRaw + 3)) },
];

const beatEnd = (i) => (beats[i + 1] ? beats[i + 1].t : TOTAL);
const at = (id) => beats.find((b) => b.id === id);

const toks = tokensFrom(words);
const cues = buildCues(toks);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const cueHtml = cues.map((c, i) => {
  const lines = c.lines.map((line) => {
    const spans = line.map((t) => `<span id="${t.id}" class="w">${esc(t.text)}</span>`).join(" ");
    return `<span class="line">${spans}</span>`;
  }).join("");
  return `<div id="cue-${i}" class="cue"><div class="cue-inner">${lines}</div></div>`;
}).join("\n        ");

const tailHtml = `
      <div id="mark">Claude</div>
      <section id="beat-mail" class="beat">
        <svg class="env" viewBox="0 0 220 150" width="250" height="170" aria-hidden="true">
          <rect x="10" y="28" width="200" height="108" rx="16" fill="none" stroke="#F6F1E8" stroke-width="3"/>
          <path d="M16 34 L110 96 L204 34" fill="none" stroke="#E7B9A4" stroke-width="3"/>
        </svg>
        <p class="eyebrow">আপনার নিজের ইমেইলে</p>
        <p id="hero-mail" class="hero">ইনভিট</p>
        <div class="rule" id="rule-mail"></div>
        <p class="deck">অফিশিয়াল Claude Workspace</p>
      </section>
      <section id="beat-free" class="beat">
        <p class="eyebrow">সাথে ফ্রি</p>
        <div class="offer offer-main" id="offer-main">
          <span class="offer-kicker">10X</span>
          <span class="offer-title">Playbook</span>
        </div>
        <p class="deck late" id="tok-line">টোকেন অপটিমাইজেশন</p>
        <div class="offer offer-sub" id="offer-inv"><span class="offer-title">অফিশিয়াল ইনভয়েস</span></div>
        <div class="rule" id="rule-free"></div>
      </section>
      <section id="beat-cover" class="beat">
        <p class="eyebrow">সাবস্ক্রিপশনে</p>
        <p id="hero-cover" class="hero">শতভাগ</p>
        <div class="rule" id="rule-cover"></div>
        <p class="deck">ফুল টার্ম ওয়ারেন্টি</p>
        <div class="offer offer-sub" id="cover-rep"><span class="offer-title">রিপ্লেসমেন্ট কভারেজ</span></div>
        <p class="limited" id="slot-note">স্লট সীমিত</p>
        <p class="deck late" id="plan-line">প্ল্যান ও প্রাইসিং — কমেন্টে</p>
      </section>
      <section id="beat-cta" class="beat">
        <p class="eyebrow">এখনই</p>
        <p class="cta-verb">কমেন্ট করুন</p>
        <p class="cta-word">CLAUDE</p>
        <div class="rule rule-cta" id="rule-cta"></div>
        <p class="cta-or">অথবা সরাসরি ইনবক্স করুন</p>
      </section>`;

function wordSets() {
  const lines = [];
  for (const t of toks) {
    lines.push(`  tl.set("#${t.id}", { color: "#F3C7B0" }, ${q(t.start)});`);
    lines.push(`  tl.set("#${t.id}", { color: "#F7F3EA" }, ${q(t.end)});`);
  }
  return lines.join("\n");
}

function cueSets() {
  return cues.map((c, i) =>
    `  tl.set("#cue-${i}", { autoAlpha: 1 }, ${c.start});\n  tl.set("#cue-${i}", { autoAlpha: 0 }, ${c.end});`
  ).join("\n");
}

const mail = at("mail");
const free = at("free");
const cover = at("cover");
const cta = at("cta");
const inside = (needle, start, end, fallback) => {
  const t = findAt(needle, start - 0.05);
  if (t == null || t >= end - 0.3) return q(fallback);
  return q(Math.max(t, start));
};
const tokT = inside("টোকেন", free.t, cover.t, free.t + 1.5);
const invT = inside("ইনভয়েস", free.t, cover.t, free.t + 3.2);
const repT = inside("রিপ্লেসমেন্ট", cover.t, cta.t, cover.t + 1.1);
const slotT = inside("স্লট", cover.t, cta.t, cover.t + 3.8);
const planT = inside("প্ল্যান", cover.t, cta.t, cover.t + 6.2);

const anim = `
  tl.fromTo("#tail",
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 0.62, ease: "power3.inOut", immediateRender: false },
    ${q(plateQ - 0.04)});
  tl.fromTo("#stage",
    { scale: 0.975 },
    { scale: 1, duration: 0.72, ease: "power2.out", immediateRender: false },
    ${q(plateQ - 0.04)});

  tl.fromTo("#beat-mail", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out", immediateRender: false }, ${mail.t});
  tl.fromTo("#rule-mail", { scaleX: 0 }, { scaleX: 1, duration: ${Math.max(1.1, beatEnd(0) - mail.t - 0.9).toFixed(3)}, ease: "power1.out", immediateRender: false }, ${q(mail.t + 0.25)});
  tl.to("#beat-mail", { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, ${q(free.t - 0.2)});

  tl.set("#beat-free", { autoAlpha: 1 }, ${free.t});
  tl.fromTo("#offer-main", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", immediateRender: false }, ${free.t});
  tl.fromTo("#tok-line", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", immediateRender: false }, ${tokT});
  tl.fromTo("#offer-inv", { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, ${invT});
  tl.fromTo("#rule-free", { scaleX: 0 }, { scaleX: 1, duration: ${Math.max(1.2, cover.t - free.t - 1.3).toFixed(3)}, ease: "power1.out", immediateRender: false }, ${q(free.t + 0.35)});
  tl.to("#beat-free", { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, ${q(cover.t - 0.2)});

  tl.fromTo("#beat-cover", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out", immediateRender: false }, ${cover.t});
  tl.fromTo("#rule-cover", { scaleX: 0 }, { scaleX: 1, duration: ${Math.max(1.4, cta.t - cover.t - 1.3).toFixed(3)}, ease: "power1.out", immediateRender: false }, ${q(cover.t + 0.3)});
  tl.fromTo("#cover-rep", { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, ${repT});
  tl.fromTo("#slot-note", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, ${slotT});
  tl.fromTo("#plan-line", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, ${planT});
  tl.to("#beat-cover", { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, ${q(cta.t - 0.2)});
  tl.to("#mark", { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, ${q(cta.t - 0.2)});

  tl.fromTo("#beat-cta", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.48, ease: "power3.out", immediateRender: false }, ${cta.t});
  tl.fromTo("#rule-cta", { scaleX: 0 }, { scaleX: 1, duration: ${Math.max(1.3, TOTAL - cta.t - 1.05).toFixed(3)}, ease: "power1.inOut", immediateRender: false }, ${q(cta.t + 0.35)});
`;

const sfx = (id, file, hit, lead, dur, vol, track) =>
  `      <audio id="${id}" src="assets/sfx/${file}" data-start="${q(hit - lead)}" data-duration="${dur}" data-track-index="${track}" data-volume="${vol}"></audio>`;

const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 400; src: url("assets/fonts/HindSiliguri-Regular.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Hind Siliguri"; font-style: normal; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Baloo Da 2"; font-style: normal; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }
      @font-face { font-family: "Noto Sans Bengali"; font-style: normal; font-weight: 100 900; src: url("assets/fonts/NotoSansBengali-Variable.ttf") format("truetype"); font-display: block; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: #0C0B0A;
      }
      #root {
        position: relative;
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: #0C0B0A;
        font-family: "Hind Siliguri", "Noto Sans Bengali", sans-serif;
        color: #F7F3EA;
      }
      #plate {
        position: absolute;
        left: 0;
        top: 0;
        width: 1080px;
        height: 1920px;
        object-fit: cover;
        z-index: 1;
      }
      #scrim {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 520px;
        z-index: 2;
        background: linear-gradient(to top, rgba(8, 7, 6, 0.88) 0%, rgba(8, 7, 6, 0.45) 46%, rgba(8, 7, 6, 0) 100%);
      }
      #tail {
        position: absolute;
        inset: 0;
        z-index: 4;
        background: #0C0B0A;
        clip-path: inset(100% 0% 0% 0%);
      }
      #stage {
        position: absolute;
        inset: 0;
        transform: scale(0.975);
        transform-origin: 50% 40%;
      }
      #mark {
        position: absolute;
        top: 78px;
        left: 88px;
        font-family: "Baloo Da 2", "Hind Siliguri", sans-serif;
        font-size: 34px;
        font-weight: 700;
        line-height: 1;
        color: #F7F3EA;
      }
      .beat {
        position: absolute;
        left: 88px;
        right: 88px;
        top: 160px;
        bottom: 460px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
      }
      .eyebrow {
        font-size: 30px;
        font-weight: 600;
        line-height: 1.35;
        color: #F7F3EA;
        margin-bottom: 8px;
      }
      .hero {
        font-family: "Baloo Da 2", "Hind Siliguri", sans-serif;
        font-weight: 700;
        font-size: 112px;
        line-height: 1.7;
        color: #F3C7B0;
        margin-top: 12px;
      }
      .rule {
        width: 280px;
        height: 4px;
        margin: 18px 0 22px;
        background: #E7B9A4;
        transform: scaleX(0);
        transform-origin: left center;
      }
      .deck {
        font-size: 40px;
        font-weight: 600;
        line-height: 1.35;
        color: #F7F3EA;
        max-width: 820px;
      }
      .deny {
        display: flex;
        align-items: center;
        gap: 18px;
        margin-top: 28px;
        opacity: 0;
        visibility: hidden;
      }
      .deny span {
        font-size: 38px;
        font-weight: 600;
        line-height: 1.3;
        color: #F7F3EA;
      }
      .cross { flex: 0 0 auto; }
      .env { display: block; margin-bottom: 28px; }
      .offer {
        position: relative;
        display: block;
        background: #1A1816;
        border-radius: 22px;
        padding: 26px 32px 24px;
        margin-top: 18px;
        opacity: 0;
        visibility: hidden;
      }
      .offer-main {
        width: 100%;
        background: #241C18;
        padding: 32px 32px 28px;
        margin-top: 8px;
      }
      .offer-kicker {
        display: block;
        font-family: "Baloo Da 2", "Hind Siliguri", sans-serif;
        font-size: 84px;
        font-weight: 700;
        line-height: 1.7;
        color: #F3C7B0;
      }
      .offer-title {
        display: block;
        font-family: "Baloo Da 2", "Hind Siliguri", sans-serif;
        font-size: 44px;
        font-weight: 700;
        line-height: 1.45;
        color: #F7F3EA;
        margin-top: 4px;
      }
      .offer-main .offer-title { font-size: 54px; }
      .offer-sub { width: 78%; }
      .offer-b { width: 88%; margin-left: 8%; background: #161513; }
      .offer-subline {
        display: block;
        margin-top: 6px;
        font-family: "Hind Siliguri", "Noto Sans Bengali", sans-serif;
        font-size: 28px;
        font-weight: 600;
        line-height: 1.3;
        color: #F7F3EA;
      }
      .late { opacity: 0; visibility: hidden; }
      #plan-line { margin-top: 56px; }
      .limited {
        margin-top: 28px;
        font-size: 32px;
        font-weight: 700;
        line-height: 1.3;
        color: #F3C7B0;
        opacity: 0;
        visibility: hidden;
      }
      .cta-verb {
        font-size: 42px;
        font-weight: 600;
        line-height: 1.35;
        color: #F7F3EA;
        margin-bottom: 4px;
      }
      .cta-word {
        font-family: "Baloo Da 2", "Hind Siliguri", sans-serif;
        font-weight: 700;
        font-size: 120px;
        line-height: 1.7;
        color: #F7F3EA;
        margin-top: 0;
      }
      .rule-cta { width: 420px; margin-top: 16px; }
      .cta-or {
        margin-top: 8px;
        font-size: 34px;
        font-weight: 600;
        line-height: 1.35;
        color: #F7F3EA;
        max-width: 760px;
      }
      #subs {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 128px;
        z-index: 6;
        height: 280px;
      }
      .cue {
        position: absolute;
        left: 64px;
        right: 64px;
        bottom: 0;
        opacity: 0;
        visibility: hidden;
      }
      .cue-inner {
        display: inline-block;
        max-width: 940px;
        background: rgba(12, 11, 10, 0.94);
        border-left: 6px solid #E7B9A4;
        border-radius: 0 18px 18px 0;
        padding: 20px 28px 18px 24px;
        text-wrap: balance;
      }
      .line { display: block; }
      .w {
        font-family: "Hind Siliguri", "Noto Sans Bengali", sans-serif;
        font-weight: 700;
        font-size: 54px;
        line-height: 1.34;
        color: #F7F3EA;
        margin-right: 0.32em;
      }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920" data-fps="24">
      <video id="plate" class="clip" src="assets/footage/plate.mp4" muted data-start="0" data-duration="${plateQ}" data-track-index="1" data-volume="0"></video>
      <div id="scrim" class="clip" data-start="0" data-duration="${plateQ}" data-track-index="2"></div>
      <div id="tail" class="clip" data-start="${q(plateQ - 0.5)}" data-duration="${q(TOTAL - (plateQ - 0.5))}" data-track-index="3">
        <div id="stage">${tailHtml}
        </div>
      </div>
      <div id="subs" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="6">
        ${cueHtml}
      </div>

      <audio id="vo" src="assets/audio/voiceover1.wav" data-start="0" data-duration="88.48" data-track-index="12" data-volume="1"></audio>
      <audio id="bgm" src="assets/audio/bgm-bed.mp3" data-start="0" data-duration="${TOTAL}" data-track-index="8" data-volume="1"></audio>
      ${sfx("sfx-wipe", "whoosh-short.mp3", plateQ, 0.011, 0.49, 0.18, 20)}
      ${sfx("sfx-free", "pop.mp3", free.t, 0.116, 0.72, 0.16, 21)}
      ${sfx("sfx-cta", "chime.mp3", cta.t, 0.416, 2.5, 0.14, 22)}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${cueSets()}
${wordSets()}
${anim}
      tl.set({}, {}, ${TOTAL});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
const spoken = words.filter((w) => w.start >= plateQ - 1).map((w) => `${w.start.toFixed(2)} ${w.text}`).join("\n");
writeFileSync(new URL("./tail-spoken.txt", import.meta.url), spoken);
console.log("cues", cues.length, "words", words.length);
console.log("beats", beats.map((b) => `${b.id}@${b.t}`).join("  "));
console.log("plate", plateQ, "total", TOTAL);
