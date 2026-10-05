#!/usr/bin/env node
// transcribe.mjs — speech to text with word timings (Bengali by default). Runs tools/transcribe.py with the
// workspace Python (tools/pyenv), never the `python` on PATH, which belongs to another app (CLAUDE.md §0b).
//
//   node "E:/Video Create/tools/transcribe.mjs" <audio-or-video> [--lang=bn|en] [--model=bengali|turbo|small] [--out=<path>]
//
// Writes <name>.words.json, <name>.srt and <name>.txt next to the input. See transcribe.py for the models.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const python = path.join(import.meta.dirname, "pyenv", "Scripts", "python.exe");
if (!existsSync(python)) {
  console.error(`✗ Workspace Python not found: ${python}`);
  process.exit(1);
}
const args = process.argv.slice(2).flatMap((a) => {
  const m = a.match(/^--(lang|model|out)=(.*)$/);
  return m ? [`--${m[1]}`, m[2]] : [a];
});
const r = spawnSync(python, [path.join(import.meta.dirname, "transcribe.py"), ...args], {
  stdio: "inherit",
  env: { ...process.env, PYTHONIOENCODING: "utf-8", HF_HUB_DISABLE_TELEMETRY: "1" },
});
process.exit(r.status ?? 1);
