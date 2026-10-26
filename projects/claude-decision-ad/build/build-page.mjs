// The Claude 5X ad's moments; tools/screen/promo-core.mjs turns them into index.html.
//   node build/build-page.mjs [--out=<file>]      (timings: build/timeline.mjs; cursor: build/cursor.json)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildPromo } from "../../../tools/screen/promo-core.mjs";
import { CAM_HOLD, CLICK, T, TOTAL } from "./timeline.mjs";

const PROJECT = path.resolve(import.meta.dirname, "..");
const out = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? path.join(PROJECT, "index.html");

const html = buildPromo({
  title: "Claude 5X — So, what's your decision?",
  total: TOTAL,
  clip: { src: "assets/media/cam_blur.mp4", dur: CLICK + CAM_HOLD }, // name, email and profile blurred (cut.mjs --blur)
  camera: [
    { t: 0.2, d: 2.0, s: 1.4, l: 548, tp: 180, e: "power2.inOut" }, // in on the model menu
    { t: 2.2, d: 10.3, s: 1.44, l: 586, tp: 188, e: "sine.inOut" }, // slow creep while Max / Fable 5.1 are picked
    { t: 12.6, d: 1.8, s: 1, l: 0, tp: 0, e: "power2.inOut" }, // back to full screen
    { t: 16.9, d: 1.0, s: 1.25, l: 0, tp: 116, e: "power3.inOut" }, // pan to the sidebar as it opens
    { t: 20.55, d: 1.05, s: 1.1, l: 88, tp: 49, e: "power3.inOut" }, // the Settings window
    { t: 22.9, d: 1.2, s: 1.3, l: 222, tp: 90, e: "power3.inOut" }, // in on Usage
    { t: 24.1, d: 10.4, s: 1.3, l: 222, tp: 150, e: "sine.inOut" }, // drift down to the weekly bars
    { t: 34.5, d: 3.5, s: 1.3, l: 222, tp: 120, e: "sine.inOut" },
    { t: 38.0, d: 1.2, s: 1.3, l: 214, tp: 95, e: "power2.inOut" }, // General → Claude Code → Memory
    { t: 42.6, d: 1.2, s: 1, l: 0, tp: 0, e: "power3.inOut" }, // out as the window closes
    { t: 66.5, d: T.hover - 66.5, s: 1.8, l: 427, tp: 305, e: "power1.in" }, // the slow climax push onto the chat box
    { t: T.hover, d: CLICK - T.hover, s: 1.86, l: 960 - 960 / 1.86, tp: 605 - 540 / 1.86, e: "none" },
  ],
  tilt: [
    { t: 42.8, d: 1.4, s: 0.84, rx: 5, ry: -9, br: 22, e: "power3.inOut" },
    { t: 45.6, d: 2.4, s: 0.85, rx: 4, ry: 7, br: 22, e: "sine.inOut" },
    { t: 48.0, d: 5.0, s: 0.86, rx: 3, ry: 4, br: 22, e: "sine.inOut" },
    { t: 53.0, d: 2.2, s: 0.85, rx: 5, ry: -8, br: 22, e: "sine.inOut" },
    { t: 56.8, d: 1.7, s: 1, rx: 0, ry: 0, br: 0, e: "power3.inOut" }, // flat and full screen at 58.5 (orig 1:00)
  ],
  vignette: [{ in: 14.6, out: 42.6 }],
  glow: { track: JSON.parse(readFileSync(path.join(PROJECT, "build", "cursor.json"), "utf8")), out: 14.2 },
  boom: { t: CLICK, at: [1418, 648] }, // the orange submit button
  end: {
    line1: { words: ["SO,", "WHAT'S", "YOUR", "DECISION?"], slams: T.slam1 },
    lift: { t: T.lift, y: -262, scale: 0.64 },
    line2: { rows: [["UNLOCK", "5X ENTERPRISE"], ["AI POWER"]], slams: T.slam2 },
    sheens: [["#l1", 81.6], ["#l2", T.sheen2, 1.0], ["#l1", 89.6, 1.0]],
    cta: { text: "SEND MESSAGE NOW", t: T.cta, pulses: T.pulses, sheen: 86.8 },
  },
});
writeFileSync(out, html);
console.log(`✓ ${out} (${TOTAL} s)`);
