#!/usr/bin/env node
// new-piece.mjs — starts one Motion Studio piece (a portfolio sample or a client job) with everything the kit needs.
//
//   node tools/studio/new-piece.mjs <project-name> --code=PL1 [--brand="Lumen"] [--title="AI analytics launch"]
//        [--aspect=16x9|9x16|1x1|4x5] [--dur=20] [--fps=30] [--fonts=Geist,GeistMono] [--music=studio-pulse] [--three]
//
// Makes projects/<name>/ with:
//   index.html   the studio template (fonts.ready → Studio.init → S.done; audio markers for sound.mjs)
//   piece.json   the brief + meta + sound (music, voice, cues) — the ONE file the sound tool reads
//   PLAN.md      the plan gate (CLAUDE.md §0e), header pre-filled from the catalog
//   assets/      fonts (only the chosen families + Hind Siliguri, the Bengali fallback §0d.6) + fonts.css,
//                GSAP + plugins, studio.js, studio.css, three.js (with --three, local ES modules + import map)
//   hyperframes.json
// The catalog (tools/studio/catalog.json) gives the defaults for the code: aspect, duration, music mood, fonts.
// Refuses an existing name. Next steps are printed.

import { cpSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const flag = (k) => args.includes(`--${k}`);
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.log('Usage: node tools/studio/new-piece.mjs <name> --code=PL1 [--brand=…] [--aspect=16x9] [--dur=20] [--fonts=Inter,JetBrainsMono] [--music=studio-pulse] [--three]');
  process.exit(1);
}
const dir = path.join(WS, "projects", name);
if (existsSync(dir)) { console.error(`✗ projects/${name} already exists`); process.exit(1); }

const catalog = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
const code = opt("code", "");
const entry = catalog.services.find((s) => s.code === code) || {};
if (code && !entry.code) console.warn(`⚠ code ${code} is not in tools/studio/catalog.json — using generic defaults`);

const SIZES = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080], "4x5": [1080, 1350] };
const aspect = opt("aspect", (entry.aspects || ["16x9"])[0]);
if (!SIZES[aspect]) { console.error(`✗ aspect ${aspect}: use ${Object.keys(SIZES).join(", ")}`); process.exit(1); }
const [W, H] = SIZES[aspect];
const DUR = +opt("dur", entry.defaultDuration || 20);
const FPS = +opt("fps", 30);
const brand = opt("brand", "Brand");
const title = opt("title", entry.name || "Untitled piece");
const music = opt("music", entry.music || "studio-pulse");
const three = flag("three") || !!entry.three;

// font families → files (all SIL OFL, assets/fonts/LICENSES)
const FONTS = {
  Inter: { family: "Inter", files: [["latin/Inter-Variable.ttf", "100 900", "normal"]] },
  Geist: { family: "Geist", files: [["latin/Geist-Variable.ttf", "100 900", "normal"]] },
  GeistMono: { family: "Geist Mono", files: [["latin/GeistMono-Variable.ttf", "100 900", "normal"]] },
  JetBrainsMono: { family: "JetBrains Mono", files: [["latin/JetBrainsMono-Variable.ttf", "100 800", "normal"]] },
  Manrope: { family: "Manrope", files: [["latin/Manrope-Variable.ttf", "200 800", "normal"]] },
  SpaceGrotesk: { family: "Space Grotesk", files: [["latin/SpaceGrotesk-Variable.ttf", "300 700", "normal"]] },
  InstrumentSerif: { family: "Instrument Serif", files: [["latin/InstrumentSerif-Regular.ttf", "400", "normal"], ["latin/InstrumentSerif-Italic.ttf", "400", "italic"]] },
  Playfair: { family: "Playfair Display", files: [["latin/PlayfairDisplay-Variable.ttf", "400 900", "normal"]] },
  Anton: { family: "Anton", files: [["latin/Anton-Regular.ttf", "400", "normal"]] },
  BebasNeue: { family: "Bebas Neue", files: [["latin/BebasNeue-Regular.ttf", "400", "normal"]] },
  HindSiliguri: { family: "Hind Siliguri", files: [["bengali/HindSiliguri-Regular.ttf", "400", "normal"], ["bengali/HindSiliguri-SemiBold.ttf", "600", "normal"], ["bengali/HindSiliguri-Bold.ttf", "700", "normal"]] },
  BalooDa2: { family: "Baloo Da 2", files: [["bengali/BalooDa2-Variable.ttf", "400 800", "normal"]] },
};
const chosen = opt("fonts", (entry.fonts || ["Inter", "JetBrainsMono"]).join(",")).split(",").map((s) => s.trim()).filter(Boolean);
for (const f of chosen) if (!FONTS[f]) { console.error(`✗ unknown font ${f}: ${Object.keys(FONTS).join(", ")}`); process.exit(1); }
const families = [...new Set([...chosen, "HindSiliguri"])];
mkdirSync(path.join(dir, "assets", "fonts"), { recursive: true });
let css = "/* fonts.css — written by tools/studio/new-piece.mjs. All SIL OFL 1.1 (assets/fonts/LICENSES). */\n";
for (const k of families) for (const [file, weight, style] of FONTS[k].files) {
  copyFileSync(path.join(WS, "assets", "fonts", file), path.join(dir, "assets", "fonts", path.basename(file)));
  css += `@font-face { font-family: "${FONTS[k].family}"; font-style: ${style}; font-weight: ${weight}; src: url("${path.basename(file)}") format("truetype"); font-display: block; }\n`;
}
writeFileSync(path.join(dir, "assets", "fonts", "fonts.css"), css);

// scripts + styles
cpSync(path.join(WS, "assets", "js", "gsap"), path.join(dir, "assets", "js", "gsap"), { recursive: true });
mkdirSync(path.join(dir, "assets", "css"), { recursive: true });
copyFileSync(path.join(import.meta.dirname, "runtime", "studio.js"), path.join(dir, "assets", "js", "studio.js"));
copyFileSync(path.join(import.meta.dirname, "runtime", "studio.css"), path.join(dir, "assets", "css", "studio.css"));
if (three) cpSync(path.join(WS, "assets", "js", "three"), path.join(dir, "assets", "js", "three"), { recursive: true });
writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 1) + "\n");

const fam = (k, fb) => `"${FONTS[k] ? FONTS[k].family : k}", "Hind Siliguri", ${fb}`;
const display = chosen[0], body = chosen.find((k) => !/Mono|Serif|Playfair|Anton|Bebas/.test(k)) || chosen[0], mono = chosen.find((k) => /Mono/.test(k)) || "JetBrainsMono";
if (mono === "JetBrainsMono" && !families.includes("JetBrainsMono")) {
  copyFileSync(path.join(WS, "assets", "fonts", "latin", "JetBrainsMono-Variable.ttf"), path.join(dir, "assets", "fonts", "JetBrainsMono-Variable.ttf"));
  writeFileSync(path.join(dir, "assets", "fonts", "fonts.css"), css + `@font-face { font-family: "JetBrains Mono"; font-style: normal; font-weight: 100 800; src: url("JetBrainsMono-Variable.ttf") format("truetype"); font-display: block; }\n`);
}
const importMap = three ? `
  <script type="importmap">{ "imports": { "three": "./assets/js/three/three.module.min.js", "three/addons/": "./assets/js/three/addons/" } }</script>` : "";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=${W}, height=${H}" />
  <title>${code || "piece"} · ${title} — ${brand}</title>
  <link rel="stylesheet" href="assets/fonts/fonts.css" />
  <link rel="stylesheet" href="assets/css/studio.css" />
  <style>
    :root {
      /* ${brand}: palette + type. ONE accent carries the hierarchy. */
      --bg: #07080b;
      --bg-2: #0e1016;
      --ink: #f4f5f7;
      --accent: #7c5cff;
      --accent-2: #22d3ee;
      --font-display: ${fam(display, "sans-serif")};
      --font-body: ${fam(body, "sans-serif")};
      --font-mono: ${fam(mono, "monospace")};
    }
    /* ---- piece styles ---- */
  </style>${importMap}
  <script src="assets/js/gsap/gsap.min.js"></script>
  <script src="assets/js/gsap/CustomEase.min.js"></script>
  <script src="assets/js/gsap/SplitText.min.js"></script>
  <script src="assets/js/gsap/DrawSVGPlugin.min.js"></script>
  <script src="assets/js/gsap/MorphSVGPlugin.min.js"></script>
  <script src="assets/js/gsap/MotionPathPlugin.min.js"></script>
  <script src="assets/js/studio.js"></script>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${DUR}" data-fps="${FPS}">
    <!-- One <section class="scene clip"> per shot: data-start, data-duration, data-track-index (1, 2 … ; overlapping
         shots on different indexes). Decorative layers carry data-design-ignore. -->
    <section id="s1" class="scene clip" data-start="0" data-duration="${DUR}" data-track-index="1">
      <div class="bg-grid" data-design-ignore></div>
      <div class="layer center"><h1 id="title" class="h1">${title}</h1></div>
    </section>

    <!-- studio:audio:start -->
    <!-- studio:audio:end -->
  </div>
  <script>
    document.fonts.ready.then(() => {
      const S = Studio.init({ id: "main" });
      const tl = S.tl;
      S.lines("#title", 0.3);
      S.grain();
      S.vignette();
      window.__timelines["main"] = S.done().tl; // keep it LAST (lint wants the registration in the page)
    });
  </script>
</body>
</html>
`;
writeFileSync(path.join(dir, "index.html"), html);

const piece = {
  code, name: title, brand, project: name, aspect, width: W, height: H, duration: DUR, fps: FPS,
  concept: true,
  brief: { client: brand + " (fictional — concept work)", goal: "", audience: "", message: "", cta: "", tone: "", references: entry.references || [] },
  sound: { music: { track: music, from: 0, gain: 0.55, fadeIn: 0.3, fadeOut: 1.5 }, cues: [] },
  reel: { from: 0, to: Math.min(DUR, 4) },
  made: new Date().toISOString().slice(0, 10),
};
writeFileSync(path.join(dir, "piece.json"), JSON.stringify(piece, null, 2) + "\n");

let plan = readFileSync(path.join(WS, "tools", "plan", "TEMPLATE.md"), "utf8");
plan = plan.replace(/^# .*$/m, `# ${code || "PIECE"} · ${title} — ${brand} (concept)`);
writeFileSync(path.join(dir, "PLAN.md"), plan);

console.log(`✓ projects/${name}  ${code} ${W}×${H} ${DUR}s @${FPS}  fonts ${families.join(", ")}  music ${music}${three ? "  three.js" : ""}
Next:
  1. Fill PLAN.md (shot table) → node tools/plan-check.mjs projects/${name}
  2. Author index.html (scenes + timeline) and piece.json "sound.cues"
  3. node tools/studio/sound.mjs projects/${name}
  4. node tools/studio/check.mjs projects/${name} --at=<times>   → read snapshots/sheet.png
  5. Render: node tools/studio/render-queue.mjs ${name}`);
