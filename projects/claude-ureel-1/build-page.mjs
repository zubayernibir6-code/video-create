#!/usr/bin/env node
// Universal Reel 1 — "এই বিজ্ঞাপন বানিয়েছে Claude": Reel 1's approved cut (a cold open on the finished ad's golden click,
// master 7:46.6, then his intro, master 0:01.2–0:41.2, frozen on "কীভাবে বানালাম?") with his face full 9:16, laid out for
// ONE file on Facebook, Instagram, YouTube Shorts and X (profile universal-reel, release system step 7). Chips follow the
// master's card times; the 3-chip chain plays one chip at a time (the text column is 692 px).
import { arrow, icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
const meter = (id, color, w, px = 150) => `<div class="meter" style="width:${px}px"><i id="${id}" style="width:${w}%;background:${color}"></i></div>`;
// pacing: extra jump cuts land on the nearest spoken word's start
const snap = (t) => ctx.words.reduce((b, w) => (Math.abs(w.start - t) < Math.abs(b - t) ? w.start : b), t);
buildCutdown(ctx, {
  profile: "universal-reel",
  title: "Universal Reel 1 — এই বিজ্ঞাপন বানিয়েছে Claude",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ১",
  hook: "এই বিজ্ঞাপন বানিয়েছে <em>Claude</em>",
  start: [960, 540, 0.52],
  jumps: [M(1.2), M(6.1), M(17.0), M(24.8), M(31.0), M(35.2), ...[M(3.4), M(13.6), M(20.6), M(38.2)].map(snap), ...[9.3, 16.2, 34.1].map(snap)],
  cliff: { text: "কীভাবে বানালাম?", sub: "ধাপে ধাপে দেখুন পুরো ভিডিওতে", d: 2.5 },
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: [`পুরো ভিডিও: <em style="white-space:nowrap">ধাপে ধাপে</em> ৮ মিনিট`, `${icon("circle-user", 40)}আমার প্রোফাইলে দেখুন`],
  sfx: [[0.0, "glitch-1", 0.4], [0.1, "impact-bass-1", 0.5, 0, 1.6], [2.0, "whoosh-short", 0.35]],
  chips: [
    { at: 0.15, out: 1.75, html: `<div class="chip gold">${icon("sparkles", 34)}Claude-এর বানানো বিজ্ঞাপন</div>` },
    { at: M(1.35), out: M(5.8), html: `<div class="chip red">${icon("x", 34)}খরচ বেশি, সময় বেশি</div>` },
    { at: M(6.1), out: M(10.5), html: `<div class="chip">${icon("sparkles", 34)}Claude AI</div>` },
    { at: M(10.85), out: M(12.6), html: `${arrow(56)}<div class="chip" id="u1n2">মোশন গ্রাফিক্স</div>`, beats: [[M(10.9), "#u1n2", "pop", {}]] },
    { at: M(12.95), out: M(17.2), html: `${arrow(56)}<div class="chip gold" id="u1n3">${icon("clapperboard", 34)}কমার্শিয়াল-গ্রেড</div>`, beats: [[M(12.95), "#u1n3", "pop", {}]] },
    { at: M(18.2), out: M(24.5), html: `<div class="chip red" style="font-size:30px">${icon("triangle-alert", 30)}Claude Pro: লিমিট কম</div>${meter("u1m1", "#FF4D6D", 100, 120)}`,
      beats: [[M(19.2), "#u1m1", "shrink", { to: 0.12, d: 4.3 }]] },
    { at: M(24.8), out: M(27.6), html: `<div class="chip gold" id="u1max" style="font-size:44px">${icon("rocket", 44)}Claude Max</div>`,
      beats: [[M(25.97), "#u1max", "pop", {}]] },
    { at: M(27.9), out: M(37.0), html: `<div class="chip green" style="font-size:30px">${icon("gauge", 30)}লিমিট বেশি</div>${meter("u1m2", "#10B981", 100, 100)}<div class="chip gold" id="u1p" style="font-size:30px">${icon("trending-up", 30)}প্রোডাকশন বেশি</div>`,
      beats: [[M(28.0), "#u1m2", "grow", { d: 1.6 }], [M(31.0), "#u1p", "pop", {}]] },
  ],
});
