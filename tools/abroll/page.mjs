// page.mjs — the A-roll + B-roll page (index.html + build/cues.json) for tools/abroll/build.mjs. One timeline, five
// named styles, each a function below (tools/variants.json, VARIANTS.md):
//   AB1 Glass Split  the speaker glides from full screen into a glass portrait frame (left); a window with the B-roll
//                    (a clip, or the generated "steps" scene: small steps climbed to a goal) floats in on the right
//   AB2 Bubble Cut   the B-roll takes the full screen (slow push that lands on 1×); the speaker shrinks into a round
//                    bubble whose ring breathes with his voice; an optional giant word slams in on its word
//   AB3 Punch Type   full-screen speaker, big kinetic captions; on each key word a punch-in zoom (settles back to 1×)
//                    and an icon sticker; earlier options get struck through when he says the next one
//   AB4 Card Fan     the speaker in a frame; a "then" card, then one card per list item fans out on its word (each
//                    with a generated scene or a clip)
//   AB5 Data Stage   the speaker steps back (blurred, picture-in-picture); a stage card counts up his numbers as bars,
//                    a morphing shape breathes behind it
// Shared: word-timed captions (active word gold), the style badge (optional), flash + whoosh between sections, an
// intro title and an outro list. Capture-safe and seek-safe (§0i State): no animated CSS filters; every tween is a
// fromTo with both ends or a set at 0; per-frame things (captions, ring, count-ups) run in ONE onUpdate from data.
// Verified 2026-10-30 on projects/abroll-variants-demo: render renders/abroll-variants-demo/2026-10-30_0429 (78.4 s,
// QC 9/9 PASS), read every 0.5 s; preflight 0 errors after the fixes it found (left/top → x/y, skyline start state).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const f3 = (x) => Number(x).toFixed(3);
const bn = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
export const VNAME = { AB1: "গ্লাস স্প্লিট", AB2: "বাবল কাট", AB3: "পাঞ্চ টাইপ", AB4: "কার্ড ফ্যান", AB5: "ডেটা স্টেজ" };
const VDESC = { AB1: "মুখ কাচের ফ্রেমে, পাশে B-roll জানালা", AB2: "B-roll পুরো পর্দায়, মুখ গোল বাবলে", AB3: "বড় লেখা, জুম-ধাক্কা, স্টিকার", AB4: "তালিকার কার্ড পাখার মতো খোলে", AB5: "সংখ্যা গুনে ওঠে, বার-চার্ট" };

// a time inside a section: number = source s, "word" / "word#n" = when the speaker says it → FINAL seconds
export function timeIn(seg, x, what) {
  if (typeof x === "number") { if (x < seg.from - 0.01 || x > seg.to + 0.01) throw new Error(`${what}: ${x} is outside section ${seg.i + 1} (${seg.from}–${seg.to})`); return seg.map(x); }
  const [key, nth = "1"] = String(x).split("#");
  const norm = (t) => t.replace(/[।,!?:;.'"“”‘’()]/g, "");
  // words joined by a dash ("চলছে—প্রাচীনকালে") are searched part by part; a part's time is its share of the word
  const hits = seg.words.flatMap((w) => { const parts = norm(w.text).split(/[—–-]+/).filter(Boolean); return parts.map((p, k) => ({ p, t: w.start + (w.end - w.start) * (k / parts.length) })); })
    .filter((h) => h.p.startsWith(norm(key)));
  const w = hits[Number(nth) - 1];
  if (!w) throw new Error(`${what}: the word '${x}' is not said in section ${seg.i + 1} (${seg.variant}, ${seg.from}–${seg.to}); its words: ${seg.words.map((q) => q.text).join(" ")}`);
  return seg.map(w.t);
}

// ── icons (Lucide-style strokes, drawn as SVG: pack fonts have no ✓/arrows, §0d.11) ──
const ICON = {
  star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>',
  sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/>',
  shelter: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  none: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  down: '<path d="M12 4v16"/><path d="m6 14 6 6 6-6"/>',
  up: '<path d="M12 20V4"/><path d="m6 10 6-6 6 6"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15v4"/><path d="M21 17h-4"/>',
};
const icon = (n, size, color, sw = 2.2) => { if (!ICON[n]) throw new Error(`icon '${n}' unknown; have: ${Object.keys(ICON).join(", ")}`); return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`; };

// ── generated B-roll scenes (SVG, sized by the box they fill) ──
function sceneTemple(w, h, id) {
  const cols = Array.from({ length: 6 }, (_, k) => `<rect x="${w * 0.24 + k * w * 0.1}" y="${h * 0.42}" width="${w * 0.045}" height="${h * 0.34}" rx="${w * 0.01}" fill="url(#${id}c)"/>`).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1608"/><stop offset="0.6" stop-color="#8A4A1C"/><stop offset="1" stop-color="#D99248"/></linearGradient>
<linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F3D9A8"/><stop offset="0.5" stop-color="#FFF1D2"/><stop offset="1" stop-color="#C9A26A"/></linearGradient>
<radialGradient id="${id}g"><stop offset="0" stop-color="#FFE3A3" stop-opacity="0.95"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id}s)"/><circle class="sun" cx="${w * 0.76}" cy="${h * 0.3}" r="${h * 0.22}" fill="url(#${id}g)"/>
<path d="M${w * 0.19} ${h * 0.42} L${w * 0.5} ${h * 0.22} L${w * 0.81} ${h * 0.42} Z" fill="url(#${id}c)"/>${cols}
<rect x="${w * 0.16}" y="${h * 0.76}" width="${w * 0.68}" height="${h * 0.04}" fill="#E8C690"/><rect x="${w * 0.12}" y="${h * 0.8}" width="${w * 0.76}" height="${h * 0.05}" fill="#C79A5E"/>
<rect y="${h * 0.85}" width="${w}" height="${h * 0.15}" fill="#5A3416"/></svg>`;
}
function sceneSkyline(w, h, id) {
  const hs = [0.42, 0.68, 0.55, 0.86, 0.6, 0.74, 0.5, 0.64, 0.46], bw = w / hs.length;
  const b = hs.map((v, k) => {
    const x = k * bw + bw * 0.08, bh = h * 0.8 * v, y = h * 0.92 - bh;
    const win = Array.from({ length: Math.floor(bh / 26) }, (_, r) => [0, 1].map((c) => ((k + r + c) % 3 ? `<rect x="${x + bw * (0.18 + c * 0.38)}" y="${y + 12 + r * 26}" width="${bw * 0.22}" height="10" fill="#FFD27A" opacity="0.85"/>` : "")).join("")).join("");
    return `<g class="bld" style="transform-origin:${x + bw * 0.42}px ${h * 0.92}px"><rect x="${x}" y="${y}" width="${bw * 0.84}" height="${bh}" rx="4" fill="url(#${id}b)"/>${win}</g>`;
  }).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060B1C"/><stop offset="1" stop-color="#16244A"/></linearGradient>
<linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B5BA5"/><stop offset="1" stop-color="#1A2850"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id}n)"/>${b}<rect y="${h * 0.92}" width="${w}" height="${h * 0.08}" fill="#0B1226"/></svg>`;
}
function sceneNeural(w, h, id) {
  const L = [3, 5, 3], pts = L.map((n, c) => Array.from({ length: n }, (_, r) => [w * (0.2 + c * 0.3), h * ((r + 1) / (n + 1))]));
  let links = ""; for (let c = 0; c + 1 < L.length; c++) for (const a of pts[c]) for (const b of pts[c + 1]) links += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#6EDCFF" stroke-opacity="0.28" stroke-width="2"/>`;
  const nodes = pts.flatMap((col, c) => col.map((p, r) => `<circle class="nd nd${c}" cx="${p[0]}" cy="${p[1]}" r="${h * 0.045}" fill="#0B1830" stroke="#8CEBFF" stroke-width="3"/>`)).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><radialGradient id="${id}r"><stop offset="0" stop-color="#1B2D5C"/><stop offset="1" stop-color="#070B18"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id}r)"/>${links}${nodes}</svg>`;
}
function sceneIcon(name) {
  return (w, h, id) => { const s = Math.min(w, h) * 0.5; if (!ICON[name]) throw new Error(`scene icon:${name}: icon unknown; have: ${Object.keys(ICON).join(", ")}`);
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><radialGradient id="${id}i"><stop offset="0" stop-color="#1D3A6E"/><stop offset="1" stop-color="#070B18"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#${id}i)"/><g transform="translate(${(w - s) / 2} ${(h - s) / 2}) scale(${s / 24})" fill="none" stroke="#8CEBFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</g></svg>`; };
}
const SCENES = { temple: sceneTemple, skyline: sceneSkyline, neural: sceneNeural };
// a card / then scene by name: temple · skyline · neural · icon:<icon name>
const scene = (n) => { if (String(n).startsWith("icon:")) return sceneIcon(n.slice(5)); if (!SCENES[n]) throw new Error(`scene '${n}' unknown; have: ${Object.keys(SCENES).join(", ")}, icon:<${Object.keys(ICON).join("|")}>`); return SCENES[n]; };

export function buildPage(P, { write = true } = {}) {
  const { D, FPS, segs, TOTAL, INTRO, OUTRO } = P;
  const js = [], cues = [], warn = [], css = [], segHTML = [], beats = [];
  const beat = (t, text) => beats.push([+f3(t), text]);
  const cue = (t, file, vol, d) => cues.push({ t: +f3(Math.max(0, t)), file, vol, ...(d ? { dur: +f3(d) } : {}) });
  const vars = (o) => Object.entries(o).map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`).join(", ");
  const fromTo = (sel, a, b, t, d, ease = "power2.out") => js.push(`  tl.fromTo("${sel}", { ${vars(a)} }, { ${vars(b)}, duration: ${f3(d)}, ease: "${ease}", immediateRender: false }, ${f3(t)});`);
  const set = (sel, o, t) => js.push(`  tl.set("${sel}", { ${vars(o)} }, ${f3(t)});`);
  const show = (sel, t, from = { y: 30 }, d = 0.5, ease = "back.out(1.6)") => fromTo(sel, { autoAlpha: 0, ...from }, { autoAlpha: 1, ...Object.fromEntries(Object.keys(from).map((k) => [k, k === "scale" ? 1 : 0])) }, t, d, ease);
  const hide = (sel, t, to = { y: -20 }, d = 0.35) => fromTo(sel, { autoAlpha: 1, ...Object.fromEntries(Object.keys(to).map((k) => [k, k === "scale" ? 1 : 0])) }, { autoAlpha: 0, ...to }, t, d, "power2.in");
  const FULL = { x: 0, y: 0, width: 1920, height: 1080, borderRadius: 0 }; // x/y: transforms glide; left/top snap to whole pixels
  const [fx, fy] = D.aroll.face ?? [50, 32]; // the face's place in the frame, % (portrait and bubble crops center on it)
  let track = 2; const nextTrack = () => track++;

  // the voice envelope (AB2's ring): per frame 0..1 from speech.wav (flat until the voice step has run)
  const ENV = new Array(Math.ceil(TOTAL * FPS) + 1).fill(0);
  const sw = path.join(P.media, "speech.wav");
  if (existsSync(sw)) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-i", sw, "-ac", "1", "-ar", String(FPS * 400), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length >> 2);
    let e = 0;
    for (let k = 0; k < ENV.length; k++) {
      let s = 0; for (let j = k * 400; j < Math.min(x.length, (k + 1) * 400); j++) s += x[j] * x[j];
      const v = Math.max(0, Math.min(1, (10 * Math.log10(s / 400 + 1e-12) + 42) / 30));
      e = v > e ? e + (v - e) * 0.6 : e + (v - e) * 0.18; ENV[k] = Math.round(e * 99);
    }
  } else warn.push("speech.wav not built yet: the AB2 ring will not move (run the voice step before page)");

  // ── captions: chunks of words per section, active word gold ──
  const CAP = [];
  for (const s of segs) {
    const big = s.variant === "AB3", maxW = big ? 3 : 4, maxC = big ? 16 : 26, out = [];
    let cur = [];
    s.words.forEach((w, k) => {
      cur.push(w);
      const text = cur.map((q) => q.text).join(" "), nx = s.words[k + 1];
      if (cur.length >= maxW || text.length >= maxC || /[।?!,—]$/.test(w.text) || !nx || nx.start - w.end > 0.6) { out.push(cur); cur = []; }
    });
    out.forEach((ch, k) => {
      const a = s.map(ch[0].start), nx = out[k + 1], lastEnd = s.map(ch.at(-1).end), nxs = nx ? s.map(nx[0].start) : 0;
      const b = Math.min(s.end - 0.02, nx ? (nxs - lastEnd > 1.2 ? lastEnd + 0.4 : nxs) : lastEnd + 0.5);
      CAP.push([+f3(a), +f3(b), `c${s.variant.slice(2)}`, ch.map((w) => [+f3(s.map(w.start)), w.text])]);
    });
  }
  const COUNT = []; // [t0, d, to, decimals, element id]

  // ════════ INTRO ════════
  const I = D.intro ?? {};
  let introHTML = "";
  if (INTRO > 0) {
    introHTML = `<div id="intro">${I.video ? `<video id="iv" src="assets/media/intro_bg.mp4" muted playsinline data-start="0" data-duration="${f3(INTRO)}" data-track-index="${nextTrack()}"></video>` : ""}<div class="dim"></div>
        <div id="ik">${I.kicker ?? ""}</div><div id="it">${I.title ?? ""}</div><div id="is">${I.sub ?? ""}</div></div>`;
    beat(0, `শিরোনাম: "${I.title ?? ""}"${I.video ? ", পেছনে চলমান ক্লিপ" : ""}`);
    show("#ik", 0.15, { y: 24 }, 0.5, "power3.out");
    show("#it", 0.35, { scale: 0.86 }, 0.6, "back.out(1.7)"); cue(0.35, "sparkle", 0.4);
    show("#is", 0.85, { y: 24 }, 0.5, "power3.out");
    if (I.video) fromTo("#iv", { scale: 1.1 }, { scale: 1 }, 0, INTRO, "none");
    hide("#intro", INTRO - 0.3, { scale: 0.94 }, 0.3);
    cue(INTRO - 0.3, "whoosh-cinematic", 0.45);
  }

  // ════════ SECTIONS ════════
  const aroll = (s, extra = "") => `<div class="aw" id="aw${s.i}"${extra}><video id="av${s.i}" src="assets/media/a${s.i}.mp4" muted playsinline data-start="${f3(s.at)}" data-duration="${f3(s.len)}" data-track-index="1"></video></div>`;
  const into = (s, rect, t, d = 1.0) => fromTo(`#aw${s.i}`, { ...FULL, boxShadow: "0px 0px 0px 0px rgba(110,220,255,0)" }, { ...rect, boxShadow: "0px 0px 0px 3px rgba(150,230,255,0.75)" }, t, d, "power3.inOut");
  const T = (s, x, what) => timeIn(s, x, `section ${s.i + 1} ${what}`);

  const V = {
    AB1(s) { // glass split
      const w = s.window ?? {}, t0 = s.at;
      into(s, { x: 150, y: 110, width: 540, height: 880, borderRadius: 32 }, t0 + 0.8);
      let inner;
      if (w.video) inner = `<video id="wv${s.i}" src="assets/media/w${s.i}.mp4" muted playsinline data-start="${f3(s.at)}" data-duration="${f3(s.len)}" data-track-index="${nextTrack()}"></video>`;
      else { // the generated "steps" scene: small steps climbed one by one to a goal
        const N = 7, X = (k) => 90 + k * 120, Y = (k) => 470 - k * 52;
        let d = `M${X(0)} ${Y(0)}`; for (let k = 0; k < N; k++) { d += ` H${X(k) + 120}`; if (k + 1 < N) d += ` V${Y(k + 1)}`; }
        const fill = `${d} V${Y(0) + 70} H${X(0)} Z`;
        inner = `<svg class="steps" width="1000" height="562" viewBox="0 0 1000 562"><defs><linearGradient id="sg${s.i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D3A6E" stop-opacity="0.9"/><stop offset="1" stop-color="#0A1020" stop-opacity="0.2"/></linearGradient></defs>
            <rect width="1000" height="562" fill="#08101F"/><path d="${fill}" fill="url(#sg${s.i})"/><path id="sp${s.i}" d="${d}" fill="none" stroke="#6EDCFF" stroke-width="6" stroke-linejoin="round" stroke-dasharray="1300" stroke-dashoffset="1300"/>
            <g id="fl${s.i}" style="transform-origin:${X(N - 1) + 70}px ${Y(N - 1)}px"><path d="M${X(N - 1) + 70} ${Y(N - 1)} V${Y(N - 1) - 110}" stroke="#F7D27A" stroke-width="6" stroke-linecap="round"/><path d="M${X(N - 1) + 73} ${Y(N - 1) - 110} L${X(N - 1) + 150} ${Y(N - 1) - 88} L${X(N - 1) + 73} ${Y(N - 1) - 64} Z" fill="#F7D27A"/></g></svg>
            <div class="slab lo">${w.low ?? "ছোট স্টেপ"}</div><div class="slab hi" id="hi${s.i}">${w.high ?? "বড় লক্ষ্য"}</div><div class="dot" id="dt${s.i}"></div>`;
        const tA = T(s, w.start, "window.start"), tB = T(s, w.goal, "window.goal");
        fromTo(`#sp${s.i}`, { strokeDashoffset: 1300 }, { strokeDashoffset: 0 }, t0 + 1.9, 1.3, "power2.inOut");
        const pos = (k) => ({ x: X(k) + 60 - 18, y: Y(k) - 40 });
        set(`#dt${s.i}`, { ...pos(0), autoAlpha: 0 }, 0);
        show(`#dt${s.i}`, Math.min(tA, t0 + 3.2) - 0.3, { scale: 0.3 }, 0.3);
        for (let k = 1; k < N; k++) {
          const t = tA + (tB - tA) * (k / (N - 1)) - 0.3;
          fromTo(`#dt${s.i}`, pos(k - 1), pos(k), t, 0.3, "power2.out"); cue(t, "click-soft", 0.28);
        }
        set(`#fl${s.i}`, { scale: 0 }, 0);
        fromTo(`#fl${s.i}`, { scale: 0 }, { scale: 1 }, tB + 0.05, 0.5, "back.out(2.2)"); cue(tB, "success", 0.42);
        beat(tA - 0.3, "জানালায় আলোর বিন্দু একেক ধাপ করে সিঁড়ি বেয়ে ওঠে"); beat(tB, `চূড়ায় পতাকা ওঠে, "${w.high ?? "বড় লক্ষ্য"}" সোনালি হয়`);
        fromTo(`#hi${s.i}`, { color: "#EAF2FF" }, { color: "#F7D27A" }, tB + 0.1, 0.4, "none");
      }
      css.push(`#wn${s.i} { left: 780px; top: 190px; width: 1000px; height: 562px; }`);
      show(`#wn${s.i}`, t0 + 1.3, { x: 140 }, 0.7, "back.out(1.3)"); cue(t0 + 1.3, "whoosh-short", 0.3);
      beat(t0, "কথা-বলা মুখ পুরো পর্দা থেকে বাঁয়ে কাচের খাড়া ফ্রেমে সরে যায়, ডানে B-roll জানালা ভেসে আসে" + (w.title ? `: "${w.title}"` : ""));
      if (w.title) { show(`#wt${s.i}`, t0 + 1.7, { y: 20 }, 0.45, "power3.out"); }
      return `${aroll(s)}
        <div class="win" id="wn${s.i}">${inner}</div>${w.title ? `<div class="wtitle" id="wt${s.i}">${icon("sparkles", 34, "#F7D27A")}<span>${w.title}</span></div>` : ""}`;
    },

    AB2(s) { // bubble cut
      const t0 = s.at, b = s.broll?.[0];
      if (!b) throw new Error(`section ${s.i + 1} (AB2): needs broll: [{ video }]`);
      const tr = nextTrack();
      fromTo(`#bv${s.i}`, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1.04 }, t0 + 0.45, 0.6, "power2.out");
      fromTo(`#bv${s.i}`, { scale: 1.04 }, { scale: 1 }, t0 + 1.05, Math.max(1, s.len - 1.3), "sine.out");
      cue(t0 + 0.4, "whoosh-cinematic", 0.4);
      into(s, { x: 70, y: 650, width: 360, height: 360, borderRadius: 180 }, t0 + 0.5, 1.0);
      set("#vring", { left: 56, top: 636, autoAlpha: 0 }, t0);
      fromTo("#vring", { autoAlpha: 0 }, { autoAlpha: 1 }, t0 + 1.3, 0.3, "none");
      set("#vring", { autoAlpha: 0 }, s.end);
      cue(t0 + 1.4, "pop", 0.32);
      beat(t0, "B-roll ক্লিপ পুরো পর্দায় (ধীরে এগোয়), মুখ নিচে-বাঁয়ে গোল বাবলে, রিং গলার সাথে দোলে");
      let slam = "";
      if (s.slam) {
        const ts = T(s, s.slam.at, "slam.at");
        slam = `<div class="slam" id="sl${s.i}"><div class="big metal">${s.slam.text}</div>${s.slam.sub ? `<div class="sub">${s.slam.sub}</div>` : ""}</div>`;
        fromTo(`#sl${s.i} .big`, { scale: 1.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, ts - 0.2, 0.22, "power4.in");
        [[12, -7], [-8, 5], [4, -2], [0, 0]].forEach(([x, y], k) => js.push(`  tl.to("#sl${s.i}", { x: ${x}, y: ${y}, duration: ${f3(1 / FPS)}, ease: "none" }, ${f3(ts + 0.02 + k / FPS * 2)});`));
        set(`#sl${s.i}`, { autoAlpha: 1 }, 0);
        if (s.slam.sub) show(`#sl${s.i} .sub`, ts + 0.35, { y: 20 }, 0.4, "power3.out");
        fromTo(`#sl${s.i} .big`, { backgroundPosition: "160% 0%, 0% 0%" }, { backgroundPosition: "-60% 0%, 0% 0%" }, ts + 0.5, 1.2, "sine.inOut");
        cue(ts - 0.05, "glitch-1", 0.4); cue(ts, "impact-bass-2", 0.5);
        beat(ts - 0.2, `বিশাল সোনালি "${s.slam.text}" ধাক্কা দিয়ে আসে, ঝাঁকুনি`);
      }
      return `<video class="bfull" id="bv${s.i}" src="assets/media/b${s.i}_0.mp4" muted playsinline data-start="${f3(s.at)}" data-duration="${f3(s.len)}" data-track-index="${tr}"></video>
        <div class="shade"></div>${slam}
        ${aroll(s)}`;
    },

    AB3(s) { // punch type
      const slots = [{ left: 90, top: 150 }, { left: 1410, top: 150 }, { left: 90, top: 430 }, { left: 1410, top: 430 }];
      beat(s.at, "পুরো পর্দায় মুখ, বড় বড় চলমান ক্যাপশন");
      let html = `${aroll(s)}<div class="band"></div>`;
      const P3 = s.punch ?? [];
      const ts = P3.map((p, k) => T(s, p.at, `punch[${k}].at`));
      P3.forEach((p, k) => {
        const t = ts[k], id = `pk${s.i}_${k}`, sl = slots[k % slots.length];
        set(`#aw${s.i}`, { scale: 1.13, transformOrigin: `${fx}% ${fy + 6}%` }, t);
        fromTo(`#aw${s.i}`, { scale: 1.13 }, { scale: 1 }, t + 1 / FPS, 1.7, "power2.out");
        css.push(`#${id} { left: ${sl.left}px; top: ${sl.top}px; }`);
        html += `<div class="stk" id="${id}">${icon(p.icon ?? "star", 92, p.strike === false ? "#F7D27A" : "#8CEBFF", 2.3)}<span>${p.text ?? p.at}</span>${p.strike ? `<i class="strike"></i>` : ""}</div>`;
        fromTo(`#${id}`, { autoAlpha: 0, scale: 1.5, rotation: k % 2 ? 8 : -8 }, { autoAlpha: 1, scale: 1, rotation: k % 2 ? 3 : -3 }, t - 0.04, 0.26, "power4.in");
        cue(t, "impact-bass-1", 0.45, 0.6);
        beat(t, `মুখে জুম-ধাক্কা, স্টিকার "${p.text ?? p.at}"${p.strike && ts[k + 1] ? " (পরের প্রশ্নে লাল দাগে কাটা)" : ""}`);
        if (p.strike && ts[k + 1]) { fromTo(`#${id} .strike`, { scaleX: 0 }, { scaleX: 1 }, ts[k + 1] - 0.15, 0.25, "power2.out"); fromTo(`#${id}`, { opacity: 1 }, { opacity: 0.55 }, ts[k + 1] - 0.1, 0.3, "none"); }
      });
      return html;
    },

    AB4(s) { // card fan
      const t0 = s.at;
      into(s, { x: 110, y: 150, width: 500, height: 780, borderRadius: 30 }, t0 + 0.8);
      beat(t0, "মুখ পুরো পর্দা থেকে বাঁয়ে ফ্রেমে সরে যায়");
      let html = aroll(s);
      if (s.heading) {
        const th = T(s, s.heading.at, "heading.at");
        html += `<div class="chip" id="hd${s.i}">${icon("bolt", 40, "#F7D27A", 2.4)}<span>${s.heading.text}</span></div>`;
        show(`#hd${s.i}`, th, { y: -30 }, 0.45, "back.out(1.8)"); cue(th, "pop", 0.4); beat(th, `শিরোনাম-চিপ "${s.heading.text}"`);
      }
      if (s.then) {
        const a = T(s, s.then.at, "then.at"), b = T(s, s.then.out, "then.out");
        html += `<div class="then" id="th${s.i}"><div class="tm">${scene(s.then.scene ?? "temple")(980, 430, `tm${s.i}`)}</div><div class="tl">${s.then.label}</div></div>`;
        show(`#th${s.i}`, a, { x: 120 }, 0.6, "power3.out"); cue(a, "whoosh-short", 0.32); beat(a, `বড় কার্ড: "${s.then.label}"`);
        fromTo(`#th${s.i} .sun`, { scale: 0.85 }, { scale: 1.12 }, a, Math.max(0.5, b - a), "sine.inOut");
        hide(`#th${s.i}`, b - 0.1, { x: -160 }, 0.4); cue(b - 0.1, "whoosh-short", 0.28);
      }
      const N = (s.cards ?? []).length, pos = [[690, 280, -6], [1075, 250, 0], [1460, 280, 6]];
      (s.cards ?? []).forEach((c, k) => {
        const t = T(s, c.at, `cards[${k}].at`), id = `cd${s.i}_${k}`, [l, tp, r] = pos[k] ?? [700 + k * 350, 260, 0];
        css.push(`#${id} { left: ${l}px; top: ${tp}px; }`);
        const media = c.video ? `<video id="cv${s.i}_${k}" src="assets/media/c${s.i}_${k}.mp4" muted playsinline data-start="${f3(s.at)}" data-duration="${f3(s.len)}" data-track-index="${nextTrack()}"></video>` : scene(c.scene ?? "neural")(360, 300, `cs${s.i}${k}`);
        html += `<div class="card" id="${id}"><div class="cm">${media}</div><div class="cl">${c.label}</div></div>`;
        fromTo(`#${id}`, { autoAlpha: 0, y: 240, rotation: r * 3, scale: 0.7 }, { autoAlpha: 1, y: 0, rotation: r, scale: 1 }, t - 0.1, 0.6, "back.out(1.5)");
        cue(t - 0.05, "pop", 0.45); beat(t - 0.1, `কার্ড পাখার মতো খোলে: "${c.label}"${c.video ? " (ভেতরে ক্লিপ)" : ""}`);
        if (c.scene === "skyline") set(`#${id} .bld`, { scaleY: 0 }, 0);
        if (c.scene === "skyline") fromTo(`#${id} .bld`, { scaleY: 0 }, { scaleY: 1 }, t + 0.2, 0.9, "power3.out");
        if ((c.scene ?? "neural") === "neural" && !c.video) for (let q = t + 0.3, n = 0; q < s.end - 0.3; q += 0.5, n++) fromTo(`#${id} .nd${n % 3}`, { fill: "#8CEBFF" }, { fill: "#0B1830" }, q, 0.45, "power1.out");
        if (k) fromTo(`#cd${s.i}_${k - 1}`, { boxShadow: "0px 0px 0px 3px rgba(247,210,122,0.95), 0px 24px 60px 0px rgba(0,0,0,0.6)" }, { boxShadow: "0px 0px 0px 2px rgba(120,230,255,0.55), 0px 24px 60px 0px rgba(0,0,0,0.6)" }, t, 0.3, "none");
      });
      if (N && N !== 3) warn.push(`section ${s.i + 1} (AB4): ${N} cards — the fan is laid out for 3`);
      return html;
    },

    AB5(s) { // data stage
      const t0 = s.at, tr = nextTrack();
      fromTo(`#bb${s.i}`, { autoAlpha: 0 }, { autoAlpha: 1 }, t0 + 0.5, 0.6, "none");
      into(s, { x: 1430, y: 60, width: 420, height: 236, borderRadius: 22 }, t0 + 0.5, 1.0);
      show(`#st${s.i}`, t0 + 1.0, { y: 60 }, 0.6, "power3.out"); cue(t0 + 1.0, "whoosh-short", 0.32);
      beat(t0, "মুখ ঝাপসা হয়ে পেছনে, ছোট ছবি উপরে-ডানে; সামনে মঞ্চ, পেছনে আকার বদলানো নকশা");
      // the morphing shape: three blobs, one after another, all through the section
      const BL = ["M700,90 C960,60 1240,200 1260,420 C1280,650 1010,800 720,780 C420,760 150,640 160,420 C170,200 440,120 700,90 Z",
        "M720,60 C1010,110 1300,260 1220,480 C1150,700 900,820 640,790 C380,760 120,600 190,380 C260,160 470,20 720,60 Z",
        "M680,110 C930,40 1180,140 1280,360 C1380,600 1080,780 760,800 C470,820 210,700 140,470 C80,240 430,180 680,110 Z"];
      for (let k = 0, q = t0 + 1.0; q < s.end - 0.5; k++, q += 3.2) js.push(`  tl.fromTo("#bl${s.i}", { morphSVG: "${BL[k % 3]}" }, { morphSVG: "${BL[(k + 1) % 3]}", duration: 3.2, ease: "sine.inOut", immediateRender: false }, ${f3(q)});`);
      let html = `<video class="bfull" id="bb${s.i}" src="assets/media/a${s.i}_blur.mp4" muted playsinline data-start="${f3(s.at)}" data-duration="${f3(s.len)}" data-track-index="${tr}"></video>
        <svg class="blob" width="1400" height="860" viewBox="0 0 1400 860"><defs><linearGradient id="bg${s.i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FD0FF" stop-opacity="0.38"/><stop offset="1" stop-color="#9B5CFF" stop-opacity="0.30"/></linearGradient></defs><path id="bl${s.i}" d="${BL[0]}" fill="url(#bg${s.i})"/></svg>
        ${aroll(s)}<div class="stage" id="st${s.i}">`;
      const firstBar = (s.bars ?? []).length ? T(s, s.bars[0].at, "bars[0].at") : s.end;
      if (s.title) {
        html += `<div class="stitle" id="stt${s.i}">${s.title}</div>`;
        show(`#stt${s.i}`, t0 + 1.25, { scale: 0.9 }, 0.5, "back.out(1.6)");
        hide(`#stt${s.i}`, firstBar - 0.45, { scale: 0.9 }, 0.3);
        beat(t0 + 1.25, `মঞ্চে বড় শিরোনাম: "${s.title}"`);
      }
      if (s.year) { const ty = T(s, s.year.at, "year.at"); html += `<div class="year" id="yr${s.i}">${s.year.text}</div>`; show(`#yr${s.i}`, ty, { scale: 0.6 }, 0.45, "back.out(2)"); cue(ty, "pop", 0.4); }
      const bars = s.bars ?? [], mx = Math.max(...bars.map((b) => b.value), 1);
      bars.forEach((b, k) => {
        const t = T(s, b.at, `bars[${k}].at`), id = `br${s.i}_${k}`, h = Math.round(360 * b.value / mx), col = b.color === "red" ? "#FF5A69" : "#5BE39B";
        const dec = String(b.value).includes(".") ? 1 : 0, x = 170 + k * 440;
        css.push(`#${id} { left: ${x}px; } #${id} .bar { height: ${h}px; background: linear-gradient(180deg, ${col} 0%, rgba(0,0,0,0) 140%); box-shadow: 0px 0px 40px 4px ${col}55; } #${id} .num { color: ${col}; bottom: ${h + 150}px; }`);
        html += `<div class="bcol" id="${id}"><div class="num"><b id="n${id}">${bn((0).toFixed(dec))}</b><span>${b.unit ?? ""}</span></div><div class="bar"></div><div class="blab">${icon(b.color === "red" ? "down" : "up", 40, col, 3)}<span>${b.label}</span></div></div>`;
        show(`#${id}`, t - 0.25, { y: 30 }, 0.35, "power3.out");
        fromTo(`#${id} .bar`, { scaleY: 0 }, { scaleY: 1 }, t, 1.1, "power3.out");
        COUNT.push([+f3(t), 1.1, b.value, dec, `n${id}`]); beat(t, `বার-চার্ট বাড়ে, সংখ্যা গুনে ওঠে: ${bn(b.value)} ${b.unit ?? ""} ${b.label}`);
        cue(t, "typing", 0.22, 1.1); if (k === bars.length - 1) cue(t + 1.1, "success", 0.36);
      });
      if (s.source) { html += `<div class="src" id="sr${s.i}">${s.source}</div>`; show(`#sr${s.i}`, t0 + 1.6, { y: 10 }, 0.4, "power2.out"); }
      return `${html}</div>`;
    },
  };

  segs.forEach((s, k) => {
    if (!V[s.variant]) throw new Error(`section ${s.i + 1}: variant '${s.variant}' unknown`);
    set(`#s${s.i}`, { autoAlpha: 1 }, s.at); set(`#s${s.i}`, { autoAlpha: 0 }, s.end);
    if (D.badges !== false) set("#bdt", { textContent: `${s.variant} · ${VNAME[s.variant]}` }, s.at);
    if (k) { // between sections: a flash and a whoosh; the new shot settles from 1.05 to 1
      fromTo("#flash", { autoAlpha: 0 }, { autoAlpha: 0.5 }, s.at - 0.04, 0.06, "none");
      fromTo("#flash", { autoAlpha: 0.5 }, { autoAlpha: 0 }, s.at + 0.04, 0.3, "power2.out");
      cue(s.at - 0.12, "whoosh-short", 0.34);
    }
    if (s.variant !== "AB3" && s.variant !== "AB5") fromTo(`#aw${s.i}`, { scale: 1.05 }, { scale: 1 }, s.at, 0.6, "power2.out");
    segHTML.push(`      <div class="seg" id="s${s.i}">${V[s.variant](s)}</div>`);
  });
  if (D.badges !== false) { show("#badge", segs[0].at + 0.3, { x: -30 }, 0.4, "power3.out"); hide("#badge", segs.at(-1).end - 0.3, { x: -30 }, 0.3); }

  // ════════ OUTRO: the style list ════════
  let outroHTML = "";
  if (OUTRO > 0) {
    const o0 = segs.at(-1).end, list = [...new Set(segs.map((s) => s.variant))].sort();
    outroHTML = `<div id="outro"><div id="ot">${D.outro?.title ?? "স্টাইলগুলোর নাম"}</div>${list.map((v, k) => `<div class="orow" id="or${k}"><b>${v}</b><span>${VNAME[v]}</span><em>${VDESC[v]}</em></div>`).join("")}</div>`;
    set("#outro", { autoAlpha: 1 }, o0); beat(o0, `শেষ কার্ড: "${D.outro?.title ?? "স্টাইলগুলোর নাম"}", স্টাইলের নামগুলো একে একে`);
    show("#ot", o0, { y: 24 }, 0.35, "power3.out"); cue(o0, "chime", 0.32);
    list.forEach((_, k) => { show(`#or${k}`, o0 + 0.25 + k * 0.16, { x: 60 }, 0.4, "power3.out"); cue(o0 + 0.25 + k * 0.16, "click-soft", 0.22); });
    fromTo("#fade", { autoAlpha: 0 }, { autoAlpha: 1 }, TOTAL - 0.55, 0.5, "sine.in");
  }
  fromTo("#grid", { y: 0 }, { y: -96 }, 0, TOTAL, "none");

  const PAGE_CSS = `
@font-face { font-family: "Hind Siliguri"; font-weight: 600; src: url("assets/fonts/HindSiliguri-SemiBold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Hind Siliguri"; font-weight: 700; src: url("assets/fonts/HindSiliguri-Bold.ttf") format("truetype"); font-display: block; }
@font-face { font-family: "Baloo Da 2"; font-weight: 400 800; src: url("assets/fonts/BalooDa2-Variable.ttf") format("truetype"); font-display: block; }
body { margin: 0; background: #07090E; }
#root { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #07090E; font-family: "Hind Siliguri", "Baloo Da 2", sans-serif; color: #EAF2FF; }
#bg { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 80% at 60% 40%, #13203A 0%, #0A0F1C 55%, #06080D 100%); }
#grid { position: absolute; left: -40px; top: -40px; width: 2000px; height: 1300px;
  background-image: linear-gradient(rgba(90,200,255,0.06) 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, rgba(90,200,255,0.06) 1px, rgba(0,0,0,0) 1px); background-size: 96px 96px; }
.seg { position: absolute; inset: 0; visibility: hidden; opacity: 0; }
.aw { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; z-index: 3; }
.aw video { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; object-position: ${fx}% ${fy}%; }
.bfull { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; z-index: 1; visibility: hidden; opacity: 0; }
.shade { position: absolute; left: 0; right: 0; bottom: 0; height: 420px; z-index: 2; background: linear-gradient(180deg, rgba(4,6,12,0) 0%, rgba(4,6,12,0.82) 100%); }
/* AB1 */
.win { position: absolute; z-index: 2; border-radius: 24px; overflow: hidden; visibility: hidden; opacity: 0; background: #08101F;
  box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.6), 0px 0px 60px 6px rgba(60,200,255,0.22), 0px 40px 90px 0px rgba(0,0,0,0.7); }
.win video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.wtitle { position: absolute; left: 780px; top: 108px; z-index: 4; display: flex; align-items: center; gap: 14px; padding: 10px 26px 10px 18px; border-radius: 999px; visibility: hidden; opacity: 0;
  background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(246,214,138,0.9), 0px 0px 30px 4px rgba(240,180,70,0.3); font-size: 38px; font-weight: 700; color: #FFF3D6; }
.steps { position: absolute; left: 0; top: 0; }
.slab { position: absolute; font-size: 34px; font-weight: 700; color: #EAF2FF; }
.slab.lo { left: 70px; top: 490px; } .slab.hi { right: 170px; top: 40px; }
.dot { position: absolute; left: 0; top: 0; width: 36px; height: 36px; border-radius: 18px; background: #F7D27A; box-shadow: 0px 0px 24px 8px rgba(247,210,122,0.75); visibility: hidden; opacity: 0; }
/* AB2 */
#vring { position: absolute; z-index: 40; width: 380px; height: 380px; margin: 0px; border-radius: 50%; box-sizing: border-box; border: 5px solid rgba(140,235,255,0.95);
  box-shadow: 0px 0px 36px 6px rgba(80,210,255,0.55), inset 0px 0px 20px 2px rgba(80,210,255,0.4); visibility: hidden; opacity: 0; }
.slam { position: absolute; left: 820px; top: 230px; width: 1000px; z-index: 4; text-align: center; visibility: hidden; opacity: 0; }
.slam .big { font-family: "Baloo Da 2", sans-serif; font-weight: 800; font-size: 260px; line-height: 1; visibility: hidden; opacity: 0; }
.slam .sub { font-family: "Baloo Da 2", sans-serif; font-weight: 700; font-size: 40px; line-height: 1.2; color: #EAF2FF; margin-top: 130px; visibility: hidden; opacity: 0; }
.metal { color: #E9C46A; -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  background-image: linear-gradient(100deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 58%), linear-gradient(180deg, #FFF5D6 0%, #F7DA8E 22%, #DDAD4F 45%, #A9762A 58%, #E2B456 74%, #FFF2C6 92%);
  background-size: 260% 100%, 100% 100%; background-position: 160% 0%, 0% 0%; background-repeat: no-repeat; }
/* AB3 */
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 460px; z-index: 4; background: linear-gradient(180deg, rgba(4,6,12,0) 0%, rgba(4,6,12,0.85) 100%); }
.stk { position: absolute; z-index: 5; display: flex; align-items: center; gap: 20px; padding: 22px 34px 22px 24px; border-radius: 28px; visibility: hidden; opacity: 0;
  background: rgba(8,12,20,0.92); box-shadow: 0px 0px 0px 3px rgba(140,235,255,0.9), 0px 0px 40px 4px rgba(60,200,255,0.35), 0px 20px 50px 0px rgba(0,0,0,0.6); }
.stk span { font-size: 64px; font-weight: 700; color: #FFFFFF; line-height: 1.2; white-space: nowrap; }
.stk .strike { position: absolute; left: 18px; right: 18px; top: 50%; height: 9px; margin-top: -4px; border-radius: 5px; background: #FF5A69; box-shadow: 0px 0px 18px 2px rgba(255,90,105,0.7); transform-origin: 0% 50%; transform: scaleX(0); }
/* AB4 */
.chip { position: absolute; left: 700px; top: 92px; z-index: 4; display: flex; align-items: center; gap: 14px; padding: 12px 30px 12px 20px; border-radius: 999px; visibility: hidden; opacity: 0;
  background: rgba(8,12,20,0.94); box-shadow: 0px 0px 0px 2px rgba(246,214,138,0.9), 0px 0px 30px 4px rgba(240,180,70,0.3); font-size: 44px; font-weight: 700; color: #FFF3D6; }
.then { position: absolute; left: 760px; top: 220px; width: 980px; z-index: 2; border-radius: 26px; overflow: hidden; visibility: hidden; opacity: 0; background: #120B05;
  box-shadow: 0px 0px 0px 2px rgba(246,214,138,0.8), 0px 40px 90px 0px rgba(0,0,0,0.7); }
.then .tm { position: relative; height: 430px; } .then .tl { padding: 18px 30px; font-size: 44px; font-weight: 700; color: #FFF3D6; background: #1A1108; }
.then .sun { transform-box: fill-box; transform-origin: 50% 50%; }
.card { position: absolute; width: 360px; z-index: 3; border-radius: 24px; overflow: hidden; visibility: hidden; opacity: 0; background: #0B1220;
  box-shadow: 0px 0px 0px 3px rgba(247,210,122,0.95), 0px 24px 60px 0px rgba(0,0,0,0.6); }
.card .cm { position: relative; width: 360px; height: 300px; overflow: hidden; } .card .cm video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card .cl { padding: 22px 20px 26px; text-align: center; font-size: 48px; font-weight: 700; color: #FFFFFF; }
/* AB5 */
.blob { position: absolute; left: 120px; top: 110px; z-index: 2; }
.stage { position: absolute; left: 220px; top: 180px; width: 1160px; height: 700px; z-index: 4; border-radius: 30px; visibility: hidden; opacity: 0;
  background: linear-gradient(160deg, rgba(16,24,42,0.9) 0%, rgba(7,10,18,0.92) 100%); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.55), 0px 40px 100px 0px rgba(0,0,0,0.7); }
.year { position: absolute; left: 44px; top: 36px; padding: 8px 26px; border-radius: 999px; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-size: 46px; font-weight: 700; color: #1A1205;
  background: linear-gradient(180deg, #F9DE98 0%, #D9A443 100%); visibility: hidden; opacity: 0; }
.bcol { position: absolute; bottom: 0px; width: 380px; height: 700px; visibility: hidden; opacity: 0; }
.bcol .bar { position: absolute; left: 90px; width: 200px; bottom: 150px; border-radius: 14px 14px 4px 4px; transform-origin: 50% 100%; transform: scaleY(0); }
.bcol .num { position: absolute; left: 0px; width: 380px; text-align: center; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; line-height: 1; }
.bcol .num b { font-size: 104px; font-weight: 800; } .bcol .num span { font-family: "Hind Siliguri", sans-serif; font-size: 44px; font-weight: 700; margin-left: 10px; }
.bcol .blab { position: absolute; left: 0px; width: 380px; bottom: 82px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 40px; font-weight: 700; color: #EAF2FF; }
.stitle { position: absolute; left: 40px; right: 40px; top: 250px; text-align: center; text-wrap: balance; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-size: 78px; font-weight: 700; line-height: 1.25; color: #FFFFFF; visibility: hidden; opacity: 0; }
.src { position: absolute; left: 44px; bottom: 26px; font-size: 28px; font-weight: 600; color: #A9B8D3; visibility: hidden; opacity: 0; }
/* captions */
#cap { position: absolute; z-index: 50; text-align: center; text-wrap: balance; font-weight: 700; line-height: 1.32; color: #FFFFFF; text-shadow: 0px 0px 4px rgba(0,0,0,0.95), 0px 0px 10px rgba(0,0,0,0.85), 0px 4px 18px rgba(0,0,0,0.8); }
#cap .w { color: rgba(255,255,255,0.93); } #cap .w.on { color: #F7D27A; }
#cap.c1 { left: 780px; width: 1000px; top: 785px; font-size: 54px; }
#cap.c2 { left: 480px; width: 1360px; top: 860px; font-size: 56px; }
#cap.c3 { left: 160px; width: 1600px; top: 780px; font-size: 84px; line-height: 1.22; }
#cap.c4 { left: 700px; width: 1080px; top: 840px; font-size: 52px; }
#cap.c5 { left: 220px; width: 1160px; top: 905px; font-size: 50px; }
#cap.off { visibility: hidden; }
#badge { position: absolute; left: 48px; top: 36px; z-index: 60; display: flex; align-items: center; gap: 12px; padding: 8px 24px 8px 16px; border-radius: 999px; visibility: hidden; opacity: 0;
  background: rgba(8,12,20,0.88); box-shadow: 0px 0px 0px 2px rgba(140,235,255,0.75); font-size: 30px; font-weight: 700; color: #EAF2FF; }
#badge i { width: 14px; height: 14px; border-radius: 7px; background: #F7D27A; box-shadow: 0px 0px 12px 3px rgba(247,210,122,0.7); }
#flash { position: absolute; inset: 0; z-index: 70; background: #FFFFFF; visibility: hidden; opacity: 0; }
/* intro / outro */
#intro { position: absolute; inset: 0; z-index: 30; background: #05070C; }
#intro video { position: absolute; inset: 0; width: 1920px; height: 1080px; object-fit: cover; }
#intro .dim { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(5,7,12,0.35) 0%, rgba(5,7,12,0.85) 100%); }
#ik, #it, #is { position: absolute; left: 0; width: 1920px; text-align: center; visibility: hidden; opacity: 0; }
#ik { top: 268px; line-height: 1.2; font-family: "Baloo Da 2", sans-serif; font-size: 40px; font-weight: 700; color: #8CEBFF; }
#it { top: 390px; font-family: "Baloo Da 2", "Hind Siliguri", sans-serif; font-size: 132px; font-weight: 700; color: #FFFFFF; line-height: 1.15; text-shadow: 0px 6px 40px rgba(0,0,0,0.6); }
#is { top: 600px; font-size: 44px; font-weight: 600; color: #FFF3D6; }
#outro { position: absolute; inset: 0; z-index: 30; background: radial-gradient(ellipse 80% 80% at 50% 45%, #13203A 0%, #05070C 100%); visibility: hidden; opacity: 0; }
#ot { position: absolute; left: 0; width: 1920px; top: 150px; text-align: center; font-size: 72px; font-weight: 700; color: #FFFFFF; visibility: hidden; opacity: 0; }
.orow { position: absolute; left: 400px; width: 1120px; box-sizing: border-box; display: flex; align-items: center; gap: 26px; padding: 14px 30px; border-radius: 20px; visibility: hidden; opacity: 0;
  background: rgba(12,18,32,0.9); box-shadow: 0px 0px 0px 2px rgba(120,230,255,0.5); }
.orow b { font-family: "Baloo Da 2", sans-serif; font-size: 44px; font-weight: 800; color: #F7D27A; } .orow span { font-size: 48px; font-weight: 700; color: #FFFFFF; } .orow em { font-style: normal; margin-left: auto; font-size: 32px; font-weight: 600; color: #A9B8D3; }
${[0, 1, 2, 3, 4, 5].map((k) => `#or${k} { top: ${300 + k * 118}px; }`).join(" ")}
#fade { position: absolute; inset: 0; z-index: 80; background: #000000; visibility: hidden; opacity: 0; }
${css.join("\n")}
`;

  const html = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${D.title ?? "A-roll + B-roll"}</title>
    <script src="assets/js/gsap/gsap.min.js"></script>
    <script src="assets/js/gsap/MorphSVGPlugin.min.js"></script>
    <style>${PAGE_CSS}    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-fps="${FPS}" data-duration="${f3(TOTAL)}">
      <div id="bg"></div>
      <div id="grid" data-layout-allow-overflow></div>
${segHTML.join("\n")}
      <div id="vring"></div>
      ${introHTML}
      <div id="cap" class="off"></div>
      <div id="badge"><i></i><span id="bdt"></span></div>
      ${outroHTML}
      <div id="flash"></div>
      <div id="fade"></div>
      <audio id="mix" src="assets/media/mix.wav" data-start="0" data-duration="${f3(TOTAL)}" data-track-index="30" data-volume="1"></audio>
    </div>
    <script>
      gsap.registerPlugin(MorphSVGPlugin);
      const tl = gsap.timeline({ paused: true });
      // per-frame layer: captions (chunk + active word), the AB2 voice ring, the AB5 count-ups
      const FPS = ${FPS};
      const CAP = ${JSON.stringify(CAP)};
      const ENV = "${ENV.map((v) => String(v).padStart(2, "0")).join("")}";
      const COUNT = ${JSON.stringify(COUNT)};
      const cap = document.getElementById("cap"), ring = document.getElementById("vring");
      const BN = (s) => String(s).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
      let curCap = -2;
      tl.to({}, { duration: ${f3(TOTAL)}, ease: "none", onUpdate() {
        const t = this.time();
        let k = -1; for (let i = 0; i < CAP.length; i++) if (t >= CAP[i][0] && t < CAP[i][1]) { k = i; break; }
        if (k !== curCap) {
          curCap = k;
          if (k < 0) { cap.className = "off"; cap.innerHTML = ""; }
          else { cap.className = CAP[k][2]; cap.innerHTML = CAP[k][3].map((w) => '<span class="w">' + w[1] + "</span>").join(" "); }
        }
        if (k >= 0) { const sp = cap.children; for (let j = 0; j < sp.length; j++) sp[j].className = t >= CAP[k][3][j][0] ? "w on" : "w"; }
        const f = Math.min(ENV.length / 2 - 1, Math.max(0, Math.round(t * FPS))), e = Number(ENV.substr(f * 2, 2)) / 99;
        ring.style.transform = "scale(" + (1 + 0.1 * e).toFixed(3) + ")";
        ring.style.borderColor = "rgba(140,235,255," + (0.55 + 0.45 * e).toFixed(2) + ")";
        for (const [t0, d, to, dec, id] of COUNT) {
          const u = Math.min(1, Math.max(0, (t - t0) / d)), v = to * (1 - Math.pow(1 - u, 3));
          document.getElementById(id).textContent = BN(v.toFixed(dec));
        }
      } }, 0);
${js.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
  const noId = [...html.matchAll(/<video(?![^>]*\bid=)[^>]*>/g)].map((m) => m[0].slice(0, 90));
  if (noId.length) throw new Error(`video without an id (it would render frozen): ${noId.join(" | ")}`);
  cues.sort((a, b) => a.t - b.t);
  if (write) {
    writeFileSync(path.join(P.dir, "index.html"), html);
    mkdirSync(P.build, { recursive: true });
    writeFileSync(path.join(P.build, "cues.json"), JSON.stringify(cues));
  }
  console.log(`${write ? "✓ index.html" : "✓ page (dry run)"} (${f3(TOTAL)} s) · ${segs.length} sections · ${CAP.length} caption chunks · ${cues.length} sound cues`);
  for (const w of warn) console.log(`  ! ${w}`);
  return { html, cues, warn, beats: beats.sort((a, b) => a[0] - b[0]), caps: CAP };
}
