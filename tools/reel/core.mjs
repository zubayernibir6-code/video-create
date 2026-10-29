// core.mjs — the fixed look of a tools-reel (skill tools-reel): colours, fonts, background, stage lights, the
// original pixel mascot, the terminal, the caption window, the hook, the tool identity cards and the CTA.
// Measured from the reference reel assets/refs/ref-01.mp4 (colours sampled from its frames) and kept inside the
// Reels safe area at 1080×1920: content box x 65–905, y 269–1248 (top 14 %, bottom 35 %, the button rail on the right).
//   captions y 285–405 · stage y 430–1000 · terminal y 1020–1240 · mascot perches on the terminal
// Every function returns HTML; timing goes through the Timeline helper (tl.mjs-style strings, absolute seconds).
import { readFileSync } from "node:fs";
import path from "node:path";
import { captionPages } from "../episode/page-core.mjs";

export const W = 1080, H = 1920;
export const STAGE = { x: 65, y: 430, w: 840, h: 570 };
export const COL = {
  bg: "#07080F", panel: "#0D121D", row: "#121726", termBody: "#090D13", termHead: "#131921", status: "#0C121A",
  ink: "#E8ECF5", muted: "#9AA3B8", dim: "#5B6476", red: "#F65B6D", redBg: "#281315", green: "#30D28E", blue: "#4F8CFF",
};
export const TOOL_COLORS = ["#20D2E9", "#F9AD26", "#B683FB", "#30D28E", "#EE71B4", "#FF8A5B", "#7DD3FC"];
export const COLOR_BN = ["নীলচে সবুজ", "হলুদ", "বেগুনি", "সবুজ", "গোলাপি", "কমলা", "আকাশি"];
export const ORD_BN = ["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম"];
export const SANS = `"Inter", "Hind Siliguri", sans-serif`;
export const MONO = `"JetBrains Mono", "Hind Siliguri", monospace`;

export const f3 = (x) => Number(x).toFixed(3);
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ---- small SVGs (no glyph ticks or arrows: they are not in the pack fonts, CLAUDE.md §0d rule 11) ----------------
const ICONS = path.resolve(import.meta.dirname, "..", "..", "assets", "icons", "lucide", "icons");
export function icon(name, size = 48, color = "currentColor", sw = 2) {
  const svg = readFileSync(path.join(ICONS, `${name}.svg`), "utf8");
  const body = svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>")).replace(/\s+/g, " ").trim();
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none">${body}</svg>`;
}
export const iconExists = (name) => { try { readFileSync(path.join(ICONS, `${name}.svg`)); return true; } catch { return false; } };
export const svgCheck = (size = 26, color = "currentColor", sw = 3.4) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none"><path d="M4 12.5l5 5L20 6.5"/></svg>`;
export const svgChevron = (color = COL.blue) =>
  `<svg width="18" height="26" viewBox="0 0 18 26" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none"><path d="M5 6l8 7-8 7"/></svg>`;

// ---- the mascot: an ORIGINAL pixel bot (not the Claude crab, not any brand's); the antenna tip takes the tool colour
const BODY = ["......A......", "......S......", "...BBBBBBB...", "..BBBBBBBBB..", ".BBEEBBBEEBB.", ".BBEEBBBEEBB.",
  ".BBBBBBBBBBB.", ".BBBBMMMBBBB.", "..BBBBBBBBB..", "..SS.....SS..", "..SS.....SS.."];
const PAL = { B: "#E8ECF5", S: "#9AA3B8", E: "#0D121D", M: "#9AA3B8", W: "#E8ECF5", R: "#B7791F", Y: "#F9D74C", G: "rgba(232,236,245,0.35)" };
// props: [ascii rows, x offset, y offset] in body-grid units; "C" = the current tool colour
const PROPS = {
  hat: [["......C......", ".....CCC.....", "....CCYCC....", "...CCCCCCC...", "..CCCCCCCCC..", ".CCCCCCCCCCC."], 0, -5],
  staff: [["C", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R"], 15, -2],
  helmet: [["....CCCCC....", "..CCCCCCCCC..", ".CCCCCCCCCCC."], 0, 0],
  sword: [[".W.", ".W.", ".W.", ".W.", ".W.", ".W.", ".W.", ".W.", "CCC", ".R.", ".R."], 14, -2],
  lens: [[".CC.", "CGGC", "CGGC", ".CC.", "...S", "....S"], 13, 1],
};
export const PROP_FOR = { trace: "lens", hub: null, pipeline: "helmet", fix: "hat+staff", dial: "sword", counter: null };
function pixels(rows, ox, oy, colorOf) {
  let out = "";
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === ".") { x++; continue; }
      let e = x;
      while (e < row.length && row[e] === ch) e++;
      const [fill, cls] = colorOf(ch);
      out += `<rect${cls ? ` class="${cls}"` : ""} x="${x + ox}" y="${y + oy}" width="${e - x}" height="1" fill="${fill}"/>`;
      x = e;
    }
  });
  return out;
}
export function mascot(firstColor) {
  const body = pixels(BODY, 0, 0, (ch) => (ch === "A" ? [firstColor, "tip"] : ch === "E" ? [PAL.E, null] : [PAL[ch], null]));
  const eyes = `<g id="eyes" style="transform-box:fill-box;transform-origin:50% 50%"><rect x="3" y="4" width="2" height="2" fill="${PAL.E}"/><rect x="8" y="4" width="2" height="2" fill="${PAL.E}"/></g>`;
  const props = Object.entries(PROPS).map(([name, [rows, ox, oy]]) =>
    `<g id="p-${name}" style="opacity:0">${pixels(rows, ox, oy, (ch) => (ch === "C" ? [firstColor, "tip"] : [PAL[ch], null]))}</g>`).join("");
  return `<div id="bot"><div class="bsh"></div><div id="botb"><svg width="198" height="153" viewBox="-4 -6 22 17" shape-rendering="crispEdges">${body}${eyes}${props}</svg></div></div>`;
}
// body-bottom-centre positions (frame px) → the #bot translate
export const BOT_AT = { perch: [800, 1022], center: [485, 790], below: [485, 1000], right: [800, 1000] };
export const botXY = ([x, y]) => ({ x: +(x - 94.5).toFixed(1), y: y - 153 });

// ---- fonts and base css ---------------------------------------------------------------------------------------
export const FONT_CSS = `
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "JetBrains Mono"; font-weight: 100 800; src: url("assets/fonts/JetBrainsMono-Variable.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Baloo Da 2"; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }`;

export const BASE_CSS = `
body { margin: 0; background: ${COL.bg}; }
#root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: ${COL.bg}; font-family: ${SANS}; color: ${COL.ink}; }
#bg { position: absolute; inset: 0; background-color: ${COL.bg};
  background-image: radial-gradient(circle, rgba(255,255,255,0.075) 1.6px, transparent 1.9px), radial-gradient(ellipse at 50% 38%, rgba(48,70,130,0.20), rgba(7,8,15,0) 62%);
  background-size: 34px 34px, 100% 100%; }
.lt { position: absolute; inset: 0; opacity: 0; }
.lt svg { position: absolute; left: 0; top: 0; }
.lt .hz { position: absolute; left: 30px; width: 910px; top: 1004px; height: 3px; opacity: 0.9; }
#stage { position: absolute; left: ${STAGE.x}px; top: ${STAGE.y}px; width: ${STAGE.w}px; height: ${STAGE.h}px; transform-origin: 50% 50%; }
.scene { position: absolute; inset: 0; opacity: 0; }
.panel { background: ${COL.panel}; border: 2px solid rgba(255,255,255,0.08); border-radius: 22px; box-sizing: border-box; }
.rowc { position: absolute; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 12px; white-space: nowrap; border-radius: 999px; border: 2px solid var(--c);
  background: var(--cb); padding: 10px 24px 9px; font: 700 28px/1.2 ${MONO}; color: #FFFFFF; box-shadow: 0 0 22px var(--cg); opacity: 0; }
.chip.solid { background: var(--c); color: ${COL.bg}; }
.mono { width: 104px; height: 104px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center;
  border: 3px solid var(--c); background: var(--cb); color: var(--c); font: 900 40px/1 ${SANS}; box-shadow: 0 0 26px var(--cg); }
/* terminal */
#term { position: absolute; left: 65px; top: 1020px; width: 840px; height: 220px; border-radius: 18px; background: ${COL.termBody};
  border: 2px solid rgba(255,255,255,0.09); overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.55); box-sizing: border-box; }
#term .th { position: relative; height: 46px; background: ${COL.termHead}; display: flex; align-items: center; gap: 10px; padding: 0 18px; }
#term .th i { width: 14px; height: 14px; border-radius: 50%; }
#term .th span { position: absolute; left: 0; right: 0; text-align: center; font: 500 24px/1 ${MONO}; color: ${COL.muted}; }
#term .tv { position: absolute; left: 0; right: 0; top: 52px; height: 120px; overflow: hidden; }
#tlines { position: absolute; left: 22px; right: 22px; top: 0; }
.tln { position: absolute; left: 0; right: 0; height: 40px; display: flex; align-items: center; gap: 12px; font: 500 26px/1 ${MONO}; color: #C9D1DE; white-space: nowrap; opacity: 0; }
.tln .pf { width: 24px; height: 26px; flex: none; display: flex; align-items: center; justify-content: center; }
.tln .tx { display: inline-block; overflow: hidden; white-space: nowrap; line-height: 36px; }
.tln.note { color: ${COL.muted}; }
#term .ts { position: absolute; left: 0; right: 0; bottom: 0; height: 46px; border-top: 1px solid rgba(255,255,255,0.06); background: ${COL.status};
  display: flex; align-items: center; gap: 18px; padding: 0 22px; font: 600 24px/1 ${MONO}; }
.ts .cnt { position: relative; width: 150px; height: 26px; color: ${COL.green}; }
.ts .cnt span { position: absolute; left: 0; top: 0; opacity: 0; white-space: nowrap; }
.ts .bar { flex: none; width: 230px; height: 10px; border-radius: 5px; background: rgba(255,255,255,0.08); overflow: hidden; }
.ts .bar b { display: block; height: 100%; width: 100%; background: ${COL.green}; transform-origin: 0 50%; transform: scaleX(0); }
.ts .acc { margin-left: auto; color: ${COL.muted}; }
/* mascot */
#bot { position: absolute; left: 0; top: 0; width: 198px; height: 153px; }
#botb { position: absolute; inset: 0; }
#bot .bsh { position: absolute; left: 54px; width: 82px; bottom: -4px; height: 8px; border-radius: 50%; background: rgba(0,0,0,0.4); box-shadow: 0 0 10px 5px rgba(0,0,0,0.3); }
/* captions */
#caps { position: absolute; left: 65px; top: 285px; width: 840px; height: 120px; }
.cp { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; gap: 20px; opacity: 0; }
.cw { position: relative; font: 900 60px/1.15 ${SANS}; color: #C9D1DE; opacity: 0.45; white-space: nowrap; }
.bn .cw { font: 700 60px/1.3 "Hind Siliguri", "Inter", sans-serif; }
.cw .sb { position: absolute; left: -12px; right: -12px; top: -2px; bottom: -4px; border: 3px solid var(--c); border-radius: 6px; opacity: 0; }
.cw .sb i { position: absolute; width: 14px; height: 14px; background: #FFFFFF; border: 3px solid var(--c); box-sizing: border-box; border-radius: 3px; }
#flash { position: absolute; inset: 0; background: #FFFFFF; opacity: 0; }
/* hook */
.banner { position: absolute; left: 0; top: 0; width: 840px; height: 84px; border-radius: 18px; background: ${COL.redBg}; border: 2px solid rgba(246,91,109,0.55);
  display: flex; align-items: center; gap: 16px; padding: 0 28px; box-sizing: border-box; font: 800 34px/1 ${SANS}; color: #FFFFFF; opacity: 0; }
.banner b { color: ${COL.red}; font-weight: 800; }
.banner .rd { width: 18px; height: 18px; border-radius: 50%; background: ${COL.red}; box-shadow: 0 0 16px ${COL.red}; flex: none; }
.hk { position: absolute; left: 0; top: 108px; width: 840px; padding: 22px 26px 18px; opacity: 0; }
.hk .hh { font: 800 32px/1.2 ${SANS}; margin-bottom: 10px; }
.hk .hh b { color: ${COL.blue}; }
.hr { display: grid; grid-template-columns: 52px 1fr auto; column-gap: 18px; align-items: center; }
.hr .mono { width: 48px; height: 48px; font-size: 20px; border-width: 2px; box-shadow: none; grid-row: span 2; }
.hr .hn { height: 22px; border-radius: 8px; background: rgba(255,255,255,0.16); }
.hr .hp { font: 600 24px/1.2 ${MONO}; color: ${COL.blue}; }
.hr .hb { grid-column: 2 / 4; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.08); overflow: hidden; margin-top: 6px; }
.hr .hb b { display: block; height: 100%; background: var(--c); transform-origin: 0 50%; transform: scaleX(0); }
/* identity card */
.card { display: flex; align-items: center; justify-content: center; }
.idc { width: 720px; padding: 34px 38px 30px; box-shadow: 0 0 60px var(--cg); border-color: var(--c); }
.idc .it { display: flex; align-items: center; gap: 28px; }
.idc .nm { font: 900 62px/1.05 ${SANS}; color: #FFFFFF; text-wrap: balance; }
.idc .nm em { font-style: normal; color: var(--c); }
.idc .mk { font: 600 30px/1.3 ${SANS}; color: ${COL.muted}; margin-top: 8px; }
.idc .st { margin-top: 24px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.08); font: 600 28px/1.2 ${MONO}; color: ${COL.ink}; }
/* cta */
.cbox { position: absolute; left: 0; top: 0; width: 840px; height: 110px; display: flex; align-items: center; gap: 22px; padding: 0 24px; opacity: 0; }
.ava { width: 72px; height: 72px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4F8CFF, #B683FB); font: 900 34px/1 ${SANS}; color: #FFFFFF; }
.cbox .cc { flex: 1; }
.cbox .ph { font: 600 24px/1.2 ${SANS}; color: ${COL.muted}; }
.cbox .kw { display: inline-block; font: 900 54px/1.1 ${SANS}; color: #FFFFFF; clip-path: inset(0 100% 0 0); }
.send { width: 76px; height: 76px; border-radius: 50%; background: ${COL.blue}; display: flex; align-items: center; justify-content: center; flex: none; }
.dm { position: absolute; left: 0; top: 128px; width: 840px; padding: 20px 24px; border-color: rgba(48,210,142,0.5); opacity: 0; }
.dm .dh { display: flex; align-items: center; gap: 18px; }
.dm .dh .hd { font: 800 32px/1.2 ${SANS}; }
.dm .dh .hs { font: 600 24px/1.2 ${SANS}; color: ${COL.muted}; }
.dm .sent { margin-left: auto; font: 700 24px/1 ${MONO}; color: ${COL.bg}; background: ${COL.green}; border-radius: 999px; padding: 8px 18px; display: flex; gap: 8px; align-items: center; }
.dm .db { margin-top: 18px; border-radius: 16px; background: ${COL.row}; border: 2px solid rgba(79,140,255,0.35); padding: 18px 20px; }
.dm .dt { font: 800 34px/1.2 ${SANS}; margin-bottom: 14px; }
.dm .chips { display: flex; flex-wrap: wrap; gap: 12px; }
.dm .chip { opacity: 1; font-size: 26px; padding: 8px 20px 7px; box-shadow: none; }
.fol { position: absolute; left: 0; right: 0; top: 484px; display: flex; justify-content: center; }
.fol div { position: absolute; top: 0; display: flex; align-items: center; gap: 12px; border-radius: 999px; padding: 14px 34px; font: 800 32px/1.1 ${SANS}; opacity: 0; }
.fol .f1 { background: #FFFFFF; color: ${COL.bg}; }
.fol .f2 { background: ${COL.row}; color: #FFFFFF; border: 2px solid rgba(255,255,255,0.18); }
`;

// ---- pieces with their own markup -----------------------------------------------------------------------------
export function light(id, color) {
  // beams are SVG polygons with a gradient fill: CSS clip-path / filter / radial-gradient count as "heavy overlay"
  // and ~40 of them made HyperFrames capture black frames (its own field note)
  return `<div class="lt" id="${id}">
  <svg width="1080" height="1020"><defs><linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.22"/><stop offset="0.88" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="218,330 252,330 360,1020 110,1020" fill="url(#g-${id})"/><polygon points="728,330 762,330 870,1020 620,1020" fill="url(#g-${id})"/></svg>
  <div class="hz" style="background:linear-gradient(90deg, ${rgba(color, 0)}, ${color} 30%, ${color} 70%, ${rgba(color, 0)});box-shadow:0 0 26px ${color}"></div>
</div>`;
}
export const cvars = (c) => `--c:${c};--cb:${rgba(c, 0.14)};--cg:${rgba(c, 0.32)}`;

export function monogram(tool) {
  if (tool.mono) return tool.mono;
  const words = tool.name.split(/\s+/);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  const digit = tool.name.match(/\d/);
  return (tool.name[0] + (digit ? digit[0] : tool.name[1] ?? "")).toUpperCase().replace(/^(.)(.)$/, (m, a, b) => a + b.toLowerCase());
}

export function idCard(id, tool, color) {
  const words = tool.name.split(/\s+/);
  const name = words.length > 1 ? `${esc(words.slice(0, -1).join(" "))} <em>${esc(words.at(-1))}</em>` : esc(tool.name);
  const badge = tool.icon ? `<div class="mono">${icon(tool.icon, 52, color, 2.2)}</div>` : `<div class="mono">${esc(monogram(tool))}</div>`;
  return `<div class="scene card" id="${id}"><div class="idc panel" style="${cvars(color)}">
  <div class="it">${badge}<div><div class="nm">${name}</div>${tool.maker ? `<div class="mk">${esc(tool.maker)}</div>` : ""}</div></div>
  ${tool.stat ? `<div class="st">${esc(tool.stat)}</div>` : ""}
</div></div>`;
}

export function hookScene(tools, banner) {
  // the panel ends by stage y 490: below that, on the right, the mascot perches on the terminal
  const N = tools.length, rowH = Math.min(70, Math.floor(290 / N));
  const pct = [33, 42, 24, 17, 30, 38, 21];
  // the names are a teaser: a grey bar the length of the name, not blurred text (blur is a heavy overlay)
  const rows = tools.map((t, i) => `<div class="hr" style="${cvars(TOOL_COLORS[i])};height:${rowH}px"><div class="mono">${esc(monogram(t))}</div><div class="hn" style="width:${Math.min(320, 60 + [...t.name].length * 15)}px"></div>${rowH >= 56 ? `<div class="hp">installing… ${pct[i]}%</div>` : "<div></div>"}<div class="hb"><b id="hb${i}"></b></div></div>`).join("");
  return {
    html: `<div class="scene" id="s-hook" style="opacity:1">
  <div class="banner" id="hbn"><i class="rd"></i><span>${esc(banner[0])}</span><span style="color:${COL.muted}">·</span><b>${esc(banner[1])}</b></div>
  <div class="hk panel" id="hkp"><div class="hh">Tools <span style="color:${COL.muted}">·</span> <b>Installing ${N}</b></div>${rows}</div>
</div>`,
    pct,
  };
}

export function ctaScene(tools, handle, keyword, dmText) {
  const initial = (handle.replace(/^@/, "")[0] ?? "Y").toUpperCase();
  const chips = tools.map((t, i) => `<span class="chip" style="${cvars(TOOL_COLORS[i])}">${esc(t.name)}</span>`).join("");
  return `<div class="scene" id="s-cta">
  <div class="cbox panel" id="cbx"><div class="ava">${esc(initial)}</div><div class="cc"><div class="ph">Add a comment…</div><span class="kw" id="ckw">${esc(keyword)}</span></div><div class="send" id="csend">${icon("arrow-up", 40, "#FFFFFF", 3)}</div></div>
  <div class="dm panel" id="cdm"><div class="dh"><div class="ava">${esc(initial)}</div><div><div class="hd">${esc(handle)}</div><div class="hs">sent you a message</div></div><div class="sent">${svgCheck(22, COL.bg, 3.6)}sent</div></div>
    <div class="db"><div class="dt">${esc(dmText)}</div><div class="chips">${chips}</div></div></div>
  <div class="fol"><div class="f1" id="cf1">Follow for more</div><div class="f2" id="cf2">Following ${svgCheck(26, "#FFFFFF", 3.4)}</div></div>
</div>`;
}

// terminal: lines [{t, kind: cmd|ok|note, text, color}] in time order; counts: install times for the tools k/N line
export function terminal(title, lines, N) {
  const html = `<div id="term"><div class="th"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span>${esc(title)}</span></div>
  <div class="tv"><div id="tlines">${lines.map((l, i) => `<div class="tln ${l.kind}" id="tl${i}" style="top:${i * 40}px${l.color ? `;color:${l.color}` : ""}"><span class="pf">${l.kind === "cmd" ? svgChevron() : l.kind === "ok" ? svgCheck(24, l.color ?? COL.green, 3.4) : ""}</span><span class="tx"${l.kind === "cmd" ? ' style="width:0"' : ""}>${esc(l.text)}</span></div>`).join("")}</div></div>
  <div class="ts"><span class="cnt">${Array.from({ length: N + 1 }, (_, k) => `<span id="cnt${k}"${k === 0 ? ' style="opacity:1"' : ""}>tools ${k}/${N}</span>`).join("")}</span><span class="bar"><b id="tbar"></b></span><span class="acc">&gt;&gt; accept edits on</span></div></div>`;
  return html;
}

// captions: words [{text,start,end,part,color,em}] → pages of 2–3 words, the spoken word white, the next ones faint
export function captions(words) {
  const pages = captionPages(words, { maxWords: 3, minWords: 2, maxChars: 20, gapBreak: 0.45 });
  let html = "", wi = 0;
  const js = [];
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    const show = Math.max(0, p[0].start - 0.12);
    let hide = p.at(-1).end + 0.45;
    if (next) hide = Math.min(hide, next[0].start - 0.13);
    html += `<div class="cp" id="cp${i}">${p.map((w) => {
      const id = `cw${wi++}`;
      w.id = id;
      return `<span class="cw" id="${id}"${w.em ? ` style="--c:${w.color}"` : ""}>${esc(w.text)}${w.em ? `<span class="sb"><i style="left:-8px;top:-8px"></i><i style="right:-8px;top:-8px"></i><i style="left:-8px;bottom:-8px"></i><i style="right:-8px;bottom:-8px"></i></span>` : ""}</span>`;
    }).join("")}</div>\n`;
    js.push(`tl.set("#cp${i}", { opacity: 1 }, ${f3(show)}); tl.set("#cp${i}", { opacity: 0 }, ${f3(hide)});`);
    p.forEach((w, k) => {
      const on = Math.max(show + 0.01, w.start - 0.08);
      js.push(`tl.to("#${w.id}", { opacity: 1, color: "#FFFFFF", duration: 0.1, ease: "power1.out" }, ${f3(on)});`);
      if (w.em) js.push(`tl.to("#${w.id} .sb", { opacity: 1, duration: 0.1 }, ${f3(on)});`);
      const nx = p[k + 1];
      if (nx) js.push(`tl.to("#${w.id}", { color: "${COL.muted}", duration: 0.12 }, ${f3(Math.max(on + 0.11, nx.start - 0.08))});`);
    });
  });
  return { html, js, pages };
}
