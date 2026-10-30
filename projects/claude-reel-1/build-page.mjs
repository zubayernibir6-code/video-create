#!/usr/bin/env node
// Reel 1 — "এই বিজ্ঞাপন বানিয়েছে Claude": cold open on the finished ad's golden click (master 7:46.6), then his
// intro (master 0:01.2–0:41.2), frozen on "কীভাবে বানালাম?". Chips follow the master's own card times (its
// sounds are inside the cut's audio), M(master s) → Reel s.
import { icon, arrow } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
const meter = (id, color, w) => `<div class="meter"><i id="${id}" style="width:${w}%;background:${color}"></i></div>`;
buildCutdown(ctx, {
  title: "Reel 1 — এই বিজ্ঞাপন বানিয়েছে Claude",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ১",
  hook: "এই বিজ্ঞাপন বানিয়েছে <em>Claude</em>",
  start: [960, 540, 0.52],
  jumps: [M(1.2), M(6.1), M(17.0), M(24.8), M(31.0), M(35.2)],
  cliff: { text: "কীভাবে বানালাম?", sub: "ধাপে ধাপে দেখুন পুরো ভিডিওতে", d: 2.5 },
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: ["পুরো ভিডিও: <em>ধাপে ধাপে</em> ৮ মিনিট", `${icon("message-circle", 40)}লিংক কমেন্টে`],
  sfx: [[0.0, "glitch-1", 0.4], [0.1, "impact-bass-1", 0.5, 0, 1.6], [2.0, "whoosh-short", 0.35]],
  chips: [
    { at: 0.15, out: 1.75, html: `<div class="chip gold">${icon("sparkles", 34)}Claude-এর বানানো বিজ্ঞাপন</div>` },
    { at: M(1.35), out: M(5.8), html: `<div class="chip red">${icon("x", 34)}বিজ্ঞাপন বানানো: খরচ বেশি, সময় বেশি</div>` },
    { at: M(6.1), out: M(17.2), html: `<div class="chip" style="font-size:30px;padding:9px 20px 7px">${icon("sparkles", 30)}Claude AI</div>${arrow(56, "r1a1")}<div class="chip" id="r1n2" style="font-size:30px;padding:9px 20px 7px">মোশন গ্রাফিক্স</div>${arrow(56, "r1a2")}<div class="chip gold" id="r1n3" style="font-size:30px;padding:9px 20px 7px">${icon("clapperboard", 30)}কমার্শিয়াল-গ্রেড</div>`,
      beats: [[M(10.6), "#r1a1", "inx", {}], [M(10.9), "#r1n2", "pop", {}], [M(12.7), "#r1a2", "inx", {}], [M(12.95), "#r1n3", "pop", {}]] },
    { at: M(18.2), out: M(24.5), html: `<div class="chip red">${icon("triangle-alert", 34)}Claude Pro: লিমিট কম</div>${meter("r1m1", "#FF4D6D", 100)}`,
      beats: [[M(19.2), "#r1m1", "shrink", { to: 0.12, d: 4.3 }]] },
    { at: M(24.8), out: M(27.6), html: `<div class="chip gold" id="r1max" style="font-size:44px">${icon("rocket", 44)}Claude Max</div>`,
      beats: [[M(25.97), "#r1max", "pop", {}]] },
    { at: M(27.9), out: M(37.0), html: `<div class="chip green">${icon("gauge", 34)}লিমিট বেশি</div>${meter("r1m2", "#10B981", 100)}<div class="chip gold" id="r1p">${icon("trending-up", 34)}প্রোডাকশন বেশি</div>`,
      beats: [[M(28.0), "#r1m2", "grow", { d: 1.6 }], [M(31.0), "#r1p", "pop", {}]] },
  ],
});
