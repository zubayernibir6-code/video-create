#!/usr/bin/env node
// LinkedIn cut 1 — "কমার্শিয়াল অ্যাড বানানোর আমার AI ওয়ার্কফ্লো" (PLAN.md, his OK 2026-10-30; profile linkedin-clip, 4:5):
// the result first (the finished ad's golden click, master 7:46.6), his face with the problem and the promise and his name
// plate, Gemini's four things (master 0:45.4–1:18.4), the finished ad (cursor glow, 3D tilt, glitch, golden end screen),
// his "…শুধুমাত্র সঠিক নির্দেশনা দিয়ে" and his own closing line asking for a MESSAGE (no "কমেন্টে লিখুন DM", no
// "আনলিমিটেড"). Every piece boundary sits on a word from master.words.json (cutdown.json).
import { arrow, icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M, map } = ctx;
const dots = (n) => `<div class="dots">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
const item = (n, text, gold = false) => `<div class="chip${gold ? " gold" : ""}"><span class="n">${"০১২৩৪"[n]}.</span>${text}</div>${dots(n)}`;
const snap = (t) => ctx.words.reduce((b, w) => (Math.abs(w.start - t) < Math.abs(b - t) ? w.start : b), t);
// a whoosh on every cut between pieces, and on the morph out of a face piece into the screen window
const cuts = map.segments.slice(1).map((s) => [s.out0, "whoosh-short", 0.3]);
const morphs = map.segments.filter((s, i) => s.face && map.segments[i + 1] && !map.segments[i + 1].face).map((s) => [s.out1 - 0.7, "whoosh-short", 0.3]);
buildCutdown(ctx, {
  profile: "linkedin-clip",
  title: "LinkedIn 1 — কমার্শিয়াল অ্যাড বানানোর আমার AI ওয়ার্কফ্লো",
  tag: "AI ওয়ার্কফ্লো · Claude দিয়ে বিজ্ঞাপন",
  hook: "কমার্শিয়াল অ্যাড বানানোর আমার <em>AI ওয়ার্কফ্লো</em>",
  lower: { name: "Talha Zubayer", role: "AI দিয়ে ভিডিও আর অটোমেশন", at: M(1.35), out: M(5.5) },
  start: [960, 540, 0.52],
  pans: [
    [M(45.4), 1000, 470, 0], [M(49.5), 1200, 450, 0.8, 0.85], [M(53.6), 1340, 450, 0.8], [M(66.0), 1340, 500, 0.8], [M(74.1), 990, 560, 0.7],
    [M(422.5), 700, 400, 0], [M(426.5), 760, 420, 0.8], [M(432.5), 960, 540, 0, 0.6], [M(450.08), 960, 540, 0, 0.6],
  ],
  pushes: [[M(453.0), 1.2], [M(49.5), 2.2], [M(60.5), 1.6], [M(70.0), 1.4], [M(424.0), 2.0], [M(436.0), 1.8], [M(458.0), 2.0], [M(462.5), 2.0], [M(469.0), 1.8]],
  jumps: [M(1.2), M(6.1), M(17.0), ...[M(9.6), M(13.8)].map(snap), M(472.95), M(481.35), ...[M(486.97), M(490.67)].map(snap)],
  css: `.dots { display: flex; gap: 10px; } .dots i { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.18); display: block; } .dots i.on { background: #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.6); }`,
  endTag: "Talha Zubayer",
  cta: [`Claude Code সেটআপ, <em>ভিডিও</em> বা অটোমেশনের কাজ`, `${icon("message-circle", 40)}মেসেজ করুন`],
  sfx: [[0.0, "glitch-1", 0.35], [0.1, "impact-bass-1", 0.45, 0, 1.6], ...cuts, ...morphs],
  chips: [
    { at: M(6.1), out: M(10.5), html: `<div class="chip">${icon("sparkles", 34)}Claude AI</div>`, sfx: [[M(6.1), "pop", 0.3]] },
    { at: M(10.85), out: M(12.6), html: `${arrow(56)}<div class="chip" id="l1n2">মোশন গ্রাফিক্স</div>`, beats: [[M(10.9), "#l1n2", "pop", {}]], sfx: [[M(10.9), "pop", 0.3]] },
    { at: M(12.95), out: M(17.2), html: `${arrow(56)}<div class="chip gold" id="l1n3">${icon("clapperboard", 34)}কমার্শিয়াল-গ্রেড</div>`, beats: [[M(12.95), "#l1n3", "pop", {}]], sfx: [[M(12.95), "sparkle", 0.3]] },
    { at: M(54.22), out: M(57.6), html: item(1, "ভিডিও অ্যানালাইসিস"), sfx: [[M(54.22), "pop", 0.3]] },
    { at: M(57.88), out: M(60.1), html: item(2, "ভয়েস স্ক্রিপ্ট"), sfx: [[M(57.88), "pop", 0.3]] },
    { at: M(60.38), out: M(65.75), html: item(3, "BGM প্রম্পট"), sfx: [[M(60.38), "pop", 0.3]] },
    { at: M(66.04), out: M(69.6), html: item(4, "Claude Code প্রম্পট", true), sfx: [[M(66.04), "ping", 0.3]] },
    { at: M(69.9), out: M(78.1), html: `<div class="chip green">${icon("circle-check", 34)}চারটাই রেডি</div>${dots(4)}`, sfx: [[M(69.9), "sparkle", 0.3]] },
    { at: M(422.6), out: M(427.8), html: `<div class="chip green">${icon("film", 34)}ভিডিও তৈরি</div>`, sfx: [[M(422.6), "success", 0.3]] },
    { at: M(435.0), out: M(438.4), html: `<div class="chip gold">${icon("sparkles", 34)}কার্সরের আভা</div>`, sfx: [[M(435.0), "sparkle", 0.3]] },
    { at: M(450.3), out: M(455.1), html: `<div class="chip gold">${icon("rotate-3d", 34)}3D কাত</div>`, sfx: [[M(450.3), "pop", 0.3]] },
    { at: M(455.4), out: M(466.3), html: `<div class="chip gold">${icon("zap", 34)}গ্লিচ ট্রানজিশন</div>`, sfx: [[M(455.4), "pop", 0.3]] },
    { at: M(466.7), out: M(472.6), html: `<div class="chip gold">${icon("star", 34)}সোনালি শেষ পর্দা</div>` },
    { at: M(475.2), out: M(477.2), html: `<div class="chip green">${icon("circle-check", 34)}শুধু সঠিক নির্দেশনা</div>`, sfx: [[M(475.2), "success", 0.3]] },
    { at: M(482.0), out: M(489.0), html: `<div class="chip" id="l1c">${icon("code", 34)}কোডিং</div><div class="chip" id="l1v">${icon("clapperboard", 34)}ভিডিও</div><div class="chip gold" id="l1a">${icon("zap", 34)}অটোমেশন</div>`,
      beats: [[M(482.05), "#l1c", "pop", {}], [M(484.13), "#l1v", "pop", {}], [M(485.79), "#l1a", "pop", {}]],
      sfx: [[M(482.05), "pop", 0.3], [M(484.13), "pop", 0.3], [M(485.79), "pop", 0.3]] },
  ],
});
