#!/usr/bin/env node
// Universal Reel 2 (release system step 7: Reel 2's approved data, profile universal-reel; ONE file for Facebook,
// Instagram, YouTube Shorts and X; the end card says "আমার প্রোফাইলে দেখুন").
// Was: Reel 2 — "Claude-কে দেওয়ার আগে এই ৪টা জিনিস": cold open on "All 4 Assets Ready!" (master 5:57.6), the Gemini
// prompt with its four parts (master 0:45.4–1:18.5), then his "কমেন্টে লিখুন DM" (master 6:43.2–6:58.0).
// The screen is shown at native pixels in the window; pans follow the action (master pixel centres).
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M, W } = ctx;
const dots = (n) => `<div class="dots">${[1, 2, 3, 4].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
const item = (n, text, gold = false) => `<div class="chip${gold ? " gold" : ""}"><span class="n">${"০১২৩৪"[n]}.</span>${text}</div>${dots(n)}`;
const dm = W(["DM"], M(408.5), 6);
const pack = W(["প্যাক"], M(416.5), 3);
buildCutdown(ctx, {
  profile: "universal-reel",
  title: "Universal Reel 2 — Claude-কে দেওয়ার আগে এই ৪টা জিনিস",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ২",
  hook: "Claude-কে দেওয়ার আগে এই <em>৪টা জিনিস</em>",
  start: [820, 430, 1],
  pans: [
    [M(45.4), 1000, 470, 0], [M(49.5), 1200, 450, 0.8, 0.85], [M(53.6), 1340, 450, 0.8], [M(66.0), 1340, 500, 0.8],
    [M(74.1), 990, 560, 0.7], [M(403.0), 930, 450, 0], [M(411.2), 960, 720, 0.8, 0.6],
  ],
  pushes: [[M(62.8), 1.6], [M(71.9), 1.2], [M(76.3), 1.0], [M(408.9), 1.4], [M(49.5), 2.2], [M(404.5), 2.5]],
  css: `.dots { display: flex; gap: 10px; } .dots i { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.18); display: block; } .dots i.on { background: #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.6); }`,
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: [`পুরো ভিডিও: <em style="white-space:nowrap">ধাপে ধাপে</em> ৮ মিনিট`, `${icon("circle-user", 40)}আমার প্রোফাইলে দেখুন`],
  sfx: [[0.05, "success", 0.4], [M(45.4), "whoosh-short", 0.35], [M(403.0), "whoosh-short", 0.35]],
  chips: [
    { at: 0.1, out: 2.2, html: `<div class="chip gold">${icon("flame", 34)}৪টা জিনিস রেডি</div>` },
    { at: M(54.22), out: M(57.6), html: item(1, "ভিডিও অ্যানালাইসিস"), sfx: [[M(54.22), "pop", 0.3]] },
    { at: M(57.88), out: M(60.1), html: item(2, "ভয়েস স্ক্রিপ্ট"), sfx: [[M(57.88), "pop", 0.3]] },
    { at: M(60.38), out: M(65.75), html: item(3, "BGM প্রম্পট"), sfx: [[M(60.38), "pop", 0.3]] },
    { at: M(66.04), out: M(69.6), html: item(4, "Claude Code প্রম্পট", true), sfx: [[M(66.04), "ping", 0.3]] },
    { at: M(69.9), out: M(78.2), html: `<div class="chip green">${icon("circle-check", 34)}চারটাই রেডি</div>${dots(4)}`, sfx: [[M(69.9), "sparkle", 0.3]] },
    { at: dm - 0.1, out: pack - 0.3, html: `<div class="chip gold" id="r2dm" style="font-size:40px">${icon("message-circle", 40)}কমেন্টে লিখুন DM</div>`,
      beats: [[dm + 0.5, "#r2dm", "wiggle", { a: 2, d: 0.12 }]], sfx: [[dm, "pop", 0.35]] },
    { at: pack, out: M(417.5), html: `<div class="chip gold">${icon("message-circle", 34)}DM</div><div class="chip">${icon("package", 34)}প্রম্পট প্যাক পাবেন</div>`, sfx: [[pack, "click", 0.3]] },
  ],
});
