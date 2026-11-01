// REEL6 অফলাইন রাত (Offline Night) — a series look for tools/reel/series.mjs.
// World: a quiet night sky in three drifting star layers (slow parallax), a crescent moon, dark hills under the
// captions where one laptop glows alone. Across the top of the stage five dim stars wait; each repo lights its star
// and a line joins it to the last, so the five make a constellation. Hook: a Wi-Fi sign gets struck through on the
// off word ("অফলাইন"), yet a chat answers: the question bubble, three typing dots, the reply streams in, and a
// "০ টাকা" pill on the money word. Each repo: a frosted night panel rises slowly into place, features drift up,
// the proof glows. Motion: slow cinematic rises, sine eases, depth. Sounds: sparkle, chime, soft clicks.
// Extra reel.json fields: hook.off, hook.reply, hook.money (words), hook.ask, hook.answer, hook.cost (texts).
const STAR = { y: 64, xs: [70, 240, 410, 580, 750], ys: [70, 28, 60, 22, 66] };
const PANEL = { x: 30, y: 150, w: 761, h: 540 };
export const look = {
  code: "REEL6",
  nameBn: "অফলাইন রাত",
  colors: {
    bg: "#050814", ink: "#EEF2FF", muted: "#A7B2D6", accent: "#FFD27A", good: "#7FE3C4", warn: "#FFB86B",
    tool: ["#FFD27A", "#9CC9FF", "#C3A6FF", "#7FE3C4", "#FF9EC4"],
    capOff: "rgba(238,242,255,0.42)", capOn: "#FFD27A", capDone: "#FFFFFF",
  },
  layout: { inner: 685, mono: 88, nm: 54 },
  settleDy: 170, settleScale: 1.15, fxFrom: { y: 30 }, fxEase: "power2.out", fxIcon: 30, pfFrom: { y: 24 },
  sfx: { name: "sparkle", nameVol: 0.4, feature: "click-soft", featureVol: 0.3, proof: "chime", proofVol: 0.26, warn: "error", stat: "ping", card: "pop", push: "whoosh-short" },
  plan: {
    world: "শান্ত রাতের আকাশে তিন স্তরের তারা ধীরে সরে, চাঁদ, ক্যাপশনের নিচে অন্ধকার পাহাড়ে একা জ্বলা ল্যাপটপ; স্টেজের উপরে ৫টা ম্লান তারা, প্রতিটা রিপোতে একটা জ্বলে আর রেখায় জুড়ে তারামণ্ডল হয়",
    drawn: "তারা, চাঁদ, পাহাড়, ল্যাপটপ, কাচের প্যানেল, Wi-Fi চিহ্ন, চ্যাট",
    hook: (R) => `Wi-Fi চিহ্নে "${R.hook.off}" শব্দে দাগ পড়ে, "অফলাইন" লেখা; তবু চ্যাটে প্রশ্নের উত্তর টাইপ হয়ে আসে, "${R.hook.money}" শব্দে "${R.hook.cost}"`,
    enter: (k) => `${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} তারা জ্বলে${k ? ", আগের তারার সাথে রেখায় জোড়া লাগে" : ""}; কাচের রাতের প্যানেল ধীরে উঠে আসে; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "ফিচারের সারি ধীরে ভেসে ওঠে",
    proof: () => "প্রমাণের পিল নরম আলোয় জ্বলে",
  },

  css(ctx) {
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .sky { position: absolute; inset: 0; background: linear-gradient(180deg, #0D1A44 0%, #0A1230 38%, #070B1E 62%, #050814 100%); }
#world .stars { position: absolute; left: 0; top: 0; width: 1px; height: 1px; border-radius: 50%; background: transparent; }
#world .moon { position: absolute; left: 820px; top: 150px; width: 120px; height: 120px; border-radius: 50%; box-shadow: 26px -14px 0 0 #F4E7C3; }
#world .moonglow { position: absolute; left: 700px; top: 40px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(closest-side, rgba(244,231,195,0.16), rgba(244,231,195,0)); }
#world .hills { position: absolute; left: 0; top: 1300px; width: 1080px; height: 620px; }
#world .lglow { position: absolute; left: 330px; top: 1300px; width: 420px; height: 260px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,210,122,0.35), rgba(255,210,122,0)); }
#badge { background: rgba(255,255,255,0.08); border: 2px solid rgba(255,210,122,0.5); }
#badge .bt { color: #FFF3D6; }
#cons { position: absolute; left: 0; top: 0; width: 821px; height: 140px; overflow: visible; }
/* hook */
#hk .wifi { position: absolute; left: 40px; top: 170px; width: 200px; height: 200px; }
#hk .off { position: absolute; left: 260px; top: 230px; padding: 10px 26px; border-radius: 999px; background: rgba(255,120,120,0.16); border: 2px solid #FF8A8A; font: 700 32px/1.3 ${B}; color: #FFD0D0; opacity: 0; }
#hk .chat { position: absolute; left: 40px; right: 40px; top: 400px; display: flex; flex-direction: column; gap: 14px; }
#hk .q { align-self: flex-end; max-width: 560px; padding: 16px 24px; border-radius: 26px 26px 6px 26px; background: #2B4A8F; font: 700 30px/1.35 ${B}; color: #FFFFFF; opacity: 0; }
#hk .a { align-self: flex-start; position: relative; min-width: 300px; max-width: 600px; padding: 16px 24px; border-radius: 26px 26px 26px 6px; background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18); font: 700 30px/1.35 ${B}; color: #FFFFFF; opacity: 0; }
#hk .dots { display: flex; gap: 10px; height: 40px; align-items: center; }
#hk .dots i { width: 14px; height: 14px; border-radius: 50%; background: #FFD27A; display: block; }
#hk .atx { position: absolute; left: 24px; top: 16px; white-space: nowrap; clip-path: inset(0 100% 0 0); }
#hk .cost { position: absolute; right: 40px; top: 600px; padding: 10px 24px; border-radius: 999px; background: rgba(127,227,196,0.16); border: 2px solid #7FE3C4; font: 800 32px/1.3 ${B}; color: #DFFFF4; opacity: 0; }
/* the night panel */
.tool { left: ${PANEL.x}px !important; top: ${PANEL.y}px !important; width: ${PANEL.w}px; height: ${PANEL.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 32px 38px 30px;
  border-radius: 34px; background: linear-gradient(170deg, rgba(40,56,110,0.62), rgba(14,22,52,0.78)); border: 1.5px solid rgba(255,255,255,0.20);
  box-shadow: 0 30px 90px rgba(0,0,0,0.55), 0 0 80px var(--cb); display: flex; flex-direction: column; gap: 18px; }
.tool .mono { width: 88px; height: 88px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFFFFF, var(--c) 60%); color: #050814; font-size: 32px; box-shadow: 0 0 40px var(--cg); }
.tool .nm { font-size: 54px; }
.tool .fxs { gap: 14px; }
.tool .fx { height: 70px; padding: 0 24px 0 16px; border-radius: 20px; background: rgba(255,255,255,0.07); }
.tool .fx .fi { width: 46px; height: 46px; border-radius: 50%; background: var(--cb); }
.tool .fx .fl { font-size: 32px; }
.tool .pf { margin-top: auto; align-self: flex-start; padding: 12px 26px; border-radius: 999px; background: rgba(127,227,196,0.12); border: 2px solid rgba(127,227,196,0.7); box-shadow: 0 0 30px rgba(127,227,196,0.25); font-size: 30px; }
.tool .pf.warn { background: rgba(255,184,107,0.12); border-color: rgba(255,184,107,0.8); box-shadow: 0 0 30px rgba(255,184,107,0.2); }
.ec { background: linear-gradient(170deg, rgba(40,56,110,0.6), rgba(14,22,52,0.8)); border-width: 2px; }
`;
  },

  world(ctx) {
    const { js, f3, total } = ctx;
    // three star layers, each one element with many box-shadows (cheap), drifting at different speeds
    const layer = (n, seed, size, alpha) => {
      const pts = [];
      let s = seed;
      const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < n; i++) pts.push(`${Math.round(rnd() * 1180) - 50}px ${Math.round(rnd() * 1300)}px 0 ${size}px rgba(255,255,255,${(alpha * (0.5 + rnd() / 2)).toFixed(2)})`);
      return pts.join(",");
    };
    [[70, 0.6, 0.8, 30], [45, 1.1, 0.75, 55], [22, 1.8, 0.9, 85]].forEach(([n, size, a, dx], i) =>
      js(`tl.fromTo("#st${i}", { x: 0 }, { x: -${dx}, duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`));
    js(`tl.to("#lglow", { opacity: 0.6, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: ${Math.floor(total / 1.8)} }, 0);`);
    const hills = `<svg class="hills" viewBox="0 0 1080 620"><path d="M0 170 C 180 90, 330 120, 470 150 C 610 180, 760 80, 1080 130 L1080 620 L0 620 Z" fill="#0A1028"/><path d="M0 260 C 220 190, 420 230, 600 220 C 780 210, 900 170, 1080 210 L1080 620 L0 620 Z" fill="#060A1A"/>
<g transform="translate(470 118)"><rect x="0" y="0" width="140" height="88" rx="8" fill="#1B2550" stroke="#FFD27A" stroke-width="3"/><rect x="10" y="10" width="120" height="68" rx="4" fill="#FFE6A8" opacity="0.9"/><path d="M-16 92 H156 L146 104 H-6 Z" fill="#2A3566"/></g></svg>`;
    return `<div class="sky"></div>${[[70, 0.6, 0.8], [45, 1.1, 0.75], [22, 1.8, 0.9]].map(([n, size, a], i) => `<div class="stars" id="st${i}" style="box-shadow:${layer(n, 17 + i * 101, size, a)}"></div>`).join("")}
<div class="moonglow"></div><div class="moon"></div><div class="lglow" id="lglow" style="opacity:0.35"></div>${hills}`;
  },

  stageBack(ctx) {
    const { N, toolColor } = ctx;
    const lines = Array.from({ length: N - 1 }, (_, k) => {
      const x1 = STAR.xs[k], y1 = STAR.ys[k], x2 = STAR.xs[k + 1], y2 = STAR.ys[k + 1], L = Math.hypot(x2 - x1, y2 - y1);
      return `<line id="cl${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,231,170,0.6)" stroke-width="3" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}"/>`;
    }).join("");
    const stars = Array.from({ length: N }, (_, k) => `<g id="sg${k}"><circle cx="${STAR.xs[k]}" cy="${STAR.ys[k]}" r="26" fill="${toolColor(k)}" opacity="0" id="sh${k}"/><circle cx="${STAR.xs[k]}" cy="${STAR.ys[k]}" r="9" fill="#FFFFFF" opacity="0.35" id="sc${k}"/></g>`).join("");
    return `<svg id="cons" width="821" height="140" viewBox="0 0 821 140">${lines}${stars}</svg>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc, total } = ctx;
    // the dim stars twinkle until their repo's intro starts (an odd repeat count ends on the start value), then light up
    for (let k = 0; k < ctx.N; k++) {
      let n = Math.floor((ctx.first(ctx.LN.tools[k].intro) - k * 0.3) / 1.4) - 1;
      if (n % 2 === 0) n -= 1;
      if (n >= 1) js(`tl.to("#sc${k}", { opacity: 0.6, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: ${n} }, ${f3(k * 0.3)});`);
    }
    show("#hk", 0, {}, 0.01);
    show("#hk .wifi", 0.05, { scale: 0.85 }, 0.6, "power2.out");
    const tOff = Math.max(0.5, findIn(H.words, R.hook.off ?? "বন্ধ")?.start ?? 0.9);
    js(`tl.to("#wslash", { attr: { "stroke-dashoffset": 0 }, duration: 0.3, ease: "power2.out" }, ${f3(tOff)});`);
    js(`tl.to("#warcs", { opacity: 0.3, duration: 0.3 }, ${f3(tOff)});`);
    show("#hk .off", tOff + 0.2, { x: -20 }, 0.4); cue(tOff, "glitch-3", 0.25, 0.5); ctx.beats.push(tOff);
    const tQ = tOff + 0.7;
    show("#hk .q", tQ, { y: 20 }, 0.45, "power2.out"); cue(tQ, "notification", 0.3);
    show("#hk .a", tQ + 0.6, { y: 20 }, 0.45, "power2.out");
    js(`tl.to("#hk .dots i", { y: -8, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 3, stagger: 0.12 }, ${f3(tQ + 0.7)});`);
    const tR = Math.max(tQ + 1.6, findIn(H.words, R.hook.reply ?? "উত্তর")?.start ?? tQ + 1.6);
    js(`tl.to("#hk .dots", { opacity: 0, duration: 0.15 }, ${f3(tR)});`);
    const n = [...(R.hook.answer ?? "")].length;
    js(`tl.to("#atx", { clipPath: "inset(0 0% 0 0)", duration: ${f3(Math.min(1.2, 0.05 * n))}, ease: "steps(${Math.max(1, n)})" }, ${f3(tR + 0.1)});`);
    cue(tR + 0.1, "typing", 0.2); ctx.beats.push(tR);
    const tM = Math.min(H.t1 - 0.8, Math.max(tR + 1.0, findIn(H.words, R.hook.money ?? "টাকাও")?.start ?? tR + 1.2));
    show("#hk .cost", tM, { scale: 0.6 }, 0.5, "back.out(1.8)"); cue(tM, "coin-drop", 0.35);
    row(0, "রাতের আকাশ, উপরে ৫টা ম্লান তারা; বড় Wi-Fi চিহ্ন", "—");
    row(tOff, "Wi-Fi চিহ্নে দাগ পড়ে, \"অফলাইন\" পিল", "অফলাইন");
    row(tQ, "চ্যাটে প্রশ্নের বাবল, তারপর টাইপিংয়ের তিনটা বিন্দু", R.hook.ask);
    row(tR, "AI-এর উত্তর টাইপ হয়ে আসে", R.hook.answer);
    row(tM, "খরচের সবুজ পিল লাফিয়ে আসে", R.hook.cost);
    const wifi = `<svg class="wifi" viewBox="0 0 200 200"><g id="warcs" stroke="#9CC9FF" stroke-width="16" fill="none" stroke-linecap="round"><path d="M30 80 A100 100 0 0 1 170 80"/><path d="M58 112 A60 60 0 0 1 142 112"/><path d="M86 142 A20 20 0 0 1 114 142"/></g><circle cx="100" cy="166" r="12" fill="#9CC9FF"/><line id="wslash" x1="30" y1="30" x2="170" y2="180" stroke="#FF8A8A" stroke-width="16" stroke-linecap="round" stroke-dasharray="206" stroke-dashoffset="206"/></svg>`;
    return `<div class="hook" id="hk">${wifi}<div class="off">অফলাইন</div>
  <div class="chat"><div class="q">${esc(R.hook.ask)}</div><div class="a"><div class="dots"><i></i><i></i><i></i></div><span class="atx" id="atx">${esc(R.hook.answer)}</span></div></div>
  <div class="cost">${esc(R.hook.cost)}</div></div>`;
  },

  hookOut(ctx, t) { ctx.js(`tl.to("#hk", { opacity: 0, y: -30, duration: 0.5, ease: "sine.in" }, ${ctx.f3(t - 0.45)});`); },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    js(`tl.fromTo("#t${k}", { opacity: 0, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out", immediateRender: false }, ${f3(tt.tCard - 0.1)});`);
    js(`tl.to("#sh${k}", { opacity: 0.9, duration: 0.5, ease: "power2.out" }, ${f3(tt.tName)}); tl.fromTo("#sg${k}", { scale: 0.6 }, { scale: 1, svgOrigin: "${STAR.xs[k]} ${STAR.ys[k]}", duration: 0.7, ease: "back.out(2)", immediateRender: false }, ${f3(tt.tName)});`);
    js(`tl.to("#sc${k}", { opacity: 1, duration: 0.3 }, ${f3(tt.tName)});`);
    if (k > 0) js(`tl.to("#cl${k - 1}", { attr: { "stroke-dashoffset": 0 }, duration: 0.6, ease: "power2.inOut" }, ${f3(tt.tName + 0.1)});`);
    cue(tt.tCard - 0.1, "whoosh-short", 0.22);
    ctx.beats.push(tt.tCard, tt.tName);
  },

  exit(ctx, tt, t) { ctx.js(`tl.to("#t${tt.k}", { opacity: 0, y: -40, duration: 0.45, ease: "sine.in" }, ${ctx.f3(t - 0.25)});`); },

  cta(ctx, tC) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#cons", { y: -30, opacity: 0.0, duration: 0.5, ease: "sine.in" }, ${f3(tC - 0.3)});`);
    cue(tC + 0.1, "sparkle", 0.3);
  },
};
