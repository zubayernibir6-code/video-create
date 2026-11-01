#!/usr/bin/env node
// teleprompter.mjs — a teleprompter page for his phone take: big Bengali lines, one key press (or tap) per line, a
// short checklist first. He opens it on the laptop right behind the phone and reads while the phone records his face.
//   node tools/autocap/teleprompter.mjs projects/<name> [--from=<script.txt>] [--check]
//   → projects/<name>/teleprompter.html (one file, the font inside it: Chrome refuses fonts from file:// pages)
//   --check walks every line in headless Chrome at two laptop sizes (errors, font, fit, end screen); exit 1 on a fault.
// Lines: demo.json's steps[].say (the same lines the aligner looks for in his take), or one line per row of --from.
// Keys: Space / → / PageDown / Enter / a tap = next line · ← / PageUp / Backspace = back · + / − text size ·
// ↑ / ↓ move the text (put it right under the lens) · M mirror (glass rig) · F full screen · Home = start again.
// A fumbled line needs no button: he just says it again; the take is cut later to the last good reading of each line.
// English words are gold (say them clearly); size and position are remembered in this browser (localStorage).
// Verified 2026-11-01 on projects/autotut-proof in Chrome 156 (headless, 1536×864 and 1366×768: start, lines, end).
import fs from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const argv = process.argv.slice(2);
const proj = argv.find((a) => !a.startsWith("--"));
if (!proj) { console.error("usage: node tools/autocap/teleprompter.mjs projects/<name> [--from=<script.txt>]"); process.exit(1); }
const from = argv.find((a) => a.startsWith("--from="))?.slice(7);
const demoFile = path.join(proj, "demo.json");
const demo = fs.existsSync(demoFile) ? JSON.parse(fs.readFileSync(demoFile, "utf8").replace(/^﻿/, "")) : {};
const lines = from
  ? fs.readFileSync(from, "utf8").replace(/^﻿/, "").split(/\r?\n/).map((l) => l.replace(/^\[[^\]]*\]\s*/, "").trim()).filter(Boolean)
  : (demo.steps ?? []).map((s) => s.say.trim());
if (!lines.length) { console.error("✗ no lines: give demo.json steps with \"say\", or --from=<script.txt>"); process.exit(1); }
const font = fs.readFileSync(path.join(WS, "assets", "fonts", "bengali", "HindSiliguri-SemiBold.ttf")).toString("base64");
const title = demo.title ?? path.basename(proj);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const html = `<!doctype html>
<html lang="bn">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>টেলিপ্রম্পটার: ${esc(title)}</title>
<style>
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url(data:font/ttf;base64,${font}) format("truetype"); font-display: block; }
:root { --size: 64px; --top: 9vh; }
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: #0B0B0E; color: #F4F4F6; font-family: "Hind Siliguri", sans-serif; font-weight: 600; overflow: hidden; }
.screen { position: absolute; inset: 0; display: none; }
.screen.on { display: block; }
#start { overflow-y: auto; padding: 6vh 7vw; }
h1 { font-size: 44px; line-height: 1.35; margin: 0 0 6px; }
.sub { font-size: 26px; color: #A9ADB8; margin: 0 0 28px; }
.check { display: flex; gap: 18px; align-items: flex-start; padding: 14px 18px; margin: 0 0 10px; border-radius: 14px; background: #15151A; cursor: pointer; font-size: 28px; line-height: 1.45; user-select: none; }
.check .box { flex: none; width: 34px; height: 34px; margin-top: 5px; border-radius: 9px; border: 3px solid #5A5E69; }
.check.done { color: #8D919C; }
.check.done .box { border-color: #F2B84B; background: #F2B84B; }
.keys { font-size: 24px; color: #A9ADB8; line-height: 1.6; margin: 22px 0; }
.keys b { color: #F2B84B; font-weight: 600; }
button { font: 600 32px/1 "Hind Siliguri", sans-serif; color: #1A1408; background: #F2B84B; border: 0; border-radius: 16px; padding: 18px 40px 20px; cursor: pointer; }
#read { cursor: pointer; }
#stage { position: absolute; left: 6vw; right: 6vw; top: var(--top); }
#now { font-size: var(--size); line-height: 1.5; text-align: center; text-wrap: balance; transition: opacity 0.12s; }
#next { margin-top: calc(var(--size) * 0.7); font-size: calc(var(--size) * 0.62); line-height: 1.5; color: #6E727D; text-align: center; text-wrap: balance; }
.en { color: #F2B84B; }
#count { position: fixed; right: 3vw; top: 2.4vh; font-size: 26px; color: #8D919C; }
#hint { position: fixed; left: 0; right: 0; bottom: 2.6vh; text-align: center; font-size: 24px; color: #6E727D; }
#end { padding: 12vh 8vw; }
#end h1 { font-size: 64px; color: #F2B84B; }
#end p { font-size: 32px; line-height: 1.6; max-width: 1200px; }
body.mirror .screen { transform: scaleX(-1); }
</style>
</head>
<body>
<div class="screen on" id="start">
  <h1>টেলিপ্রম্পটার: ${esc(title)}</h1>
  <p class="sub">${bn(lines.length)}টা লাইন। রেকর্ড শুরুর আগে নিচের কাজগুলো সেরে নিন (ছুঁলেই টিক পড়বে)।</p>
  <div class="check"><span class="box"></span><span>ফোন খাড়া করে ল্যাপটপের স্ক্রিনের ঠিক সামনে রাখুন। ক্যামেরা চোখের সমান উঁচুতে, মুখ থেকে এক হাত দূরে।</span></div>
  <div class="check"><span class="box"></span><span>ক্যামেরা: 4K, 30fps। HDR বন্ধ (Settings › Camera › Record Video)।</span></div>
  <div class="check"><span class="box"></span><span>আলো মুখের দিকে (জানালা সামনে বা পাশে), পেছনে নয়। ফ্যান বন্ধ। ল্যাভ মাইক থাকলে জামায় লাগান।</span></div>
  <div class="check"><span class="box"></span><span>রেকর্ড চালু করে ৩ সেকেন্ড চুপ থাকুন, তারপর লাইন পড়া শুরু করুন। প্রতিটা লাইনের পর এক সেকেন্ড থামুন।</span></div>
  <div class="check"><span class="box"></span><span>ভুল হলে থামবেন না। বাক্যটা আবার শুরু থেকে বলুন। শেষের ভালো অংশটাই রাখা হবে।</span></div>
  <p class="keys"><b>Space</b> বা <b>→</b> = পরের লাইন · <b>←</b> = আগের লাইন · <b>+ / −</b> = লেখা বড়/ছোট · <b>↑ / ↓</b> = লেখা উপরে/নিচে · <b>F</b> = পুরো পর্দা</p>
  <button id="go">শুরু করুন (Space)</button>
</div>
<div class="screen" id="read">
  <div id="count"></div>
  <div id="stage"><div id="now"></div><div id="next"></div></div>
  <div id="hint">লাইন শেষ হলে এক সেকেন্ড থেমে Space চাপুন · ভুল হলে বাক্যটা আবার বলুন</div>
</div>
<div class="screen" id="end">
  <h1>শেষ!</h1>
  <p>রেকর্ডিং আরো ২ সেকেন্ড চালিয়ে রেখে তারপর বন্ধ করুন।</p>
  <p>ফোনের ভিডিওটা কম্পিউটারের <span class="en">Downloads/Claude Video Create</span> ফোল্ডারে রেখে আমাকে বলুন। বাকি কাজ আমার।</p>
  <p style="color:#6E727D;font-size:26px">আবার পড়তে চাইলে <b style="color:#F2B84B">Home</b> চাপুন।</p>
</div>
<script>
const LINES = ${JSON.stringify(lines)};
const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const gold = (s) => esc(s).replace(/([A-Za-z][A-Za-z0-9 .\\-#/]*[A-Za-z0-9])/g, '<span class="en">$1</span>');
const store = { get(k, d) { try { const v = localStorage.getItem("tp." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("tp." + k, JSON.stringify(v)); } catch {} } };
let size = store.get("size", 64), lift = store.get("top", 9), at = -1; // not "top": window.top is taken
const root = document.documentElement;
const apply = () => { root.style.setProperty("--size", size + "px"); root.style.setProperty("--top", lift + "vh"); store.set("size", size); store.set("top", lift); };
apply();
const show = (id) => document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("on", s.id === id));
let swap = 0;
function go(i) {
  at = Math.max(0, Math.min(LINES.length, i));
  clearTimeout(swap);
  if (at === LINES.length) return show("end");
  show("read");
  const now = document.getElementById("now"), text = LINES[at];
  now.style.opacity = 0;
  swap = setTimeout(() => { now.innerHTML = gold(text); now.style.opacity = 1; }, 90);
  document.getElementById("next").innerHTML = at + 1 < LINES.length ? gold(LINES[at + 1]) : "(শেষ লাইন)";
  document.getElementById("count").textContent = bn(at + 1) + " / " + bn(LINES.length);
}
document.querySelectorAll(".check").forEach((c) => c.addEventListener("click", () => c.classList.toggle("done")));
document.getElementById("go").addEventListener("click", (e) => { e.stopPropagation(); go(0); });
document.getElementById("read").addEventListener("click", (e) => go(e.clientX < innerWidth / 3 ? at - 1 : at + 1));
addEventListener("keydown", (e) => {
  const k = e.key;
  if ([" ", "ArrowRight", "PageDown", "Enter"].includes(k)) { e.preventDefault(); go(at < 0 ? 0 : at + 1); }
  else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); if (at >= 0) go(at - 1); }
  else if (k === "+" || k === "=") { size = Math.min(120, size + 4); apply(); }
  else if (k === "-" || k === "_") { size = Math.max(36, size - 4); apply(); }
  else if (k === "ArrowUp") { e.preventDefault(); lift = Math.max(2, lift - 2); apply(); }
  else if (k === "ArrowDown") { e.preventDefault(); lift = Math.min(60, lift + 2); apply(); }
  else if (k === "m" || k === "M") document.body.classList.toggle("mirror");
  else if (k === "f" || k === "F") { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); }
  else if (k === "Home") { at = -1; show("start"); }
});
</script>
</body>
</html>
`;
const out = path.join(proj, "teleprompter.html");
fs.writeFileSync(out, html);
console.log(`✓ ${out}: ${lines.length} lines (${Math.round(html.length / 1024)} KB, font inside)`);

// --check: open it in headless Chrome on two laptop sizes and walk every line: no script error, the font loaded,
// every line fits on screen, the end screen comes (a `let top` once broke the whole page: window.top is taken)
if (argv.includes("--check")) {
  const { createRequire } = await import("node:module");
  const HF = path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/";
  const puppeteer = createRequire(HF)("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const bad = [];
  for (const [w, h] of [[1536, 864], [1366, 768]]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h });
    page.on("pageerror", (e) => bad.push(`${w}×${h}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") bad.push(`${w}×${h}: ${m.text()}`); });
    await page.goto("file:///" + path.resolve(out).replaceAll("\\", "/"), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.evaluate(() => [...document.fonts].some((f) => f.family.includes("Hind") && f.status === "loaded")))) bad.push(`${w}×${h}: the font did not load`);
    for (let i = 0; i < lines.length; i++) {
      await page.keyboard.press("Space");
      await new Promise((r) => setTimeout(r, 160));
      const fits = await page.evaluate(() => document.getElementById("stage").getBoundingClientRect().bottom <= innerHeight - 40);
      if (!fits) bad.push(`${w}×${h}: line ${i + 1} runs off the screen at the default size`);
    }
    await page.keyboard.press("Space");
    if (!(await page.evaluate(() => document.getElementById("end").classList.contains("on")))) bad.push(`${w}×${h}: the end screen did not come`);
    await page.close();
  }
  await browser.close();
  if (bad.length) { console.error(`✗ teleprompter check:\n  ${bad.join("\n  ")}`); process.exit(1); }
  console.log("✓ check: no errors, font loaded, every line fits, end screen reached (1536×864, 1366×768)");
}
