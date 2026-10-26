#!/usr/bin/env node
// camcut.mjs — the graded camera video cut to the episode timeline: one file the page plays from 0 to the end.
//
//   node tools/episode/camcut.mjs <episode.json>
//   in:  <work>/media/cam.mp4 (grade.mjs, uncut, CFR) + <work>/cuts_map.json
//   out: <work>/media/cam_cut.mp4 — exactly map.total long; black under the title and end cards
//
// Why: the page used one <video data-media-start> per kept piece (59 on zubayer-ep01). HyperFrames extracts
// frames per clip, and 30 of the 59 extractions from the same 1.2 GB file failed in the full render
// (ffmpeg_failed / internal / media_start_out_of_range), although an 80 s test with 5 pieces passed. Cutting
// once here, frame-exact by frame number (the graded file is constant 30 fps), leaves the page a single clip.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { duration, ffmpeg, loadEpisode, readJSON } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const map = readJSON(path.join(ep.work, "cuts_map.json"));
const M = path.join(ep.work, "media"), src = path.join(M, "cam.mp4"), FPS = ep.fps;
const X264 = ["-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-g", String(FPS), "-an"];
const fr = (t) => Math.round(t * FPS);

const parts = [];
let cursor = 0, k = 0;
const black = (len) => {
  const f = path.join(M, `camcut_black${k++}.mp4`);
  ffmpeg(["-f", "lavfi", "-i", `color=c=black:s=1920x1080:r=${FPS}`, "-frames:v", String(fr(len)), ...X264, f]);
  parts.push(f);
};
for (const part of ["cold", "main"]) {
  const segs = map.segments.filter((s) => s.part === part);
  if (!segs.length) continue;
  if (fr(segs[0].out0) > fr(cursor)) black(segs[0].out0 - cursor);
  // seek to just before the first piece (a whole-second, frame-exact input seek on the CFR file), so a short clip
  // does not decode the recording from its start; frame numbers are counted from the seek point
  const ss = Math.max(0, Math.floor(segs[0].src0) - 2), off = fr(ss);
  const expr = segs.map((s) => `between(n\\,${fr(s.src0) - off}\\,${fr(s.src1) - 1 - off})`).join("+");
  // a cliffhanger Reel holds the last frame for map.cliff (tpad clones it)
  const hold = part === "main" && map.cliff ? map.cliff.out1 - map.cliff.out0 : 0;
  const want = segs.reduce((a, s) => a + fr(s.src1) - fr(s.src0), 0) + fr(hold);
  const f = path.join(M, `camcut_${part}.mp4`);
  ffmpeg(["-ss", String(ss), "-i", src, "-t", String(Math.ceil(segs.at(-1).src1 - ss + 1)), "-vf", `select='${expr}',setpts=N/(${FPS}*TB)${hold ? `,tpad=stop_mode=clone:stop_duration=${hold + 1}` : ""}`,
    "-fps_mode", "passthrough", "-frames:v", String(want), ...X264, f]);
  console.log(`${part}: ${segs.length} pieces, ${want} frames → ${duration(f).toFixed(3)} s`);
  parts.push(f);
  cursor = hold ? map.cliff.out1 : segs.at(-1).out1;
}
if (fr(map.total) > fr(cursor)) black(map.total - cursor);
// every part has the same encoder settings, so the concat demuxer joins them without re-encoding
const list = path.join(M, "camcut_list.txt");
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n") + "\n");
const out = path.join(M, "cam_cut.mp4");
ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]);
console.log(`cam_cut.mp4: ${duration(out).toFixed(3)} s (episode ${map.total} s)`);
