#!/usr/bin/env node
// Reel 1 — "২০৩০ সালে ৯.২ কোটি চাকরি থাকবে না?" (episode 3:36–4:07). Times are SOURCE seconds through T()/TW().
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW, T } = ctx;
const red = TW(["৯", "নয়", "নয়"], 222.5, 4), green = TW(["১৭", "সতের"], 229.5, 4), ban = T(233.3);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "২০৩০ সালে <em>৯.২ কোটি</em> চাকরি থাকবে না?",
  cta: ["পুরো পর্ব দেখুন, <em>লিংক প্রোফাইলে</em>", "ফলো করুন"],
  groups: [
    { at: red - 0.3, html: `<div class="stat"><div class="num" id="r1n">−০.০ কোটি</div><div class="sl">চাকরি অবসোলিট</div></div>
      <div class="stat green" id="r1g"><div class="num" id="r1gn">+০ কোটি</div><div class="sl">নতুন কাজের সুযোগ</div></div>`,
      beats: [[red - 0.3, "#r1n", "count", { to: 9.2, dec: 1, pre: "−", post: " কোটি", d: 1.2 }],
        [green - 0.3, "#r1g", "pop", {}], [green - 0.3, "#r1gn", "count", { to: 17, pre: "+", post: " কোটি", d: 1.2 }]],
      sfx: [[red - 0.3, "impact-bass-2.mp3", 0.2], [green - 0.3, "success.mp3", 0.25]] },
    { at: ban, html: `<div class="panel">আসল প্রশ্ন: <em>আপনি</em> টেকনোলজি কীভাবে ব্যবহার করছেন?</div>`, sfx: [[ban, "click-soft.mp3", 0.4]] },
  ],
});
void icon;
