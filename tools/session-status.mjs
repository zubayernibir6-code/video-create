// One-glance health of the workspace, printed at the start of every Claude Code session (SessionStart hook in
// .claude/settings.json), so no session spends tool calls finding out whether there is room to render.
//   node tools/session-status.mjs
// Prints: free space on C: and D: (cloud: the one disk), free RAM, uncommitted git changes, the latest delivery in renders/, and a
// warning when a render would not fit (D: < 2 GB, C: < 8 GB, RAM < 1 GB). Never fails: errors print as "?".
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, statfsSync } from "node:fs";
import { freemem } from "node:os";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const gb = (b) => (b / 1024 ** 3).toFixed(1);
const free = (drive) => { try { const s = statfsSync(drive); return s.bavail * s.bsize; } catch { return null; } };
const WIN = process.platform === "win32";
const c = WIN ? free("C:/") : free("/"), d = WIN ? free("D:/") : null, ram = freemem();
let git = "?";
try { git = String(execFileSync("git", ["-C", WS, "status", "--porcelain"], { encoding: "utf8", timeout: 8000 }).split("\n").filter(Boolean).length); } catch {}
let last = "none";
try {
  const runs = readdirSync(path.join(WS, "renders")).flatMap((p) => {
    try { return readdirSync(path.join(WS, "renders", p)).map((r) => ({ p, r, t: statSync(path.join(WS, "renders", p, r)).mtimeMs })); } catch { return []; }
  }).sort((a, b) => b.t - a.t);
  if (runs[0]) last = `${runs[0].p}/${runs[0].r}`;
} catch {}
const warn = [];
if (WIN && d !== null && d < 2 * 1024 ** 3) warn.push("D: under 2 GB — keep media and frame caches on C:");
if (WIN && c !== null && c < 8 * 1024 ** 3) warn.push("C: under 8 GB — %TEMP% render work may not fit");
if (!WIN && c !== null && c < 5 * 1024 ** 3) warn.push("disk under 5 GB — delete old renders/frames in /home/claude/VideoWork");
if (ram < 1024 ** 3) warn.push("RAM under 1 GB — ask him to close Chrome tabs before ASR or a render");
const disks = WIN ? `C: ${c === null ? "?" : gb(c)} GB free · D: ${d === null ? "?" : gb(d)} GB free` : `cloud disk ${c === null ? "?" : gb(c)} GB free`;
console.log(`[Video Create status] ${disks} · RAM ${gb(ram)} GB free · git: ${git} uncommitted · last render: ${last}${warn.length ? `\n  ⚠ ${warn.join("\n  ⚠ ")}` : ""}
  Fast start: CLAUDE.md §00 (job → skill → command) · new video: node tools/new-video.mjs <name> --kind=…`);
