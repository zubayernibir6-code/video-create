// Frame-exact cut of a screen recording into the clip a promo page plays: keep one stretch, optionally freeze
// one frame for a while (to land a click after a voice line), hold the last frame under a transition, and
// convert to the render frame rate. Counts SOURCE frames, so nothing drifts.
//   node tools/screen/cut.mjs <video> <out.mp4> --from=<s> --to=<s> [--hold=<at_s>:<dur_s>] [--tail=<s>] [--fps=30] [--crf=14]
// --from: first kept moment (e.g. the first frame after the OBS window is gone; find it with watch.mjs).
// --to:   first frame NOT kept (e.g. the click frame, so the spinner never shows).
// --hold: repeat the source frame at <at_s> for <dur_s> s (rounded to source frames).
// Prints how source time maps to clip time. Verified 2026-10-25 (Claude ad): 60 fps → 30 fps, 2401 frames,
// clip frame 1000 = source frame 2090 exactly (PSNR 59 dB, ±2 frames ≤ 39 dB).
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const [src, out] = args.filter((a) => !a.startsWith("--"));
if (!src || !out || !flag("from") || !flag("to")) { console.log("Usage: node tools/screen/cut.mjs <video> <out.mp4> --from=s --to=s [--hold=at:dur] [--tail=s] [--fps=30] [--crf=14]"); process.exit(1); }
const p = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", src], { encoding: "utf8" }).stdout.trim();
const [n, d] = p.split("/").map(Number), sfps = n / (d || 1);
const fps = Number(flag("fps", 30)), crf = flag("crf", "14");
const F = (t) => Math.round(Number(t) * sfps);
const a = F(flag("from")), b = F(flag("to"));
const parts = [];
let graph = "[0:v]split=3[s0][s1][s2];";
if (flag("hold")) {
  const [at, dur] = flag("hold").split(":").map(Number), h = F(at), reps = Math.max(1, Math.round(dur * sfps));
  if (h <= a || h >= b) { console.error("--hold must fall inside --from..--to"); process.exit(1); }
  graph += `[s0]trim=start_frame=${a}:end_frame=${h},setpts=PTS-STARTPTS[p0];[s1]trim=start_frame=${h}:end_frame=${h + 1},setpts=PTS-STARTPTS,loop=loop=${reps - 1}:size=1:start=0[p1];[s2]trim=start_frame=${h}:end_frame=${b},setpts=PTS-STARTPTS[p2];[p0][p1][p2]concat=n=3:v=1:a=0`;
  parts.push(`source ${(a / sfps).toFixed(3)}–${(h / sfps).toFixed(3)} → clip 0–${((h - a) / sfps).toFixed(3)}`, `hold source ${(h / sfps).toFixed(3)} for ${(reps / sfps).toFixed(3)} s`, `source ${(h / sfps).toFixed(3)}–${(b / sfps).toFixed(3)} → clip ${((h - a + reps) / sfps).toFixed(3)}–${((b - a + reps) / sfps).toFixed(3)}`);
} else {
  graph = `[0:v]trim=start_frame=${a}:end_frame=${b},setpts=PTS-STARTPTS`;
  parts.push(`source ${(a / sfps).toFixed(3)}–${(b / sfps).toFixed(3)} → clip 0–${((b - a) / sfps).toFixed(3)}`);
}
const tail = Number(flag("tail", 0));
graph += `,setpts=N/${sfps}/TB,fps=${fps}${tail ? `,tpad=stop_mode=clone:stop_duration=${tail}` : ""},format=yuv420p[v]`;
const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-i", src, "-filter_complex", graph, "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-g", String(fps),
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", "-y", out], { stdio: "inherit" });
if (r.status !== 0) process.exit(r.status ?? 1);
const c = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
console.log(parts.join("\n") + (tail ? `\n+ last frame held ${tail} s` : "") + `\n✓ ${out}: ${c} frames at ${fps} fps = ${(Number(c) / fps).toFixed(3)} s`);
