// REEL2 পকেট গ্লাস (Pocket Glass) — a series look for tools/reel/series.mjs.
// World: a glass phone floats on the left of the stage over a deep-blue room with drifting glass orbs; its home screen
// has 3 + 2 app slots and an "অ্যাপ বসানো ০/৫" widget. Hook: the phone sits centred, a red "Storage full" glass
// notification drops on it and shakes. Each repo: its slot lights, the app icon jumps out of the phone along an arc
// and the glass card springs open from it; features are settings rows whose switches flip on; the proof is a toast;
// the card swipes up to leave. Motion: springs (back.out), vertical swipes. Sounds: pop, sparkle, click, notification.
// Extra reel.json fields: hook.title, hook.sub (the notification's two lines).
const PH = { x: 14, y: 66, w: 272, h: 570, icon: 60, gx: 20, gy: 196 }; // stage px
const STEP = (PH.w - 24 - 2 * PH.gx - PH.icon) / 2 + PH.icon;
const slotXY = (k) => [PH.x + 12 + PH.gx + (k % 3) * STEP, PH.y + 12 + PH.gy + Math.floor(k / 3) * (PH.icon + 24)];
const CARD = { x: 300, y: 26, w: 521, h: 638 };
export const look = {
  code: "REEL2",
  nameBn: "পকেট গ্লাস",
  colors: {
    bg: "#0B1026", ink: "#EEF2FF", muted: "#AEB8DA", accent: "#5EEAD4", good: "#34E39A", warn: "#FFB547",
    tool: ["#3DD6F5", "#FFC145", "#B98CFF", "#34E39A", "#FF7AB6"],
    capOff: "rgba(238,242,255,0.42)", capOn: "#5EEAD4", capDone: "#FFFFFF",
  },
  layout: { inner: 461, mono: 92, nm: 50 },
  settleDy: 190, settleScale: 1.14, fxFrom: { y: 26, scale: 0.92 }, fxEase: "back.out(1.7)", fxIcon: 32,
  sfx: { name: "pop", nameVol: 0.55, feature: "click-soft", featureVol: 0.35, proof: "notification", proofVol: 0.32, stat: "ping", card: "pop", push: "whoosh-short" },
  plan: {
    world: "বাঁ দিকে ভাসমান কাচের ফোন (৩ + ২ অ্যাপের ঘর, \"অ্যাপ বসানো\" উইজেট), পেছনে নীল ঘরে রঙিন কাচের গোলক ধীরে ভাসে, ফোনের ওয়ালপেপারে বর্তমান রিপোর রঙ",
    drawn: "কাচের ফোন, অ্যাপ-আইকন, সুইচ, টোস্ট",
    hook: (R) => `পর্দার মাঝখানে কাচের ফোন; তার উপর লাল কাচের নোটিফিকেশন "${R.hook.title}" নেমে এসে কাঁপে, নিচে "${R.hook.sub}"`,
    enter: (k) => `ফোনের ${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} ঘরে অ্যাপ-আইকন জ্বলে, আইকন লাফিয়ে ফোন থেকে বেরিয়ে ডানে কাচের কার্ড খোলে; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "সেটিংসের সারি আসে, সুইচ অন হয়",
    proof: () => "কার্ডের নিচে সবুজ টোস্ট",
  },
  validate(t) { return []; },

  css(ctx) {
    const { rgba } = ctx;
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .room { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 60% at 50% 30%, #23306A 0%, #121A40 45%, #0B1026 80%); }
#world .orb { position: absolute; border-radius: 50%; }
#world .floor { position: absolute; left: 70px; top: 1052px; width: 330px; height: 40px; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0)); }
#badge { background: rgba(255,255,255,0.10); border: 2px solid rgba(255,255,255,0.22); }
#badge .bt { color: #FFFFFF; }
/* the phone (stage coordinates) */
#phone { position: absolute; left: ${PH.x}px; top: ${PH.y}px; width: ${PH.w}px; height: ${PH.h}px; transform-origin: 50% 50%; }
#phone .ph { position: absolute; inset: 0; }
#phone .bz { position: absolute; inset: 0; overflow: hidden; border-radius: 52px; background: linear-gradient(150deg, rgba(255,255,255,0.32), rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.14));
  border: 2px solid rgba(255,255,255,0.45); box-shadow: 0 40px 90px rgba(0,0,0,0.55); }
#phone .scr { position: absolute; left: 12px; top: 12px; right: 12px; bottom: 12px; border-radius: 42px; overflow: hidden; background: linear-gradient(170deg, #1C2C63, #0D1533 70%); }
#phone .wg { position: absolute; left: -60px; top: 220px; width: 400px; height: 400px; border-radius: 50%; color: #3DD6F5; background: radial-gradient(closest-side, currentColor, rgba(0,0,0,0)); opacity: 0.3; }
#phone .ntch { position: absolute; left: 50%; top: 14px; width: 92px; height: 26px; margin-left: -46px; border-radius: 14px; background: #05070F; }
#phone .sb { position: absolute; left: 26px; right: 24px; top: 17px; display: flex; align-items: center; justify-content: space-between; }
#phone .clk { width: 44px; height: 12px; border-radius: 6px; background: rgba(255,255,255,0.85); display: block; }
#phone .wid { position: absolute; left: 16px; right: 16px; top: 60px; height: 108px; border-radius: 26px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22);
  display: flex; align-items: center; gap: 14px; padding: 0 18px; box-sizing: border-box; }
#phone .wn { position: relative; width: 92px; height: 56px; flex: none; }
#phone .wn span { position: absolute; left: 0; top: 0; font: 800 48px/1.15 "Baloo Da 2", ${B}; color: #FFFFFF; opacity: 0; white-space: nowrap; }
#phone .wl { font: 700 24px/1.25 ${B}; color: #DCE3FA; }
#phone .grid { position: absolute; left: ${PH.gx}px; right: ${PH.gx}px; top: ${PH.gy}px; display: grid; grid-template-columns: repeat(3, ${PH.icon}px); justify-content: space-between; row-gap: 24px; }
#phone .ap { width: ${PH.icon}px; height: ${PH.icon}px; border-radius: 18px; box-sizing: border-box; border: 2px dashed rgba(255,255,255,0.32); background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center; font: 900 24px/1 ${S}; color: rgba(255,255,255,0.5); }
#phone .ap.on { border: 0; background: var(--c); color: #0B1026; opacity: 0; position: absolute; left: 0; top: 0; }
#phone .slot { position: relative; width: ${PH.icon}px; height: ${PH.icon}px; }
#phone .dock { position: absolute; left: 18px; right: 18px; bottom: 34px; height: 82px; border-radius: 28px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: space-around; }
#phone .dock i { width: 52px; height: 52px; border-radius: 16px; background: rgba(255,255,255,0.18); display: block; }
#phone .home { position: absolute; left: 50%; bottom: 12px; width: 110px; height: 6px; margin-left: -55px; border-radius: 3px; background: rgba(255,255,255,0.7); }
#phone .glare { position: absolute; left: -30px; top: -80px; width: 120px; height: 760px; transform: rotate(24deg); background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0)); }
/* hook notification */
#hk .nt { position: absolute; left: 150px; top: 120px; width: 520px; border-radius: 32px; padding: 26px 30px; box-sizing: border-box; display: flex; gap: 22px; align-items: center;
  background: linear-gradient(160deg, rgba(255,90,110,0.42), rgba(120,20,40,0.55)); border: 2px solid rgba(255,140,150,0.75); box-shadow: 0 30px 70px rgba(0,0,0,0.5), 0 0 50px rgba(255,80,100,0.35); opacity: 0; }
#hk .ni { width: 78px; height: 78px; border-radius: 22px; background: #FF5A6E; display: flex; align-items: center; justify-content: center; flex: none; }
#hk .nh { font: 800 40px/1.1 ${S}; color: #FFFFFF; }
#hk .ns { font: 700 30px/1.3 ${B}; color: #FFE1E5; margin-top: 6px; }
#hk .sbar { margin-top: 14px; width: 330px; height: 14px; border-radius: 7px; background: rgba(255,255,255,0.18); overflow: hidden; }
#hk .sbar b { display: block; height: 100%; width: 100%; background: linear-gradient(90deg, #FFB547, #FF5A6E); transform-origin: 0 50%; transform: scaleX(0.55); }
/* the card */
.tool { left: ${CARD.x}px !important; top: ${CARD.y}px !important; width: ${CARD.w}px; height: ${CARD.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 30px 30px 26px; border-radius: 40px;
  background: linear-gradient(160deg, rgba(255,255,255,0.17), rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.09)); border: 2px solid rgba(255,255,255,0.3);
  box-shadow: 0 34px 90px rgba(0,0,0,0.5), 0 0 60px var(--cb); display: flex; flex-direction: column; gap: 20px; transform-origin: 0% 50%; }
.tool::before { content: ""; position: absolute; left: 40px; right: 40px; top: -2px; height: 5px; border-radius: 3px; background: var(--c); box-shadow: 0 0 20px var(--c); }
.tool .mono { width: 92px; height: 92px; border-radius: 26px; background: var(--c); color: #0B1026; font-size: 34px; box-shadow: 0 10px 30px var(--cg); }
.tool .nm { font-size: 50px; }
.tool .fxs { gap: 14px; }
.tool .fx { height: 76px; border-radius: 22px; padding: 0 16px 0 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); }
.tool .fx .fi { width: 48px; height: 48px; border-radius: 14px; background: var(--cb); }
.tool .fx .fl { font-size: 31px; }
.tool .tg { margin-left: auto; position: relative; width: 70px; height: 40px; border-radius: 20px; background: rgba(255,255,255,0.2); flex: none; }
.tool .tg b { position: absolute; left: 4px; top: 4px; width: 32px; height: 32px; border-radius: 50%; background: #FFFFFF; display: block; box-shadow: 0 2px 6px rgba(0,0,0,0.35); }
.tool .pf { margin-top: auto; align-self: center; padding: 14px 26px; border-radius: 999px; background: rgba(8,14,34,0.82); border: 2px solid rgba(52,227,154,0.6); font-size: 30px; }
.tool .pf.warn { border-color: rgba(255,181,71,0.7); }
.fly { position: absolute; width: ${PH.icon}px; height: ${PH.icon}px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font: 900 24px/1 ${S}; color: #0B1026; opacity: 0; box-shadow: 0 12px 30px rgba(0,0,0,0.45); }
/* the end */
.ec { background: linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)); border: 2px solid var(--c); }
`;
  },

  world(ctx) {
    const orbs = [[120, 520, 260, "#3DD6F5"], [820, 760, 320, "#B98CFF"], [900, 330, 200, "#FF7AB6"], [260, 1180, 300, "#34E39A"], [700, 1500, 360, "#3DD6F5"]];
    return `<div class="room"></div>${orbs.map(([x, y, d, c], i) => `<div class="orb" id="orb${i}" style="left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;background:radial-gradient(closest-side, ${ctx.rgba(c, 0.42)}, ${ctx.rgba(c, 0)})"></div>`).join("")}<div class="floor" id="floor"></div>`;
  },

  stageBack(ctx) {
    const { tools, N, esc } = ctx;
    const slots = tools.map((t, k) => `<div class="slot"><div class="ap"></div><div class="ap on" id="ap${k}" style="--c:${ctx.toolColor(k)}">${esc(t.mono)}</div></div>`).join("");
    const nums = Array.from({ length: N + 1 }, (_, k) => `<span id="wn${k}"${k === 0 ? ' style="opacity:1"' : ""}>${ctx.bnd(k)}/${ctx.bnd(N)}</span>`).join("");
    const bars = `<svg width="54" height="18" viewBox="0 0 54 18"><rect x="0" y="12" width="5" height="6" rx="1" fill="#fff"/><rect x="8" y="8" width="5" height="10" rx="1" fill="#fff"/><rect x="16" y="4" width="5" height="14" rx="1" fill="#fff"/><rect x="28" y="3" width="24" height="13" rx="3" fill="none" stroke="#fff" stroke-width="2"/><rect x="31" y="6" width="12" height="7" rx="1" fill="#fff"/></svg>`;
    return `<div id="phone"><div class="ph" id="phin"><div class="bz"><div class="glare" data-layout-allow-overflow></div></div><div class="scr"><div class="wg" id="wglow" data-layout-allow-overflow></div><div class="sb"><span class="clk"></span>${bars}</div>
  <div class="wid" id="wid"><div class="wn">${nums}</div><div class="wl">অ্যাপ বসানো</div></div>
  <div class="grid">${slots}</div><div class="dock"><i></i><i></i><i></i><i></i></div><div class="home"></div></div><div class="ntch"></div></div></div>`;
  },

  stageFront(ctx) {
    return ctx.tools.map((t, k) => `<div class="fly" id="fly${k}" style="background:${ctx.toolColor(k)};left:${slotXY(k)[0]}px;top:${slotXY(k)[1]}px">${ctx.esc(t.mono)}</div>`).join("");
  },

  fxExtra(k, i) { return `<i class="tg" id="tgt${k}_${i}"><b id="tg${k}_${i}"></b></i>`; },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn } = ctx;
    // the phone starts centred and a touch larger, the notification drops on its hook word and shakes
    ctx.pre(`gsap.set("#phone", { x: ${410 - PH.x - PH.w / 2}, scale: 1.04, opacity: 0 }); gsap.set("#wid", { opacity: 0 }); gsap.set("#floor", { opacity: 0 });`);
    js(`tl.fromTo("#phone", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.5)", immediateRender: false }, 0.05);`);
    js(`tl.fromTo("#floor", { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, 0.1);`);
    cue(0.08, "whoosh-short", 0.4);
    const tB = Math.max(0.5, Math.min(R.hook.on ? findIn(H.words, R.hook.on)?.start ?? 0.9 : 0.9, H.t1 - 1.6));
    show("#hk", 0, {}, 0.01);
    show("#hk .nt", tB, { y: -140, scale: 0.9 }, 0.5, "back.out(1.6)");
    cue(tB, "notification", 0.5); cue(tB + 0.05, "impact-bass-1", 0.45, 0.5);
    js(`tl.to("#hk .nt", { keyframes: [{ x: -16, duration: 0.05 }, { x: 14, duration: 0.05 }, { x: -10, duration: 0.05 }, { x: 8, duration: 0.05 }, { x: 0, duration: 0.05 }] }, ${f3(tB + 0.55)});`);
    const shakes = [H.words.find((w) => /নষ্ট/.test(w.text))?.start].filter((t) => t && t > tB + 1);
    for (const t of shakes) { js(`tl.to("#hk .nt", { keyframes: [{ x: -14, duration: 0.05 }, { x: 12, duration: 0.05 }, { x: -8, duration: 0.05 }, { x: 0, duration: 0.05 }] }, ${f3(t)});`); cue(t, "error", 0.25, 0.5); ctx.beats.push(t); }
    js(`tl.fromTo("#sbar", { scaleX: 0.55 }, { scaleX: 0.99, duration: ${f3(Math.max(1, H.t1 - tB - 1.2))}, ease: "power1.inOut", immediateRender: false }, ${f3(tB + 0.4)});`);
    cue(tB + 0.4, "typing", 0.14);
    row(0, "নীল ঘরে কাচের ফোন মাঝখানে ভেসে ওঠে, পেছনে রঙিন কাচের গোলক", "—");
    row(tB, `লাল কাচের নোটিফিকেশন ফোনের উপর নেমে কাঁপে`, `${R.hook.title} · ${R.hook.sub}`);
    for (const t of shakes) row(t, "\"নষ্ট\" শব্দে নোটিফিকেশন আবার কাঁপে", "—");
    // idle: the phone floats, the orbs drift (whole video)
    js(`tl.to("#phin", { y: -8, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: ${Math.floor(ctx.total / 1.6)} }, 0);`);
    for (let i = 0; i < 5; i++) js(`tl.to("#orb${i}", { x: ${[40, -50, -30, 50, -40][i]}, y: ${[-30, 40, 30, -40, 30][i]}, duration: ${(5 + i).toFixed(1)}, ease: "sine.inOut", yoyo: true, repeat: ${Math.ceil(ctx.total / (5 + i))} }, 0);`);
    return `<div class="hook" id="hk"><div class="nt"><div class="ni">${ctx.icon("triangle-alert", 46, "#FFFFFF", 2.6)}</div><div><div class="nh">${ctx.esc(R.hook.title)}</div><div class="ns">${ctx.esc(R.hook.sub)}</div><div class="sbar"><b id="sbar"></b></div></div></div></div>`;
  },

  hookOut(ctx, t) {
    const { js, cue, f3 } = ctx;
    js(`tl.to("#hk .nt", { y: -160, opacity: 0, duration: 0.35, ease: "power2.in" }, ${f3(t - 0.45)});`);
    js(`tl.to("#phone", { x: 0, scale: 1, duration: 0.6, ease: "power3.inOut" }, ${f3(t - 0.5)});`);
    js(`tl.fromTo("#wid", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.4, immediateRender: false }, ${f3(t - 0.1)});`);
    cue(t - 0.45, "whoosh-short", 0.35);
  },

  enter(ctx, tt) {
    const { js, cue, f3, row } = ctx;
    const k = tt.k;
    // slot geometry: grid at phone (14, 62) + screen 12 + grid (22, 204); 3 columns 66 px, space-between over 224 px
    const [sx, sy] = slotXY(k);
    const cx = CARD.x + 30 + 46 - PH.icon / 2, cy = CARD.y + 30 + 190 + 46 - PH.icon / 2; // where the card's badge sits before it settles
    js(`tl.to("#wglow", { color: "${tt.color}", opacity: 0.42, duration: 0.5 }, ${f3(tt.tCard - 0.1)});`);
    js(`tl.fromTo("#ap${k}", { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)", immediateRender: false }, ${f3(tt.tCard - 0.15)});`);
    js(`tl.set("#wn${k}", { opacity: 0 }, ${f3(tt.tName)}); tl.set("#wn${k + 1}", { opacity: 1 }, ${f3(tt.tName)});`);
    // the icon jumps out of the phone in an arc and the card springs open from it
    js(`tl.set("#fly${k}", { opacity: 1 }, ${f3(tt.tCard)});`);
    js(`tl.fromTo("#fly${k}", { x: 0 }, { x: ${cx - sx}, duration: 0.42, ease: "power1.inOut", immediateRender: false }, ${f3(tt.tCard)});`);
    js(`tl.fromTo("#fly${k}", { y: 0 }, { y: -150, duration: 0.2, ease: "power2.out", immediateRender: false }, ${f3(tt.tCard)});`);
    js(`tl.to("#fly${k}", { y: ${cy - sy}, scale: 1.35, duration: 0.22, ease: "power2.in" }, ${f3(tt.tCard + 0.2)});`);
    js(`tl.to("#fly${k}", { opacity: 0, duration: 0.12 }, ${f3(tt.tCard + 0.42)});`);
    js(`tl.fromTo("#t${k}", { opacity: 0, scale: 0.25, x: -60 }, { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: "back.out(1.35)", immediateRender: false }, ${f3(tt.tCard + 0.36)});`);
    ctx.beats.push(tt.tCard, tt.tCard + 0.36);
    cue(tt.tCard - 0.05, "sparkle", 0.28); cue(tt.tCard + 0.36, "whoosh-short", 0.35);
  },

  onFeature(ctx, tt, i, t) {
    const { js, f3 } = ctx;
    js(`tl.to("#tg${tt.k}_${i}", { x: 30, duration: 0.25, ease: "back.out(2)" }, ${f3(t + 0.22)});`);
    js(`tl.to("#tgt${tt.k}_${i}", { backgroundColor: "${tt.color}", duration: 0.2 }, ${f3(t + 0.22)});`);
    ctx.cue(t + 0.24, "click", 0.22);
  },

  exit(ctx, tt, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#t${tt.k}", { y: -110, opacity: 0, scale: 0.94, duration: 0.3, ease: "power2.in" }, ${f3(t - 0.08)});`);
    cue(t - 0.08, "whoosh-short", 0.3);
  },

  cta(ctx, tC) {
    const { js, f3 } = ctx;
    // the phone steps back so the five cards own the stage
    js(`tl.to("#phone", { y: 140, scale: 0.8, opacity: 0, duration: 0.5, ease: "power2.in" }, ${f3(tC - 0.1)});`);
    js(`tl.to("#floor", { opacity: 0, duration: 0.4 }, ${f3(tC - 0.1)});`);
  },
};
