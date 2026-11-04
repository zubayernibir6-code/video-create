// scenes.mjs — the scene types of the EXP1 explainer look ("ব্যাখ্যা বোর্ড": warm dark board, coral accent, gold for
// what is being said, simplified app windows, drawn icons). Each type is (sc, K) → html; K is the kit build.mjs makes
// per scene: K.id(s) element ids, K.t(ref) a time, K.rv(...) a reveal tween, K.out(...), K.snd(ref, file, vol) a
// sound, K.tw(raw tween line). Every element that appears later is hidden in CSS (class rv) and revealed by ONE
// fromTo whose vars carry every key it moves (seek-safe, preflight from_only/shown_early).
// Stage area: x 60–1860, y 110–900 (the caption pill lives below 920, the chapter bar above 100).
import { icon } from "./icons.mjs";

export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
// **gold** and `mono` inside on-screen text
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="g">$1</b>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n/g, "<br>");

export const CSS = `
.scene { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; opacity: 0; }
.rv { opacity: 0; }
.abs { position: absolute; }
.g { color: var(--gold); font-weight: inherit; }
code { font-family: "JetBrains Mono", "Hind Siliguri", monospace; font-size: 0.86em; color: #FFD9C7; background: rgba(224,122,85,0.14); padding: 0 8px; border-radius: 8px; }
.kicker { font: 600 34px/1.3 "Hind Siliguri", sans-serif; color: var(--coral); }
.h1 { font: 800 112px/1.12 "Baloo Da 2", "Hind Siliguri", sans-serif; color: var(--text); }
.h1en { font: 800 118px/1.1 "Inter", "Hind Siliguri", sans-serif; color: var(--text); letter-spacing: -0.02em; }
.h2 { font: 700 64px/1.2 "Baloo Da 2", "Hind Siliguri", sans-serif; color: var(--text); }
.sub { font: 500 40px/1.4 "Hind Siliguri", sans-serif; color: var(--muted); text-wrap: balance; }
.center { left: 0; width: 1920px; text-align: center; }
.win { position: absolute; background: var(--panel); border-radius: 22px; box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px var(--edge); overflow: hidden; }
.wbar { height: 58px; background: var(--panel2); border-bottom: 1px solid var(--edge); display: flex; align-items: center; padding: 0 22px; gap: 10px; }
.wbar i { width: 14px; height: 14px; border-radius: 50%; background: #3A332D; display: block; }
.wbar span { margin-left: 14px; font: 600 26px/1 "Inter", "Hind Siliguri", sans-serif; color: var(--muted); }
.wbody { position: relative; padding: 28px 32px; }
.note { position: absolute; font: 500 24px/1.3 "Hind Siliguri", sans-serif; color: #8E857B; }
.chip { display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px 12px; border-radius: 999px; background: rgba(224,122,85,0.14); box-shadow: inset 0 0 0 2px rgba(224,122,85,0.55); font: 600 32px/1.25 "Hind Siliguri", sans-serif; color: #FFD9C7; white-space: nowrap; }
.chip.gold { background: rgba(242,184,75,0.14); box-shadow: inset 0 0 0 2px rgba(242,184,75,0.6); color: var(--gold); }
.chip.green { background: rgba(91,196,138,0.14); box-shadow: inset 0 0 0 2px rgba(91,196,138,0.6); color: #9FE3BB; }
.chip.red { background: rgba(229,96,79,0.14); box-shadow: inset 0 0 0 2px rgba(229,96,79,0.6); color: #FFB2A6; }
.card { position: absolute; background: var(--panel); border-radius: 22px; box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px var(--edge); }
.num { width: 64px; height: 64px; border-radius: 50%; background: var(--coral); color: #1B0F0A; display: flex; align-items: center; justify-content: center; font: 800 38px/1 "Baloo Da 2", sans-serif; padding-top: 5px; box-sizing: border-box; flex: none; }
.mono { font-family: "JetBrains Mono", "Hind Siliguri", monospace; }
/* chat */
.msgs { display: flex; flex-direction: column; gap: 22px; }
.msg { display: flex; gap: 16px; align-items: flex-start; }
.msg.user { justify-content: flex-end; }
.av { width: 52px; height: 52px; border-radius: 50%; background: rgba(224,122,85,0.16); display: flex; align-items: center; justify-content: center; flex: none; }
.bub { max-width: 78%; padding: 16px 24px 18px; border-radius: 22px; font: 500 32px/1.45 "Hind Siliguri", sans-serif; color: var(--text); }
.user .bub { background: #2B2520; border-bottom-right-radius: 6px; }
.ai .bub { background: transparent; box-shadow: inset 0 0 0 1px var(--edge); border-bottom-left-radius: 6px; }
.bub .row { display: block; font-size: 30px; color: #DCD3C8; }
.thinking { display: inline-flex; align-items: center; gap: 12px; padding: 8px 18px 10px; border-radius: 12px; background: rgba(242,184,75,0.12); color: var(--gold); font: 600 28px/1.3 "Hind Siliguri", sans-serif; }
.filecard { display: flex; align-items: center; gap: 18px; padding: 16px 20px; border-radius: 18px; background: #231E1A; box-shadow: inset 0 0 0 1px var(--edge); margin-top: 14px; }
.filecard b { display: block; font: 600 30px/1.3 "Inter", "Hind Siliguri", sans-serif; color: var(--text); }
.filecard span { font: 500 24px/1.3 "Hind Siliguri", sans-serif; color: var(--muted); }
.btn { margin-left: auto; padding: 10px 22px 12px; border-radius: 12px; background: var(--coral); color: #1B0F0A; font: 700 28px/1.2 "Hind Siliguri", sans-serif; display: flex; align-items: center; gap: 10px; }
/* tree + code */
.tree { font: 500 36px/1.0 "JetBrains Mono", "Hind Siliguri", monospace; color: var(--text); }
.trow { display: flex; align-items: center; gap: 16px; height: 66px; position: relative; }
.trow .hlb { position: absolute; left: -16px; right: -16px; top: 4px; bottom: 4px; border-radius: 12px; background: rgba(242,184,75,0.13); box-shadow: inset 0 0 0 2px rgba(242,184,75,0.5); }
.trow > * { position: relative; }
.codeb { font: 500 31px/1.0 "JetBrains Mono", "Hind Siliguri", monospace; color: #E9E1D6; }
.cl { height: 54px; display: flex; align-items: center; white-space: pre; position: relative; }
.cl .hlb { position: absolute; left: -14px; right: -14px; top: 3px; bottom: 3px; border-radius: 10px; background: rgba(242,184,75,0.13); box-shadow: inset 0 0 0 2px rgba(242,184,75,0.5); }
.cl > span { position: relative; }
.k { color: #E07A55; } .s { color: #9FE3BB; } .c { color: #8E857B; } .h { color: var(--gold); font-weight: 700; }
.tag { position: absolute; }
/* toggles */
.tg { width: 84px; height: 46px; border-radius: 23px; background: #3A332D; position: relative; flex: none; }
.tg .kn { position: absolute; left: 5px; top: 5px; width: 36px; height: 36px; border-radius: 50%; background: #CFC6BA; }
.tg .on { position: absolute; inset: 0; border-radius: 23px; background: var(--green); opacity: 0; }
.srow { display: flex; align-items: center; gap: 24px; padding: 22px 26px; border-radius: 16px; background: #231E1A; box-shadow: inset 0 0 0 1px var(--edge); }
.srow .tx { flex: 1; }
.srow b { display: block; font: 600 32px/1.3 "Inter", "Hind Siliguri", sans-serif; color: var(--text); }
.srow span { display: block; font: 500 26px/1.35 "Hind Siliguri", sans-serif; color: var(--muted); }
.nav { display: flex; flex-direction: column; gap: 8px; }
.nav div { padding: 14px 20px; border-radius: 12px; font: 500 30px/1.2 "Inter", sans-serif; color: var(--muted); position: relative; }
.nav div.act { color: var(--text); }
.nav .navhl { position: absolute; inset: 0; border-radius: 12px; background: rgba(224,122,85,0.16); box-shadow: inset 0 0 0 2px rgba(224,122,85,0.5); }
.nav div span { position: relative; }
.crumb { display: flex; align-items: center; gap: 14px; font: 600 34px/1.2 "Inter", "Hind Siliguri", sans-serif; color: var(--text); }
.crumb .sep { color: var(--coral); display: flex; }
/* desk */
.desk { position: absolute; border-radius: 28px; background: linear-gradient(160deg, #2A221B, #1E1813); box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,220,180,0.08); }
.paper { position: absolute; width: 230px; height: 150px; border-radius: 10px; background: #EFE7DA; box-shadow: 0 8px 18px rgba(0,0,0,0.35); }
.paper i { display: block; height: 10px; margin: 18px 22px 0; border-radius: 5px; background: #C9BDAA; }
.paper i:nth-child(2) { width: 70%; } .paper i:nth-child(3) { width: 85%; } .paper i:nth-child(4) { width: 55%; }
.meter { position: absolute; height: 26px; border-radius: 13px; background: #2B2520; overflow: hidden; box-shadow: inset 0 0 0 1px var(--edge); }
.meter .fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; transform-origin: 0 50%; border-radius: 13px; }
.spine { position: absolute; bottom: 0; border-radius: 6px 6px 3px 3px; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.spine span { writing-mode: vertical-rl; transform: rotate(180deg); font: 600 24px/1 "JetBrains Mono", "Hind Siliguri", monospace; color: #1B140F; padding: 14px 0; white-space: nowrap; }
.shelf { position: absolute; height: 16px; border-radius: 6px; background: #4A3B2E; }
.mini { position: absolute; border-radius: 16px; background: #EFE7DA; color: #2A2018; box-shadow: 0 14px 30px rgba(0,0,0,0.4); padding: 18px 22px; font: 600 28px/1.35 "Hind Siliguri", sans-serif; }
.mini .mt { font: 700 26px/1.2 "JetBrains Mono", "Hind Siliguri", monospace; color: #8A4A2E; margin-bottom: 8px; display: block; }
.stepn { display: flex; gap: 22px; }
.stepn div { display: flex; align-items: center; gap: 14px; padding: 10px 24px 12px 12px; border-radius: 999px; background: #231E1A; box-shadow: inset 0 0 0 1px var(--edge); font: 600 30px/1.2 "Hind Siliguri", sans-serif; color: var(--muted); position: relative; }
.stepn .sn { width: 46px; height: 46px; border-radius: 50%; background: #3A332D; color: var(--text); display: flex; align-items: center; justify-content: center; font: 800 28px/1 "Baloo Da 2", sans-serif; padding-top: 4px; box-sizing: border-box; position: relative; }
.stepn .act { position: absolute; inset: 0; border-radius: 999px; box-shadow: inset 0 0 0 2px var(--coral); background: rgba(224,122,85,0.14); }
/* tiles, rows */
.tile { position: absolute; width: 330px; height: 330px; border-radius: 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; box-shadow: 0 24px 60px rgba(0,0,0,0.45); }
.tile .glyph { width: 150px; height: 150px; border-radius: 30px; display: flex; align-items: center; justify-content: center; font: 800 76px/1 "Inter", sans-serif; color: #fff; }
.tile b { font: 700 40px/1.2 "Inter", "Hind Siliguri", sans-serif; color: var(--text); }
.brow { display: flex; align-items: center; gap: 26px; padding: 22px 34px 24px 24px; border-radius: 22px; background: var(--panel); box-shadow: 0 18px 44px rgba(0,0,0,0.4), 0 0 0 1px var(--edge); font: 600 42px/1.3 "Hind Siliguri", sans-serif; color: var(--text); }
.bic { width: 76px; height: 76px; border-radius: 20px; background: rgba(224,122,85,0.16); display: flex; align-items: center; justify-content: center; flex: none; }
.ucard { position: absolute; width: 400px; padding: 34px 30px 36px; border-radius: 26px; background: var(--panel); box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px var(--edge); }
.ucard .bic { margin-bottom: 22px; }
.ucard b { display: block; font: 700 40px/1.25 "Baloo Da 2", "Hind Siliguri", sans-serif; color: var(--text); margin-bottom: 8px; }
.ucard span { display: block; font: 500 32px/1.4 "Hind Siliguri", sans-serif; color: var(--muted); }
.term { font: 500 32px/1.0 "JetBrains Mono", "Hind Siliguri", monospace; color: #E9E1D6; }
.tl { height: 52px; display: flex; align-items: center; white-space: pre; gap: 14px; }
.flowstep { position: absolute; width: 400px; padding: 30px 26px; border-radius: 24px; background: var(--panel); box-shadow: 0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px var(--edge); text-align: center; }
.flowstep .bic { margin: 0 auto 18px; width: 92px; height: 92px; border-radius: 24px; }
.flowstep b { display: block; font: 700 38px/1.3 "Hind Siliguri", sans-serif; color: var(--text); }
.flowstep span { display: block; font: 500 28px/1.3 "Inter", "Hind Siliguri", sans-serif; color: var(--muted); margin-top: 6px; }
.menu { position: absolute; border-radius: 16px; background: #2A241F; box-shadow: 0 18px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--edge); padding: 10px; }
.menu div { padding: 14px 20px; border-radius: 10px; font: 600 30px/1.2 "Inter", sans-serif; color: var(--text); display: flex; align-items: center; gap: 12px; position: relative; }
.menu .mhl { position: absolute; inset: 0; border-radius: 10px; background: rgba(224,122,85,0.18); }
.menu div > * { position: relative; }
.ring { position: absolute; width: 70px; height: 70px; margin: -35px 0 0 -35px; border-radius: 50%; border: 4px solid var(--gold); opacity: 0; }
`;

// ── shared bits ──
const win = (id, x, y, w, h, title, body, extra = "") =>
  `<div class="win rv" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px" ${extra}><div class="wbar"><i></i><i></i><i></i><span>${esc(title)}</span></div><div class="wbody">${body}</div></div>`;
const av = () => `<div class="av">${icon("sparkles", 30, "#E07A55")}</div>`;
const tick = (size = 34, color = "#5BC48A") => icon("check", size, color);
const cross = (size = 34, color = "#E5604F") => icon("x", size, color);
const arrowSvg = (w, color = "#E07A55") => `<svg width="${w}" height="40" viewBox="0 0 ${w} 40" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20H${w - 10}" pathLength="1"/><path d="M${w - 26} 6 ${w - 8} 20 ${w - 26} 34"/></svg>`;
// a ring pulse at a point (a click / a tap) — two fromTo on its own element
function ring(K, key, x, y, ref) {
  K.tw(`tl.fromTo("#${K.id(key)}", { opacity: 0.95, scale: 0.4 }, { opacity: 0, scale: 1.8, duration: 0.55, ease: "power2.out", immediateRender: false }, ${K.t(ref).toFixed(3)});`);
  return `<div class="ring" id="${K.id(key)}" style="left:${x}px;top:${y}px"></div>`;
}
// a toggle switch: off → on at ref
function toggleOn(K, key, ref) {
  const t = K.t(ref).toFixed(3);
  K.tw(`tl.fromTo("#${K.id(key)} .kn", { x: 0, backgroundColor: "#CFC6BA" }, { x: 38, backgroundColor: "#FFFFFF", duration: 0.28, ease: "power2.out" }, ${t});`);
  K.tw(`tl.fromTo("#${K.id(key)} .on", { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power1.out" }, ${t});`);
  K.snd(ref, "click", 0.4);
  return `<div class="tg" id="${K.id(key)}"><div class="on"></div><div class="kn"></div></div>`;
}

// ── scene types ──
export const SCENES = {
  // big title card: kicker, title (Bengali or English), sub, optional chips
  title(sc, K) {
    const T = sc.title;
    K.rv(K.id("k"), sc.at ?? "start", "up", { delay: 0.05 });
    K.rv(K.id("t"), sc.at ?? "start", "pop", { delay: 0.15 });
    if (sc.sub) K.rv(K.id("s"), sc.subAt ?? sc.at ?? "start", "up", { delay: 0.35 });
    if (sc.icon) K.rv(K.id("i"), sc.at ?? "start", "pop", { delay: 0.05 });
    return `${sc.icon ? `<div class="abs rv center" id="${K.id("i")}" style="top:210px;display:flex;justify-content:center">${icon(sc.icon, 110, "#E07A55")}</div>` : ""}
<div class="abs rv kicker center" id="${K.id("k")}" style="top:${sc.icon ? 345 : 300}px">${esc(sc.kicker ?? "")}</div>
<div class="abs rv ${/[a-z]/i.test(T) && !/[ঀ-৿]/.test(T) ? "h1en" : "h1"} center" id="${K.id("t")}" style="top:${sc.icon ? 440 : 395}px">${rich(T)}</div>
${sc.sub ? `<div class="abs rv sub center" id="${K.id("s")}" style="top:${sc.icon ? 612 : 567}px">${rich(sc.sub)}</div>` : ""}`;
  },

  // the hook: a timeline that builds itself + the list of skills that made it
  editor(sc, K) {
    const X = 130, Y = 190, W = 1110, H = 640, laneX = 230, laneW = W - laneX - 64;
    K.rv(K.id("w"), "start", "up");
    K.rv(K.id("p"), "start", "up", { delay: 0.15 });
    K.rv(K.id("b"), sc.badgeAt ?? "start", "down", { delay: 0.2 });
    const rows = sc.tracks.map((tr, i) => {
      const y = 40 + i * 132;
      const clips = tr.clips.map(([x0, w], j) => {
        const cid = K.id(`c${i}${j}`);
        K.rv(cid, "start", "grow", { delay: 0.35 + i * 0.22 + j * 0.45, dur: 0.5 });
        return `<div class="abs rv" id="${cid}" style="left:${laneX + x0 * laneW}px;top:${y + 14}px;width:${w * laneW - 8}px;height:76px;border-radius:12px;background:${tr.color};opacity:0;transform-origin:0 50%"></div>`;
      }).join("");
      if (tr.at) { K.rv(K.id(`h${i}`), tr.at, "fade", { dur: 0.25 }); K.snd(tr.at, "pop", 0.35); }
      return `<div class="abs" style="left:32px;top:${y + 26}px;font:600 34px/1.4 'Hind Siliguri',sans-serif;color:#CFC6BA">${esc(tr.label)}</div>
<div class="abs rv" id="${K.id(`h${i}`)}" style="left:20px;top:${y + 4}px;width:${W - 64}px;height:100px;border-radius:16px;box-shadow:inset 0 0 0 2px rgba(242,184,75,0.65);background:rgba(242,184,75,0.08)"></div>${clips}`;
    }).join("");
    const head = K.id("ph");
    const t0 = K.t("start"), t1 = K.T1;
    K.tw(`tl.fromTo("#${head}", { x: 0, opacity: 1 }, { x: ${laneW - 4}, opacity: 1, duration: ${(t1 - t0).toFixed(3)}, ease: "none" }, ${t0.toFixed(3)});`);
    const sk = sc.skills.map((s, i) => {
      const sid = K.id(`s${i}`);
      K.rv(sid, sc.skillsAt, "left", { delay: i * 0.28 });
      K.snd(sc.skillsAt, "pop", 0.32, i * 0.28);
      return `<div class="rv" id="${sid}" style="display:flex;align-items:center;gap:16px;height:84px;font:600 34px/1 'JetBrains Mono','Hind Siliguri',monospace;color:#F3EDE4">${tick(36)}<span>${esc(s)}</span></div>`;
    }).join("");
    return `${win(K.id("w"), X, Y, W, H, sc.title ?? "টাইমলাইন", `<div class="abs" style="left:0;top:0;width:${W}px;height:${H - 58}px">${rows}
<div class="abs" id="${head}" style="left:${laneX}px;top:20px;width:4px;height:${sc.tracks.length * 132}px;background:#F2B84B;box-shadow:0 0 14px rgba(242,184,75,0.8)"></div></div>`)}
${win(K.id("p"), 1290, Y, 500, H, sc.panelTitle ?? "স্কিল", `<div style="padding:6px 6px">${sk}</div>`)}
<div class="abs rv center" id="${K.id("b")}" style="top:108px;display:flex;justify-content:center"><div class="chip gold">${icon("sparkles", 30, "#F2B84B")}<span>${esc(sc.badge)}</span></div></div>`;
  },

  // three numbered promise cards under a title
  promise(sc, K) {
    K.rv(K.id("k"), "start", "up");
    K.rv(K.id("t"), "start", "pop", { delay: 0.12 });
    const n = sc.items.length, cw = 500, gap = 40, x0 = (1920 - (n * cw + (n - 1) * gap)) / 2;
    const cards = sc.items.map((it, i) => {
      const cid = K.id(`c${i}`);
      K.rv(cid, it.at, "up");
      K.snd(it.at, "pop", 0.35);
      return `<div class="card rv" id="${cid}" style="left:${x0 + i * (cw + gap)}px;top:560px;width:${cw}px;height:190px;display:flex;align-items:center;gap:26px;padding:0 34px;box-sizing:border-box"><div class="num">${bn(i + 1)}</div><div style="font:600 40px/1.35 'Hind Siliguri',sans-serif;color:#F3EDE4">${rich(it.text)}</div></div>`;
    }).join("");
    return `<div class="abs rv kicker center" id="${K.id("k")}" style="top:230px">${esc(sc.kicker)}</div>
<div class="abs rv h1en center" id="${K.id("t")}" style="top:285px">${esc(sc.title)}</div>${cards}`;
  },

  // a chat window with messages that appear on their words; optional side panel (chips, a report card, a file)
  chat(sc, K) {
    const X = sc.x ?? (sc.aside ? 120 : 360), W = sc.w ?? (sc.aside ? 1010 : 1200), Y = sc.y ?? 150, H = sc.h ?? 720;
    K.rv(K.id("w"), "start", "up");
    const msgs = sc.messages.map((m, i) => {
      const mid = K.id(`m${i}`);
      K.rv(mid, m.at, m.who === "user" ? "right" : "left");
      K.snd(m.at, m.who === "user" ? "click-soft" : "notification", m.who === "user" ? 0.4 : 0.28);
      const rows = (m.rows ?? []).map((r, j) => {
        const rid = K.id(`m${i}r${j}`);
        K.rv(rid, r.at, "fade", { dur: 0.3 });
        return `<span class="row rv" id="${rid}">${rich(r.text)}</span>`;
      }).join("");
      let extra = "";
      if (m.thinking) { const tid = K.id(`m${i}t`); K.rv(tid, m.thinking.at ?? m.at, "fade", { delay: 0.2 }); extra += `<div class="rv" id="${tid}" style="margin-top:12px"><span class="thinking">${icon("book", 28, "#F2B84B")}${esc(m.thinking.text)}</span></div>`; }
      if (m.file) {
        const fid = K.id(`m${i}f`); K.rv(fid, m.file.at, "pop"); K.snd(m.file.at, "chime", 0.35);
        extra += `<div class="filecard rv" id="${fid}">${icon(m.file.icon ?? "file", 46, "#E07A55")}<div><b>${esc(m.file.name)}</b><span>${esc(m.file.sub ?? "")}</span></div>${m.file.btn ? `<div class="btn" id="${K.id(`m${i}b`)}">${icon("download", 28, "#1B0F0A")}${esc(m.file.btn)}</div>` : ""}</div>`;
        if (m.file.btnAt) { K.tw(`tl.fromTo("#${K.id(`m${i}b`)}", { scale: 1 }, { scale: 1.12, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }, ${K.t(m.file.btnAt).toFixed(3)});`); K.snd(m.file.btnAt, "click", 0.4); }
      }
      return `<div class="msg ${m.who} rv" id="${mid}">${m.who === "ai" ? av() : ""}<div class="bub">${m.text ? `<span>${rich(m.text)}</span>` : ""}${rows}${extra}</div></div>`;
    }).join("");
    if (sc.clear) {
      K.out(K.id("ms"), sc.clear.at, { dur: 0.35 });
      K.rv(K.id("cl"), sc.clear.at, "fade", { delay: 0.4 });
      K.snd(sc.clear.at, "whoosh-short", 0.4);
    }
    let newBtn = "";
    if (sc.newChat) {
      K.rv(K.id("nb"), sc.newChat.show ?? "start", "fade");
      newBtn = `<div class="abs rv" id="${K.id("nb")}" style="right:24px;top:9px;display:flex;align-items:center;gap:8px;padding:6px 16px 8px;border-radius:10px;background:#3A2C24;font:600 26px/1.3 'Hind Siliguri',sans-serif;color:#FFD9C7">${icon("plus", 24, "#FFD9C7")}নতুন চ্যাট</div>${ring(K, "nr", W - 110, 30, sc.newChat.at)}`;
      K.snd(sc.newChat.at, "click", 0.45);
    }
    const body = `<div class="msgs" id="${K.id("ms")}">${msgs}</div>${sc.clear ? `<div class="abs rv" id="${K.id("cl")}" style="left:0;width:${W - 64}px;top:${(H - 58) / 2 - 60}px;text-align:center;font:600 38px/1.4 'Hind Siliguri',sans-serif;color:#8E857B">${rich(sc.clear.text)}</div>` : ""}`;
    let aside = "";
    for (const [i, a] of (sc.aside ?? []).entries()) aside += ASIDE[a.type](a, K, i, X + W + 50);
    return `${win(K.id("w"), X, Y, W, H, sc.title ?? "Claude", body)}${newBtn ? `<div class="abs" style="left:${X}px;top:${Y}px;width:${W}px;height:58px">${newBtn}</div>` : ""}${aside}${sc.noteText ? `<div class="note" style="left:${X}px;top:${Y + H + 14}px">${esc(sc.noteText)}</div>` : ""}`;
  },

  // book → new employee → Claude: the training-manual analogy
  analogy(sc, K) {
    K.rv(K.id("book"), sc.bookAt, "pop"); K.snd(sc.bookAt, "page-turn", 0.45);
    K.rv(K.id("emp"), sc.empAt, "left");
    K.rv(K.id("arr"), sc.giveAt, "fade");
    K.tw(`tl.fromTo("#${K.id("arr")} path:first-child", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, ${K.t(sc.giveAt).toFixed(3)});`);
    K.snd(sc.giveAt, "whoosh-short", 0.35);
    const steps = sc.steps.map((s, i) => { const id = K.id(`st${i}`); K.rv(id, sc.stepsAt, "up", { delay: i * 0.35 }); return `<div class="rv" id="${id}" style="display:flex;gap:14px;align-items:center;font:600 30px/1.35 'Hind Siliguri',sans-serif;color:#2A2018;margin-bottom:12px"><span style="width:40px;flex:none;font:800 32px/1 'Baloo Da 2',sans-serif;color:#8A4A2E">${bn(i + 1)}.</span>${esc(s)}</div>`; }).join("");
    // the employee becomes Claude
    K.out(K.id("empi"), sc.claudeAt, { dur: 0.3 });
    K.rv(K.id("cl"), sc.claudeAt, "pop", { delay: 0.2 }); K.snd(sc.claudeAt, "sparkle", 0.4);
    const reps = sc.results.map((r, i) => { const id = K.id(`r${i}`); K.rv(id, sc.resultsAt, "pop", { delay: i * 0.4 }); K.snd(sc.resultsAt, "success", 0.3, i * 0.4); return `<div class="card rv" id="${id}" style="left:${1250 + i * 0}px;top:${200 + i * 200}px;width:520px;height:160px;display:flex;align-items:center;gap:24px;padding:0 30px;box-sizing:border-box">${icon("file", 54, "#CFC6BA")}<div style="flex:1;font:600 36px/1.3 'Hind Siliguri',sans-serif;color:#F3EDE4">${esc(r)}</div><div style="width:64px;height:64px;border-radius:50%;background:rgba(91,196,138,0.18);display:flex;align-items:center;justify-content:center">${tick(40)}</div></div>`; }).join("");
    return `<div class="abs rv" id="${K.id("emp")}" style="left:150px;top:300px;width:300px;text-align:center">
  <div class="rv" id="${K.id("empi")}" style="opacity:1"><div style="width:220px;height:220px;margin:0 auto;border-radius:50%;background:#231E1A;box-shadow:0 0 0 2px var(--edge);display:flex;align-items:center;justify-content:center">${icon("user", 120, "#CFC6BA")}</div><div style="margin-top:22px;font:600 38px/1.3 'Hind Siliguri',sans-serif;color:#F3EDE4">${esc(sc.empLabel)}</div></div>
  <div class="abs rv" id="${K.id("cl")}" style="left:0;top:0;width:300px"><div style="width:220px;height:220px;margin:0 auto;border-radius:50%;background:rgba(224,122,85,0.16);box-shadow:0 0 0 3px rgba(224,122,85,0.6),0 0 60px rgba(224,122,85,0.35);display:flex;align-items:center;justify-content:center">${icon("sparkles", 120, "#E07A55")}</div><div style="margin-top:22px;font:700 40px/1.3 'Inter','Hind Siliguri',sans-serif;color:#F3EDE4">Claude</div></div>
</div>
<div class="abs rv" id="${K.id("arr")}" style="left:480px;top:400px">${arrowSvg(150)}</div>
<div class="abs rv" id="${K.id("book")}" style="left:660px;top:190px;width:500px;height:620px;border-radius:18px 28px 28px 18px;background:#EFE7DA;box-shadow:0 30px 70px rgba(0,0,0,0.5), inset 18px 0 0 #D9C9B0">
  <div style="margin:44px 40px 0 60px;font:800 52px/1.2 'Baloo Da 2','Hind Siliguri',sans-serif;color:#8A4A2E">${esc(sc.bookTitle)}</div>
  <div style="margin:10px 40px 30px 60px;height:4px;width:120px;background:#E07A55;border-radius:2px"></div>
  <div style="margin:0 40px 0 60px">${steps}</div>
</div>${reps}`;
  },

  // a skill folder (tree) + its SKILL.md (code), parts highlighted on their words
  skillfile(sc, K) {
    K.rv(K.id("tw"), sc.treeAt ?? "start", "up");
    const rows = sc.tree.map((r, i) => {
      const id = K.id(`t${i}`);
      if (r.at) { K.rv(id, r.at, "left"); K.snd(r.at, "pop", 0.32); }
      if (r.hl) K.rv(K.id(`t${i}h`), r.hl, "fade", { dur: 0.3 });
      return `<div class="trow ${r.at ? "rv" : ""}" id="${id}" style="padding-left:${r.depth * 48}px">${r.hl ? `<div class="hlb rv" id="${K.id(`t${i}h`)}" data-design-allow-misalign></div>` : ""}${icon(r.icon ?? (r.depth ? "file" : "folder"), 40, r.icon === "folder" || !r.depth ? "#E07A55" : "#CFC6BA")}<span>${esc(r.name)}</span></div>`;
    }).join("");
    K.rv(K.id("cw"), sc.codeAt, "right");
    K.snd(sc.codeAt, "whoosh-short", 0.35);
    const lines = sc.code.map((l, i) => {
      const id = K.id(`l${i}`);
      if (l.at) { K.rv(id, l.at, "wipe", { dur: 0.45 }); K.snd(l.at, "key-press", 0.3); }
      if (l.hl) K.rv(K.id(`l${i}h`), l.hl, "fade", { dur: 0.3 });
      return `<div class="cl ${l.at ? "rv" : ""}" id="${id}">${l.hl ? `<div class="hlb rv" id="${K.id(`l${i}h`)}" data-design-allow-misalign></div>` : ""}<span>${l.html}</span></div>`;
    }).join("");
    const tags = (sc.tags ?? []).map((g, i) => { const id = K.id(`g${i}`); K.rv(id, g.at, "pop"); K.snd(g.at, "ping", 0.3); return `<div class="tag rv" id="${id}" data-design-allow-straddle style="left:${g.x}px;top:${g.y}px"><span class="chip gold">${esc(g.text)}</span></div>`; }).join("");
    return `${win(K.id("tw"), 100, 170, 620, 640, sc.treeTitle ?? "ফোল্ডার", `<div class="tree">${rows}</div>`)}
${win(K.id("cw"), 770, 170, 1060, 640, "SKILL.md", `<div class="codeb">${lines}</div>`)}${tags}`;
  },

  // a big question with a wall of pasted text
  question(sc, K) {
    K.rv(K.id("q"), "start", "pop");
    K.rv(K.id("w"), sc.pasteAt, "up"); K.snd(sc.pasteAt, "whoosh", 0.35);
    const bars = Array.from({ length: 11 }, (_, i) => `<i style="display:block;height:16px;margin:0 0 18px;border-radius:8px;background:#3A332D;width:${[96, 88, 92, 70, 94, 84, 90, 62, 95, 80, 74][i]}%"></i>`).join("");
    return `<div class="abs rv center" id="${K.id("q")}" style="top:150px"><div class="h2">${rich(sc.text)}</div></div>
<div class="card rv" id="${K.id("w")}" style="left:460px;top:340px;width:1000px;height:520px;padding:40px 46px;box-sizing:border-box;overflow:hidden">
<div style="display:flex;align-items:center;gap:14px;margin-bottom:26px;font:600 30px/1.2 'Hind Siliguri',sans-serif;color:#8E857B">${icon("file", 32, "#8E857B")}${esc(sc.pasteLabel)}</div>${bars}</div>`;
  },

  // the core diagram: context window = a desk; skills = books on a shelf; three steps of loading
  desk(sc, K) {
    const D = { x: 100, y: 250, w: 1020, h: 560 }, S = { x: 1200, y: 250, w: 620 };
    K.rv(K.id("desk"), sc.deskAt, "up");
    K.rv(K.id("lab"), sc.labelAt, "pop"); K.snd(sc.labelAt, "ping", 0.3);
    K.rv(K.id("mtr"), sc.deskAt, "fade", { delay: 0.3 });
    // meter: one fill bar, tweened between levels; colour per level
    const lv = sc.meter; // [[ref, fraction, colour], …]
    let prev = 0, prevC = "#5BC48A";
    lv.forEach(([ref, f, c]) => {
      K.tw(`tl.fromTo("#${K.id("fill")}", { scaleX: ${prev.toFixed(3)}, backgroundColor: "${prevC}" }, { scaleX: ${f.toFixed(3)}, backgroundColor: "${c}", duration: 0.6, ease: "power2.inOut", immediateRender: false }, ${K.t(ref).toFixed(3)});`);
      prev = f; prevC = c;
    });
    // papers pile up (the paste)
    const papers = Array.from({ length: 8 }, (_, i) => {
      const id = K.id(`p${i}`), px = D.x + 90 + (i % 4) * 215 + (i > 3 ? 40 : 0), py = D.y + 110 + (i > 3 ? 150 : 0) + (i % 2) * 18, rot = [-6, 4, -3, 7, 5, -5, 3, -7][i];
      K.tw(`tl.fromTo("#${id}", { opacity: 0, y: -260, rotation: ${rot * 3} }, { opacity: 1, y: 0, rotation: ${rot}, duration: 0.45, ease: "power3.out" }, ${(K.t(sc.paperAt) + i * 0.16).toFixed(3)});`);
      K.tw(`tl.fromTo("#${id}", { opacity: 1, y: 0, rotation: ${rot} }, { opacity: 0, y: -40, rotation: ${rot}, duration: 0.35, ease: "power2.in", immediateRender: false }, ${(K.t(sc.clearAt) + i * 0.03).toFixed(3)});`);
      return `<div class="paper rv" id="${id}" style="left:${px}px;top:${py}px"><i></i><i></i><i></i><i></i></div>`;
    }).join("");
    K.snd(sc.paperAt, "page-turn", 0.4); K.snd(sc.paperAt, "page-turn", 0.3, 0.6);
    // the important note slides off the desk
    const nid = K.id("note");
    K.tw(`tl.fromTo("#${nid}", { opacity: 0, scale: 0.6, x: 0, y: 0, rotation: -4 }, { opacity: 1, scale: 1, x: 0, y: 0, rotation: -4, duration: 0.42, ease: "back.out(1.7)" }, ${(K.t(sc.paperAt) + 0.2).toFixed(3)});`);
    K.tw(`tl.fromTo("#${nid}", { x: 0, y: 0, rotation: -4, opacity: 1 }, { x: 260, y: 360, rotation: 28, opacity: 0, duration: 0.9, ease: "power2.in", immediateRender: false }, ${K.t(sc.lostAt).toFixed(3)});`);
    K.snd(sc.lostAt, "error", 0.3, 0.4);
    K.out(K.id("full"), sc.clearAt, { dur: 0.3 });
    K.rv(K.id("full"), sc.paperAt, "pop", { delay: 1.4 });
    // steps 1-2-3
    K.rv(K.id("steps"), sc.stepsAt, "down"); K.snd(sc.stepsAt, "whoosh-short", 0.35);
    sc.stepAt.forEach((ref, i) => { K.rv(K.id(`sa${i}`), ref, "fade", { dur: 0.3 }); if (i) K.out(K.id(`sa${i - 1}`), ref, { dur: 0.3 }); K.snd(ref, "ping", 0.3); });
    // shelf + spines
    K.rv(K.id("shelf"), sc.shelfAt, "fade");
    const spines = sc.books.map((b, i) => {
      const id = K.id(`b${i}`), h = 300 + ((i * 37) % 70), w = 74;
      K.rv(id, sc.shelfAt, "up", { delay: i * 0.12, dy: 40 });
      return `<div class="spine rv" id="${id}" style="left:${S.x + 30 + i * (w + 12)}px;top:${D.y + 380 - h}px;width:${w}px;height:${h}px;background:${b.color}"><span>${esc(b.name)}</span></div>`;
    }).join("");
    K.snd(sc.shelfAt, "pop", 0.3);
    // many more books later (only colour, no names)
    const more = Array.from({ length: 22 }, (_, i) => {
      const id = K.id(`x${i}`), w = 22, h = 96 + ((i * 53) % 54), col = ["#C7774F", "#7FA7D9", "#8CC69E", "#D9B35C", "#B58AD1", "#D98C8C"][i % 6];
      K.rv(id, sc.manyAt, "up", { delay: i * 0.05, dy: 30 });
      return `<div class="spine rv" id="${id}" style="left:${S.x + 30 + i * (w + 5)}px;top:${D.y + 560 - h}px;width:${w}px;height:${h}px;background:${col}"></div>`;
    }).join("");
    K.rv(K.id("shelf2"), sc.manyAt, "fade");
    K.snd(sc.manyAt, "sparkle", 0.35);
    // the index card on the desk (names + descriptions only)
    K.rv(K.id("idx"), sc.indexAt, "pop"); K.snd(sc.indexAt, "pop", 0.3);
    K.rv(K.id("tok"), sc.tokenAt, "pop"); K.snd(sc.tokenAt, "ping", 0.3);
    // step 2: the request, the match, the book opens on the desk
    K.rv(K.id("req"), sc.reqAt, "down"); K.snd(sc.reqAt, "click-soft", 0.4);
    K.rv(K.id("glow"), sc.matchAt, "fade", { dur: 0.3 }); K.snd(sc.matchAt, "ping", 0.35);
    K.rv(K.id("open"), sc.openAt, "pop"); K.snd(sc.openAt, "page-turn", 0.45);
    // step 3: a resource file, a script that runs, only its result lands
    K.rv(K.id("res"), sc.fileAt, "pop"); K.snd(sc.fileAt, "pop", 0.3);
    K.rv(K.id("run"), sc.runAt, "left"); K.out(K.id("run"), sc.manyAt, { dur: 0.25 });
    K.tw(`tl.fromTo("#${K.id("bar")}", { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: "power1.inOut" }, ${(K.t(sc.runAt) + 0.2).toFixed(3)});`);
    K.snd(sc.runAt, "typing", 0.22);
    K.rv(K.id("out"), sc.resultAt, "pop"); K.snd(sc.resultAt, "cash-register", 0.3);
    K.rv(K.id("empty"), sc.manyAt, "pop", { delay: 0.8 }); K.snd(sc.manyAt, "success", 0.3, 0.8);
    const b0 = 0, bx = S.x + 30 + b0 * 86;
    return `<div class="desk rv" id="${K.id("desk")}" style="left:${D.x}px;top:${D.y}px;width:${D.w}px;height:${D.h}px"></div>
<div class="abs rv" id="${K.id("lab")}" style="left:${D.x + 24}px;top:${D.y - 62}px"><span class="chip">${icon("layers", 30, "#FFD9C7")}<span>${esc(sc.label)}</span></span></div>
<div class="abs rv" id="${K.id("mtr")}" style="left:${D.x + 40}px;top:${D.y + D.h - 58}px;width:${D.w - 80}px;height:40px">
  <div style="position:absolute;left:0;top:-2px;font:600 26px/1 'Hind Siliguri',sans-serif;color:#A89F94">${esc(sc.meterLabel)}</div>
  <div class="meter" style="left:250px;right:0;top:0"><div class="fill" id="${K.id("fill")}" style="transform:scaleX(0);background:#5BC48A"></div></div>
</div>
${papers}
<div class="mini rv" id="${nid}" style="left:${D.x + 640}px;top:${D.y + 60}px;width:300px;background:#F2B84B;color:#2A1C05"><span class="mt" style="color:#5A3A05">${esc(sc.noteTitle)}</span>${esc(sc.noteText)}</div>
<div class="abs rv" id="${K.id("full")}" style="left:${D.x + 380}px;top:${D.y + 20}px"><span class="chip red">${esc(sc.fullText)}</span></div>
<div class="abs rv" id="${K.id("steps")}" style="left:${D.x}px;top:104px"><div class="stepn">${sc.stepNames.map((s, i) => `<div><div class="act rv" id="${K.id(`sa${i}`)}"></div><span class="sn">${bn(i + 1)}</span><span style="position:relative">${esc(s)}</span></div>`).join("")}</div></div>
<div class="shelf rv" id="${K.id("shelf")}" style="left:${S.x}px;top:${D.y + 380}px;width:${S.w}px"></div>
<div class="shelf rv" id="${K.id("shelf2")}" style="left:${S.x}px;top:${D.y + 560}px;width:${S.w}px"></div>
${spines}${more}
<div class="abs rv" id="${K.id("glow")}" style="left:${bx - 8}px;top:${D.y + 380 - 300 - 8 - 0}px;width:90px;height:316px;border-radius:10px;box-shadow:0 0 0 4px #F2B84B, 0 0 40px rgba(242,184,75,0.8)"></div>
<div class="mini rv" id="${K.id("idx")}" style="left:${D.x + 40}px;top:${D.y + 40}px;width:380px;font-size:24px;line-height:1.5"><span class="mt">${esc(sc.indexTitle)}</span>${sc.books.map((b) => `<div class="mono" style="font-size:22px;color:#4A3B2E">${esc(b.name)}</div>`).join("")}</div>
<div class="abs rv" id="${K.id("tok")}" style="left:${D.x + 450}px;top:${D.y + 60}px"><span class="chip gold">${esc(sc.tokenText)}</span></div>
<div class="abs rv" id="${K.id("req")}" style="left:${S.x - 10}px;top:${D.y - 76}px"><div class="bub" style="max-width:none;white-space:nowrap;background:#2B2520;border-radius:22px 22px 6px 22px;font:500 32px/1.4 'Hind Siliguri',sans-serif;color:#F3EDE4;padding:12px 24px 14px">${esc(sc.request)}</div></div>
<div class="mini rv" id="${K.id("open")}" style="left:${D.x + 450}px;top:${D.y + 150}px;width:520px"><span class="mt">${esc(sc.openTitle)}</span>${sc.openLines.map((l) => `<div style="font-size:26px">${esc(l)}</div>`).join("")}</div>
<div class="mini rv" id="${K.id("res")}" style="left:${D.x + 40}px;top:${D.y + 350}px;width:330px"><span class="mt">${esc(sc.fileName)}</span><div style="font-size:24px">${esc(sc.fileSub)}</div></div>
<div class="card rv" id="${K.id("run")}" style="left:${S.x}px;top:${D.y + 410}px;width:${S.w}px;height:120px;padding:20px 26px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:14px;font:600 30px/1.2 'JetBrains Mono','Hind Siliguri',monospace;color:#F3EDE4">${icon("terminal", 32, "#E07A55")}${esc(sc.scriptName)}</div>
  <div style="margin-top:18px;height:14px;border-radius:7px;background:#2B2520;overflow:hidden"><div id="${K.id("bar")}" style="height:100%;background:#E07A55;transform:scaleX(0);transform-origin:0 50%"></div></div></div>
<div class="mini rv" id="${K.id("out")}" style="left:${D.x + 420}px;top:${D.y + 350}px;width:420px;background:#DDF3E5;color:#103A22"><span class="mt" style="color:#1E6B40">${esc(sc.resultTitle)}</span><div style="font:800 40px/1.2 'Baloo Da 2','Hind Siliguri',sans-serif">${esc(sc.resultText)}</div></div>
<div class="abs rv" id="${K.id("empty")}" style="left:${S.x}px;top:${D.y + D.h + 18}px"><span class="chip green">${tick(30)}<span>${esc(sc.emptyText)}</span></span></div>`;
  },

  // benefit rows + one takeaway line
  benefits(sc, K) {
    const rows = sc.items.map((it, i) => {
      const id = K.id(`b${i}`); K.rv(id, it.at, "left"); K.snd(it.at, "pop", 0.35);
      return `<div class="brow rv" id="${id}" style="position:absolute;left:${170 + (i % 2) * 820}px;top:${200 + Math.floor(i / 2) * 170}px;width:760px;box-sizing:border-box"><div class="bic">${icon(it.icon, 44, "#E07A55")}</div>${rich(it.text)}</div>`;
    }).join("");
    K.rv(K.id("tk"), sc.takeAt, "up"); K.snd(sc.takeAt, "impact-bass-2", 0.35);
    K.rv(K.id("a"), sc.arrowAt ?? sc.takeAt, "fade", { delay: 0.2 });
    K.tw(`tl.fromTo("#${K.id("a")} path:first-child", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, ${(K.t(sc.arrowAt ?? sc.takeAt) + 0.2).toFixed(3)});`);
    K.rv(K.id("t2"), sc.take2At ?? sc.takeAt, "pop", { delay: 0.3 });
    return `${rows}<div class="card rv" id="${K.id("tk")}" style="left:170px;top:580px;width:1580px;height:220px;display:flex;align-items:center;justify-content:center;gap:40px;background:linear-gradient(120deg,#2A1E16,#1E1813);box-shadow:0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(242,184,75,0.5)">
<div class="h2" style="font-size:60px">${rich(sc.take[0])}</div><div class="rv" id="${K.id("a")}">${arrowSvg(170, "#F2B84B")}</div><div class="h2 rv" id="${K.id("t2")}" style="font-size:60px;color:#F2B84B">${rich(sc.take[1])}</div></div>`;
  },

  // big tiles (Word, Excel, PowerPoint, PDF) under a kicker + title
  tiles(sc, K) {
    K.rv(K.id("k"), "start", "up"); K.rv(K.id("t"), "start", "pop", { delay: 0.1 });
    const n = sc.tiles.length, w = 330, gap = 50, x0 = (1920 - (n * w + (n - 1) * gap)) / 2;
    const tiles = sc.tiles.map((t, i) => { const id = K.id(`x${i}`); K.rv(id, t.at, "pop"); K.snd(t.at, "pop", 0.4); return `<div class="tile card rv" id="${id}" style="left:${x0 + i * (w + gap)}px;top:430px"><div class="glyph" style="background:${t.color};font-size:${t.glyph.length > 2 ? 54 : 76}px">${esc(t.glyph)}</div><b>${esc(t.name)}</b></div>`; }).join("");
    return `<div class="abs rv kicker center" id="${K.id("k")}" style="top:180px">${esc(sc.kicker)}</div><div class="abs rv h2 center" id="${K.id("t")}" style="top:245px">${rich(sc.title)}</div>${tiles}`;
  },

  // a settings window: breadcrumb, nav, rows with toggles
  settings(sc, K) {
    const X = 260, Y = 210, W = 1400, H = 610;
    K.rv(K.id("w"), sc.winAt ?? "start", "up");
    K.rv(K.id("cr"), sc.winAt ?? "start", "down", { delay: 0.1 });
    const crumbs = sc.crumb.map((c, i) => { const id = K.id(`c${i}`); K.rv(id, c.at, "fade", { dur: 0.3 }); return `${i ? `<span class="sep rv" id="${id}s">${icon("arrow", 30, "#E07A55")}</span>` : ""}<span class="rv" id="${id}">${esc(c.text)}</span>`; }).join("");
    sc.crumb.forEach((c, i) => { if (i) K.rv(K.id(`c${i}`) + "s", c.at, "fade", { dur: 0.3 }); });
    const nav = sc.nav.map((n, i) => { if (n.at) { K.rv(K.id(`n${i}`), n.at, "fade", { dur: 0.3 }); K.snd(n.at, "click", 0.4); } return `<div class="${n.at ? "act" : ""}">${n.at ? `<span class="navhl rv" id="${K.id(`n${i}`)}"></span>` : ""}<span>${esc(n.text)}</span></div>`; }).join("");
    const rows = sc.rows.map((r, i) => {
      if (r.showAt) K.rv(K.id(`r${i}`), r.showAt, "up");
      const tg = r.onAt ? toggleOn(K, `tg${i}`, r.onAt) : `<div class="tg"><div class="kn"></div></div>`;
      if (r.tagAt) { K.rv(K.id(`rt${i}`), r.tagAt, "pop"); K.snd(r.tagAt, "ping", 0.3); }
      return `<div class="srow ${r.showAt ? "rv" : ""}" id="${K.id(`r${i}`)}" style="margin-bottom:18px"><div class="tx"><b>${esc(r.title)}</b>${r.sub ? `<span>${esc(r.sub)}</span>` : ""}${r.tag ? `<div class="rv" id="${K.id(`rt${i}`)}" style="margin-top:12px"><span class="chip gold" style="font-size:28px">${esc(r.tag)}</span></div>` : ""}</div>${tg}</div>`;
    }).join("");
    let ringHtml = "";
    if (sc.rows.some((r) => r.onAt)) { const i = sc.rows.findIndex((r) => r.onAt); const r = sc.rows[i], rowH = 44 + 42 + (r.sub ? 35 : 0) + (r.tag ? 62 : 0); ringHtml = ring(K, "rg", W - 100, 58 + 28 + rowH / 2, r.onAt); }
    return `<div class="abs rv" id="${K.id("cr")}" style="left:${X}px;top:120px"><div class="crumb">${crumbs}</div></div>
${win(K.id("w"), X, Y, W, H, sc.title ?? "Settings", `<div style="display:flex;gap:40px"><div class="nav" style="width:300px">${nav}</div><div style="flex:1">${rows}</div></div>`)}
<div class="abs" style="left:${X}px;top:${Y}px;width:${W}px;height:${H}px">${ringHtml}</div>
${sc.noteText ? `<div class="note" style="left:${X}px;top:${Y + H + 14}px">${esc(sc.noteText)}</div>` : ""}`;
  },

  // the Skills page: rows with toggles, a + button with its menu, an upload dialog
  skillslist(sc, K) {
    const X = sc.x ?? 260, Y = sc.y ?? 210, W = sc.w ?? 1400, H = sc.h ?? 610;
    K.rv(K.id("w"), "start", "up");
    K.rv(K.id("cr"), "start", "down", { delay: 0.1 });
    const rows = sc.rows.map((r, i) => {
      const tg = r.onAt ? toggleOn(K, `tg${i}`, r.onAt) : `<div class="tg"><div class="kn"></div></div>`;
      return `<div class="srow" style="margin-bottom:10px;padding:12px 24px"><div class="bic" style="width:60px;height:60px;border-radius:16px;background:${r.color ?? "rgba(224,122,85,0.16)"}">${r.glyph ? `<span style="font:800 26px/1 Inter,sans-serif;color:#fff">${esc(r.glyph)}</span>` : icon("book", 32, "#E07A55")}</div><div class="tx"><b>${esc(r.name)}</b><span>${esc(r.desc)}</span></div>${tg}</div>`;
    }).join("");
    let extra = "";
    for (const c of sc.chips ?? []) { const id = K.id(`ch${extra.length}`); K.rv(id, c.at, "pop"); K.snd(c.at, "ping", 0.3); extra += `<div class="abs rv" id="${id}" style="left:${c.x}px;top:${c.y}px"><span class="chip ${c.cls ?? "gold"}">${c.icon ? icon(c.icon, 30, "currentColor") : ""}<span>${rich(c.text)}</span></span></div>`; }
    return `<div class="abs rv" id="${K.id("cr")}" style="left:${X}px;top:120px"><div class="crumb"><span>${esc(sc.crumb[0])}</span><span class="sep">${icon("arrow", 30, "#E07A55")}</span><span>${esc(sc.crumb[1])}</span></div></div>
${win(K.id("w"), X, Y, W, H, sc.title ?? "Skills", rows)}${extra}
${sc.noteText ? `<div class="note" style="left:${X}px;top:${Y + H + 14}px">${esc(sc.noteText)}</div>` : ""}`;
  },

  // three steps left to right, then the real buttons in a small mock: + → Create skill → Upload a skill
  flow(sc, K) {
    const steps = sc.steps.map((s, i) => {
      const id = K.id(`f${i}`), x = 150 + i * 560;
      K.rv(id, s.at, "up"); K.snd(s.at, "pop", 0.35);
      let a = "";
      if (i) { const aid = K.id(`a${i}`); K.rv(aid, s.at, "fade"); K.tw(`tl.fromTo("#${aid} path:first-child", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, ${K.t(s.at).toFixed(3)});`); a = `<div class="abs rv" id="${aid}" style="left:${x - 140}px;top:250px">${arrowSvg(120)}</div>`; }
      return `${a}<div class="flowstep rv" id="${id}" style="left:${x}px;top:150px"><div class="bic">${icon(s.icon, 52, "#E07A55")}</div><b>${rich(s.title)}</b><span>${rich(s.sub ?? "")}</span></div>`;
    }).join("");
    // the mini Skills page
    const M = { x: 360, y: 520, w: 1200, h: 340 };
    K.rv(K.id("m"), sc.mockAt, "up");
    K.rv(K.id("menu"), sc.menuAt, "pop"); K.snd(sc.menuAt, "click", 0.4);
    K.rv(K.id("mh0"), sc.createAt, "fade", { dur: 0.2 }); K.snd(sc.createAt, "click", 0.4);
    K.rv(K.id("sub"), sc.createAt, "left", { delay: 0.15 });
    K.rv(K.id("mh1"), sc.uploadAt, "fade", { dur: 0.2 }); K.snd(sc.uploadAt, "click", 0.4);
    K.out(K.id("menu"), sc.uploadAt, { delay: 0.55, dur: 0.2 }); K.out(K.id("sub"), sc.uploadAt, { delay: 0.55, dur: 0.2 });
    K.rv(K.id("drop"), sc.uploadAt, "pop", { delay: 0.75 });
    K.rv(K.id("zip"), sc.uploadAt, "down", { delay: 1.05, dy: 60 }); K.snd(sc.uploadAt, "success", 0.3, 1.45);
    return `${steps}
${win(K.id("m"), M.x, M.y, M.w, M.h, "Customize › Skills", `<div style="display:flex;align-items:center;justify-content:space-between"><div style="font:700 36px/1.2 Inter,sans-serif;color:#F3EDE4">Skills</div>
<div style="width:62px;height:62px;border-radius:16px;background:#E07A55;display:flex;align-items:center;justify-content:center" id="${K.id("plus")}">${icon("plus", 38, "#1B0F0A")}</div></div>
<div class="abs" style="left:32px;top:110px;font:500 28px/1.4 'Hind Siliguri',sans-serif;color:#8E857B">${esc(sc.mockHint ?? "")}</div>`)}
<div class="abs" style="left:${M.x}px;top:${M.y}px;width:${M.w}px;height:${M.h}px">${ring(K, "pr", M.w - 63, 58 + 28 + 31, sc.menuAt)}</div>
<div class="menu rv" id="${K.id("menu")}" style="left:${M.x + M.w - 432}px;top:${M.y + 182}px;width:400px"><div><span class="mhl rv" id="${K.id("mh0")}"></span>${icon("plus", 28, "#F3EDE4")}<span>Create skill</span></div></div>
<div class="menu rv" id="${K.id("sub")}" style="left:${M.x + M.w - 872}px;top:${M.y + 182}px;width:420px"><div><span class="mhl rv" id="${K.id("mh1")}"></span>${icon("upload", 28, "#F3EDE4")}<span>Upload a skill</span></div></div>
<div class="abs rv" id="${K.id("drop")}" style="left:${M.x + 40}px;top:${M.y + 170}px;width:420px;height:140px;border-radius:18px;border:3px dashed rgba(224,122,85,0.6);display:flex;align-items:center;justify-content:center;gap:14px;font:600 28px/1.3 'Hind Siliguri',sans-serif;color:#FFD9C7">
  <div class="rv" id="${K.id("zip")}" style="display:flex;align-items:center;gap:12px">${icon("archive", 44, "#F2B84B")}<span class="mono" style="font-size:28px;color:#F3EDE4">${esc(sc.zipName)}</span></div></div>`;
  },

  // right vs wrong side by side (ZIP layout)
  compare(sc, K) {
    const col = (side, x, i) => {
      const id = K.id(side.key);
      K.rv(id, side.at, "up"); K.snd(side.at, side.ok ? "success" : "error", 0.32);
      const rows = side.tree.map((r) => `<div class="trow" style="padding-left:${r.depth * 52}px;height:72px">${icon(r.icon, 42, r.icon === "file" ? "#CFC6BA" : r.icon === "archive" ? "#F2B84B" : "#E07A55")}<span>${esc(r.name)}</span></div>`).join("");
      return `<div class="card rv" id="${id}" style="left:${x}px;top:200px;width:780px;height:600px;padding:40px 50px;box-sizing:border-box;box-shadow:0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 3px ${side.ok ? "rgba(91,196,138,0.6)" : "rgba(229,96,79,0.6)"}">
<div style="display:flex;align-items:center;gap:18px;margin-bottom:34px"><div style="width:72px;height:72px;border-radius:50%;background:${side.ok ? "rgba(91,196,138,0.18)" : "rgba(229,96,79,0.18)"};display:flex;align-items:center;justify-content:center">${side.ok ? tick(44) : cross(44)}</div><div class="h2" style="font-size:54px;color:${side.ok ? "#9FE3BB" : "#FFB2A6"}">${esc(side.title)}</div></div>
<div class="tree">${rows}</div><div style="margin-top:26px;font:500 32px/1.4 'Hind Siliguri',sans-serif;color:#A89F94">${rich(side.note)}</div></div>`;
    };
    return col(sc.left, 160, 0) + col(sc.right, 980, 1);
  },

  // the description line under a magnifier: the request matches it, the skill opens
  describe(sc, K) {
    K.rv(K.id("c"), "start", "up");
    K.rv(K.id("h"), sc.hlAt, "fade", { dur: 0.3 }); K.snd(sc.hlAt, "ping", 0.3);
    K.rv(K.id("mg"), sc.lensAt, "pop"); K.snd(sc.lensAt, "whoosh-short", 0.3);
    K.rv(K.id("rq"), sc.reqAt, "right"); K.snd(sc.reqAt, "click-soft", 0.4);
    K.rv(K.id("ok"), sc.okAt, "pop"); K.snd(sc.okAt, "success", 0.35);
    return `<div class="card rv" id="${K.id("c")}" style="left:160px;top:200px;width:1600px;height:300px;padding:44px 50px;box-sizing:border-box">
<div class="codeb"><div class="cl"><span class="c">---</span></div><div class="cl"><span><span class="k">name:</span> ${esc(sc.name)}</span></div>
<div class="cl" style="height:auto;white-space:normal;line-height:1.5"><div class="hlb rv" id="${K.id("h")}"></div><span><span class="k">description:</span> <span class="s">${esc(sc.descText)}</span></span></div></div></div>
<div class="abs rv" id="${K.id("mg")}" style="left:1560px;top:150px">${icon("search", 150, "#F2B84B")}</div>
<div class="abs rv" id="${K.id("rq")}" style="left:300px;top:600px"><div class="bub" style="max-width:none;white-space:nowrap;background:#2B2520;border-radius:22px 22px 6px 22px;font:500 36px/1.4 'Hind Siliguri',sans-serif;color:#F3EDE4;padding:16px 28px 18px">${esc(sc.request)}</div></div>
<div class="abs rv" id="${K.id("ok")}" style="left:960px;top:610px"><span class="chip green" style="font-size:36px">${tick(36)}<span>${esc(sc.okText)}</span></span></div>`;
  },

  // use-case cards
  uses(sc, K) {
    K.rv(K.id("t"), "start", "pop");
    const n = sc.cards.length, w = 400, gap = 36, x0 = (1920 - (n * w + (n - 1) * gap)) / 2;
    const cards = sc.cards.map((c, i) => { const id = K.id(`u${i}`); K.rv(id, c.at, "up"); K.snd(c.at, "pop", 0.38); return `<div class="ucard rv" id="${id}" style="left:${x0 + i * (w + gap)}px;top:300px;box-sizing:border-box"><div class="bic">${icon(c.icon, 46, "#E07A55")}</div><b>${esc(c.title)}</b><span>${esc(c.text)}</span></div>`; }).join("");
    K.rv(K.id("bn"), sc.bannerAt, "up"); K.snd(sc.bannerAt, "impact-bass-2", 0.32);
    return `<div class="abs rv h2 center" id="${K.id("t")}" style="top:150px">${rich(sc.title)}</div>${cards}
<div class="abs rv center" id="${K.id("bn")}" style="top:740px;display:flex;justify-content:center"><div class="chip gold" style="font-size:44px;padding:16px 40px 18px">${icon("repeat", 42, "#F2B84B")}<span>${rich(sc.banner)}</span></div></div>`;
  },

  // a terminal: the skills folder of a real project, then a /command, then side chips (what each skill made)
  terminal(sc, K) {
    const X = 120, Y = 170, W = 1060, H = 660;
    K.rv(K.id("w"), "start", "up");
    const lines = sc.lines.map((l, i) => {
      const id = K.id(`l${i}`);
      if (l.at) { K.rv(id, l.at, l.type ? "wipe" : "fade", { dur: l.type ? 0.6 : 0.25, delay: l.delay ?? 0 }); K.snd(l.at, l.type ? "typing" : "key-press", l.type ? 0.22 : 0.18, l.delay ?? 0); }
      return `<div class="tl ${l.at ? "rv" : ""}" id="${id}"><span style="white-space:pre">${l.html}</span></div>`;
    }).join("");
    const chips = sc.chips.map((c, i) => { const id = K.id(`c${i}`); K.rv(id, c.at, "left"); K.snd(c.at, "pop", 0.35); return `<div class="card rv" id="${id}" style="left:1250px;top:${210 + i * 200}px;width:560px;height:160px;display:flex;align-items:center;gap:24px;padding:0 30px;box-sizing:border-box"><div class="bic">${icon(c.icon, 44, "#E07A55")}</div><div><div style="font:700 40px/1.3 'Hind Siliguri',sans-serif;color:#F3EDE4">${esc(c.title)}</div><div class="mono" style="font-size:28px;color:#F2B84B">/${esc(c.skill)}</div></div></div>`; }).join("");
    return `${win(K.id("w"), X, Y, W, H, sc.title ?? "Claude Code", `<div class="term">${lines}</div>`)}${chips}`;
  },

  // a caution card
  warning(sc, K) {
    K.rv(K.id("i"), "start", "pop"); K.snd("start", "notification", 0.35);
    K.rv(K.id("t"), "start", "up", { delay: 0.1 });
    K.rv(K.id("s"), sc.subAt ?? "start", "up");
    K.rv(K.id("f"), sc.lookAt, "up"); K.snd(sc.lookAt, "whoosh-short", 0.3);
    K.rv(K.id("m"), sc.lookAt, "pop", { delay: 0.4 });
    return `<div class="abs rv" id="${K.id("i")}" style="left:200px;top:250px;width:260px;height:260px;border-radius:50%;background:rgba(242,184,75,0.12);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px rgba(242,184,75,0.5)">${icon("shield", 150, "#F2B84B")}</div>
<div class="abs rv h2" id="${K.id("t")}" style="left:520px;top:250px">${rich(sc.title)}</div>
<div class="abs rv sub" id="${K.id("s")}" style="left:520px;top:350px;width:1200px">${rich(sc.sub)}</div>
<div class="card rv" id="${K.id("f")}" style="left:520px;top:500px;width:760px;height:300px;padding:30px 40px;box-sizing:border-box"><div class="tree">${sc.tree.map((r) => `<div class="trow" style="padding-left:${r.depth * 48}px;height:62px">${icon(r.icon, 38, r.icon === "file" ? "#CFC6BA" : "#E07A55")}<span style="font-size:32px">${esc(r.name)}</span></div>`).join("")}</div></div>
<div class="abs rv" id="${K.id("m")}" style="left:1180px;top:530px">${icon("search", 170, "#F2B84B")}</div>`;
  },

  // the end card: keyword in the inbox, three steps
  cta(sc, K) {
    K.rv(K.id("k"), "start", "up"); K.rv(K.id("t"), "start", "pop", { delay: 0.1 });
    K.rv(K.id("kw"), sc.kwAt, "pop"); K.snd(sc.kwAt, "impact-bass-2", 0.4);
    const steps = sc.steps.map((s, i) => { const id = K.id(`s${i}`); K.rv(id, sc.stepsAt, "up", { delay: i * 0.3 }); K.snd(sc.stepsAt, "pop", 0.35, i * 0.3); return `<div class="card rv" id="${id}" style="left:${300 + i * 460}px;top:640px;width:420px;height:150px;display:flex;align-items:center;gap:22px;padding:0 28px;box-sizing:border-box"><div class="num">${bn(i + 1)}</div><div style="font:600 36px/1.3 'Hind Siliguri',sans-serif;color:#F3EDE4">${rich(s)}</div></div>`; }).join("");
    return `<div class="abs rv kicker center" id="${K.id("k")}" style="top:150px">${esc(sc.kicker)}</div>
<div class="abs rv h2 center" id="${K.id("t")}" style="top:218px">${rich(sc.title)}</div>
<div class="abs rv center" id="${K.id("kw")}" style="top:330px;display:flex;justify-content:center"><div style="display:flex;align-items:center;gap:30px;padding:30px 60px 34px;border-radius:30px;background:rgba(224,122,85,0.14);box-shadow:inset 0 0 0 3px rgba(224,122,85,0.7), 0 0 80px rgba(224,122,85,0.25)">${icon("inbox", 90, "#E07A55")}<div><div style="font:600 38px/1.3 'Hind Siliguri',sans-serif;color:#FFD9C7">${esc(sc.kwLabel)}</div><div style="font:800 110px/1 'Inter',sans-serif;color:#F3EDE4">${esc(sc.keyword)}</div></div></div></div>${steps}`;
  },
};

// side panels of a chat scene
const ASIDE = {
  // month chips that pile up + a counter badge
  chips(a, K, i, x) {
    const chips = a.items.map((c, j) => { const id = K.id(`ac${i}${j}`); K.rv(id, c.at, "pop"); K.snd(c.at, "pop", 0.3); return `<div class="rv" id="${id}" style="margin-bottom:18px"><span class="chip">${icon("repeat", 28, "#FFD9C7")}<span>${esc(c.text)}</span></span></div>`; }).join("");
    let badge = "";
    if (a.badge) { const id = K.id(`ab${i}`); K.rv(id, a.badge.at, "pop"); K.snd(a.badge.at, "ping", 0.32); badge = `<div class="rv" id="${id}" style="margin-top:20px"><span class="chip red" style="font-size:36px">${esc(a.badge.text)}</span></div>`; }
    return `<div class="abs" style="left:${x}px;top:${a.y ?? 190}px;width:600px">${a.title ? `<div style="font:600 30px/1.3 'Hind Siliguri',sans-serif;color:#A89F94;margin-bottom:20px">${esc(a.title)}</div>` : ""}${chips}${badge}</div>`;
  },
  // a small report card, optionally wrong (red frame + cross)
  report(a, K, i, x) {
    const id = K.id(`ar${i}`); K.rv(id, a.at, "pop");
    if (a.badAt) { K.rv(K.id(`arx${i}`), a.badAt, "pop"); K.snd(a.badAt, "error", 0.32); K.rv(K.id(`arf${i}`), a.badAt, "fade", { dur: 0.25 }); }
    const rows = a.rows.map(([k, v, bad]) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.12);font:600 30px/1.3 'Hind Siliguri',sans-serif"><span>${esc(k)}</span><span style="${bad ? "color:#C23A2B" : ""}">${esc(v)}</span></div>`).join("");
    return `<div class="mini rv" id="${id}" style="left:${x}px;top:${a.y ?? 470}px;width:560px"><span class="mt">${esc(a.title)}</span>${rows}
<div class="abs rv" id="${K.id(`arf${i}`)}" style="inset:-6px;border-radius:20px;box-shadow:0 0 0 5px #E5604F"></div>
<div class="abs rv" id="${K.id(`arx${i}`)}" style="right:-30px;top:-30px;width:76px;height:76px;border-radius:50%;background:#E5604F;display:flex;align-items:center;justify-content:center">${cross(46, "#FFFFFF")}</div></div>`;
  },
  // slide thumbnails fanning out
  slides(a, K, i, x) {
    const s = Array.from({ length: a.n ?? 5 }, (_, j) => { const id = K.id(`as${i}${j}`); K.rv(id, a.at, "pop", { delay: j * 0.15 }); return `<div class="rv" id="${id}" style="position:absolute;left:${(j % 2) * 300}px;top:${Math.floor(j / 2) * 190}px;width:280px;height:170px;border-radius:14px;background:#F4EEE6;box-shadow:0 12px 26px rgba(0,0,0,0.4);padding:18px;box-sizing:border-box">
<div style="height:16px;width:60%;border-radius:8px;background:#E07A55"></div><div style="margin-top:14px;display:flex;gap:8px;align-items:flex-end;height:90px">${[40, 70, 55, 85, 60].map((h, k) => `<div style="flex:1;height:${(h + j * 7 + k * 3) % 90 + 10}px;background:${k % 2 ? "#D9B35C" : "#7FA7D9"};border-radius:4px"></div>`).join("")}</div></div>`; }).join("");
    K.snd(a.at, "page-turn", 0.35);
    return `<div class="abs" style="left:${x}px;top:${a.y ?? 200}px;width:600px;height:580px">${a.title ? `<div style="font:600 30px/1.3 'Hind Siliguri',sans-serif;color:#A89F94;margin:-50px 0 0">${esc(a.title)}</div>` : ""}${s}</div>`;
  },
};
