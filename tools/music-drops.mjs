// Finds the bass drops / big hits in a music track, so the drop can be placed on a visual moment
// (start the track at drop − (moment − track start)).
//   node tools/music-drops.mjs <track> [--min-jump=9] [--map]
// A drop = the bass band (< 150 Hz, 50 ms RMS) jumps by ≥ min-jump dB after at least 0.3 s of quieter bass.
// "after a dip" = a filtered build-down then the beat; "after silence" = a stop-time break then a slam.
// --map also prints the whole track's loudness every 0.5 s (intro / build / drop / outro at a glance).
// Verified 2026-10-25 on BGM2.mp3: 15.05 s (build-down then beat, +11 dB) and 37.50 s (0.85 s of silence then a
// slam, +40 dB) — the two drops found by hand (±50 ms) — plus two smaller ones at 30.05 and 56.35 s.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}`)); return a ? (a.includes("=") ? a.split("=")[1] : true) : d; };
const track = args.find((a) => !a.startsWith("--"));
if (!track) { console.log("Usage: node tools/music-drops.mjs <track> [--min-jump=9] [--map]"); process.exit(1); }
const rms = (filter, step) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", track, "-af", `aresample=48000,${filter}asetnsamples=${Math.round(48000 * step)},astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level`, "-f", "null", "-"], { encoding: "utf8", maxBuffer: 1 << 28 });
  return [...r.stderr.matchAll(/pts_time:([\d.]+)[\s\S]*?RMS_level=(-?[\d.]+|-inf)/g)].map((m) => ({ t: Number(m[1]), db: m[2] === "-inf" ? -120 : Math.max(-120, Number(m[2])) }));
};
const bass = rms("lowpass=f=150,", 0.05);
const minJump = Number(flag("min-jump", 9));
const drops = [];
for (let i = 6; i < bass.length; i++) {
  const before = bass.slice(i - 6, i).map((b) => b.db); // the 0.3 s before
  const floor = Math.max(...before), now = Math.max(bass[i].db, bass[i + 1]?.db ?? -120);
  if (now - floor >= minJump && now > -30 && (!drops.length || bass[i].t - drops.at(-1).t > 1.0)) {
    const hit = bass[i].db - floor >= minJump ? i : i + 1; // the 50 ms bin where the bass actually arrives
    let j = i - 1; while (j > 0 && bass[j].db < now - minJump) j--; // how long the quiet lasted
    drops.push({ t: bass[hit].t, jump: now - floor, quiet: bass[hit].t - bass[j + 1].t, floor });
  }
}
console.log(`${track}: ${drops.length} drop(s)`);
for (const d of drops) console.log(`  ${d.t.toFixed(2).padStart(7)} s  +${d.jump.toFixed(1)} dB bass after ${d.quiet.toFixed(2)} s ${d.floor < -40 ? "of silence (stop-time slam)" : "of quieter bass (build-down)"}`);
if (flag("map")) {
  const full = rms("", 0.5);
  console.log("loudness every 0.5 s (dB RMS):");
  for (let i = 0; i < full.length; i += 8) console.log("  " + full.slice(i, i + 8).map((b) => `${b.t.toFixed(1).padStart(5)}:${b.db.toFixed(0).padStart(4)}`).join("  "));
}
