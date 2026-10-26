#!/usr/bin/env node
// Facebook Reel 3 — "ঘোড়ার শক্তি গেল ইঞ্জিনে, এবার কার পালা?" (episode 5:27–7:07), ends frozen on
// "তার থেকেও বড় বিষয় হচ্ছে…". Times are SOURCE seconds through T()/TW().
import { readFileSync } from "node:fs";
import { icon } from "../../tools/episode/page-core.mjs";
import { buildReel, patchWords, reelContext } from "../../tools/episode/reel-core.mjs";

const ctx = reelContext(import.meta.dirname);
const { TW } = ctx;
// the last seconds as heard by the Bengali model (asr-tail.json, source seconds, spelling corrected)
patchWords(ctx, 416, 428, JSON.parse(readFileSync(new URL("asr-tail.json", import.meta.url), "utf8")));

const horse = TW(["ঘোড়ার"], 333.9, 2), hp = TW(["'হর্সপাওয়ার'"], 341.1, 2), car = TW(["গাড়ি"], 356.8, 2), eng = TW(["ইঞ্জিনের"], 362.0, 2);
const word = TW(["ওয়ার্ড,"], 371.6, 2), excel = TW(["এক্সেল,"], 372.4, 2), ppt = TW(["পাওয়ারপয়েন্ট"], 373.2, 2), auto = TW(["অটোমেট"], 382.9, 2);
const ai = TW(["AI"], 386.2, 2), dec = TW(["ডিসিশন"], 388.5, 2), plan = TW(["প্ল্যান"], 392.4, 2), rs = TW(["রিসার্চ"], 394.3, 2), bld = TW(["বিল্ড"], 396.5, 2);
const routine = TW(["রুটিন"], 404.0, 2), none = TW(["প্রয়োজনই"], 409.6, 2), guru = TW(["গুরুরা"], 415.3, 2);
buildReel(ctx, {
  tag: "THE AGE OF AI · EP 01",
  hook: "ঘোড়ার শক্তি গেল ইঞ্জিনে, <em>এবার কার পালা?</em>",
  cta: ["বাকিটা <em>পুরো পর্বে</em>", "লিংক কমেন্টে"],
  cliff: { text: "তার থেকেও বড় বিষয় হচ্ছে…", sub: "বাকিটা পুরো পর্বে" },
  groups: [
    { at: horse - 0.3, html: `<div class="chip">${icon("footprints", 34)}আগে: ঘোড়ার গাড়ি</div><div class="chip gold" id="f3hp">শক্তি = হর্সপাওয়ার</div>`,
      beats: [[hp, "#f3hp", "pop", {}]], sfx: [[horse, "pop.mp3", 0.3], [hp, "pop.mp3", 0.3]] },
    { at: car - 0.3, html: `<div class="chip">${icon("car", 36)}গাড়ি চলে এলো</div><div class="chip gold" id="f3en">হর্সপাওয়ার এখন ইঞ্জিনে</div>`,
      beats: [[eng, "#f3en", "pop", {}]], sfx: [[car, "whoosh-short.mp3", 0.35], [eng, "click.mp3", 0.3]] },
    { at: word - 0.3, html: `<div class="wrap" style="position:relative;margin-top:-44px">
        <div class="chip" id="f3l0">${icon("file-text", 34)}ওয়ার্ড</div><div class="chip" id="f3l1">${icon("sheet", 34)}এক্সেল</div>
        <div class="chip" id="f3l2">${icon("presentation", 34)}পাওয়ারপয়েন্ট থেকে বড় সফটওয়্যার</div>
        <div class="stamp green" id="f3st" style="top:-30px;letter-spacing:0;font-family:&quot;Baloo Da 2&quot;, &quot;Hind Siliguri&quot;, sans-serif" data-layout-allow-overlap data-design-allow-straddle>অটোমেট</div></div>`,
      beats: [[excel, "#f3l1", "inx", {}], [ppt, "#f3l2", "inx", {}], [auto - 0.1, "#f3st", "stamp", {}]],
      sfx: [[word, "click.mp3", 0.3], [excel, "click.mp3", 0.3], [ppt, "click.mp3", 0.3], [auto, "impact-bass-2.mp3", 0.2]] },
    { at: ai - 0.2, html: `<div class="wrap"><div class="chip gold">${icon("bot", 36)}AI একাই</div><div class="chip" id="f3a0">ডিসিশন</div><div class="chip" id="f3a1">প্ল্যান</div><div class="chip" id="f3a2">রিসার্চ</div><div class="chip" id="f3a3">বিল্ড</div></div>`,
      beats: [[dec, "#f3a0", "pop", {}], [plan, "#f3a1", "pop", {}], [rs, "#f3a2", "pop", {}], [bld, "#f3a3", "pop", {}]],
      sfx: [[ai, "click-soft.mp3", 0.35], [dec, "pop.mp3", 0.25], [plan, "pop.mp3", 0.25], [rs, "pop.mp3", 0.25], [bld, "pop.mp3", 0.25]] },
    { at: routine - 0.3, html: `<div class="col" style="position:relative"><div class="panel">রুটিন কাজে মানুষের প্রয়োজন কোথায়?</div><div class="stamp" id="f3no" style="letter-spacing:0;font-family:&quot;Baloo Da 2&quot;, &quot;Hind Siliguri&quot;, sans-serif" data-layout-allow-overlap data-design-allow-straddle>প্রয়োজনই নাই!</div></div>`,
      beats: [[none - 0.05, "#f3no", "stamp", {}]], sfx: [[routine, "click.mp3", 0.3], [none, "impact-bass-2.mp3", 0.25]] },
    { at: guru - 0.3, html: `<div class="bub">${icon("megaphone", 40)}গুরুরা বলছে: “AI চাকরি খেয়ে দিবে”</div>`, sfx: [[guru, "pop.mp3", 0.3]] },
  ],
});
