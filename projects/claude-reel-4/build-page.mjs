#!/usr/bin/env node
// Reel 4 — "একটা প্রম্পট দিলাম, বাকিটা Claude নিজে করল": Submit, thinking and the build checklist (silent, 2×),
// then the finished ad with its cursor glow, 3D tilt and golden glitch end screen (master 7:02.5–7:52.9), then his
// face (master 7:52.95–8:01.2). The ad is shown at 0.6 so its own callouts stay in the window.
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M } = ctx;
buildCutdown(ctx, {
  title: "Reel 4 — একটা প্রম্পট দিলাম, বাকিটা Claude নিজে করল",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ৪",
  hook: "একটা প্রম্পট দিলাম, বাকিটা <em>Claude</em> নিজে করল",
  start: [960, 460, 0.75],
  pans: [
    [M(387.0), 960, 420, 0, 0.75], [M(399.0), 800, 450, 0], [M(422.5), 700, 400, 0], [M(426.5), 760, 420, 0.8],
    [M(432.8), 960, 540, 0, 0.6],
  ],
  pushes: [[M(422.6), 2.5]],
  jumps: [M(472.95), M(477.0)],
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: ["পুরো ভিডিও: <em>ধাপে ধাপে</em> ৮ মিনিট", `${icon("message-circle", 40)}লিংক কমেন্টে`],
  sfx: [[0.05, "click", 0.4], [M(387.0), "riser", 0.25, 0, 2.2], [M(399.0), "whoosh-short", 0.3],
    [M(399.6), "click-soft", 0.3], [M(400.6), "click-soft", 0.3], [M(401.6), "click-soft", 0.3], [M(402.6), "click-soft", 0.3],
    [M(422.5), "whoosh", 0.35], [M(432.8), "whoosh-short", 0.3], [M(450.2), "whoosh-short", 0.3]],
  chips: [
    { at: 0.1, out: 2.25, html: `<div class="chip gold">${icon("mouse-pointer-click", 34)}প্রম্পট দিলাম</div>` },
    { at: M(387.0), out: M(390.9), html: `<div class="chip">${icon("brain", 34)}Claude ভাবছে</div><div class="chip gold">২×</div>` },
    { at: M(399.0), out: M(403.0), html: `<div class="chip green">${icon("list-checks", 34)}নিজেই বানাচ্ছে</div>` },
    { at: M(422.6), out: M(434.7), html: `<div class="chip green">${icon("film", 34)}ভিডিও তৈরি</div>`, sfx: [[M(422.6), "success", 0.3]] },
    { at: M(435.0), out: M(443.3), html: `<div class="chip gold">${icon("sparkles", 34)}কার্সরের আভা</div>` },
    { at: M(450.3), out: M(455.1), html: `<div class="chip gold">${icon("rotate-3d", 34)}3D কাত</div>` },
    { at: M(455.4), out: M(466.3), html: `<div class="chip gold">${icon("zap", 34)}গ্লিচ ট্রানজিশন</div>`, sfx: [[M(455.4), "pop", 0.3]] },
    { at: M(466.7), out: M(472.6), html: `<div class="chip gold">${icon("star", 34)}সোনালি শেষ পর্দা</div>` },
    { at: M(475.2), out: M(480.9), html: `<div class="chip green">${icon("circle-check", 34)}শুধু সঠিক নির্দেশনা</div><div class="chip gold" id="r4m">+ Claude Max</div>`,
      beats: [[M(477.6), "#r4m", "pop", {}]], sfx: [[M(477.6), "pop", 0.3]] },
  ],
});
