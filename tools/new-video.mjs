// Starts a new video project with everything the house workflow expects, so no session rebuilds it by hand:
//   node tools/new-video.mjs <name> [--kind=screen-promo|episode|blank]
// Makes projects/<name>/ with PLAN.md (from tools/plan/TEMPLATE.md, the plan gate §0e), hyperframes.json, the fonts
// and GSAP copied in (../../ paths fail lint), a work folder on C: (C:/Users/Zubayer Nibir/VideoWork/<name>/media,
// D: is nearly full) linked as assets/media (a junction: no admin needed; git ignores it), and for a kind the
// reference project's build files to edit instead of writing from scratch:
//   screen-promo  ← projects/claude-decision-ad/build/{timeline,build-page,mix}.mjs   (skill: screen-promo)
//   episode       ← projects/zubayer-ep01/{episode.json,build-page.mjs}             (skill: episode-edit)
//   tools-reel    PLAN.md + fonts + GSAP + assets/voice, assets/music, build/ and reel.json copied from
//                 .claude/skills/tools-reel/reel.example.json; tools/reel/build.mjs makes the page   (skill: tools-reel)
//   blank         PLAN.md + fonts + GSAP only (HyperFrames skills build the page)
// Refuses a name that already exists. Prints the next steps.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync, appendFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const WORK_ROOT = "C:/Users/Zubayer Nibir/VideoWork";
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const kind = (args.find((a) => a.startsWith("--kind=")) ?? "--kind=blank").slice(7);
const KINDS = ["screen-promo", "episode", "tools-reel", "blank"];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name) || !KINDS.includes(kind)) {
  console.log(`Usage: node tools/new-video.mjs <name: lower-case-with-dashes> [--kind=${KINDS.join("|")}]`);
  process.exit(1);
}
const dir = path.join(WS, "projects", name);
if (existsSync(dir)) { console.error(`✗ projects/${name} already exists — pick another name.`); process.exit(1); }

const FONTS = {
  "screen-promo": ["latin/Anton-Regular.ttf", "latin/Inter-Variable.ttf"],
  episode: ["bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf"],
  "tools-reel": ["latin/Inter-Variable.ttf", "latin/JetBrainsMono-Variable.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf"],
  blank: ["bengali/HindSiliguri-Regular.ttf", "bengali/HindSiliguri-Medium.ttf", "bengali/HindSiliguri-SemiBold.ttf", "bengali/HindSiliguri-Bold.ttf", "bengali/BalooDa2-Variable.ttf", "latin/Inter-Variable.ttf"],
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

const notes = [];
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
if (kind === "tools-reel") {
  for (const d of ["voice", "music"]) mkdirSync(path.join(dir, "assets", d), { recursive: true });
  mkdirSync(path.join(dir, "build"));
  appendFileSync(path.join(WS, ".gitignore"), `!projects/${name}/build/\nprojects/${name}/build/mix.graph.txt\n`);
  copyFileSync(path.join(WS, ".claude", "skills", "tools-reel", "reel.example.json"), path.join(dir, "reel.json"));
  notes.push("voice → assets/voice/, BGM → assets/music/; rewrite reel.json (a working 5-tool example now) for his tools (skill tools-reel §2-§3)");
  notes.push(`node tools/reel/build.mjs projects/${name} --check, then --plan (the engine writes PLAN.md: do not fill it by hand)`);
  notes.push(`node tools/plan-check.mjs projects/${name}   (show him in Bengali, wait for OK)`);
}

console.log(`✓ projects/${name} (${kind})
  PLAN.md, hyperframes.json, ${FONTS[kind].length} fonts, GSAP, assets/media → ${work}/media
Next:${[...(kind === "tools-reel" ? [] : [`fill PLAN.md, then: node tools/plan-check.mjs projects/${name}   (show him in Bengali, wait for OK)`]), ...notes].map((n, i) => `\n  ${i + 1}. ${n}`).join("")}
  ${notes.length + (kind === "tools-reel" ? 1 : 2)}. node tools/finish.mjs projects/${name} --quality=high --frames-cache=${work}/frames-cache   (start it detached)`);
