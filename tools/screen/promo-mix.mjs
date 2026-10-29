// promo-mix.mjs — the whole soundtrack of a voiced promo as ONE WAV: the voice (crisp EQ), music beds with
// gain envelopes (fades, crossfades, a swell on the drop), and every sound effect at its visual moment minus the
// file's silent lead-in (assets/sfx/manifest.json lead_s). The page then plays only this file.
//   import { buildMix } from "../../../tools/screen/promo-mix.mjs";
//   buildMix({ total: 90, out: "assets/media/mix.wav",
//     voice: { file: "vo.wav", eq: true },                    // 0 dB, mono → both channels
//     music: [{ file: "bgm1.mp3", at: 0, from: 0, env: [[0, -19], [66.5, -19], [67.5, null]] }, …],
//     cues: [{ t: 79.53, file: "boom", vol: 0.95 }, { t: 75.4, file: "riser", vol: 0.42, dur: 4.12 }, …] });
// env: [timeline s, dB] points, linear in gain between them; null = silence. The bed starts at `at`,
// read from `from` s into its file. Put a drop on a moment: from = drop_in_file − (moment − at)
// (tools/music-drops.mjs finds drops). Mono voice doubled to stereo reads +3 LU: −14.1 LUFS file → −11.1.
// FFmpeg 9 note: the graph goes in a file via `-/filter_complex <file>` (-filter_complex_script is gone).
// SFX facts measured 2026-10-25: riser.mp3 builds 0–4.12 s and stops dead (use dur 4.12, its stop on the hit);
// boom.mp3 hits at once and rings ~1.2 s; impact-bass-1 is a 2.1 s tone (trim with dur 0.6 under each word).
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SFX = path.resolve(import.meta.dirname, "..", "..", "assets", "sfx");
const f3 = (x) => Number(x).toFixed(3);
const lin = (db) => (db === null ? 0 : Math.pow(10, db / 20));

// piecewise-linear gain over the bed's own time (0 = when it starts)
function envelope(points, at) {
  const p = points.map(([t, db]) => [t - at, lin(db)]);
  let e = f3(p.at(-1)[1]);
  for (let i = p.length - 2; i >= 0; i--) {
    const [t0, g0] = p[i], [t1, g1] = p[i + 1];
    const seg = t1 > t0 ? `${g0.toFixed(5)}+(${(g1 - g0).toFixed(5)})*(t-${f3(t0)})/${f3(t1 - t0)}` : g1.toFixed(5);
    e = `if(lt(t,${f3(t1)}),${seg},${e})`;
  }
  return `if(lt(t,${f3(p[0][0])}),${p[0][1].toFixed(5)},${e})`;
}

export function buildMix({ total, out, voice, music = [], cues = [], graphFile }) {
  const lead = Object.fromEntries(Object.entries(JSON.parse(readFileSync(path.join(SFX, "manifest.json"), "utf8"))).map(([k, e]) => [k, e.lead_s ?? 0]));
  const inputs = [], parts = [], labels = [];
  if (voice) {
    inputs.push(voice.file);
    const eq = voice.eq === false ? "" : "highpass=f=80,equalizer=f=250:t=q:w=1.1:g=-2.5,equalizer=f=3500:t=q:w=1.0:g=3,highshelf=f=9000:g=2,deesser=i=0.35,";
    parts.push(`[0:a]aresample=48000,${eq}${voice.gainDb ? `volume=${voice.gainDb}dB,` : ""}pan=stereo|c0=c0|c1=c0,apad,atrim=0:${f3(total)}[vo]`);
    labels.push("[vo]");
  }
  music.forEach((m, k) => {
    inputs.push(m.file);
    const len = total - m.at;
    parts.push(`[${inputs.length - 1}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=${f3(m.from)}:${f3(m.from + len)},asetpts=PTS-STARTPTS,volume=eval=frame:volume='${envelope(m.env, m.at)}'${m.at > 0 ? `,adelay=${Math.round(m.at * 1000)}:all=1` : ""},apad,atrim=0:${f3(total)}[m${k}]`);
    labels.push(`[m${k}]`);
  });
  // one input per sound file, split for every use (a 9-minute video has ~300 cues; one input each is too many)
  const byFile = new Map();
  cues.forEach((c, i) => byFile.set(c.file, [...(byFile.get(c.file) ?? []), i]));
  for (const [file, idx] of byFile) {
    inputs.push(path.join(SFX, `${file}.mp3`).replace(/\\/g, "/"));
    const n = inputs.length - 1;
    parts.push(`[${n}:a]aresample=48000,aformat=channel_layouts=stereo,asplit=${idx.length}${idx.map((i) => `[u${i}]`).join("")}`);
  }
  cues.forEach((c, i) => {
    const ld = lead[c.file] ?? 0;
    const at = Math.max(0, c.t - ld);
    const trim = c.dur ? `,atrim=0:${f3(c.dur + ld)},afade=t=out:st=${f3(Math.max(0, c.dur + ld - 0.08))}:d=0.08` : "";
    parts.push(`[u${i}]anull${trim},volume=${c.vol.toFixed(3)},adelay=${Math.round(at * 1000)}:all=1[s${i}]`);
    labels.push(`[s${i}]`);
  });
  parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,alimiter=limit=0.94:attack=2:release=60:level=false,atrim=0:${f3(total)}[out]`);
  const graph = graphFile ?? `${out}.graph.txt`;
  writeFileSync(graph, parts.join(";\n"));
  const args = ["-hide_banner", "-v", "error", "-y"];
  for (const i of inputs) args.push("-i", i);
  args.push("-/filter_complex", graph, "-map", "[out]", "-c:a", "pcm_s16le", "-ar", "48000", out);
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${r.status})`);
  return { out, cues: cues.length };
}
