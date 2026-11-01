// REEL4 ভল্ট (Vault) — a series look for tools/reel/series.mjs.
// World: brushed steel in the dark, a huge vault wheel turning slowly below the captions. Across the top of the stage
// five round dial padlocks hang open; each repo locks one (the dial spins, the shackle drops with a clank, the body
// takes the repo's colour). Hook: a password field types "123456", cracks on the leak word, Facebook / Gmail account
// chips gather, and on the loss word the field shatters into falling shards. Each repo: a heavy steel plate swings
// shut like a vault door (rotationY from its hinge), a light glint sweeps it; features drop in heavily; the proof is
// stamped. Motion: heavy, rotating, metallic. Sounds: boom, clank (click), key presses, impact.
// Extra reel.json fields: hook.secret (typed text), hook.accounts (2 short names), hook.crack / hook.lose (words).
const LOCK = { y: 0, w: 120, h: 150, gap: 55 };
const PLATE = { x: 20, y: 190, w: 781, h: 500 };
export const look = {
  code: "REEL4",
  nameBn: "ভল্ট",
  colors: {
    bg: "#0A0D11", ink: "#EEF1F5", muted: "#A3AEBA", accent: "#E8B04B", good: "#4FD1C5", warn: "#F0A14B",
    tool: ["#E8B04B", "#4FD1C5", "#F06A6A", "#7AA2FF", "#A6E35A"],
    capOff: "rgba(238,241,245,0.42)", capOn: "#E8B04B", capDone: "#FFFFFF",
  },
  layout: { inner: 701, mono: 90, nm: 52 },
  settleDy: 170, settleScale: 1.15, fxFrom: { y: -36 }, fxEase: "power4.out", fxIcon: 30, pfFrom: { scale: 1.7, rotation: -12 },
  sfx: { name: "boom", nameVol: 0.42, nameDur: 0.9, feature: "click", featureVol: 0.32, proof: "impact-bass-1", proofVol: 0.45, warn: "error", stat: "ping", card: "click", push: "whoosh-short" },
  plan: {
    world: "অন্ধকারে ঘষা ইস্পাত, ক্যাপশনের নিচে বিশাল ভল্টের চাকা ধীরে ঘোরে; স্টেজের উপরে ৫টা খোলা ডায়াল-তালা, প্রতিটা রিপোতে একটা বন্ধ হয়",
    drawn: "ডায়াল-তালা, ইস্পাতের প্লেট, ভল্টের চাকা, ভাঙা কাচের টুকরো",
    hook: (R) => `পাসওয়ার্ডের ঘরে "${R.hook.secret}" টাইপ হয়, "${R.hook.crack}" শব্দে ফাটল ধরে, পাশে ${R.hook.accounts.join(" আর ")} অ্যাকাউন্ট, "${R.hook.lose}" শব্দে ঘরটা ভেঙে টুকরো হয়ে পড়ে যায়`,
    enter: (k) => `${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} তালার ডায়াল ঘোরে, শিকল নেমে "ক্লিক" করে বন্ধ হয়; ভারী ইস্পাতের প্লেট ভল্টের দরজার মতো ঘুরে বন্ধ হয়, ধাতব ঝিলিক`,
    feature: () => "খোদাই করা সারি ভারী হয়ে নেমে বসে",
    proof: () => "সিলমোহরের মতো প্রমাণ ছাপ পড়ে",
  },
  validate(t) { return []; },

  css(ctx) {
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .steel { position: absolute; inset: 0; background-color: #0C1015;
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 2px, rgba(0,0,0,0) 2px 5px), linear-gradient(180deg, #121821 0%, #0C1015 55%, #07090C 100%); }
#world .vig { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 55% at 50% 38%, rgba(232,176,75,0.07), rgba(0,0,0,0) 70%); }
#world .wheel { position: absolute; left: 140px; top: 1290px; width: 800px; height: 800px; }
#badge { background: #161B22; border: 2px solid rgba(232,176,75,0.6); }
#badge .bt { color: #F3E3C0; }
.lk { position: absolute; top: ${LOCK.y}px; width: ${LOCK.w}px; height: ${LOCK.h}px; }
.lk .sh { position: absolute; left: 0; top: 0; }
.lk .bd { position: absolute; left: 6px; top: 58px; width: 108px; height: 88px; border-radius: 20px; background: linear-gradient(160deg, #3A424D, #222830);
  border: 2px solid #56616E; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
.lk .bc { position: absolute; inset: -2px; border-radius: 20px; background: var(--c); opacity: 0; }
.lk .dl { position: relative; width: 52px; height: 52px; }
/* hook: the password field */
#hk .pw { position: absolute; left: 110px; top: 300px; width: 600px; }
#hk .pl { font: 700 30px/1.3 ${B}; color: #A3AEBA; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
#hk .pfld { position: relative; width: 600px; height: 112px; }
#hk .pfld svg { position: absolute; left: 0; top: 0; overflow: visible; }
#hk .ptx { position: absolute; left: 34px; top: 0; height: 112px; display: flex; align-items: center; font: 800 58px/1 "JetBrains Mono", ${S}; color: #FFFFFF; }
#hk .acc { position: absolute; top: 470px; display: flex; align-items: center; gap: 12px; padding: 10px 22px 10px 12px; border-radius: 999px; background: #1A2028; border: 2px solid #3A4450; font: 700 30px/1.2 ${S}; color: #FFFFFF; opacity: 0; }
#hk .acc i { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font: 900 24px/1 ${S}; font-style: normal; color: #0A0D11; }
#hk .lost { position: absolute; left: 0; right: 0; top: 190px; text-align: center; font: 800 40px/1.3 ${B}; color: #F06A6A; opacity: 0; }
/* the steel plate */
.tool { left: ${PLATE.x}px !important; top: ${PLATE.y}px !important; width: ${PLATE.w}px; height: ${PLATE.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box;
  padding: 30px 40px 28px; border-radius: 22px; background: linear-gradient(150deg, #2B323B, #1A1F26 55%, #232A33); border: 2px solid #4C5765;
  box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 10px rgba(0,0,0,0.18), inset 0 0 0 12px rgba(255,255,255,0.05);
  display: flex; flex-direction: column; gap: 18px; overflow: hidden; transform-origin: 0% 50%; }
.tool .rv { position: absolute; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #9AA6B2, #3A424D); }
.tool .gl { position: absolute; top: -40px; left: -260px; width: 160px; height: 600px; transform: rotate(18deg); background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0)); }
.tool .mono { width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFFFFF, var(--c) 45%); color: #0A0D11; font-size: 32px;
  box-shadow: 0 0 0 6px #2B323B, 0 0 0 9px var(--c), 0 10px 30px rgba(0,0,0,0.5); }
.tool .nm { font-size: 52px; }
.tool .fxs { gap: 12px; }
.tool .fx { height: 66px; padding: 0 20px 0 14px; border-radius: 14px; background: rgba(0,0,0,0.28); box-shadow: inset 0 2px 0 rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.06); }
.tool .fx .fi { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--c); }
.tool .fx .fl { font-size: 32px; }
.tool .pf { margin-top: auto; align-self: flex-end; padding: 12px 26px; border-radius: 12px; border: 4px double var(--c); color: #FFFFFF; font-size: 30px; transform: rotate(-3deg); background: rgba(0,0,0,0.3); }
.tool .pf.warn { border-color: #F0A14B; }
.ec { background: linear-gradient(150deg, #2B323B, #1A1F26); border-radius: 16px; }
`;
  },

  world(ctx) {
    const spokes = Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<line x1="${400 + 90 * Math.cos(a)}" y1="${400 + 90 * Math.sin(a)}" x2="${400 + 330 * Math.cos(a)}" y2="${400 + 330 * Math.sin(a)}" stroke="rgba(160,172,186,0.16)" stroke-width="26" stroke-linecap="round"/>`; }).join("");
    const bolts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return `<circle cx="${(400 + 370 * Math.cos(a)).toFixed(1)}" cy="${(400 + 370 * Math.sin(a)).toFixed(1)}" r="12" fill="rgba(160,172,186,0.18)"/>`; }).join("");
    ctx.js(`tl.to("#wheel", { rotation: 140, svgOrigin: "400 400", duration: ${ctx.f3(ctx.total)}, ease: "none" }, 0);`);
    return `<div class="steel"></div><div class="vig"></div><svg class="wheel" viewBox="0 0 800 800"><g id="wheel"><circle cx="400" cy="400" r="390" fill="none" stroke="rgba(160,172,186,0.14)" stroke-width="18"/><circle cx="400" cy="400" r="330" fill="none" stroke="rgba(160,172,186,0.12)" stroke-width="8"/>${spokes}${bolts}<circle cx="400" cy="400" r="90" fill="rgba(160,172,186,0.12)" stroke="rgba(160,172,186,0.2)" stroke-width="8"/></g></svg>`;
  },

  stageBack(ctx) {
    const { tools, N, toolColor, esc } = ctx;
    const x0 = (821 - (N * LOCK.w + (N - 1) * LOCK.gap)) / 2;
    return tools.map((t, k) => {
      const c = toolColor(k);
      const dial = `<svg class="dl" viewBox="0 0 52 52" overflow="visible" data-layout-allow-overflow><g id="dl${k}"><circle cx="26" cy="26" r="23" fill="#14181E" stroke="#8C98A6" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<line x1="${26 + 17 * Math.cos(a)}" y1="${26 + 17 * Math.sin(a)}" x2="${26 + 21 * Math.cos(a)}" y2="${26 + 21 * Math.sin(a)}" stroke="#8C98A6" stroke-width="2"/>`; }).join("")}<rect x="24" y="6" width="4" height="14" rx="2" fill="${c}"/></g></svg>`;
      return `<div class="lk" style="left:${(x0 + k * (LOCK.w + LOCK.gap)).toFixed(1)}px;--c:${c}"><svg class="sh" id="sh${k}" width="120" height="80" viewBox="0 0 120 80"><path d="M30 76 V40 A30 30 0 0 1 90 40 V76" fill="none" stroke="#8C98A6" stroke-width="12" stroke-linecap="round"/></svg>
  <div class="bd"><div class="bc" id="bc${k}"></div>${dial}</div></div>`;
    }).join("");
  },

  toolExtra() {
    return `<i class="rv" style="left:16px;top:16px"></i><i class="rv" style="right:16px;top:16px"></i><i class="rv" style="left:16px;bottom:16px"></i><i class="rv" style="right:16px;bottom:16px"></i><div class="gl" data-layout-allow-overflow></div>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc, N } = ctx;
    for (let k = 0; k < N; k++) ctx.pre(`gsap.set("#sh${k}", { y: -22 });`);
    const secret = R.hook.secret ?? "123456";
    const tType = 0.25;
    show("#hk", 0, {}, 0.01);
    show("#hk .pw", 0.05, { y: 30 }, 0.4);
    js(`tl.fromTo("#ptx", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: ${0.09 * secret.length}, ease: "steps(${secret.length})", immediateRender: false }, ${f3(tType)});`);
    ctx.pre(`gsap.set("#ptx", { clipPath: "inset(0 100% 0 0)" });`);
    for (let i = 0; i < secret.length; i++) cue(tType + i * 0.09, "key-press", 0.26);
    const tCrack = Math.max(tType + 0.8, findIn(H.words, R.hook.crack ?? "ফাঁস")?.start ?? 1.2);
    js(`tl.to(".crk", { attr: { "stroke-dashoffset": 0 }, duration: 0.25, ease: "power2.out", stagger: 0.04 }, ${f3(tCrack)});`);
    cue(tCrack, "glitch-1", 0.4, 0.5); ctx.beats.push(tCrack);
    const accs = R.hook.accounts ?? ["Facebook", "Gmail"];
    accs.forEach((a, i) => {
      const t = Math.max(tCrack + 0.3 + i * 0.25, findIn(H.words, a)?.start ?? 0);
      show(`#acc${i}`, t, { y: 20, scale: 0.8 }, 0.4, "back.out(1.8)"); cue(t, "pop", 0.3);
    });
    const tLose = Math.min(H.t1 - 1.1, Math.max(tCrack + 1.2, findIn(H.words, R.hook.lose ?? "হাতছাড়া")?.start ?? tCrack + 1.5));
    js(`tl.set("#ptx", { opacity: 0 }, ${f3(tLose)});`);
    [[-220, 420, -38], [-80, 520, 24], [60, 460, -16], [190, 540, 40], [-140, 600, 12], [140, 380, -30]].forEach(([x, y, r], i) =>
      js(`tl.to("#shd${i}", { x: ${x}, y: ${y}, rotation: ${r}, opacity: 0, duration: 0.9, ease: "power2.in" }, ${f3(tLose + i * 0.03)});`));
    js(`tl.to(".crk", { opacity: 0, duration: 0.1 }, ${f3(tLose)});`);
    accs.forEach((_, i) => js(`tl.to("#acc${i}", { y: 360, rotation: ${i ? 22 : -22}, opacity: 0, duration: 0.8, ease: "power2.in" }, ${f3(tLose + 0.08)});`));
    show("#lost", tLose + 0.1, { scale: 1.3 }, 0.35, "power3.out");
    cue(tLose, "glitch-2", 0.35, 0.5); cue(tLose + 0.05, "boom", 0.45, 1.0); ctx.flash(tLose, 0.3);
    row(0, "ঘষা ইস্পাত, উপরে ৫টা খোলা তালা; পাসওয়ার্ডের ঘরে টাইপ হয়", secret);
    row(tCrack, "পাসওয়ার্ডের ঘরে ফাটল ধরে; অ্যাকাউন্টের চিপ আসে", accs.join(" · "));
    row(tLose, "ঘরটা ভেঙে টুকরো হয়ে পড়ে যায়, অ্যাকাউন্টগুলোও; লাল লেখা", R.hook.lostText ?? "সব হাতছাড়া");
    // the pieces: six polygons that together are the field; cracks drawn on top
    const P = [[0, 0, 170, 0, 140, 60, 0, 112], [170, 0, 330, 0, 280, 70, 140, 60], [330, 0, 600, 0, 600, 50, 280, 70], [0, 112, 140, 60, 280, 70, 230, 112], [230, 112, 280, 70, 600, 50, 600, 112], [280, 70, 600, 50, 600, 50, 280, 70]];
    const shards = P.map((p, i) => `<polygon id="shd${i}" points="${p.join(",")}" fill="#171C23" stroke="#4C5765" stroke-width="2"/>`).join("");
    const cracks = ["M140 60 L170 0", "M140 60 L280 70 L330 0", "M280 70 L600 50", "M140 60 L0 112", "M280 70 L230 112"].map((d) => `<path class="crk" d="${d}" stroke="#F06A6A" stroke-width="4" fill="none" stroke-dasharray="400" stroke-dashoffset="400"/>`).join("");
    const accHtml = accs.map((a, i) => `<div class="acc" id="acc${i}" style="left:${i ? 430 : 110}px"><i style="background:${i ? "#F06A6A" : "#7AA2FF"}">${esc(a[0])}</i>${esc(a)}</div>`).join("");
    return `<div class="hook" id="hk"><div class="pw"><div class="pl">${ctx.icon("key-round", 32, "#A3AEBA", 2.4)}<span>পাসওয়ার্ড</span></div>
  <div class="pfld"><svg width="600" height="112" viewBox="0 0 600 112">${shards}${cracks}</svg><div class="ptx" id="ptx">${esc(secret)}</div></div></div>
  ${accHtml}<div class="lost" id="lost">${esc(R.hook.lostText ?? "সব হাতছাড়া")}</div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3 } = ctx;
    js(`tl.to("#hk", { opacity: 0, duration: 0.25 }, ${f3(t - 0.3)});`);
  },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    // the lock: dial spins, shackle drops, body takes the colour
    js(`tl.to("#dl${k}", { rotation: 300, svgOrigin: "26 26", duration: 0.8, ease: "power3.inOut" }, ${f3(tt.tName - 0.25)});`);
    js(`tl.to("#sh${k}", { y: 0, duration: 0.18, ease: "power4.in" }, ${f3(tt.tName + 0.45)});`);
    js(`tl.to("#bc${k}", { opacity: 0.85, duration: 0.25 }, ${f3(tt.tName + 0.6)});`);
    js(`tl.to("#sh${k} path", { stroke: "${tt.color}", duration: 0.25 }, ${f3(tt.tName + 0.6)});`);
    cue(tt.tName + 0.62, "click", 0.55); cue(tt.tName + 0.64, "impact-bass-2", 0.3, 0.6);
    // the plate swings shut from its hinge, then a glint crosses it
    js(`tl.fromTo("#t${k}", { opacity: 0, rotationY: -75, transformPerspective: 1400, x: -40 }, { opacity: 1, rotationY: 0, x: 0, duration: 0.75, ease: "power4.out", immediateRender: false }, ${f3(tt.tCard)});`);
    js(`tl.fromTo("#t${k} .gl", { x: 0 }, { x: 1300, duration: 0.9, ease: "power2.inOut", immediateRender: false }, ${f3(tt.tCard + 0.55)});`);
    cue(tt.tCard, "whoosh", 0.35);
    ctx.beats.push(tt.tCard, tt.tName + 0.6, tt.tCard + 0.55);
  },

  exit(ctx, tt, t) {
    const { js, f3 } = ctx;
    js(`tl.to("#t${tt.k}", { y: 70, opacity: 0, duration: 0.3, ease: "power3.in" }, ${f3(t - 0.1)});`);
  },

  cta(ctx, tC) {
    const { js, f3, N } = ctx;
    js(`tl.to(".lk", { y: -30, opacity: 0, duration: 0.35, ease: "power2.in", stagger: 0.04 }, ${f3(tC - 0.3)});`);
  },
};
