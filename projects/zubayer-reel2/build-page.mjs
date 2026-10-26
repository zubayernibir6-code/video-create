#!/usr/bin/env node
// Reel 2 — "ওয়ার্ড-এক্সেল কোর্স কি এখনো কাজে লাগে?" (episode 4:33–5:27). Times are SOURCE seconds through T()/TW().
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW, T } = ctx;
const list = TW(["ওয়ার্ডে"], 307.6, 2), stamp = TW(["উল্টে"], 323, 5);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "ওয়ার্ড-এক্সেল কোর্স কি <em>এখনো কাজে লাগে?</em>",
  cta: ["পুরো পর্ব দেখুন, <em>লিংক প্রোফাইলে</em>", "ফলো করুন"],
  groups: [
    { at: T(274.5), html: `<div class="chip gold">${icon("hourglass", 36)}৩–৬ মাসের কোর্স, আজও চলছে</div>`, sfx: [[T(274.5), "pop.mp3", 0.3]] },
    { at: T(284), html: `<div class="chip">${icon("award", 38)}সার্টিফিকেটের ভ্যালু কোন পর্যন্ত?</div>`, sfx: [[T(284), "click.mp3", 0.3]] },
    { at: list - 0.2, html: `<div class="col" style="position:relative">
        <div class="li" id="r2l0">${icon("file-text", 34)}ওয়ার্ডে ম্যানুয়ালি টেবিল</div>
        <div class="li" id="r2l1">${icon("sheet", 34)}এক্সেলে হাতে ডাটা সাজানো</div>
        <div class="li" id="r2l2">${icon("presentation", 34)}পাওয়ারপয়েন্টে হাতে ডিজাইন</div>
        <div class="stamp" id="r2st">OUTDATED</div></div>`,
      beats: [[TW(["এক্সেলে"], 312.1, 2), "#r2l1", "inx", {}], [TW(["পাওয়ারপয়েন্টে"], 314.9, 2), "#r2l2", "inx", {}],
        [stamp - 1.4, "#r2st", "stamp", {}]],
      sfx: [[list, "pop.mp3", 0.25], [TW(["এক্সেলে"], 312.1, 2), "pop.mp3", 0.25], [TW(["পাওয়ারপয়েন্টে"], 314.9, 2), "pop.mp3", 0.25],
        [stamp - 1.1, "impact-bass-2.mp3", 0.25]] },
    { at: stamp + 0.3, html: `<div class="chip green">${icon("bot", 38)}AI অটোমেটেড সিস্টেম: গেম উল্টে গেছে</div>`, sfx: [[stamp + 0.3, "success.mp3", 0.25]] },
  ],
});
