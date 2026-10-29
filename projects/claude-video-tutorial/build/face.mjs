// The facecam clips for the glass portrait frame: Video.mp4's centre column (608×1080 at x 656, measured
// 2026-10-28), 60 fps, no audio (speech.mjs carries his voice). intro = 0–45.167; outro = 566.183–end with the
// cut from timeline.mjs (601.25–610.217) joined frame-exact.
//   node build/face.mjs   → assets/media/intro.mp4, outro.mp4
import { spawnSync } from "node:child_process";
import path from "node:path";
import { TL } from "./timeline.mjs";

const MEDIA = path.resolve(import.meta.dirname, "..", "assets", "media");
const CROP = "crop=608:1080:656:0";
const enc = ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-g", "60", "-pix_fmt", "yuv420p",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"];
const F = (s) => Math.round(s * TL.FPS);
const run = (graph, out) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", TL.SRC.video, "-filter_complex", graph, "-map", "[v]", ...enc, out], { stdio: "inherit" });
  if (r.status !== 0) process.exit(1);
  const n = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
  console.log(`✓ ${out}: ${n} frames = ${(n / TL.FPS).toFixed(3)} s`);
};
run(`[0:v]trim=start_frame=${F(TL.intro.a)}:end_frame=${F(TL.intro.b)},setpts=PTS-STARTPTS,${CROP}[v]`, path.join(MEDIA, "intro.mp4"));
const [o1, o2] = TL.outro;
// the recording switches to his camera at 566.333: frames 566.183–566.317 are black, then the screen recording's
// player and taskbar (unblurred, inside the portrait frame at render 472.90–473.03); they show the first face frame
const LEAD = F(566.3333) - F(o1.a);
run(`[0:v]split=2[x][y];[x]trim=start_frame=${F(o1.a)}:end_frame=${F(o1.b)},setpts=PTS-STARTPTS,${CROP},split[a0][a1];[a0][a1]freezeframes=first=0:last=${LEAD - 1}:replace=${LEAD}[a];` +
  `[y]trim=start_frame=${F(o2.a)}:end_frame=${F(o2.b)},setpts=PTS-STARTPTS,${CROP}[b];[a][b]concat=n=2:v=1:a=0,setpts=N/${TL.FPS}/TB[v]`, path.join(MEDIA, "outro.mp4"));
