#!/usr/bin/env node
// slot.mjs — a machine-wide limit on heavy jobs, so several agents working at once never start more headless
// Chromes than this laptop's RAM can hold (Motion Studio kit, 2026-11-07).
//
//   node tools/studio/slot.mjs <pool> <max> -- <command …>
//   e.g. node tools/studio/slot.mjs chrome 2 -- npx hyperframes snapshot projects/x --at 1,2 --describe false
//
// Pools used by the kit: "chrome" (snapshots, hyperframes check: max 2 on the laptop, 3 on the 8 GB cloud box) and
// "render" (finish.mjs / hyperframes render: max 1). A slot is a lock file .cache/studio-slots/<pool>/<n>.lock
// holding the owner's PID; it is taken with an exclusive create (atomic), freed on exit, and taken over when its
// PID is gone or the file is older than 45 min. Waits up to 40 min, printing a line every 30 s.

import { spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, statSync, writeSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
const [pool, maxS] = argv;
const cmd = sep >= 0 ? argv.slice(sep + 1) : [];
if (!pool || !maxS || !cmd.length) { console.log("Usage: node tools/studio/slot.mjs <pool> <max> -- <command …>"); process.exit(2); }
const max = Math.max(1, +maxS);
const dir = path.join(WS, ".cache", "studio-slots", pool);
mkdirSync(dir, { recursive: true });

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
function tryTake() {
  for (let n = 0; n < max; n++) {
    const f = path.join(dir, `${n}.lock`);
    if (existsSync(f)) {
      let stale = false;
      try {
        const pid = +readFileSync(f, "utf8").split(/\s+/)[0];
        stale = !pid || !alive(pid) || Date.now() - statSync(f).mtimeMs > 45 * 60 * 1000;
      } catch { stale = true; }
      if (stale) { try { rmSync(f, { force: true }); } catch {} } else continue;
    }
    try { const fd = openSync(f, "wx"); writeSync(fd, `${process.pid} ${new Date().toISOString()} ${cmd.join(" ").slice(0, 200)}`); closeSync(fd); return f; } catch {}
  }
  return null;
}

const t0 = Date.now();
let lock = tryTake();
let lastSay = 0;
while (!lock) {
  if (Date.now() - t0 > 40 * 60 * 1000) { console.error(`✗ slot ${pool}: no free slot after 40 min`); process.exit(3); }
  if (Date.now() - lastSay > 30000) { console.log(`… waiting for a free "${pool}" slot (${max} max)`); lastSay = Date.now(); }
  await new Promise((r) => setTimeout(r, 1500));
  lock = tryTake();
}
const release = () => { try { rmSync(lock, { force: true }); } catch {} };
process.on("SIGINT", () => { release(); process.exit(130); });
process.on("SIGTERM", () => { release(); process.exit(143); });
// A real executable path (node.exe) runs without a shell, so spaces in "C:\Users\Zubayer Nibir\…" survive.
// Bare names (npx, hyperframes) need the shell on Windows (.cmd shims): quote every argument that needs it.
const direct = existsSync(cmd[0]);
const q = (a) => (/^[\w\-.,:/\\=@+]+$/.test(a) ? a : `"${a.replace(/"/g, '\\"')}"`);
const child = direct
  ? spawn(cmd[0], cmd.slice(1), { stdio: "inherit" })
  : spawn(cmd.map(q).join(" "), { stdio: "inherit", shell: true });
child.on("exit", (code) => { release(); process.exit(code ?? 1); });
child.on("error", (e) => { release(); console.error("✗ " + e.message); process.exit(1); });
