#!/usr/bin/env node
// showreel.mjs — builds the studio showreel (a ~55 s 16:9 HyperFrames page) from the rendered portfolio pieces,
// cut on the strong beats of the showreel music, every clip labelled with its catalog CODE so a client can say
// "I want PL1" (Motion Studio kit v1, 2026-11-07).
//
//   node tools/studio/showreel.mjs [--project=pf-showreel] [--order=GH1,PL1,…] [--avg=2.3] [--outro=4.5] [--name="Talha Zubayer"]
//        [--tagline="Motion design for SaaS, AI & data"] [--contact="Pick a code. Get the video."]
//   then: node tools/studio/render-queue.mjs pf-showreel
//
// Reads: tools/studio/catalog.json (codes, names, sample brands), renders/portfolio/<CODE>_<Brand>.mp4 (missing ones
// are skipped and listed), each projects/<sample>/piece.json "reel" {from, to} (the best seconds of the piece),
// and the music's .beats.json (strong beats + drops). Writes projects/<project>/index.html + piece.json + PLAN.md.
// Layout: 16:9 clips full frame; 9:16 and 1:1 clips centred on a blurred, darkened copy of themselves.
// Clips are muted (the reel's sound is the music); the first big drop lands on the cut from the title to clip 1.

import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const project = opt("project", "pf-showreel");
const dir = path.join(WS, "projects", project);
const MUSIC = "C:/Users/Zubayer Nibir/VideoWork/studio-music/showreel-drive";
const catalog = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
const order = opt("order", "GH1,PL1,AI1,UT1,DS1,LG1,SA1,FD1,IA1,MP1,KT1,HX1,CL1,KP1,AP1,WF1,BS1,IH1,NW1,EV1").split(",");
const NAME = opt("name", "Talha Zubayer");
const TAG = opt("tagline", "Motion design for SaaS, AI & data");
const CONTACT = opt("contact", "Pick a code. Get the video.");
const probe = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration", "-of", "json", f], { encoding: "utf8" });
  const j = JSON.parse(r.stdout || "{}");
  return { w: j.streams?.[0]?.width, h: j.streams?.[0]?.height, d: +j.format?.duration };
};

// ---- clips
const clips = [], missing = [];
for (const code of order) {
  const s = catalog.services.find((x) => x.code === code);
  if (!s || !s.sample?.brand) { missing.push(code + " (not in catalog)"); continue; }
  const nice = `${code}_${s.sample.brand.replace(/[^A-Za-z0-9]+/g, "")}`;
  const file = path.join(WS, "renders", "portfolio", `${nice}.mp4`);
  if (!existsSync(file)) { missing.push(code); continue; }
  let reel = { from: 0, to: 4 };
  const pj = path.join(WS, "projects", s.sample.project, "piece.json");
  if (existsSync(pj)) { const p = JSON.parse(readFileSync(pj, "utf8")); if (p.reel) reel = p.reel; }
  clips.push({ code, name: s.name, file, nice, reel, ...probe(file) });
}
if (clips.length < 3) { console.error(`✗ only ${clips.length} rendered pieces — render the portfolio first (missing: ${missing.join(", ")})`); process.exit(1); }

// ---- timing on the music: title, then clips cut on strong beats, then the outro
const beats = JSON.parse(readFileSync(MUSIC + ".beats.json", "utf8"));
const bigDrop = (beats.drops.find((d) => d.t > 5 && d.jump >= 10) || beats.drops[0] || { t: 9.4 }).t;
const TITLE = 3.0;
const from = Math.max(0, bigDrop - TITLE); // the drop lands on the first cut
// cut on the real kick drum when beats.mjs found it (the detector's "strong" beats can sit off the downbeat)
const strong = (beats.kicks && beats.kicks.length ? beats.kicks : beats.strong).map((t) => +(t - from).toFixed(3)).filter((t) => t > TITLE + 1);
const all = beats.beats.map((t) => +(t - from).toFixed(3)).filter((t) => t > TITLE + 1);
// --avg: seconds per clip (cuts snap to the nearest kick); --outro: the end card. Keep the reel ≤ 60 s: finish.mjs
// asks for a preflight above that (23 clips × 2.2 + 3 + 4.2 ≈ 57.8 s).
const AVG = +opt("avg", 2.3), OUTRO = +opt("outro", 4.5);
const cuts = [TITLE];
for (let i = 1; i <= clips.length; i++) {
  const target = TITLE + i * AVG;
  const pool = strong.length ? strong : all;
  let best = target, bd = 1e9;
  for (const t of pool) { const d = Math.abs(t - target); if (d < bd && t > cuts[cuts.length - 1] + 1.4) { bd = d; best = t; } }
  if (bd > 0.45) { for (const t of all) { const d = Math.abs(t - target); if (d < bd && t > cuts[cuts.length - 1] + 1.4) { bd = d; best = t; } } }
  cuts.push(+best.toFixed(3));
}
const reelEnd = cuts[cuts.length - 1];
const DUR = +(reelEnd + OUTRO).toFixed(2);
const musicLen = probe(MUSIC + ".mp3").d || 67;
if (from + DUR > musicLen) console.warn(`⚠ the music ends at ${(musicLen - from).toFixed(1)} s, the reel is ${DUR} s`);

// ---- project folder
mkdirSync(path.join(dir, "assets", "clips"), { recursive: true });
if (!existsSync(path.join(dir, "assets", "js", "gsap"))) cpSync(path.join(WS, "assets", "js", "gsap"), path.join(dir, "assets", "js", "gsap"), { recursive: true });
mkdirSync(path.join(dir, "assets", "css"), { recursive: true });
mkdirSync(path.join(dir, "assets", "fonts"), { recursive: true });
copyFileSync(path.join(import.meta.dirname, "runtime", "studio.js"), path.join(dir, "assets", "js", "studio.js"));
copyFileSync(path.join(import.meta.dirname, "runtime", "studio.css"), path.join(dir, "assets", "css", "studio.css"));
for (const f of ["latin/Geist-Variable.ttf", "latin/GeistMono-Variable.ttf", "bengali/HindSiliguri-Regular.ttf"]) copyFileSync(path.join(WS, "assets", "fonts", f), path.join(dir, "assets", "fonts", path.basename(f)));
writeFileSync(path.join(dir, "assets", "fonts", "fonts.css"), `@font-face { font-family: "Geist"; font-weight: 100 900; src: url("Geist-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Geist Mono"; font-weight: 100 900; src: url("GeistMono-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 400; src: url("HindSiliguri-Regular.ttf") format("truetype"); font-display: block; }
`);
writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 1) + "\n");
for (const c of clips) copyFileSync(c.file, path.join(dir, "assets", "clips", `${c.nice}.mp4`));

const r3 = (v) => Math.round(v * 1000) / 1000;
let scenes = "", js = "";
clips.forEach((c, i) => {
  const t0 = cuts[i], t1 = cuts[i + 1], d = r3(t1 - t0);
  const mediaStart = r3(Math.max(0, Math.min(c.reel.from, (c.d || 10) - d - 0.05)));
  const wide = c.w / c.h > 1.5;
  const src = `assets/clips/${c.nice}.mp4`;
  if (wide) {
    scenes += `    <video id="v${i}" class="full" src="${src}" data-start="${r3(t0)}" data-duration="${d}" data-media-start="${mediaStart}" data-track-index="${2 + (i % 2)}" muted playsinline></video>\n`;
  } else {
    const hh = 1000, ww = Math.round(hh * c.w / c.h);
    scenes += `    <video id="b${i}" class="blur" src="${src}" data-start="${r3(t0)}" data-duration="${d}" data-media-start="${mediaStart}" data-track-index="${4 + (i % 2)}" muted playsinline data-design-ignore data-layout-ignore></video>\n`;
    scenes += `    <video id="v${i}" class="framed" style="width: ${ww}px; height: ${hh}px; left: ${960 - ww / 2}px; top: 40px" src="${src}" data-start="${r3(t0)}" data-duration="${d}" data-media-start="${mediaStart}" data-track-index="${2 + (i % 2)}" muted playsinline></video>\n`;
  }
  scenes += `    <div id="lb${i}" class="label clip" data-start="${r3(t0)}" data-duration="${d}" data-track-index="8"><span class="code">${c.code}</span><span class="nm">${c.name}</span></div>\n`;
  js += `      tl.fromTo("#lb${i} .code, #lb${i} .nm", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.32, ease: "enter", stagger: S.f(2) }, ${r3(t0 + 0.08)});\n`;
});
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <title>Showreel — ${NAME} · Motion Design</title>
  <link rel="stylesheet" href="assets/fonts/fonts.css" />
  <link rel="stylesheet" href="assets/css/studio.css" />
  <style>
    :root { --bg: #050507; --accent: #ffb547; --font-display: "Geist", "Hind Siliguri", sans-serif; --font-body: "Geist", "Hind Siliguri", sans-serif; --font-mono: "Geist Mono", "Hind Siliguri", monospace; }
    video { position: absolute; display: block; object-fit: cover; }
    video.full { left: 0; top: 0; width: 1920px; height: 1080px; }
    video.blur { left: -60px; top: -60px; width: 2040px; height: 1200px; filter: blur(40px) brightness(0.45) saturate(1.2); }
    video.framed { border-radius: 28px; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12); }
    .label { position: absolute; left: 56px; bottom: 48px; display: flex; align-items: baseline; gap: 18px; padding: 14px 22px; border-radius: 16px; background: rgba(5, 5, 7, 0.62); border: 1px solid rgba(255, 255, 255, 0.12); }
    .label .code { font-family: var(--font-mono); font-size: 30px; font-weight: 600; color: var(--accent); }
    .label .nm { font-family: var(--font-display); font-size: 30px; font-weight: 560; color: #f5f7fb; letter-spacing: -0.01em; }
    .title { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; background: radial-gradient(70% 70% at 50% 45%, #15161d 0%, #050507 70%); }
    .title h1 { font-family: var(--font-display); font-size: 150px; font-weight: 680; letter-spacing: -0.05em; margin: 0; color: #f5f7fb; }
    .title .kicker { font-size: 30px; color: rgba(245, 247, 251, 0.75); }
    .outro { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; background: radial-gradient(70% 70% at 50% 45%, #16171f 0%, #050507 70%); }
    .outro h2 { font-family: var(--font-display); font-size: 110px; font-weight: 660; letter-spacing: -0.045em; margin: 0; color: #f5f7fb; text-wrap: balance; text-align: center; }
    .outro .codes { font-family: var(--font-mono); font-size: 28px; color: var(--accent); max-width: 1500px; text-align: center; line-height: 1.6; }
    .outro .who { font-size: 34px; color: rgba(245, 247, 251, 0.78); }
    /* furniture, the whole reel (CLAUDE.md §0h): every brand in the clips is fictional — portfolio honesty (QUALITY.md B) */
    .concept { position: absolute; right: 56px; bottom: 58px; z-index: 50; font-family: var(--font-mono); font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(245, 247, 251, 0.62); padding: 6px 10px; border-radius: 8px; background: rgba(5, 5, 7, 0.45); }
  </style>
  <script src="assets/js/gsap/gsap.min.js"></script>
  <script src="assets/js/gsap/CustomEase.min.js"></script>
  <script src="assets/js/gsap/SplitText.min.js"></script>
  <script src="assets/js/gsap/DrawSVGPlugin.min.js"></script>
  <script src="assets/js/gsap/MorphSVGPlugin.min.js"></script>
  <script src="assets/js/gsap/MotionPathPlugin.min.js"></script>
  <script src="assets/js/studio.js"></script>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${DUR}" data-fps="30">
    <section id="title" class="title clip" data-start="0" data-duration="${TITLE}" data-track-index="1">
      <h1 id="t-name">${NAME}</h1>
      <div id="t-tag" class="kicker">${TAG}</div>
    </section>
${scenes}    <section id="outro" class="outro clip" data-start="${r3(reelEnd)}" data-duration="${r3(OUTRO)}" data-track-index="1">
      <h2 id="o-head">${CONTACT}</h2>
      <div id="o-codes" class="codes">${clips.map((c) => c.code).join(" · ")}</div>
      <div id="o-who" class="who">${NAME} · Motion Design</div>
    </section>
    <div id="concept" class="concept" data-design-ignore data-layout-ignore>Concept work · all brands fictional</div>
    <!-- studio:audio:start -->
    <!-- studio:audio:end -->
  </div>
  <script>
    document.fonts.ready.then(() => {
      const S = Studio.init({ id: "main" });
      const tl = S.tl;
      S.lines("#t-name", 0.2, { dur: 0.9 });
      S.words("#t-tag", 0.75, { stagger: S.f(2) });
${js}      S.lines("#o-head", ${r3(reelEnd + 0.15)}, { dur: 0.8 });
      tl.fromTo("#o-codes", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "enter" }, ${r3(reelEnd + 0.7)});
      tl.fromTo("#o-who", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "enter" }, ${r3(reelEnd + 1.0)});
      S.grain({ opacity: 0.04 });
      window.__timelines["main"] = S.done().tl;
    });
  </script>
</body>
</html>
`;
writeFileSync(path.join(dir, "index.html"), html);
const piece = {
  code: "SR1", name: "Studio Showreel", brand: NAME, project, aspect: "16x9", width: 1920, height: 1080, duration: DUR, fps: 30,
  sound: { music: { track: "showreel-drive", from: r3(from), gain: 0.8, fadeIn: 0.1, fadeOut: 2.0 }, cues: [{ t: TITLE, sfx: "whoosh", gain: 0.3 }, { t: r3(reelEnd), sfx: "impact-bass-2", gain: 0.35, len: 2.2 }] },
  clips: clips.map((c, i) => ({ code: c.code, start: cuts[i], end: cuts[i + 1], mediaStart: c.reel.from })),
  missing, made: new Date().toISOString().slice(0, 10),
};
writeFileSync(path.join(dir, "piece.json"), JSON.stringify(piece, null, 2) + "\n");
console.log(`✓ projects/${project}: ${clips.length} clips, ${DUR} s, music from ${from.toFixed(2)} s (drop on the first cut)${missing.length ? `\n⚠ not rendered yet / skipped: ${missing.join(", ")}` : ""}\nNext: node tools/studio/sound.mjs projects/${project} && node tools/studio/check.mjs projects/${project} && node tools/studio/render-queue.mjs ${project}`);
