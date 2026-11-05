#!/usr/bin/env node
// claude-skills-ureel-2 — written by tools/explainer/reels.mjs from projects/claude-skills-tutorial/build/reels.json (edit the json, not this file).
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
buildCutdown(ctx, {
  profile: "universal-reel",
  title: "Claude-এ স্কিল চালু করবেন যেভাবে",
  tag: "Claude Skills · পার্ট ২",
  hook: "<em>Claude</em>-এ স্কিল চালু করবেন যেভাবে",
  start: [960,475,0.6],
  pans: [
    [M(167.575), 625, 560, 0.7, 0.8],
    [M(169.555), 1295, 560, 0.7, 0.8],
    [M(172.095), 760, 450, 0.8, 0.75],
    [M(176.575), 700, 420, 0.7, 0.9],
    [M(178.695), 1295, 420, 0.7, 0.8],
    [M(183.755), 960, 430, 0.8, 0.7],
    [M(185.545), 720, 420, 0.7, 0.85],
    [M(189.305), 1364, 390, 0.7, 0.9],
    [M(192.125), 1060, 430, 0.7, 0.9],
    [M(194.000), 960, 510, 0.8, 0.65],
    [M(196.105), 760, 460, 0.7, 0.8],
    [M(199.305), 1330, 470, 0.7, 0.85],
    [M(202.115), 960, 365, 0.8, 0.75],
    [M(204.135), 1332, 330, 0.7, 0.85],
    [M(173.875), 1000, 304, 0.7, 0.9],
  ],
  pushes: [].map(([t, d]) => [M(t), d]),
  jumps: [],
  cliff: {"text":"নিজের স্কিল বানাবেন কীভাবে?","sub":"ধাপে ধাপে দেখুন পুরো ভিডিওতে","d":2.5},
  endTag: "Claude Skills",
  cta: ["পুরো ভিডিও: <em style=\"white-space:nowrap\">ধাপে ধাপে</em> ৫ মিনিট", `${icon("circle-user", 40)}আমার প্রোফাইলে দেখুন`],
  sfx: [],
  chips: [
    { at: M(162.440), out: M(164.770), html: `<div class="chip">${icon("sparkles", 34)}নিজে বানাতে হবে না</div>` },
    { at: M(167.575), out: M(171.110), html: `<div class="chip" style="font-size:30px">${icon("file-text", 30)}Word · Excel · PowerPoint · PDF</div>` },
    { at: M(172.095), out: M(176.275), html: `<div class="chip">${icon("message-square", 34)}বলুন: PowerPoint বানাও</div>` },
    { at: M(176.575), out: M(179.280), html: `<div class="chip green">${icon("download", 34)}আসল ফাইল, ডাউনলোড করুন</div>` },
    { at: M(180.730), out: M(182.890), html: `<div class="chip gold">${icon("settings", 34)}চালু করবেন কীভাবে?</div>` },
    { at: M(183.755), out: M(189.005), html: `<div class="chip" style="font-size:30px">${icon("settings", 30)}Settings, তারপর Capabilities</div>` },
    { at: M(189.305), out: M(191.825), html: `<div class="chip green" style="font-size:30px">${icon("check", 30)}Code execution চালু</div>` },
    { at: M(192.125), out: M(193.250), html: `<div class="chip gold" style="font-size:28px">${icon("sparkles", 28)}নতুন নাম: Create and edit files</div>` },
    { at: M(194.000), out: M(199.840), html: `<div class="chip" style="font-size:30px">${icon("layers", 30)}Customize, তারপর Skills</div>` },
    { at: M(202.115), out: M(206.380), html: `<div class="chip green">${icon("check", 34)}ফ্রি প্ল্যানেও আছে</div>` },
  ],
});
