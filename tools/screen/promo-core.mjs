// promo-core.mjs — the reusable page for a SaaS screen-recording commercial (first built for the Claude 5X ad,
// 2026-10-25). A project's build-page.mjs only describes its moments; this module writes the whole index.html:
//   - the cut recording (tools/screen/cut.mjs) under a 2D camera: zooms/pans as "views" (scale s, view top-left
//     l/tp in source pixels, so the frame edge never shows) — camera: [{ t, d, s, l, tp, e }]
//   - an optional 3D tilt card (tilt: [{ t, d, s, rx, ry, br, e }], end on s 1 / rx 0 / ry 0 / br 0)
//     ⚠ any CSS perspective makes HyperFrames capture the WHOLE render by screenshot (~6.5 frames/s here)
//   - a vignette over chosen stretches (vignette: [{ in, out }])
//   - a gold glow following the tracked cursor (glow: { track: <track-cursor.py json>, out?: <s> }).
//     WHOLE-VIDEO BY DEFAULT (CLAUDE.md §0h): out defaults to the click (boom.t). An earlier out (unless
//     glow.partial: true, i.e. he asked for one stretch) or a track that stops early is reported as a coverage gap.
//   - the click "boom": shockwave rings from a point, camera shake, white flash, cut to the end card
//     (boom: { t, at: [x, y] } in source pixels; the clip should hold its last frame ~0.5 s: cut.mjs --tail)
//   - a dark-gold end card: line 1 slams word by word, lifts; line 2 (rows) slams; a gold CTA button pulses
//
//   import { buildPromo } from "../../../tools/screen/promo-core.mjs";
//   writeFileSync("index.html", buildPromo(spec));
// Fonts: copy Anton-Regular.ttf and Inter-Variable.ttf to <project>/assets/fonts; GSAP to assets/js/gsap.
// Check rules learned the hard way: no duplicate "shadow" text layers (check: text_not_painted /
// content_overlap) — depth comes from .halo plates; ≤ ~10 radial-gradient elements in the whole page (40 made
// captures go black: lint composition_heavy_overlay_count_high) — particles are ONE element with many
// gradients; the end card is display:none until the boom; touching GSAP tweens on one property need a gap.

const f3 = (x) => Number(x).toFixed(3);

export function buildPromo(spec) {
  const { fps = 30, total, title, clip, camera = [], tilt = [], vignette = [], glow, boom, end, audio = "assets/media/mix.wav" } = spec;
  const js = [];
  const warnings = []; // whole-video coverage gaps, printed by the builder (§0h)
  const T0 = boom.t;

  // ── 2D camera on #cam ──
  const camXf = (k) => ({ x: -k.l * k.s, y: -k.tp * k.s, scale: k.s });
  let prev = { s: 1, l: 0, tp: 0 };
  for (const k of camera) {
    const a = camXf(prev), b = camXf(k);
    js.push(`  tl.fromTo("#cam", { x: ${f3(a.x)}, y: ${f3(a.y)}, scale: ${a.scale} }, { x: ${f3(b.x)}, y: ${f3(b.y)}, scale: ${b.scale}, duration: ${f3(k.d)}, ease: "${k.e}", immediateRender: false }, ${f3(k.t)});`);
    prev = k;
  }

  // ── 3D tilt card on #tilt ──
  const SH0 = "0px 0px 0px 0px rgba(214,170,80,0), 0px 0px 0px 0px rgba(0,0,0,0)";
  const SH1 = "0px 0px 0px 2px rgba(214,170,80,0.45), 0px 40px 110px 0px rgba(0,0,0,0.7)";
  let tp = { s: 1, rx: 0, ry: 0, br: 0, sh: SH0 };
  for (const k0 of tilt) {
    const k = { ...k0, sh: k0.s === 1 && !k0.rx && !k0.ry ? SH0 : SH1 };
    js.push(`  tl.fromTo("#tilt", { scale: ${tp.s}, rotationX: ${tp.rx}, rotationY: ${tp.ry}, borderRadius: ${tp.br}, boxShadow: "${tp.sh}" }, { scale: ${k.s}, rotationX: ${k.rx}, rotationY: ${k.ry}, borderRadius: ${k.br}, boxShadow: "${k.sh}", duration: ${f3(k.d)}, ease: "${k.e}", immediateRender: false }, ${f3(k.t)});`);
    tp = k;
  }

  // ── vignette ──
  for (const v of vignette) {
    js.push(`  tl.fromTo("#vig", { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "sine.inOut", immediateRender: false }, ${v.in});`);
    js.push(`  tl.to("#vig", { opacity: 0, duration: 0.8, ease: "sine.inOut" }, ${v.out});`);
  }

  // ── cursor glow: tracked tip → halo on the arrow's body; misses ≤ 10 frames are bridged, longer ones fade ──
  if (glow) {
    const track = glow.track, [ox, oy] = glow.offset ?? [8, 12];
    const glowOut = glow.out ?? T0 - 0.1;
    const covered = track.length ? track.at(-1).t : 0;
    if (glowOut < T0 - 1 && !glow.partial) warnings.push(`glow: ends at ${glowOut.toFixed(1)} s, the clip runs to ${T0.toFixed(1)} s. A cursor highlight belongs on the whole video; set glow.partial: true only if he asked for one stretch.`);
    if (covered < glowOut - 1) warnings.push(`glow: the cursor track ends at ${covered.toFixed(1)} s but the video runs to ${glowOut.toFixed(1)} s. Track the whole clip (track-cursor.py <clip> 0 <clip length>), or pass glow.out to end it on purpose.`);
    const ok = track.map((f) => f.s >= 0.85);
    // hysteresis: a weaker match (≥ 0.72) chained to a confirmed one and moving < 60 px a frame is the cursor too
    // (the white arrow on the orange send button scores 0.76–0.84; without this the hover glow came 0.9 s late)
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < track.length; i++) {
      if (ok[i] || track[i].s < 0.72) continue;
      const near = (j) => j >= 0 && j < track.length && ok[j] && Math.hypot(track[j].x - track[i].x, track[j].y - track[i].y) < 60;
      if (near(i - 1) || near(i + 1)) ok[i] = true;
    }
    for (let i = track.length - 2; i >= 0; i--) if (!ok[i] && track[i].s >= 0.72 && ok[i + 1] && Math.hypot(track[i + 1].x - track[i].x, track[i + 1].y - track[i].y) < 60) ok[i] = true;
    const pos = track.map((f) => ({ x: f.x + ox, y: f.y + oy }));
    const vis = ok.slice();
    for (let i = 0; i < track.length; ) {
      if (ok[i]) { i++; continue; }
      let j = i; while (j < track.length && !ok[j]) j++;
      if (i > 0 && j < track.length && j - i <= 10) {
        for (let k = i; k < j; k++) {
          const u = (k - i + 1) / (j - i + 1);
          pos[k] = { x: pos[i - 1].x + (pos[j].x - pos[i - 1].x) * u, y: pos[i - 1].y + (pos[j].y - pos[i - 1].y) * u };
          vis[k] = true;
        }
      } else for (let k = i; k < j; k++) pos[k] = i > 0 ? pos[i - 1] : pos[j] ?? pos[0];
      i = j;
    }
    const sm = pos.map((p, i) => { // 3-frame smoothing inside visible runs
      const nb = [i - 1, i, i + 1].filter((k) => k >= 0 && k < pos.length && vis[k] === vis[i]);
      return { x: nb.reduce((a, k) => a + pos[k].x, 0) / nb.length, y: nb.reduce((a, k) => a + pos[k].y, 0) / nb.length };
    });
    let last = null, shown = null;
    track.forEach((f, i) => {
      const t = Math.max(0, f.t - 0.001);
      const p = sm[i];
      if (!last || Math.abs(p.x - last.x) > 0.4 || Math.abs(p.y - last.y) > 0.4) {
        js.push(`  tl.set("#glow", { x: ${p.x.toFixed(1)}, y: ${p.y.toFixed(1)} }, ${f3(t)});`);
        last = p;
      }
      if (vis[i] !== shown) {
        js.push(`  tl.to("#glow", { opacity: ${vis[i] ? 1 : 0}, duration: 0.15, ease: "sine.inOut" }, ${f3(t)});`);
        shown = vis[i];
      }
    });
    js.push(`  tl.to("#glow", { opacity: 0, duration: 0.3, ease: "sine.in" }, ${f3(glowOut)});`);
  }

  // ── the click: shockwave, shake, white flash, cut to the end card ──
  js.push(`  tl.fromTo("#ring1", { scale: 0.1, opacity: 1 }, { scale: 5.2, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false }, ${f3(T0)});`);
  js.push(`  tl.fromTo("#ring2", { scale: 0.1, opacity: 0.9 }, { scale: 3.0, opacity: 0, duration: 0.38, ease: "power3.out", immediateRender: false }, ${f3(T0 + 0.033)});`);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < 12; i++) {
    const a = 26 * Math.pow(0.78, i);
    js.push(`  tl.to("#shake", { x: ${(rnd() * a).toFixed(1)}, y: ${(rnd() * a).toFixed(1)}, duration: ${f3(1 / fps)}, ease: "none" }, ${f3(T0 + i / fps)});`);
  }
  js.push(`  tl.to("#shake", { x: 0, y: 0, duration: 0.05, ease: "none" }, ${f3(T0 + 12 / fps)});`);
  js.push(`  tl.set("#flash", { opacity: 0.3 }, ${f3(T0)});`);
  js.push(`  tl.to("#flash", { opacity: 1, duration: 0.1, ease: "power2.in" }, ${f3(T0)});`);
  js.push(`  tl.set("#end", { opacity: 1 }, ${f3(T0 + 0.15)});`);
  js.push(`  tl.to("#flash", { opacity: 0, duration: 0.55, ease: "power2.out" }, ${f3(T0 + 0.25)});`);

  // ── end card ──
  const word = (id, w) => `<span class="w" id="${id}"><span class="metal" data-layout-allow-overlap>${w}</span></span>`;
  const l1 = end.line1.words.map((w, i) => word(`a${i}`, w)).join(" ");
  const flat2 = end.line2.rows.flat();
  let k2 = 0;
  const rows2 = end.line2.rows.map((row, r) => `<div id="l2${"ab"[r] ?? r}">${row.map((w) => word(`b${k2++}`, w)).join(" ")}</div>`).join("");
  const slam = (sel, t, from = 2.6) => {
    js.push(`  tl.fromTo("${sel}", { scale: ${from}, opacity: 0, y: -24 }, { scale: 1, opacity: 1, y: 0, duration: 0.2, ease: "power4.in", immediateRender: false }, ${f3(t - 0.2)});`);
    // the landing jolts the whole card
    [[10, -6], [-7, 4], [4, -2], [0, 0]].forEach(([x, y], i) => js.push(`  tl.to("#endin", { x: ${x}, y: ${y}, duration: ${f3(1 / fps - 0.003)}, ease: "none" }, ${f3(t + i / fps)});`));
  };
  end.line1.words.forEach((_, i) => slam(`#a${i}`, end.line1.slams[i]));
  js.push(`  tl.fromTo("#l1", { y: 0, scale: 1 }, { y: ${end.lift.y}, scale: ${end.lift.scale}, duration: 0.55, ease: "power3.inOut", immediateRender: false }, ${f3(end.lift.t)});`);
  flat2.forEach((w, i) => slam(`#b${i}`, end.line2.slams[i], w.length > 10 ? 2.2 : 2.6));
  for (const [sel, t, d = 0.9] of end.sheens ?? [])
    js.push(`  tl.fromTo("${sel} .metal", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: ${d}, ease: "sine.inOut", immediateRender: false }, ${f3(t)});`);
  const cta = end.cta;
  js.push(`  tl.fromTo("#cta .rule", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, ${f3(cta.t)});`);
  js.push(`  tl.fromTo("#btn", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2.2)", immediateRender: false }, ${f3(cta.t)});`);
  for (const t of cta.pulses ?? []) {
    js.push(`  tl.to("#btn", { scale: 1.045, boxShadow: "0px 0px 0px 3px rgba(255,236,190,0.75), 0px 14px 40px 0px rgba(0,0,0,0.55), 0px 0px 70px 10px rgba(240,180,70,0.6)", duration: 0.42, ease: "sine.out" }, ${f3(t)});`);
    js.push(`  tl.to("#btn", { scale: 1, boxShadow: "0px 0px 0px 2px rgba(255,236,190,0.5), 0px 14px 40px 0px rgba(0,0,0,0.55), 0px 0px 40px 0px rgba(230,170,70,0.35)", duration: 0.47, ease: "sine.in" }, ${f3(t + 0.43)});`);
  }
  if (cta.sheen) js.push(`  tl.fromTo("#btn .metal-sheen", { backgroundPosition: "160% 0%" }, { backgroundPosition: "-60% 0%", duration: 0.9, ease: "sine.inOut", immediateRender: false }, ${cta.sheen});`);
  // slow settle of the whole card (lands on 1), turning light rays, rising gold dust
  js.push(`  tl.fromTo("#endin", { scale: 1.045 }, { scale: 1, duration: ${f3(total - T0)}, ease: "sine.out", immediateRender: false }, ${f3(T0)});`);
  js.push(`  tl.fromTo("#rays", { rotation: 0 }, { rotation: 14, duration: ${f3(total - T0)}, ease: "none", immediateRender: false }, ${f3(T0)});`);
  let dust = "";
  seed = 11;
  for (const [id, n, rise] of [["dust1", 18, 90], ["dust2", 16, 150]]) {
    const dots = [];
    for (let i = 0; i < n; i++) {
      const x = Math.round(960 + rnd() * 940), y = Math.round(600 + rnd() * 520), r = (3 + 2.5 * rnd()).toFixed(1);
      dots.push(`radial-gradient(circle at ${x}px ${y}px, rgba(255,236,180,0.95) 0px, rgba(240,190,90,0.45) ${r}px, rgba(240,190,90,0) ${(r * 2.4).toFixed(1)}px)`);
    }
    dust += `<i class="dust" id="${id}" style="background-image:${dots.join(",")}"></i>`;
    js.push(`  tl.fromTo("#${id}", { y: 0, opacity: 0 }, { y: -${rise}, opacity: 0.8, duration: ${f3(total - T0)}, ease: "none", immediateRender: false }, ${f3(T0)});`);
  }
  js.push(`  tl.set("#end", { display: "block" }, ${f3(T0 + 0.1)});`);

  const [bx, by] = boom.at;
  const css = `
@font-face { font-family: "Anton"; font-weight: 400; src: url("assets/fonts/Anton-Regular.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }
body { margin: 0; background: #050403; }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #050403; font-family: "Inter", sans-serif; }
#bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 65% at 50% 46%, #3a2a10 0%, #160f07 52%, #050403 100%); }
#shake { position: absolute; inset: 0;${tilt.length ? " perspective: 2200px;" : ""} }
#tilt { position: absolute; inset: 0; overflow: hidden; transform-origin: 50% 50%; }
#cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
#cam video { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
#glow { position: absolute; left: 0; top: 0; width: 132px; height: 132px; margin: -66px 0 0 -66px; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, rgba(255,205,110,0) 0%, rgba(255,205,110,0.10) 12%, rgba(255,196,96,0.38) 24%, rgba(255,170,60,0.16) 44%, rgba(255,150,40,0) 70%); }
#glow::after { content: ""; position: absolute; inset: 40px; border-radius: 50%; border: 2px solid rgba(255,222,150,0.55); box-shadow: 0 0 14px rgba(255,190,80,0.65), inset 0 0 10px rgba(255,190,80,0.35); }
.ring { position: absolute; left: ${bx}px; top: ${by}px; width: 200px; height: 200px; margin: -100px 0 0 -100px; border-radius: 50%; opacity: 0; box-sizing: border-box; }
#ring1 { border: 4px solid rgba(255,240,205,0.95); box-shadow: 0 0 46px rgba(255,200,110,0.95), inset 0 0 36px rgba(255,200,110,0.7); }
#ring2 { border: 10px solid rgba(255,255,255,0.9); box-shadow: 0 0 60px rgba(255,255,255,0.9); }
#vig { position: absolute; inset: 0; opacity: 0; background: radial-gradient(ellipse 75% 72% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.8) 100%); }
#flash { position: absolute; inset: 0; background: #ffffff; opacity: 0; }
#end { position: absolute; inset: 0; display: none; opacity: 0; overflow: hidden; background: #050403; }
#endin { position: absolute; inset: 0; transform-origin: 50% 50%; }
#endbg { position: absolute; inset: -60px; background: radial-gradient(ellipse 62% 56% at 50% 44%, #42300f 0%, #1c140a 42%, #080605 76%, #030302 100%); }
#rays { position: absolute; left: 960px; top: 480px; width: 2800px; height: 2800px; margin: -1400px 0 0 -1400px; border-radius: 50%;
  background: repeating-conic-gradient(from 0deg, rgba(255,214,130,0.06) 0deg 3deg, rgba(0,0,0,0) 3deg 14deg); }
#shade { position: absolute; inset: -60px; background: radial-gradient(ellipse 55% 52% at 50% 46%, rgba(5,4,3,0) 30%, rgba(5,4,3,0.7) 72%, rgba(5,4,3,0.96) 100%); }
#frame { position: absolute; left: 48px; top: 48px; right: 48px; bottom: 48px; border: 2px solid rgba(214,175,95,0.34); }
#frame i { position: absolute; width: 46px; height: 46px; border-color: rgba(246,214,138,0.85); border-style: solid; border-width: 0; }
#frame i:nth-child(1) { left: -6px; top: -6px; border-left-width: 4px; border-top-width: 4px; }
#frame i:nth-child(2) { right: -6px; top: -6px; border-right-width: 4px; border-top-width: 4px; }
#frame i:nth-child(3) { left: -6px; bottom: -6px; border-left-width: 4px; border-bottom-width: 4px; }
#frame i:nth-child(4) { right: -6px; bottom: -6px; border-right-width: 4px; border-bottom-width: 4px; }
.dust { position: absolute; left: 0; top: 0; width: 1920px; height: 1200px; opacity: 0; }
.line { position: absolute; left: 0; width: 1920px; text-align: center; white-space: nowrap; transform-origin: 50% 50%; }
#l1 { top: 400px; font-size: ${end.line1.size ?? 140}px; line-height: 1.12; }
#l2 { top: 390px; }
#l2 > div { position: relative; font-size: ${end.line2.size ?? 154}px; line-height: 1.08; text-align: center; }
.w { position: relative; display: inline-block; font-family: "Anton", sans-serif; font-weight: 400; letter-spacing: 0.012em; margin: 0 0.03em; opacity: 0; transform-origin: 50% 60%; }
.halo { position: absolute; left: 50%; border-radius: 50%; transform: translateX(-50%); background: radial-gradient(ellipse closest-side, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%); }
#h1 { top: -40px; width: 1700px; height: 260px; }
#h2 { top: -30px; width: 1500px; height: 400px; }
.w .metal { position: relative; color: #E9C46A; -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(100deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 58%),
    linear-gradient(180deg, #FFF5D6 0%, #F7DA8E 17%, #DDAD4F 36%, #8E601C 51%, #C59234 60%, #F2D07C 77%, #FFF2C6 89%, #B5852F 100%);
  background-size: 260% 100%, 100% 100%; background-position: 160% 0%, 0% 0%; background-repeat: no-repeat; }
#cta { position: absolute; left: 0; top: 806px; width: 1920px; height: 110px; display: flex; align-items: center; justify-content: center; gap: 40px; }
#cta .rule { width: 230px; height: 3px; transform-origin: 50% 50%; opacity: 0; }
#cta .rule.l { background: linear-gradient(90deg, rgba(232,190,100,0), rgba(246,214,138,0.95)); }
#cta .rule.r { background: linear-gradient(90deg, rgba(246,214,138,0.95), rgba(232,190,100,0)); }
#btn { position: relative; overflow: hidden; border-radius: 999px; padding: 24px 62px 22px; opacity: 0;
  background: linear-gradient(180deg, #FCE6A6 0%, #E7BA5E 52%, #B8842C 100%);
  box-shadow: 0px 0px 0px 2px rgba(255,236,190,0.5), 0px 14px 40px 0px rgba(0,0,0,0.55), 0px 0px 40px 0px rgba(230,170,70,0.35); }
#btn span { position: relative; font-family: "Inter", sans-serif; font-weight: 800; font-size: 44px; letter-spacing: 0.035em; color: #1A1205; }
#btn .metal-sheen { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 60%);
  background-size: 260% 100%; background-position: 160% 0%; background-repeat: no-repeat; }
`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${title}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${f3(total)}">
      <div id="bg"></div>
      <div id="shake">
        <div id="tilt">
          <div id="cam">
            <video id="camvid" src="${clip.src}" muted playsinline data-start="0" data-duration="${f3(clip.dur)}" data-track-index="0"></video>
            <div id="glow"></div>
            <div class="ring" id="ring1"></div>
            <div class="ring" id="ring2"></div>
          </div>
        </div>
      </div>
      <div id="vig"></div>
      <div id="end">
        <div id="endin">
          <div id="endbg"></div>
          <div id="rays" data-layout-allow-overflow></div>
          <div id="shade"></div>
          ${dust}
          <div id="frame"><i></i><i></i><i></i><i></i></div>
          <div class="line" id="l1"><i class="halo" id="h1"></i>${l1}</div>
          <div class="line" id="l2"><i class="halo" id="h2"></i>${rows2}</div>
          <div id="cta"><i class="rule l"></i><div id="btn"><i class="metal-sheen"></i><span>${cta.text}</span></div><i class="rule r"></i></div>
        </div>
      </div>
      <div id="flash"></div>
      <audio id="mix" src="${audio}" data-start="0" data-duration="${f3(total)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      gsap.set("#cam", { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      gsap.set("#tilt", { scale: 1, rotationX: 0, rotationY: 0, transformOrigin: "50% 50%" });
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  // a whole-video effect that stops early is a broken video, not a style choice: stop the build (§0h)
  if (warnings.length) throw new Error(`promo-core: whole-video coverage gap\n  ${warnings.join("\n  ")}`);
  return html;
}
