// REEL7 কাগজের টেবিল (Paper Desk) — a series look for tools/reel/series.mjs.
// World: a dark walnut desk seen from above (wood grain, a coffee ring, a pencil, a paper clip). Hook: a monthly bill
// of subscriptions slides in, its total counts up, and a red rubber stamp "বাতিল" thuds onto it on the hook word.
// Each repo: a sheet of paper slides in from the right with its shadow and a strip of washi tape in the repo's colour,
// settles square; features get a hand-drawn pen underline as they are named; the proof is a round rubber stamp that
// thuds onto the sheet; the sheet is tossed to a pile at the right edge of the desk (one more sheet per repo).
// Motion: paper slides with weight (power3.out), stamp thuds (power4.in + a small desk shake), pen strokes.
// Sounds: page-turn, impact, click, pop. Extra reel.json fields: hook.bill [{label, price}] (3-4 lines), hook.total,
// hook.stamp (the stamp word), hook.on (the word the stamp lands on).
const SHEET = { x: 22, y: 14, w: 777, h: 662 };
const PILE = { x: 906, y: 820 }; // world px: the finished sheets pile up at the right edge, outside the text-safe box
const INK = "#24201B", INK2 = "#5B5348";
// the desk shake: fromTo steps with y in both vars, seek-safe (preflight from_only caught a keyframes version)
const shake = (f3, t, a) => [[0, a, 0.04], [a, -a * 0.7, 0.05], [-a * 0.7, 0, 0.06]].map(([y0, y1, d], i) => `tl.fromTo("#world", { y: ${y0} }, { y: ${y1}, duration: ${d}, ease: "none", immediateRender: false }, ${f3(t + [0, 0.04, 0.09][i])});`).join(" ");
export const look = {
  code: "REEL7",
  nameBn: "কাগজের টেবিল",
  colors: {
    bg: "#2B1D15", ink: "#F6EFE4", muted: "#D9C9B4", accent: "#FFB703", good: "#2A9D5C", warn: "#D2442F",
    tool: ["#E63946", "#2A7FFF", "#F4A100", "#2A9D5C", "#8E5BE8"],
    capOff: "rgba(246,239,228,0.45)", capOn: "#FFB703", capDone: "#FFFFFF",
  },
  layout: { inner: 697, mono: 86, nm: 52 },
  settleDy: 190, settleScale: 1.15, fxFrom: { x: 30 }, fxEase: "power3.out", fxIcon: 32, pfFrom: { scale: 1.7, rotation: -14 },
  sfx: { name: "page-turn", nameVol: 0.5, feature: "click-soft", featureVol: 0.32, proof: "impact-bass-1", proofVol: 0.42, warn: "error", stat: "ping", card: "page-turn", push: "whoosh-short" },
  plan: {
    world: "উপর থেকে দেখা কাঠের কাজের টেবিল (কাঠের দাগ, কফির কাপের দাগ, পেনসিল, পেপার-ক্লিপ); শেষ হওয়া কাগজগুলো টেবিলের ডান কিনারে স্তূপ হয়",
    drawn: "কাঠের টেবিল, কাগজ, ওয়াশি টেপ, রাবার স্ট্যাম্প, কলমের দাগ, পেনসিল, ক্লিপ",
    hook: (R) => `টেবিলে মাসিক সাবস্ক্রিপশনের বিল পিছলে আসে, মোট টাকা গুনে ওঠে, তারপর লাল স্ট্যাম্প "${R.hook.stamp ?? "বাতিল"}" ধপ করে পড়ে`,
    enter: (k) => `${["প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম"][k]} কাগজ ডান দিক থেকে ছায়াসহ পিছলে এসে সোজা বসে, উপরে রঙিন টেপ; নাম বড় হয়ে মাঝে, তারপর উপরে বসে`,
    feature: () => "ফিচারের লাইন আসে, নিচে কলমের দাগ টানা হয়",
    proof: () => "গোল রাবার স্ট্যাম্প কাগজে ধপ করে পড়ে",
  },
  validate(t) { return []; },

  css(ctx) {
    const S = `"Inter", "Hind Siliguri", sans-serif`, B = `"Hind Siliguri", "Inter", sans-serif`;
    return `
#world .desk { position: absolute; inset: 0; background:
  repeating-linear-gradient(97deg, rgba(0,0,0,0) 0 38px, rgba(0,0,0,0.10) 38px 41px, rgba(0,0,0,0) 41px 90px, rgba(255,220,180,0.04) 90px 93px),
  radial-gradient(ellipse 80% 55% at 50% 42%, #5A3D2A 0%, #3E2A1E 55%, #2B1D15 100%); }
#world .ring { position: absolute; left: 790px; top: 1480px; width: 210px; height: 210px; border-radius: 50%; border: 10px solid rgba(70,40,20,0.45); box-shadow: inset 0 0 0 4px rgba(120,80,40,0.18); }
#world .pencil { position: absolute; left: 40px; top: 1300px; width: 520px; height: 34px; transform: rotate(-8deg); }
#world .clip { position: absolute; left: 760px; top: 1360px; width: 120px; height: 46px; transform: rotate(14deg); }
#world .mini { position: absolute; width: 150px; height: 128px; background: #FBF7EF; border-radius: 4px; box-shadow: 0 6px 14px rgba(0,0,0,0.45); opacity: 0; }
#world .mini i { position: absolute; left: 18px; right: 18px; top: 0; height: 12px; display: block; }
#badge { background: rgba(251,247,239,0.12); border: 2px solid rgba(255,183,3,0.6); }
#badge .bt { color: #FFF4E0; }
/* hook: the bill */
#hk .bill { position: absolute; left: 150px; top: 40px; width: 520px; padding: 34px 38px 30px; box-sizing: border-box; background: #FBF7EF; border-radius: 6px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); transform: rotate(-3deg); }
#hk .bh { font: 800 36px/1.3 ${B}; color: ${INK}; padding-bottom: 14px; border-bottom: 3px dashed #C9BCA8; }
#hk .bl { display: flex; justify-content: space-between; gap: 20px; font: 700 30px/1.3 ${B}; color: ${INK2}; padding: 12px 0; border-bottom: 1px solid #E6DCCB; }
#hk .bl b { font: 800 30px/1.3 ${S}; color: ${INK}; }
#hk .bl, #hk .bt2 { opacity: 0; }
#hk .bt2 { display: flex; justify-content: space-between; font: 800 36px/1.3 ${B}; color: ${INK}; padding-top: 16px; }
#hk .bt2 b { font: 900 38px/1.3 "Baloo Da 2", ${B}; color: #D2442F; }
#hk .stamp { position: absolute; left: 330px; top: 300px; padding: 10px 34px; border: 8px solid #D2442F; border-radius: 16px; font: 800 76px/1.3 "Baloo Da 2", ${B}; color: #D2442F; transform: rotate(-12deg); opacity: 0; mix-blend-mode: multiply; }
/* the sheet */
.tool { left: ${SHEET.x}px !important; top: ${SHEET.y}px !important; width: ${SHEET.w}px; height: ${SHEET.h}px; right: auto !important; bottom: auto !important; box-sizing: border-box; padding: 46px 44px 30px 70px;
  background: repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 57px, rgba(80,120,200,0.16) 57px 59px), #FBF7EF; border-radius: 6px;
  box-shadow: 0 34px 70px rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; color: ${INK}; }
.tool::before { content: ""; position: absolute; left: 46px; top: 0; bottom: 0; width: 3px; background: rgba(214,70,60,0.45); }
.tool .tape { position: absolute; left: 50%; top: -18px; width: 190px; height: 40px; margin-left: -95px; background: var(--c); opacity: 0.85; transform: rotate(-2deg); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.tool .mono { width: 86px; height: 86px; border-radius: 18px; background: var(--c); color: ${INK}; font-size: 32px; transform: rotate(-4deg); box-shadow: 0 6px 12px rgba(0,0,0,0.25); }
.tool .nm { font-size: 52px; color: ${INK}; }
.tool .mk { color: ${INK2}; }
.tool .st { color: ${INK}; }
.tool .fxs { gap: 14px; }
.tool .fx { height: 64px; }
.tool .fx .fi { width: 50px; height: 50px; border-radius: 50%; border: 3px solid var(--c); box-sizing: border-box; }
.tool .fx .fl { font-size: 33px; color: ${INK}; }
.tool .fx .ul { position: absolute; left: 66px; bottom: 2px; width: 330px; height: 16px; overflow: visible; }
.tool .pf { margin-top: auto; align-self: flex-end; padding: 14px 30px; border-radius: 999px; border: 6px double #2A9D5C; color: #2A9D5C; font-size: 31px; transform: rotate(-6deg); background: rgba(42,157,92,0.06); }
.tool .pf svg { stroke: #2A9D5C; }
.tool .pf.warn { border-color: #D2442F; color: #D2442F; background: rgba(210,68,47,0.06); }
.tool .pf.warn svg { stroke: #D2442F; }
.tool .hwk { color: ${INK2}; }
.tool .hw .hn { color: ${INK}; }
.tool .hw .hl { color: ${INK}; }
.tool.pr .prk { color: ${INK2}; }
.tool.pr .prt { color: #D2442F; }
.tool.pr .prs { color: ${INK}; }
.tool.pr .prr { color: ${INK}; }
.tool.pr .prr .fi { background: rgba(255,183,3,0.22); }
.ec, .cs { background: #FBF7EF; border-width: 3px; box-shadow: 0 14px 30px rgba(0,0,0,0.45); }
.ec .enm, .cs .csl { color: ${INK}; }
.ec .emono { color: ${INK}; }
.tool .nm em { color: ${INK}; text-decoration: underline; text-decoration-color: var(--c); text-decoration-thickness: 6px; text-underline-offset: 8px; }
`;
  },

  world(ctx) {
    const { N, toolColor } = ctx;
    const minis = Array.from({ length: N }, (_, k) => `<div class="mini" id="mini${k}" style="left:${PILE.x - 75 + (k % 2 ? 8 : -6)}px;top:${PILE.y - 64 - k * 10}px;transform:rotate(${[-8, 5, -3, 9, -5][k]}deg)"><i style="background:${toolColor(k)}"></i></div>`).join("");
    const pencil = `<svg class="pencil" viewBox="0 0 520 34"><rect x="40" y="4" width="420" height="26" rx="3" fill="#F2B632"/><rect x="40" y="4" width="420" height="9" fill="#F7CB5A"/><rect x="460" y="4" width="40" height="26" rx="4" fill="#E9A0A0"/><rect x="448" y="4" width="14" height="26" fill="#B9BCC2"/><path d="M40 4 L0 17 L40 30 Z" fill="#E8CFA6"/><path d="M12 13 L0 17 L12 21 Z" fill="#3A3330"/></svg>`;
    const clip = `<svg class="clip" viewBox="0 0 120 46"><path d="M100 10 H22 a12 12 0 0 0 0 24 H96 a8 8 0 0 0 0 -16 H30" fill="none" stroke="#C9CDD4" stroke-width="5" stroke-linecap="round"/></svg>`;
    return `<div class="desk"></div><div class="ring"></div>${pencil}${clip}${minis}`;
  },

  fxExtra(k, i) { return `<svg class="ul" viewBox="0 0 330 16" data-layout-allow-overflow><path id="ul${k}_${i}" d="M2 10 C 70 3, 150 14, 230 6 S 310 9, 328 5" fill="none" style="stroke: var(--c)" stroke-width="4" stroke-linecap="round" stroke-dasharray="340" stroke-dashoffset="340"/></svg>`; },
  toolExtra() { return `<i class="tape"></i>`; },

  hook(ctx, H) {
    const { js, show, cue, row, R, f3, findIn, esc, count, bnd } = ctx;
    const bill = R.hook.bill ?? [{ label: "PDF অ্যাপ", price: "৳১,২০০" }, { label: "হোয়াইটবোর্ড", price: "৳৮০০" }, { label: "ইনভয়েস", price: "৳১,৫০০" }, { label: "ই-সাইন", price: "৳১,১০০" }];
    const total = R.hook.total ?? 4600;
    show("#hk", 0, {}, 0.01);
    ctx.pre(`gsap.set("#hk .bill", { x: 700, rotation: 8 });`);
    js(`tl.fromTo("#hk .bill", { x: 700, rotation: 8 }, { x: 0, rotation: -3, duration: 0.7, ease: "power3.out", immediateRender: false }, 0.05);`);
    cue(0.05, "page-turn", 0.5);
    bill.forEach((_, i) => { show(`#bl${i}`, 0.45 + i * 0.16, { x: -20 }, 0.3); cue(0.45 + i * 0.16, "click-soft", 0.22); });
    const tT = 0.5 + bill.length * 0.16;
    show("#hk .bt2", tT, {}, 0.25);
    count("#btot", tT, 0, total, 0.9, { pre: "৳" }); cue(tT, "typing", 0.2);
    const tS = Math.max(tT + 1.1, Math.min(H.t1 - 0.9, findIn(H.words, R.hook.on ?? "লাগে")?.start ?? tT + 1.4));
    js(`tl.fromTo("#hk .stamp", { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power4.in", immediateRender: false }, ${f3(tS - 0.16)});`);
    js(shake(f3, tS, 6));
    cue(tS - 0.02, "impact-bass-1", 0.55, 0.6); ctx.beats.push(tS);
    row(0, "কাঠের টেবিলে মাসিক সাবস্ক্রিপশনের বিল পিছলে আসে, লাইনগুলো একে একে", bill.map((b) => b.label).join(" · "));
    row(tT, "বিলের মোট টাকা গুনে ওঠে", `৳${bnd(total)}`);
    row(tS, `লাল রাবার স্ট্যাম্প "${R.hook.stamp ?? "বাতিল"}" ধপ করে পড়ে, টেবিল কেঁপে ওঠে`, R.hook.stamp ?? "বাতিল");
    return `<div class="hook" id="hk"><div class="bill"><div class="bh">${esc(R.hook.title ?? "মাসিক সাবস্ক্রিপশন")}</div>${bill.map((b, i) => `<div class="bl" id="bl${i}"><span>${esc(b.label)}</span><b>${esc(b.price)}</b></div>`).join("")}<div class="bt2"><span>মোট</span><b id="btot">৳০</b></div></div>
  <div class="stamp" data-layout-allow-overlap>${esc(R.hook.stamp ?? "বাতিল")}</div></div>`;
  },

  hookOut(ctx, t) {
    const { js, f3, cue } = ctx;
    js(`tl.to("#hk", { x: -900, rotation: -10, duration: 0.45, ease: "power3.in" }, ${f3(t - 0.45)});`);
    cue(t - 0.45, "page-turn", 0.4);
  },

  enter(ctx, tt) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    js(`tl.fromTo("#t${k}", { opacity: 1, x: 900, rotation: 7 }, { opacity: 1, x: 0, rotation: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, ${f3(tt.tCard - 0.05)});`);
    ctx.pre(`gsap.set("#t${k}", { x: 900 });`);
    cue(tt.tCard - 0.05, "page-turn", 0.45);
    ctx.beats.push(tt.tCard);
  },

  onFeature(ctx, tt, i, t) {
    ctx.js(`tl.to("#ul${tt.k}_${i}", { attr: { "stroke-dashoffset": 0 }, duration: 0.35, ease: "power2.out" }, ${ctx.f3(t + 0.15)});`);
  },

  onProof(ctx, tt, t) {
    ctx.js(shake(ctx.f3, t + 0.4, 4));
  },

  exit(ctx, tt, t) {
    const { js, f3, cue } = ctx;
    const k = tt.k;
    // tossed to the pile: the sheet flies right and shrinks, and its mini sheet appears on the pile
    js(`tl.to("#t${k}", { x: 760, y: 330, rotation: ${[-8, 5, -3, 9, -5][k]}, scale: 0.2, opacity: 0, duration: 0.4, ease: "power2.in" }, ${f3(t - 0.12)});`);
    js(`tl.fromTo("#mini${k}", { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, ${f3(t + 0.2)});`);
    cue(t - 0.12, "whoosh-short", 0.3);
  },

  cta(ctx, tC) {
    // after the last sheet has landed on the pile (its exit shows it at tC), so none is left over the end card
    ctx.js(`tl.to(".mini", { y: 40, opacity: 0, duration: 0.4, ease: "power2.in", stagger: 0.04 }, ${ctx.f3(tC + 0.45)});`);
  },
};
