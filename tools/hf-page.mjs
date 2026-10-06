// hf-page.mjs — open a HyperFrames project in the SAME bundle + headless Chrome that `hyperframes check`
// and `render` use, so a tool can seek the timeline and measure the real DOM.
//
//   import { openProject } from "./hf-page.mjs";
//   const p = await openProject(dir);  await p.seek(12.5);  await p.page.evaluate(fn);  await p.close();
//
// HyperFrames has no public API for this, so it borrows the CLI's own helpers from the installed dist
// (verified on 0.8.134). The dist is code-split and chunk file names change between versions, so the chunk
// that exports each helper is found at run time by reading the imports of dist/checkBrowser-*.js.

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const NEEDED = ["serveStaticProjectHtml", "openSettledCompositionPage", "seekCompositionTimeline", "waitForPreferredSeekTarget"];

function hfDist() {
  const roots = [];
  if (process.env.APPDATA) roots.push(path.join(process.env.APPDATA, "npm", "node_modules"));
  try { roots.push(execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()); } catch {}
  for (const r of roots) {
    const d = path.join(r, "hyperframes", "dist");
    if (existsSync(d)) return d;
  }
  throw new Error("HyperFrames CLI not found (npm install -g hyperframes)");
}

async function loadHelpers() {
  const dist = hfDist();
  const files = readdirSync(dist);
  const check = files.find((f) => /^checkBrowser-.*\.js$/.test(f));
  const bundle = files.find((f) => /^bundleWithLocalizedFonts-.*\.js$/.test(f));
  if (!check || !bundle) throw new Error(`HyperFrames internals changed (no checkBrowser/bundleWithLocalizedFonts in ${dist}) — update tools/hf-page.mjs`);
  const src = readFileSync(path.join(dist, check), "utf8");
  const from = {};
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"\.\/([^"]+)"/g)) {
    for (const name of m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) from[name] = m[2];
  }
  const helpers = {};
  for (const name of NEEDED) {
    if (!from[name]) throw new Error(`HyperFrames internals changed (${name} not imported by ${check}) — update tools/hf-page.mjs`);
    const mod = await import(pathToFileURL(path.join(dist, from[name])).href);
    if (typeof mod[name] !== "function") throw new Error(`HyperFrames internals changed (${from[name]} has no ${name})`);
    helpers[name] = mod[name];
  }
  helpers.bundleWithLocalizedFonts = (await import(pathToFileURL(path.join(dist, bundle)).href)).bundleWithLocalizedFonts;
  return helpers;
}

// Seek without the 120 ms settle `check` adds: two animation frames are enough for GSAP-driven layout.
const SEEK = { fallbackToBridgeAndTimelines: true, animationFrameSettle: "double", waitForFontsMs: 0, settleMs: 0 };

export async function openProject(projectDir, { timeoutMs = 30000 } = {}) {
  const h = await loadHelpers();
  const dir = path.resolve(projectDir);
  const html = await h.bundleWithLocalizedFonts(dir);
  const server = await h.serveStaticProjectHtml(dir, html, "Failed to bind the hf-page server", []);
  let session;
  try {
    session = await h.openSettledCompositionPage(html, server.url, {
      navigationTimeoutMs: timeoutMs, renderReadyTimeoutMs: timeoutMs, renderReadyWarningSuffix: "measuring the page",
    });
  } catch (e) {
    await server.close();
    throw e;
  }
  const page = session.page;
  await h.waitForPreferredSeekTarget(page);
  await page.evaluate(() => document.fonts?.ready);
  const duration = await page.evaluate(() => {
    const hf = window.__hf;
    if (hf && typeof hf.duration === "number" && hf.duration > 0) return hf.duration;
    const root = document.querySelector("[data-composition-id][data-duration]");
    return root ? parseFloat(root.getAttribute("data-duration")) || 0 : 0;
  });
  return {
    page,
    html,
    duration,
    seek: (t) => h.seekCompositionTimeline(page, t, SEEK),
    close: async () => {
      await session.browser.close().catch(() => {});
      await server.close();
    },
  };
}
