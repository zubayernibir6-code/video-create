// REEL9 আলপনা (Alpona) — a series look for tools/reel/series.mjs.
// World: deep maroon earth with a large white rice-paste alpona (a lotus mandala: rings of dots, a petal ring, a
// centre flower) that draws itself line by line in the hook and then turns very slowly behind everything. Across the
// top of the stage five lotus petals wait as outlines; each repo fills its petal with colour. Hook: the letter "অ"
// writes itself with a pen stroke, then its fill floods in, and a code mark "</>" lands beside it on the code word.
// Each repo: a maroon card with a dotted rice-paste border unrolls (scaleY from the top), the name is revealed like
// calligraphy (a left-to-right wipe), features arrive on a slight curve, the proof is a marigold pill.
// Motion: line drawing, calligraphic wipes, slow rotation. Sounds: chime, impact-bass-2 (a dhol-like thump), pop.
// Extra reel.json fields: hook.letter (default "অ"), hook.code (the word for "</>", default "কোড").
const PET = { y: 18, xs: [90, 250, 410, 570, 730], w: 92, h: 106 }; // bottom dot ends at 134, above the card (150); the top clears the badge band even at the back.out overshoot
const CARD = { x: 20, y: 150, w: 781, h: 540 };
const RICE = "#F7EBD9";
export const look = {
  code: "REEL9",
  nameBn: "আলপনা",
  colors: {
    bg: "#2A0A0E", ink: "#FFF5E8", muted: "#E2C9B5", accent: "#F5A623", good: "#5FD38D", warn: "#FFB15C",
    tool: ["#F5A623", "#FF5A5F", "#4CC38A", "#5AB0FF", "#C99BFF"],
    capOff: "rgba(255,245,232,0.42)", capOn: "#F5A623", capDone: "#FFFFFF",
  },
  layout: { inner: 693, mono: 86, nm: 52 },
  settleDy: 160, settleScale: 1.15, fxFrom: { x: -30, y: 14 }, fxEase: "power3.out", fxIcon: 32, pfFrom: { scale: 0.6 },
  sfx: { name: "chime", nameVol: 0.4, feature: "click-soft", featureVol: 0.3, proof: "impact-bass-2", proofVol: 0.4, warn: "error", stat: "ping", card: "pop", push: "whoosh-short" },
  plan: {
    world: "গাঢ় মেরুন মাটিতে বড় সাদা চালের-গুঁড়োর আলপনা (পদ্ম-মণ্ডল), হুকে নিজে আঁকা হয়, তারপর পুরো ভিডিও ধরে খুব ধীরে ঘোরে; স্টেজের উপরে ৫টা পদ্মের পাপড়ি, প্রতিটা রিপোতে একটা রঙে ভরে",
    drawn: "আলপনা, পদ্মের পাপড়ি, \"অ\" অক্ষর, কোডের চিহ্ন, বিন্দু-বর্ডারের কার্ড",
    hook: (R) => `কলমের টানে "${R.hook.letter ?? "অ"}" অক্ষর নিজে আঁকা হয়, রং ভরে; "${R.hook.code ?? "কোড"}" শব্দে পাশে </> চিহ্ন বসে; পেছনে আলপনা আঁকা হয়`,
    enter: (k) => `${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} পাপড়ি রঙে ভরে; বিন্দু-বর্ডারের মেরুন কার্ড উপর থেকে খোলে; নাম ক্যালিগ্রাফির মতো বাঁ থেকে ফুটে ওঠে, তারপর উপরে বসে`,
    feature: () => "ফিচার হালকা বাঁকে ভেসে আসে",
    proof: () => "গাঁদা-রঙের পিল ঢোলের তালে বসে",
  },
  validate(t) { return []; },

  css(ctx) {
    const B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .earth { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 55% at 50% 40%, #5A1720 0%, #3A0E14 50%, #2A0A0E 85%); }
#world .alp { position: absolute; left: 40px; top: 260px; width: 1000px; height: 1000px; opacity: 0.32; }
#world .edge { position: absolute; left: 0; right: 0; height: 40px; background-image: radial-gradient(circle, ${RICE} 4px, rgba(0,0,0,0) 5px); background-size: 34px 34px; opacity: 0.35; }
#badge { background: rgba(255,245,232,0.08); border: 2px solid rgba(245,166,35,0.6); }
#badge .bt { color: #FFF1DC; }
#pets { position: absolute; left: 0; top: 0; width: 821px; height: 140px; overflow: visible; }
/* hook */
#hk .letter { position: absolute; left: 150px; top: 20px; width: 520px; height: 520px; }
#hk .code { position: absolute; left: 300px; top: 566px; padding: 10px 26px; border-radius: 18px; background: rgba(245,166,35,0.16); border: 3px solid #F5A623; font: 800 54px/1.2 "JetBrains Mono", "Hind Siliguri", monospace; color: #FFD58A; opacity: 0; }
/* the card */
.tool { left: ${CARD.x}px !important; top: ${CARD.y}px !important; width: ${CARD.w}px; height: ${CARD.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 32px 40px 28px;
  border-radius: 26px; background: linear-gradient(170deg, rgba(110,26,36,0.92), rgba(62,14,20,0.95)); outline: 3px dotted ${RICE}; outline-offset: -14px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 70px var(--cb); display: flex; flex-direction: column; gap: 18px; transform-origin: 50% 0%; }
.tool .mono { width: 86px; height: 86px; border-radius: 50%; background: var(--c); color: #2A0A0E; font-size: 32px; box-shadow: 0 0 0 5px rgba(247,235,217,0.25); }
.tool .nm { font-size: 52px; }
.tool .fxs { gap: 12px; }
.tool .fx { height: 66px; padding: 0 22px 0 12px; border-radius: 33px; background: rgba(247,235,217,0.08); }
.tool .fx .fi { width: 48px; height: 48px; border-radius: 50%; background: var(--cb); }
.tool .fx .fl { font-size: 32px; }
.tool .pf { margin-top: auto; align-self: flex-start; padding: 12px 28px 12px 18px; border-radius: 999px; background: #F5A623; color: #2A0A0E; font-size: 30px; }
.tool .pf svg { stroke: #2A0A0E; }
.tool .pf.warn { background: #FFB15C; }
.ec { background: linear-gradient(170deg, rgba(110,26,36,0.92), rgba(62,14,20,0.95)); }
`;
  },

  world(ctx) {
    const { js, f3, total } = ctx;
    // the alpona: rings of dots, a ring of 16 petals, an inner flower, as stroked paths that draw themselves
    const C0 = 500, P = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, a1 = a - 0.17, a2 = a + 0.17, r0 = 250, r1 = 420;
      const p = (r, t) => `${(C0 + r * Math.cos(t)).toFixed(1)} ${(C0 + r * Math.sin(t)).toFixed(1)}`;
      P.push(`M${p(r0, a)} Q${p(r1 * 0.8, a1)} ${p(r1, a)} Q${p(r1 * 0.8, a2)} ${p(r0, a)}`);
    }
    const inner = [];
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const x = C0 + 120 * Math.cos(a), y = C0 + 120 * Math.sin(a); inner.push(`M${C0} ${C0} Q${(C0 + 150 * Math.cos(a - 0.5)).toFixed(1)} ${(C0 + 150 * Math.sin(a - 0.5)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} Q${(C0 + 150 * Math.cos(a + 0.5)).toFixed(1)} ${(C0 + 150 * Math.sin(a + 0.5)).toFixed(1)} ${C0} ${C0}`); }
    const dots = (r, n, s) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return `<circle cx="${(C0 + r * Math.cos(a)).toFixed(1)}" cy="${(C0 + r * Math.sin(a)).toFixed(1)}" r="${s}" fill="${RICE}"/>`; }).join("");
    js(`tl.fromTo("#alpp", { attr: { "stroke-dashoffset": 5200 } }, { attr: { "stroke-dashoffset": 0 }, duration: 2.6, ease: "power1.inOut", immediateRender: false }, 0.2);`);
    js(`tl.fromTo("#alpi", { attr: { "stroke-dashoffset": 2600 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.8, ease: "power1.inOut", immediateRender: false }, 0.6);`);
    js(`tl.fromTo("#alpd", { opacity: 0 }, { opacity: 1, duration: 1.0, immediateRender: false }, 1.6);`);
    js(`tl.fromTo("#alp", { rotation: 0 }, { rotation: 40, svgOrigin: "500 500", duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`);
    return `<div class="earth"></div><svg class="alp" viewBox="0 0 1000 1000" data-layout-allow-overflow><g id="alp"><path id="alpp" d="${P.join(" ")}" fill="none" stroke="${RICE}" stroke-width="6" stroke-linecap="round" stroke-dasharray="5200" stroke-dashoffset="5200"/>
<path id="alpi" d="${inner.join(" ")}" fill="none" stroke="${RICE}" stroke-width="5" stroke-dasharray="2600" stroke-dashoffset="2600"/><g id="alpd" opacity="0">${dots(460, 48, 6)}${dots(220, 24, 5)}${dots(40, 8, 6)}</g></g></svg>
<div class="edge" style="top:150px"></div><div class="edge" style="top:1700px"></div>`;
  },

  stageBack(ctx) {
    const { N, toolColor } = ctx;
    const pet = (x, k) => `<g id="pg${k}"><path id="pf${k}x" d="M${x} ${PET.y + PET.h} C ${x - PET.w / 2 - 8} ${PET.y + 70}, ${x - 24} ${PET.y + 14}, ${x} ${PET.y} C ${x + 24} ${PET.y + 14}, ${x + PET.w / 2 + 8} ${PET.y + 70}, ${x} ${PET.y + PET.h} Z" fill="${toolColor(k)}" fill-opacity="0" stroke="${RICE}" stroke-width="3.5" stroke-opacity="0.7"/><circle cx="${x}" cy="${PET.y + PET.h + 10}" r="6" fill="${RICE}" opacity="0.7"/></g>`;
    return `<svg id="pets" width="821" height="140" viewBox="0 0 821 140">${Array.from({ length: N }, (_, k) => pet(PET.xs[k], k)).join("")}</svg>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc } = ctx;
    const L = R.hook.letter ?? "অ";
    ctx.pre(`gsap.set("#pets", { opacity: 0 });`);
    show("#hk", 0, {}, 0.01);
    js(`tl.fromTo("#lt", { attr: { "stroke-dashoffset": 2400 } }, { attr: { "stroke-dashoffset": 0 }, duration: 1.3, ease: "power1.inOut", immediateRender: false }, 0.1);`);
    js(`tl.fromTo("#lt", { attr: { "fill-opacity": 0 } }, { attr: { "fill-opacity": 1 }, duration: 0.5, immediateRender: false }, 1.42);`);
    cue(0.1, "whoosh-short", 0.3); cue(1.35, "chime", 0.4); ctx.beats.push(1.3);
    const tC = Math.max(1.8, Math.min(H.t1 - 0.8, findIn(H.words, R.hook.code ?? "কোড")?.start ?? 2.4));
    show("#hk .code", tC, { scale: 0.5, rotation: -10 }, 0.45, "back.out(2)"); cue(tC, "impact-bass-2", 0.45, 0.6); ctx.beats.push(tC);
    row(0, "মেরুন মাটি; কলমের টানে বড় অক্ষর নিজে আঁকা হয়, পেছনে আলপনা আঁকা শুরু", L);
    row(1.3, "অক্ষরে রং ভরে, আলপনার বিন্দু ফোটে", "—");
    row(tC, "\"কোড\" শব্দে অক্ষরের পাশে </> চিহ্ন লাফিয়ে বসে, ঢোলের মতো আঘাত", "</>");
    return `<div class="hook" id="hk"><svg class="letter" viewBox="0 0 520 520"><text id="lt" x="260" y="400" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, &#39;Hind Siliguri&#39;, sans-serif" font-weight="800" font-size="430" fill="#F5A623" fill-opacity="0" stroke="${RICE}" stroke-width="6" stroke-dasharray="2400" stroke-dashoffset="2400">${esc(L)}</text></svg><div class="code">&lt;/&gt;</div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#hk", { scale: 0.85, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(t - 0.45)});`);
    js(`tl.fromTo("#pets", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, immediateRender: false }, ${f3(t - 0.05)});`);
    cue(t - 0.45, "whoosh-short", 0.3);
  },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    js(`tl.to("#pf${k}x", { attr: { "fill-opacity": 0.9 }, duration: 0.5, ease: "power2.out" }, ${f3(tt.tName)}); tl.fromTo("#pg${k}", { scale: 0.7 }, { scale: 1, svgOrigin: "${PET.xs[k]} ${PET.y + PET.h}", duration: 0.6, ease: "back.out(2)", immediateRender: false }, ${f3(tt.tName)});`);
    cue(tt.tName + 0.05, "impact-bass-2", 0.3, 0.6);
    js(`tl.fromTo("#t${k}", { opacity: 0, scaleY: 0.06 }, { opacity: 1, scaleY: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, ${f3(tt.tCard - 0.05)});`);
    js(`tl.fromTo("#t${k} .nm", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut", immediateRender: false }, ${f3(tt.tCard + 0.2)});`);
    ctx.pre(`gsap.set("#t${k} .nm", { clipPath: "inset(0 100% 0 0)" });`);
    cue(tt.tCard - 0.05, "whoosh-short", 0.3);
    ctx.beats.push(tt.tCard, tt.tName);
  },

  exit(ctx, tt, t) {
    ctx.js(`tl.to("#t${tt.k}", { scaleY: 0.06, opacity: 0, duration: 0.3, ease: "power2.in" }, ${ctx.f3(t - 0.1)});`);
  },

  cta(ctx, tC) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#pets", { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(tC - 0.25)});`);
    cue(tC + 0.1, "chime", 0.3);
  },
};
