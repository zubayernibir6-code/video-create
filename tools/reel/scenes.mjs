// scenes.mjs — the "mechanism" scene of each tool in a tools-reel: six archetypes drawn in the reference's language
// (assets/refs/ref-01.mp4). A model only picks one and fills a few labels in reel.json; the archetype lays it out
// inside the stage (840×570 at x 65, y 430), times every element on the voice's words, places its sounds and
// writes its plan rows. Text sizes stay ≥ 24 px (STYLE.md §৬); limits on label lengths keep everything inside.
//
//   trace    input chips → feature rows "0 ?" → linked to a source panel → counts + checks → result + proof
//   hub      the mascot in the centre, 3–4 nodes on glowing curves, a cost chip, a proof chip
//   pipeline step chips light up one by one while a blank page fills into a finished screen
//   fix      doc sheets fly into the wizard mascot, the one white flash, red outdated lines turn green
//   dial     a browser with console errors and a quality ring, the knight mascot slashes, ring → green
//   counter  a big number counting from → to with a bar, then the proof
import { COL, MONO, SANS, cvars, esc, f3, icon, iconExists, rgba, svgCheck, TOOL_COLORS } from "./core.mjs";

const len = (s) => [...String(s ?? "")].length;
const lab = (x) => (typeof x === "string" ? x : x?.label ?? "");
const onw = (x) => (typeof x === "string" ? x : x?.on ?? x?.label);
const iconOr = (x, size, color) => (x?.icon && iconExists(x.icon) ? icon(x.icon, size, color, 2.2) : null);

// ---- schema: what each archetype needs (the validator's messages are written for a model to fix the JSON) ---
export const SCHEMA = {
  trace: `{ "type": "trace", "inputs": ["APP","SITE","APK"] (2-4, each ≤ 10 chars), "rows": [{"label":"Login","to":9,"unit":"functions"}] (2-4, label ≤ 10), "result": "47 features traced" (≤ 18), "proof": {"text":"0 guesses","on":"guess"} (≤ 18), "linkOn": optional word }`,
  hub: `{ "type": "hub", "nodes": [{"label":"Reddit","on":"Reddit","icon":"optional lucide name","color":"optional #hex"}] (3-4, label ≤ 12), "chip": {"text":"API fees $0.00","on":"zero"} (optional, ≤ 24), "proof": {"text":"11,977 complaints","on":"hate","tone":"bad|good"} (≤ 24) }`,
  pipeline: `{ "type": "pipeline", "steps": ["scan","plan","build","test"] or [{"label":"scan","on":"scan"}] (3-8, each ≤ 12), "proof": {"text":"One app, start to finish","on":"finish"} (≤ 26) }`,
  fix: `{ "type": "fix", "sources": ["React","Next.js","Tailwind"] (2-4, ≤ 10), "file": "app.tsx" (≤ 16), "bad": ["componentWillMount()"] (2-4, ≤ 28), "fixOn": "stops", "proof": {"text":"0 deprecated"} (≤ 16) }`,
  dial: `{ "type": "dial", "url": "localhost:3000" (≤ 22), "app": "My app" (≤ 12), "errors": ["TypeError: user is undefined"] (1-3, ≤ 30), "from": 62, "to": 100, "label": "quality score", "fixOn": "fixes", "proof": {"text":"0 errors · ready to ship"} (≤ 26) }`,
  counter: `{ "type": "counter", "from": 40, "to": 0, "max": 40, "pre": "$", "post": "/month", "label": "API bill" (≤ 28), "countOn": "zero", "proof": {"text":"Free forever"} (≤ 26) }`,
};

export function validateScene(sc) {
  const e = [];
  const need = (cond, msg) => { if (!cond) e.push(msg); };
  const list = (arr, lo, hi, max, what) => {
    need(Array.isArray(arr) && arr.length >= lo && arr.length <= hi, `${what}: ${lo}-${hi} items`);
    for (const x of arr ?? []) need(len(lab(x)) && len(lab(x)) <= max, `${what}: "${lab(x)}" must be 1-${max} characters`);
  };
  const proof = (max) => need(sc.proof?.text && len(sc.proof.text) <= max, `proof.text: 1-${max} characters`);
  if (!SCHEMA[sc?.type]) return [`scene.type must be one of ${Object.keys(SCHEMA).join(", ")}`];
  if (sc.type === "trace") {
    list(sc.inputs, 2, 4, 10, "inputs"); list(sc.rows, 2, 4, 10, "rows");
    for (const r of sc.rows ?? []) need(Number.isFinite(r.to), `rows: "${r.label}" needs a number "to"`);
    need(sc.result && len(sc.result) <= 18, "result: 1-18 characters"); proof(18);
  }
  if (sc.type === "hub") { list(sc.nodes, 3, 4, 12, "nodes"); if (sc.chip) need(len(sc.chip.text) <= 24, "chip.text: ≤ 24 characters"); proof(24); }
  if (sc.type === "pipeline") { list(sc.steps, 3, 8, 12, "steps"); proof(26); }
  if (sc.type === "fix") {
    list(sc.sources, 2, 4, 10, "sources"); list(sc.bad, 2, 4, 28, "bad");
    need(!sc.file || len(sc.file) <= 16, "file: ≤ 16 characters"); proof(16);
  }
  if (sc.type === "dial") {
    list(sc.errors, 1, 3, 30, "errors");
    need(Number.isFinite(sc.from) && Number.isFinite(sc.to) && sc.from >= 0 && sc.to <= 100, "from / to: numbers 0-100");
    need(!sc.url || len(sc.url) <= 22, "url: ≤ 22 characters"); need(!sc.app || len(sc.app) <= 12, "app: ≤ 12 characters"); proof(26);
  }
  if (sc.type === "counter") {
    need(Number.isFinite(sc.from) && Number.isFinite(sc.to), "from / to: numbers");
    need(sc.label && len(sc.label) <= 28, "label: 1-28 characters"); proof(26);
  }
  return e;
}

// ---- css (only the archetypes a video uses are added) ---------------------------------------------------------
export const SCENE_CSS = {
  trace: `
.trow { position: absolute; left: 0; width: 384px; height: 80px; display: flex; align-items: center; padding: 0 76px 0 22px; opacity: 0; }
.trow .tl { font: 800 32px/1.1 ${SANS}; color: #FFFFFF; }
.trow .ts2 { font: 600 24px/1.2 ${MONO}; color: ${COL.muted}; margin-top: 4px; white-space: nowrap; }
.tq, .tok { position: absolute; right: 18px; top: 18px; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.tq { background: ${COL.red}; font: 900 28px/1 ${SANS}; color: #FFFFFF; }
.tok { background: ${COL.green}; opacity: 0; }
.tsrc { position: absolute; left: 456px; width: 384px; opacity: 0; }
.tsrc .tsh { position: absolute; left: 20px; top: 12px; font: 700 24px/1 ${MONO}; color: ${COL.muted}; }
.tcl { position: absolute; left: 10px; right: 10px; height: 40px; display: flex; align-items: center; padding-left: 14px; font: 600 24px/1 ${MONO}; color: #C9D1DE; white-space: nowrap; overflow: hidden; }
.tcl .thl { position: absolute; inset: 2px 0; border-radius: 8px; background: var(--cb); border-left: 4px solid var(--c); opacity: 0; }
.tcl span { position: relative; }
.tlink { position: absolute; left: 0; top: 0; overflow: visible; }`,
  hub: `
.hhalo { position: absolute; left: 325px; top: 205px; width: 190px; height: 190px; border-radius: 50%; border: 3px solid var(--c); box-shadow: 0 0 40px var(--cg), inset 0 0 30px var(--cb); opacity: 0; }
.hnd { position: absolute; width: 112px; height: 112px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${COL.panel};
  border: 3px solid var(--c); box-shadow: 0 0 30px var(--cg); color: var(--c); font: 900 44px/1 ${SANS}; opacity: 0; }
.hlb { position: absolute; width: 240px; text-align: center; font: 700 28px/1.2 ${SANS}; color: #FFFFFF; opacity: 0; }
.hsv { position: absolute; left: 0; top: 0; overflow: visible; }`,
  pipeline: `
.pst { opacity: 1; border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.03); color: #7D879B; box-shadow: none; font-size: 26px; padding: 8px 20px 7px; }
.pmk { position: absolute; left: 250px; top: 150px; width: 340px; height: 300px; border-radius: 22px; border: 3px dashed rgba(255,255,255,0.22); box-sizing: border-box; background: ${COL.panel}; }
.pmk .pr { display: flex; align-items: center; gap: 12px; padding: 0 12px; box-sizing: border-box; background: rgba(255,255,255,0.10); }
.pmk .pr i { width: 14px; height: 14px; border-radius: 50%; flex: none; }
.pmk .pr b { height: 10px; border-radius: 5px; background: rgba(255,255,255,0.30); }
.pdone { position: absolute; right: -22px; top: -22px; width: 56px; height: 56px; border-radius: 50%; background: ${COL.green}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 26px rgba(48,210,142,0.5); opacity: 0; }
.pmk .pb { position: absolute; left: 0; right: 0; top: 120px; text-align: center; font: 600 26px/1.2 ${MONO}; color: ${COL.muted}; }
.pmk .pk { position: absolute; border-radius: 10px; opacity: 0; }
.ppg { position: absolute; left: 250px; top: 466px; width: 340px; height: 12px; border-radius: 6px; background: rgba(255,255,255,0.08); overflow: hidden; }
.ppg b { display: block; width: 100%; height: 100%; background: var(--c); transform-origin: 0 50%; transform: scaleX(0); }`,
  fix: `
.fxp { position: absolute; left: 40px; top: 86px; width: 760px; opacity: 0; }
.fxh { height: 56px; display: flex; align-items: center; padding: 0 22px; border-bottom: 2px solid rgba(255,255,255,0.06); font: 600 26px/1 ${MONO}; color: ${COL.muted}; }
.fxbg { margin-left: auto; position: relative; width: 300px; height: 40px; }
.fxbg span { position: absolute; right: 0; top: 0; height: 40px; display: flex; align-items: center; border-radius: 999px; padding: 0 18px; font: 700 24px/1 ${MONO}; white-space: nowrap; }
.fxl { height: 52px; display: flex; align-items: center; gap: 16px; padding: 0 22px; font: 600 26px/1 ${MONO}; color: #E8ECF5; white-space: nowrap; }
.fxl i { width: 14px; height: 14px; border-radius: 50%; background: ${COL.red}; flex: none; }
.fxt { position: relative; }
.fxt b { position: absolute; left: -4px; right: -4px; top: 52%; height: 3px; background: ${COL.red}; transform-origin: 0 50%; }
.fxd { position: absolute; left: 0; top: 0; opacity: 0; color: #FFFFFF; }
.fxbolt { position: absolute; left: 0; top: 0; overflow: visible; opacity: 0; }`,
  dial: `
.dbr { position: absolute; left: 0; top: 0; width: 840px; height: 400px; overflow: hidden; opacity: 0; }
.dbr .dh { height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 18px; background: ${COL.termHead}; }
.dbr .dh i { width: 13px; height: 13px; border-radius: 50%; }
.dbr .url { margin-left: 18px; padding: 6px 20px; border-radius: 999px; background: #0A0E15; font: 600 24px/1.1 ${MONO}; color: #C9D1DE; }
.dlp { position: absolute; left: 0; top: 52px; width: 330px; bottom: 0; border-right: 2px solid rgba(255,255,255,0.06); }
.dlp .ap { position: absolute; left: 24px; top: 18px; display: flex; align-items: center; gap: 14px; font: 800 32px/1 ${SANS}; }
.dlp .ap i { width: 40px; height: 40px; border-radius: 10px; background: var(--c); }
.dlp .sk { position: absolute; left: 24px; height: 20px; border-radius: 6px; background: rgba(255,255,255,0.08); }
.dlp svg { position: absolute; left: 81px; top: 144px; }
.dlp .dn { position: absolute; left: 0; width: 330px; top: 196px; text-align: center; font: 900 50px/1 ${SANS}; }
.dlp .dl { position: absolute; left: 0; width: 330px; top: 318px; text-align: center; font: 600 24px/1 ${SANS}; color: ${COL.muted}; }
.drp { position: absolute; left: 330px; top: 52px; right: 0; bottom: 0; }
.drp .tabs { position: absolute; left: 24px; top: 14px; display: flex; gap: 28px; font: 600 24px/1.4 ${MONO}; color: ${COL.dim}; }
.drp .tabs b { color: #FFFFFF; border-bottom: 3px solid var(--c); }
.drp .pills { position: absolute; left: 24px; top: 66px; width: 300px; height: 40px; }
.drp .pills span { position: absolute; left: 0; top: 0; height: 40px; display: flex; align-items: center; border-radius: 999px; padding: 0 18px; font: 700 24px/1 ${MONO}; white-space: nowrap; }
.der { position: absolute; left: 24px; right: 24px; height: 48px; display: flex; align-items: center; gap: 12px; padding: 0 16px; border-radius: 10px;
  background: rgba(246,91,109,0.10); border-left: 4px solid ${COL.red}; font: 600 24px/1 ${MONO}; color: #FF9AA8; white-space: nowrap; overflow: hidden; opacity: 0; }
.der .dk { margin-left: auto; opacity: 0; }
.dslash { position: absolute; left: -200px; top: 230px; width: 560px; height: 8px; border-radius: 4px; background: #FFFFFF; box-shadow: 0 0 30px #FFFFFF; transform: rotate(-16deg); opacity: 0; }`,
  counter: `
.cn { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font: 900 150px/1 ${SANS}; color: #FFFFFF; font-variant-numeric: tabular-nums; opacity: 0; }
.cl { position: absolute; left: 0; right: 0; top: 262px; text-align: center; font: 700 34px/1.2 ${SANS}; color: ${COL.muted}; opacity: 0; }
.ctr { position: absolute; left: 120px; top: 340px; width: 600px; height: 18px; border-radius: 9px; background: rgba(255,255,255,0.08); overflow: hidden; opacity: 0; }
.ctr b { display: block; width: 100%; height: 100%; background: var(--c); transform-origin: 0 50%; }`,
};

// a line that draws itself, with its glow as a wide faint copy underneath (no CSS filter: those are "heavy
// overlays" and ~40 of them made HyperFrames capture black frames). Both copies share the id prefix: tween "#id, #idg".
const glowPath = (pid, d, color, w) =>
  `<path id="${pid}g" d="${d}" pathLength="1" fill="none" stroke="${color}" stroke-width="${w * 3.5}" stroke-linecap="round" opacity="0.22" style="stroke-dasharray:1;stroke-dashoffset:1"/>` +
  `<path id="${pid}" d="${d}" pathLength="1" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" style="stroke-dasharray:1;stroke-dashoffset:1"/>`;
const fmtNum = (v, P) => `${P.pre ?? ""}${Math.round(v).toLocaleString("en-US")}${P.post ?? ""}`;

// ---- the archetypes -------------------------------------------------------------------------------------------
// ctx: { id, color, t0, t1, D, at(word, frac) → s, js(str), show(sel,t,from,d,ease), pop(sel,t), hide(sel,t,d),
//        cue(t,file,vol,dur), row(t,bn,text), count(sel,t,from,to,d,fmt), bot(t,where,prop), flash(t), clamp(t) }
function trace(ctx, P) {
  const { id, color: c } = ctx, n = P.rows.length, RT = 110, RH = 96;
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="rowc" style="top:0;height:64px;justify-content:flex-start">${P.inputs.map((x, i) => `<span class="chip" id="${id}i${i}">${iconOr(x, 30, c) ?? ""}${esc(lab(x))}</span>`).join("")}</div>
  <div class="panel tsrc" id="${id}src" style="top:${RT - 40}px;height:${n * RH + 24}px"><div class="tsh">SOURCE</div>${P.rows.map((r, i) => `<div class="tcl" style="top:${i * RH + 60}px"><b class="thl" id="${id}h${i}"></b><span>${esc(r.code ?? `fn ${lab(r).toLowerCase().replace(/[^a-z0-9]+/g, "_")}()`)}</span></div>`).join("")}</div>
  <svg class="tlink" width="840" height="570">${P.rows.map((r, i) => { const y = RT + i * RH + 40; return glowPath(`${id}p${i}`, `M384 ${y} C 410 ${y - 26}, 432 ${y + 26}, 458 ${y}`, c, 4); }).join("")}</svg>
  ${P.rows.map((r, i) => `<div class="panel trow" id="${id}r${i}" style="top:${RT + i * RH}px"><div><div class="tl">${esc(lab(r))}</div><div class="ts2"><span id="${id}n${i}">0</span> ${esc(r.unit ?? "functions")}</div></div><div class="tq" id="${id}q${i}">?</div><div class="tok" id="${id}k${i}">${svgCheck(28, COL.bg, 3.6)}</div></div>`).join("")}
  <div class="rowc" style="top:${RT + n * RH + 8}px;justify-content:space-between;flex-wrap:nowrap"><span class="chip solid" id="${id}pf">${esc(P.proof.text)}</span><span class="chip" id="${id}rs">${esc(P.result)}</span></div>
</div>`;
  const { t0, D } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  P.rows.forEach((_, i) => ctx.show(`#${id}r${i}`, t0 + 0.05 + i * 0.08, { x: -30 }));
  ctx.show(`#${id}src`, t0 + 0.15, { x: 30 });
  ctx.row(t0, "কাজ দেখানো শুরু: ফিচারের সারিগুলো \"?\" নিয়ে আর পাশে সোর্স-প্যানেল", "—");
  P.inputs.forEach((x, i) => {
    const t = ctx.at(onw(x), 0.08 + i * 0.07);
    ctx.pop(`#${id}i${i}`, t); ctx.cue(t, "pop", 0.3);
    if (i === 0) ctx.row(t, "ইনপুট-চিপ একে একে ওঠে", P.inputs.map(lab).join(" · "));
  });
  // the link → checks → result → proof chain needs 3.2 s before the next tool: start it earlier rather than cut it
  const tl = Math.min(ctx.at(P.linkOn, 0.45), ctx.t1 - 3.2);
  P.rows.forEach((r, i) => {
    ctx.js(`tl.to("#${id}p${i}, #${id}p${i}g", { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, ${f3(tl + i * 0.12)});`);
    ctx.show(`#${id}h${i}`, tl + 0.3 + i * 0.12, {}, 0.25);
    ctx.count(`#${id}n${i}`, tl + 0.2, 0, r.to, 1.0, {});
  });
  ctx.cue(tl, "whoosh-short", 0.3); ctx.cue(tl + 0.2, "typing", 0.2, 1.0);
  ctx.row(tl, "আলোর রেখা প্রতিটা সারিকে কোডের লাইনের সাথে জোড়ে; সংখ্যা বাড়ে", "—");
  const tf = ctx.clamp(tl + 1.25);
  P.rows.forEach((_, i) => { ctx.hide(`#${id}q${i}`, tf + i * 0.06, 0.15); ctx.pop(`#${id}k${i}`, tf + i * 0.06); });
  ctx.cue(tf, "success", 0.4);
  ctx.pop(`#${id}rs`, tf + 0.2); ctx.cue(tf + 0.2, "ping", 0.45);
  ctx.row(tf, "সব সারিতে সবুজ টিক, ফলের চিপ বসে", P.result);
  const tp = ctx.late(Math.max(ctx.at(P.proof.on, 0.8), tf + 0.8));
  ctx.pop(`#${id}pf`, tp); ctx.cue(tp, "impact-bass-1", 0.5, 0.5);
  ctx.row(tp, "প্রমাণের চিপ", P.proof.text);
  ctx.bot(t0, "perch", "lens");
  return html;
}

function hub(ctx, P) {
  const { id, color: c } = ctx, cx = 420, cy = 300;
  // 4 nodes: the corners; 3 nodes: left, right and top, so the picture stays balanced (the chip moves to the left)
  const three = P.nodes.length === 3;
  const slots = three ? [[110, 360], [730, 360], [420, 70]] : [[110, 150], [730, 150], [110, 430], [730, 430]];
  const nodes = P.nodes.map((nd, i) => ({ ...nd, label: lab(nd), x: slots[i][0], y: slots[i][1], col: nd.color ?? c }));
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="hhalo" id="${id}hl"></div>
  <svg class="hsv" width="840" height="570">${nodes.map((nd, i) => { const s = nd.x < cx ? -1 : 1; const d = nd.x === cx ? `M${cx} ${cy - 96} L ${cx} ${nd.y + 56}` : `M${cx} ${cy} C ${cx + s * 170} ${cy}, ${nd.x - s * 150} ${nd.y}, ${nd.x} ${nd.y}`; return glowPath(`${id}p${i}`, d, nd.col, 5); }).join("")}</svg>
  ${nodes.map((nd, i) => `<div class="hnd" id="${id}n${i}" style="left:${nd.x - 56}px;top:${nd.y - 56}px;${cvars(nd.col)}">${iconOr(nd, 52, nd.col) ?? esc(nd.label[0].toUpperCase())}</div><div class="hlb" id="${id}b${i}" style="left:${nd.x - 120}px;top:${nd.y + 66}px">${esc(nd.label)}</div>`).join("")}
  ${P.chip ? `<div class="rowc" style="top:0${three ? ";justify-content:flex-start" : ""}"><span class="chip solid" id="${id}ch">${esc(P.chip.text)}</span></div>` : ""}
  <div class="rowc" style="top:500px"><span class="chip" id="${id}pf" style="${cvars(P.proof.tone === "bad" ? COL.red : c)}">${esc(P.proof.text)}</span></div>
</div>`;
  const { t0 } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  ctx.show(`#${id}hl`, t0 + 0.1, { scale: 0.7 }, 0.5);
  ctx.bot(t0, "center", null);
  ctx.row(t0, "মাসকট মাঝখানে চলে আসে, চারপাশে আলোর বৃত্ত", "—");
  nodes.forEach((nd, i) => {
    const t = ctx.at(onw(nd), 0.06 + i * 0.12);
    ctx.js(`tl.to("#${id}p${i}, #${id}p${i}g", { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, ${f3(t - 0.1)});`);
    ctx.pop(`#${id}n${i}`, t); ctx.show(`#${id}b${i}`, t + 0.08, { y: 12 }, 0.3);
    ctx.cue(t, "pop", 0.32);
    ctx.row(t, `নোড আসে, আলোর রেখায় জোড়া: ${nd.label}`, nd.label);
  });
  if (P.chip) {
    const t = ctx.at(P.chip.on, 0.6);
    ctx.pop(`#${id}ch`, t); ctx.cue(t, /\$|fee|free|cost/i.test(P.chip.text) ? "coin-drop" : "ping", 0.45);
    ctx.row(t, "উপরে চিপ নামে", P.chip.text);
  }
  const tp = ctx.late(ctx.at(P.proof.on, 0.82));
  ctx.pop(`#${id}pf`, tp);
  if (P.proof.tone === "bad") ctx.cue(tp, "glitch-3", 0.35); else ctx.cue(tp, "impact-bass-1", 0.5, 0.5);
  ctx.row(tp, "নিচে প্রমাণের চিপ", P.proof.text);
  return html;
}

function pipeline(ctx, P) {
  const { id, color: c } = ctx, S = P.steps.length;
  // the screen that gets built: a header, a title, three list rows (each with a coloured dot) and a button; on a
  // panel-coloured page so the rows read as filled (on the bare background they vanished)
  const rowB = (top, j) => `<div class="pk pr" id="${id}k${j}" style="left:16px;top:${top}px;width:302px;height:40px"><i style="background:${TOOL_COLORS[(j + 1) % TOOL_COLORS.length]}"></i><b style="width:${[62, 48, 70][j - 2]}%"></b></div>`;
  const blocks = [
    `<div class="pk" id="${id}k0" style="left:16px;top:16px;width:302px;height:44px;background:${c}"></div>`,
    `<div class="pk" id="${id}k1" style="left:16px;top:78px;width:190px;height:22px;background:rgba(255,255,255,0.85)"></div>`,
    rowB(116, 2), rowB(166, 3), rowB(216, 4),
    `<div class="pk" id="${id}k5" style="left:186px;top:262px;width:132px;height:24px;background:${COL.blue}"></div>`,
  ];
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="rowc" style="top:0;gap:12px 12px;padding:0 10px">${P.steps.map((s, i) => `<span class="chip pst" id="${id}s${i}">${esc(lab(s))}</span>`).join("")}</div>
  <div class="pmk" id="${id}mk"><div class="pb" id="${id}bl">blank page</div>${blocks.join("")}<div class="pdone" id="${id}ok">${svgCheck(30, COL.bg, 3.6)}</div></div>
  <div class="ppg"><b id="${id}pg"></b></div>
  <div class="rowc" style="top:496px"><span class="chip solid" id="${id}pf">${esc(P.proof.text)}</span></div>
</div>`;
  const { t0 } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  ctx.bot(t0, "right", "helmet");
  ctx.row(t0, "ধাপের চিপগুলো ঝাপসা; মাঝখানে ফাঁকা পাতা", "blank page");
  let last = t0;
  P.steps.forEach((s, i) => {
    const sc = TOOL_COLORS[i % TOOL_COLORS.length];
    const t = Math.max(ctx.at(onw(s), 0.08 + (0.62 * i) / S), last + 0.18);
    last = t;
    ctx.js(`tl.to("#${id}s${i}", { borderColor: "${sc}", backgroundColor: "${rgba(sc, 0.16)}", color: "#FFFFFF", boxShadow: "0 0 22px ${rgba(sc, 0.4)}", duration: 0.25 }, ${f3(t)});`);
    ctx.js(`tl.to("#${id}pg", { scaleX: ${f3((i + 1) / S)}, duration: 0.35, ease: "power2.out" }, ${f3(t)});`);
    ctx.cue(t, "click-soft", 0.35);
    blocks.forEach((_, j) => { if (Math.min(S - 1, Math.floor((j * S) / blocks.length)) === i) ctx.pop(`#${id}k${j}`, t + 0.05 + 0.06 * (j % 2)); });
    if (i === 0) { ctx.hide(`#${id}bl`, t, 0.2); ctx.row(t, "চিপ একে একে জ্বলে, ফাঁকা পাতা ভরে ওঠে", P.steps.map(lab).join(" · ")); }
  });
  ctx.js(`tl.to("#${id}mk", { borderColor: "${c}", borderStyle: "solid", duration: 0.3 }, ${f3(last + 0.3)});`);
  ctx.pop(`#${id}ok`, last + 0.3);
  ctx.cue(last + 0.3, "success", 0.4);
  const tp = Math.max(ctx.late(Math.max(ctx.at(P.proof.on, 0.85), last + 0.6)), last + 0.3);
  ctx.pop(`#${id}pf`, tp); ctx.cue(tp, "impact-bass-1", 0.5, 0.5);
  ctx.row(tp, "পাতা সম্পূর্ণ; প্রমাণের চিপ", P.proof.text);
  return html;
}

function fix(ctx, P) {
  const { id, color: c } = ctx, n = P.bad.length, K = P.sources.length;
  const panelH = 56 + n * 52 + 18;
  // the staff tip of the mascot standing "below": body-bottom (485,1000) → tip at frame (561.5, 883) → stage (496.5, 453)
  const tip = [496, 453];
  const srcX = (i) => Math.round((840 / (K + 1)) * (i + 1));
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="rowc" style="top:0">${P.sources.map((s, i) => `<span class="chip" id="${id}s${i}">${iconOr(s, 28, c) ?? ""}${esc(lab(s))}</span>`).join("")}</div>
  <div class="panel fxp" id="${id}p" style="height:${panelH}px"><div class="fxh"><span>${esc(P.file ?? "app.tsx")}</span><span class="fxbg"><span id="${id}bd" style="background:${rgba(COL.red, 0.16)};color:${COL.red};border:2px solid ${rgba(COL.red, 0.6)}">${n} deprecated</span><span id="${id}bg" style="opacity:0;background:${rgba(COL.green, 0.16)};color:${COL.green};border:2px solid ${rgba(COL.green, 0.6)}">${esc(P.proof.text)}</span></span></div>
    ${P.bad.map((b, i) => `<div class="fxl"><i id="${id}m${i}"></i><span class="fxt">${esc(lab(b))}<b id="${id}x${i}"></b></span></div>`).join("")}</div>
  ${P.sources.slice(0, 3).map((_, i) => `<div class="fxd" id="${id}d${i}" style="left:${srcX(i) - 26}px;top:4px">${icon("file-text", 52, "#FFFFFF", 2)}</div>`).join("")}
  <svg class="fxbolt" id="${id}bt" width="840" height="570">${[[c, 22, 0.35], ["#FFFFFF", 7, 1]].map(([s, w, o]) => `<polyline points="${tip[0]},${tip[1] - 6} ${tip[0] - 40},${tip[1] - 60} ${tip[0] + 10},${tip[1] - 80} ${tip[0] - 60},${86 + panelH + 10}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" opacity="${o}"/>`).join("")}</svg>
</div>`;
  const { t0 } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  P.sources.forEach((_, i) => ctx.pop(`#${id}s${i}`, t0 + 0.05 + i * 0.1));
  ctx.show(`#${id}p`, t0 + 0.15, { y: 30 });
  ctx.bot(t0, "below", "hat+staff");
  ctx.row(t0, "লাইব্রেরির চিপ আর পুরোনো কোডের প্যানেল (লাল দাগ); মাসকটের জাদুকর-টুপি", P.sources.map(lab).join(" · "));
  P.sources.slice(0, 3).forEach((_, i) => {
    const t = t0 + 0.45 + i * 0.32;
    ctx.js(`tl.fromTo("#${id}d${i}", { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.12, immediateRender: false }, ${f3(t)});`);
    ctx.js(`tl.to("#${id}d${i}", { x: ${tip[0] - srcX(i)}, y: ${tip[1] - 30}, scale: 0.5, duration: 0.6, ease: "power2.in" }, ${f3(t + 0.12)});`);
    ctx.js(`tl.to("#${id}d${i}", { opacity: 0, duration: 0.1 }, ${f3(t + 0.72)});`);
    ctx.cue(t + 0.1, "whoosh-short", 0.28);
  });
  ctx.row(t0 + 0.45, "ডকের পাতা উড়ে মাসকটের লাঠিতে ঢোকে", "—");
  const tf = ctx.late(Math.max(ctx.at(P.fixOn, 0.6), t0 + 1.6) + 0.4) - 0.4;
  ctx.flash(tf);
  ctx.js(`tl.to("#${id}bt", { opacity: 1, duration: 0.05 }, ${f3(tf)}); tl.to("#${id}bt", { opacity: 0, duration: 0.25 }, ${f3(tf + 0.3)});`);
  ctx.cue(tf, "boom", 0.5); ctx.cue(tf, "glitch-1", 0.28);
  P.bad.forEach((_, i) => {
    ctx.js(`tl.to("#${id}x${i}", { scaleX: 0, duration: 0.25, ease: "power2.in" }, ${f3(tf + 0.12 + i * 0.08)});`);
    ctx.js(`tl.to("#${id}m${i}", { backgroundColor: "${COL.green}", duration: 0.2 }, ${f3(tf + 0.12 + i * 0.08)});`);
  });
  ctx.hide(`#${id}bd`, tf + 0.2, 0.15); ctx.pop(`#${id}bg`, tf + 0.36);
  ctx.js(`tl.to("#${id}p", { borderColor: "${COL.green}", boxShadow: "0 0 40px ${rgba(COL.green, 0.35)}", duration: 0.3 }, ${f3(tf + 0.2)});`);
  ctx.cue(tf + 0.4, "success", 0.42);
  ctx.row(tf, "সাদা ঝলক আর বিদ্যুৎ; লাল লাইন সবুজ, ব্যাজ বদলায়", P.proof.text);
  return html;
}

function dial(ctx, P) {
  const { id, color: c } = ctx, n = P.errors.length;
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="panel dbr" id="${id}b"><div class="dh"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span class="url">${esc(P.url ?? "localhost:3000")}</span></div>
    <div class="dlp"><div class="ap"><i></i>${esc(P.app ?? "Your app")}</div><div class="sk" style="top:78px;width:240px"></div><div class="sk" style="top:108px;width:200px"></div>
      <svg width="168" height="168" viewBox="0 0 168 168"><circle cx="84" cy="84" r="68" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14"/><circle id="${id}ring" cx="84" cy="84" r="68" fill="none" stroke="${COL.red}" stroke-width="14" stroke-linecap="round" pathLength="100" transform="rotate(-90 84 84)" style="stroke-dasharray:100;stroke-dashoffset:${100 - P.from}"/></svg>
      <div class="dn" id="${id}num">${P.from}</div><div class="dl">${esc(P.label ?? "quality score")}</div></div>
    <div class="drp"><div class="tabs"><span>Elements</span><b>Console</b><span>Network</span></div>
      <div class="pills"><span id="${id}e1" style="background:${rgba(COL.red, 0.16)};color:${COL.red};border:2px solid ${rgba(COL.red, 0.6)}">${n} error${n > 1 ? "s" : ""}</span><span id="${id}e0" style="opacity:0;background:${rgba(COL.green, 0.16)};color:${COL.green};border:2px solid ${rgba(COL.green, 0.6)}">0 errors</span></div>
      ${P.errors.map((e, i) => `<div class="der" id="${id}r${i}" style="top:${124 + i * 60}px"><span>${esc(lab(e))}</span><span class="dk" id="${id}k${i}">${svgCheck(28, COL.green, 3.6)}</span></div>`).join("")}</div>
    <div class="dslash" id="${id}sl"></div></div>
  <div class="rowc" style="top:424px"><span class="chip solid" id="${id}pf">${esc(P.proof.text)}</span></div>
</div>`;
  const { t0 } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  ctx.show(`#${id}b`, t0 + 0.05, { y: 30 });
  ctx.bot(t0, "right", "sword");
  ctx.row(t0, "ব্রাউজারে অ্যাপ, কোয়ালিটি-বৃত্ত লাল; মাসকটের হাতে তলোয়ার", P.url ?? "localhost:3000");
  P.errors.forEach((_, i) => ctx.show(`#${id}r${i}`, t0 + 0.4 + i * 0.3, { x: 30 }, 0.3));
  ctx.cue(t0 + 0.4, "error", 0.32);
  ctx.row(t0 + 0.4, "কনসোলে লাল ভুল আসে", `${n} error${n > 1 ? "s" : ""}`);
  // the fix must land ≥ 1.7 s before the next tool, so "0 errors" never shows before the errors turn green
  const tf = Math.min(Math.max(ctx.at(P.fixOn, 0.55), t0 + 0.6 + n * 0.3), ctx.t1 - 1.7);
  ctx.js(`tl.fromTo("#${id}sl", { opacity: 0, x: 0 }, { opacity: 1, x: 900, duration: 0.35, ease: "power2.in", immediateRender: false }, ${f3(tf)}); tl.to("#${id}sl", { opacity: 0, duration: 0.1 }, ${f3(tf + 0.36)});`);
  ctx.cue(tf, "whoosh-short", 0.4); ctx.cue(tf + 0.1, "glitch-3", 0.3);
  P.errors.forEach((_, i) => {
    ctx.js(`tl.to("#${id}r${i}", { backgroundColor: "${rgba(COL.green, 0.10)}", borderLeftColor: "${COL.green}", color: "${COL.green}", duration: 0.25 }, ${f3(tf + 0.2 + i * 0.1)});`);
    ctx.pop(`#${id}k${i}`, tf + 0.25 + i * 0.1);
  });
  ctx.hide(`#${id}e1`, tf + 0.2, 0.15); ctx.pop(`#${id}e0`, tf + 0.36);
  ctx.js(`tl.to("#${id}ring", { strokeDashoffset: ${100 - P.to}, stroke: "${COL.green}", duration: 1.0, ease: "power2.out" }, ${f3(tf + 0.3)});`);
  ctx.count(`#${id}num`, tf + 0.3, P.from, P.to, 1.0, {});
  ctx.cue(tf + 0.3, "typing", 0.2, 1.0); ctx.cue(tf + 1.2, "success", 0.45);
  ctx.row(tf, "তলোয়ারের এক কোপে ভুল সবুজ; বৃত্ত সবুজ হয়ে বাড়ে", `${P.from} → ${P.to}`.replace("→", "থেকে"));
  const tp = Math.min(Math.max(ctx.at(P.proof.on, 0.85), tf + 0.45), ctx.t1 - 0.9);
  ctx.pop(`#${id}pf`, tp); ctx.cue(tp, "impact-bass-1", 0.5, 0.5);
  ctx.row(tp, "প্রমাণের চিপ", P.proof.text);
  return html;
}

function counter(ctx, P) {
  const { id, color: c } = ctx, max = P.max ?? Math.max(P.from, P.to, 1);
  const html = `<div class="scene" id="${id}" style="${cvars(c)}">
  <div class="cn" id="${id}n">${esc(fmtNum(P.from, P))}</div><div class="cl" id="${id}l">${esc(P.label)}</div>
  <div class="ctr" id="${id}t"><b id="${id}b" style="transform:scaleX(${f3(P.from / max)})"></b></div>
  <div class="rowc" style="top:430px"><span class="chip solid" id="${id}pf">${esc(P.proof.text)}</span></div>
</div>`;
  const { t0 } = ctx;
  ctx.show(`#${id}`, t0, {}, 0.3);
  ctx.show(`#${id}n`, t0 + 0.05, { scale: 0.85 }, 0.4); ctx.show(`#${id}l`, t0 + 0.2); ctx.show(`#${id}t`, t0 + 0.25);
  ctx.row(t0, "বড় সংখ্যা আর তার লেবেল", `${fmtNum(P.from, P)} · ${P.label}`);
  const tc = Math.min(ctx.at(P.countOn, 0.3), ctx.t1 - 2.6);
  ctx.count(`#${id}n`, tc, P.from, P.to, 1.4, { pre: P.pre ?? "", post: P.post ?? "", sep: true });
  ctx.js(`tl.to("#${id}b", { scaleX: ${f3(P.to / max)}, duration: 1.4, ease: "power2.out" }, ${f3(tc)});`);
  ctx.cue(tc, "typing", 0.22, 1.4);
  ctx.row(tc, "সংখ্যা গুনে গুনে বদলায়, বার ছোট-বড় হয়", fmtNum(P.to, P));
  const tp = ctx.late(Math.max(ctx.at(P.proof.on, 0.8), tc + 1.5));
  ctx.pop(`#${id}pf`, tp); ctx.cue(tp, "impact-bass-1", 0.5, 0.5);
  ctx.row(tp, "প্রমাণের চিপ", P.proof.text);
  ctx.bot(t0, "perch", null);
  return html;
}

export const ARCHETYPES = { trace, hub, pipeline, fix, dial, counter };
