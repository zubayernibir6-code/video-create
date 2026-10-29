// page.mjs — a screen tutorial's page from DATA: writes index.html + build/cues.json (the sound effects mix.mjs places).
//   node tools/tutorial/page.mjs projects/<name>
// Inputs (all in projects/<name>/build/):
//   tutorial.json  the timing (timeline.mjs)          specs.json  camera views, anchors, clicks, drags, blurs, freezes
//   cursor.json    tracked cursor tip, source time    page.json   title, cards, labels, panels, callouts, sounds
// Layout (fixed here): a cyber-grid canvas; intro and outro = his facecam in a glass portrait frame + cards on the
// right; the screen part plays inside a floating monitor (1712×963 viewport, K = 0.8917) under a 2D camera, with a
// cursor glow, click rings, drag ghosts, a speed chip + waveform on every ramp ≥ 1.2 s.
// page.json times are seconds on the final video or expressions: S(source s), V(voice s), SA / SE (screen part
// start / end), TOTAL, min(…), max(…), + − * /, e.g. "S(136.0)-0.15". Text fields are HTML (&amp; for &, <b> = gold).
// Card kinds (intro.cards / outro.cards, shown in order, each hidden at `out`, default: the next card's in − 0.35):
//   alert  icon box + lines [[class, html, style?]] (kick/main), tone red|yellow|green, icon_in spin|pop, meter.drain
//   flow   3+ nodes joined by arrows; nodes[i].t (the first defaults to in + 0.1); the last node is gold
//   hero   gold card: icon + metal title that slams in at `slam`, meter fills, l2 line at l2_at, optional count-up
//   tiles  a row of tiles (tiles[i].t) + an optional pulsing pill below (pill.in); both leave at `out`
//   offer  gold card: label + metal title, lines below at l2_at
// Screen part (screen.*): sounds [[t, file, vol, dur?]] · lists (numbered panel at an anchor, page px) · labels
// (cam-space: tag | box | ticks; source px at specs.anchors + dx/dy) · banners (bottom pill) · callouts (top pill).
// Kept capture-fast on purpose (docs §4i): no CSS filter / perspective / clip-path animation (each forces screenshot
// capture); depth comes from shadows and gradients; per-frame motion (cursor glow, trails, waveform, count-up) runs
// in ONE onUpdate tween that reads data arrays, instead of thousands of tweens.
// Verified 2026-10-29 on projects/claude-video-tutorial: index.html and cues.json are byte-identical to the ones its
// hand-written build/build-page.mjs wrote (204 cues, 127 clicks, 21 camera views).
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cli } from "./timeline.mjs";

const K = 1712 / 1920, MX = 104, MY = 38; // monitor viewport: source px → page px = M + px × K (camera at 1×)
const NWAVE = 44;
const f3 = (x) => Number(x).toFixed(3);
const bn = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

// ── icons (Lucide paths, stroke) ──
const ICON = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  rocket: '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  chat: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  zap: '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  clapper: '<path d="m12.296 3.464 3.02 3.956"/><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m6.18 5.276 3.1 3.899"/>',
  ccheck: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bomb: '<circle cx="11" cy="13" r="9"/><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/><path d="m22 2-1.5 1.5"/>',
  ff: '<path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z"/><path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
};
const icon = (name, size, color, sw = 2.2) => {
  if (!ICON[name]) throw new Error(`icon '${name}' unknown; have: ${Object.keys(ICON).join(", ")}`);
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
};
const line = ([cls, html, style]) => `<div${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${html}</div>`;

// ── fixed CSS ──
const CSS_HEAD = [
  `@font-face { font-family: "Inter"; font-weight: 100 900; src: url("assets/fonts/Inter-Variable.ttf") format("truetype"); font-display: block; }`,
  `@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }`,
  `@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }`,
  `body { margin: 0; background: #07090E; }`,
  `#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #07090E; font-family: "Inter", "Hind Siliguri", sans-serif; color: #EAF2FF; }`,
  `#bg { position: absolute; inset: 0; background: linear-gradient(160deg, #07090E 0%, #0B0F18 45%, #111622 100%); }`,
  `#grid { position: absolute; left: -40px; top: -40px; width: 2000px; height: 1300px;`,
  `  background-image: linear-gradient(rgba(90,200,255,0.07) 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, rgba(90,200,255,0.07) 1px, rgba(0,0,0,0) 1px);`,
  `  background-size: 96px 96px; }`,
  `#vgn { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 75% at 50% 45%, rgba(7,9,14,0) 40%, rgba(7,9,14,0.85) 100%); }`,
  `.dust { position: absolute; left: 0; top: 0; width: 1920px; height: 1500px; opacity: 0.7; }`,
  `.ic { display: block; }`,
  `/* glass portrait frame */`,
  `.face { position: absolute; left: 170px; top: 60px; width: 540px; height: 960px; border-radius: 30px; overflow: hidden; visibility: hidden; opacity: 0;`,
  `  box-shadow: 0px 0px 0px 2px rgba(150,230,255,0.55), 0px 0px 0px 6px rgba(255,214,140,0.10), 0px 0px 60px 6px rgba(60,200,255,0.22), 0px 40px 90px 0px rgba(0,0,0,0.7); }`,
  `.face .vid { position: absolute; inset: 0; transform-origin: 50% 40%; }`,
  `.face video { position: absolute; left: 0; top: 0; width: 540px; height: 960px; object-fit: cover; }`,
  `.face .gl { position: absolute; inset: 0; border-radius: 30px; background: linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0) 55%, rgba(120,220,255,0.06) 100%); }`,
  `.face .streak { position: absolute; left: 0; top: -200px; width: 160px; height: 1400px; transform: rotate(18deg); background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%); }`,
  `#faceB { display: none; }`,
  `/* cards (intro / outro), right column */`,
  `.card { position: absolute; left: 800px; width: 980px; box-sizing: border-box; padding: 46px 54px; border-radius: 28px; visibility: hidden; opacity: 0;`,
  `  background: linear-gradient(160deg, rgba(24,31,46,0.94) 0%, rgba(11,14,23,0.95) 100%); }`,
  `.card .row { display: flex; align-items: center; gap: 34px; }`,
  `.icbox { flex: none; width: 112px; height: 112px; border-radius: 26px; display: flex; align-items: center; justify-content: center; }`,
  `.kick { font-size: 34px; font-weight: 600; color: #A9B8D3; line-height: 1.25; text-wrap: balance; }`,
  `.main { font-size: 62px; font-weight: 800; line-height: 1.1; color: #FFFFFF; margin-top: 6px; text-wrap: balance; }`,
  `.meter { position: relative; margin-top: 34px; height: 20px; border-radius: 10px; background: rgba(255,255,255,0.08); overflow: hidden; }`,
  `.meter .fill { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; border-radius: 10px; transform-origin: 0 50%; }`,
];
const CSS_MONITOR = [
  `/* the monitor */`,
  `#stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 50% 50%; visibility: hidden; opacity: 0; }`,
  `#floor { position: absolute; left: 260px; top: 990px; width: 1400px; height: 120px; border-radius: 50%; background: radial-gradient(ellipse closest-side, rgba(70,200,255,0.20) 0%, rgba(70,200,255,0) 100%); }`,
  `#mon { position: absolute; left: 92px; top: 26px; width: 1736px; height: 987px; border-radius: 24px; background: linear-gradient(180deg, #1B2333 0%, #0C111B 100%);`,
  `  box-shadow: 0px 0px 0px 1px rgba(150,230,255,0.45), 0px 0px 44px 2px rgba(60,200,255,0.25), 0px 0px 110px 10px rgba(230,180,80,0.10), 0px 36px 90px 0px rgba(0,0,0,0.7); }`,
  `#scr { position: absolute; left: 12px; top: 12px; width: 1712px; height: 963px; border-radius: 14px; overflow: hidden; background: #000000; }`,
  `#camk { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; transform: scale(${K}); }`,
  `#cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }`,
  `#cam video, #cam img.poster { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }`,
  `#posterEnd { visibility: hidden; opacity: 0; }`,
  `#scr .gl { position: absolute; inset: 0; border-radius: 14px; background: linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 30%); }`,
  `#glow { position: absolute; left: 0; top: 0; width: 140px; height: 140px; margin: -70px 0 0 -70px; border-radius: 50%; opacity: 0;`,
  `  background: radial-gradient(circle, rgba(110,230,255,0) 0%, rgba(110,230,255,0.10) 14%, rgba(255,205,110,0.30) 26%, rgba(110,230,255,0.12) 46%, rgba(110,230,255,0) 70%); }`,
  `#glow::after { content: ""; position: absolute; left: 53px; top: 53px; width: 34px; height: 34px; box-sizing: border-box; border-radius: 50%; border: 3px solid rgba(130,235,255,0.95);`,
  `  box-shadow: 0px 0px 12px 2px rgba(255,200,90,0.75), inset 0px 0px 8px 1px rgba(255,200,90,0.45); }`,
  `.ghost { position: absolute; left: 0; top: 0; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; opacity: 0; background: rgba(140,235,255,0.55); box-shadow: 0px 0px 16px 4px rgba(255,205,110,0.5); }`,
  `.ring { position: absolute; left: 0; top: 0; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; box-sizing: border-box; visibility: hidden; opacity: 0;`,
  `  border: 4px solid rgba(150,240,255,0.95); box-shadow: 0px 0px 30px 4px rgba(255,200,90,0.7), inset 0px 0px 22px 2px rgba(255,200,90,0.45); }`,
  `/* cam-space labels (source px; x,y = their centre-bottom point) */`,
  `.tag { position: absolute; left: 0; top: 0; visibility: hidden; opacity: 0; white-space: nowrap; transform-origin: 0 0; }`,
  `.tag .in { position: relative; left: 0; transform: translate(-50%, -100%); display: flex; align-items: center; gap: 14px; padding: 12px 26px; border-radius: 999px;`,
  `  font-size: 34px; font-weight: 800; color: #FFFFFF; background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.9), 0px 0px 28px 2px rgba(60,200,255,0.35), 0px 12px 30px 0px rgba(0,0,0,0.6); }`,
  `.tag.gold .in { color: #FFF3D6; box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 40px 4px rgba(240,180,70,0.45), 0px 12px 30px 0px rgba(0,0,0,0.6); }`,
  `.tag.green .in { box-shadow: 0px 0px 0px 2px rgba(80,230,150,0.95), 0px 0px 28px 2px rgba(60,220,140,0.35), 0px 12px 30px 0px rgba(0,0,0,0.6); }`,
  `.tag.bn .in { font-family: "Hind Siliguri", "Inter", sans-serif; font-weight: 700; letter-spacing: 0; }`,
  `.tag.box .in { transform: translate(-50%, -50%); padding: 0; border-radius: 16px; background: rgba(0,0,0,0); }`,
  `.tick { position: absolute; left: 0; top: 0; visibility: hidden; opacity: 0; transform-origin: 0 0; }`,
  `.tick .in { transform: translate(-50%, -50%); width: 46px; height: 46px; border-radius: 23px; background: #1FC77A; display: flex; align-items: center; justify-content: center;`,
  `  box-shadow: 0px 0px 0px 3px rgba(10,30,20,0.9), 0px 0px 22px 4px rgba(60,230,150,0.6); }`,
  `.tick.sm .in { width: 26px; height: 26px; border-radius: 13px; box-shadow: 0px 0px 0px 2px rgba(10,30,20,0.9), 0px 0px 14px 3px rgba(60,230,150,0.6); } /* on Claude's 18 px task circles, 42 px apart */`,
  `/* page-space overlays */`,
];
const CSS_CHIP_WAVE = [
  `#chip { position: absolute; left: 1590px; top: 66px; visibility: hidden; opacity: 0; display: flex; align-items: center; gap: 12px; padding: 10px 24px 10px 18px; border-radius: 999px;`,
  `  background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(255,210,120,0.95), 0px 0px 30px 4px rgba(240,180,70,0.4); }`,
  `#chipv { font-size: 38px; font-weight: 900; color: #FFE2A0; }`,
  `#wave { position: absolute; left: 660px; top: 880px; width: 600px; height: 90px; visibility: hidden; opacity: 0; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 26px; box-sizing: border-box;`,
  `  border-radius: 45px; background: rgba(8,12,20,0.88); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.7), 0px 0px 30px 2px rgba(60,200,255,0.3); }`,
  `#wave i { display: block; width: 7px; height: 56px; border-radius: 4px; background: linear-gradient(180deg, #8CEBFF 0%, #F7D27A 100%); transform-origin: 50% 50%; }`,
];
const CSS_CALL = [
  `.call { position: absolute; top: 60px; left: 0; width: 1920px; display: flex; justify-content: center; visibility: hidden; opacity: 0; }`,
  `.call .in { display: flex; align-items: center; gap: 18px; padding: 16px 34px; border-radius: 999px; background: rgba(8,12,20,0.95);`,
  `  box-shadow: 0px 0px 0px 2px rgba(120,235,255,0.9), 0px 0px 40px 4px rgba(60,210,255,0.35), 0px 16px 40px 0px rgba(0,0,0,0.6); }`,
  `.call span { font-size: 42px; font-weight: 800; color: #FFFFFF; }`,
];
const CSS_METAL = [
  `.metal { color: #E9C46A; -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;`,
  `  background-image: linear-gradient(100deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 58%),`,
  `    linear-gradient(180deg, #FFF5D6 0%, #F7DA8E 20%, #DDAD4F 42%, #A9762A 55%, #E2B456 70%, #FFF2C6 90%);`,
  `  background-size: 260% 100%, 100% 100%; background-position: 160% 0%, 0% 0%; background-repeat: no-repeat; }`,
];
// alert-card tones: ring + glow of the card, icon box fill + inset, meter fill
const TONE = {
  red: { ring: "rgba(255,90,105,0.8)", glow: "rgba(255,77,94,0.25)", bg: "rgba(255,77,94,0.16)", inset: "rgba(255,90,105,0.7)", fill: "#FF5A69" },
  yellow: { ring: "rgba(255,200,61,0.85)", glow: "rgba(255,200,61,0.2)", bg: "rgba(255,200,61,0.14)", inset: "rgba(255,200,61,0.7)", fill: "#FFC83D" },
  green: { ring: "rgba(80,230,150,0.85)", glow: "rgba(60,220,140,0.22)", bg: "rgba(60,220,140,0.14)", inset: "rgba(80,230,150,0.7)", fill: "#5BE39B" },
};

// ── card kinds: css(c) → lines, html(c) → markup (6-space indent), preset(c) → js at 0, play(c, X) → tweens/cues ──
const KINDS = {
  alert: {
    css: (c) => {
      const t = TONE[c.tone];
      if (!t) throw new Error(`card ${c.id}: tone '${c.tone}' unknown; have: ${Object.keys(TONE).join(", ")}`);
      return [`#${c.id} { top: ${c.top}px; box-shadow: 0px 0px 0px 2px ${t.ring}, 0px 0px 50px 2px ${t.glow}, 0px 30px 70px 0px rgba(0,0,0,0.6); }`,
        `#${c.id} .icbox { background: ${t.bg}; box-shadow: inset 0px 0px 0px 2px ${t.inset}; }`,
        ...(c.meter ? [`#${c.id} .fill { background: ${t.fill}; }`] : [])];
    },
    html: (c) => `      <div class="card" id="${c.id}"><div class="row"><div class="icbox">${icon(...c.icon)}</div><div>${c.lines.map(line).join("")}</div></div>${c.meter ? `<div class="meter"><i class="fill"></i></div>` : ""}</div>`,
    preset: (c) => c.icon_in === "spin" ? [`  tl.set("#${c.id} .icbox", { scale: 0.4, rotation: -30 }, 0);`] : c.icon_in === "pop" ? [`  tl.set("#${c.id} .icbox", { scale: 0.3 }, 0);`] : [],
    play: (c, X) => {
      const tin = X.ev(c.in, `${c.id}.in`);
      X.show(`#${c.id}`, tin, { x: 80 }, 0.5, "power3.out");
      if (c.sound) X.cue(tin, ...c.sound);
      if (c.icon_in === "spin") X.js.push(`  tl.fromTo("#${c.id} .icbox", { scale: 0.4, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.4)", immediateRender: false }, ${f3(tin + 0.15)});`);
      if (c.icon_in === "pop") X.js.push(`  tl.fromTo("#${c.id} .icbox", { scale: 0.3 }, { scale: 1, duration: 0.5, ease: "back.out(2.6)", immediateRender: false }, ${f3(tin + 0.15)});`);
      if (c.meter) {
        const d = X.ev(c.meter.drain, `${c.id}.meter.drain`);
        X.js.push(`  tl.fromTo("#${c.id} .fill", { scaleX: 1 }, { scaleX: 0.12, duration: 1.6, ease: "power2.inOut", immediateRender: false }, ${f3(d - 1.2)});`);
        X.js.push(`  tl.to("#${c.id} .fill", { backgroundColor: "#FF4D5E", duration: 0.6, ease: "none" }, ${f3(d - 0.2)});`);
      }
      if (c.out != null) X.hide(`#${c.id}`, c.out, { x: -60 });
    },
  },
  flow: { // node ids d1…, arrow ids a1… (one flow card per page)
    css: (c) => [`#${c.id} { top: ${c.top}px; padding: 52px 40px; box-shadow: 0px 0px 0px 2px rgba(110,220,255,0.6), 0px 0px 50px 2px rgba(60,200,255,0.18), 0px 30px 70px 0px rgba(0,0,0,0.6); }`,
      `#${c.id} .flow { display: flex; align-items: center; justify-content: center; gap: 0px; }`,
      `.node { width: 252px; height: 190px; box-sizing: border-box; border-radius: 22px; padding: 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center;`,
      `  background: rgba(14,20,32,0.95); box-shadow: 0px 0px 0px 2px rgba(110,220,255,0.65); visibility: hidden; opacity: 0; }`,
      `.node span { font-size: 30px; font-weight: 700; line-height: 1.15; }`,
      `#d${c.nodes.length} span { color: #FFE2A0; }`,
      `.arw { position: relative; width: 84px; height: 24px; flex: none; }`,
      `.arw .shaft { position: absolute; left: 6px; top: 10px; width: 64px; height: 4px; border-radius: 2px; background: #6EDCFF; transform-origin: 0 50%; transform: scaleX(0); }`,
      `.arw .head { position: absolute; left: 56px; top: 0px; visibility: hidden; opacity: 0; }`,
      `.arw .pulse { position: absolute; left: 4px; top: 6px; width: 12px; height: 12px; border-radius: 6px; background: #FFFFFF; box-shadow: 0px 0px 14px 4px rgba(120,230,255,0.9); visibility: hidden; opacity: 0; }`],
    html: (c) => [`      <div class="card" id="${c.id}"><div class="flow">`,
      ...c.nodes.flatMap((n, i) => [
        ...(i ? [`        <div class="arw" id="a${i}"><i class="shaft"></i><i class="head">${icon("arrow", 24, "#6EDCFF", 3)}</i><i class="pulse"></i></div>`] : []),
        `        <div class="node" id="d${i + 1}">${icon(...n.icon)}<span>${n.text}</span></div>`]),
      `      </div></div>`].join("\n"),
    preset: () => [],
    play: (c, X) => {
      const tin = X.ev(c.in, `${c.id}.in`), N = c.nodes.length;
      X.show(`#${c.id}`, tin, { y: 30 }, 0.4, "power3.out");
      const ts = c.nodes.map((n, i) => (n.t != null ? X.ev(n.t, `${c.id}.nodes[${i}].t`) : tin + 0.1));
      ts.forEach((t, i) => {
        if (i) {
          X.js.push(`  tl.fromTo("#a${i} .shaft", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out", immediateRender: false }, ${f3(t - 0.5)});`);
          X.show(`#a${i} .head`, t - 0.05, { x: -20 }, 0.2, "power2.out");
        }
        if (i === N - 1 && N > 1) { // the result node lands gold
          X.show(`#d${i + 1}`, t, { scale: 0.7 }, 0.5, "back.out(2)"); X.cue(t, "sparkle", 0.4);
          X.js.push(`  tl.to("#d${i + 1}", { boxShadow: "0px 0px 0px 3px rgba(255,214,120,0.95), 0px 0px 60px 6px rgba(240,180,70,0.55)", duration: 0.6, ease: "sine.out" }, ${f3(t + 0.3)});`);
        } else { X.show(`#d${i + 1}`, t, { scale: 0.7 }, 0.45); X.cue(t, "pop", 0.45); }
      });
      // a pulse runs along each arrow as its node lands, then once more along all of them
      const pulses = [...ts.slice(1).map((t, k) => [k + 1, t + 0.6]), ...ts.slice(1).map((_, k) => [k + 1, ts[N - 1] + (2.4 + 0.5 * k)])];
      for (const [a, t0] of pulses) X.js.push(`  tl.fromTo("#a${a} .pulse", { x: 0, autoAlpha: 1 }, { x: 64, autoAlpha: 0, duration: 0.7, ease: "power1.in", immediateRender: false }, ${f3(t0)});`);
      if (c.out != null) X.hide(`#${c.id}`, c.out, { y: -30 });
    },
  },
  hero: {
    css: (c) => [`#${c.id} { top: ${c.top}px; padding: 50px 56px 54px; background: linear-gradient(160deg, rgba(46,34,12,0.96) 0%, rgba(16,12,6,0.97) 100%);`,
      `  box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.9), 0px 0px 80px 6px rgba(240,180,70,0.35), 0px 30px 80px 0px rgba(0,0,0,0.65); }`,
      `#${c.id} .icbox { background: rgba(246,200,100,0.16); box-shadow: inset 0px 0px 0px 2px rgba(246,214,138,0.8); }`,
      // (I.max = the card's slam time; the comment is kept word for word so the page stays byte-identical)
      `#${c.id} .big { font-size: 88px; font-weight: 900; line-height: 1.05; transform-origin: 0% 60%; visibility: hidden; opacity: 0; } /* slams in at I.max; visible before it, the card showed it twice */`,
      `#${c.id} .fill { transform: scaleX(0.12); }`,
      `#${c.id} .fill { background: linear-gradient(90deg, #6EDCFF 0%, #F7D27A 100%); }`,
      `#${c.id} .l2 { margin-top: 30px; font-size: 40px; font-weight: 700; line-height: 1.25; color: #FFF3D6; visibility: hidden; opacity: 0; }`,
      `#${c.id} .l2 b { color: #F7D27A; }`],
    html: (c) => [`      <div class="card" id="${c.id}"><div class="row"><div class="icbox">${icon(...c.icon)}</div><div class="big"><span class="metal">${c.big}</span></div></div>`,
      `        <div class="meter"><i class="fill"></i></div>`,
      `        <div class="l2">${c.l2}</div></div>`].join("\n"),
    preset: () => [],
    play: (c, X) => {
      const tin = X.ev(c.in, `${c.id}.in`), slam = X.ev(c.slam, `${c.id}.slam`), l2 = X.ev(c.l2_at, `${c.id}.l2_at`);
      X.show(`#${c.id}`, tin, { scale: 0.86 }, 0.5, "back.out(1.8)");
      X.js.push(`  tl.fromTo("#${c.id} .big", { scale: 1.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.24, ease: "power4.in", immediateRender: false }, ${f3(slam - 0.24)});`);
      [[10, -6], [-7, 4], [4, -2], [0, 0]].forEach(([x, y], i) => X.js.push(`  tl.to("#${c.id}", { x: ${x}, y: ${y}, duration: ${f3(1 / 60)}, ease: "none" }, ${f3(slam + i / 30)});`));
      X.cue(slam, "impact-bass-1", 0.55, 0.9);
      X.js.push(`  tl.fromTo("#${c.id} .fill", { scaleX: 0.12 }, { scaleX: 1, duration: 2.2, ease: "power2.inOut", immediateRender: false }, ${f3(slam + 0.3)});`);
      X.sweep(`#${c.id} .big .metal`, slam + 0.5, 1.1);
      X.show(`#${c.id} .l2`, l2, { y: 20 }, 0.45, "power3.out"); X.cue(l2, "whoosh-short", 0.3);
      if (c.count) { const t = X.ev(c.count.t, `${c.id}.count.t`); X.cue(t, "typing", 0.22, 1.4); X.sweep(`#${c.id} .big .metal`, t + 1.6, 1.1); }
      else X.sweep(`#${c.id} .big .metal`, l2 + 0.6, 1.1);
      if (c.out != null) X.hide(`#${c.id}`, c.out, { x: 120 }, 0.5);
    },
  },
  tiles: { // tile ids <id>a, <id>b, …; the pill has its own id
    css: (c) => [`#${c.id} { position: absolute; left: 800px; top: ${c.top}px; width: 980px; display: flex; justify-content: space-between; visibility: hidden; opacity: 0; }`,
      `.tile { width: 300px; height: 250px; box-sizing: border-box; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; visibility: hidden; opacity: 0;`,
      `  background: linear-gradient(160deg, rgba(24,31,46,0.95) 0%, rgba(11,14,23,0.96) 100%); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.7), 0px 0px 40px 2px rgba(60,200,255,0.2), 0px 24px 60px 0px rgba(0,0,0,0.6); }`,
      `.tile span { font-size: 38px; font-weight: 800; }`,
      ...(c.pill ? [`#${c.pill.id} { position: absolute; left: 800px; top: ${c.pill.top}px; width: 980px; box-sizing: border-box; visibility: hidden; opacity: 0; display: flex; align-items: center; gap: 22px; padding: 28px 36px; border-radius: 999px;`,
        `  background: linear-gradient(180deg, rgba(10,18,32,0.97) 0%, rgba(6,10,18,0.97) 100%); box-shadow: 0px 0px 0px 3px rgba(120,235,255,0.95), 0px 0px 50px 6px rgba(60,210,255,0.4), 0px 18px 50px 0px rgba(0,0,0,0.6); }`,
        `#${c.pill.id} span { font-size: 38px; font-weight: 800; line-height: 1.2; }`,
        `#${c.pill.id} b { color: #F7D27A; }`] : [])],
    html: (c) => [`      <div id="${c.id}">${c.tiles.map((t, i) => `<div class="tile" id="${c.id}${"abcdefgh"[i]}">${icon(...t.icon)}<span>${t.text}</span></div>`).join("")}</div>`,
      ...(c.pill ? [`      <div id="${c.pill.id}">${icon(...c.pill.icon)}<span>${c.pill.html}</span></div>`] : [])].join("\n"),
    preset: () => [],
    play: (c, X) => {
      const ts = c.tiles.map((t, i) => X.ev(t.t, `${c.id}.tiles[${i}].t`));
      X.show(`#${c.id}`, c.in != null ? X.ev(c.in, `${c.id}.in`) : ts[0] - 0.3, { y: 0 }, 0.2, "none");
      ts.forEach((t, i) => { X.show(`#${c.id}${"abcdefgh"[i]}`, t, { y: 40, scale: 0.7 }, 0.45, "back.out(2.2)"); X.cue(t, "pop", 0.42); });
      if (c.pill) {
        const pA = X.ev(c.pill.in, `${c.pill.id}.in`), pid = c.pill.id;
        X.show(`#${pid}`, pA, { y: 40, scale: 0.9 }, 0.5, "back.out(1.8)"); X.cue(pA, "notification", 0.42);
        for (let t = pA + 1.0; c.out != null && t < c.out - 0.6; t += 1.25) {
          X.js.push(`  tl.to("#${pid}", { scale: 1.04, duration: 0.5, ease: "sine.out" }, ${f3(t)});`);
          X.js.push(`  tl.to("#${pid}", { scale: 1, duration: 0.55, ease: "sine.in" }, ${f3(t + 0.52)});`);
        }
      }
      if (c.out != null) { X.hide(`#${c.id}`, c.out, { y: -30 }); if (c.pill) X.hide(`#${c.pill.id}`, c.out, { y: 30 }); }
    },
  },
  offer: {
    css: (c) => [`#${c.id} { top: ${c.top}px; padding: 54px 58px; background: linear-gradient(160deg, rgba(46,34,12,0.97) 0%, rgba(16,12,6,0.97) 100%);`,
      `  box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 90px 8px rgba(240,180,70,0.35), 0px 30px 80px 0px rgba(0,0,0,0.65); }`,
      `#${c.id} .icbox { background: rgba(246,200,100,0.16); box-shadow: inset 0px 0px 0px 2px rgba(246,214,138,0.8); }`,
      `#${c.id} .vip { font-size: 30px; font-weight: 800; color: #F7D27A; }`,
      `#${c.id} .big { font-size: 70px; font-weight: 900; line-height: 1.08; margin-top: 8px; }`,
      `#${c.id} .l2 { margin-top: 34px; visibility: hidden; opacity: 0; }`,
      `#${c.id} .l2 div { font-size: 42px; font-weight: 800; line-height: 1.25; color: #FFF3D6; }`,
      `#${c.id} .l2 .p { font-size: 36px; font-weight: 700; color: #F7D27A; margin-top: 6px; }`],
    html: (c) => [`      <div class="card" id="${c.id}"><div class="row"><div class="icbox">${icon(...c.icon)}</div><div><div class="vip">${c.label}</div><div class="big"><span class="metal">${c.big}</span></div></div></div>`,
      `        <div class="l2">${c.lines.map(line).join("")}</div></div>`].join("\n"),
    preset: () => [],
    play: (c, X) => {
      const tin = X.ev(c.in, `${c.id}.in`), l2 = X.ev(c.l2_at, `${c.id}.l2_at`);
      X.show(`#${c.id}`, tin, { scale: 0.85 }, 0.55, "back.out(1.7)"); X.cue(tin, "impact-bass-2", 0.5);
      X.sweep(`#${c.id} .big .metal`, tin + 0.7, 1.2);
      X.show(`#${c.id} .l2`, l2, { y: 20 }, 0.45, "power3.out"); X.cue(l2, "sparkle", 0.4);
      X.sweep(`#${c.id} .big .metal`, l2 + 0.6, 1.2);
      if (c.out != null) X.hide(`#${c.id}`, c.out, { y: -30 });
    },
  },
};
const GOLD = new Set(["hero", "offer"]); // cards that need .metal

// write: false = a dry run (build.mjs check): everything is computed and every data error thrown, nothing written
export function buildPage(P, { write = true } = {}) {
  const { TL, dir, build } = P;
  const spec = JSON.parse(readFileSync(path.join(build, "specs.json"), "utf8"));
  const track = JSON.parse(readFileSync(path.join(build, "cursor.json"), "utf8"));
  const page = JSON.parse(readFileSync(path.join(build, "page.json"), "utf8"));
  const { S, V, FPS, TOTAL } = TL;
  const SA = TL.screen.at, SE = TL.screen.end;
  const js = [], cues = [], warn = [];
  const cue = (t, file, vol, dur) => cues.push({ t: +f3(t), file, vol, ...(dur ? { dur: +f3(dur) } : {}) });
  const A = (id) => { const a = spec.anchors[id]; if (!a) throw new Error(`anchor ${id} missing in specs.json`); return a; };

  // page.json times: a number (final s) or an expression over S, V, SA, SE, TOTAL, min, max
  const NAMES = { S, V, SA, SE, TOTAL, min: Math.min, max: Math.max };
  const ev = (x, what) => {
    if (typeof x === "number") return x;
    const bad = typeof x !== "string" || /[^\w\s().,+\-*/]/.test(x) || (x.match(/[A-Za-z_]\w*/g) ?? []).some((n) => !(n in NAMES));
    const v = bad ? NaN : Function(...Object.keys(NAMES), `return (${x});`)(...Object.values(NAMES));
    if (!Number.isFinite(v)) throw new Error(`page.json ${what}: '${x}' is not a time (a number, or S(source s), V(voice s), SA, SE, TOTAL, min(), max() with + - * /)`);
    return v;
  };

  // show / hide helpers (autoAlpha = opacity + visibility, so hidden layers never count as painted)
  const show = (sel, t, from = { y: 24, scale: 0.96 }, d = 0.45, ease = "back.out(1.6)") =>
    js.push(`  tl.fromTo("${sel}", { autoAlpha: 0, ${Object.entries(from).map(([k, v]) => `${k}: ${v}`).join(", ")} }, { autoAlpha: 1, ${Object.keys(from).map((k) => `${k}: ${k === "scale" ? 1 : 0}`).join(", ")}, duration: ${d}, ease: "${ease}", immediateRender: false }, ${f3(t)});`);
  const hide = (sel, t, to = { y: -16 }, d = 0.35) =>
    js.push(`  tl.to("${sel}", { autoAlpha: 0, ${Object.entries(to).map(([k, v]) => `${k}: ${v}`).join(", ")}, duration: ${d}, ease: "power2.in" }, ${f3(t)});`);
  const T = (sel, t, vars, d, ease = "power2.inOut") =>
    js.push(`  tl.to("${sel}", { ${Object.entries(vars).map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`).join(", ")}, duration: ${f3(d)}, ease: "${ease}" }, ${f3(t)});`);
  const sweep = (sel, t, d) => js.push(`  tl.fromTo("${sel}", { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%", duration: ${d}, ease: "sine.inOut", immediateRender: false }, ${f3(t)});`);
  const X = { js, show, hide, cue, ev, sweep };
  // a streak time written as a plain number keeps its literal form (1.0), an expression is printed like every time
  const lit = (t) => (typeof t === "number" ? (Number.isInteger(t) ? t.toFixed(1) : String(t)) : f3(ev(t, "streaks")));

  // the cards, in order, with their hide times resolved
  const prep = (list, part) => list.map((c, i) => {
    if (!KINDS[c.kind]) throw new Error(`${part} card ${c.id}: kind '${c.kind}' unknown; have: ${Object.keys(KINDS).join(", ")}`);
    const nx = list[i + 1];
    const out = c.out != null ? ev(c.out, `${c.id}.out`) : nx ? ev(nx.in ?? nx.tiles?.[0]?.t, `${nx.id}.in`) - 0.35 : null;
    return { ...c, out };
  });
  const introCards = prep(page.intro.cards ?? [], "intro"), outroCards = prep(page.outro.cards ?? [], "outro");
  if ([...introCards, ...outroCards].filter((c) => c.kind === "flow").length > 1) throw new Error("only one flow card per page (its node ids are d1, d2, …)");

  // ════════════════ INTRO (0 – SA): glass facecam + cards ════════════════
  // starting states of things that animate in later, so nothing sits visible and then jumps (preflight 'snap',
  // 2026-10-29): the glass sheen rested in the middle of the frame for its first second; the icons popped from full size
  js.push(`  tl.set("#faceA .streak, #faceB .streak", { x: -700 }, 0);`);
  for (const c of [...introCards, ...outroCards]) js.push(...KINDS[c.kind].preset(c));
  show("#faceA", 0.05, { x: -140, scale: 0.92 }, 0.9, "power3.out");
  cue(0.05, "whoosh-cinematic", 0.5);
  for (const t of page.intro.streaks ?? []) js.push(`  tl.fromTo("#faceA .streak", { x: -700 }, { x: 900, duration: 2.2, ease: "power2.inOut", immediateRender: false }, ${lit(t)});`);
  for (const c of introCards) KINDS[c.kind].play(c, X);
  // face shrinks aside, the monitor floats in, then the dive
  const MON = ev(page.intro.monitor_in, "intro.monitor_in"), DIVE = ev(page.intro.dive, "intro.dive");
  T("#faceA", MON - 0.2, { x: -60, y: 40, scale: 0.8 }, 1.6, "power3.inOut");
  js.push(`  tl.fromTo("#stage", { autoAlpha: 0, x: 330, y: 30, scale: 0.46, skewY: -3 }, { autoAlpha: 1, x: 300, y: 10, scale: 0.5, skewY: -2, duration: 1.4, ease: "power3.out", immediateRender: false }, ${f3(MON)});`);
  js.push(`  tl.to("#stage", { y: -4, skewY: -1.2, duration: ${f3(DIVE - MON - 1.4)}, ease: "sine.inOut" }, ${f3(MON + 1.4)});`);
  cue(DIVE - 4.12, "riser", 0.32, 4.12);
  T("#faceA", DIVE, { x: -760, autoAlpha: 0 }, 0.9, "power3.in");
  js.push(`  tl.to("#stage", { x: 0, y: 0, scale: 1, skewY: 0, duration: ${f3(SA - DIVE - 0.25)}, ease: "power3.inOut" }, ${f3(DIVE + 0.1)});`);
  cue(DIVE + 0.1, "whoosh-cinematic", 0.55);
  js.push(`  tl.set("#faceA", { display: "none" }, ${f3(SA + 0.5)});`);

  // ════════════════ SCREEN PART (SA – SE) ════════════════
  // monitor float: ±4 px, 3 s each way, 2D only
  const floatN = Math.floor((SE - 0.8 - SA) / 3);
  js.push(`  tl.to("#mon", { y: -4, duration: 3, ease: "sine.inOut", repeat: ${floatN - 1}, yoyo: true }, ${f3(SA)});`);
  cue(SA + 0.05, "whoosh-short", 0.35);

  // camera views (source → final), each eased in ~0.8 s before it is reached, out to 1× unless the next follows
  const views = spec.camera.map((v) => ({ ...v, a: S(v.from), b: S(v.to) })).sort((x, y) => x.a - y.a);
  let prevV = { s: 1, l: 0, tp: 0 }, freeAt = SA; // freeAt: when the camera may start its next move
  const camTo = (v, t, d, ease) => {
    js.push(`  tl.to("#cam", { x: ${f3(-v.l * v.s)}, y: ${f3(-v.tp * v.s)}, scale: ${f3(v.s)}, duration: ${f3(d)}, ease: "${ease}" }, ${f3(t)});`);
    prevV = v;
  };
  views.forEach((v, i) => {
    v.l = Math.max(0, Math.min(v.l, 1920 - 1920 / v.s)); v.tp = Math.max(0, Math.min(v.tp, 1080 - 1080 / v.s));
    const slow = v.s < 1.2, din = slow ? 1.4 : 0.8;
    const t0 = Math.max(freeAt + 0.02, v.a - din);
    if (t0 > v.b - 0.2) { warn.push(`camera view ${i} (${v.what}) has no room (${f3(v.a)}–${f3(v.b)})`); return; }
    camTo(v, t0, Math.min(din, v.b - t0 - 0.1), slow ? "sine.inOut" : "power2.inOut");
    if (!slow) cue(t0, "whoosh-short", 0.28);
    const nx = views[i + 1];
    if (nx && nx.a - v.b < 1.4) { freeAt = v.b; return; }
    const dout = slow ? 1.1 : 0.8;
    camTo({ s: 1, l: 0, tp: 0 }, v.b, dout, "power2.inOut");
    freeAt = v.b + dout;
  });
  if (prevV.s !== 1) camTo({ s: 1, l: 0, tp: 0 }, SE - 1.2, 0.8, "power2.inOut");

  // cursor glow, drag trails, waveform: one onUpdate tween reading sampled data, one sample per frame (at 25 Hz the
  // glow ran up to ~290 px ahead of the cursor on fast flicks in sped-up pieces)
  const GH = FPS;
  // inside a freeze (specs.freezes) the picture shows the frame at `use`, so the glow stays on that frame's cursor
  const unfreeze = (s) => (spec.freezes ?? []).find((z) => s >= z.from && s <= z.to)?.use ?? s;
  const okT = track.map((f) => f.s >= 0.85);
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < track.length; i++) { // weak matches next to a confirmed one, < 60 px apart
    if (okT[i] || track[i].s < 0.72) continue;
    const near = (j) => j >= 0 && j < track.length && okT[j] && Math.hypot(track[j].x - track[i].x, track[j].y - track[i].y) < 60;
    if (near(i - 1) || near(i + 1)) okT[i] = true;
  }
  for (let i = 0; i < track.length;) { // bridge misses ≤ 0.4 s
    if (okT[i]) { i++; continue; }
    let j = i; while (j < track.length && !okT[j]) j++;
    if (i > 0 && j < track.length && track[j].t - track[i - 1].t <= 0.45) for (let k = i; k < j; k++) {
      const u = (track[k].t - track[i - 1].t) / (track[j].t - track[i - 1].t);
      track[k] = { ...track[k], x: track[i - 1].x + (track[j].x - track[i - 1].x) * u, y: track[i - 1].y + (track[j].y - track[i - 1].y) * u };
      okT[k] = true;
    }
    i = j;
  }
  const at = (s) => { // cursor at source time s (linear between samples), visible flag
    let lo = 0, hi = track.length - 1;
    if (s <= track[0].t) return { x: track[0].x, y: track[0].y, v: okT[0] };
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (track[m].t <= s) lo = m; else hi = m; }
    const a = track[lo], b = track[hi], u = Math.max(0, Math.min(1, (s - a.t) / (b.t - a.t || 1)));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, v: okT[lo] && okT[hi] };
  };
  const GX = [], GY = [], GV = [];
  for (let t = SA; t <= SE; t += 1 / GH) {
    const s = TL.Sinv(t); const c = s === null ? { x: 0, y: 0, v: false } : at(unfreeze(s));
    GX.push(Math.round(c.x)); GY.push(Math.round(c.y)); GV.push(c.v ? 1 : 0);
  }
  const coverage = GV.reduce((a, b) => a + b, 0) / GV.length;
  const lastSeen = SA + GV.lastIndexOf(1) / GH;
  if (SE - lastSeen > 15) warn.push(`whole-video coverage gap: the cursor glow is last seen at ${f3(lastSeen)} s, the screen part runs to ${f3(SE)} s (§0h)`);
  const drags = (spec.drags ?? []).map(([a, b]) => [S(a), S(b)]);
  const waits = TL.screen.pieces.filter((p) => p.kind === "play" && p.wait && p.frames / FPS >= 1.2).map((p) => ({ a: p.at / FPS, b: (p.at + p.frames) / FPS, sp: p.speed }));

  // click shockwaves: the cursor tip at the click if tracked, else the reviewed point
  const clicks = spec.clicks.map((c) => {
    const t = S(c.t); const kept = TL.Sinv(t + 0.001); if (kept === null || Math.abs(kept - c.t) > 0.25) return null;
    const p = at(c.t);
    return { t, x: p.v ? p.x : c.x, y: p.v ? p.y : c.y };
  }).filter(Boolean).sort((a, b) => a.t - b.t);
  // x/y go in BOTH vars: when they were only in the from-vars, a seeked render left 5 of 128 rings at the position of
  // the previous click on the same ring element (render review 2026-10-29)
  clicks.forEach((c, i) => {
    const r = `#ring${i % 4}`, x = Math.round(c.x), y = Math.round(c.y);
    js.push(`  tl.fromTo("${r}", { x: ${x}, y: ${y}, scale: 0.15, autoAlpha: 1 }, { x: ${x}, y: ${y}, scale: 2.6, autoAlpha: 0, duration: 0.55, ease: "power2.out", immediateRender: false }, ${f3(c.t)});`);
    cue(c.t, "click-soft", 0.3);
  });

  // speed chip + waveform during every ramp ≥ 1.2 s
  waits.forEach((w) => {
    const sp = (Math.round(w.sp * 10) / 10).toFixed(1).replace(/\.0$/, "");
    js.push(`  tl.set("#chipv", { textContent: "${sp}×" }, ${f3(w.a)});`);
    show("#chip", w.a, { x: 30 }, 0.3, "power3.out");
    hide("#chip", w.b - 0.3, { x: 30 }, 0.3);
    show("#wave", w.a, { y: 30 }, 0.3, "power3.out");
    hide("#wave", w.b - 0.3, { y: 30 }, 0.3);
    cue(w.b - Math.min(4.12, w.b - w.a), "riser", 0.22, Math.min(4.12, w.b - w.a));
  });

  const scr = page.screen ?? {};
  // sound effects of the screen part: scene changes, typing under a rename, … [t, file, vol, dur?]
  (scr.sounds ?? []).forEach(([t, file, vol, dur], i) => cue(ev(t, `screen.sounds[${i}]`), file, vol, dur != null ? ev(dur, `screen.sounds[${i}].dur`) : undefined));

  // numbered panels (page space, placed at an anchor's source px through the monitor's scale)
  for (const L of scr.lists ?? []) {
    const ts = L.items.map((it, i) => ev(it.t, `${L.id}.items[${i}].t`));
    show(`#${L.id}p`, ts[0] - 0.25, { x: 40 }, 0.4, "power3.out");
    ts.forEach((t, i) => { show(`#${L.id}i${i}`, t, { x: 40, scale: 0.9 }, 0.45); cue(t, ...(L.sound ?? ["pop", 0.4])); });
    hide(`#${L.id}p`, ev(L.out, `${L.id}.out`), { x: 40 }, 0.4);
  }

  // cam-space labels: placed at an anchor (source px) + dx/dy, shown/hidden at final times
  const tag = (sel, a, dx, dy, t0, t1, sound) => {
    if (t1 != null && t1 <= t0) throw new Error(`label ${sel} hides at ${f3(t1)} before it shows at ${f3(t0)}: check its in/out in page.json`);
    if (t1 != null && t1 < t0 + 0.5) warn.push(`label ${sel} is up only ${f3(t1 - t0)} s (${f3(t0)}–${f3(t1)}): check its in/out`);
    if (t0 < SA || (t1 ?? t0) > SE) warn.push(`label ${sel} (${f3(t0)}–${f3(t1 ?? t0)}) is outside the screen part ${f3(SA)}–${f3(SE)}`);
    js.push(`  tl.set("${sel}", { x: ${Math.round(a.x + dx)}, y: ${Math.round(a.y + dy)} }, 0);`);
    show(sel, t0, { scale: 0.6 }, 0.4, "back.out(2)");
    if (t1) hide(sel, t1, { scale: 0.9 }, 0.3);
    if (sound) cue(t0, ...sound);
  };
  const tickItems = (L) => (L.items
    ? L.items.map((it, i) => ({ id: it.id, a: A(it.anchor), t: ev(it.in, `ticks ${it.id}.in`) }))
    : A(L.anchor).map((a, i) => ({ id: `${L.id}${i}`, a, t: ev(L.in, `ticks ${L.id}.in`) + i * L.stagger })));
  for (const L of scr.labels ?? []) {
    if (L.kind === "ticks") {
      const out = ev(L.out, `ticks ${L.id ?? L.items?.[0]?.id}.out`);
      for (const p of tickItems(L)) {
        if (L.size === "sm") { // small ticks (Claude's 18 px task circles) pop in one after another
          js.push(`  tl.set("#${p.id}", { x: ${Math.round(p.a.x)}, y: ${Math.round(p.a.y)} }, 0);`);
          show(`#${p.id}`, p.t, { scale: 0.3 }, 0.35, "back.out(2.6)");
          hide(`#${p.id}`, out, { scale: 0.8 }, 0.25);
          if (L.sound) cue(p.t, ...L.sound);
        } else tag(`#${p.id}`, p.a, 0, 0, p.t, out, L.sound);
      }
    } else if (L.kind === "tag" || L.kind === "box") {
      tag(`#${L.id}`, A(L.anchor), L.dx ?? 0, L.dy ?? 0, ev(L.in, `${L.id}.in`), L.out != null ? ev(L.out, `${L.id}.out`) : null, L.sound);
    } else throw new Error(`label ${L.id}: kind '${L.kind}' unknown; have: tag, box, ticks`);
  }
  // drag trails (ghosts of the glow) come from the onUpdate tween

  // banners (page space, bottom): pulse until they leave
  for (const b of scr.banners ?? []) {
    const bA = ev(b.in, `${b.id}.in`), bB = ev(b.out, `${b.id}.out`);
    show(`#${b.id}`, bA, { y: 90, scale: 0.92 }, 0.55, "back.out(1.7)"); cue(bA, "impact-bass-2", 0.5);
    for (let t = bA + 1.2; t < bB - 0.8; t += 1.4) {
      js.push(`  tl.to("#${b.id}", { boxShadow: "0px 0px 0px 3px rgba(120,235,255,1), 0px 0px 70px 12px rgba(60,210,255,0.55), 0px 18px 50px 0px rgba(0,0,0,0.6)", duration: 0.55, ease: "sine.out" }, ${f3(t)});`);
      js.push(`  tl.to("#${b.id}", { boxShadow: "0px 0px 0px 2px rgba(120,235,255,0.75), 0px 0px 36px 2px rgba(60,210,255,0.35), 0px 18px 50px 0px rgba(0,0,0,0.6)", duration: 0.6, ease: "sine.in" }, ${f3(t + 0.56)});`);
    }
    hide(`#${b.id}`, bB, { y: 60 }, 0.35); cue(bB, "whoosh-short", 0.3);
  }

  // callouts (page space, top centre unless `top`)
  for (const c of scr.callouts ?? []) {
    const t0 = ev(c.in, `${c.id}.in`);
    show(`#${c.id}`, t0, { y: -40, scale: 0.9 }, 0.45, "back.out(1.8)"); hide(`#${c.id}`, ev(c.out, `${c.id}.out`), { y: -30 }, 0.3);
    if (c.sound) cue(t0, ...c.sound);
  }

  // ════════════════ OUTRO (SE – TOTAL) ════════════════
  // the clip ends at SE but the monitor flies off until SE + 0.35: its last frame stands in (the first-frame poster showed)
  js.push(`  tl.set("#posterEnd", { autoAlpha: 1 }, ${f3(SE - 0.5)});`);
  js.push(`  tl.to("#stage", { x: 520, y: 30, scale: 0.42, autoAlpha: 0, skewY: -2, duration: 0.7, ease: "power3.in" }, ${f3(SE - 0.35)});`);
  cue(SE - 0.3, "whoosh-cinematic", 0.5);
  js.push(`  tl.set("#faceB", { display: "block" }, ${f3(SE - 0.4)});`);
  show("#faceB", SE, { x: -160, scale: 0.92 }, 0.8, "power3.out");
  for (const t of page.outro.streaks ?? []) js.push(`  tl.fromTo("#faceB .streak", { x: -700 }, { x: 900, duration: 2.2, ease: "power2.inOut", immediateRender: false }, ${lit(t)});`);
  for (const c of outroCards) KINDS[c.kind].play(c, X);
  // the outro cut: a small push hides the jump, settling back to 1× by the end
  for (const o of TL.outro.slice(1)) js.push(`  tl.fromTo("#faceB .vid", { scale: 1.07 }, { scale: 1, duration: ${f3(TOTAL - o.at - 0.05)}, ease: "sine.out", immediateRender: false }, ${f3(o.at)});`);
  cue(TOTAL - 1.7, "chime", 0.3);
  js.push(`  tl.fromTo("#fade", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "sine.in", immediateRender: false }, ${f3(TOTAL - 0.55)});`);

  // background drift for the whole video
  js.push(`  tl.fromTo("#grid", { y: 0 }, { y: -96, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);
  js.push(`  tl.fromTo("#dust1", { y: 0 }, { y: -260, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);
  js.push(`  tl.fromTo("#dust2", { y: 0 }, { y: -420, duration: ${f3(TOTAL)}, ease: "none", immediateRender: false }, 0);`);

  // ── particles: one element per layer, many gradients ──
  let seed = 9;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dust = (n, col, rmax) => Array.from({ length: n }, () => {
    const x = Math.round(rnd() * 1920), y = Math.round(rnd() * 1500), r = (1.5 + rnd() * rmax).toFixed(1);
    return `radial-gradient(circle at ${x}px ${y}px, ${col} 0px, rgba(0,0,0,0) ${r}px)`;
  }).join(",");

  // ── CSS: fixed parts + what the data asks for ──
  let metal = false;
  const cardCss = (c) => { const out = KINDS[c.kind].css(c); if (GOLD.has(c.kind) && !metal) { metal = true; out.push(...CSS_METAL); } return out; };
  const css = ["", ...CSS_HEAD, ...introCards.flatMap(cardCss), ...CSS_MONITOR,
    ...(scr.lists ?? []).flatMap((L) => [`#${L.id}p { position: absolute; left: 0; top: 0; width: ${L.width ?? 328}px; visibility: hidden; opacity: 0; display: flex; flex-direction: column; gap: 14px; }`,
      `.${L.id}i { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-radius: 18px; visibility: hidden; opacity: 0;`,
      `  background: rgba(8,12,20,0.95); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.85), 0px 0px 26px 2px rgba(60,200,255,0.3), 0px 12px 30px 0px rgba(0,0,0,0.55); }`,
      `.${L.id}i .n { flex: none; width: 52px; height: 52px; border-radius: 26px; background: linear-gradient(180deg, #F9DE98 0%, #D9A443 100%); color: #1A1205; font-family: "Hind Siliguri", "Inter", sans-serif; font-weight: 700; font-size: 32px; display: flex; align-items: center; justify-content: center; letter-spacing: 0; }`,
      `.${L.id}i span { font-size: 29px; font-weight: 800; line-height: 1.15; color: #FFFFFF; }`]),
    ...CSS_CHIP_WAVE,
    ...(scr.banners ?? []).flatMap((b) => [`#${b.id} { position: absolute; left: 160px; top: 892px; width: 1600px; box-sizing: border-box; visibility: hidden; opacity: 0; display: flex; align-items: center; justify-content: center; gap: 22px; padding: 20px 34px; border-radius: 999px;`,
      `  background: linear-gradient(180deg, rgba(10,18,32,0.97) 0%, rgba(6,10,18,0.97) 100%); box-shadow: 0px 0px 0px 2px rgba(120,235,255,0.75), 0px 0px 36px 2px rgba(60,210,255,0.35), 0px 18px 50px 0px rgba(0,0,0,0.6); }`,
      `#${b.id} span { font-size: 34px; font-weight: 800; color: #FFFFFF; white-space: nowrap; }`,
      `#${b.id} b { color: #F7D27A; }`]),
    ...CSS_CALL,
    ...(scr.callouts ?? []).flatMap((c) => [
      ...(c.top != null ? [`#${c.id} { top: ${c.top}px; }${c.note ? ` /* ${c.note} */` : ""}`] : []),
      ...(c.gold ? [`#${c.id} .in { box-shadow: 0px 0px 0px 3px rgba(246,214,138,0.95), 0px 0px 50px 6px rgba(240,180,70,0.45), 0px 16px 40px 0px rgba(0,0,0,0.6); }`, `#${c.id} span { color: #FFE9B8; }`] : [])]),
    `/* outro */`, ...outroCards.flatMap(cardCss),
    `#fade { position: absolute; inset: 0; background: #000000; visibility: hidden; opacity: 0; }`, ""].join("\n");

  // ── HTML ──
  const tagHTML = (id, inner, cls = "") => `<div class="tag ${cls}" id="${id}"><div class="in">${inner}</div></div>`;
  const labelHTML = (L) => {
    if (L.kind === "ticks") return tickItems(L).map((p) => (L.size === "sm"
      ? `<div class="tick sm" id="${p.id}"><div class="in">${icon("check", 18, "#FFFFFF", 3.6)}</div></div>`
      : `<div class="tick" id="${p.id}"><div class="in">${icon("check", 30, "#FFFFFF", 3.4)}</div></div>`)).join("");
    if (L.kind === "box") { // a green frame around the anchor's box (w × h, else 260 × 56)
      const a = A(L.anchor);
      return tagHTML(L.id, `<div style="width:${Math.round((a.w ?? 260) + 24)}px;height:${Math.round((a.h ?? 56) + 20)}px;border-radius:16px;box-shadow:0px 0px 0px 3px rgba(80,230,150,0.95),0px 0px 30px 6px rgba(60,220,140,0.5)"></div>`, "box");
    }
    return tagHTML(L.id, `${L.icon ? icon(...L.icon) : ""}<span>${L.text}</span>`, L.style ?? "");
  };
  const camLines = [[0, 1, 2].map((i) => `<div class="ghost" id="gh${i}"></div>`).join(""), `<div id="glow"></div>`,
    [0, 1, 2, 3].map((i) => `<div class="ring" id="ring${i}"></div>`).join(""), ...(scr.labels ?? []).map(labelHTML)].map((l) => `          ${l}`).join("\n");
  const overlayLines = [
    ...(scr.lists ?? []).map((L) => { const a = A(L.anchor); return `<div id="${L.id}p" style="left:${Math.round(MX + a.x * K)}px;top:${Math.round(MY + a.y * K)}px">${L.items.map((it, i) => `<div class="${L.id}i" id="${L.id}i${i}"><div class="n">${bn(i + 1)}</div><span>${it.text}</span></div>`).join("")}</div>`; }),
    `<div id="chip">${icon("ff", 34, "#F7D27A", 2.4)}<span id="chipv">2×</span></div>`,
    `<div id="wave">${Array.from({ length: NWAVE }, (_, i) => `<i id="wb${i}"></i>`).join("")}</div>`,
    ...(scr.banners ?? []).map((b) => `<div id="${b.id}">${icon(...b.icon)}<span>${b.html}</span></div>`),
    ...(scr.callouts ?? []).map((c) => `<div class="call" id="${c.id}"><div class="in">${icon(...c.icon)}<span>${c.text}</span></div></div>`),
  ].map((l) => `      ${l}`).join("\n");
  const count = introCards.concat(outroCards).find((c) => c.kind === "hero" && c.count)?.count;
  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${page.title}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <style>${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-fps="${FPS}" data-duration="${f3(TOTAL)}">
      <div id="bg"></div>
      <div id="grid" data-layout-allow-overflow></div>
      <i class="dust" id="dust1" data-layout-allow-overflow style="background-image:${dust(26, "rgba(140,230,255,0.75)", 2.6)}"></i>
      <i class="dust" id="dust2" data-layout-allow-overflow style="background-image:${dust(18, "rgba(255,214,140,0.7)", 3.2)}"></i>
      <div id="vgn"></div>

      <div class="face" id="faceA"><div class="vid"><video id="introvid" src="assets/media/intro.mp4" muted playsinline data-start="0" data-duration="${f3(TL.intro.b)}" data-track-index="0"></video></div><div class="gl"></div><div class="streak" data-layout-allow-overflow></div></div>

${introCards.map((c) => KINDS[c.kind].html(c)).join("\n")}

      <div id="stage">
        <div id="floor" data-layout-allow-overflow></div>
        <div id="mon"><div id="scr"><div id="camk"><div id="cam">
          <img class="poster" id="poster" src="assets/media/screen_poster.jpg" alt="" />
          <img class="poster" id="posterEnd" src="assets/media/screen_last.jpg" alt="" />
          <video id="scrvid" src="assets/media/screen.mp4" muted playsinline data-start="${f3(SA)}" data-duration="${f3(SE - SA)}" data-track-index="1"></video>
${camLines}
        </div></div><div class="gl"></div></div></div>
      </div>

${overlayLines}

      <div class="face" id="faceB"><div class="vid"><video id="outrovid" src="assets/media/outro.mp4" muted playsinline data-start="${f3(SE)}" data-duration="${f3(TOTAL - SE)}" data-track-index="2"></video></div><div class="gl"></div><div class="streak" data-layout-allow-overflow></div></div>
${outroCards.map((c) => KINDS[c.kind].html(c)).join("\n")}
      <div id="fade"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(TOTAL)}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      gsap.set("#cam", { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      gsap.set("#stage", { x: 0, y: 0, scale: 1, skewY: 0, transformOrigin: "50% 50%" });
      // per-frame layer: cursor glow (+ drag ghosts), waveform bars, the 10x count-up
      const GA = ${f3(SA)}, GE = ${f3(SE)}, GH = ${GH};
      const GX = [${GX.join(",")}];
      const GY = [${GY.join(",")}];
      const GV = "${GV.join("")}";
      const DRAG = ${JSON.stringify(drags.map(([a, b]) => [+f3(a), +f3(b)]))};
      const WAVE = ${JSON.stringify(waits.map((w) => [+f3(w.a), +f3(w.b)]))};
      const glow = document.getElementById("glow");
      const gh = [0, 1, 2].map((i) => document.getElementById("gh" + i));
      const wb = Array.from({ length: ${NWAVE} }, (_, i) => document.getElementById("wb" + i));${count ? `
      const ten = document.getElementById("${count.id}");` : ""}
      const pos = (t) => {
        const u = (t - GA) * GH, i = Math.floor(u);
        if (i < 0 || i + 1 >= GX.length) return null;
        const f = u - i, v = (GV[i] === "1" ? 1 - f : 0) + (GV[i + 1] === "1" ? f : 0);
        return { x: GX[i] + (GX[i + 1] - GX[i]) * f, y: GY[i] + (GY[i + 1] - GY[i]) * f, v };
      };
      const inAny = (t, list) => list.some((w) => t >= w[0] && t < w[1]);
      tl.to({}, { duration: ${f3(TOTAL)}, ease: "none", onUpdate() {
        const t = this.time();
        const p = t >= GA && t < GE - 0.3 ? pos(t) : null;
        if (p) { glow.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px)"; glow.style.opacity = p.v.toFixed(3); }
        else glow.style.opacity = "0";
        const dr = inAny(t, DRAG);
        gh.forEach((g, k) => {
          const q = dr ? pos(t - 0.07 * (k + 1)) : null;
          if (q) { g.style.transform = "translate(" + q.x.toFixed(1) + "px," + q.y.toFixed(1) + "px) scale(" + (1 - 0.22 * k).toFixed(2) + ")"; g.style.opacity = (q.v * (0.6 - 0.16 * k)).toFixed(3); }
          else g.style.opacity = "0";
        });
        if (inAny(t, WAVE)) wb.forEach((b, k) => {
          const h = 0.18 + 0.82 * Math.abs(Math.sin(t * 7.3 + k * 0.9) * Math.sin(t * 3.1 + k * 0.37 + 1.3));
          b.style.transform = "scaleY(" + h.toFixed(3) + ")";
        });${count ? `
        const c = Math.min(1, Math.max(0, (t - ${f3(ev(count.t, "count.t"))}) / 1.3));
        ten.textContent = String(Math.max(1, Math.round(1 + ${count.to - 1} * c * c * (3 - 2 * c))));` : ""}
      } }, 0);
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  if (warn.some((w) => w.startsWith("whole-video"))) throw new Error(warn.join("\n"));
  cues.sort((a, b) => a.t - b.t);
  if (write) {
    writeFileSync(path.join(dir, "index.html"), html);
    writeFileSync(path.join(build, "cues.json"), JSON.stringify(cues));
  }
  console.log(`${write ? "✓ index.html" : "✓ page (dry run)"} (${f3(TOTAL)} s) · ${views.length} camera views · ${clicks.length} clicks · ${waits.length} ramps · cursor seen ${(coverage * 100).toFixed(0)} % of the screen part · ${cues.length} sound cues`);
  for (const w of warn) console.log(`  ! ${w}`);
  return { html, cues, warn };
}

await cli(import.meta, ({ P }) => buildPage(P));
