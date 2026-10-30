#!/usr/bin/env node
// Universal Reel 3 (release system step 7: Reel 3's approved data, profile universal-reel; ONE file for Facebook,
// Instagram, YouTube Shorts and X; the end card says "আমার প্রোফাইলে দেখুন").
// Was: Reel 3 — "বিজ্ঞাপনের বাংলা ভয়েস ওভার: হুবহু সেটিং": cold open on Temperature 0.7 (master 5:38.6), then the
// AI Studio TTS steps (master 4:31.3–5:04.6 and 5:14.2–5:45.0). Step chips: model, voice, style, temperature.
import { arrow, icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
const step = (n, text) => `<div class="chip"><span class="n">ধাপ ${n}</span>${text}</div>`;
buildCutdown(ctx, {
  profile: "universal-reel",
  title: "Universal Reel 3 — বিজ্ঞাপনের বাংলা ভয়েস ওভার: হুবহু সেটিং",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ৩",
  hook: "বিজ্ঞাপনের বাংলা ভয়েস ওভার: <em>হুবহু সেটিং</em>",
  start: [1450, 330, 1],
  pans: [
    [M(271.3), 1000, 400, 0], [M(276), 1400, 400, 0.8], [M(282), 1450, 480, 0.8], [M(288.7), 900, 500, 0.8],
    [M(294), 1350, 550, 0.8], [M(298), 1400, 520, 0.8], [M(302), 1380, 600, 0.7],
    [M(314.2), 1300, 650, 0], [M(320), 1300, 520, 0.8], [M(326), 900, 500, 0.8], [M(331.5), 1300, 450, 0.8],
    [M(336), 1450, 500, 0.8], [M(338.6), 1450, 330, 0.7],
  ],
  pushes: [[M(274.0), 1.6], [M(291.2), 1.6], [M(296.4), 1.0], [M(322.9), 1.8], [M(342.8), 1.0], [M(279), 2.5], [M(316), 2.5], [M(328), 2.2]],
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: [`পুরো ভিডিও: <em style="white-space:nowrap">ধাপে ধাপে</em> ৮ মিনিট`, `${icon("circle-user", 40)}আমার প্রোফাইলে দেখুন`],
  sfx: [[0.05, "pop", 0.4], [M(271.3), "whoosh-short", 0.35], [M(314.2), "whoosh-short", 0.35]],
  chips: [
    { at: 0.1, out: 2.2, html: `<div class="chip gold">${icon("thermometer", 34)}Temperature ০.৭</div>` },
    { at: M(271.6), out: M(288.4), html: `${step("১", "মডেল")}<div class="chip" id="r3a">${icon("audio-lines", 32)}Audio</div>${arrow(50, "r3ar")}<div class="chip gold" id="r3t">Flash TTS</div>`,
      beats: [[M(283.0), "#r3a", "pop", {}], [M(285.0), "#r3ar", "inx", {}], [M(285.3), "#r3t", "pop", {}]],
      sfx: [[M(271.6), "click-soft", 0.3], [M(283.0), "pop", 0.3], [M(285.3), "pop", 0.3]] },
    { at: M(288.7), out: M(300.9), html: `${step("২", "ভয়েস")}<div class="chip">${icon("mic", 32)}Ad Voiceover</div>`, sfx: [[M(288.7), "click-soft", 0.3]] },
    { at: M(301.2), out: M(304.0), html: `<div class="chip" id="r3m">${icon("user-round", 32)}Masculine</div><div class="chip" id="r3d">Medium</div>`,
      beats: [[M(302.6), "#r3d", "pop", {}]], sfx: [[M(301.2), "pop", 0.3], [M(302.6), "pop", 0.3]] },
    { at: M(314.4), out: M(319.9), html: `<div class="chip gold" style="font-size:44px">${icon("mic", 44)}Sadaltager</div>`, sfx: [[M(314.4), "ping", 0.3]] },
    { at: M(320.2), out: M(334.8), html: `${step("৩", "স্টাইল")}<div class="chip gold" id="r3h">${icon("zap", 32)}High-energy</div>`,
      beats: [[M(328.4), "#r3h", "pop", {}]], sfx: [[M(320.2), "click-soft", 0.3], [M(328.4), "pop", 0.3]] },
    { at: M(335.1), out: M(344.6), html: `${step("৪", "টেম্পারেচার")}<div class="chip gold" id="r3k" style="font-size:36px">${icon("thermometer", 34)}০.৭</div><div class="chip red" id="r3x" style="font-size:30px">১ দিলে গোলমাল</div>`,
      beats: [[M(339.0), "#r3k", "pop", {}], [M(341.0), "#r3x", "pop", {}]], sfx: [[M(335.1), "click-soft", 0.3], [M(339.0), "pop", 0.35], [M(341.0), "error", 0.25]] },
  ],
});
