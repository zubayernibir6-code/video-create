// REEL10 ব্লুপ্রিন্ট (Blueprint) — a series look for tools/reel/series.mjs.
// World: blueprint paper (fine and major grid that slowly pans like a drafting table), corner dimension marks, a big
// faint gear turning at the bottom right. Across the top of the stage a pipeline of five machine nodes joined by
// wires; each repo draws its node, a signal pulse races down the wire into it and it lights in the repo's colour.
// Hook: five messy task chips lie scattered at odd angles; on the hook word they snap into one neat row, a wire draws
// through them and a gear spins (the work organising itself). Each repo: its panel unfolds from a line (scaleY) like
// a schematic, a "PART ০N" plate in the corner, features slide in on a ruler, the proof is an outlined approval tag;
// the panel collapses to a line to leave. Motion: line drawing, snaps, signals. Sounds: click, key-press, success, pop.
// Extra reel.json fields: hook.chips [≤ 5 short task names], hook.on (the word they snap on).
const NODE = { y: 18, w: 128, h: 70, xs: [0, 173, 346, 519, 692] };
const CARD = { x: 0, y: 130, w: 821, h: 560 };
const LINE = "rgba(234,244,255,0.85)";
export const look = {
  code: "REEL10",
  nameBn: "ব্লুপ্রিন্ট",
  colors: {
    bg: "#0A2A66", ink: "#EAF4FF", muted: "#A9C4EE", accent: "#7FDBFF", good: "#5CFFB0", warn: "#FFC857",
    tool: ["#7FDBFF", "#FFDC5E", "#5CFFB0", "#FF9F5A", "#FF7BD5"],
    capOff: "rgba(234,244,255,0.42)", capOn: "#7FDBFF", capDone: "#FFFFFF",
  },
  layout: { inner: 741, mono: 84, nm: 52 },
  settleDy: 170, settleScale: 1.15, fxFrom: { x: -40 }, fxEase: "power3.out", fxIcon: 32, pfFrom: { x: 40 },
  sfx: { name: "click", nameVol: 0.5, feature: "key-press", featureVol: 0.3, proof: "success", proofVol: 0.3, warn: "error", stat: "ping", card: "pop", push: "whoosh-short" },
  plan: {
    world: "নীল ব্লুপ্রিন্ট কাগজ, সূক্ষ্ম আর মোটা গ্রিড ধীরে সরে, কোণে মাপের দাগ, নিচে ডানে বড় আবছা গিয়ার ঘোরে; স্টেজের উপরে ৫টা যন্ত্রের বাক্স তারে জোড়া, প্রতিটা রিপোতে তার দিয়ে সংকেত ছুটে একটা বাক্স জ্বলে",
    drawn: "গ্রিড, যন্ত্রের বাক্স, তার, সংকেতের আলো, গিয়ার, নকশার প্যানেল",
    hook: (R) => `এলোমেলো কাজের চিপ (${(R.hook.chips ?? []).join(", ")}) ছড়িয়ে আছে; "${R.hook.on ?? "নিজে"}" শব্দে এক সারিতে সেজে যায়, তার টানা হয়, গিয়ার ঘোরে`,
    enter: (k) => `তার দিয়ে সংকেত ছুটে ${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} যন্ত্র-বাক্স জ্বলে; নকশার প্যানেল একটা রেখা থেকে খুলে যায়, কোণে PART প্লেট; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "ফিচার মাপের দাগ ধরে পাশ থেকে আসে",
    proof: () => "অনুমোদনের ট্যাগ বসে",
  },
  validate(t) { return []; },

  css(ctx) {
    const M = `"JetBrains Mono", "Hind Siliguri", monospace`;
    return `
#world .bp { position: absolute; left: -200px; top: -200px; width: 1480px; height: 2320px;
  background-image: linear-gradient(rgba(255,255,255,0.10) 2px, rgba(0,0,0,0) 2px), linear-gradient(90deg, rgba(255,255,255,0.10) 2px, rgba(0,0,0,0) 2px),
    linear-gradient(rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 1px);
  background-size: 200px 200px, 200px 200px, 40px 40px, 40px 40px; }
#world .tint { position: absolute; inset: 0; background: radial-gradient(ellipse 85% 60% at 50% 38%, rgba(30,90,190,0.55), rgba(10,42,102,0) 70%), linear-gradient(180deg, #0D3277, #0A2A66 55%, #082356); mix-blend-mode: normal; }
#world .gear { position: absolute; left: 640px; top: 1360px; width: 620px; height: 620px; opacity: 0.18; }
#world .dim { position: absolute; }
#badge { background: rgba(10,42,102,0.75); border: 2px solid rgba(127,219,255,0.7); }
#badge .bt { color: #EAF4FF; }
#nodes { position: absolute; left: 0; top: 0; width: 821px; height: 120px; overflow: visible; }
/* hook */
#hk .chip { position: absolute; padding: 14px 26px; border: 3px solid ${LINE}; border-radius: 12px; background: rgba(10,42,102,0.85); font: 700 34px/1.25 "Hind Siliguri", "Inter", sans-serif; color: #EAF4FF; white-space: nowrap; }
#hk .wire { position: absolute; left: 0; top: 0; width: 821px; height: 690px; overflow: visible; }
#hk .hg { position: absolute; left: 350px; top: 470px; width: 120px; height: 120px; opacity: 0; }
/* the panel */
.tool { left: ${CARD.x}px !important; top: ${CARD.y}px !important; width: ${CARD.w}px; height: ${CARD.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 34px 40px 30px;
  background: rgba(12,52,124,0.88); border: 2px solid ${LINE}; border-radius: 4px; box-shadow: 0 0 0 8px rgba(127,219,255,0.08), 0 30px 70px rgba(0,0,0,0.45);
  display: flex; flex-direction: column; gap: 18px; transform-origin: 50% 50%; }
.tool .crn { position: absolute; width: 26px; height: 26px; border: 0 solid var(--c); }
.tool .part { position: absolute; left: 40px; bottom: 24px; padding: 4px 12px; border: 2px solid var(--c); font: 700 24px/1.2 ${M}; color: var(--c); }
.tool .mono { width: 84px; height: 84px; border-radius: 6px; background: rgba(0,0,0,0); border: 3px solid var(--c); color: var(--c); font-size: 30px; }
.tool .nm { font-size: 52px; }
.tool .fxs { gap: 12px; }
.tool .fx { height: 64px; padding: 0 20px 0 0; border-bottom: 2px dashed rgba(234,244,255,0.35); }
.tool .fx .fi { width: 52px; height: 52px; border: 2px solid var(--c); border-radius: 6px; }
.tool .fx .fl { font-size: 32px; }
.tool .pf { margin-top: auto; align-self: flex-end; padding: 10px 26px 10px 16px; border: 3px solid #5CFFB0; border-radius: 6px; color: #5CFFB0; font-size: 30px; background: rgba(92,255,176,0.08); }
.tool .pf svg { stroke: #5CFFB0; }
.tool .pf.warn { border-color: #FFC857; color: #FFC857; background: rgba(255,200,87,0.08); }
.tool .pf.warn svg { stroke: #FFC857; }
.tool .hw .hn { border-radius: 8px; }
.ec, .cs { background: rgba(12,52,124,0.9); border-radius: 6px; }
`;
  },

  world(ctx) {
    const { js, f3, total } = ctx;
    js(`tl.fromTo("#bp", { x: 0, y: 0 }, { x: -80, y: -160, duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`);
    js(`tl.fromTo("#wgear", { rotation: 0 }, { rotation: 90, svgOrigin: "310 310", duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`);
    const teeth = Array.from({ length: 16 }, (_, i) => `<rect x="290" y="20" width="40" height="70" rx="6" fill="none" stroke="#EAF4FF" stroke-width="6" transform="rotate(${i * 22.5} 310 310)"/>`).join("");
    const dim = (x, y, w) => `<svg class="dim" style="left:${x}px;top:${y}px" width="${w}" height="30" viewBox="0 0 ${w} 30" data-layout-allow-overflow><line x1="0" y1="15" x2="${w}" y2="15" stroke="rgba(234,244,255,0.35)" stroke-width="2"/><line x1="1" y1="4" x2="1" y2="26" stroke="rgba(234,244,255,0.35)" stroke-width="2"/><line x1="${w - 1}" y1="4" x2="${w - 1}" y2="26" stroke="rgba(234,244,255,0.35)" stroke-width="2"/></svg>`;
    return `<div class="tint"></div><div class="bp" id="bp"></div><svg class="gear" viewBox="0 0 620 620" data-layout-allow-overflow><g id="wgear">${teeth}<circle cx="310" cy="310" r="220" fill="none" stroke="#EAF4FF" stroke-width="6"/><circle cx="310" cy="310" r="70" fill="none" stroke="#EAF4FF" stroke-width="6"/></g></svg>${dim(65, 1265, 420)}${dim(600, 240, 286)}`;
  },

  stageBack(ctx) {
    const { N, toolColor, esc, tools } = ctx;
    const wires = Array.from({ length: N - 1 }, (_, k) => `<line x1="${NODE.xs[k] + NODE.w}" y1="${NODE.y + NODE.h / 2}" x2="${NODE.xs[k + 1]}" y2="${NODE.y + NODE.h / 2}" stroke="rgba(234,244,255,0.45)" stroke-width="4" stroke-dasharray="8 8"/><circle id="sig${k}" cx="${NODE.xs[k] + NODE.w}" cy="${NODE.y + NODE.h / 2}" r="9" fill="#FFFFFF" opacity="0"/>`).join("");
    const nodes = Array.from({ length: N }, (_, k) => {
      const x = NODE.xs[k], P = 2 * (NODE.w + NODE.h);
      return `<g><rect x="${x}" y="${NODE.y}" width="${NODE.w}" height="${NODE.h}" rx="8" fill="rgba(10,42,102,0.9)" stroke="rgba(234,244,255,0.3)" stroke-width="3"/><rect id="nd${k}" x="${x}" y="${NODE.y}" width="${NODE.w}" height="${NODE.h}" rx="8" fill="${toolColor(k)}" fill-opacity="0" stroke="${toolColor(k)}" stroke-width="4" stroke-dasharray="${P}" stroke-dashoffset="${P}"/><text id="ndt${k}" x="${x + NODE.w / 2}" y="${NODE.y + NODE.h / 2 + 10}" text-anchor="middle" font-family="&#39;Inter&#39;, &#39;Hind Siliguri&#39;, sans-serif" font-weight="900" font-size="28" fill="#EAF4FF" opacity="0.45">${esc(tools[k].mono)}</text></g>`;
    }).join("");
    return `<svg id="nodes" width="821" height="120" viewBox="0 0 821 120">${wires}${nodes}</svg>`;
  },

  toolExtra(ctx, k) {
    const c = (s) => `<i class="crn" style="${s}"></i>`;
    return `${c("left:-2px;top:-2px;border-left-width:6px;border-top-width:6px")}${c("right:-2px;top:-2px;border-right-width:6px;border-top-width:6px")}${c("left:-2px;bottom:-2px;border-left-width:6px;border-bottom-width:6px")}${c("right:-2px;bottom:-2px;border-right-width:6px;border-bottom-width:6px")}<span class="part">PART ${ctx.bnd(String(k + 1).padStart(2, "0"))}</span>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc } = ctx;
    const chips = (R.hook.chips ?? ["ইমেইল", "রিপোর্ট", "Sheet", "ফর্ম", "বিল"]).slice(0, 5);
    const messy = [[40, 120, -14], [430, 60, 9], [150, 330, 7], [520, 260, -10], [260, 520, 12]];
    // the neat row: two rows centred, wire through them
    const neat = chips.map((_, i) => (i < 3 ? [40 + i * 260, 220, 0] : [170 + (i - 3) * 260, 360, 0]));
    ctx.pre(`gsap.set("#nodes", { opacity: 0 });${chips.map((_, i) => ` gsap.set("#ch${i}", { x: ${messy[i][0]}, y: ${messy[i][1]}, rotation: ${messy[i][2]} });`).join("")}`);
    show("#hk", 0, {}, 0.01);
    chips.forEach((_, i) => { show(`#ch${i}`, 0.08 + i * 0.12, { scale: 0.6 }, 0.35, "back.out(2)"); cue(0.08 + i * 0.12, "click-soft", 0.22); });
    const tS = Math.max(1.2, Math.min(H.t1 - 1.2, findIn(H.words, R.hook.on ?? "নিজে")?.start ?? 1.8));
    chips.forEach((_, i) => js(`tl.fromTo("#ch${i}", { x: ${messy[i][0]}, y: ${messy[i][1]}, rotation: ${messy[i][2]} }, { x: ${neat[i][0]}, y: ${neat[i][1]}, rotation: 0, duration: 0.5, ease: "back.out(1.4)", immediateRender: false }, ${f3(tS - 0.1 + i * 0.05)});`));
    cue(tS - 0.1, "whoosh-short", 0.4);
    for (let i = 0; i < chips.length; i++) cue(tS + 0.3 + i * 0.05, "click", 0.18);
    js(`tl.fromTo("#hwire", { attr: { "stroke-dashoffset": 1400 } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.7, ease: "power2.inOut", immediateRender: false }, ${f3(tS + 0.45)});`);
    show("#hk .hg", tS + 0.6, { scale: 0.5 }, 0.4, "back.out(2)");
    js(`tl.fromTo("#hgr", { rotation: 0 }, { rotation: 180, svgOrigin: "60 60", duration: ${f3(Math.max(1, H.t1 - tS))}, ease: "power1.inOut", immediateRender: false }, ${f3(tS + 0.6)});`);
    cue(tS + 0.6, "success", 0.3); ctx.beats.push(tS, tS + 0.6);
    row(0, "নীল নকশার কাগজে এলোমেলো কাজের চিপ ছড়িয়ে পড়ে", chips.join(" · "));
    row(tS - 0.1, "চিপগুলো ঝটকায় দুই সারিতে সেজে যায়, তার টানা হয়, গিয়ার ঘোরে", "—");
    const teeth = Array.from({ length: 10 }, (_, i) => `<rect x="54" y="4" width="12" height="22" rx="2" fill="#7FDBFF" transform="rotate(${i * 36} 60 60)"/>`).join("");
    return `<div class="hook" id="hk"><svg class="wire" viewBox="0 0 821 690"><path id="hwire" d="M60 252 H760 M190 392 H690 M410 252 V392" fill="none" stroke="#7FDBFF" stroke-width="4" stroke-dasharray="1400" stroke-dashoffset="1400"/></svg>
  ${chips.map((c, i) => `<div class="chip" id="ch${i}">${esc(c)}</div>`).join("")}
  <svg class="hg" viewBox="0 0 120 120"><g id="hgr">${teeth}<circle cx="60" cy="60" r="34" fill="none" stroke="#7FDBFF" stroke-width="10"/></g></svg></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#hk", { scaleY: 0.04, opacity: 0, duration: 0.35, ease: "power3.in" }, ${f3(t - 0.4)});`);
    js(`tl.fromTo("#nodes", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.45, immediateRender: false }, ${f3(t - 0.05)});`);
    cue(t - 0.4, "whoosh-short", 0.3);
  },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k, cy = NODE.y + NODE.h / 2;
    if (k > 0) {
      js(`tl.fromTo("#sig${k - 1}", { opacity: 1, attr: { cx: ${NODE.xs[k - 1] + NODE.w} } }, { opacity: 1, attr: { cx: ${NODE.xs[k]} }, duration: 0.3, ease: "power1.in", immediateRender: false }, ${f3(tt.tName - 0.32)}); tl.to("#sig${k - 1}", { opacity: 0, duration: 0.1 }, ${f3(tt.tName - 0.02)});`);
      cue(tt.tName - 0.32, "whoosh-short", 0.18);
    }
    js(`tl.to("#nd${k}", { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out" }, ${f3(tt.tName - 0.1)}); tl.to("#nd${k}", { attr: { "fill-opacity": 0.35 }, duration: 0.3 }, ${f3(tt.tName + 0.27)}); tl.to("#ndt${k}", { opacity: 1, duration: 0.3 }, ${f3(tt.tName + 0.2)});`);
    js(`tl.fromTo("#t${k}", { opacity: 0, scaleY: 0.02 }, { opacity: 1, scaleY: 1, duration: 0.5, ease: "power3.inOut", immediateRender: false }, ${f3(tt.tCard - 0.05)});`);
    cue(tt.tCard - 0.05, "pop", 0.3);
    ctx.beats.push(tt.tCard, tt.tName);
    void cy;
  },

  exit(ctx, tt, t) {
    ctx.js(`tl.to("#t${tt.k}", { scaleX: 0.01, opacity: 0, duration: 0.3, ease: "power3.in" }, ${ctx.f3(t - 0.1)});`);
  },

  cta(ctx, tC) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#nodes", { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(tC - 0.25)});`);
    cue(tC + 0.1, "success", 0.3);
  },
};
