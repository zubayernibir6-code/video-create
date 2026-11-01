// REEL3 স্পিডরান (Speedrun) — a series look for tools/reel/series.mjs.
// World: a dark race HUD. A speed gauge rides across the top of the stage (5 segments, one per tool, the needle jumps
// up a segment each time a tool is named; "গতি ০/৫" readout beside it), a perspective road rushes below the captions,
// light streaks tear across on every change. Hook: a frozen window "(Not Responding)" with a stuck spinner and a bar
// stuck at 12 %; the needle sputters. Each tool: a horizontal whip — the old panel skews out left, the new one slams in
// from the right with streaks and a flash; features slide in skewed like boosts, each revs the needle; the proof is a
// solid colour pill. Motion: fast horizontal whips, skew, counting, overshoot. Sounds: whoosh, impact, click, ping.
// Extra reel.json fields: hook.title (the frozen window's title), hook.on (the word the needle sputters on).
const G = { cx: 410, cy: 160, r: 136, w: 24 };                  // the gauge, stage px
const PANEL = { x: 0, y: 206, w: 821, h: 484 };
const arc = (a0, a1, r) => {                                       // angles in degrees, 180 = left, 360 = right (over the top)
  const p = (a) => [G.cx + r * Math.cos((a * Math.PI) / 180), G.cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
export const look = {
  code: "REEL3",
  nameBn: "স্পিডরান",
  colors: {
    bg: "#08090D", ink: "#F4F6FA", muted: "#A4ABBA", accent: "#FFD60A", good: "#2EE6A6", warn: "#FF9F1C",
    tool: ["#FF5A36", "#FFD60A", "#2EE6A6", "#3AA0FF", "#C77DFF"],
    capOff: "rgba(244,246,250,0.42)", capOn: "#FFD60A", capDone: "#FFFFFF",
  },
  layout: { inner: 753, mono: 84, nm: 50 },
  settleDy: 150, settleScale: 1.18, fxFrom: { x: 160, skewX: -18 }, fxEase: "power4.out", fxIcon: 32, pfFrom: { scale: 1.6 },
  sfx: { name: "impact-bass-1", nameVol: 0.6, nameDur: 0.7, feature: "whoosh-short", featureVol: 0.32, proof: "ping", proofVol: 0.35, warn: "error", stat: "ping", card: "whoosh-short", push: "whoosh-short" },
  plan: {
    world: "উপরে রেসের স্পিড-মিটার (৫ ভাগ, প্রতিটা রিপোতে কাঁটা এক ধাপ ওঠে, পাশে \"গতি ০/৫\"), ক্যাপশনের নিচে ছুটে চলা রাস্তা, প্রতিটা বদলে আলোর রেখা ঝটকায় পার হয়",
    drawn: "স্পিড-মিটার, রাস্তা, আলোর রেখা, HUD প্যানেল",
    hook: (R) => `প্যানেলে আটকে থাকা জানালা "${R.hook.title}", লোডিং চাকা থেমে থেমে ঘোরে, বার ১২%-এ আটকে; মিটারের কাঁটা কেঁপে আবার পড়ে যায়`,
    enter: (k) => `ঝটকা প্যান: আগের প্যানেল বাঁয়ে বেঁকে বেরিয়ে যায়, নতুন প্যানেল ডান দিক থেকে আছড়ে পড়ে, আলোর রেখা আর ঝলক; মিটারের কাঁটা ${["এক", "দুই", "তিন", "চার", "পাঁচ"][k]} নম্বর ধাপে লাফ দেয়`,
    feature: () => "বুস্টের সারি ডান দিক থেকে বেঁকে ঢোকে, কাঁটা একটু গর্জে ওঠে",
    proof: () => "রঙিন প্রমাণের পিল ধাক্কা দিয়ে বসে",
  },

  css(ctx) {
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .sky { position: absolute; inset: 0; background: linear-gradient(180deg, #0B0D14 0%, #10131D 45%, #07080C 66%, #05060A 100%); }
#world .glow { position: absolute; left: 140px; top: 380px; width: 800px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,214,10,0.10), rgba(255,214,10,0)); }
#world .road { position: absolute; left: 0; top: 1236px; width: 1080px; height: 684px; overflow: hidden; }
#world .road svg { position: absolute; left: 0; top: 0; }
.streak { position: absolute; left: 0; height: 4px; border-radius: 2px; opacity: 0; }
#badge { background: #12141B; border: 2px solid rgba(255,214,10,0.55); }
#badge .bt { color: #FFFFFF; }
#gauge { position: absolute; left: 0; top: 0; width: 821px; height: 200px; overflow: visible; }
.gread { position: absolute; top: 74px; display: flex; flex-direction: column; align-items: center; }
.gread .gl { font: 700 26px/1.2 ${B}; color: #A4ABBA; }
.gread .gn { position: relative; width: 140px; height: 80px; margin-top: 10px; }
.gread .gn span { position: absolute; left: 0; right: 0; top: 4px; text-align: center; font: 800 54px/1.3 "Baloo Da 2", ${B}; color: #FFFFFF; opacity: 0; }
/* the hook: a frozen window */
#hk .win { position: absolute; left: ${PANEL.x}px; top: ${PANEL.y + 20}px; width: ${PANEL.w}px; height: ${PANEL.h - 40}px; box-sizing: border-box; border-radius: 18px; background: #151821;
  border: 2px solid rgba(255,255,255,0.14); box-shadow: 0 30px 70px rgba(0,0,0,0.6); overflow: hidden; }
#hk .wt { height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 24px; background: #1E222D; font: 700 28px/1 ${S}; color: #E6E9F0; }
#hk .wt i { width: 16px; height: 16px; border-radius: 50%; background: #3A3F4C; display: block; }
#hk .wt span { margin-left: 8px; }
#hk .wt b { color: #FF5A36; font-weight: 700; margin-left: 6px; }
#hk .wb { position: absolute; left: 0; right: 0; top: 64px; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; }
#hk .spin { width: 120px; height: 120px; }
#hk .wl { font: 700 32px/1.3 ${B}; color: #C9CEDA; }
#hk .wbar { width: 460px; height: 16px; border-radius: 8px; background: rgba(255,255,255,0.1); overflow: hidden; }
#hk .wbar b { display: block; width: 12%; height: 100%; background: #FF5A36; }
/* the HUD panel */
.tool { left: ${PANEL.x}px !important; top: ${PANEL.y}px !important; width: ${PANEL.w}px; height: ${PANEL.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box;
  padding: 24px 34px 22px; background: linear-gradient(115deg, #171A23, #10121A); border: 2px solid var(--c);
  clip-path: polygon(0 0, calc(100% - 46px) 0, 100% 46px, 100% 100%, 46px 100%, 0 calc(100% - 46px));
  display: flex; flex-direction: column; gap: 16px; transform-origin: 50% 50%; }
.tool .lap { position: absolute; right: 70px; bottom: 26px; font: 800 26px/1.2 ${B}; color: var(--c); }
.tool .mono { width: 84px; height: 84px; border-radius: 14px; transform: skewX(-8deg); background: var(--c); color: #08090D; font-size: 32px; }
.tool .nm { font-size: 50px; }
.tool .mk { font-size: 28px; }
.tool .fxs { gap: 8px; }
.tool .fx { height: 56px; padding: 0 18px 0 0; background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); border-left: 6px solid var(--c); }
.tool .fx .fi { width: 56px; height: 56px; }
.tool .fx .fl { font-size: 31px; }
.tool .pf { margin-top: auto; align-self: flex-start; padding: 8px 24px 8px 16px; border-radius: 10px; background: var(--c); color: #08090D; font-size: 30px; font-weight: 700; }
.tool .pf svg { stroke: #08090D; }
.tool .pf.warn { background: #1B1E27; color: #FFFFFF; border: 2px solid #FF9F1C; }
.tool .pf.warn svg { stroke: #FF9F1C; }
.ec { background: #13151C; border-radius: 12px; border-left-width: 8px; }
`;
  },

  world(ctx) {
    const { total, js, f3 } = ctx;
    // the road: rays to a vanishing point, horizontal bars that rush towards the viewer (seek-safe: counted repeats)
    const vx = 540, vy = -40, Hh = 684;
    const rays = [-1600, -900, -420, -120, 120, 420, 900, 1600].map((dx) => `<line data-layout-allow-overflow x1="${vx}" y1="${vy}" x2="${vx + dx}" y2="${Hh}" stroke="rgba(255,214,10,0.22)" stroke-width="2"/>`).join("");
    const bars = Array.from({ length: 6 }, (_, i) => `<rect id="rb${i}" x="0" y="0" width="1080" height="3" fill="rgba(255,214,10,0.30)"/>`).join("");
    for (let i = 0; i < 6; i++) js(`tl.fromTo("#rb${i}", { attr: { y: 0 }, opacity: 0.1 }, { attr: { y: ${Hh} }, opacity: 0.9, duration: 1.2, ease: "power2.in", repeat: ${Math.ceil(total / 1.2)}, immediateRender: false }, ${f3(i * 0.2)});`);
    const streaks = Array.from({ length: 12 }, (_, i) => {
      const y = 330 + ((i * 397) % 900), w = 260 + ((i * 131) % 380), h = 2 + (i % 3);
      const c = i % 3 === 0 ? "#FFD60A" : "#FFFFFF";
      return `<div class="streak" id="sk${i}" style="top:${y}px;width:${w}px;height:${h}px;background:linear-gradient(90deg, rgba(255,255,255,0), ${c})"></div>`;
    }).join("");
    return `<div class="sky"></div><div class="glow"></div><div class="road"><svg width="1080" height="${Hh}" overflow="hidden" data-layout-allow-overflow>${rays}${bars}</svg></div>${streaks}`;
  },

  streaks(ctx, t) {
    for (let i = 0; i < 12; i++) ctx.js(`tl.fromTo("#sk${i}", { x: 1120, opacity: 0.85 }, { x: -760, opacity: 0.85, duration: ${(0.34 + (i % 4) * 0.05).toFixed(2)}, ease: "power1.in", immediateRender: false }, ${ctx.f3(t + (i % 5) * 0.025)});`);
  },

  stageBack(ctx) {
    const { N, tools, bnd, toolColor } = ctx;
    const seg = 180 / N, gap = 3;
    const segs = tools.map((_, k) => `<path id="gs${k}" d="${arc(180 + k * seg + gap / 2, 180 + (k + 1) * seg - gap / 2, G.r)}" stroke="${toolColor(k)}" stroke-width="${G.w}" fill="none" opacity="0.2"/>`).join("");
    const ticks = Array.from({ length: 21 }, (_, i) => {
      const a = ((180 + i * 9) * Math.PI) / 180, r0 = G.r - G.w / 2 - 10, r1 = r0 - (i % 2 ? 8 : 16);
      return `<line x1="${(G.cx + r0 * Math.cos(a)).toFixed(1)}" y1="${(G.cy + r0 * Math.sin(a)).toFixed(1)}" x2="${(G.cx + r1 * Math.cos(a)).toFixed(1)}" y2="${(G.cy + r1 * Math.sin(a)).toFixed(1)}" stroke="rgba(255,255,255,0.45)" stroke-width="3"/>`;
    }).join("");
    const nums = Array.from({ length: N + 1 }, (_, k) => `<span id="gn${k}"${k === 0 ? ' style="opacity:1"' : ""}>${bnd(k)}/${bnd(N)}</span>`).join("");
    return `<svg id="gauge" width="821" height="200" viewBox="0 0 821 200"><path d="${arc(180, 360, G.r)}" stroke="rgba(255,255,255,0.08)" stroke-width="${G.w + 10}" fill="none"/>${segs}${ticks}
  <g id="needle"><polygon points="${G.cx - 9},${G.cy} ${G.cx + 9},${G.cy} ${G.cx + 2},${G.cy - G.r + 26} ${G.cx - 2},${G.cy - G.r + 26}" fill="#FFFFFF"/><circle cx="${G.cx}" cy="${G.cy}" r="20" fill="#FFD60A"/><circle cx="${G.cx}" cy="${G.cy}" r="8" fill="#08090D"/></g></svg>
<div class="gread" style="left:30px;width:180px"><div class="gl">ল্যাপটপের</div><div class="gl" style="color:#FFFFFF;font-size:34px">গতি</div></div>
<div class="gread" style="left:611px;width:180px"><div class="gl">টুল চালু</div><div class="gn">${nums}</div></div>`;
  },

  toolExtra(ctx, k) { return `<div class="lap">ল্যাপ ${ctx.bnd(k + 1)}/${ctx.bnd(ctx.N)}</div>`; },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, total } = ctx;
    ctx.pre(`gsap.set("#needle", { rotation: -90, svgOrigin: "${G.cx} ${G.cy}" });`);
    show("#hk", 0, {}, 0.01);
    show("#hk .win", 0.1, { y: 40, scale: 0.94 }, 0.5);
    cue(0.08, "glitch-3", 0.3, 0.8);
    // the spinner turns, then stutters
    js(`tl.to("#spin", { rotation: 360, svgOrigin: "60 60", duration: 1.1, ease: "none", repeat: ${Math.max(1, Math.floor((H.t1 - 0.4) / 1.6))}, repeatDelay: 0.5 }, 0.3);`);
    const tB = Math.max(0.6, Math.min(R.hook.on ? findIn(H.words, R.hook.on)?.start ?? 1.2 : 1.2, H.t1 - 1.4));
    js(`tl.to("#needle", { keyframes: [{ rotation: -62, duration: 0.18, ease: "power2.out" }, { rotation: -80, duration: 0.12 }, { rotation: -70, duration: 0.1 }, { rotation: -90, duration: 0.5, ease: "power2.in" }] }, ${f3(tB)});`);
    cue(tB, "glitch-1", 0.35, 0.6);
    ctx.beats.push(tB);
    const tS = Math.min(H.t1 - 0.9, tB + 1.8);
    js(`tl.to("#hk .win", { keyframes: [{ x: -10, duration: 0.05 }, { x: 9, duration: 0.05 }, { x: -6, duration: 0.05 }, { x: 0, duration: 0.05 }] }, ${f3(tS)});`);
    cue(tS, "error", 0.25, 0.6); ctx.beats.push(tS);
    row(0, "কালো রেসের HUD: উপরে স্পিড-মিটার (কাঁটা শূন্যে), নিচে আটকে থাকা জানালা আর লোডিং চাকা", R.hook.title);
    row(tB, "মিটারের কাঁটা একটু উঠে কেঁপে আবার শূন্যে পড়ে যায়", "—");
    row(tS, "আটকে থাকা জানালা কাঁপে", "—");
    const spin = `<svg class="spin" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" stroke="rgba(255,255,255,0.12)" stroke-width="12" fill="none"/><path id="spin" d="M60 14 A46 46 0 0 1 106 60" stroke="#FFD60A" stroke-width="12" stroke-linecap="round" fill="none"/></svg>`;
    return `<div class="hook" id="hk"><div class="win"><div class="wt"><i></i><i></i><i></i><span>${ctx.esc(R.hook.title)}</span><b>(Not Responding)</b></div>
  <div class="wb">${spin}<div class="wl">${ctx.esc(R.hook.sub ?? "লোড হচ্ছে… ১২%")}</div><div class="wbar"><b></b></div></div></div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue, flash } = ctx;
    js(`tl.to("#hk .win", { x: -1000, skewX: 18, duration: 0.3, ease: "power3.in" }, ${f3(t - 0.32)});`);
    cue(t - 0.35, "whoosh", 0.5);
    flash(t - 0.02, 0.5);
  },

  enter(ctx, tt) {
    const { js, f3, cue, N } = ctx;
    const k = tt.k;
    js(`tl.fromTo("#t${k}", { opacity: 1, x: 1000, skewX: -16 }, { opacity: 1, x: 0, skewX: 0, duration: 0.42, ease: "power4.out", immediateRender: false }, ${f3(tt.tCard)});`);
    this.streaks(ctx, tt.tCard - 0.12);
    if (k > 0) { cue(tt.tCard - 0.15, "whoosh", 0.45); ctx.flash(tt.tCard + 0.02, 0.35); }
    // the needle jumps one segment on the name, overshoots and settles; the segment lights; the count goes up
    const ang = -90 + ((k + 1) * 180) / N - 180 / N / 2;
    js(`tl.to("#needle", { rotation: ${ang.toFixed(1)}, duration: 0.7, ease: "back.out(2.6)" }, ${f3(tt.tName)});`);
    js(`tl.to("#gs${k}", { opacity: 1, duration: 0.25 }, ${f3(tt.tName + 0.15)});`);
    js(`tl.set("#gn${k}", { opacity: 0 }, ${f3(tt.tName + 0.15)}); tl.set("#gn${k + 1}", { opacity: 1 }, ${f3(tt.tName + 0.15)});`);
    js(`tl.fromTo("#gn${k + 1}", { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, ${f3(tt.tName + 0.15)});`);
    cue(tt.tName + 0.15, "click", 0.35);
    ctx.beats.push(tt.tCard, tt.tName + 0.15);
  },

  onFeature(ctx, tt, i, t) {
    const ang = -90 + ((tt.k + 1) * 180) / ctx.N - 180 / ctx.N / 2;
    ctx.js(`tl.to("#needle", { keyframes: [{ rotation: ${(ang + 5).toFixed(1)}, duration: 0.12, ease: "power2.out" }, { rotation: ${ang.toFixed(1)}, duration: 0.35, ease: "power2.inOut" }] }, ${ctx.f3(t + 0.05)});`);
  },

  exit(ctx, tt, t) {
    const { js, f3 } = ctx;
    js(`tl.to("#t${tt.k}", { x: -1000, skewX: 16, duration: 0.28, ease: "power3.in" }, ${f3(t - 0.12)});`);
    js(`tl.set("#t${tt.k}", { opacity: 0 }, ${f3(t + 0.17)});`);
  },

  cta(ctx, tC) {
    const { js, f3, cue } = ctx;
    this.streaks(ctx, tC - 0.3);
    cue(tC - 0.3, "whoosh", 0.4);
    js(`tl.to("#gauge, .gread", { opacity: 0, y: -40, duration: 0.35, ease: "power2.in" }, ${f3(tC - 0.25)});`);
  },
};
