#!/usr/bin/env node
// Facebook Reel 1 — "যে ক্যারিয়ার সেফ ছিল, আজ কেন নেই?" (episode 0:05–1:39), ends frozen on "এটা কেন হচ্ছে?".
// Times are SOURCE seconds through T()/TW().
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, patchWords, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW, T } = ctx;
// the last seconds as heard by the Bengali model (the subtitle estimate runs late here)
patchWords(ctx, 94, 100, [
  ["আমাদের", 94.0, 95.02], ["রেসপনসিবিলিটিও", 95.02, 95.98], ["আরও", 95.98, 96.26], ["বেশি", 96.26, 96.72],
  ["বেড়ে", 96.72, 96.92], ["গিয়েছে।", 96.92, 98.03], ["এটা", 98.46, 98.72], ["কেন", 98.72, 99.0], ["হচ্ছে", 99.0, 99.32], ["এরকম?", 99.32, 99.44],
].map(([text, start, end]) => ({ text, start, end })));

const q0 = TW(["আগে"], 11.1, 2), q1 = TW(["পরে"], 12.4, 2), q2 = TW(["ইম্পর্টেন্ট"], 13.8, 2);
const why = TW(["কারণ"], 21.3, 2), org = TW(["অর্গানাইজডভাবে"], 29.2, 2);
const res = TW(["গবেষণায়"], 35.1, 2), step = TW(["স্টেপে"], 42.2, 2), goal = TW(["গন্তব্যে"], 47.7, 2);
const small = TW(["কাজটা"], 52.2, 2), obs = TW(["অবসোলিট"], 63.5, 2);
const ago = TW(["৩-৪"], 66.3, 2), safe = TW(["সেফ,"], 79.1, 2), but = T(87.6);
const comp = TW(["কম্পিটিশন"], 88.9, 2), resp = T(95.02);
buildReel(ctx, {
  tag: "THE AGE OF AI · পার্ট ১",
  hook: "যে ক্যারিয়ার <em>সেফ</em> ছিল, আজ কেন নেই?",
  cta: ["উত্তর <em>পার্ট ২-এ</em>", "লিংক কমেন্টে"],
  cliff: { text: "এটা কেন হচ্ছে?", sub: "উত্তর পার্ট ২-এ" },
  groups: [
    { at: q0 - 0.3, html: `<div class="chip" id="f1q0">কোনটা আগে?</div><div class="chip" id="f1q1">কোনটা পরে?</div><div class="chip gold" id="f1q2">কোনটা জরুরি?</div>`,
      beats: [[q1, "#f1q1", "pop", {}], [q2, "#f1q2", "pop", {}]], sfx: [[q0, "pop.mp3", 0.3], [q1, "pop.mp3", 0.3], [q2, "pop.mp3", 0.3]] },
    { at: why - 0.2, html: `<div class="col"><div class="li">${icon("target", 34)}লক্ষ্যকে কতটা ভালোভাবে বুঝি</div><div class="li" id="f1o">${icon("layers", 34)}কতটা গুছিয়ে কাজ করি</div></div>`,
      beats: [[org, "#f1o", "inx", {}]], sfx: [[why, "click.mp3", 0.3], [org, "click.mp3", 0.3]] },
    { at: res - 0.2, html: `<div class="steps"><div class="chip">বড় লক্ষ্য</div><div class="chip" id="f1s1">ছোট ছোট স্টেপ</div><div class="chip gold" id="f1s2">${icon("target", 32)}গন্তব্য</div></div>`,
      beats: [[step, "#f1s1", "pop", {}], [goal, "#f1s2", "pop", {}]], sfx: [[res, "click-soft.mp3", 0.35], [step, "pop.mp3", 0.25], [goal, "ping.mp3", 0.3]] },
    { at: small - 0.2, html: `<div class="col"><div class="li">“এই কাজটা তো ছোট, করব না”</div><div class="chip red" id="f1ob" style="align-self:center">ধীরে ধীরে অবসোলিট</div></div>`,
      beats: [[obs, "#f1ob", "pop", {}]], sfx: [[small, "click.mp3", 0.3], [obs, "impact-bass-2.mp3", 0.22]] },
    { at: ago - 0.2, html: `<div class="panel strike">৩–৭ বছর আগে: <em>“এই ক্যারিয়ারই সেফ”</em><i class="sk" id="f1sk"></i></div>`,
      beats: [[but, "#f1sk", "grow", { d: 0.35 }]], sfx: [[ago, "whoosh-short.mp3", 0.35], [safe, "click-soft.mp3", 0.3], [but, "whoosh-short.mp3", 0.3]] },
    { at: comp - 0.2, html: `<div class="bars">
        <div class="bl">কম্পিটিশন</div><div class="track"><div class="hb red" id="f1b0">${icon("trending-up", 32)}</div></div>
        <div class="bl">দায়িত্ব</div><div class="track"><div class="hb red" id="f1b1" style="background:${"#FFD700"}">${icon("trending-up", 32)}</div></div></div>`,
      beats: [[comp, "#f1b0", "grow", { d: 1.2 }], [resp, "#f1b1", "grow", { d: 1.2 }]], sfx: [[comp, "typing.mp3", 0.22], [resp, "typing.mp3", 0.22]] },
  ],
});
