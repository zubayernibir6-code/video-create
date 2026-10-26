// Times every keystroke typed into a text box on a screen recording, spaces included, by following the
// caret: the rightmost bright column in the box only ever moves right while someone types.
//   node tools/screen/keystrokes.mjs <video> --box=x,y,w,h [--from=<s>] [--to=<s>] [--ink=200] [--json=<out.json>]
// --box: the typed line only (e.g. 330×40 starting at the text's left edge). --ink: brightness of typed text and
// caret; the grey placeholder ("How can I help you today?", ~140) stays below it. Prints one line per keystroke
// with the caret's jump in pixels (a space ≈ 5–8 px, a letter 6–16 px; a jump of ~2 letters = two keys in one frame).
// Use the times for key-press sounds: cue at t (minus the sound's lead_s).
// Verified 2026-10-25: "So what's your Decision?" = 24 keys found; "So" arrived in one frame (69.2).
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const video = args.find((a) => !a.startsWith("--"));
const box = flag("box");
if (!video || !box) { console.log("Usage: node tools/screen/keystrokes.mjs <video> --box=x,y,w,h [--from=s] [--to=s] [--ink=200] [--json=out.json]"); process.exit(1); }
const [bx, by, W, H] = box.split(",").map(Number);
const from = Number(flag("from", 0)), to = flag("to"), ink = Number(flag("ink", 200));

// the video's frame rate decides the time of each frame
const probe = await new Promise((res) => { let o = ""; const p = spawn("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video]); p.stdout.on("data", (d) => (o += d)); p.on("close", () => res(o.trim())); });
const [n, d] = probe.split("/").map(Number); const fps = n / (d || 1);

const ff = spawn("ffmpeg", ["-v", "error", "-ss", String(from), ...(to ? ["-to", String(to)] : []), "-i", video, "-vf", `crop=${W}:${H}:${bx}:${by},format=gray`, "-f", "rawvideo", "-"]);
const chunks = []; ff.stdout.on("data", (c) => chunks.push(c));
await new Promise((r) => ff.on("close", r));
const buf = Buffer.concat(chunks), frames = Math.floor(buf.length / (W * H));
const keys = [];
let best = -1;
for (let f = 0; f < frames; f++) {
  let right = -1;
  for (let x = W - 1; x >= 0 && right < 0; x--) for (let y = 0; y < H; y++) if (buf[f * W * H + y * W + x] > ink) { right = x; break; }
  if (right > best + 1) {
    const t = from + f / fps;
    if (best >= 0 || f > 0) keys.push({ t: +t.toFixed(3), x: right, jump: right - best });
    best = right;
  }
}
for (const k of keys) console.log(`${k.t.toFixed(3).padStart(9)}  caret x=${String(k.x).padStart(4)}  +${k.jump}`);
console.log(`${keys.length} keystroke(s) between ${from} and ${to ?? "the end"} s (${fps.toFixed(2)} fps)`);
if (flag("json")) writeFileSync(flag("json"), JSON.stringify(keys.map((k) => k.t)));
