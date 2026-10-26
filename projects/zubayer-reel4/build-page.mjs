#!/usr/bin/env node
// Reel 4 — "এআই-এর কাছে আমরা এখন পোলাপান" (episode 8:57–9:58). Times are SOURCE seconds through T()/TW().
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW } = ctx;
const t1 = TW(["মোবাইলের", "ফাংশন"], 540, 6), t2 = TW(["ঘটঘট", "ঠিক"], 553, 8), t3 = TW(["বাবা"], 562, 8);
const t4 = TW(["এক্সপার্ট"], 572, 6), nao = TW(["নাও"], 586, 7), pol = TW(["পোলাপান"], 592, 6), buz = TW(["বুজুর্গ"], 596, 6);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "এআই-এর কাছে আমরা এখন <em>পোলাপান</em>",
  cta: ["পুরো পর্ব দেখুন, <em>লিংক প্রোফাইলে</em>", "ফলো করুন"],
  groups: [
    { at: t1 - 0.2, html: `<div class="bub">${icon("user-round", 40)}“মোবাইলের এই ফাংশনটা শিখিয়ে দাও তো”</div>`, sfx: [[t1, "pop.mp3", 0.3]] },
    { at: t2 - 0.2, html: `<div class="bub">${icon("smartphone", 40)}ঘটঘট করে ঠিক করে দিলাম</div>`, sfx: [[t2, "pop.mp3", 0.3]] },
    { at: t3 - 0.2, html: `<div class="bub">${icon("user-round", 40)}“ও বাবা! এটা কীভাবে পসিবল হলো!”</div>`, sfx: [[t3, "pop.mp3", 0.3]] },
    { at: t4 - 0.2, html: `<div class="bub">${icon("user-round-cog", 40)}টেক এক্সপার্ট: “এই কাজটা পারছি না…”</div>`, sfx: [[t4, "pop.mp3", 0.3]] },
    { at: nao - 0.2, html: `<div class="bub ai">${icon("bot", 48)}“এই নাও!”</div>`, sfx: [[nao - 0.1, "ping.mp3", 0.35]] },
    { at: pol - 0.2, html: `<div class="chip red" id="r4a">আমরা = পোলাপান</div><div class="chip gold" id="r4b">AI = বুজুর্গ</div>`,
      beats: [[buz - 0.1, "#r4b", "pop", {}]], sfx: [[pol, "click.mp3", 0.3], [buz, "click.mp3", 0.3]] },
  ],
});
