// speech.mjs — the whole speech track of a tutorial on the final timeline, one mono WAV (48 kHz): his facecam audio
// for the intro and outro (the recording, one mic: tutorial.json face.audio), the voice-over's kept pieces for the
// screen part (the timeline: pauses shrunk, voice cuts removed). Each piece gets 12 ms fades so the joins never
// click. tutorial.json speech.gain_db levels the three sources before the mix (it prints each part's LUFS: they
// should read alike); mix.mjs adds the crisp EQ and the music.
//   node tools/tutorial/speech.mjs projects/<name> [--media=<dir>]   → <media>/speech.wav (exactly TOTAL s)
// Verified 2026-10-29 on projects/claude-video-tutorial: speech.wav is byte-identical to its hand-written
// build/speech.mjs's output (52 pieces; LUFS intro −19.3 · screen −19.3 · outro −19.3).
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { cli } from "./timeline.mjs";

const f3 = (x) => Number(x).toFixed(3);

export function buildSpeech(P) {
  const { TL, cfg, media, build } = P;
  const out = path.join(media, "speech.wav");
  const GAIN = { voice: 0, intro: 0, outro: 0, ...cfg.speech?.gain_db }; // dB
  const FACE_MIC = cfg.face.audio ?? "pan=mono|c0=c0";
  const parts = [], labels = [];
  const piece = (input, a, b, at, gain, mono) => {
    const i = labels.length, d = b - a;
    parts.push(`[${input}:a]atrim=${f3(a)}:${f3(b)},asetpts=PTS-STARTPTS,${mono},aresample=48000,volume=${gain}dB,` +
      `afade=t=in:d=0.012,afade=t=out:st=${f3(Math.max(0, d - 0.012))}:d=0.012,adelay=${Math.round(at * 1000)}:all=1[p${i}]`);
    labels.push(`[p${i}]`);
  };
  piece(1, TL.intro.a, TL.intro.b, 0, GAIN.intro, FACE_MIC);
  for (const v of TL.voice) piece(0, v.from, v.to, v.at, GAIN.voice, "anull");
  for (const o of TL.outro) piece(1, o.a, o.b, o.at, GAIN.outro, FACE_MIC);
  parts.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${f3(TL.TOTAL)}[out]`);
  const graph = path.join(build, "speech.graph.txt");
  writeFileSync(graph, parts.join(";\n"));
  const r = spawnSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", TL.SRC.voice, "-i", TL.SRC.video, "-/filter_complex", graph,
    "-map", "[out]", "-ac", "1", "-c:a", "pcm_s16le", "-ar", "48000", out], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("speech.wav failed");
  // loudness of each part, so a mismatch shows at once
  const lufs = (a, b) => {
    const e = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-ss", f3(a), "-to", f3(b), "-i", out, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
    return e.match(/I:\s+(-?[\d.]+) LUFS/g)?.at(-1)?.match(/-?[\d.]+/)[0];
  };
  console.log(`✓ ${out} (${labels.length} pieces, ${f3(TL.TOTAL)} s) · LUFS intro ${lufs(0, TL.intro.b)} · screen ${lufs(TL.screen.at, TL.screen.end)} · outro ${lufs(TL.screen.end, TL.TOTAL)}`);
}

await cli(import.meta, ({ P }) => buildSpeech(P));
