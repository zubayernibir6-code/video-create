// face.mjs — the facecam clips for the glass portrait frame (540×960 on the page): the recording's face column
// (tutorial.json face.crop), fps of the timeline, no audio (speech.mjs carries his voice). intro = source 0 → the
// screen start; outro = the screen end → the end, with the outro cut (if any) joined frame-exact. When the recording
// switches to the camera late (face.outro_clean_from), the outro's first frames show the first clean face frame.
//   node tools/tutorial/face.mjs projects/<name> [--media=<dir>]   → <media>/intro.mp4, outro.mp4
// Verified 2026-10-29 on projects/claude-video-tutorial: the same filter graphs as its hand-written build/face.mjs;
// intro.mp4 and outro.mp4 decode to identical frames.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { cli } from "./timeline.mjs";

const enc = ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-g", "60", "-pix_fmt", "yuv420p",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"];

// { intro, outro } FFmpeg filter graphs ([v] out)
export function faceGraphs(P) {
  const { TL, cfg } = P;
  const CROP = cfg.face.crop;
  const F = (s) => Math.round(s * TL.FPS);
  const intro = `[0:v]trim=start_frame=${F(TL.intro.a)}:end_frame=${F(TL.intro.b)},setpts=PTS-STARTPTS,${CROP}[v]`;
  const n = TL.outro.length; // 1, or 2 with an outro cut
  const lead = cfg.face.outro_clean_from != null ? F(cfg.face.outro_clean_from) - F(TL.outro[0].a) : 0;
  let outro = n > 1 ? `[0:v]split=${n}${TL.outro.map((_, i) => `[${"xy"[i]}]`).join("")};` : "";
  TL.outro.forEach((o, i) => {
    outro += `${n > 1 ? `[${"xy"[i]}]` : "[0:v]"}trim=start_frame=${F(o.a)}:end_frame=${F(o.b)},setpts=PTS-STARTPTS,${CROP}`;
    outro += i === 0 && lead > 0 ? `,split[a0][a1];[a0][a1]freezeframes=first=0:last=${lead - 1}:replace=${lead}[a];` : `[${"ab"[i]}];`;
  });
  outro += n > 1 ? `[a][b]concat=n=2:v=1:a=0,setpts=N/${TL.FPS}/TB[v]` : `[a]setpts=N/${TL.FPS}/TB[v]`;
  return { intro, outro };
}

export function buildFace(P) {
  const { TL, media } = P;
  const run = (graph, out) => {
    const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", TL.SRC.video, "-filter_complex", graph, "-map", "[v]", ...enc, out], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`${path.basename(out)} failed`);
    const n = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
    console.log(`✓ ${out}: ${n} frames = ${(n / TL.FPS).toFixed(3)} s`);
  };
  const g = faceGraphs(P);
  run(g.intro, path.join(media, "intro.mp4"));
  run(g.outro, path.join(media, "outro.mp4"));
}

await cli(import.meta, ({ P }) => buildFace(P));
