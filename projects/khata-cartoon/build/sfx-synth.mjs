#!/usr/bin/env node
// sfx-synth.mjs — cartoon sounds the library lacks, made from formulas with FFmpeg (no samples, no licence):
// tick, tock, beep2 (calculator), boing, slide-up / slide-down (slide whistle), doink (jaw drop), snore, rub (eraser).
//   node build/sfx-synth.mjs     → assets/sfx/<name>.wav (48 kHz mono), then copies the workspace SFX pack beside
//                                  them and writes assets/sfx/manifest.json with each file's lead_s.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const WS = path.resolve(ROOT, "..", "..");
const out = path.join(ROOT, "assets", "sfx");
mkdirSync(out, { recursive: true });

const SYN = {
  tick: { d: 0.07, e: "0.7*sin(2*PI*2600*t)*exp(-t*95)+0.25*sin(2*PI*5200*t)*exp(-t*140)", desc: "Clock tick." },
  tock: { d: 0.08, e: "0.7*sin(2*PI*1700*t)*exp(-t*80)+0.2*sin(2*PI*3400*t)*exp(-t*120)", desc: "Clock tock (lower)." },
  beep2: { d: 0.24, e: "0.45*sin(2*PI*1850*t)*(lt(t,0.075)+between(t,0.13,0.205))", desc: "Calculator double beep." },
  boing: { d: 0.85, e: "0.6*sin(2*PI*t*(260+110*sin(2*PI*11*t)))*exp(-3.4*t)*min(1,t*200)", desc: "Cartoon boing (jump, bounce)." },
  "slide-up": { d: 0.6, e: "0.38*sin(2*PI*(520*t+840*t*t))*min(1,t*30)*min(1,(0.6-t)*30)", desc: "Slide whistle up (rise, pop-out)." },
  "slide-down": { d: 0.6, e: "0.38*sin(2*PI*(1530*t-840*t*t))*min(1,t*30)*min(1,(0.6-t)*30)", desc: "Slide whistle down (fall, droop)." },
  doink: { d: 0.9, e: "0.6*sin(2*PI*(320*t-120*t*t))*exp(-2.6*t)*min(1,t*150)", desc: "Low falling doink (jaw drop)." },
  snore: { d: 1.6, e: "(0.55*(random(0)*2-1)+0.4*sin(2*PI*82*t)*(0.55+0.45*sin(2*PI*26*t)))*pow(sin(PI*t/1.6),2)", af: "lowpass=f=520,lowpass=f=520", desc: "One snore (rattly in-breath)." },
  rub: { d: 1.2, e: "0.6*(random(0)*2-1)*(0.25+0.75*pow(sin(2*PI*3.4*t),2))", af: "highpass=f=1800,lowpass=f=6500", desc: "Eraser rubbing, three strokes." },
};
for (const [name, s] of Object.entries(SYN)) {
  const f = path.join(out, `${name}.wav`);
  const af = [s.af, "alimiter=limit=0.7:level=false", "aformat=sample_fmts=s16"].filter(Boolean).join(",");
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc='${s.e}':s=48000:d=${s.d}`, "-af", af, "-ac", "1", f], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${name}: ${r.stderr}`);
  console.log(`  made ${name}.wav`);
}
// the workspace pack (Pixabay licence + CC0, see its CREDITS.md)
const src = path.join(WS, "assets", "sfx");
const wsManifest = JSON.parse(readFileSync(path.join(src, "manifest.json"), "utf8"));
for (const f of readdirSync(src)) if (/\.(mp3|md)$/i.test(f) && !existsSync(path.join(out, f))) copyFileSync(path.join(src, f), path.join(out, f));
const manifest = { ...wsManifest };
for (const [name, s] of Object.entries(SYN)) manifest[name] = { file: `${name}.wav`, duration: s.d, description: s.desc + " Synthesised with FFmpeg for this project (no licence).", licence: "none (synthesised)" };
writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const lead = spawnSync(process.execPath, [path.join(WS, "tools", "sfx-leads.mjs"), out], { encoding: "utf8" });
console.log(lead.stdout.split("\n").slice(-2).join("\n"));
