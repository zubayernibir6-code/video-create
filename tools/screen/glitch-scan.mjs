// glitch-scan.mjs — look at a screen recording's window changes ONCE, before building anything: Windows drawing
// glitches (a black terminal flashing over the page, half-drawn dialogs, a maximise animation's double window,
// a skeleton loading screen) and private things that appear only for a few frames during a switch (the Aero Peek
// desktop, a "Move to <folder>" tooltip). On claude-video-tutorial (2026-10-29) these were found one render at a
// time, after 2-hour renders; this finds them in a few minutes.
//
//   node tools/screen/glitch-scan.mjs <video> [--from=<s>] [--to=<s>] [--out=<folder>] [--change=6] [--no-strips]
//
// 1. FLASHES (printed): the picture changes, then within 3 s comes back to what it was (A → B → A). That is almost
//    always a glitch or a passing popup: freeze it (screen.mjs freezes / FFmpeg freezeframes) or blur it.
// 2. STRIPS (sheets in --out, default <video>-glitch/): every big change gets one row of 9 frames, at
//    −1, 0, +1, +2, +4, +8, +16, +32 and +64 frames from the change, labelled with the source time. Read every row:
//    a glitch shows as a half-drawn or doubled frame between two clean ones; a privacy leak as a name on 1–4 frames.
// Analysis: streamed 160×90 grey at the video's own frame rate; a change = mean abs difference ≥ --change (6 caught a
// window switch, not a caret or a hover). Times are the video's own seconds.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: node tools/screen/glitch-scan.mjs <video> [--from=s] [--to=s] [--out=folder] [--change=6] [--no-strips]"); process.exit(1); }
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const FROM = Number(opt("from", 0)), CH = Number(opt("change", 6));
const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate:format=duration", "-of", "json", file], { encoding: "utf8" });
const pj = JSON.parse(probe.stdout);
const [fn, fd] = pj.streams[0].r_frame_rate.split("/").map(Number), FPS = fn / fd;
const TO = Number(opt("to", pj.format.duration));
const OUT = path.resolve(opt("out", file.replace(/\.[^.]+$/, "") + "-glitch"));
const W = 160, H = 90, N = W * H;

// streamed: a 10-minute 60 fps recording is ~37 000 frames, too many to hold even at 160×90
const changes = [], flashes = [], open = []; // open: changes still watching for a return to their base picture
let prev = null, k = 0, carry = Buffer.alloc(0);
const madB = (x, y) => { let s = 0; for (let i = 0; i < N; i++) s += Math.abs(x[i] - y[i]); return s / N; };
const T = (k) => FROM + k / FPS;
await new Promise((done, fail) => {
  const p = spawn("ffmpeg", ["-v", "error", "-ss", String(FROM), "-t", String(TO - FROM), "-i", file, "-vf", `scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"]);
  p.stdout.on("data", (chunk) => {
    carry = Buffer.concat([carry, chunk]);
    while (carry.length >= N) {
      const fr = Buffer.from(carry.subarray(0, N)); carry = carry.subarray(N);
      if (prev) {
        const d = madB(fr, prev), last = changes.at(-1);
        if (d >= CH) {
          if (last && k - last.end <= FPS / 4) { last.end = k; last.peak = Math.max(last.peak, d); }
          else { const c = { k, end: k, peak: d }; changes.push(c); open.push({ c, base: prev, top: 0 }); }
        }
        for (let i = open.length - 1; i >= 0; i--) { // flashes: back to (nearly) the picture before the change within 3 s
          const o = open[i], dd = madB(fr, o.base); o.top = Math.max(o.top, dd);
          if (k > o.c.end && dd < 2.5 && o.top >= 8) { flashes.push({ a: T(o.c.k), b: T(k), top: o.top }); open.splice(i, 1); }
          else if (k - o.c.k > 3 * FPS) open.splice(i, 1);
        }
      }
      prev = fr; k++;
    }
  });
  p.on("close", (code) => (code === 0 ? done() : fail(new Error("ffmpeg failed"))));
});
const n = k;
const f3 = (x) => x.toFixed(3);
console.log(`glitch-scan: ${path.basename(file)} ${f3(FROM)}–${f3(TO)} s at ${FPS.toFixed(2)} fps — ${changes.length} changes, ${flashes.length} flash(es)`);
for (const f of flashes) console.log(`  FLASH ${f3(f.a)} → back at ${f3(f.b)} (${f3(f.b - f.a)} s, peak difference ${f.top.toFixed(0)}): look at it; freeze or blur`);

if (!args.includes("--no-strips") && changes.length) {
  // one FFmpeg call per row (a single select over every frame ran out of memory at ~1000 terms): seek to the row's
  // first frame, pick the 9 offsets, label each with its source time, tile them side by side; 6 rows per sheet
  const OFF = [-1, 0, 1, 2, 4, 8, 16, 32, 64];
  const rows = changes.map((c) => Math.max(0, c.k - 1));
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(path.join(OUT, "rows"), { recursive: true });
  const sel = OFF.map((o) => `eq(n\\,${o + 1})`).join("+");
  rows.forEach((k0, i) => {
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", (T(k0) - 1 / FPS / 2).toFixed(4), "-copyts", "-t", (70 / FPS).toFixed(4), "-i", file, "-vf",
      `select='${sel}',scale=320:180,drawtext=text='%{pts\\:flt}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=${OFF.length}x1:padding=4:color=black`,
      "-frames:v", "1", path.join(OUT, "rows", `r${String(i).padStart(4, "0")}.png`)], { encoding: "utf8" });
    if (r.status !== 0) console.error(`  ! row at ${T(k0).toFixed(3)}: ${r.stderr.split(String.fromCharCode(10)).filter((l) => !l.includes("Fontconfig")).join(" ").slice(0, 200)}`);
  });
  const files = readdirSync(path.join(OUT, "rows")).sort();
  const sheets = Math.ceil(files.length / 6);
  for (let s = 0; s < sheets; s++) {
    const part = files.slice(s * 6, s * 6 + 6).map((f) => path.join(OUT, "rows", f));
    const inputs = part.flatMap((f) => ["-i", f]);
    const vf = part.length > 1 ? `${part.map((_, j) => `[${j}:v]`).join("")}vstack=inputs=${part.length}` : "null";
    spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", vf, "-frames:v", "1", path.join(OUT, `strips-${String(s + 1).padStart(2, "0")}.png`)]);
  }
  rmSync(path.join(OUT, "rows"), { recursive: true, force: true });
  console.log(`  ${files.length} change rows → ${sheets} strip sheet(s) in ${OUT} (columns: −1, 0, +1, +2, +4, +8, +16, +32, +64 frames from each change). Read every row.`);
}
