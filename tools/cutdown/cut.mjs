#!/usr/bin/env node
// cut.mjs — the picture and sound of a vertical cut-down (Reel / Short) made from a FINISHED 16:9 video.
//
//   node tools/cutdown/cut.mjs projects/<name>
//   in:  projects/<name>/cutdown.json
//          master    the finished 16:9 video (its mix already holds voice, music and its own sound effects)
//          bed       the master's music bed on the same timeline (music only), for pieces played without speech
//          faces     [{ file, at, band?, fullBand? }] the raw vertical camera clips, the master second where each
//                    starts, and its camera rows eyebrows→chin (band: window mode; fullBand: full mode)
//          faceMode  "full" (default since 2026-10-30, his rule: he records vertically, so a face piece fills the
//                    whole 9:16 frame and only the screen sits in the 16:9 window) or "window" (claude-reel-1..4)
//          faceSpot  [Y0, Y1] full mode: the page rows the fullBand lands on (default [585, 1110]: hook over the
//                    hair, chips over the forehead, the window rows = eyebrows→chin, the caption under the chin)
//          bedUnderVoiceDb  optional: the bed added under the SPOKEN pieces too at this gain (it is already in the
//                    master ducked ~19 dB under the voice; 0 → about 15 dB under, "halka kintu shona jay")
//          segments  [{ from, to, speed=1, mute=false, face=false }] in MASTER seconds, played back to back
//          tail      seconds held after the last piece (cliff freeze + end card); the picture holds its last frame
//          bedDb     gain on the bed where it plays alone (it sits ducked under the voice in the master)
//          window    { w, h } the picture window of the vertical page; faceBand [y0, y1] the camera rows (eyebrows
//                    to chin) that fill the window's height, the sides filled by a blurred, darkened copy
//   out: <work>/media/screen.mp4  the master pieces, 1920×1080 at fps, no sound
//        <work>/media/face.mp4    the camera pieces, 1080×1920 (full) or window size (window), black elsewhere, no sound
//        <work>/media/voice.wav   48 kHz stereo: master sound, or the bed for mute pieces and the tail (2.5 s fade out)
//        <work>/map.json          { segments: [{...piece, out0, out1}], tail: {out0, out1}, total }
// Verified on claude-reel-1..4 (window mode) and claude-ig-1..2 (full mode), cut from claude-video-tutorial, 2026-10-30.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { duration, fail, ffmpeg, readJSON, run, writeJSON } from "../episode/lib.mjs";

const dir = path.resolve(process.argv[2] ?? ".");
const cfgFile = path.join(dir, "cutdown.json");
if (!existsSync(cfgFile)) fail(`No cutdown.json in ${dir}`);
const cfg = readJSON(cfgFile);
const fps = cfg.fps ?? 30, tail = cfg.tail ?? 3, bedDb = cfg.bedDb ?? 12;
const W = cfg.work, M = path.join(W, "media"), P = path.join(W, "pieces");
mkdirSync(M, { recursive: true });
mkdirSync(P, { recursive: true });
const f3 = (x) => Number(x).toFixed(3);
const X264 = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", "-r", String(fps)];

// the camera is composed straight to the page's window: its face band fills the height, a blurred copy the sides
const win = cfg.window ?? { w: 1000, h: 548 };
const camW = cfg.faces?.[0] ? Number(run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width", "-of", "csv=p=0", cfg.faces[0].file]).stdout.trim()) : 608;
const faceVf = ([y0, y1]) => {
  const bgS = win.w / camW, bgY = Math.max(0, Math.round(((y0 + y1) / 2) * bgS - win.h / 2));
  return `split[a][b];[a]scale=${win.w}:-2,crop=${win.w}:${win.h}:0:${bgY},boxblur=24:2,eq=brightness=-0.12:saturation=0.8[bg];` +
  `[b]crop=${camW}:${y1 - y0}:0:${y0},scale=-2:${win.h}[fg];[bg][fg]overlay=(W-w)/2:0,setsar=1`;
};
// full mode: the face band is scaled onto faceSpot of a 1080×1920 frame, a blurred copy behind it fills the rest
const faceMode = cfg.faceMode ?? "full", [Y0, Y1] = cfg.faceSpot ?? [585, 1110];
const camH = cfg.faces?.[0] ? Number(run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=height", "-of", "csv=p=0", cfg.faces[0].file]).stdout.trim()) : 1080;
// The sharp face's edges are feathered (a soft alpha mask made once per size), so no hard rectangle shows where
// it meets the blurred copy: a closer-framed clip (outro, 826 px wide) showed one on claude-ig-2.
const FEATHER = 70;
const fullGeom = ([b0, b1]) => {
  const k = (Y1 - Y0) / (b1 - b0), w = 2 * Math.round((camW * k) / 2), h = 2 * Math.round((camH * k) / 2);
  return { k, w, h, x: Math.round((1080 - w) / 2), y: Math.round(Y0 - b0 * k) };
};
const maskFor = (g) => {
  const file = path.join(P, `mask_${g.w}x${g.h}_${g.y}.png`);
  if (existsSync(file)) return file;
  const fx = g.x > 0 ? `min(1,min(X,W-1-X)/${FEATHER})` : "1";       // sides only where the blurred copy shows
  const fb = g.y + g.h < 1920 ? `min(1,(H-1-Y)/${FEATHER * 2})` : "1"; // bottom
  const ft = g.y > 0 ? `min(1,Y/${FEATHER})` : "1";                   // top
  ffmpeg(["-f", "lavfi", "-i", `color=white:s=${g.w}x${g.h}`, "-vf", `format=gray,geq=lum='255*${fx}*${fb}*${ft}'`, "-frames:v", "1", file]);
  return file;
};
const fullFc = (g, pre) => `[0:v]${pre},split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2,eq=brightness=-0.16:saturation=0.75[bg];` +
  `[b]scale=${g.w}:${g.h},format=yuva420p[fc];[1:v]format=gray[m];[fc][m]alphamerge[fg];[bg][fg]overlay=x=${g.x}:y=${g.y}:shortest=1,setsar=1[v]`;
const faceSize = faceMode === "full" ? { w: 1080, h: 1920 } : { w: win.w, h: win.h };
const camVf = (cam) => faceVf(cam.band ?? cfg.faceBand ?? [380, 880]);

let t = 0;
const segs = [], vList = [], fList = [], aList = [];
cfg.segments.forEach((s, i) => {
  const speed = s.speed ?? 1, len = (s.to - s.from) / speed;
  // frame-exact length: every piece is a whole number of frames, so the three streams never drift apart
  const frames = Math.round(len * fps), d = frames / fps;
  const seg = { ...s, speed, out0: Number(f3(t)), out1: Number(f3(t + d)) };
  segs.push(seg);
  const v = path.join(P, `v${i}.mp4`), f = path.join(P, `f${i}.mp4`), a = path.join(P, `a${i}.wav`);
  ffmpeg(["-ss", f3(s.from), "-t", f3(s.to - s.from + 0.5), "-i", cfg.master, "-an",
    "-vf", `setpts=(PTS-STARTPTS)/${speed},fps=${fps},trim=end_frame=${frames},setpts=PTS-STARTPTS`, ...X264, v]);
  const cam = s.face ? cfg.faces.find((c) => s.from >= c.at - 0.01 && s.to <= c.at + duration(c.file) + 0.01) : null;
  if (s.face && !cam) fail(`segment ${i} (${s.from}–${s.to}) is a face piece but no camera clip covers it`);
  const pre = `setpts=(PTS-STARTPTS)/${speed},fps=${fps},trim=end_frame=${frames},setpts=PTS-STARTPTS`;
  if (cam && faceMode === "full") {
    const g = fullGeom(cam.fullBand ?? [495, 832]);
    ffmpeg(["-ss", f3(s.from - cam.at), "-t", f3(s.to - s.from + 0.5), "-i", cam.file, "-loop", "1", "-i", maskFor(g), "-an",
      "-filter_complex", fullFc(g, pre), "-map", "[v]", "-frames:v", String(frames), ...X264, f]);
  } else if (cam) ffmpeg(["-ss", f3(s.from - cam.at), "-t", f3(s.to - s.from + 0.5), "-i", cam.file, "-an",
    "-vf", `${pre},${camVf(cam)}`, ...X264, f]);
  else ffmpeg(["-f", "lavfi", "-i", `color=c=black:s=${faceSize.w}x${faceSize.h}:r=${fps}`, "-frames:v", String(frames), ...X264, f]);
  const src = s.mute ? cfg.bed : cfg.master;
  const gain = s.mute ? `,volume=${bedDb}dB` : "";
  const tempo = speed !== 1 && s.mute ? `,atempo=${speed}` : "";
  if (speed !== 1 && !s.mute) fail(`segment ${i}: a sped-up piece must be mute (speech is never sped up)`);
  const shape = `atrim=0:${f3(d)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${f3(d - 0.012)}:d=0.012,apad=whole_dur=${f3(d)}`;
  if (!s.mute && cfg.bedUnderVoiceDb != null)
    // the same bed, sample-aligned with the master: adding it raises the music under the voice
    ffmpeg(["-ss", f3(s.from), "-t", f3(s.to - s.from + 0.3), "-i", cfg.master, "-ss", f3(s.from), "-t", f3(s.to - s.from + 0.3), "-i", cfg.bed, "-vn",
      "-filter_complex", `[0:a]aresample=48000,aformat=channel_layouts=stereo[m];[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${cfg.bedUnderVoiceDb}dB[b];[m][b]amix=inputs=2:normalize=0:duration=first,${shape}[o]`,
      "-map", "[o]", "-c:a", "pcm_s16le", a]);
  else ffmpeg(["-ss", f3(s.from), "-t", f3(s.to - s.from + 0.3), "-i", src, "-vn",
    "-af", `aresample=48000,aformat=channel_layouts=stereo${tempo}${gain},${shape}`,
    "-c:a", "pcm_s16le", a]);
  vList.push(v); fList.push(f); aList.push(a);
  t += d;
});

// the tail: the last frame held, the music bed going on from where the last piece ended and fading out
const tailFrames = Math.round(tail * fps), td = tailFrames / fps;
const last = segs.at(-1);
const ta = path.join(P, "tail.wav");
ffmpeg(["-ss", f3(last.to), "-t", f3(td + 0.3), "-i", cfg.bed, "-vn",
  "-af", `aresample=48000,aformat=channel_layouts=stereo,volume=${bedDb}dB,atrim=0:${f3(td)},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=${f3(Math.max(0, td - Math.min(2.5, td / 2)))}:d=${f3(Math.min(2.5, td / 2))},apad=whole_dur=${f3(td)}`,
  "-c:a", "pcm_s16le", ta]);
aList.push(ta);

const concat = (list, name, extra) => {
  const lf = path.join(P, `${name}.txt`);
  writeFileSync(lf, list.map((x) => `file '${x.replace(/\\/g, "/")}'`).join("\n") + "\n");
  ffmpeg(["-f", "concat", "-safe", "0", "-i", lf, ...extra, path.join(M, name)]);
};
const hold = ["-vf", `tpad=stop_mode=clone:stop=${tailFrames}`, ...X264];
concat(vList, "screen.mp4", hold);
concat(fList, "face.mp4", hold);
concat(aList, "voice.wav", ["-c:a", "pcm_s16le"]);

const total = Number(f3(t + td));
writeJSON(path.join(W, "map.json"), { fps, segments: segs, tail: { out0: Number(f3(t)), out1: total }, total, face: faceSize, faceMode });
for (const n of ["screen.mp4", "face.mp4", "voice.wav"]) console.log(`${n}: ${duration(path.join(M, n)).toFixed(3)} s`);
console.log(`map.json: ${segs.length} pieces, total ${total} s`);
