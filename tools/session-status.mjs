// One-glance health of the workspace, printed at the start of every Claude Code session (SessionStart hook in
// .claude/settings.json), so no session spends tool calls finding out whether there is room to render.
//   node tools/session-status.mjs
// Prints: free space on C: and D:, free RAM, uncommitted git changes, the latest delivery in renders/, and a
// warning when a render would not fit (D: < 2 GB, C: < 8 GB, RAM < 1 GB). Never fails: errors print as "?".
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, statfsSync } from "node:fs";
import { freemem } from "node:os";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..");
const gb = (b) => (b / 1024 ** 3).toFixed(1);
const free = (drive) => { try { const s = statfsSync(drive); return s.bavail * s.bsize; } catch { return null; } };
const c = free("C:/"), d = free("D:/"), ram = freemem();
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
if (d !== null && d < 2 * 1024 ** 3) warn.push("D: under 2 GB — keep media and frame caches on C:");
if (c !== null && c < 8 * 1024 ** 3) warn.push("C: under 8 GB — %TEMP% render work may not fit");
if (ram < 1024 ** 3) warn.push("RAM under 1 GB — ask him to close Chrome tabs before ASR or a render");
console.log(`[Video Create status] C: ${c === null ? "?" : gb(c)} GB free · D: ${d === null ? "?" : gb(d)} GB free · RAM ${gb(ram)} GB free · git: ${git} uncommitted · last render: ${last}${warn.length ? `\n  ⚠ ${warn.join("\n  ⚠ ")}` : ""}
  Skills here: screen-promo, episode-edit, zero-cost-video-editor · new video: node tools/new-video.mjs <name> --kind=…`);
