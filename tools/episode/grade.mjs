#!/usr/bin/env node
// grade.mjs — the camera video graded, at 1920×1080 / constant 30 fps, UNCUT (the page cuts it per piece).
//
//   node tools/episode/grade.mjs <episode.json> [--test=<seconds from>]   (--test grades 20 s only, for a look)
//   out: <work>/media/cam.mp4 (or <work>/grade/test.mp4)
//
// Made for a dark room lit by one lamp at the right edge (zubayer-ep01): full-range webcam video to TV range,
// light 3-D denoise, a soft dark gradient that pulls the lamp's flare down on the right (ep.grade.glare), gentle
// highlight roll-off with a small mid lift, a touch of warmth and contrast, Lanczos upscale + light sharpening.
// A variable-frame-rate phone/webcam file becomes constant 30 fps here.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { ffmpeg, loadEpisode } from "./lib.mjs";

const ep = loadEpisode(process.argv[2] ?? ".");
const test = process.argv.find((a) => a.startsWith("--test="))?.split("=")[1];
const g = { glare: { x: 1250, y: 330, r: 170, edge: 0.6, strength: 0.58, spot: 0.3 }, denoise: "2:1.5:3:3",
  curves: "0/0 0.25/0.27 0.6/0.62 0.85/0.80 1/0.90", balance: "rm=0.02:bm=-0.025:rh=0.01:bh=-0.01", eq: "contrast=1.04:saturation=1.05", ...ep.grade };
const G = path.join(ep.work, "grade");
mkdirSync(G, { recursive: true });
mkdirSync(path.join(ep.work, "media"), { recursive: true });
const gl = g.glare;
// the mask is drawn at the SOURCE size (1280×720 for zubayer-ep01); ep.grade.size overrides
const [sw, sh] = (g.size ?? "1280x720").split("x").map(Number);
ffmpeg(["-f", "lavfi", "-i", `color=black:s=${sw}x${sh},format=rgba`, "-vf",
  `geq=r=0:g=0:b=0:a='255*min(1,${gl.strength}*pow(max(0,(X/W-${gl.edge})/${(1 - gl.edge).toFixed(3)}),1.4)+${gl.spot}*exp(-(pow(X-${gl.x},2)+pow(Y-${gl.y},2))/(2*${gl.r}*${gl.r})))'`,
  "-frames:v", "1", path.join(G, "glare-mask.png")]);
const fc = `[0:v]scale=in_range=pc:out_range=tv,format=yuv420p,hqdn3d=${g.denoise},format=gbrp[v];[v][1:v]overlay=format=gbrp[o];` +
  `[o]curves=all='${g.curves}',colorbalance=${g.balance},eq=${g.eq},fps=${ep.fps},scale=1920:1080:flags=lanczos,unsharp=5:5:0.5:5:5:0,format=yuv420p`;
const out = test ? path.join(G, "test.mp4") : path.join(ep.work, "media", "cam.mp4");
ffmpeg([...(test ? ["-ss", test, "-t", "20"] : []), "-i", ep.source.video, "-i", path.join(G, "glare-mask.png"), "-filter_complex", fc, "-an",
  "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-g", String(ep.fps),
  "-movflags", "+faststart", out]);
console.log(`graded → ${out}`);
