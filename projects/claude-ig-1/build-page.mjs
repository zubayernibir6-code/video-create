#!/usr/bin/env node
// Instagram Reel 1 — "কমার্শিয়াল অ্যাড, ঘরে বসে Claude দিয়ে": his intro full 9:16 (master 0:01.2–0:43.8), the frame
// morphs into the 16:9 window on "স্ক্রিনে যাওয়া যাক", then the Gemini prompt's four parts (master 0:45.4–1:18.5),
// frozen on "এরপর কী করলাম?". Chips on the face follow the master's card times (their sounds are in the mix).
import { arrow, icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M, map } = ctx;
const meter = (id, color, w) => `<div class="meter"><i id="${id}" style="width:${w}%;background:${color}"></i></div>`;
const dots = (n) => `<div class="dots">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
const item = (n, text, gold = false) => `<div class="chip${gold ? " gold" : ""}"><span class="n">${"০১২৩৪"[n]}.</span>${text}</div>${dots(n)}`;
const morph = map.segments[0].out1 - 0.7;
buildCutdown(ctx, {
  title: "Instagram Reel 1 — কমার্শিয়াল অ্যাড, ঘরে বসে Claude দিয়ে",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ১",
  hook: "কমার্শিয়াল অ্যাড, <em>ঘরে বসে</em> Claude দিয়ে",
  start: [1000, 470, 1],
  pans: [[M(49.5), 1200, 450, 0.8, 0.85], [M(53.6), 1340, 450, 0.8], [M(66.0), 1340, 500, 0.8], [M(74.1), 990, 560, 0.7]],
  pushes: [[M(49.5), 2.2]],
  jumps: [M(1.2), M(6.1), M(17.0), M(24.8), M(31.0), M(35.2)],
  css: `.dots { display: flex; gap: 10px; } .dots i { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.18); display: block; } .dots i.on { background: #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.6); }`,
  cliff: { text: "এরপর কী করলাম?", sub: "ধাপে ধাপে দেখুন পুরো ভিডিওতে", d: 2.5 },
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: ["পুরো ভিডিও: <em>ধাপে ধাপে</em> ৮ মিনিট", `${icon("link", 40)}লিংক Bio-তে`],
  sfx: [[morph, "whoosh-short", 0.35], [M(45.4), "whoosh-short", 0.35]],
  chips: [
    { at: M(1.35), out: M(5.8), html: `<div class="chip red">${icon("x", 34)}বিজ্ঞাপন বানানো: খরচ বেশি, সময় বেশি</div>` },
    { at: M(6.1), out: M(17.2), html: `<div class="chip" style="font-size:30px;padding:9px 20px 7px">${icon("sparkles", 30)}Claude AI</div>${arrow(56, "i1a1")}<div class="chip" id="i1n2" style="font-size:30px;padding:9px 20px 7px">মোশন গ্রাফিক্স</div>${arrow(56, "i1a2")}<div class="chip gold" id="i1n3" style="font-size:30px;padding:9px 20px 7px">${icon("clapperboard", 30)}কমার্শিয়াল-গ্রেড</div>`,
      beats: [[M(10.6), "#i1a1", "inx", {}], [M(10.9), "#i1n2", "pop", {}], [M(12.7), "#i1a2", "inx", {}], [M(12.95), "#i1n3", "pop", {}]] },
    { at: M(18.2), out: M(24.5), html: `<div class="chip red">${icon("triangle-alert", 34)}Claude Pro: লিমিট কম</div>${meter("i1m1", "#FF4D6D", 100)}`,
      beats: [[M(19.2), "#i1m1", "shrink", { to: 0.12, d: 4.3 }]] },
    { at: M(24.8), out: M(27.6), html: `<div class="chip gold" id="i1max" style="font-size:44px">${icon("rocket", 44)}Claude Max</div>`,
      beats: [[M(25.97), "#i1max", "pop", {}]] },
    { at: M(27.9), out: M(37.0), html: `<div class="chip green">${icon("gauge", 34)}লিমিট বেশি</div>${meter("i1m2", "#10B981", 100)}<div class="chip gold" id="i1p">${icon("trending-up", 34)}প্রোডাকশন বেশি</div>`,
      beats: [[M(28.0), "#i1m2", "grow", { d: 1.6 }], [M(31.0), "#i1p", "pop", {}]] },
    { at: M(54.22), out: M(57.6), html: item(1, "ভিডিও অ্যানালাইসিস"), sfx: [[M(54.22), "pop", 0.3]] },
    { at: M(57.88), out: M(60.1), html: item(2, "ভয়েস স্ক্রিপ্ট"), sfx: [[M(57.88), "pop", 0.3]] },
    { at: M(60.38), out: M(65.75), html: item(3, "BGM প্রম্পট"), sfx: [[M(60.38), "pop", 0.3]] },
    { at: M(66.04), out: M(69.6), html: item(4, "Claude Code প্রম্পট", true), sfx: [[M(66.04), "ping", 0.3]] },
    { at: M(69.9), out: M(78.2), html: `<div class="chip green">${icon("circle-check", 34)}চারটাই রেডি</div>${dots(4)}`, sfx: [[M(69.9), "sparkle", 0.3]] },
  ],
});
