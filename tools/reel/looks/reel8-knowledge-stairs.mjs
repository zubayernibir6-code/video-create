// REEL8 জ্ঞানের সিঁড়ি (Knowledge Stairs) — a series look for tools/reel/series.mjs.
// World: a night library, shelves of book spines that drift DOWN the whole video (the camera keeps rising), warm lamp
// glow. On the left of the stage a staircase of stacked books, one step per repo, "লেভেল ১…৫" on the spines; a
// glowing graduation-cap token climbs one step per repo in a hop. Hook: a closed book with "লেভেল ০" on its cover;
// the cover flips open on the hook word and the page reads the hook title. Each repo: its card turns in like a page
// (rotationY from the spine), features step up from below, the proof is a gold seal; the card turns away to leave.
// Motion: upward climbs, page turns in 3D, hops. Sounds: page-turn, chime, success, click.
// Extra reel.json fields: hook.cover (cover text, default "লেভেল ০"), hook.title (the open page), hook.on (word).
const STEP = { x: 6, w: 150, y0: 590, dy: 118 };
const CARD = { x: 186, y: 0, w: 635, h: 690 };
export const look = {
  code: "REEL8",
  nameBn: "জ্ঞানের সিঁড়ি",
  colors: {
    bg: "#0C1430", ink: "#F3F1EA", muted: "#B9C0D8", accent: "#F2C14E", good: "#9BE564", warn: "#FF9F59",
    tool: ["#F2C14E", "#5BC0EB", "#9BC53D", "#FA7921", "#FF6B8B"],
    capOff: "rgba(243,241,234,0.42)", capOn: "#F2C14E", capDone: "#FFFFFF",
  },
  layout: { inner: 563, mono: 84, nm: 48 },
  settleDy: 200, settleScale: 1.12, fxFrom: { y: 34 }, fxEase: "back.out(1.5)", fxIcon: 32, pfFrom: { scale: 0.5, rotation: -20 },
  sfx: { name: "chime", nameVol: 0.42, feature: "click-soft", featureVol: 0.3, proof: "success", proofVol: 0.3, warn: "error", stat: "ping", card: "page-turn", push: "whoosh-short" },
  plan: {
    world: "রাতের লাইব্রেরি, বইয়ের তাক পুরো ভিডিও ধরে ধীরে নিচে নামে (ক্যামেরা উপরে উঠছে), বাতির উষ্ণ আলো; স্টেজের বাঁয়ে বইয়ের সিঁড়ি, প্রতিটা ধাপে \"লেভেল ১-৫\"",
    drawn: "বইয়ের তাক, বইয়ের সিঁড়ি, গ্র্যাজুয়েশন টুপির টোকেন, খোলা বই, সোনালি সিল",
    hook: (R) => `বন্ধ বইয়ের মলাটে "${R.hook.cover ?? "লেভেল ০"}"; মলাট উল্টে খোলে, পাতায় "${R.hook.title ?? ""}"`,
    enter: (k) => `টুপির টোকেন লাফিয়ে ${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} ধাপে ওঠে, ধাপ জ্বলে; কার্ড বইয়ের পাতার মতো উল্টে আসে; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "ফিচার নিচ থেকে এক ধাপ উঠে আসে",
    proof: () => "সোনালি সিল ঘুরে বসে",
  },
  validate(t) { return []; },

  css(ctx) {
    const B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .lib { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 45% at 60% 35%, #23305E 0%, #141E44 50%, #0C1430 85%); }
#world .shelves { position: absolute; left: 0; top: -420px; width: 1080px; height: 2760px; opacity: 0.3; }
#world .lamp { position: absolute; left: 520px; top: 120px; width: 720px; height: 720px; border-radius: 50%; background: radial-gradient(closest-side, rgba(242,193,78,0.20), rgba(242,193,78,0)); }
#badge { background: rgba(255,255,255,0.08); border: 2px solid rgba(242,193,78,0.55); }
#badge .bt { color: #FFF5DA; }
#stage { perspective: 1800px; }
/* stairs */
#stairs { position: absolute; left: 0; top: 0; width: 170px; height: 690px; }
.stp { position: absolute; left: ${STEP.x}px; width: ${STEP.w}px; height: 62px; }
.stp .b1, .stp .b2 { position: absolute; border-radius: 5px; box-shadow: 0 6px 12px rgba(0,0,0,0.45); }
.stp .b1 { left: 0; top: 26px; width: ${STEP.w}px; height: 36px; background: #3A4675; }
.stp .b2 { left: 12px; top: 0; width: ${STEP.w - 24}px; height: 28px; background: #2C365F; }
.stp .lv { position: absolute; left: 0; right: 0; top: 30px; text-align: center; font: 700 24px/1.2 ${B}; color: rgba(255,255,255,0.75); }
.stp .gl { position: absolute; left: -8px; right: -8px; top: -6px; bottom: -6px; border-radius: 10px; opacity: 0; }
#cap { position: absolute; left: ${STEP.x + STEP.w / 2 - 34}px; top: 0; width: 68px; height: 68px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFF6D6, #F2C14E 70%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 34px rgba(242,193,78,0.7); }
/* hook: the book */
#hk .book { position: absolute; left: 170px; top: 70px; width: 480px; height: 560px; }
#hk .page { position: absolute; inset: 0; border-radius: 8px 20px 20px 8px; background: #F7F1E3; box-shadow: 0 30px 70px rgba(0,0,0,0.55); padding: 70px 50px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 18px; }
#hk .book { opacity: 0; }
#hk .page .pt { opacity: 0; font: 800 54px/1.3 "Baloo Da 2", ${B}; color: #1C2448; text-wrap: balance; }
#hk .page .pl { height: 6px; width: 70%; border-radius: 3px; background: #E3D8BF; }
#hk .cover { position: absolute; inset: 0; border-radius: 8px 20px 20px 8px; background: linear-gradient(135deg, #8E2C2C, #5E1B22); border-left: 18px solid #3E1016; box-sizing: border-box; display: flex; align-items: center; justify-content: center; transform-origin: 0% 50%; backface-visibility: hidden; box-shadow: 0 30px 70px rgba(0,0,0,0.55); }
#hk .cover span { font: 800 66px/1.3 "Baloo Da 2", ${B}; color: #F2C14E; }
/* the card: a page */
.tool { left: ${CARD.x}px !important; top: ${CARD.y}px !important; width: ${CARD.w}px; height: ${CARD.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 34px 36px 28px;
  border-radius: 10px 28px 28px 10px; background: linear-gradient(160deg, #1D2850, #131B3B); border: 2px solid rgba(242,193,78,0.35); border-left: 12px solid var(--c);
  box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 60px var(--cb); display: flex; flex-direction: column; gap: 18px; transform-origin: 0% 50%; }
.tool .mono { width: 84px; height: 84px; border-radius: 16px; background: var(--c); color: #0C1430; font-size: 30px; }
.tool .nm { font-size: 48px; }
.tool .fxs { gap: 12px; }
.tool .fx { height: 68px; padding: 0 20px 0 12px; border-radius: 16px; background: rgba(255,255,255,0.06); border-bottom: 3px solid var(--cg); }
.tool .fx .fi { width: 48px; height: 48px; border-radius: 12px; background: var(--cb); }
.tool .fx .fl { font-size: 32px; }
.tool .pf { margin-top: auto; align-self: flex-start; padding: 12px 28px 12px 18px; border-radius: 999px; background: linear-gradient(90deg, #F2C14E, #E9A93A); color: #1C2448; font-size: 30px; box-shadow: 0 8px 24px rgba(242,193,78,0.35); }
.tool .pf svg { stroke: #1C2448; }
.tool .pf.warn { background: linear-gradient(90deg, #FF9F59, #F2804A); }
.ec { background: linear-gradient(160deg, #1D2850, #131B3B); }
`;
  },

  world(ctx) {
    const { js, f3, total } = ctx;
    let s = 41;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cols = ["#2E3A6B", "#3B2F5E", "#2B4D5E", "#5A3B3B", "#3D4A2E", "#4A4170"];
    let spines = "";
    for (let row = 0; row < 12; row++) {
      const y = row * 230;
      spines += `<rect x="0" y="${y + 196}" width="1080" height="14" fill="#1A1430" opacity="0.9"/>`;
      for (let x = 10; x < 1070; ) { const w = 22 + Math.round(rnd() * 30), h = 120 + Math.round(rnd() * 70); spines += `<rect x="${x}" y="${y + 196 - h}" width="${w}" height="${h}" rx="3" fill="${cols[Math.floor(rnd() * cols.length)]}"/>`; x += w + 4; }
    }
    js(`tl.fromTo("#shelves", { y: 0 }, { y: 420, duration: ${f3(total)}, ease: "none", immediateRender: false }, 0);`);
    js(`tl.to("#lamp", { opacity: 0.7, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: ${Math.floor(total / 2.2)} }, 0);`);
    return `<div class="lib"></div><svg class="shelves" id="shelves" viewBox="0 0 1080 2760" data-layout-allow-overflow>${spines}</svg><div class="lamp" id="lamp"></div>`;
  },

  stageBack(ctx) {
    const { N, toolColor, bnd } = ctx;
    const steps = Array.from({ length: N }, (_, k) => `<div class="stp" id="stp${k}" style="top:${STEP.y0 - k * STEP.dy}px"><i class="gl" id="sgl${k}" style="background:${toolColor(k)};box-shadow:0 0 30px ${toolColor(k)}"></i><i class="b2"></i><i class="b1" id="sb${k}"></i><span class="lv" id="slv${k}">লেভেল ${bnd(k + 1)}</span></div>`).join("");
    return `<div id="stairs">${steps}<div id="cap">${ctx.icon("graduation-cap", 38, "#1C2448", 2.4)}</div></div>`;
  },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc } = ctx;
    // the token waits under the first step; the stairs stay dim until the repos start
    ctx.pre(`gsap.set("#cap", { y: ${STEP.y0 + 80}, opacity: 0 }); gsap.set("#stairs", { opacity: 0 });`);
    show("#hk", 0, {}, 0.01);
    show("#hk .book", 0.05, { y: 80, scale: 0.9 }, 0.6, "back.out(1.4)");
    cue(0.05, "whoosh-short", 0.4);
    const tO = Math.max(0.9, Math.min(H.t1 - 1.2, findIn(H.words, R.hook.on ?? "স্কুল")?.start ?? 1.6));
    js(`tl.fromTo("#hk .cover", { rotationY: 0, transformPerspective: 1400 }, { rotationY: -160, transformPerspective: 1400, duration: 0.7, ease: "power2.inOut", immediateRender: false }, ${f3(tO - 0.35)});`);
    js(`tl.to("#hk .cover", { opacity: 0, duration: 0.15 }, ${f3(tO + 0.25)});`);
    cue(tO - 0.35, "page-turn", 0.55); cue(tO + 0.1, "chime", 0.35); ctx.beats.push(tO);
    show("#hk .pt", tO + 0.15, { y: 20 }, 0.4);
    row(0, "রাতের লাইব্রেরিতে একটা বন্ধ বই ভেসে ওঠে, মলাটে লেভেল ০", R.hook.cover ?? "লেভেল ০");
    row(tO - 0.35, "মলাট উল্টে বই খোলে, পাতায় হুকের কথা", R.hook.title ?? "—");
    return `<div class="hook" id="hk"><div class="book"><div class="page"><div class="pt">${esc(R.hook.title ?? "")}</div><i class="pl"></i><i class="pl" style="width:55%"></i></div><div class="cover"><span>${esc(R.hook.cover ?? "লেভেল ০")}</span></div></div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#hk", { y: -120, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(t - 0.45)});`);
    js(`tl.fromTo("#stairs", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, ${f3(t - 0.1)});`);
    js(`tl.fromTo("#cap", { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, ${f3(t + 0.2)});`);
    cue(t - 0.45, "whoosh-short", 0.3);
  },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    const yTo = STEP.y0 - k * STEP.dy - 72, yFrom = k === 0 ? STEP.y0 + 80 : STEP.y0 - (k - 1) * STEP.dy - 72;
    // the token hops up one step: up past the step, then down onto it
    js(`tl.fromTo("#cap", { y: ${yFrom} }, { y: ${yTo - 60}, duration: 0.23, ease: "power2.out", immediateRender: false }, ${f3(tt.tName - 0.3)}); tl.to("#cap", { y: ${yTo}, duration: 0.2, ease: "power2.in" }, ${f3(tt.tName - 0.06)});`);
    js(`tl.to("#sgl${k}", { opacity: 0.55, duration: 0.3 }, ${f3(tt.tName + 0.12)}); tl.to("#sb${k}", { backgroundColor: "${tt.color}", duration: 0.3 }, ${f3(tt.tName + 0.12)}); tl.to("#slv${k}", { color: "#0C1430", duration: 0.3 }, ${f3(tt.tName + 0.12)});`);
    cue(tt.tName + 0.12, "pop", 0.3);
    js(`tl.fromTo("#t${k}", { opacity: 0, rotationY: 80 }, { opacity: 1, rotationY: 0, duration: 0.65, ease: "power3.out", immediateRender: false }, ${f3(tt.tCard - 0.05)});`);
    cue(tt.tCard - 0.05, "page-turn", 0.42);
    ctx.beats.push(tt.tCard, tt.tName);
  },

  exit(ctx, tt, t) {
    const { js, f3 } = ctx;
    js(`tl.to("#t${tt.k}", { rotationY: -75, opacity: 0, duration: 0.35, ease: "power2.in" }, ${f3(t - 0.12)});`);
  },

  cta(ctx, tC) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#stairs", { x: -80, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(tC - 0.25)});`);
    cue(tC + 0.1, "success", 0.3);
  },
};
