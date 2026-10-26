// Finds where a piece of on-screen text (a name, an email) sits and in which frames it is visible, so privacy
// blurs (cut.mjs --blur) cover exactly those frames — and proves afterwards that nothing readable is left.
//   node tools/screen/text-scan.mjs <video> --band=y0,y1 --at=1,15,18      word boxes (x ranges) in that band at those times
//   node tools/screen/text-scan.mjs <video> --band=y0,y1 --find=A:985-1161,B:896-1072,C:1112-1288
//       runs of frames in which each labelled box is present (±8 px); "-" = none of them visible
//   … --find=… --leaks      after blurring: list frames where any box is still sharp (should be 0)
// Word boxes = runs of columns holding pixels brighter than --thr (150 suits white UI text on a dark theme),
// split at gaps > 9 px. Verified 2026-10-26 on the Claude ad: the greeting name in 3 layouts (Good evening /
// Up late / sidebar open), hidden under the model menu in 3 windows; the blurred clip scanned 0 sharp frames.
// A run of "-" is NOT proof the text is hidden (a dimmed or shifted name is missed): look at a frame from each gap.
import { spawn, spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}`)); return a ? (a.includes("=") ? a.slice(a.indexOf("=") + 1) : true) : d; };
const video = args.find((a) => !a.startsWith("--"));
if (!video || !flag("band")) { console.log("Usage: node tools/screen/text-scan.mjs <video> --band=y0,y1 [--at=t1,t2 | --find=L:a-b,… [--leaks]] [--thr=150]"); process.exit(1); }
// FFmpeg rounds a crop of a 4:2:0 video to EVEN sizes: a 65-row band came out 64 rows, every frame was read one row
// off and the scan's clock drifted 1.2 s over 80 s (found 2026-10-26: it hid a real unblurred stretch). Keep it even.
const [y0, y1raw] = flag("band").split(",").map(Number), y1 = y0 + 2 * Math.round((y1raw - y0) / 2), H = y1 - y0, thr = Number(flag("thr", 150));
const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,r_frame_rate", "-of", "csv=p=0", video], { encoding: "utf8" }).stdout.trim().split(",");
const W = Number(probe[0]), [n, d] = probe[1].split("/").map(Number), fps = n / (d || 1);

function words(buf, o) {
  const out = []; let s = -1, gap = 0;
  for (let x = 0; x <= W; x++) {
    let on = false;
    if (x < W) for (let y = 0; y < H; y++) if (buf[o + y * W + x] > thr) { on = true; break; }
    if (on) { if (s < 0) s = x; gap = 0; } else if (s >= 0 && ++gap > 9) { out.push([s, x - gap]); s = -1; gap = 0; }
  }
  return out;
}

if (flag("at")) {
  for (const t of String(flag("at")).split(",")) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-ss", t, "-i", video, "-frames:v", "1", "-vf", `crop=${W}:${H}:0:${y0},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 26 });
    console.log(`t=${t}: ${words(r.stdout, 0).map(([a, b]) => `${a}-${b}`).join("  ")}`);
  }
  process.exit(0);
}
const targets = String(flag("find")).split(",").map((s) => { const [l, r] = s.split(":"); const [a, b] = r.split("-").map(Number); return { l, a, b }; });
const ff = spawn("ffmpeg", ["-v", "error", "-i", video, "-vf", `crop=${W}:${H}:0:${y0},format=gray`, "-f", "rawvideo", "-"]);
const frame = W * H; let pending = Buffer.alloc(0), f = 0; const runs = []; const leaks = [];
ff.stdout.on("data", (c) => {
  pending = Buffer.concat([pending, c]);
  while (pending.length >= frame) {
    const ws = words(pending, 0); pending = pending.subarray(frame);
    const hit = targets.filter((t) => ws.some(([p, q]) => Math.abs(p - t.a) <= 8 && Math.abs(q - t.b) <= 8)).map((t) => t.l).join("") || "-";
    if (hit !== "-") leaks.push(f);
    const cur = runs.at(-1);
    if (!cur || cur.hit !== hit) runs.push({ hit, from: f, to: f }); else cur.to = f;
    f++;
  }
});
ff.on("close", () => {
  if (flag("leaks")) console.log(`${f} frames scanned · sharp frames: ${leaks.length}${leaks.length ? " at " + leaks.slice(0, 30).map((x) => (x / fps).toFixed(2)).join(", ") : ""}`);
  else for (const r of runs) console.log(`${r.hit.padEnd(4)} ${(r.from / fps).toFixed(3)} – ${((r.to + 1) / fps).toFixed(3)}`);
});
