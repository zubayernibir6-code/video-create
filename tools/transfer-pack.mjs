// Refresh the knowledge pack that lets ANOTHER model (claude.ai Project, ChatGPT, Gemini, Cowork) plan his videos
// the way this workspace does. The prompt itself is hand-written (transfer-kit/PROMPT.md + knowledge/00-STUDIO-RULES.md);
// this tool only copies the CURRENT versions of the files it points to, so the pack never goes stale.
//   node tools/transfer-pack.mjs
// Writes transfer-kit/knowledge/*.{md,json,txt} (one file per source), sfx-list.md (from assets/sfx + manifest.json),
// PACK-INFO.md (date, commit, sizes) and ALL-IN-ONE.md (everything in one file, for tools that take few uploads:
// Gemini Gems allow 10 files, ChatGPT GPTs 20). Run it after every change to STYLE.md, LESSONS.md, VARIANTS.md or
// a copied skill, then upload the pack again. Verified 2026-11-04 on master 84c66c8.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const KIT = path.join(WS, "transfer-kit");
const OUT = path.join(KIT, "knowledge");

// published name ← workspace source; 00-STUDIO-RULES.md is hand-written in place and is not copied.
const COPIES = [
  ["STYLE.md", "STYLE.md"],
  ["LESSONS.md", "LESSONS.md"],
  ["VARIANTS.md", "VARIANTS.md"],
  ["PLAN-TEMPLATE.md", "tools/plan/TEMPLATE.md"],
  ["PLAN-EXAMPLE.md", "tools/plan/EXAMPLE.md"],
  ["fundamentals.md", "docs/fundamentals.md"],
  ["skill-tools-reel.md", ".claude/skills/tools-reel/SKILL.md"],
  ["reel.example.json", ".claude/skills/tools-reel/reel.example.json"],
  ["reel.series.example.json", "projects/gh-ep10-claude/reel.json"],
  ["skill-explainer.md", ".claude/skills/explainer/SKILL.md"],
  ["explainer.example.json", "projects/claude-skills-tutorial/build/explainer.json"],
  ["voice-script.example.txt", "projects/claude-skills-tutorial/build/voice-script.txt"],
  ["skill-post-copy.md", ".claude/skills/post-copy/SKILL.md"],
  ["skill-privacy-blur.md", ".claude/skills/privacy-blur/SKILL.md"],
  ["PROMPT-PACK-tools-reel.md", "PROMPT-PACK-tools-reel.md"],
  // Motion Studio (2026-11-07): another model can plan a client piece by CODE from these
  ["skill-motion-studio.md", ".claude/skills/motion-studio/SKILL.md"],
  ["studio-catalog.json", "tools/studio/catalog.json"],
  ["studio-AGENT-BRIEF.md", "docs/studio/AGENT-BRIEF.md"],
  ["studio-QUALITY.md", "docs/studio/QUALITY.md"],
  ["studio-brief.example.md", "projects/pf-fd1-relay/BRIEF.md"],
  ["studio-piece.example.json", "projects/pf-pl1-lumen/piece.json"],
  ["business-PLAYBOOK.md", "docs/business/PLAYBOOK.md"],
  ["business-CLIENT-BRIEF.md", "docs/business/client-kit/CLIENT-BRIEF.md"],
];

mkdirSync(OUT, { recursive: true });
const missing = COPIES.filter(([, src]) => !existsSync(path.join(WS, src)));
if (missing.length) {
  console.error(`✗ missing source file(s): ${missing.map(([, s]) => s).join(", ")}`);
  process.exit(1);
}
for (const [name, src] of COPIES) copyFileSync(path.join(WS, src), path.join(OUT, name));

// The sound names plan-check accepts: every audio file in assets/sfx, with the manifest's description.
const manifest = JSON.parse(readFileSync(path.join(WS, "assets/sfx/manifest.json"), "utf8"));
const sfx = readdirSync(path.join(WS, "assets/sfx")).filter((f) => /\.(mp3|wav|ogg)$/i.test(f)).sort();
const sfxRows = sfx.map((f) => {
  const name = f.replace(/\.\w+$/, "");
  const m = manifest[name] ?? {};
  return `| \`${name}\` | ${m.duration ?? "?"} | ${(m.description ?? "").replace(/\|/g, "/")} |`;
});
writeFileSync(path.join(OUT, "sfx-list.md"), [
  "# Sound effects that exist (assets/sfx)",
  "",
  "Write these names in backticks in a PLAN.md শব্দ cell, without the extension (`whoosh-short`, `click` ×৩).",
  "Any other name is a plan-check WARN. Durations in seconds.",
  "",
  "| name | s | what it is |",
  "| --- | --- | --- |",
  ...sfxRows,
  "",
].join("\n"));

// The icon names the reel and explainer engines accept (their --check refuses any other name).
const icons = readdirSync(path.join(WS, "assets/icons/lucide/icons")).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort();
writeFileSync(path.join(OUT, "lucide-icons.txt"),
  `Lucide icon names that exist in the workspace (${icons.length}). Use only these in "icon" fields. No brand logos exist.\n\n${icons.join(", ")}\n`);

let commit = "?";
try { commit = execFileSync("git", ["-C", WS, "log", "-1", "--format=%h %ad", "--date=short"], { encoding: "utf8" }).trim(); } catch {}
const files = readdirSync(OUT).filter((f) => !["ALL-IN-ONE.md", "PACK-INFO.md"].includes(f)).sort();
if (!files.includes("00-STUDIO-RULES.md")) console.warn("! knowledge/00-STUDIO-RULES.md is missing: the pack is incomplete without it");

const kb = (f) => (statSync(path.join(OUT, f)).size / 1024).toFixed(1);
writeFileSync(path.join(OUT, "PACK-INFO.md"), [
  "# Pack info",
  "",
  `Made: ${new Date().toISOString().slice(0, 10)} from commit ${commit} (uncommitted edits in the folder are included).`,
  "Upload every file below, or only ALL-IN-ONE.md where the tool takes few files.",
  "",
  "| file | KB |",
  "| --- | --- |",
  ...files.map((f) => `| ${f} | ${kb(f)} |`),
  "",
].join("\n"));

// One file with everything, rules first; JSON and text go inside fences so the model keeps them apart.
const order = ["00-STUDIO-RULES.md", ...files.filter((f) => f !== "00-STUDIO-RULES.md")];
const parts = order.filter((f) => existsSync(path.join(OUT, f))).map((f) => {
  const body = readFileSync(path.join(OUT, f), "utf8").replace(/^﻿/, "");
  const fence = f.endsWith(".json") ? "json" : f.endsWith(".txt") ? "text" : null;
  return `\n\n<<<<< FILE: ${f} >>>>>\n\n${fence ? "```" + fence + "\n" + body.trimEnd() + "\n```" : body.trimEnd()}\n\n<<<<< END OF FILE: ${f} >>>>>`;
});
writeFileSync(path.join(OUT, "ALL-IN-ONE.md"),
  `# Video Create knowledge pack (all files in one)\n\nMade ${new Date().toISOString().slice(0, 10)} from commit ${commit}. ` +
  `Each file starts at a "<<<<< FILE: name >>>>>" line. Read 00-STUDIO-RULES.md first.${parts.join("")}\n`);

const total = (statSync(path.join(OUT, "ALL-IN-ONE.md")).size / 1024).toFixed(0);
console.log(`✓ ${files.length} files in transfer-kit/knowledge (ALL-IN-ONE.md ${total} KB), ${sfx.length} sound names, ${icons.length} icons, commit ${commit}`);
