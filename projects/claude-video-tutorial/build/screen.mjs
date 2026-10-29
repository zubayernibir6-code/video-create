// The screen part as ONE clip on the final timeline (60 fps, 1920×1080): every piece of timeline.mjs (played at its
// speed, or a held frame), with the privacy blurs of build/specs.json burnt in BEFORE the re-timing (boxes and
// windows are in source time and pixels). Pieces are encoded one by one (3 at a time) and joined with the concat
// demuxer; the frame count must equal the timeline's or the build stops.
//   node build/screen.mjs [--only=<i,j>]   → assets/media/screen.mp4 + assets/media/screen_poster.jpg
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TL } from "./timeline.mjs";

const PROJECT = path.resolve(import.meta.dirname, "..");
const MEDIA = path.join(PROJECT, "assets", "media");
const PARTS = path.join(MEDIA, "screen_parts");
mkdirSync(PARTS, { recursive: true });
const specs = JSON.parse(readFileSync(path.join(import.meta.dirname, "specs.json"), "utf8"));
const BLURS = specs.blurs; // [{x,y,w,h,from,to,what}] source px / s
const FREEZES = specs.freezes ?? []; // [{from,to,use,what}] source s: Windows draw glitches in the recording (a black
// terminal flash, a half-drawn dialog) show the clean frame at `use` instead; applied after the blurs, timing unchanged
const SIGMA = 22; // sigma 14 still showed a name's outline (screen-promo §4b)
const FPS = TL.FPS, f4 = (x) => Number(x).toFixed(4);
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").map(Number);

// even-sized, in-frame boxes (4:2:0)
const box = (b) => {
  let x = Math.max(0, Math.floor(b.x)), y = Math.max(0, Math.floor(b.y));
  let w = Math.min(1920 - x, Math.ceil(b.w)), h = Math.min(1080 - y, Math.ceil(b.h));
  x -= x % 2; y -= y % 2; w += w % 2; h += h % 2;
  return { x, y, w: Math.min(w, 1920 - x), h: Math.min(h, 1080 - y) };
};
// blur chain for a source window [a, b]; t inside the chain = source − a. ONE split feeds every box (each crops the
// unblurred frame) and the blurred patches are overlaid in turn. A split→overlay→split… chain grew super-linearly:
// piece 103 (25 boxes) wrote no frame in 20 min, while 12 boxes took 4 s (2026-10-29).
// t is counted from the input seek, which lands on a source frame (round(a × FPS)), not from a itself: with a off the
// frame grid a box started up to half a frame early (the in-ad taskbar blur showed on the last flat frame, 2026-10-29).
function blurChain(a, b, label) {
  const hits = BLURS.filter((z) => z.to > a - 0.02 && z.from < b + 0.02);
  if (!hits.length) return { g: "", out: label };
  a = Math.round(a * FPS) / FPS;
  let g = `;[${label}]split=${hits.length + 1}[m]${hits.map((_, i) => `[c${i}]`).join("")}`, cur = "m";
  hits.forEach((z, i) => {
    const { x, y, w, h } = box(z);
    const en = `between(t,${f4(z.from - a - 0.0001)},${f4(z.to - a + 0.0001)})`;
    g += `;[c${i}]crop=${w}:${h}:${x}:${y},gblur=sigma=${z.sigma ?? SIGMA}[g${i}];[${cur}][g${i}]overlay=${x}:${y}:enable='${en}'[o${i}]`;
    cur = `o${i}`;
  });
  return { g, out: cur };
}
// freezes inside a play piece: freezeframes takes the replacement from a second copy of the stream; frame k of the
// piece's input is source frame f0 + k (the input seek lands on a source frame)
function freezeChain(a, b, f0, label) {
  const hits = FREEZES.filter((z) => z.to > a && z.from < b);
  let g = "", cur = label;
  hits.forEach((z, i) => {
    const first = Math.max(0, Math.ceil(z.from * FPS) - f0), last = Math.floor(z.to * FPS) - f0, use = Math.round(z.use * FPS) - f0;
    if (use < 0 || use > Math.round((b - a) * FPS)) throw new Error(`freeze '${z.what}': its frame ${z.use} is outside the piece ${a}–${b}`);
    g += `;[${cur}]split[fa${i}][fb${i}];[fa${i}][fb${i}]freezeframes=first=${first}:last=${last}:replace=${use}[fz${i}]`;
    cur = `fz${i}`;
  });
  return { g, out: cur };
}

const enc = ["-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-g", String(FPS), "-pix_fmt", "yuv420p", "-r", String(FPS),
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"];
function job(p, i) {
  const out = path.join(PARTS, `p${String(i).padStart(3, "0")}.mp4`);
  let graph, ss, dur;
  if (p.kind === "play") {
    ss = p.a; dur = p.b - p.a;
    const { g, out: o } = blurChain(p.a, p.b, "s");
    const { g: fg, out: fo } = freezeChain(p.a, p.b, Math.round(p.a * FPS), o);
    graph = `[0:v]setpts=PTS-STARTPTS,format=yuv420p[s]${g}${fg};[${fo}]setpts=PTS/${f4(p.speed)},fps=${FPS},trim=end_frame=${p.frames},tpad=stop_mode=clone:stop=${p.frames},trim=end_frame=${p.frames}[v]`;
  } else {
    const fz = FREEZES.find((z) => p.src >= z.from && p.src <= z.to);
    ss = fz ? fz.use : p.src; dur = 1 / FPS;
    const { g, out: o } = blurChain(ss, ss + 1 / FPS, "s");
    graph = `[0:v]setpts=PTS-STARTPTS,format=yuv420p,trim=end_frame=1[s]${g};[${o}]loop=loop=${p.frames - 1}:size=1:start=0,setpts=N/${FPS}/TB,trim=end_frame=${p.frames}[v]`;
  }
  // accurate input seek to the piece's first source frame (60 fps source: frame = round(s × 60))
  const args = ["-hide_banner", "-v", "error", "-y", "-ss", f4(Math.round(ss * FPS) / FPS), "-t", f4(dur + 2 / FPS), "-i", TL.SRC.video,
    "-filter_complex", graph, "-map", "[v]", ...enc, out];
  return { out, args, frames: p.frames, i };
}

const jobs = TL.screen.pieces.map(job);
const todo = only ? jobs.filter((j) => only.includes(j.i)) : jobs;
let next = 0, running = 0, failed = 0;
await new Promise((done) => {
  const pump = () => {
    while (running < 3 && next < todo.length) {
      const j = todo[next++]; running++;
      const c = spawn("ffmpeg", j.args, { stdio: ["ignore", "ignore", "pipe"] });
      let err = ""; c.stderr.on("data", (d) => (err += d));
      c.on("close", (code) => {
        running--;
        if (code !== 0) { failed++; console.error(`✗ piece ${j.i}: ${err.slice(0, 400)}`); }
        if (next >= todo.length && running === 0) done(); else pump();
      });
    }
  };
  pump();
});
if (failed) process.exit(1);
// every piece must have exactly its frames
const count = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim());
const bad = todo.filter((j) => count(j.out) !== j.frames);
if (bad.length) { console.error(`✗ frame counts wrong in pieces ${bad.map((j) => `${j.i} (${count(j.out)}≠${j.frames})`).join(", ")}`); process.exit(1); }
if (only) console.log(`✓ re-encoded pieces ${only.join(", ")}`);
if (only && jobs.some((j) => !existsSync(j.out))) process.exit(0); // the other pieces are not encoded yet
const list = path.join(PARTS, "list.txt");
writeFileSync(list, jobs.map((j) => `file '${j.out.replace(/\\/g, "/")}'`).join("\n"));
const out = path.join(MEDIA, "screen.mp4");
const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out], { stdio: "inherit" });
if (r.status !== 0) process.exit(1);
const total = count(out), want = TL.screen.pieces.reduce((s, p) => s + p.frames, 0);
if (total !== want) { console.error(`✗ screen.mp4 has ${total} frames, the timeline needs ${want}`); process.exit(1); }
spawnSync("ffmpeg", ["-v", "error", "-y", "-i", out, "-frames:v", "1", "-q:v", "2", path.join(MEDIA, "screen_poster.jpg")]);
// the last frame too: the monitor flies off after the clip has ended, and without it the first-frame poster showed
spawnSync("ffmpeg", ["-v", "error", "-y", "-sseof", "-0.5", "-i", out, "-update", "1", "-q:v", "2", path.join(MEDIA, "screen_last.jpg")]);
console.log(`✓ ${out}: ${total} frames = ${(total / FPS).toFixed(3)} s (${jobs.length} pieces, ${BLURS.length} blur boxes)`);
for (const f of ["screen_poster.jpg", "screen_last.jpg"]) if (!existsSync(path.join(MEDIA, f))) console.error(`✗ ${f} missing`);
