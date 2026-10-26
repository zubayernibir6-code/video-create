// Lists the moments something changes on a screen recording: menus opening, pages switching, a button turning
// into a spinner. Use it to time camera moves and click sounds instead of guessing from a contact sheet.
//   node tools/screen/watch.mjs <video> [--from=<s>] [--to=<s>] [--threshold=0.35] [--json=<out.json>]
//       whole frame: FFmpeg scdet scene scores (in %) at 640 px wide; 0.35 catches a menu, 1.5 only page changes
//   node tools/screen/watch.mjs <video> --box=x,y,w,h [--from] [--to] [--delta=0.8] [--json=<out.json>]
//       one region: every frame whose mean brightness (YAVG) moves by ≥ delta from the previous change
//       (a caret blink is ±0.75 in a 330×40 text box; a button's hover/pressed state is 5–12)
// Times are in the video's own seconds. A click lands ~1 frame BEFORE the change it causes.
// Verified 2026-10-25 on the Claude ad: found the model menu (3.23), Settings (20.53), Usage (22.77) and the
// submit spinner (80.617 in the original) that the brief had put at other times.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const video = args.find((a) => !a.startsWith("--"));
if (!video) { console.log("Usage: node tools/screen/watch.mjs <video> [--box=x,y,w,h] [--from=s] [--to=s] [--threshold=0.35 | --delta=0.8] [--json=out.json]"); process.exit(1); }
const from = Number(flag("from", 0)), to = flag("to") ? Number(flag("to")) : null;
const box = flag("box");
const seek = ["-ss", String(from), ...(to ? ["-to", String(to)] : []), "-i", video];

let events = [];
if (box) {
  const [x, y, w, h] = box.split(",").map(Number);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...seek, "-vf", `crop=${w}:${h}:${x}:${y},signalstats,metadata=print:key=lavfi.signalstats.YAVG`, "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 28 });
  const pts = [...r.stderr.matchAll(/pts_time:([\d.]+)[\s\S]*?YAVG=([\d.]+)/g)].map((m) => ({ t: from + Number(m[1]), v: Number(m[2]) }));
  const delta = Number(flag("delta", 0.8));
  let last = null;
  for (const p of pts) {
    if (last === null || Math.abs(p.v - last) >= delta) { events.push({ t: +p.t.toFixed(3), yavg: +p.v.toFixed(2), change: last === null ? 0 : +(p.v - last).toFixed(2) }); last = p.v; }
  }
  for (const e of events) console.log(`${e.t.toFixed(3).padStart(9)}  yavg ${e.yavg.toFixed(1).padStart(6)}  ${e.change >= 0 ? "+" : ""}${e.change.toFixed(2)}`);
} else {
  const th = Number(flag("threshold", 0.35));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...seek, "-vf", `scale=640:-1,scdet=threshold=${th}`, "-an", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 28 });
  events = [...r.stderr.matchAll(/lavfi\.scd\.score: ([\d.]+), lavfi\.scd\.time: ([\d.]+)/g)].map((m) => ({ t: +(from + Number(m[2])).toFixed(3), score: Number(m[1]) }));
  for (const e of events) console.log(`${e.t.toFixed(3).padStart(9)}  score ${e.score.toFixed(1)}${e.score >= 1.5 ? "  ← page change" : ""}`);
}
if (flag("json")) writeFileSync(flag("json"), JSON.stringify(events, null, 1));
console.log(`${events.length} change(s)`);
