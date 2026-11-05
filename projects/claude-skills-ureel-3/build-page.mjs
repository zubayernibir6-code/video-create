#!/usr/bin/env node
// claude-skills-ureel-3 — written by tools/explainer/reels.mjs from projects/claude-skills-tutorial/build/reels.json (edit the json, not this file).
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
buildCutdown(ctx, {
  profile: "universal-reel",
  title: "নিজের Claude স্কিল বানান",
  tag: "Claude Skills · পার্ট ৩",
  hook: "নিজের <em>Claude</em> স্কিল বানান",
  start: [960,475,0.6],
  pans: [
    [M(211.635), 960, 480, 0.8, 0.65],
    [M(212.615), 1220, 304, 0.7, 0.9],
    [M(217.555), 1160, 350, 0.7, 0.9],
    [M(219.355), 900, 430, 0.7, 0.9],
    [M(220.655), 820, 520, 0.7, 0.9],
    [M(222.320), 960, 391, 0.8, 0.7],
    [M(224.615), 556, 304, 0.7, 0.9],
    [M(227.235), 910, 304, 0.7, 0.9],
    [M(229.435), 1364, 304, 0.7, 0.9],
    [M(230.115), 1250, 610, 0.7, 0.85],
    [M(232.075), 900, 610, 0.7, 0.85],
    [M(234.930), 960, 475, 0.8, 0.6],
    [M(238.500), 625, 500, 0.7, 0.8],
    [M(239.340), 1295, 500, 0.7, 0.8],
    [M(242.160), 960, 457, 0.8, 0.6],
    [M(242.560), 820, 350, 0.7, 0.85],
    [M(245.360), 700, 610, 0.7, 0.85],
    [M(249.120), 1060, 590, 0.7, 0.8],
    [M(214.795), 960, 380, 0.7, 0.75],
    [M(247.200), 1332, 330, 0.7, 0.85],
  ],
  pushes: [].map(([t, d]) => [M(t), d]),
  jumps: [],
  cliff: {"text":"কোথায় কাজে লাগাবেন?","sub":"পুরো ভিডিওতে দেখুন","d":2.5},
  endTag: "Claude Skills",
  cta: ["পুরো ভিডিও: <em style=\"white-space:nowrap\">ধাপে ধাপে</em> ৫ মিনিট", `${icon("circle-user", 40)}আমার প্রোফাইলে দেখুন`],
  sfx: [],
  chips: [
    { at: M(207.840), out: M(209.010), html: `<div class="chip gold">${icon("pen", 34)}নিজের স্কিল, দুইভাবে</div>` },
    { at: M(211.635), out: M(219.055), html: `<div class="chip" style="font-size:30px">${icon("message-square", 30)}বলুন: skill-creator দিয়ে বানাও</div>` },
    { at: M(219.355), out: M(221.160), html: `<div class="chip green" style="font-size:30px">${icon("sparkles", 30)}Claude প্রশ্ন করে লিখে দেয়</div>` },
    { at: M(222.320), out: M(229.815), html: `<div class="chip" style="font-size:30px">${icon("archive", 30)}ফোল্ডারে SKILL.md, তারপর ZIP</div>` },
    { at: M(230.115), out: M(234.150), html: `<div class="chip" style="font-size:28px">${icon("upload", 28)}Create skill, তারপর Upload a skill</div>` },
    { at: M(234.930), out: M(241.220), html: `<div class="chip red">${icon("triangle-alert", 34)}ZIP-এ পুরো ফোল্ডার চাই</div>` },
    { at: M(242.160), out: M(249.570), html: `<div class="chip gold">${icon("pen", 34)}বর্ণনা পরিষ্কার লিখুন</div>` },
  ],
});
