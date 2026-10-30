// Starts a new video project with everything the house workflow expects, so no session rebuilds it by hand:
//   node tools/new-video.mjs <name> [--kind=screen-promo|screen-tutorial|episode|abroll|tools-reel|ureel|linkedin|blank]
// Makes projects/<name>/ with PLAN.md (from tools/plan/TEMPLATE.md, the plan gate §0e), hyperframes.json, the fonts
// and GSAP copied in (../../ paths fail lint), a work folder on C: (C:/Users/Zubayer Nibir/VideoWork/<name>/media,
// D: is nearly full) linked as assets/media (a junction: no admin needed; git ignores it), and for a kind the
// reference project's build files to edit instead of writing from scratch:
//   screen-promo  ← projects/claude-decision-ad/build/{timeline,build-page,mix}.mjs   (skill: screen-promo)
//   screen-tutorial  build/{tutorial,page}.json copied from projects/claude-video-tutorial (a working example to
//                 rewrite) + an empty build/specs.json; tools/tutorial/build.mjs makes everything   (skill: screen-tutorial)
//   episode       ← projects/zubayer-ep01/{episode.json,build-page.mjs}             (skill: episode-edit)
//   abroll        abroll.json copied from .claude/skills/abroll/abroll.example.json (the 5-style demo's data, to
//                 rewrite); tools/abroll/build.mjs makes everything   (skill: abroll, styles AB1–AB5)
//   tools-reel    PLAN.md + fonts + GSAP + assets/voice, assets/music, build/ and reel.json copied from
//                 .claude/skills/tools-reel/reel.example.json; tools/reel/build.mjs makes the page   (skill: tools-reel)
//   ureel         a universal 9:16 Reel cut from a FINISHED video (style UREEL1): cutdown.json, captions.json and
//                 build-page.mjs copied from projects/claude-ureel-1 (profile universal-reel)   (skills: release-kit, reel-cutdown)
//   linkedin      a 4:5 LinkedIn cut of a finished video (style LI1): the same three files from projects/claude-li-1
//                 (profile linkedin-clip)   (skill: linkedin-kit)
//   blank         PLAN.md + fonts + GSAP only (HyperFrames skills build the page)
// Refuses a name that already exists. Prints the next steps.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const WORK_ROOT = "C:/Users/Zubayer Nibir/VideoWork";
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const kind = (args.find((a) => a.startsWith("--kind=")) ?? "--kind=blank").slice(7);
const KINDS = ["screen-promo", "screen-tutorial", "episode", "abroll", "tools-reel", "ureel", "linkedin", "blank"];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name) || !KINDS.includes(kind)) {
  console.log(`Usage: node tools/new-video.mjs <name: lower-case-with-dashes> [--kind=${KINDS.join("|")}]`);
  process.exit(1);
}
const dir = path.join(WS, "projects", name);
if (existsSync(dir)) { console.error(`✗ projects/${name} already exists — pick another name.`); process.exit(1); }

const FONTS = {
  "screen-promo": ["latin/Anton-Regular.ttf", "latin/Inter-Variable.ttf"],
  "screen-tutorial": ["latin/Inter-Variable.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf"],
  abroll: ["latin/Inter-Variable.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf"],
  episode: ["bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf"],
  "tools-reel": ["latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf"],
  blank: ["bengali/HindSiliguri-Regular.ttf", "bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf"],
  ureel: ["bengali/HindSiliguri-Regular.ttf", "bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf"],
  linkedin: ["bengali/HindSiliguri-Regular.ttf", "bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf"],
};
mkdirSync(path.join(dir, "assets", "fonts"), { recursive: true });
for (const f of FONTS[kind]) copyFileSync(path.join(WS, "assets", "fonts", f), path.join(dir, "assets", "fonts", path.basename(f)));
cpSync(path.join(WS, "assets", "js", "gsap"), path.join(dir, "assets", "js", "gsap"), { recursive: true });
writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 1) + "\n");
copyFileSync(path.join(WS, "tools", "plan", "TEMPLATE.md"), path.join(dir, "PLAN.md"));

// heavy media lives on C:, linked into the project
const work = `${WORK_ROOT}/${name}`;
mkdirSync(`${work}/media`, { recursive: true });
symlinkSync(path.resolve(`${work}/media`), path.join(dir, "assets", "media"), "junction");

const before = [], notes = []; // before: steps that come ahead of the plan gate
if (kind === "screen-promo") {
  const ref = path.join(WS, "projects", "claude-decision-ad", "build");
  mkdirSync(path.join(dir, "build"));
  for (const f of ["timeline.mjs", "build-page.mjs", "mix.mjs"]) {
    const text = readFileSync(path.join(ref, f), "utf8");
    writeFileSync(path.join(dir, "build", f), `// COPIED from projects/claude-decision-ad on ${new Date().toISOString().slice(0, 10)}: change the times, views, text and file paths.\n${text}`);
  }
  appendFileSync(path.join(WS, ".gitignore"), `!projects/${name}/build/\nprojects/${name}/build/mix.graph.txt\n`);
  notes.push("measure the recording (skill screen-promo §1), then edit build/timeline.mjs, build/build-page.mjs, build/mix.mjs");
}
if (kind === "episode") {
  const ref = path.join(WS, "projects", "zubayer-ep01");
  const ep = JSON.parse(readFileSync(path.join(ref, "episode.json"), "utf8"));
  ep.name = name; ep.work = work; ep.title = "TITLE — fill in";
  writeFileSync(path.join(dir, "episode.json"), JSON.stringify(ep, null, 2) + "\n");
  copyFileSync(path.join(ref, "build-page.mjs"), path.join(dir, "build-page.mjs"));
  notes.push("set episode.json source.video / music / subtitles and the cuts; rewrite the scenes in build-page.mjs (skill episode-edit)");
}
if (kind === "screen-tutorial") {
  const ref = path.join(WS, "projects", "claude-video-tutorial", "build");
  mkdirSync(path.join(dir, "build"));
  appendFileSync(path.join(WS, ".gitignore"), `!projects/${name}/build/\nprojects/${name}/build/mix.graph.txt\n`);
  const tag = `EXAMPLE copied from projects/claude-video-tutorial on ${new Date().toLocaleDateString("sv-SE")}: measure and replace every value (skill screen-tutorial). `;
  for (const f of ["tutorial.json", "page.json"]) writeFileSync(path.join(dir, "build", f), readFileSync(path.join(ref, f), "utf8").replace(`"note": "`, `"note": "${tag}`));
  writeFileSync(path.join(dir, "build", "specs.json"), JSON.stringify({ note: "From the per-scene frame review, in SOURCE seconds and pixels (skill screen-tutorial §3-§4).", camera: [], anchors: {}, clicks: [], drags: [], blurs: [], freezes: [] }, null, 1) + "\n");
  before.push("check the source BEFORE planning: contact-sheet --every=0.5, tools/screen/glitch-scan.mjs, the privacy-blur level (skill screen-tutorial §1)");
  notes.push("fill build/tutorial.json (sources, frames, voice pauses/cuts, anchors), build/specs.json (frame review), build/cursor.json (tools/screen/track-cursor.py), then rewrite build/page.json (cards, labels, callouts) — skill screen-tutorial §3-§5");
  notes.push(`node tools/tutorial/build.mjs projects/${name} check   (until it prints ✓), then: node tools/tutorial/build.mjs projects/${name}`);
  notes.push(`node tools/preflight.mjs projects/${name}   (0 ERRORs; read every sheet in .preflight/)`);
}
if (kind === "abroll") {
  const ex = readFileSync(path.join(WS, ".claude", "skills", "abroll", "abroll.example.json"), "utf8");
  writeFileSync(path.join(dir, "abroll.json"), ex.replace(`"note": "`, `"note": "EXAMPLE copied on ${new Date().toLocaleDateString("sv-SE")}: replace the recording, voice, words, music and every section (skill abroll). `));
  before.push(`look at his folder first: node tools/route.mjs <folder>   (S4 = talking head; B-roll clips show as camera without speech)`);
  notes.push("clean voice + word timings (skill abroll §1), choose a style per section (§2), rewrite abroll.json");
  notes.push(`node tools/abroll/build.mjs projects/${name} check   (until ✓), then: node tools/abroll/build.mjs projects/${name}`);
  notes.push(`over 60 s: node tools/preflight.mjs projects/${name}   (0 ERRORs; read the sheets)`);
}
if (kind === "tools-reel") {
  for (const d of ["voice", "music"]) mkdirSync(path.join(dir, "assets", d), { recursive: true });
  mkdirSync(path.join(dir, "build"));
  appendFileSync(path.join(WS, ".gitignore"), `!projects/${name}/build/\nprojects/${name}/build/mix.graph.txt\n`);
  copyFileSync(path.join(WS, ".claude", "skills", "tools-reel", "reel.example.json"), path.join(dir, "reel.json"));
  notes.push("voice → assets/voice/, BGM → assets/music/; rewrite reel.json (a working 5-tool example now) for his tools (skill tools-reel §2-§3)");
  notes.push(`node tools/reel/build.mjs projects/${name} --check, then --plan (the engine writes PLAN.md: do not fill it by hand)`);
  notes.push(`node tools/plan-check.mjs projects/${name}   (show him in Bengali, wait for OK)`);
}

if (kind === "ureel" || kind === "linkedin") {
  // a cut-down of a finished video: the reference project's three data files, to rewrite (tools/cutdown engine)
  const refName = kind === "ureel" ? "claude-ureel-1" : "claude-li-1", ref = path.join(WS, "projects", refName);
  const cd = JSON.parse(readFileSync(path.join(ref, "cutdown.json"), "utf8"));
  cd.name = name; cd.work = work;
  cd.note = `EXAMPLE copied from projects/${refName} on ${new Date().toLocaleDateString("sv-SE")}: set master (the finished render), bed, faces and the segments of THIS cut (master seconds, word boundaries).`;
  writeFileSync(path.join(dir, "cutdown.json"), JSON.stringify(cd, null, 1) + "\n");
  copyFileSync(path.join(ref, "captions.json"), path.join(dir, "captions.json"));
  // the note goes AFTER the shebang: a "#!" on line 2 is a syntax error
  const page = readFileSync(path.join(ref, "build-page.mjs"), "utf8").replace(/^#!.*\r?\n/, "");
  writeFileSync(path.join(dir, "build-page.mjs"), `#!/usr/bin/env node\n// COPIED from projects/${refName} on ${new Date().toLocaleDateString("sv-SE")}: keep profile "${kind === "ureel" ? "universal-reel" : "linkedin-clip"}"; rewrite title, tag, hook, chips, jumps, pans, cliff and cta for THIS cut.\n${page}`);
  before.push(`the main video's words, once per main video: node tools/release/master-words.mjs projects/<main>   (skill release-kit §2)`);
  notes.push(`rewrite cutdown.json (segments on word boundaries), captions.json, build-page.mjs (skill ${kind === "ureel" ? "release-kit §4" : "linkedin-kit"})`);
  notes.push(`node tools/cutdown/cut.mjs projects/${name} && node projects/${name}/build-page.mjs && node tools/cutdown/mix.mjs projects/${name}`);
  notes.push(`cd projects/${name} && node ../../tools/design-lint.mjs . && hyperframes check   (0 safe_zone errors), then node tools/release/cover.mjs projects/${name}`);
  notes.push(`node tools/preflight.mjs projects/${name}   (over 60 s)`);
}

console.log(`✓ projects/${name} (${kind})
  PLAN.md, hyperframes.json, ${FONTS[kind].length} fonts, GSAP, assets/media → ${work}/media
Next:${[...before, ...(kind === "tools-reel" ? [] : [`fill PLAN.md, then: node tools/plan-check.mjs projects/${name}   (show him in Bengali, wait for OK)`]), ...notes].map((n, i) => `\n  ${i + 1}. ${n}`).join("")}
  ${before.length + notes.length + (kind === "tools-reel" ? 1 : 2)}. node tools/finish.mjs projects/${name} --quality=high --frames-cache=${work}/frames-cache   (start it detached)`);
