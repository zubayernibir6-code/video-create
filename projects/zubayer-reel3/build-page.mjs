#!/usr/bin/env node
// Reel 3 — "৩ দিনের কাজ এখন ৩ ঘণ্টায়" (episode 7:22–8:18). Times are SOURCE seconds through T()/TW().
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW, T } = ctx;
const fast = TW(["ঘণ্টা", "ঘন্টা"], 486, 5), grow = T(488.6);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "<em>৩ দিনের</em> কাজ এখন <em>৩ ঘণ্টায়</em>",
  cta: ["পুরো পর্ব দেখুন, <em>লিংক প্রোফাইলে</em>", "ফলো করুন"],
  groups: [
    { at: TW(["হাজার"], 449.5, 2) - 0.2, html: `<div class="chip">${icon("layers", 36)}হাজার রকমের কাজ</div>`, sfx: [[TW(["হাজার"], 449.5, 2), "click.mp3", 0.3]] },
    { at: TW(["৩-৪"], 455.4, 2) - 0.2, html: `<div class="chip red">${icon("clock", 36)}একেকটা কাজে ৩–৪ দিন</div>`, sfx: [[TW(["৩-৪"], 455.4, 2), "click.mp3", 0.3]] },
    { at: TW(["মাসে"], 463, 2) - 0.2, html: `<div class="chip">${icon("wallet", 36)}মাসে আউটপুট: ধরুন লাখ টাকা</div>`, sfx: [[TW(["লাখ"], 468.6, 2), "click.mp3", 0.3]] },
    { at: T(471.6), html: `<div class="bars">
        <div class="bl">ম্যানুয়াল</div><div class="track"><div class="hb red" id="r3b0">৩–৪ দিন</div></div>
        <div class="bl">সিস্টেম</div><div class="track"><div class="hb green" id="r3b1">৩–৪ ঘণ্টা</div></div></div>`,
      beats: [[T(471.9), "#r3b0", "grow", { d: 1.6, ease: "power1.out" }], [fast - 0.25, "#r3b1", "grow", { d: 0.5 }]],
      sfx: [[fast - 0.25, "whoosh-short.mp3", 0.35], [fast + 0.2, "ping.mp3", 0.3]] },
    { at: grow, html: `<div class="chip green">বেশি আউটপুট</div><div class="chip gold">${icon("trending-up", 34)}দ্রুত গ্রো</div>`,
      sfx: [[grow, "success.mp3", 0.25]] },
  ],
});
