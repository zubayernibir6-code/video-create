#!/usr/bin/env node
// spec-check.mjs — does a rendered video meet each platform's upload rules? (release system step 1, 2026-10-30)
//
//   node tools/release/spec-check.mjs <video.mp4> [more.mp4 ...] [--for=<profile|platform>,...] [--json=out.json] [--no-loudness]
//   node tools/release/spec-check.mjs --limits=universal-reel [--w=1080 --h=1920]
//
// The rules live in tools/release/platforms.json (each with its source and level); this file only measures and compares.
// Profiles: universal-reel (one 9:16 file for Facebook Reels + Instagram Reels + YouTube Shorts + X), linkedin-clip (4:5),
// linkedin-full, youtube-main, facebook-main. A platform id (e.g. x-video) runs only that platform's rules.
// --for defaults by shape: 9:16 → universal-reel, 4:5 → linkedin-clip, wider than 1.3:1 → youtube-main,facebook-main,
// linkedin-full, anything else → every platform on its own.
// FAIL = an official hard limit is broken (the upload can be refused) · WARN = an official recommendation, an API-only
// limit or a house target · INFO = good to know · SKIP = could not be measured. Exit 1 if anything FAILs.
// --limits prints what one file must satisfy for ALL platforms of a profile: the shortest max duration, the smallest max
// size, the fps window, and the union of the safe zones in pixels (release step 2 places every text inside that box).
// Importable: import { checkFile, limits, measure } from "./spec-check.mjs".
//
// Verified 2026-10-30 on the claude-video-tutorial master (510 s, 1920x1080 60 fps) and the five Reels in
// F:/Video Create Renders/claude-reels, plus synthetic bad files (too long, 25 fps, 720x1280, mono MP3-in-MOV) that
// must FAIL the right platforms.

import { spawnSync } from "node:child_process";
import { closeSync, openSync, readFileSync, readSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { displaySize, probe } from "../qc.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const RULES = JSON.parse(readFileSync(join(HERE, "platforms.json"), "utf8"));
const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const rate = (x) => { const [n, d] = String(x || "0/1").split("/").map(Number); return d ? n / d : 0; };

// MP4 boxes: the edit lists (moov/trak/edts/elst) of every track, with the track's handler (vide/soun).
// An edit list that starts at 0 with one entry changes nothing; anything else shifts or cuts a track, which YouTube and
// the Instagram API ask uploads not to have (FFmpeg writes one for AAC's encoder delay unless told -use_editlist 0).
function editLists(file) {
  const size = statSync(file).size;
  const fh = openSync(file, "r");
  try {
    const head = Buffer.alloc(16);
    let off = 0, moov = null;
    while (off + 8 <= size) {
      if (readSync(fh, head, 0, 16, off) < 8) break;
      let s = head.readUInt32BE(0), h = 8;
      const type = head.toString("latin1", 4, 8);
      if (s === 1) { s = Number(head.readBigUInt64BE(8)); h = 16; } else if (s === 0) s = size - off;
      if (!Number.isSafeInteger(s) || s < 8) break;
      if (type === "moov") { moov = { off, s, h }; break; }
      off += s;
    }
    if (!moov) return null;
    const buf = Buffer.alloc(moov.s);
    readSync(fh, buf, 0, moov.s, moov.off);
    const kids = (start, end) => {
      const list = [];
      for (let o = start; o + 8 <= end;) {
        let s = buf.readUInt32BE(o), h = 8;
        const type = buf.toString("latin1", o + 4, o + 8);
        if (s === 1) { s = Number(buf.readBigUInt64BE(o + 8)); h = 16; } else if (s === 0) s = end - o;
        if (s < 8 || o + s > end) break;
        list.push({ type, start: o + h, end: o + s });
        o += s;
      }
      return list;
    };
    return kids(moov.h, moov.s).filter((b) => b.type === "trak").map((trak) => {
      const tk = kids(trak.start, trak.end);
      const mdia = tk.find((b) => b.type === "mdia");
      const hdlr = mdia && kids(mdia.start, mdia.end).find((b) => b.type === "hdlr");
      const handler = hdlr ? buf.toString("latin1", hdlr.start + 8, hdlr.start + 12) : "?";
      const edts = tk.find((b) => b.type === "edts");
      const elst = edts && kids(edts.start, edts.end).find((b) => b.type === "elst");
      const entries = [];
      if (elst) {
        const ver = buf[elst.start], n = buf.readUInt32BE(elst.start + 4);
        for (let i = 0, p = elst.start + 8; i < n && p < elst.end; i++) {
          if (ver === 1) { entries.push(Number(buf.readBigInt64BE(p + 8))); p += 20; } else { entries.push(buf.readInt32BE(p + 4)); p += 12; }
        }
      }
      return { handler, entries };
    });
  } finally {
    closeSync(fh);
  }
}

// The longest gap between keyframes (seconds). Decodes keyframes only, so it is quick even on a long master.
function keyframeGap(file, duration) {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey", "-show_entries", "frame=pts_time", "-of", "csv=p=0", file]);
  const t = r.stdout.split(/\r?\n/).map((x) => parseFloat(x)).filter(Number.isFinite);
  if (!t.length) return null;
  let max = 0;
  for (let i = 1; i < t.length; i++) max = Math.max(max, t[i] - t[i - 1]);
  max = Math.max(max, duration - t[t.length - 1]);
  return { count: t.length, max: +max.toFixed(2) };
}

function loudness(file) {
  const r = run("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const s = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const I = Number((s.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const TP = Number((s.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]);
  return Number.isFinite(I) ? { I, TP } : null;
}

export function measure(file, { loud = true } = {}) {
  const base = probe(file);
  const r = run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file]);
  const p = JSON.parse(r.stdout);
  const v = p.streams.find((s) => s.codec_type === "video");
  const a = p.streams.find((s) => s.codec_type === "audio");
  const [w, h] = displaySize(base);
  const edits = editLists(file);
  const odd = (edits || []).filter((t) => t.entries.length > 1 || t.entries.some((e) => e !== 0));
  return {
    file, w, h, ratio: w && h ? w / h : null,
    duration: base.duration,
    bytes: Number(p.format.size),
    fps: base.fps,
    cfr: v ? Math.abs(rate(v.r_frame_rate) - rate(v.avg_frame_rate)) < 0.05 : null,
    vcodec: base.vcodec, vprofile: v?.profile ?? null, pixfmt: base.pix_fmt, color: base.color,
    vbitrate: v?.bit_rate ? Math.round(v.bit_rate / 1000) : null,
    bitrate: base.bitrate_kbps,
    acodec: base.acodec, sampleRate: base.sample_rate, channels: base.channels,
    abitrate: a?.bit_rate ? Math.round(a.bit_rate / 1000) : null,
    faststart: base.faststart,
    editList: edits ? { odd: odd.length > 0, text: odd.map((t) => `${t.handler === "soun" ? "audio" : t.handler === "vide" ? "video" : t.handler} starts at ${t.entries.join("/")}`).join(", ") || "none that shift a track" } : null,
    keyint: v ? keyframeGap(file, base.duration) : null,
    container: extname(file).slice(1).toLowerCase(),
    loud: loud && a ? loudness(file) : null,
  };
}

const MB = (b) => `${(b / 1048576).toFixed(1)} MB`;
// YouTube's recommended SDR upload bitrates (kbps) by the short side: [24-30 fps, 48-60 fps] (S9).
const YT = [[2160, 35000, 53000], [1440, 16000, 24000], [1080, 8000, 12000], [720, 5000, 7500], [480, 2500, 4000], [360, 1000, 1500]];
const near = (a, b) => Math.abs(a - b) < 0.01;

// One rule against one measurement → { ok: true|false|null, value, want }.
function evalRule(r, m) {
  const range = (val, fmt = (x) => x) => ({
    ok: val == null ? null : (r.min == null || val >= r.min - 1e-6) && (r.max == null || val <= r.max + 1e-6),
    value: val == null ? "?" : fmt(val),
    want: [r.min != null ? `>= ${fmt(r.min)}` : "", r.max != null ? `<= ${fmt(r.max)}` : ""].filter(Boolean).join(", "),
  });
  const inList = (val, list) => ({ ok: val == null ? null : list.includes(val), value: val ?? "?", want: list.join("/") });
  const short = Math.min(m.w, m.h), long = Math.max(m.w, m.h);
  switch (r.check) {
    case "duration": return range(m.duration, (x) => `${+x.toFixed(2)} s`);
    case "size": return range(m.bytes, MB);
    case "fps": return range(m.fps, (x) => `${x} fps`);
    case "vbitrate": return range(m.vbitrate ?? m.bitrate, (x) => `${x} kbps`);
    case "bitrate": return range(m.bitrate, (x) => `${x} kbps`);
    case "abitrate": return { ...range(m.abitrate, (x) => `${x} kbps`) };
    case "channels": return range(m.channels);
    case "sampleRate": return r.in ? inList(m.sampleRate, r.in) : range(m.sampleRate, (x) => `${x} Hz`);
    case "aspect": {
      const val = m.ratio, show = val ? `${m.w}:${m.h} (${val.toFixed(3)})` : "?";
      if (r.is) { const [a, b] = r.is.split(":").map(Number); return { ok: val == null ? null : near(val, a / b), value: show, want: r.is }; }
      return { ...range(val, (x) => x.toFixed(3)), value: show };
    }
    case "exactSize": return { ok: m.w === r.w && m.h === r.h, value: `${m.w}x${m.h}`, want: `${r.w}x${r.h}` };
    case "minSize": return { ok: short >= Math.min(r.w, r.h) && long >= Math.max(r.w, r.h), value: `${m.w}x${m.h}`, want: `>= ${r.w}x${r.h}` };
    case "maxSize": return { ok: short <= Math.min(r.w, r.h) && long <= Math.max(r.w, r.h), value: `${m.w}x${m.h}`, want: `<= ${r.w}x${r.h}` };
    case "minShortSide": return { ok: short >= r.px, value: `${short} px`, want: `>= ${r.px} px` };
    case "maxWidth": return { ok: m.w <= r.px, value: `${m.w} px`, want: `<= ${r.px} px` };
    case "cfr": return { ok: m.cfr, value: m.cfr ? "constant" : "variable", want: "constant frame rate" };
    case "vcodec": return inList(m.vcodec, r.in);
    case "vprofile": return inList(m.vprofile, r.in);
    case "pixfmt": return inList(m.pixfmt, r.in);
    case "acodec": return inList(m.acodec, r.in);
    case "container": return inList(m.container, r.in);
    case "bt709": return { ok: (m.color ?? "").split("bt709").length - 1 >= 3, value: m.color, want: "bt709 x3" };
    case "faststart": return { ok: m.faststart, value: m.faststart ? "moov first" : "moov last", want: "moov before mdat" };
    case "editList": return { ok: m.editList ? !m.editList.odd : null, value: m.editList?.text ?? "?", want: "no edit list (-use_editlist 0)" };
    case "keyint": return { ok: m.keyint ? m.keyint.max <= r.max : null, value: m.keyint ? `${m.keyint.max} s` : "?", want: `<= ${r.max} s` };
    case "ytBitrate": {
      const row = YT.find(([s]) => short >= s) || YT[YT.length - 1];
      const need = m.fps > 30.5 ? row[2] : row[1], val = m.vbitrate ?? m.bitrate;
      return { ok: val == null ? null : val >= need, value: `${val} kbps`, want: `>= ${need} kbps (${row[0]}p @ ${m.fps} fps)` };
    }
    case "loudness": {
      if (!m.loud) return { ok: null, value: "not measured", want: `${r.target} ±${r.tol} LUFS` };
      return { ok: Math.abs(m.loud.I - r.target) <= r.tol, value: `${m.loud.I} LUFS, peak ${m.loud.TP} dBTP`, want: `${r.target} ±${r.tol} LUFS` };
    }
    default: return { ok: null, value: "?", want: `unknown check "${r.check}"` };
  }
}

function runRules(rules, m, group) {
  return rules.map((r) => {
    const e = evalRule(r, m);
    const status = e.ok === null ? "SKIP" : e.ok ? "PASS" : r.level;
    return { group, check: r.check, status, value: String(e.value), want: e.want, src: r.src, note: r.note ?? "" };
  });
}

function defaultTargets(m) {
  if (!m.ratio) return Object.keys(RULES.platforms);
  if (near(m.ratio, 9 / 16)) return ["universal-reel"];
  if (near(m.ratio, 4 / 5)) return ["linkedin-clip"];
  if (m.ratio > 1.3) return ["youtube-main", "facebook-main", "linkedin-full"];
  return Object.keys(RULES.platforms);
}

export function checkFile(file, { targets, loud = true } = {}) {
  const m = measure(file, { loud });
  const groups = [];
  for (const t of targets?.length ? targets : defaultTargets(m)) {
    const prof = RULES.profiles[t];
    if (prof) {
      const results = [...prof.platforms.flatMap((id) => runRules(RULES.platforms[id].rules, m, id)), ...runRules(prof.house, m, "house")];
      groups.push({ target: t, kind: "profile", platforms: prof.platforms, results });
    } else if (RULES.platforms[t]) {
      groups.push({ target: t, kind: "platform", platforms: [t], results: runRules(RULES.platforms[t].rules, m, t) });
    } else throw new Error(`unknown --for "${t}". Profiles: ${Object.keys(RULES.profiles).join(", ")}; platforms: ${Object.keys(RULES.platforms).join(", ")}`);
  }
  for (const g of groups) g.verdict = ["FAIL", "WARN"].find((lv) => g.results.some((r) => r.status === lv)) ?? "PASS";
  return { file, measured: m, groups, ok: !groups.some((g) => g.verdict === "FAIL") };
}

// What one file must satisfy for every platform of a profile, and the text-safe box in pixels.
export function limits(name, W = 1080, H = 1920) {
  const prof = RULES.profiles[name];
  if (!prof) throw new Error(`unknown profile "${name}"`);
  const hard = prof.platforms.flatMap((id) => RULES.platforms[id].rules.filter((r) => r.level === "FAIL").map((r) => ({ ...r, id })));
  const pick = (check, key, better) => hard.filter((r) => r.check === check && r[key] != null)
    .reduce((best, r) => (!best || better(r[key], best.value) ? { value: r[key], by: r.id, src: r.src } : best), null);
  const lower = (a, b) => a < b, higher = (a, b) => a > b;
  const sides = ["top", "bottom", "left", "right"];
  const safe = Object.fromEntries(sides.map((s) => {
    // the platforms' published zones, plus the profile's own house zone where a platform publishes none (LinkedIn)
    const zs = [...prof.platforms.map((id) => [id, RULES.platforms[id].safeZone?.[s]]), ["house", prof.safeZone?.[s]]].filter(([, v]) => v != null);
    const top = zs.reduce((a, z) => (!a || z[1] > a[1] ? z : a), null);
    return [s, top ? { value: top[1], by: top[0] } : null];
  }));
  const px = (s, len) => Math.round((safe[s]?.value ?? 0) * len);
  return {
    profile: name, platforms: prof.platforms,
    duration: { min: pick("duration", "min", higher), max: pick("duration", "max", lower) },
    size: { max: pick("size", "max", lower) },
    fps: { min: pick("fps", "min", higher), max: pick("fps", "max", lower) },
    safe, box: { x0: px("left", W), x1: W - px("right", W), y0: px("top", H), y1: H - px("bottom", H), W, H },
  };
}

function printResult(res) {
  const m = res.measured;
  const loud = m.loud ? `  ${m.loud.I} LUFS / ${m.loud.TP} dBTP` : "";
  console.log(`\n${basename(res.file)}  ${m.w}x${m.h} ${m.fps} fps ${m.duration} s ${MB(m.bytes)}  ${m.vcodec}/${m.vprofile} ${m.vbitrate ?? m.bitrate} kbps  ${m.acodec} ${m.sampleRate} Hz ${m.channels}ch${loud}`);
  for (const g of res.groups) {
    console.log(`  ${g.verdict.padEnd(4)}  ${g.target}${g.kind === "profile" ? `  (${g.platforms.join(" + ")} + house)` : ""}`);
    for (const id of [...g.platforms, "house"]) {
      const rs = g.results.filter((r) => r.group === id);
      if (!rs.length) continue;
      const bad = rs.filter((r) => r.status !== "PASS");
      console.log(`        ${id.padEnd(16)} ${rs.length - bad.length}/${rs.length} pass`);
      for (const r of bad) console.log(`          ${r.status.padEnd(4)} ${r.check}: ${r.value}  (want ${r.want}; ${r.src})${r.note ? `  — ${r.note}` : ""}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.length ? v.join("=") : true]; }));
  const files = args.filter((a) => !a.startsWith("--"));
  if (opt.limits) {
    const L = limits(opt.limits, Number(opt.w ?? 1080), Number(opt.h ?? 1920));
    const s = (x) => (x ? `${x.value} (${x.by}, ${x.src})` : "none");
    console.log(`${L.profile}: one file for ${L.platforms.join(" + ")}`);
    console.log(`  duration  min ${s(L.duration.min)}   max ${s(L.duration.max)}`);
    console.log(`  size      max ${L.size.max ? `${MB(L.size.max.value)} (${L.size.max.by}, ${L.size.max.src})` : "none"}`);
    console.log(`  fps       min ${s(L.fps.min)}   max ${s(L.fps.max)}`);
    console.log(`  safe zone ${["top", "bottom", "left", "right"].map((k) => `${k} ${L.safe[k] ? `${L.safe[k].value * 100}% (${L.safe[k].by})` : "-"}`).join(", ")}`);
    console.log(`  text box at ${L.box.W}x${L.box.H}: x ${L.box.x0}-${L.box.x1}, y ${L.box.y0}-${L.box.y1}`);
    process.exit(0);
  }
  if (!files.length) {
    console.log("Usage: node tools/release/spec-check.mjs <video.mp4> [...] [--for=universal-reel|linkedin-clip|linkedin-full|youtube-main|facebook-main|<platform>] [--json=out.json] [--no-loudness]\n       node tools/release/spec-check.mjs --limits=universal-reel");
    process.exit(2);
  }
  const targets = typeof opt.for === "string" ? opt.for.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const results = files.map((f) => checkFile(f, { targets, loud: !opt["no-loudness"] }));
  results.forEach(printResult);
  const ok = results.every((r) => r.ok);
  console.log(`\nspec-check ${ok ? "PASSED (no FAIL)" : "FAILED"}: ${results.length} file(s)`);
  if (typeof opt.json === "string") writeFileSync(opt.json, JSON.stringify(results, null, 2));
  process.exit(ok ? 0 : 1);
}
