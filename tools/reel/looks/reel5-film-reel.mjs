// REEL5 ফিল্ম রিল (Film Reel) — a series look for tools/reel/series.mjs.
// World: a warm dark edit suite. Film strips with sprocket holes scroll down both edges, a projector reel turns below
// the captions. The stage is an editor: a 16:9 program monitor on top (REC dot, running timecode) and a timeline under
// it with one clip per repo, named by its workflow step (রেকর্ড → কাট → সাবটাইটেল → ট্রিম → ছোট করা), and a red
// playhead that travels across the clips all video long. Hook: "দামি সফটওয়্যার" gets a red strike on the negation
// word, the clips drop into the timeline, REC lights and a 3-2-1 film leader counts down. Each repo: a hard cut on
// the beat with a light-leak flash and a shutter click, the playhead jumps to its clip; features land like lower
// thirds. Motion: cuts, playhead sweeps, light leaks. Sounds: shutter, clicks, pings, impact.
// Extra reel.json fields: tools[].step (≤ 10, the clip label), hook.on (REC word), hook.strike (headline), hook.neg.
const MON = { w: 821, h: 462 };
const TL = { y: 494, h: 196, clipY: 548, clipH: 96 };
export const look = {
  code: "REEL5",
  nameBn: "ফিল্ম রিল",
  colors: {
    bg: "#0E0B09", ink: "#FFF4E6", muted: "#CDBBA6", accent: "#FFB547", good: "#7CE08A", warn: "#FFB547",
    tool: ["#FF5A4A", "#FFB547", "#4FD1C5", "#A08CFF", "#7CE08A"],
    capOff: "rgba(255,244,230,0.42)", capOn: "#FFB547", capDone: "#FFFFFF",
  },
  layout: { inner: 749, mono: 78, nm: 50 },
  settleDy: 110, settleScale: 1.18, fxFrom: { x: -60 }, fxEase: "power3.out", fxIcon: 30, pfFrom: { x: 60 },
  sfx: { name: "impact-bass-1", nameVol: 0.42, nameDur: 0.5, feature: "click", featureVol: 0.26, proof: "ping", proofVol: 0.3, warn: "error", stat: "ping", card: "camera-shutter", push: "whoosh-short" },
  plan: {
    world: "উষ্ণ অন্ধকার এডিটিং ঘর: দুই পাশে ফিল্মের ফিতা নিচে গড়ায়, ক্যাপশনের নিচে প্রজেক্টরের রিল ঘোরে; উপরে ১৬:৯ মনিটর (REC আর চলমান টাইমকোড), নিচে টাইমলাইনে ৫টা ক্লিপ আর লাল প্লেহেড পুরো ভিডিও জুড়ে এগোয়",
    drawn: "মনিটর, টাইমলাইন, ক্লিপ, প্লেহেড, ফিল্মের ফিতা, রিল",
    hook: (R) => `মনিটরে "${R.hook.strike}" লেখায় লাল দাগ পড়ে, টাইমলাইনে ৫টা ক্লিপ একে একে বসে, REC জ্বলে আর ৩-২-১ কাউন্টডাউন`,
    enter: (k, t) => `বিটে কাট, আলোর ঝলক আর শাটারের শব্দ; প্লেহেড "${t.step}" ক্লিপে লাফ দেয়, ক্লিপ জ্বলে ওঠে; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "লোয়ার-থার্ডের মতো সারি বাঁ দিক থেকে ঢোকে",
    proof: () => "প্রমাণের পিল ডান দিক থেকে ঢোকে",
  },
  validate(t) { return !t.step || [...t.step].length > 10 ? ["step: the clip label, 1-10 characters (রেকর্ড, কাট …)"] : []; },

  css(ctx) {
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`, M = `"JetBrains Mono", "Hind Siliguri", monospace`;
    return `
#world .room { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% 34%, #2A1C12 0%, #160F0B 55%, #0E0B09 100%); }
#world .strip { position: absolute; top: -200px; width: 46px; height: 2400px; background-color: #1A1410;
  background-image: repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 14px, #0E0B09 14px 34px, rgba(0,0,0,0) 34px 48px); border-left: 2px solid #2E241C; border-right: 2px solid #2E241C; }
#world .reel { position: absolute; left: 290px; top: 1330px; width: 500px; height: 500px; }
#badge { background: #1E1712; border: 2px solid rgba(255,181,71,0.55); }
#badge .bt { color: #FFF4E6; }
#mon { position: absolute; left: 0; top: 0; width: ${MON.w}px; height: ${MON.h}px; box-sizing: border-box; border-radius: 16px; background: #050403; border: 3px solid #3A2E24; box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
#mon .rec { position: absolute; left: 20px; top: 16px; display: flex; align-items: center; gap: 10px; font: 800 24px/1 ${S}; color: #FFFFFF; opacity: 0.35; }
#mon .rec i { width: 18px; height: 18px; border-radius: 50%; background: #FF3B30; display: block; }
#mon .tc { position: absolute; right: 20px; top: 16px; font: 600 24px/1 ${M}; color: #CDBBA6; }
#mon .leak { position: absolute; inset: 0; border-radius: 14px; background: linear-gradient(110deg, rgba(255,170,60,0) 20%, rgba(255,170,60,0.75) 45%, rgba(255,90,40,0.5) 60%, rgba(255,170,60,0) 80%); opacity: 0; }
#tline { position: absolute; left: 0; top: ${TL.y}px; width: 821px; height: ${TL.h}px; box-sizing: border-box; border-radius: 16px; background: #17120E; border: 2px solid #2E241C; }
#tline .ruler { position: absolute; left: 16px; right: 16px; top: 14px; height: 26px; background-image: repeating-linear-gradient(90deg, #5A4A3C 0 2px, rgba(0,0,0,0) 2px 26px); opacity: 0.8; }
#tline .trk { position: absolute; left: 16px; right: 16px; top: ${TL.clipY - TL.y}px; height: ${TL.clipH}px; border-radius: 10px; background: rgba(255,255,255,0.03); }
.clip { position: absolute; top: ${TL.clipY - TL.y}px; height: ${TL.clipH}px; box-sizing: border-box; border-radius: 10px; border: 2px solid var(--c); background: var(--cb);
  display: flex; align-items: center; justify-content: center; font: 700 24px/1.2 ${B}; color: #FFFFFF; opacity: 0; overflow: hidden; }
.clip .fill { position: absolute; inset: 0; background: var(--c); opacity: 0; }
.clip span { position: relative; white-space: nowrap; }
#ph { position: absolute; top: ${TL.y + 30}px; left: 16px; width: 4px; height: ${TL.h - 44}px; background: #FF3B30; box-shadow: 0 0 12px #FF3B30; }
#ph::before { content: ""; position: absolute; left: -11px; top: -14px; width: 26px; height: 20px; background: #FF3B30; clip-path: polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%); }
/* hook */
#hk .strike { position: absolute; left: 0; right: 0; top: 150px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
#hk .sw { position: relative; font: 800 64px/1.3 ${B}; color: #FFF4E6; }
#hk .sw i { position: absolute; left: -12px; right: -12px; top: 52%; height: 8px; border-radius: 4px; background: #FF3B30; transform: scaleX(0); transform-origin: 0 50%; }
#hk .free { font: 800 40px/1.3 ${B}; color: #7CE08A; opacity: 0; }
#hk .lead { position: absolute; left: 260px; top: 80px; width: 300px; height: 300px; opacity: 0; }
#hk .lead span { position: absolute; left: 0; right: 0; top: 0; height: 300px; display: flex; align-items: center; justify-content: center; font: 800 150px/1 "Baloo Da 2", ${B}; color: #FFF4E6; opacity: 0; }
/* the monitor's content */
.tool { left: 0 !important; top: 0 !important; width: ${MON.w}px; height: ${MON.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 58px 36px 26px;
  display: flex; flex-direction: column; gap: 14px; }
.tool .mono { width: 78px; height: 78px; border-radius: 12px; background: var(--c); color: #0E0B09; font-size: 30px; }
.tool .nm { font-size: 50px; }
.tool .mk { font-size: 28px; }
.tool .fxs { gap: 10px; }
.tool .fx { align-self: flex-start; height: 56px; padding: 0 24px 0 12px; border-radius: 6px; background: rgba(14,11,9,0.85); border-left: 6px solid var(--c); }
.tool .fx .fi { width: 40px; height: 40px; }
.tool .fx .fl { font-size: 30px; }
.tool .pf { position: absolute; right: 36px; bottom: 26px; padding: 10px 24px; border-radius: 999px; background: var(--c); color: #0E0B09; font-size: 28px; }
.tool .pf svg { stroke: #0E0B09; }
.tool .pf.warn { background: #2A2018; color: #FFF4E6; border: 2px solid #FFB547; }
.tool .pf.warn svg { stroke: #FFB547; }
.ec { background: #1E1712; border-radius: 12px; }
`;
  },

  clipX(ctx, k) { const w = (821 - 32 - (ctx.N - 1) * 8) / ctx.N; return { x: 16 + k * (w + 8), w }; },

  world(ctx) {
    const { js, f3, total } = ctx;
    js(`tl.fromTo(".strip", { y: 0 }, { y: 480, duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`);
    js(`tl.to("#reelg", { rotation: 220, svgOrigin: "250 250", duration: ${f3(total)}, ease: "none" }, 0);`);
    const holes = Array.from({ length: 6 }, (_, i) => { const a = (i * Math.PI) / 3; return `<circle cx="${(250 + 130 * Math.cos(a)).toFixed(1)}" cy="${(250 + 130 * Math.sin(a)).toFixed(1)}" r="56" fill="#0E0B09"/>`; }).join("");
    return `<div class="room"></div><div class="strip" style="left:6px"></div><div class="strip" style="right:6px"></div>
<svg class="reel" viewBox="0 0 500 500"><g id="reelg"><circle cx="250" cy="250" r="240" fill="#1F1812" stroke="#3A2E24" stroke-width="8"/>${holes}<circle cx="250" cy="250" r="40" fill="#3A2E24"/><circle cx="250" cy="250" r="14" fill="#0E0B09"/></g></svg>`;
  },

  stageBack(ctx) {
    const { tools, toolColor, rgba, esc } = ctx;
    const clips = tools.map((t, k) => { const { x, w } = this.clipX(ctx, k); return `<div class="clip" id="cl${k}" style="left:${x.toFixed(1)}px;width:${w.toFixed(1)}px;--c:${toolColor(k)};--cb:${rgba(toolColor(k), 0.16)}"><i class="fill" id="clf${k}"></i><span>${esc(t.step)}</span></div>`; }).join("");
    return `<div id="mon"><div class="rec" id="rec"><i></i>REC</div><div class="tc" id="tc">00:00:00:00</div><div class="leak" id="leak"></div></div>
<div id="tline"><div class="ruler"></div><div class="trk"></div>${clips}</div><div id="ph"></div>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc, total, N } = ctx;
    // the timecode runs the whole video (seek-safe: computed from the tween's own progress)
    js(`{ const el = document.querySelector("#tc"); const st = { f: 0 }; tl.to(st, { f: ${Math.round(total * 30)}, duration: ${f3(total)}, ease: "none", onUpdate: () => { const f = Math.round(st.f), s = Math.floor(f / 30); el.textContent = "00:" + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0") + ":" + String(f % 30).padStart(2, "0"); } }, 0); }`);
    show("#hk", 0, {}, 0.01);
    show("#hk .sw", 0.1, { y: 30 }, 0.45);
    const tNeg = Math.max(0.6, findIn(H.words, R.hook.neg ?? "না।")?.start ?? 1.6);
    js(`tl.to("#hk .sw i", { scaleX: 1, duration: 0.3, ease: "power3.out" }, ${f3(tNeg)});`);
    cue(tNeg, "glitch-1", 0.3, 0.4); ctx.beats.push(tNeg);
    show("#hk .free", tNeg + 0.35, { y: 16 }, 0.4); cue(tNeg + 0.35, "pop", 0.3);
    const tRec = Math.max(tNeg + 0.9, findIn(H.words, R.hook.on ?? "রেকর্ড")?.start ?? tNeg + 1.2);
    js(`tl.to("#rec", { opacity: 1, duration: 0.15 }, ${f3(tRec)});`);
    js(`tl.fromTo("#rec i", { opacity: 1 }, { opacity: 0.2, duration: 0.4, yoyo: true, repeat: ${Math.floor((total - tRec) / 0.4)}, ease: "steps(1)", immediateRender: false }, ${f3(tRec + 0.2)});`);
    cue(tRec, "ping", 0.3);
    // the clips drop into the timeline one by one
    for (let k = 0; k < N; k++) { const t = tRec + 0.15 + k * 0.16; show(`#cl${k}`, t, { y: -40 }, 0.35, "back.out(1.8)"); cue(t, "click-soft", 0.3); }
    // 3-2-1 leader in the last stretch before the first tool
    js(`tl.to("#hk .strike", { opacity: 0, duration: 0.25 }, ${f3(tRec + 0.9)});`);
    const tL = tRec + 1.0, step = Math.max(0.35, Math.min(0.75, (H.t1 - tL - 0.25) / 3));
    show("#hk .lead", tL, {}, 0.15);
    js(`tl.fromTo("#lsw", { attr: { "stroke-dashoffset": 754 } }, { attr: { "stroke-dashoffset": 0 }, duration: ${f3(step)}, ease: "none", repeat: 2, immediateRender: false }, ${f3(tL)});`);
    [3, 2, 1].forEach((n, i) => { js(`tl.set("#ld${n}", { opacity: 1 }, ${f3(tL + i * step)}); tl.set("#ld${n}", { opacity: 0 }, ${f3(tL + (i + 1) * step)});`); cue(tL + i * step, "ping", 0.22); ctx.beats.push(tL + i * step); });
    row(0, "এডিটিং ঘর: উপরে মনিটর, নিচে খালি টাইমলাইন; মনিটরে বড় লেখা", R.hook.strike);
    row(tNeg, "লেখার উপর লাল দাগ, নিচে সবুজ লেখা", R.hook.free);
    row(tRec, `REC জ্বলে, টাইমলাইনে ${ctx.bnd(N)}টা ক্লিপ একে একে বসে`, ctx.tools.map((t) => t.step).join(" · "));
    row(tL, "মনিটরে ৩-২-১ কাউন্টডাউন", "৩ · ২ · ১");
    return `<div class="hook" id="hk"><div class="strike"><div class="sw">${esc(R.hook.strike)}<i></i></div><div class="free">${esc(R.hook.free)}</div></div>
  <svg class="lead" viewBox="0 0 300 300" style="overflow:visible"><circle cx="150" cy="150" r="140" fill="none" stroke="#5A4A3C" stroke-width="4"/><circle cx="150" cy="150" r="120" fill="none" stroke="#FFB547" stroke-width="10" stroke-dasharray="754" stroke-dashoffset="754" id="lsw" transform="rotate(-90 150 150)"/><line x1="0" y1="150" x2="300" y2="150" stroke="#5A4A3C" stroke-width="3"/><line x1="150" y1="0" x2="150" y2="300" stroke="#5A4A3C" stroke-width="3"/></svg>
  <div class="lead" id="ldw" style="opacity:1">${[3, 2, 1].map((n) => `<span id="ld${n}">${ctx.bnd(n)}</span>`).join("")}</div></div>`;
  },

  hookOut(ctx, t) { ctx.js(`tl.set("#hk", { opacity: 0 }, ${ctx.f3(t + 0.04)});`); },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    js(`tl.set("#t${k}", { opacity: 1 }, ${f3(tt.tCard)});`);
    js(`tl.fromTo("#leak", { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: 0.12, immediateRender: false }, ${f3(tt.tCard - 0.04)}); tl.to("#leak", { opacity: 0, x: 300, duration: 0.45, ease: "power2.out" }, ${f3(tt.tCard + 0.09)});`);
    ctx.flash(tt.tCard, 0.22);
    cue(tt.tCard, "camera-shutter", 0.45);
    // the playhead jumps to this clip's start, then travels across it until the next repo
    const { x, w } = this.clipX(ctx, k);
    js(`tl.to("#ph", { x: ${(x - 16).toFixed(1)}, duration: 0.3, ease: "power3.inOut" }, ${f3(tt.tCard - 0.1)});`);
    js(`tl.to("#ph", { x: ${(x - 16 + w - 6).toFixed(1)}, duration: ${f3(Math.max(0.5, tt.sEnd - tt.tCard - 0.3))}, ease: "none" }, ${f3(tt.tCard + 0.22)});`);
    js(`tl.to("#clf${k}", { opacity: 0.85, duration: 0.2 }, ${f3(tt.tCard)}); tl.to("#cl${k} span", { color: "#0E0B09", duration: 0.2 }, ${f3(tt.tCard)});`);
    js(`tl.fromTo("#cl${k}", { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, ${f3(tt.tCard)});`);
    cue(tt.tCard - 0.1, "whoosh-short", 0.25);
    ctx.beats.push(tt.tCard);
  },

  exit(ctx, tt, t) { ctx.js(`tl.set("#t${tt.k}", { opacity: 0 }, ${ctx.f3(t + 0.2)});`); },

  cta(ctx, tC) {
    const { js, f3 } = ctx;
    js(`tl.to("#mon, #tline, #ph", { opacity: 0, y: 30, duration: 0.3, ease: "power2.in" }, ${f3(tC - 0.25)});`);
  },
};
