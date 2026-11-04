// linux-overlay.mjs — makes the Windows-built tools run on the Linux cloud machine WITHOUT changing how they behave on
// the PC. Every change is "an environment variable if set (VC_WORK_ROOT, VC_HF_DIR, VC_CHROME, VC_ENV_FILE — set only by
// tools/cloud/env.sh), else on Windows the original value, else the cloud path". Two PowerShell calls get a Linux branch.
// On the PC (win32, no VC_* variables) every changed line evaluates to exactly its original value.
//
//   node tools/cloud/linux-overlay.mjs            apply (idempotent: a file already changed is skipped)
//   node tools/cloud/linux-overlay.mjs --check    report only; exit 1 if a change is still to apply or an expected line is missing
//
// It stops loudly when an original line it expects is not found (the PC copy of a tool changed): update the pair
// below, never guess. Paths that only need a file to exist (tools/pyenv/Scripts/python.exe, deep-filter.exe, the
// FFmpeg/whisper .exe names) are NOT patched: setup.sh links them to the Linux programs instead.
// Written 2026-11-04 for the cloud setup; verified by tools/cloud/setup.sh --check and the proof render (CLOUD.md).
import fs from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const CHECK = process.argv.includes("--check");
const WIN = `process.platform === "win32"`;
const WR = `(process.env.VC_WORK_ROOT || (${WIN} ? "C:/Users/Zubayer Nibir/VideoWork" : "/home/claude/VideoWork"))`;
const HFDIR = (orig) => `(process.env.VC_HF_DIR || (${WIN} ? ${orig} : "/home/claude/.npm-global/lib/node_modules/hyperframes/"))`;

const PATCHES = [
  ["tools/new-video.mjs", [
    [`const WORK_ROOT = "C:/Users/Zubayer Nibir/VideoWork";`, `const WORK_ROOT = ${WR};`],
  ]],
  ["tools/release/master-words.mjs", [
    [`const WORK_ROOT = "C:/Users/Zubayer Nibir/VideoWork";`, `const WORK_ROOT = ${WR};`],
  ]],
  ["tools/explainer/reels.mjs", [
    ["const work = `C:/Users/Zubayer Nibir/VideoWork/${R.name}`;", "const work = `${" + WR + "}/${R.name}`;"],
  ]],
  ["tools/clone/gemini.mjs", [
    [`const VC = "C:/Users/Zubayer Nibir/VideoWork/voice-clone";`, "const VC = `${" + WR + "}/voice-clone`;"],
  ]],
  ["tools/clone/rvc.mjs", [
    [`const VC = "C:/Users/Zubayer Nibir/VideoWork/voice-clone";`, "const VC = `${" + WR + "}/voice-clone`;"],
  ]],
  ["tools/clone/say.mjs", [
    [`const PY = "C:/Users/Zubayer Nibir/VideoWork/voice-clone/venv/Scripts/python.exe";`,
     "const PY = process.platform === \"win32\" ? \"C:/Users/Zubayer Nibir/VideoWork/voice-clone/venv/Scripts/python.exe\" : `${" + WR + "}/voice-clone/venv/bin/python`;"],
    [`const voiceDir = opt.voice || "C:/Users/Zubayer Nibir/VideoWork/voice-clone/voice";`,
     "const voiceDir = opt.voice || `${" + WR + "}/voice-clone/voice`;"],
  ]],
  ["tools/clone/dataset.mjs", [
    ["const z = spawnSync(\"powershell\", [\"-NoProfile\", \"-Command\", `Compress-Archive -Path '${clipsDir}\\\\*.wav' -DestinationPath '${zip}' -CompressionLevel Fastest`], { encoding: \"utf8\" });",
     "const z = process.platform === \"win32\"\n  ? spawnSync(\"powershell\", [\"-NoProfile\", \"-Command\", `Compress-Archive -Path '${clipsDir}\\\\*.wav' -DestinationPath '${zip}' -CompressionLevel Fastest`], { encoding: \"utf8\" })\n  : spawnSync(\"sh\", [\"-c\", 'cd \"$1\" && zip -q -1 \"$2\" *.wav', \"sh\", clipsDir, zip], { encoding: \"utf8\" });"],
  ]],
  ["tools/clone/indicf5-gen.py", [
    [`env = "D:/Video Create/.env.local"`, `env = os.environ.get("VC_ENV_FILE", "D:/Video Create/.env.local" if os.name == "nt" else "/home/claude/video-create/.env.local")`],
  ]],
  ["tools/autocap/capture.mjs", [
    [`const HF = path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/";`,
     `const HF = ${HFDIR(`path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/"`)};`],
    [`const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));`,
     `const CHROME = [process.env.VC_CHROME, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome"].find((p) => p && fs.existsSync(p));`],
  ]],
  ["tools/autocap/teleprompter.mjs", [
    [`  const HF = path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/";`,
     `  const HF = ${HFDIR(`path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/"`)};`],
    [`executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true`,
     `executablePath: process.env.VC_CHROME || (${WIN} ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "/usr/bin/google-chrome"), headless: true`],
  ]],
  ["tools/autocap/voice-times.mjs", [
    [`    const [busy, free] = spawnSync("powershell", ["-NoProfile", "-Command", q], { encoding: "utf8" }).stdout.trim().split(/\\s+/).map(Number);`,
     `    const [busy, free] = (process.platform === "win32"\n      ? spawnSync("powershell", ["-NoProfile", "-Command", q], { encoding: "utf8" }).stdout\n      : spawnSync("sh", ["-c", "echo $(pgrep -fc '[a]sr_chunks|[t]ranscribe\\\\.py') $(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)"], { encoding: "utf8" }).stdout).trim().split(/\\s+/).map(Number);`],
  ]],
];

let missing = 0, applied = 0, already = 0;
for (const [rel, pairs] of PATCHES) {
  const f = path.join(WS, rel);
  if (!fs.existsSync(f)) { console.log(`✗ missing file ${rel}`); missing++; continue; }
  let s = fs.readFileSync(f, "utf8");
  let changed = false;
  for (const [from, to] of pairs) {
    if (s.includes(to)) { already++; continue; }
    const n = s.split(from).length - 1;
    if (n !== 1) { console.log(`✗ ${rel}: expected original line found ${n}× (the PC copy changed?):\n    ${from.slice(0, 110)}`); missing++; continue; }
    if (!CHECK) { s = s.replace(from, () => to); changed = true; }
    applied++;
  }
  if (changed) fs.writeFileSync(f, s);
}
console.log(`${CHECK ? "check" : "overlay"}: ${applied} ${CHECK ? "to apply" : "applied"}, ${already} already in place, ${missing} problem(s)`);
process.exit(missing || (CHECK && applied) ? 1 : 0);   // --check fails while a change is still to apply
