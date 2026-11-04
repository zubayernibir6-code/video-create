// autostart.mjs — SessionStart hook (.claude/settings.json). Makes a fresh cloud machine ready WITHOUT anyone typing a
// command, so the first minutes of a chat go to his video, not to setup.
//   node tools/cloud/autostart.mjs        (the hook runs it; safe to run by hand; returns in < 20 s)
// Windows PC: prints nothing, changes nothing. Linux cloud:
//   1. if the workspace was cloned somewhere else (e.g. a GitHub repo attached to the session), links
//      /home/claude/video-create to it, because the cloud fallbacks in the tools point there;
//   2. setup already running → says so; studio already set up → a 2-second `setup.sh --check`;
//   3. otherwise starts `tools/cloud/setup.sh` DETACHED (own session via detached:true, survives the hook), log /opt/vc/setup.run.log.
// Then: plan the video while it installs; `bash tools/cloud/ready.sh` waits for it before the first build/render.
// Written 2026-11-04; proved on a fresh cloud machine (CLOUD.md §5c).
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

if (process.platform === "win32") process.exit(0);
const WS = path.resolve(import.meta.dirname, "..", "..");
const OPT = process.env.VC_OPT || "/opt/vc";
const ALIAS = "/home/claude/video-create";
const say = (m) => console.log(`[Video Create cloud] ${m}`);

try {
  if (WS !== ALIAS && !fs.existsSync(ALIAS)) { fs.mkdirSync(path.dirname(ALIAS), { recursive: true }); fs.symlinkSync(WS, ALIAS); }
} catch {}

const pidFile = path.join(OPT, "setup.pid");
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
let pid = 0;
try { pid = Number(fs.readFileSync(pidFile, "utf8")); } catch {}
if (pid && alive(pid)) {
  const since = Math.round((Date.now() - fs.statSync(pidFile).mtimeMs) / 1000);
  say(`studio setup is running (${since} s so far, pid ${pid}). Plan now; run \`bash tools/cloud/ready.sh\` before the first build/render.`);
  process.exit(0);
}
if (fs.existsSync(path.join(OPT, "setup.ok"))) {
  const r = spawnSync("bash", [path.join(WS, "tools/cloud/setup.sh"), "--check"], { encoding: "utf8", timeout: 15000, env: { ...process.env, VC_WS: WS } });
  if (r.status === 0) { say("studio READY (setup --check all ✓). Commands need `. tools/cloud/env.sh &&` only in the first shell of a fresh machine."); process.exit(0); }
}
fs.mkdirSync(OPT, { recursive: true });
const out = fs.openSync(path.join(OPT, "setup.run.log"), "w");
const child = spawn("bash", [path.join(WS, "tools/cloud/setup.sh")], { cwd: WS, detached: true, stdio: ["ignore", out, out], env: { ...process.env, VC_WS: WS, VC_OPT: OPT } });
fs.writeFileSync(pidFile, String(child.pid));
child.unref();
say(`fresh machine: studio setup STARTED in the background (pid ${child.pid}, ~3–5 min, log ${OPT}/setup.run.log). ` +
    "Read the brief and write PLAN.md meanwhile; run `bash tools/cloud/ready.sh` before the first build/render.");
