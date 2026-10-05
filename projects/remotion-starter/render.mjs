// One-command render for this machine.
//
//   npm run render                      -> out/video.mp4, 1080p H.264, BT.709
//   npm run render -- MyComp out/x.mp4  -> pick composition + output (fps comes from the composition)
//
// History (CLAUDE.md §3 / §0b): until 2026-10-04 Windows Smart App Control stopped Remotion's bundled
// ffmpeg/ffprobe from starting (0xC0000142), so this script rendered a PNG sequence and encoded it with the
// system FFmpeg. That path flattened RGBA frames to yuv420p and silently LOST every root-level opacity
// fade (out/video.mp4 at 4.9 s stayed RGB 25,31,56 instead of fading to 3,5,9). With SAC off the bundled
// binaries run, so this is now the plain `remotion render`: it keeps fades and writes audio when the
// composition has any. `--color-space=bt709` only sets the matrix, so the system FFmpeg then writes the full
// BT.709 colour description (primaries/transfer/matrix, limited range) into the H.264 stream with the
// lossless h264_metadata bitstream filter, and moves the index to the front (faststart).

import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname } from "node:path";

const comp = process.argv[2] ?? "MyComp";
const output = process.argv[3] ?? "out/video.mp4";
mkdirSync(dirname(output), { recursive: true });

const run = (label, cmd, args) => {
  console.log(`\n[${label}] ${cmd} ${args.join(" ")}\n`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\n[${label}] FAILED with exit code ${r.status}`);
    process.exit(r.status ?? 1);
  }
};

// The CLI is run through node directly: spawning npx.cmd would need shell:true, which Node warns about (DEP0190).
const tmp = output.replace(/\.mp4$/i, "") + ".tmp.mp4";
run("1/2 render", process.execPath, ["node_modules/@remotion/cli/remotion-cli.js", "render", comp, tmp, "--color-space=bt709", "--concurrency=1"]);
run("2/2 tag", "ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", tmp, "-map", "0", "-c", "copy",
  "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0",
  "-movflags", "+faststart", output]);
rmSync(tmp, { force: true });
console.log(`\nDone: ${output}`);
