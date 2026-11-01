#!/usr/bin/env node
// capture.mjs — the "robot cameraman": runs a project's demo.json in a real Chrome and saves every screen STATE
// (a PNG at 2× pixel density, so a 2× camera zoom stays sharp), the exact box of every element it clicks or types
// into, the scroll position and the page address, into <project>/assets/media/capture/ + capture.json.
// No screen recording, no cursor tracking, no OCR: the browser itself says where everything is.
//   node tools/autocap/capture.mjs projects/<name> [--headed]
// demo.json (data only; the composer reads the same file):
//   { "url": "https://…", "viewport": [1440, 810], "dpr": 2,
//     "steps": [ { "id": "search", "do": "click", "target": { "css": "#search-bar-entry" }, "say": "…" }, … ] }
//   do: goto (url) · click · hover · type (text; into the focused field, or target) · press (key) · scroll (target)
//       · wait (ms)
//   target: { "css": "…" } | { "text": "…" } | { "aria": "…" }, optional "nth" (0-based) when several are visible.
//   A target must match exactly ONE visible element (or name "nth"): otherwise it stops and lists the candidates.
// Guards (it stops, it never works around them): a CAPTCHA / "verify you are human" / access-denied page, a target
// that is missing, hidden or ambiguous, a state that never settles (network + DOM + animations + scroll quiet).
// The text caret is hidden while capturing (it blinks, so frames would flicker); the composer can draw one.
// Puppeteer comes from the pinned HyperFrames install (no new package); Chrome is the installed Google Chrome.
// --headed shows the robot working in a visible Chrome (for watching; into capture-headed/); capture the delivered video headless: the two
// modes differ by a few px (the same TOC jump landed at scrollY 4978 headed, 4984 headless; headless repeats exactly).
// Verified 2026-11-01 on code.claude.com/docs (projects/autotut-proof): 5 steps, 17 states in 36–45 s, both modes.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const HF = path.join(process.env.LOCALAPPDATA || "C:/Users/Zubayer Nibir/AppData/Local", "Programs", "nodejs", "node_modules", "hyperframes") + "/";
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
const WALL = /verify you are human|are you a robot|captcha|unusual traffic|access denied|just a moment\.\.\./i;

const argv = process.argv.slice(2);
const proj = argv.find((a) => !a.startsWith("--"));
if (!proj) { console.error("usage: node tools/autocap/capture.mjs projects/<name> [--headed]"); process.exit(1); }
const demo = JSON.parse(fs.readFileSync(path.join(proj, "demo.json"), "utf8").replace(/^\uFEFF/, ""));
// --headed is for watching: it writes to capture-headed/, so the headless capture the video is built from stays put
const outDir = path.join(proj, "assets", "media", argv.includes("--headed") ? "capture-headed" : "capture");
fs.mkdirSync(path.join(outDir, "shots"), { recursive: true });

let puppeteer;
try { puppeteer = createRequire(HF)("puppeteer-core"); } catch { console.error(`✗ puppeteer-core not found under ${HF} (it ships with the HyperFrames CLI)`); process.exit(1); }
if (!CHROME) { console.error("✗ no Chrome or Edge found"); process.exit(1); }

const [VW, VH] = demo.viewport ?? [1440, 810];
const DPR = demo.dpr ?? 2;
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: !argv.includes("--headed"),
  args: ["--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--lang=en-US", "--force-color-profile=srgb"],
  defaultViewport: { width: VW, height: VH, deviceScaleFactor: DPR },
});
const page = (await browser.pages())[0] ?? (await browser.newPage());
const stop = async (msg) => { console.error(`✗ ${msg}`); await page.screenshot({ path: path.join(outDir, "STOPPED.png") }).catch(() => {}); await browser.close(); process.exit(2); };

// quiet = no network for 400 ms, then no DOM change, no running finite animation and no scroll movement for `quiet` ms
async function settle(quiet = 450, max = 9000) {
  await page.waitForNetworkIdle({ idleTime: 400, timeout: max }).catch(() => {});
  const ok = await page.evaluate(async (quiet, max) => {
    await document.fonts.ready;
    const t0 = performance.now();
    let last = t0, y = scrollY;
    const mo = new MutationObserver(() => (last = performance.now()));
    mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    let done = false;
    while (performance.now() - t0 < max) {
      await new Promise((r) => requestAnimationFrame(r));
      if (scrollY !== y) { y = scrollY; last = performance.now(); }
      const busy = document.getAnimations().some((a) => a.playState === "running" && a.effect?.getComputedTiming?.().iterations !== Infinity);
      if (busy) last = performance.now();
      if (performance.now() - last > quiet) { done = true; break; }
    }
    mo.disconnect();
    return done;
  }, quiet, max);
  if (!ok) console.log(`  ⚠ did not settle within ${max} ms (shot taken anyway)`);
  await page.addStyleTag({ content: "*{caret-color:transparent !important}" }).catch(() => {});
  const body = await page.evaluate(() => document.body?.innerText.slice(0, 5000) ?? "");
  if (WALL.test(body)) await stop(`a bot wall / CAPTCHA page at ${page.url()} — this site does not allow the robot; use assist mode (a person clicks) or another site`);
}

// one visible element for a target, else stop with the candidates (onScreen: inside the viewport too — a click needs
// that; a scroll target may be below the fold). soft: return null instead of stopping (marks).
async function resolve(target, stepId, { onScreen = true, soft = false } = {}) {
  const sel = target.css ?? (target.text ? `::-p-text(${target.text})` : target.aria ? `::-p-aria(${target.aria})` : null);
  if (!sel) await stop(`step ${stepId}: target needs css, text or aria`);
  const all = await page.$$(sel);
  const vis = [];
  for (const el of all) {
    const b = await el.boundingBox();
    const inView = !onScreen || (b && b.y + b.height > 0 && b.y < VH && b.x + b.width > 0 && b.x < VW);
    const shown = b && inView && b.width > 1 && b.height > 1 && (await el.evaluate((n) => { const s = getComputedStyle(n); return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; }));
    if (shown) vis.push({ el, b });
  }
  if (!vis.length && soft) return null;
  if (!vis.length) await stop(`step ${stepId}: no visible element for ${sel} (${all.length} hidden or off screen)`);
  if (vis.length > 1 && target.nth === undefined && !soft) {
    const list = await Promise.all(vis.slice(0, 8).map(async (v, i) => `  [${i}] ${(await v.el.evaluate((n) => (n.innerText || n.getAttribute("aria-label") || n.tagName).trim().slice(0, 50)))} @ ${[v.b.x, v.b.y, v.b.width, v.b.height].map(Math.round)}`));
    await stop(`step ${stepId}: ${vis.length} visible elements match ${sel} — add "nth":\n${list.join("\n")}`);
  }
  return vis[target.nth ?? 0];
}

const box = (b) => [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1));
let n = 0;
const shot = async (step, tag) => {
  const file = `shots/${String(n++).padStart(2, "0")}-${step.id}-${tag}.png`;
  await page.screenshot({ path: path.join(outDir, file) });
  return file;
};
const state = async () => page.evaluate(() => ({ url: location.href, scrollY: Math.round(scrollY) }));

const out = { url: demo.url, viewport: [VW, VH], dpr: DPR, chrome: await browser.version(), at: new Date().toISOString(), steps: [] };
const t0 = Date.now();
for (const step of demo.steps) {
  const rec = { id: step.id, do: step.do };
  if (step.do === "goto") {
    const url = step.url ?? demo.url;
    const r = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => stop(`step ${step.id}: ${e.message}`));
    if (r && r.status() >= 400) await stop(`step ${step.id}: HTTP ${r.status()} for ${url}`);
    await settle(700);
    rec.after = await shot(step, "after");
  } else if (step.do === "click" || step.do === "hover") {
    const { el } = await resolve(step.target, step.id);
    await el.scrollIntoView();
    await settle(300);
    const b = await el.boundingBox();
    rec.box = box(b);
    const at = step.at ?? [0.5, 0.5];
    rec.point = [+(b.x + b.width * at[0]).toFixed(1), +(b.y + b.height * at[1]).toFixed(1)];
    rec.before = await shot(step, "before");
    await page.mouse.move(rec.point[0], rec.point[1], { steps: 4 });
    await settle(250, 3000);
    rec.hover = await shot(step, "hover");
    if (step.do === "click") {
      await page.mouse.down(); await page.mouse.up();
      await settle(step.quiet ?? 600);
      rec.after = await shot(step, "after");
    }
  } else if (step.do === "type") {
    if (step.target) { const { el } = await resolve(step.target, step.id); await el.focus(); }
    const b = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    if (!b) await stop(`step ${step.id}: nothing is focused to type into (click a field first or give a target)`);
    rec.box = box(b);
    rec.text = step.text;
    rec.frames = [];
    for (const ch of [...step.text]) {
      await page.keyboard.type(ch);
      await settle(200, 2500);
      rec.frames.push(await shot(step, `k${rec.frames.length + 1}`));
    }
    await settle(step.quiet ?? 800);
    rec.after = await shot(step, "after");
  } else if (step.do === "press") {
    await page.keyboard.press(step.key);
    await settle(step.quiet ?? 600);
    rec.after = await shot(step, "after");
  } else if (step.do === "scroll") {
    const { el } = await resolve(step.target, step.id, { onScreen: false });
    await el.evaluate((n) => n.scrollIntoView({ block: "center", behavior: "instant" }));
    await settle(500);
    rec.box = box(await el.boundingBox());
    rec.after = await shot(step, "after");
  } else if (step.do === "wait") {
    await new Promise((r) => setTimeout(r, step.ms ?? 1000));
    await settle();
    rec.after = await shot(step, "after");
  } else await stop(`step ${step.id}: unknown do "${step.do}"`);
  // mark: an element to point at AFTER the action (where the eye should go next: a heading the click scrolled to)
  if (step.mark) {
    const m = await resolve(step.mark, step.id, { soft: true });
    // the TEXT's own box (a heading's element box spans the whole column)
    const tight = m && (await m.el.evaluate((n) => { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return b.width > 1 ? { x: b.x, y: b.y, width: b.width, height: b.height } : null; }));
    if (m) rec.mark = box(tight ?? m.b); else console.log(`  ⚠ ${step.id}: mark not on screen after the action`);
  }
  Object.assign(rec, await state());
  out.steps.push(rec);
  console.log(`✓ ${step.id} (${step.do})${rec.box ? " box " + rec.box.join(",") : ""}${rec.frames ? " · " + rec.frames.length + " key frames" : ""} · ${rec.url.replace(/^https?:\/\//, "").slice(0, 60)} y=${rec.scrollY}`);
}
await browser.close();
fs.writeFileSync(path.join(outDir, "capture.json"), JSON.stringify(out, null, 1));
console.log(`✓ capture.json: ${out.steps.length} steps, ${n} states in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${outDir}`);
