// REEL1 টার্মিনাল (Terminal) on the series engine — a series look for tools/reel/series.mjs, the REEL1 dark-UI world
// of tools/reel/build.mjs rebuilt so a series episode keeps the series' promise card, how-to steps, inbox chip and
// end. World: near-black UI room, a dotted grid, a warm orange glow. The stage: a dark card on top and a terminal
// window below it. Hook: the terminal opens big, "claude" is typed at the prompt and a counter "০ / ৫ ইনস্টল" sits
// in the title bar. Each repo: hit-stop on its name (the card punches in, a short flash, a heavy hit), the terminal
// types the repo's install command, a progress bar fills and a green tick says it is ready; the counter goes up.
// Motion: hit-stops, typing, snaps. Sounds: impact, key-press, typing, success.
// Extra reel.json fields: tools[].cmd (≤ 40 characters, the install command shown in the terminal),
// hook.cmd (the first command, default "claude"), hook.on (word for the counter pop).
const CARD = { x: 0, y: 0, w: 821, h: 500 };
const TERM = { x: 0, y: 516, w: 821, h: 174 };
export const look = {
  code: "REEL1",
  nameBn: "টার্মিনাল",
  colors: {
    bg: "#0B0B0F", ink: "#E6E6E6", muted: "#9DA3AE", accent: "#D97757", good: "#3FB950", warn: "#F2CC60",
    tool: ["#D97757", "#58A6FF", "#BC8CFF", "#3FB950", "#F2CC60"],
    capOff: "rgba(230,230,230,0.42)", capOn: "#D97757", capDone: "#FFFFFF",
  },
  layout: { inner: 757, mono: 80, nm: 50 },
  settleDy: 150, settleScale: 1.12, fxFrom: { x: 36 }, fxEase: "power4.out", fxIcon: 30, pfFrom: { scale: 0.7 },
  sfx: { name: "impact-bass-2", nameVol: 0.45, nameDur: 0.6, feature: "key-press", featureVol: 0.32, proof: "success", proofVol: 0.3, warn: "error", stat: "ping", card: "pop", push: "whoosh-short" },
  plan: {
    world: "প্রায় কালো ডার্ক-UI ঘর, বিন্দুর গ্রিড, কমলা আলোর আভা; স্টেজে উপরে কার্ড, নিচে টার্মিনাল, টাইটেল-বারে \"ইনস্টল\" গোনা",
    drawn: "ডার্ক কার্ড, টার্মিনাল, প্রগ্রেস বার, টিক",
    hook: (R) => `বড় টার্মিনাল খোলে, প্রম্পটে "${R.hook.cmd ?? "claude"}" টাইপ হয়, উপরে "০ / ৫ ইনস্টল"`,
    enter: (k, t) => `হিট-স্টপ: নাম আসতেই কার্ড ঝাঁকি দিয়ে ঢোকে, ঝলক, ভারী আঘাত; টার্মিনালে "${t.cmd}" টাইপ হয়, বার ভরে, সবুজ টিক; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "ফিচার ঝটকায় পাশ থেকে আসে",
    proof: () => "সবুজ পিল বসে",
  },
  validate(t) { return !t.cmd || [...t.cmd].length > 40 ? ["cmd: the install command shown in the terminal, 1-40 characters"] : []; },

  css(ctx) {
    const M = `"JetBrains Mono", "Hind Siliguri", monospace`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .room { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% 35%, #1B1512 0%, #0F0E10 50%, #0B0B0F 85%);
  background-image: radial-gradient(rgba(255,255,255,0.07) 1.5px, rgba(0,0,0,0) 2px), radial-gradient(ellipse 80% 50% at 50% 35%, #1B1512 0%, #0F0E10 50%, #0B0B0F 85%); background-size: 36px 36px, 100% 100%; }
#world .glow { position: absolute; left: 140px; top: 360px; width: 800px; height: 600px; border-radius: 50%; background: radial-gradient(closest-side, rgba(217,119,87,0.18), rgba(217,119,87,0)); }
#badge { background: rgba(255,255,255,0.06); border: 2px solid rgba(217,119,87,0.6); }
/* terminal */
#term { position: absolute; left: ${TERM.x}px; top: ${TERM.y}px; width: ${TERM.w}px; height: ${TERM.h}px; box-sizing: border-box; border-radius: 16px; background: #0E0F14; border: 1.5px solid #2A2D36; box-shadow: 0 24px 60px rgba(0,0,0,0.5); overflow: hidden; transform-origin: 50% 0%; }
#term .tb { height: 40px; display: flex; align-items: center; gap: 10px; padding: 0 18px; background: #16171D; border-bottom: 1px solid #2A2D36; }
#term .tb i { width: 13px; height: 13px; border-radius: 50%; display: block; }
#term .tb .tc { margin-left: auto; font: 700 24px/1 ${B}; color: #C9CDD4; }
#term .tb .tn { position: relative; display: inline-block; width: 70px; height: 30px; }
#term .tb .tn span { position: absolute; right: 0; top: 0; font: 700 26px/30px ${M}; color: #D97757; opacity: 0; }
#term .bd { position: relative; height: 134px; }
#term .ln { position: absolute; left: 22px; right: 22px; top: 14px; font: 600 28px/1.4 ${M}; color: #E6E6E6; white-space: nowrap; opacity: 0; }
#term .ln b { color: #3FB950; font-weight: 700; }
#term .ln .cmd { display: inline-block; clip-path: inset(0 100% 0 0); }
#term .pg { position: absolute; left: 22px; right: 22px; top: 70px; display: flex; align-items: center; gap: 16px; opacity: 0; }
#term .pg .bar { width: 380px; height: 18px; border-radius: 9px; background: #23252D; overflow: hidden; }
#term .pg .bar b { display: block; height: 100%; width: 100%; background: var(--c); transform-origin: 0 50%; transform: scaleX(0); }
#term .pg .ok { display: flex; align-items: center; gap: 10px; font: 700 28px/1.3 ${M}; color: #3FB950; opacity: 0; }
/* hook */
#hk .big { position: absolute; left: 30px; right: 30px; top: 90px; height: 420px; border-radius: 20px; background: #0E0F14; border: 1.5px solid #2A2D36; box-shadow: 0 30px 80px rgba(0,0,0,0.6); overflow: hidden; }
#hk .big .tb { height: 48px; display: flex; align-items: center; gap: 12px; padding: 0 22px; background: #16171D; border-bottom: 1px solid #2A2D36; }
#hk .big .tb i { width: 15px; height: 15px; border-radius: 50%; display: block; }
#hk .big .wl { position: absolute; left: 34px; top: 86px; padding: 18px 26px; border: 2px solid #D97757; border-radius: 12px; font: 700 34px/1.3 ${M}; color: #D97757; opacity: 0; }
#hk .big .pr { position: absolute; left: 34px; top: 230px; font: 600 40px/1.3 ${M}; color: #E6E6E6; white-space: nowrap; }
#hk .big .pr b { color: #3FB950; }
#hk .big .pr .hc { display: inline-block; clip-path: inset(0 100% 0 0); }
#hk .big .cur { display: inline-block; width: 18px; height: 40px; margin-left: 6px; background: #D97757; vertical-align: -6px; }
#hk .cnt { position: absolute; left: 0; right: 0; top: 560px; text-align: center; font: 800 44px/1.3 ${B}; color: #FFFFFF; opacity: 0; }
#hk .cnt b { font: 800 56px/1.3 "Baloo Da 2", ${B}; color: #D97757; }
/* the card */
.tool { left: ${CARD.x}px !important; top: ${CARD.y}px !important; width: ${CARD.w}px; height: ${CARD.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 30px 32px 24px;
  border-radius: 18px; background: #15161C; border: 1.5px solid #2A2D36; box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 3px 0 var(--c); display: flex; flex-direction: column; gap: 16px; }
.tool .mono { width: 80px; height: 80px; border-radius: 16px; background: var(--c); color: #0B0B0F; font-size: 30px; }
.tool .nm { font-size: 50px; }
.tool .fxs { gap: 10px; }
.tool .fx { height: 58px; padding: 0 18px 0 10px; border-radius: 12px; background: #1C1E25; border: 1px solid #2A2D36; }
.tool .fx .fi { width: 44px; height: 44px; border-radius: 10px; background: var(--cb); }
.tool .fx .fl { font-size: 31px; }
.tool .pf { margin-top: auto; align-self: flex-start; padding: 10px 24px 10px 14px; border-radius: 10px; background: rgba(63,185,80,0.12); border: 1.5px solid #3FB950; font-size: 30px; }
.tool .pf.warn { background: rgba(242,204,96,0.12); border-color: #F2CC60; }
.tool .hws { gap: 12px; }
.tool .hw .hn { width: 50px; height: 50px; border-radius: 12px; font-size: 30px; }
.ec, .cs { background: #15161C; }
`;
  },

  world(ctx) {
    // the warm glow drifts slowly the whole video so the dark room is never still
    ctx.js(`tl.to("#rglow", { x: 140, y: -120, scale: 1.15, duration: 6, ease: "sine.inOut", yoyo: true, repeat: ${Math.floor(ctx.total / 6)} }, 0);`);
    return `<div class="room"></div><div class="glow" id="rglow"></div>`;
  },

  stageBack(ctx) {
    const { N, tools, esc, bnd, toolColor, svgCheck } = ctx;
    const nums = Array.from({ length: N + 1 }, (_, k) => `<span id="tn${k}"${k === 0 ? ' style="opacity:1"' : ""}>${bnd(k)}/${bnd(N)}</span>`).join("");
    const lines = tools.map((t, k) => `<div class="ln" id="tl${k}"><b>$</b> <span class="cmd" id="tcm${k}">${esc(t.cmd)}</span></div><div class="pg" id="tpg${k}" style="--c:${toolColor(k)}"><div class="bar"><b id="tbr${k}"></b></div><div class="ok" id="tok${k}">${svgCheck(26, "#3FB950", 3.6)}<span>ready</span></div></div>`).join("");
    return `<div id="term"><div class="tb"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span class="tc">ইনস্টল</span><span class="tn">${nums}</span></div><div class="bd">${lines}</div></div>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc, N, bnd } = ctx;
    const cmd = R.hook.cmd ?? "claude";
    ctx.pre(`gsap.set("#term", { opacity: 0 });`);
    show("#hk", 0, {}, 0.01);
    show("#hk .big", 0.05, { scale: 0.9, y: 40 }, 0.45, "power4.out");
    cue(0.05, "whoosh-short", 0.35);
    js(`tl.fromTo("#hcm", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: ${f3(0.07 * cmd.length)}, ease: "steps(${cmd.length})", immediateRender: false }, 0.5);`);
    for (let i = 0; i < Math.min(6, cmd.length); i++) cue(0.5 + i * 0.07, "key-press", 0.22);
    js(`tl.fromTo("#hcur", { opacity: 1 }, { opacity: 0, duration: 0.01, repeat: ${Math.max(1, Math.floor((H.t1 - 0.5) / 0.45))}, repeatDelay: 0.44, yoyo: true, immediateRender: false }, 0.5);`);
    const tW = 0.5 + 0.07 * cmd.length + 0.3;
    show("#hk .wl", tW, { scale: 0.85 }, 0.35, "back.out(1.8)"); cue(tW, "impact-bass-2", 0.4, 0.6); ctx.beats.push(tW);
    const tN = Math.max(tW + 0.6, Math.min(H.t1 - 0.8, findIn(H.words, R.hook.on ?? "পাঁচটা")?.start ?? tW + 1));
    show("#hk .cnt", tN, { y: 20, scale: 0.9 }, 0.4, "back.out(1.8)"); cue(tN, "ping", 0.35); ctx.beats.push(tN);
    row(0, "অন্ধকার ঘরে বড় টার্মিনাল খোলে", "—");
    row(0.5, `প্রম্পটে "${cmd}" টাইপ হয়, তারপর স্বাগত বাক্স ধাক্কা দিয়ে আসে`, cmd);
    row(tN, `নিচে গোনা "০ / ${bnd(N)} ইনস্টল হয়েছে"`, `০ / ${bnd(N)}`);
    return `<div class="hook" id="hk"><div class="big"><div class="tb"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i></div>
  <div class="wl">${esc(R.hook.welcome ?? "✻ Claude Code").replace("✻ ", "")}</div><div class="pr"><b>$</b> <span class="hc" id="hcm">${esc(cmd)}</span><i class="cur" id="hcur"></i></div></div>
  <div class="cnt"><b>০ / ${bnd(N)}</b> ইনস্টল হয়েছে</div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#hk", { y: -60, opacity: 0, duration: 0.3, ease: "power3.in" }, ${f3(t - 0.35)});`);
    js(`tl.fromTo("#term", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, ${f3(t)});`);
    cue(t - 0.35, "whoosh-short", 0.3);
  },

  enter(ctx, tt) {
    const { js, f3, cue, tools } = ctx;
    const k = tt.k, n = [...tools[k].cmd].length;
    // hit-stop: the card punches in on the name, a short flash
    // a hard cut in (no fade: a fading card measured 1.1:1 contrast mid-fade), then the punch settles on 1
    js(`tl.set("#t${k}", { opacity: 1 }, ${f3(tt.tCard - 0.02)}); tl.fromTo("#t${k}", { scale: 1.08 }, { scale: 1, duration: 0.22, ease: "power4.out", immediateRender: false }, ${f3(tt.tCard - 0.02)});`);
    ctx.flash(tt.tName - 0.02, 0.18);
    cue(tt.tCard - 0.02, "whoosh-short", 0.25);
    // the terminal: the previous install line clears, this one types, the bar fills, ready
    if (k > 0) js(`tl.to("#tl${k - 1}, #tpg${k - 1}", { opacity: 0, duration: 0.15 }, ${f3(tt.tCard - 0.1)});`);
    const t0 = tt.tCard + 0.15, tType = Math.min(1.2, 0.045 * n);
    js(`tl.set("#tl${k}", { opacity: 1 }, ${f3(t0)}); tl.fromTo("#tcm${k}", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: ${f3(tType)}, ease: "steps(${n})", immediateRender: false }, ${f3(t0)});`);
    cue(t0, "typing", 0.2, tType);
    const tP = t0 + tType + 0.15;
    js(`tl.set("#tpg${k}", { opacity: 1 }, ${f3(tP)}); tl.fromTo("#tbr${k}", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power1.inOut", immediateRender: false }, ${f3(tP)});`);
    js(`tl.fromTo("#tok${k}", { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.25, immediateRender: false }, ${f3(tP + 0.95)});`);
    js(`tl.set("#tn${k}", { opacity: 0 }, ${f3(tP + 0.95)}); tl.set("#tn${k + 1}", { opacity: 1 }, ${f3(tP + 0.95)});`);
    cue(tP + 0.95, "success", 0.22);
    ctx.beats.push(tt.tCard, tP, tP + 0.95);
  },

  exit(ctx, tt, t) {
    ctx.js(`tl.to("#t${tt.k}", { x: -60, opacity: 0, duration: 0.2, ease: "power3.in" }, ${ctx.f3(t - 0.08)});`);
  },

  cta(ctx, tC) {
    const { js, f3 } = ctx;
    js(`tl.to("#term", { y: 60, opacity: 0, duration: 0.35, ease: "power2.in" }, ${f3(tC - 0.2)});`);
  },
};
