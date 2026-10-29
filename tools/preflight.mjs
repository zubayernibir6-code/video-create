// preflight.mjs — the checks to run BEFORE a long render, so mistakes cost minutes instead of a 2-hour render.
// It reads the page's own GSAP timeline (no guessing from the source code) and the clips under it:
//
//   node tools/preflight.mjs <project> [--from=<s>] [--to=<s>] [--step=0.1] [--max=150] [--no-snap] [--json]
//   (--from/--to: re-check one changed stretch in a minute; only a whole-video run counts for finish.mjs)
//
//   ERROR from_only     a fromTo sets a property (x, y …) only in its FROM vars on an element that other tweens move
//                       too: in a seeked render the element kept the PREVIOUS tween's value (5 of 128 click rings sat
//                       on an earlier click, claude-video-tutorial 2026-10-29). Put the key in both vars.
//   ERROR shown_early   an element is on screen just before its own fade-in starts, then vanishes and comes in
//                       again (the "CLAUDE MAX POWER" title showed, blinked out, slammed in). Hide it in CSS.
//   WARN  snap          a visible element jumps at the start of a fromTo (x/y/scale/rotation differ from the FROM
//                       values): a bar that was full snaps empty. Fine when it hides a cut on purpose.
//   WARN  under_changed an overlay inside a clip's layer (a label on the screen recording) stays up while the
//                       picture under it changes a lot: the label outlived its window (a highlight box 1 s past a
//                       cut, a pill over the next app). Only overlays up ≥ 1 s; a click ring changes what it hits.
//   INFO  clip_end      a clip ends while its layer is still visible: look at what shows there (the first-frame
//                       poster came back while the monitor flew off).
// Then it snapshots every overlay at its held moment (hyperframes snapshot) into <project>/.preflight/ as contact
// sheets: LOOK AT THEM (labels on text, pills off target, tick sizes) before rendering. finish.mjs refuses a render
// over 60 s without a preflight of the current index.html (--no-preflight overrides).
// Writes <project>/.preflight/report.json { ok, hash, findings, moments }. Exit 1 on ERROR.
// Element names: #id, else the nearest #id ancestor + classes. Silence one element with data-preflight-ignore.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openProject } from "./hf-page.mjs";

const args = process.argv.slice(2);
const dir = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const flag = (k) => args.includes(`--${k}`);
const NCC_MIN = Number(opt("ncc", 0.55)); // calibrated 2026-10-29: labels that outlived their window 0.10 and 0.49, correct ones 0.66–1.00
const STEP = Number(opt("step", 0.1)), MAX = Number(opt("max", 150)), FROM = Number(opt("from", 0));
const OUT = path.join(dir, ".preflight");

// what the build is: index.html + every clip it plays (a re-encoded clip changes what the sheets show)
export function buildHash(projectDir) {
  const html = readFileSync(path.join(projectDir, "index.html"), "utf8");
  const h = createHash("sha1").update(html);
  for (const m of html.matchAll(/<(?:video|audio|img)[^>]*\ssrc="([^"]+)"/g)) {
    const f = path.join(projectDir, m[1]);
    if (existsSync(f)) { const s = statSync(f); h.update(`${m[1]}:${s.size}:${s.mtimeMs}`); }
  }
  return h.digest("hex");
}
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) await main(); // finish.mjs imports buildHash only

async function main() {
  const t0 = Date.now();
  const findings = [];
  const hit = (code, sev, el, t, msg) => findings.push({ code, sev, el, t: +t.toFixed(3), msg });
  const proj = await openProject(dir);
  const dur = Math.min(proj.duration, Number(opt("to", proj.duration)));
  let tweens, clips, samples = [];
  try {
    // ── the timeline, tween by tween ──
    ({ tweens, clips } = await proj.page.evaluate(() => {
      const SKIP = new Set(["duration", "ease", "delay", "immediateRender", "startAt", "onUpdate", "onComplete", "onStart", "repeat", "yoyo", "overwrite",
        "stagger", "id", "paused", "runBackwards", "data", "callbackScope", "lazy", "inherit", "repeatDelay", "onRepeat", "keyframes"]);
      let n = 0;
      const name = (el) => {
        if (el.id) return "#" + el.id;
        let p = el.parentElement; while (p && !p.id) p = p.parentElement;
        const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : el.tagName.toLowerCase();
        return (p ? "#" + p.id + " " : "") + cls;
      };
      const tag = (el) => (el.dataset.pf ||= String(++n));
      const plain = (v) => Object.fromEntries(Object.entries(v || {}).filter(([k, x]) => !SKIP.has(k) && (typeof x === "number" || typeof x === "string")));
      const tweens = [];
      for (const [tlName, tl] of Object.entries(window.__timelines || {})) {
        const host = document.querySelector(`[data-composition-id="${tlName}"]`);
        const off = tlName === "main" ? 0 : parseFloat(host?.getAttribute("data-start") || "0") || 0;
        for (const tw of tl.getChildren(true, true, false)) {
          let start = tw.startTime(), p = tw.parent;
          while (p && p !== tl) { start += p.startTime(); p = p.parent; }
          const els = tw.targets().filter((x) => x instanceof Element && !x.closest("[data-preflight-ignore]"));
          if (!els.length) continue;
          tweens.push({ start: start + off, dur: tw.duration(), from: tw.vars.startAt ? plain(tw.vars.startAt) : null, to: plain(tw.vars),
            ir: tw.vars.immediateRender, els: els.map((e) => ({ pf: tag(e), name: name(e) })) });
        }
      }
      const clips = [...document.querySelectorAll("video[data-start]")].map((v) => ({ pf: tag(v), name: name(v), src: v.getAttribute("src"),
        start: parseFloat(v.getAttribute("data-start")), dur: parseFloat(v.getAttribute("data-duration")), ms: parseFloat(v.getAttribute("data-media-start") || "0") }));
      return { tweens, clips };
    }));

    // from_only: a key only in the FROM vars, on an element other tweens also set that key on
    const setters = new Map(); // pf|key → count
    for (const tw of tweens) for (const e of tw.els) for (const k of new Set([...Object.keys(tw.to), ...Object.keys(tw.from || {})])) setters.set(`${e.pf}|${k}`, (setters.get(`${e.pf}|${k}`) ?? 0) + 1);
    const fromOnly = new Map();
    for (const tw of tweens) if (tw.from) for (const k of Object.keys(tw.from)) if (!(k in tw.to)) for (const e of tw.els)
      if ((setters.get(`${e.pf}|${k}`) ?? 0) > 1) { if (!fromOnly.has(e.name)) fromOnly.set(e.name, { e, keys: new Set(), t: tw.start, tws: new Set() }); const o = fromOnly.get(e.name); o.keys.add(k); o.tws.add(tw); }
    for (const { e, keys, t, tws } of fromOnly.values()) hit("from_only", "error", e.name, t, `${[...keys].join(", ")} set only in the FROM vars of ${tws.size} fromTo tween(s) on an element other tweens also move: a seeked render can keep the previous value. Put them in the TO vars too.`);

    // shown_early + snap: the state one frame before each fromTo starts
    const NUM = ["x", "y", "xPercent", "yPercent", "scale", "scaleX", "scaleY", "rotation", "opacity", "autoAlpha"];
    const checks = tweens.filter((tw) => tw.from && tw.ir === false && tw.start > Math.max(0.05, FROM) && tw.start < dur && Object.keys(tw.from).some((k) => NUM.includes(k)));
    for (const tw of checks) {
      await proj.seek(tw.start - 0.017);
      const st = await proj.page.evaluate(({ pfs, keys }) => pfs.map((pf) => {
        const el = document.querySelector(`[data-pf="${pf}"]`);
        if (!el) return null;
        let op = 1, vis = true;
        for (let a = el; a && a.nodeType === 1; a = a.parentElement) { const cs = getComputedStyle(a); op *= parseFloat(cs.opacity); if (cs.visibility === "hidden" || cs.display === "none") vis = false; }
        let r = el.getBoundingClientRect(); let L = Math.max(0, r.left), T = Math.max(0, r.top), R = Math.min(innerWidth, r.right), B = Math.min(innerHeight, r.bottom);
        for (let a = el.parentElement; a && a.nodeType === 1; a = a.parentElement) {
          if (getComputedStyle(a).overflow === "visible") continue;
          const q = a.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom);
        }
        const area = Math.max(0, R - L) * Math.max(0, B - T);
        const own = parseFloat(getComputedStyle(el).opacity);
        return { seen: vis && area > 4 ? op : 0, own, vals: Object.fromEntries(keys.map((k) => [k, k === "autoAlpha" ? own : Number(window.gsap.getProperty(el, k))])) };
      }), { pfs: tw.els.map((e) => e.pf), keys: Object.keys(tw.from).filter((k) => NUM.includes(k)) });
      tw.els.forEach((e, i) => {
        const s = st[i]; if (!s || s.seen < 0.1) return;
        const fa = tw.from.autoAlpha ?? tw.from.opacity;
        if (fa !== undefined && Number(fa) <= 0.05 && s.own >= 0.5) { hit("shown_early", "error", e.name, tw.start, `on screen (opacity ${s.seen.toFixed(2)}) just before its entrance at ${tw.start.toFixed(2)} s, which starts it from 0: it blinks out and comes in again. Hide it before (CSS visibility:hidden; opacity:0).`); return; }
        const tol = { x: 2, y: 2, xPercent: 1, yPercent: 1, rotation: 1, scale: 0.02, scaleX: 0.02, scaleY: 0.02 };
        const bad = Object.entries(s.vals).filter(([k, v]) => k in tol && Number.isFinite(v) && Math.abs(v - Number(tw.from[k])) > tol[k]);
        if (bad.length) hit("snap", "warn", e.name, tw.start, `visible and jumps at ${tw.start.toFixed(2)} s: ${bad.map(([k, v]) => `${k} ${+v.toFixed(2)} → ${tw.from[k]}`).join(", ")}. Set the starting value earlier, unless the jump hides a cut on purpose.`);
      });
    }

    // ── sample visibility of every animated element (and its box relative to its clip) ──
    const watched = [...new Map(tweens.flatMap((tw) => tw.els).map((e) => [e.pf, e])).values()];
    for (let t = FROM; t < dur - 0.001; t = Math.round((t + STEP) * 1000) / 1000) {
      await proj.seek(t);
      samples.push(await proj.page.evaluate(({ pfs, clipPfs }) => {
        const vid = clipPfs.map((pf) => document.querySelector(`[data-pf="${pf}"]`));
        return pfs.map((pf) => {
          const el = document.querySelector(`[data-pf="${pf}"]`);
          if (!el) return 0;
          let op = 1;
          for (let a = el; a && a.nodeType === 1; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.visibility === "hidden" || cs.display === "none") return 0; op *= parseFloat(cs.opacity); }
          if (op < 0.3) return 0;
          const r = el.getBoundingClientRect(); if (r.width * r.height < 4) return 0;
          const ci = vid.findIndex((v) => v && v.parentElement && v.parentElement.contains(el) && !el.contains(v)); // layers holding the clip (a camera) are not overlays
          if (ci < 0) return [op];
          const q = vid[ci].getBoundingClientRect();
          let L = r.left, T = r.top, R = r.right, B = r.bottom;
          for (const d of el.querySelectorAll("*")) { const u = d.getBoundingClientRect(); if (u.width * u.height < 1) continue; L = Math.min(L, u.left); T = Math.min(T, u.top); R = Math.max(R, u.right); B = Math.max(B, u.bottom); }
          return [op, ci, (L - q.left) / q.width, (T - q.top) / q.height, (R - L) / q.width, (B - T) / q.height];
        });
      }, { pfs: watched.map((e) => e.pf), clipPfs: clips.map((c) => c.pf) }));
    }
    // clip_end: the clip's parent still visible just after it ends
    for (const c of clips) {
      const end = c.start + c.dur;
      if (end > dur - 0.05 || end < FROM) continue;
      await proj.seek(end + 0.05);
      const seen = await proj.page.evaluate((pf) => {
        const v = document.querySelector(`[data-pf="${pf}"]`); let op = 1;
        for (let a = v.parentElement; a && a.nodeType === 1; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.visibility === "hidden" || cs.display === "none") return 0; op *= parseFloat(cs.opacity); }
        return op;
      }, c.pf);
      if (seen > 0.05) hit("clip_end", "info", c.name, end, `the clip ends at ${end.toFixed(2)} s but its layer is still visible (opacity ${seen.toFixed(2)}): check what shows in its place (a poster image, black).`);
    }
  } finally {
    await proj.close();
  }

  // ── spans: when each element is up ──
  const watched = [...new Map(tweens.flatMap((tw) => tw.els).map((e) => [e.pf, e])).values()];
  const spans = [];
  watched.forEach((e, j) => {
    let a = null;
    samples.forEach((row, i) => {
      const on = row[j] !== 0;
      if (on && a === null) a = i;
      if ((!on || i === samples.length - 1) && a !== null) { spans.push({ e, a: FROM + a * STEP, b: FROM + (on ? i + 1 : i) * STEP, rows: samples.slice(a, on ? i + 1 : i).map((r) => r[j]) }); a = null; }
    });
  });

  // under_changed: the clip pixels under an overlay (inside the clip's layer) change a lot while it is up
  const W = 240, H = 135;
  const clipFrames = new Map();
  const gray = (c) => {
    if (clipFrames.has(c.src)) return clipFrames.get(c.src);
    const r = spawnSync("ffmpeg", ["-v", "error", "-ss", String(c.ms), "-t", String(c.dur), "-i", path.join(dir, c.src), "-vf", `fps=${1 / STEP},scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
    const buf = r.stdout ?? Buffer.alloc(0);
    clipFrames.set(c.src, buf);
    return buf;
  };
  const region = (buf, k, x, y, w, h) => {
    const off = k * W * H; if (off + W * H > buf.length) return null;
    const x0 = Math.max(0, Math.floor((x - w / 2) * W)), x1 = Math.min(W, Math.ceil((x + w * 1.5) * W)), y0 = Math.max(0, Math.floor((y - h / 2) * H)), y1 = Math.min(H, Math.ceil((y + h * 1.5) * H)); // box ± half its size
    const out = []; for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) out.push(buf[off + yy * W + xx]);
    return out;
  };
  const ncc = (a, b) => { // Pearson correlation of two grey patches; a flat patch counts as unchanged
    const n = a.length; let ma = 0, mb = 0; for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
    let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < n; i++) { const p = a[i] - ma, q = b[i] - mb; sab += p * q; saa += p * p; sbb += q * q; }
    const fa = saa < n * 9, fb = sbb < n * 9; // flat = grey std < 3 (an empty list area)
    if (fa && fb) return 1;
    if (fa !== fb) return (fa ? sbb : saa) > n * 144 ? 0 : 1; // empty → real content (std > 12) is a change; a cursor passing is not
    return sab / Math.sqrt(saa * sbb);
  };
  for (const s of spans) {
    if (s.b - s.a < 1 || !Array.isArray(s.rows[0]) || s.rows[0].length < 6) continue;
    const c = clips[s.rows[0][1]], buf = gray(c);
    const [, , x, y, w, h] = s.rows[Math.min(s.rows.length - 1, Math.round(0.3 / STEP))];
    const k0 = Math.round((s.a + 0.3 - c.start) / STEP), ref = region(buf, k0, x, y, w, h);
    if (!ref || !ref.length) continue;
    let minR = 1;
    for (let i = Math.round(0.3 / STEP); i < s.rows.length; i++) {
      const k = Math.round((s.a + i * STEP - c.start) / STEP), cur = region(buf, k, x, y, w, h);
      if (!cur) break;
      const r = ncc(ref, cur); minR = Math.min(minR, r);
      if (r < NCC_MIN) { hit("under_changed", "warn", s.e.name, s.a + i * STEP, `up ${s.a.toFixed(2)}–${s.b.toFixed(2)} s, but the picture under it turns into something else at ~${(s.a + i * STEP).toFixed(2)} s (correlation ${r.toFixed(2)}): it may outlive its window. Look at that moment.`); break; }
    }
    if (process.env.PREFLIGHT_DEBUG) console.log(`  span ${s.e.name} ${s.a.toFixed(2)}–${s.b.toFixed(2)} min corr ${minR.toFixed(2)}`);
  }

  // ── moments to look at: every overlay at its held middle, long ones near their end too ──
  let moments = [];
  for (const s of spans) {
    if (s.b - s.a < 0.3 || s.b - s.a > 60) continue;
    moments.push(+((s.a + s.b) / 2).toFixed(2));
    if (s.b - s.a > 3) moments.push(+(s.b - 0.25).toFixed(2));
  }
  for (const f of findings) if (f.code !== "from_only") moments.push(+(f.t + 0.05).toFixed(2));
  moments = [...new Set(moments)].sort((a, b) => a - b).filter((t, i, arr) => i === 0 || t - arr[i - 1] >= 0.4);
  if (moments.length > MAX) {
    const keep = new Set(findings.map((f) => +(f.t + 0.05).toFixed(2)));
    const rest = moments.filter((t) => !keep.has(t)), stride = rest.length / Math.max(1, MAX - keep.size);
    const picked = rest.filter((_, i) => Math.floor(i / stride) !== Math.floor((i - 1) / stride));
    console.log(`  ! ${moments.length} moments, showing ${Math.min(moments.length, MAX)} (every ${stride.toFixed(1)}th held moment kept; raise --max to see all)`);
    moments = [...new Set([...keep, ...picked])].sort((a, b) => a - b).slice(0, MAX);
  }

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  let sheets = [];
  if (!flag("no-snap") && moments.length) {
    // npx is a .cmd on Windows, which needs a shell: quote the paths ("Video Create" has a space)
    const q = (s) => `"${s}"`;
    for (let i = 0; i < moments.length; i += 30) {
      const sub = path.join(OUT, `snap-${String(i / 30 + 1).padStart(2, "0")}`);
      const cmd = ["npx", "hyperframes", "snapshot", q(dir), "-o", q(sub), "--at", moments.slice(i, i + 30).join(","), "--no-end", "--describe", "false", "--timeout", "30000"].join(" ");
      const r = spawnSync(cmd, { encoding: "utf8", shell: true });
      if (r.status !== 0) { console.error(`✗ snapshot failed: ${(r.stderr || r.stdout).slice(-400)}`); process.exitCode = 1; }
      if (existsSync(sub)) sheets.push(...readdirSync(sub).filter((f) => f.startsWith("contact-sheet")).map((f) => path.join(sub, f)));
    }
  }

  const order = { error: 0, warn: 1, info: 2 };
  findings.sort((a, b) => order[a.sev] - order[b.sev] || a.t - b.t);
  const errors = findings.filter((f) => f.sev === "error").length;
  const report = { ok: errors === 0, whole: FROM === 0 && dur >= proj.duration - 0.01, hash: buildHash(dir), at: new Date().toISOString(), tweens: tweens.length, step: STEP, findings, moments, sheets };
  writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 1));
  if (flag("json")) { console.log(JSON.stringify(report, null, 1)); }
  else {
    console.log(`preflight: ${path.basename(dir)} — ${tweens.length} tweens, ${spans.length} overlay spans, ${samples.length} samples in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const icon = { error: "✗ ERROR", warn: "⚠ WARN ", info: "· INFO " };
    const grouped = new Map();
    for (const f of findings) { const k = `${f.code}|${f.el}`; if (!grouped.has(k)) grouped.set(k, []); grouped.get(k).push(f); }
    for (const list of grouped.values()) {
      const f = list[0];
      console.log(`  ${icon[f.sev]} ${f.code.padEnd(13)} ${f.el}  [${list.map((x) => x.t.toFixed(2)).slice(0, 8).join(", ")}${list.length > 8 ? ` +${list.length - 8}` : ""}]`);
      console.log(`           ${f.msg}`);
    }
    console.log(`  ${errors} error(s), ${findings.filter((f) => f.sev === "warn").length} warning(s) · ${moments.length} moments → ${sheets.length} contact sheet(s) in ${OUT}`);
    if (sheets.length) console.log(`  LOOK at every sheet before rendering: labels on text, pills off target, things that stay after their scene.`);
  }
  process.exitCode = errors ? 1 : process.exitCode ?? 0;
}
