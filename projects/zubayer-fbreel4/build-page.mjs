#!/usr/bin/env node
// Facebook Reel 4 — "AGI আসছে, তারপর?" (episode 3:02–3:42), ends frozen just before the number:
// "আগামী ২০৩০ সালের মধ্যে…". Times are SOURCE seconds through T(). Caption words come from a Bengali ASR pass of
// this stretch (asr.json), because the subtitle estimate runs up to 3 s early here.
import { readFileSync } from "node:fs";
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, patchWords, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { T } = ctx;
patchWords(ctx, 182, 223, JSON.parse(readFileSync(new URL("asr.json", import.meta.url), "utf8")));

const tech = T(191.32), agi = T(196.18), life = T(201.58), p1 = T(205.78), p2 = T(209.06), p3 = T(209.76);
const dis = T(213.8), imf = T(218.36);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "<em>AGI</em> আসছে, তারপর?",
  cta: ["সংখ্যাটা <em>পুরো পর্বে</em>", "লিংক কমেন্টে"],
  cliff: { text: "২০৩০ সালের মধ্যে কত চাকরি?", sub: "সংখ্যাটা পুরো পর্বে" },
  groups: [
    { at: tech - 0.3, html: `<div class="chip gold">${icon("zap", 36)}সবচেয়ে পাওয়ারফুল টেকনোলজি এসে পড়েছে</div>`, sfx: [[tech, "sparkle.mp3", 0.3]] },
    { at: agi - 0.3, html: `<div class="chip red" id="f4agi" style="font-size:46px">${icon("brain", 44)}কয়দিন পরেই AGI</div>`,
      beats: [[agi + 0.1, "#f4agi", "wiggle", { a: 2, d: 0.06, n: 7 }]], sfx: [[agi, "glitch-1.mp3", 0.25]] },
    { at: life - 0.3, html: `<div class="chip">${icon("user-round", 34)}মানুষের জীবন কতটা বদলাবে?</div>`, sfx: [[life, "click.mp3", 0.3]] },
    { at: p1 - 0.3, html: `<div class="wrap"><div class="bub" id="f4p0" style="font-size:28px">${icon("newspaper", 32)}পোস্টে দেখি</div><div class="bub" id="f4p1" style="font-size:28px">${icon("newspaper", 32)}ফেসবুকে পড়ি</div><div class="bub" id="f4p2" style="font-size:28px">${icon("megaphone", 32)}কথা শুনি</div></div>`,
      beats: [[p2, "#f4p1", "pop", {}], [p3 + 0.8, "#f4p2", "pop", {}]], sfx: [[p1, "pop.mp3", 0.3], [p2, "pop.mp3", 0.3], [p3 + 0.8, "pop.mp3", 0.3]] },
    { at: dis - 0.3, html: `<div class="chip red" id="f4dis" style="font-size:48px">সবকিছুই ডিসরাপ্ট হয়ে যাচ্ছে</div>`,
      beats: [[dis, "#f4dis", "pop", { from: 1.3 }]], sfx: [[dis, "impact-bass-2.mp3", 0.25]] },
    { at: imf - 0.3, html: `<div class="stat" style="flex:none;width:100%"><div class="num" id="f4n">০ কোটি?</div><div class="sl">IMF-এর রিসার্চ: ২০৩০ সালের মধ্যে…</div></div>`,
      beats: [[imf, "#f4n", "count", { from: 0, to: 99, dec: 0, post: " কোটি?", d: 6 }]], sfx: [[imf, "typing.mp3", 0.22]] },
  ],
});
