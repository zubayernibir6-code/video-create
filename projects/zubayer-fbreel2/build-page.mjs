#!/usr/bin/env node
// Facebook Reel 2 — "এখন সবচেয়ে পাওয়ারফুল কে?" (episode 1:39–3:01), ends frozen on "টিকে থাকতে সবচেয়ে জরুরি কী?".
// Times are SOURCE seconds through T()/TW().
import { readFileSync } from "node:fs";
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, patchWords, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW, T } = ctx;
// first and last seconds as heard by the Bengali model (asr-head.json / asr-tail.json, source seconds)
const asr = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8"));
patchWords(ctx, 99, 109.5, asr("asr-head.json"));
patchWords(ctx, 176, 183, asr("asr-tail.json"));

const emp = T(106.56), sud = TW(["হঠাৎ"], 115.8, 2), brk = TW(["ভেঙে"], 121.3, 2);
const who = T(131.5), god = TW(["সৃষ্টিকর্তা"], 136.4, 2);
const old = TW(["চলছে—প্রাচীনকালে"], 149.2, 2), now = TW(["বর্তমানে"], 154.5, 2), co = TW(["কোম্পানি"], 157.7, 2), tech = TW(["টেকনোলজি"], 158.6, 2), aiw = TW(["এআই"], 160.5, 2);
const surv = TW(["টিকে"], 164.3, 2), sword = TW(["তলোয়ার"], 170.7, 2), shel = T(177.62), noth = T(179.94);
buildReel(ctx, {
  tag: "THE AGE OF AI · পার্ট ২",
  hook: "এখন <em>সবচেয়ে পাওয়ারফুল</em> কে?",
  cta: ["উত্তর <em>পুরো পর্বে</em>", "লিংক কমেন্টে"],
  cliff: { text: "টিকে থাকতে সবচেয়ে জরুরি কী?", sub: "উত্তর পুরো পর্বে" },
  groups: [
    { at: emp - 0.3, html: `<div class="chip">${icon("castle", 38)}অনেকের পরিশ্রমে গড়া সাম্রাজ্য</div>`, sfx: [[emp, "pop.mp3", 0.3]] },
    { at: sud - 0.2, html: `<div class="chip red" id="f2br">${icon("swords", 36)}আরেক সাম্রাজ্য এসে ভেঙে দিল</div>`,
      beats: [[brk, "#f2br", "wiggle", { a: 2.5, d: 0.07, n: 5 }]], sfx: [[sud, "click.mp3", 0.3], [brk, "boom.mp3", 0.3]] },
    { at: who - 0.2, html: `<div class="chip gold" style="font-size:44px">${icon("circle-question-mark", 44)}এখন পাওয়ারফুল কে?</div>`, sfx: [[who, "click.mp3", 0.3]] },
    { at: god - 0.2, html: `<div class="chip gold">${icon("sparkles", 36)}সৃষ্টিকর্তা সবচেয়ে পাওয়ারফুল</div>`, sfx: [[god, "sparkle.mp3", 0.3]] },
    { at: old - 0.3, html: `<div class="rows">
        <div class="rl">আগে</div><div class="rc"><div class="chip">সাম্রাজ্য বনাম সাম্রাজ্য</div></div>
        <div class="rl" id="f2nl">এখন</div><div class="rc"><div class="chip" id="f2c0">কোম্পানি</div><div class="chip" id="f2c1">টেকনোলজি</div><div class="chip gold" id="f2c2">AI</div></div></div>`,
      beats: [[now, "#f2nl", "fade", {}], [co, "#f2c0", "pop", {}], [tech, "#f2c1", "pop", {}], [aiw, "#f2c2", "pop", {}]],
      sfx: [[old, "whoosh-short.mp3", 0.35], [co, "pop.mp3", 0.25], [tech, "pop.mp3", 0.25], [aiw, "pop.mp3", 0.3]] },
    { at: surv - 0.3, html: `<div class="chip gold" style="font-size:42px">${icon("shield", 40)}টিকে থাকতে সবচেয়ে জরুরি কী?</div>`, sfx: [[surv, "ping.mp3", 0.3]] },
    { at: sword - 0.3, html: `<div class="chip" id="f2o0">${icon("swords", 34)}তলোয়ার?</div><div class="chip" id="f2o1">${icon("landmark", 34)}আশ্রয়কেন্দ্র?</div><div class="chip" id="f2o2">কিছুই না?</div>`,
      beats: [[shel, "#f2o1", "pop", {}], [noth, "#f2o2", "pop", {}]], sfx: [[sword, "pop.mp3", 0.3], [shel, "pop.mp3", 0.3], [noth, "pop.mp3", 0.3]] },
  ],
});
