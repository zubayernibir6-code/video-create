// One-command render for this machine.
//
// Remotion's own bundled ffmpeg/ffprobe binaries fail to start here
// (Windows error 0xC0000142, DLL init failed), so we skip its stitching step:
// Remotion writes a PNG sequence, then the system FFmpeg 8.1.1 encodes it.
//
//   npm run render                      -> out/video.mp4, 1080p H.264
//   npm run render -- MyComp out/x.mp4  -> pick composition + output

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const comp = process.argv[2] ?? "MyComp";
const output = process.argv[3] ?? "out/video.mp4";
const fps = process.argv[4] ?? "30";

const frameDir = "out/frames";

const run = (cmd, args, label) => {
  console.log(`\n[${label}] ${cmd} ${args.join(" ")}\n`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`\n[${label}] FAILED with exit code ${r.status}`);
    process.exit(r.status ?? 1);
  }
};

// 1. Clean the frame folder so an old, longer render can't leak extra frames.
if (existsSync(frameDir)) rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });
mkdirSync(dirname(output), { recursive: true });

// 2. Frames via Remotion. concurrency=2 keeps 8 threads / 16GB RAM from thrashing.
run(
  "npx",
  [
    "remotion",
    "render",
    comp,
    frameDir,
    "--sequence",
    "--image-format=png",
    "--concurrency=2",
  ],
  "1/2 frames",
);

// 3. Detect the frame filename pattern Remotion produced.
const first = readdirSync(frameDir).filter((f) => f.endsWith(".png")).sort()[0];
if (!first) {
  console.error("No PNG frames were produced.");
  process.exit(1);
}
const digits = first.match(/(\d+)\.png$/)?.[1].length ?? 3;
const pattern = join(frameDir, first.replace(/\d+\.png$/, `%0${digits}d.png`));

// 4. Encode with the system FFmpeg. CRF 17 = visually lossless master.
run(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-stats",
    "-framerate", fps,
    "-i", `"${pattern}"`,
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "17",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    `"${output}"`,
  ],
  "2/2 encode",
);

console.log(`\nDone -> ${output}`);
