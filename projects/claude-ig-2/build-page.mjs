#!/usr/bin/env node
// Instagram Reel 2 — "শুধু সঠিক নির্দেশনা, বাকিটা Claude": his claim full 9:16 (master 7:52.95–7:58.55), the frame
// morphs into the window for the proof (Submit, thinking, checklist silent at 2×; the finished ad's glow, tilt and
// golden glitch), then grows back out for his CTA full 9:16 (master 8:01.3–8:14.75).
import { icon } from "../../tools/episode/page-core.mjs";
import { buildCutdown, cutdownContext } from "../../tools/cutdown/page.mjs";

const ctx = cutdownContext(import.meta.dirname);
const { M, W, map } = ctx;
const seg = map.segments;
const nir = W(["নির্দেশনা"], M(476.5), 2), max = W(["Max"], M(478.2), 2);
const kod = W(["কোডিং"], M(482.0), 2), vid = W(["ভিডিও"], M(483.8), 2), aut = W(["অটোমেশনের"], M(485.9), 2);
const msg = W(["মেসেজ"], M(491.3), 2), dm = W(["কমেন্ট"], M(492.8), 2);
buildCutdown(ctx, {
  title: "Instagram Reel 2 — শুধু সঠিক নির্দেশনা, বাকিটা Claude",
  tag: "Claude দিয়ে বিজ্ঞাপন · পার্ট ২",
  hook: "শুধু সঠিক নির্দেশনা, বাকিটা <em>Claude</em>",
  start: [960, 460, 0.75],
  pans: [[M(387.0), 960, 420, 0, 0.75], [M(399.0), 800, 450, 0], [M(422.4), 700, 400, 0], [M(426.0), 760, 420, 0.8],
    [M(434.9), 960, 540, 0, 0.6]],
  pushes: [[M(423.0), 2.5]],
  jumps: [M(472.95), M(481.3), M(486.0), M(490.6)],
  endTag: "Claude দিয়ে বিজ্ঞাপন",
  cta: ["পুরো ভিডিও: <em>ধাপে ধাপে</em> ৮ মিনিট", `${icon("link", 40)}লিংক Bio-তে`],
  sfx: [[0.05, "whoosh-short", 0.3], [seg[0].out1 - 0.7, "whoosh-short", 0.35], [M(383.0), "click", 0.4], [M(387.0), "riser", 0.25, 0, 2.2],
    [M(399.0), "whoosh-short", 0.3], [M(399.6), "click-soft", 0.3], [M(400.6), "click-soft", 0.3], [M(401.6), "click-soft", 0.3], [M(402.6), "click-soft", 0.3],
    [M(422.4), "whoosh", 0.35], [M(434.9), "whoosh-short", 0.3], [M(450.2), "whoosh-short", 0.3], [M(466.5), "whoosh-short", 0.25],
    [M(481.3), "whoosh-cinematic", 0.4]],
  chips: [
    { at: nir - 0.1, out: seg[0].out1 - 0.15, html: `<div class="chip green">${icon("circle-check", 34)}শুধু সঠিক নির্দেশনা</div><div class="chip gold" id="i2m">+ Claude Max</div>`,
      beats: [[max, "#i2m", "pop", {}]], sfx: [[nir, "success", 0.3], [max, "pop", 0.3]] },
    { at: M(382.9), out: M(384.9), html: `<div class="chip gold">${icon("mouse-pointer-click", 34)}প্রম্পট দিলাম</div>` },
    { at: M(387.0), out: M(390.9), html: `<div class="chip">${icon("brain", 34)}Claude ভাবছে</div><div class="chip gold">২×</div>` },
    { at: M(399.0), out: M(402.9), html: `<div class="chip green">${icon("list-checks", 34)}নিজেই বানাচ্ছে</div>` },
    { at: M(422.5), out: M(427.8), html: `<div class="chip green">${icon("film", 34)}ভিডিও তৈরি</div>`, sfx: [[M(422.5), "success", 0.3]] },
    { at: M(435.0), out: M(438.4), html: `<div class="chip gold">${icon("sparkles", 34)}কার্সরের আভা</div>` },
    { at: M(450.3), out: M(454.7), html: `<div class="chip gold">${icon("rotate-3d", 34)}3D কাত</div>` },
    { at: M(466.6), out: M(469.0), html: `<div class="chip gold">${icon("zap", 34)}গ্লিচ ট্রানজিশন</div>`, sfx: [[M(466.6), "pop", 0.3]] },
    { at: M(469.3), out: M(472.7), html: `<div class="chip gold">${icon("star", 34)}সোনালি শেষ পর্দা</div>`, sfx: [[M(469.3), "sparkle", 0.3]] },
    { at: kod - 0.1, out: msg - 0.35, html: `<div class="chip">${icon("code-xml", 34)}কোডিং</div><div class="chip" id="i2v">${icon("video", 34)}ভিডিও</div><div class="chip" id="i2a">${icon("zap", 34)}অটোমেশন</div>`,
      beats: [[vid, "#i2v", "pop", {}], [aut, "#i2a", "pop", {}]], sfx: [[kod, "pop", 0.3], [vid, "pop", 0.3], [aut, "pop", 0.3]] },
    { at: msg - 0.05, out: dm - 0.3, html: `<div class="chip">${icon("mail", 34)}মেসেজ দিন</div>`, sfx: [[msg, "notification", 0.35]] },
    { at: dm - 0.05, html: `<div class="chip gold" id="i2dm" style="font-size:40px">${icon("message-circle", 40)}কমেন্টে লিখুন DM</div>`,
      beats: [[dm + 1.2, "#i2dm", "wiggle", { a: 2, d: 0.12 }]], sfx: [[dm, "impact-bass-2", 0.35, 0, 1.2]] },
  ],
});
