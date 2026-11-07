/* studio.js — the motion runtime of the Motion Studio kit (tools/studio), v1, 2026-11-07.
 *
 * Copied into every piece as assets/js/studio.js by `node tools/studio/new-piece.mjs`. Load order in <head>:
 *   gsap.min.js → CustomEase → SplitText → DrawSVGPlugin → MorphSVGPlugin → MotionPathPlugin → studio.js
 *
 * Usage (end of <body>):
 *   const S = Studio.init({ id: "main" });          // reads data-width/height/duration/fps from the root
 *   S.lines("#title", 0.4);                          // masked line reveal
 *   S.camera("#cam", [[0, {z:-260, rx:8}], [2.4, {z:0, rx:0}, "settle"]]);
 *   S.done();                                        // registers window.__timelines[id] + runs the guards
 *
 * EVERYTHING HERE IS SEEK-SAFE. HyperFrames renders by seeking the paused timeline frame by frame (forwards,
 * backwards, any order), so every visible state is a pure function of the timeline time:
 *   - entrances are fromTo tweens that start hidden (never from() — immediateRender breaks under seeking);
 *   - pings, flashes, typing, counters, grain and cursors are computed per frame in ONE onUpdate (S.everyFrame);
 *   - randomness comes from a seeded PRNG (S.rnd), never Math.random / Date.
 *
 * The numbers (eases, springs, stagger caps, durations) come from docs/business/research/R3-trends-craft.md
 * (Material 3, Carbon, Fluent tokens) and docs/broll-motion-spec.md (the house spring k170/c14).
 */
(function (global) {
  "use strict";
  const g = global.gsap;
  if (!g) throw new Error("studio.js: load gsap.min.js before studio.js");
  const plug = ["CustomEase", "SplitText", "DrawSVGPlugin", "MorphSVGPlugin", "MotionPathPlugin"].map((n) => global[n]).filter(Boolean);
  g.registerPlugin(...plug);

  // ---------------------------------------------------------------- 1. Eases (the studio's motion vocabulary)
  // Named so a brief can say "settle" instead of a bezier. Pick per role, never the same ease on everything.
  const CE = global.CustomEase;
  if (CE) {
    CE.create("settle", "M0,0 C0.16,1 0.3,1 1,1"); // expo-out: 50 % of the move in 11 % of the time, silky landing. Hero moves, camera.
    CE.create("enter", "M0,0 C0.05,0.7 0.1,1 1,1"); // Material 3 emphasized-decelerate. Entrances.
    CE.create("move", "M0,0 C0.2,0 0,1 1,1"); // Material 3 standard. Moving between two resting places.
    CE.create("exit", "M0,0 C0.3,0 1,1 1,1"); // accelerate. Exits; keep them ≤ 0.7 × the entrance duration.
    CE.create("glide", "M0,0 C0.65,0 0.35,1 1,1"); // symmetric in-out. Slow drifts, loops, parallax breathing.
    CE.create("snap", "M0,0 C0.7,0 0.1,1 1,1"); // anticipation then a hard landing: whip moves, punch-ins.
  }
  // Analytic damped springs. ζ = damping ratio, ω = natural frequency (rad/s), D = the nominal tween length the
  // shape is drawn for (a different duration time-scales it). The tiny linear correction lands exactly on 1.
  function springFn(zeta, omega, D) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const x = (t) => 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
    const end = x(D);
    return (p) => (p <= 0 ? 0 : p >= 1 ? 1 : x(p * D) + (1 - end) * p);
  }
  g.registerEase("spring", springFn(0.537, 13.04, 0.8));
  // The HyperFrames runtime re-registers the bare name "spring" as LINEAR after load (its spring(x) syntax), so every
  // studio tween uses "houseSpring" — same curve, a name the runtime never touches (found by builder A3, 2026-11-07).
  g.registerEase("houseSpring", springFn(0.537, 13.04, 0.8)); // house spring k170 c14: 13.5 % overshoot, settled ≈ 0.57 s
  g.registerEase("springSoft", springFn(0.82, 12, 0.8)); // Material 3 "settled" (ζ 0.8–0.9): cards, panels, glass
  g.registerEase("springPop", springFn(0.45, 16, 0.7)); // playful, ~20 % overshoot — ONE element per scene at most

  // ---------------------------------------------------------------- 2. Seeded randomness
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => u * u * (3 - 2 * u);

  // ---------------------------------------------------------------- 3. The studio object
  function init(opts) {
    opts = opts || {};
    const id = opts.id || "main";
    const root = document.querySelector(`[data-composition-id="${id}"]`);
    if (!root) throw new Error(`studio.js: no root with data-composition-id="${id}"`);
    const W = +root.dataset.width || 1920;
    const H = +root.dataset.height || 1080;
    const DUR = +root.dataset.duration || 10;
    const FPS = +(opts.fps || root.dataset.fps || 30);
    const tl = g.timeline({ paused: true });
    const frameFns = [];
    const notes = []; // guard findings, printed by done()
    const S = { g, tl, root, id, W, H, DUR, FPS, notes, clamp, lerp, smooth, mulberry32 };
    S.rnd = mulberry32(opts.seed || 20261107);
    S.$ = (sel, ctx) => (typeof sel === "string" ? (ctx || root).querySelector(sel) : sel);
    S.$$ = (sel, ctx) => (typeof sel === "string" ? Array.from((ctx || root).querySelectorAll(sel)) : [].concat(sel));
    S.everyFrame = (fn) => { frameFns.push(fn); };
    S.f = (n) => n / FPS; // frames → seconds (stagger in frames reads better: 5–10 frames per item)
    tl.eventCallback("onUpdate", () => { const t = tl.time(); for (const fn of frameFns) fn(t); });

    const need = (el, what) => { if (!el) throw new Error(`studio.js ${what}: element not found`); return el; };

    // fromTo that starts hidden — the only safe entrance under seeking.
    S.in = (sel, t, from, to) => {
      const els = S.$$(sel);
      if (!els.length) throw new Error(`studio.js in(): nothing matches ${sel}`);
      tl.fromTo(els, Object.assign({ opacity: 0 }, from), Object.assign({ opacity: 1, duration: 0.6, ease: "enter" }, to), t);
      return S;
    };
    S.out = (sel, t, to) => {
      tl.to(S.$$(sel), Object.assign({ opacity: 0, duration: 0.3, ease: "exit" }, to), t);
      return S;
    };

    // ---- Text. SplitText with masks: lines/words rise out of a clipped row (the "premium" reveal).
    // Bengali: never letter-spacing; split by words or lines only (chars break conjuncts).
    const split = (sel, type, mask) => new global.SplitText(need(S.$(sel), "split " + sel), { type, mask, linesClass: "st-line", wordsClass: "st-word", charsClass: "st-char", aria: "none" });
    S.lines = (sel, t, o) => {
      o = Object.assign({ dur: 0.9, stagger: S.f(5), ease: "settle", y: 105 }, o);
      const sp = split(sel, "lines", "lines");
      tl.fromTo(sp.lines, { yPercent: o.y, opacity: 0 }, { yPercent: 0, opacity: 1, duration: o.dur, ease: o.ease, stagger: o.stagger }, t);
      return sp;
    };
    S.words = (sel, t, o) => {
      o = Object.assign({ dur: 0.7, stagger: S.f(3), ease: "enter", y: 40, blur: 10 }, o);
      const sp = split(sel, "words", o.mask ? "words" : undefined);
      tl.fromTo(sp.words, { y: o.y, opacity: 0, filter: `blur(${o.blur}px)` }, { y: 0, opacity: 1, filter: "blur(0px)", duration: o.dur, ease: o.ease, stagger: o.stagger }, t);
      return sp;
    };
    S.chars = (sel, t, o) => {
      o = Object.assign({ dur: 0.6, stagger: S.f(1.2), ease: "houseSpring", y: 0.9 }, o);
      const sp = split(sel, "words,chars", "chars");
      tl.fromTo(sp.chars, { yPercent: o.y * 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: o.dur, ease: o.ease, stagger: o.stagger }, t);
      return sp;
    };

    // ---- Typing: the visible substring is a function of t (deterministic), with a blinking caret.
    // S.type("#prompt", 1.2, "Summarise this thread", { cps: 26, caret: true })
    // o.preroll: how long the caret blinks BEFORE typing starts (0 when lines type one after another, or the caret
    // sits on a placeholder — two carets at once / content_overlap, found on AI1 2026-11-07).
    S.type = (sel, t, text, o) => {
      o = Object.assign({ cps: 24, caret: true, hold: 99, preroll: 0.6 }, o);
      const el = need(S.$(sel), "type " + sel);
      el.textContent = "";
      const caret = o.caret ? document.createElement("span") : null;
      if (caret) { caret.className = "st-caret"; caret.textContent = "▍"; }
      const span = document.createElement("span");
      el.appendChild(span); if (caret) el.appendChild(caret);
      const end = t + text.length / o.cps;
      S.everyFrame((now) => {
        const n = now < t ? 0 : Math.min(text.length, Math.floor((now - t) * o.cps + 1e-6));
        if (span.textContent.length !== n) span.textContent = text.slice(0, n);
        if (caret) {
          const typing = now >= t && now < end;
          const blinkOn = Math.floor(now * 2.2) % 2 === 0;
          caret.style.opacity = now < t - o.preroll || now > end + o.hold ? 0 : typing || blinkOn ? 1 : 0;
        }
      });
      return end; // when the last character lands (chain the next beat on it)
    };

    // ---- Counters with tabular numerals. S.count("#arr", 1.0, 0, 48.2, { dur: 1.4, prefix: "$", suffix: "M", decimals: 1 })
    S.count = (sel, t, from, to, o) => {
      o = Object.assign({ dur: 1.4, decimals: 0, prefix: "", suffix: "", ease: "settle", sep: "," }, o);
      const el = need(S.$(sel), "count " + sel);
      const ease = g.parseEase(o.ease);
      const fmt = (v) => {
        const s = Math.abs(v).toFixed(o.decimals);
        const [i, d] = s.split(".");
        const ii = o.sep ? i.replace(/\B(?=(\d{3})+(?!\d))/g, o.sep) : i;
        return (v < 0 ? "−" : "") + o.prefix + ii + (d ? "." + d : "") + o.suffix;
      };
      el.style.fontVariantNumeric = "tabular-nums";
      // the number lives in its own span, so a sweep/burst child on the same element survives (SA1 report)
      let num = el.querySelector(":scope > .st-num");
      if (!num) { num = document.createElement("span"); num.className = "st-num"; el.textContent = ""; el.appendChild(num); }
      S.everyFrame((now) => {
        const u = clamp((now - t) / o.dur, 0, 1);
        const v = from + (to - from) * ease(u);
        const txt = fmt(u >= 1 ? to : v);
        if (num.textContent !== txt) num.textContent = txt;
      });
      num.textContent = fmt(from);
      return t + o.dur;
    };

    // ---- Bursts: rings, flashes, pings. Scale/opacity are functions of t and invisible outside the window,
    // so a backward seek can never show a stale "from" state (the MG1 latent bug). Element must be absolute.
    S.burst = (sel, t, o) => {
      o = Object.assign({ dur: 0.6, s0: 0.4, s1: 1.8, o0: 0.9, ease: "settle" }, o);
      const el = need(S.$(sel), "burst " + sel);
      const ease = g.parseEase(o.ease);
      el.style.opacity = 0; el.setAttribute("data-layout-ignore", "");
      S.everyFrame((now) => {
        const u = (now - t) / o.dur;
        if (u < 0 || u > 1) { el.style.opacity = 0; return; }
        const e = ease(u);
        el.style.transform = `translate(-50%,-50%) scale(${lerp(o.s0, o.s1, e)})`;
        el.style.opacity = String(o.o0 * (1 - e));
      });
    };

    // ---- Light sweep: a soft diagonal highlight band crossing an element once (needs .sweep child, see studio.css)
    // Per-frame like burst(): invisible outside its window, so seeking backwards never leaves a band on screen.
    // The band lives in its OWN clipping wrapper (inset 0, overflow hidden, the host's radius), so the host needs no
    // overflow:hidden and its text is never "clipped" (hyperframes clipped_text on a button, found on AI1 2026-11-07).
    // o.color: the band's light — default white in overlay blend (dark looks); on light looks pass e.g.
    // { color: "rgba(47,107,255,.28)", blend: "normal" }. The host must be position:relative/absolute.
    S.sweep = (sel, t, o) => {
      o = Object.assign({ dur: 1.1, ease: "move", color: null, blend: null }, o);
      const ease = g.parseEase(o.ease);
      S.$$(sel).forEach((host) => {
        let clip = host.querySelector(":scope > .sweep-clip");
        if (!clip) {
          clip = document.createElement("span");
          clip.className = "sweep-clip";
          clip.setAttribute("data-layout-ignore", ""); clip.setAttribute("data-design-ignore", "");
          Object.assign(clip.style, { position: "absolute", inset: "0", overflow: "hidden", borderRadius: "inherit", pointerEvents: "none", display: "block" });
          host.appendChild(clip);
        }
        let band = clip.querySelector(":scope > .sweep");
        if (!band) {
          band = document.createElement("i"); band.className = "sweep";
          if (o.color) band.style.background = `linear-gradient(100deg, transparent 0%, transparent 22%, ${o.color} 50%, transparent 78%, transparent 100%)`;
          if (o.blend) band.style.mixBlendMode = o.blend;
          clip.appendChild(band);
        }
        S.everyFrame((now) => {
          const u = (now - t) / o.dur;
          if (u < 0 || u > 1) { band.style.opacity = 0; return; }
          band.style.opacity = 1;
          band.style.transform = `translateX(${lerp(-160, 260, ease(u)).toFixed(2)}%) skewX(-18deg)`;
        });
      });
    };

    // ---- SVG line drawing (DrawSVGPlugin)
    S.draw = (sel, t, o) => {
      o = Object.assign({ dur: 1.2, ease: "settle", from: "0%", stagger: 0 }, o);
      tl.fromTo(S.$$(sel), { drawSVG: o.from }, { drawSVG: "100%", duration: o.dur, ease: o.ease, stagger: o.stagger }, t);
    };

    // ---- 3D camera on a wrapper. keys: [[t, {x,y,z,rx,ry,rz,scale}, ease?], …]; the first key is the start state.
    // Rule §0d.1: a camera that holds must hold at identity (scale 1, no rotation, z 0) → done() checks the last key.
    S.camera = (sel, keys, o) => {
      o = Object.assign({ perspective: 1600, mustEndAtRest: true }, o);
      const cam = need(S.$(sel), "camera " + sel);
      const parent = cam.parentElement;
      parent.style.perspective = o.perspective + "px";
      parent.style.perspectiveOrigin = "50% 50%";
      cam.style.transformStyle = "preserve-3d";
      const map = (k) => ({ x: k.x || 0, y: k.y || 0, z: k.z || 0, rotationX: k.rx || 0, rotationY: k.ry || 0, rotationZ: k.rz || 0, scale: k.scale == null ? 1 : k.scale });
      g.set(cam, map(keys[0][1]));
      for (let i = 1; i < keys.length; i++) {
        const [t0] = keys[i - 1];
        const [t1, k, ease] = keys[i];
        tl.fromTo(cam, map(keys[i - 1][1]), Object.assign(map(k), { duration: Math.max(0.001, t1 - t0), ease: ease || "settle", immediateRender: false }), t0);
      }
      const last = keys[keys.length - 1][1];
      const atRest = (last.x || 0) === 0 && (last.y || 0) === 0 && (last.z || 0) === 0 && !last.rx && !last.ry && !last.rz && (last.scale == null || last.scale === 1);
      if (o.mustEndAtRest && !atRest) notes.push(`camera ${sel}: last key is not at rest (x/y/z 0, rotations 0, scale 1) — §0d.1. Pass {mustEndAtRest:false} only for a deliberate moving end.`);
    };

    // ---- Parallax breathing: a slow sine drift (never linear), amplitude in px, applied per frame on a wrapper.
    S.drift = (sel, o) => {
      o = Object.assign({ ax: 0, ay: 10, period: 6, phase: 0, t0: 0, t1: DUR }, o);
      const el = need(S.$(sel), "drift " + sel);
      S.everyFrame((now) => {
        const u = clamp((now - o.t0) / Math.max(0.001, o.t1 - o.t0), 0, 1);
        const w = Math.sin(((now - o.t0) / o.period) * Math.PI * 2 + o.phase) * smooth(Math.min(1, u * 4));
        el.style.translate = `${(o.ax * w).toFixed(2)}px ${(o.ay * w).toFixed(2)}px`;
      });
    };

    // ---- Cursor: a macOS-style arrow that travels a path and clicks. path: [[t, x, y], …] in root px;
    // clicks: [t, …]. Moves use "move" (between two resting points); a click = press 0.86 + ring burst.
    S.cursor = (o) => {
      o = Object.assign({ path: [], clicks: [], color: "#fff", size: 34, ring: "var(--accent)", z: 60, id: "cursor" }, o);
      const wrap = document.createElement("div");
      wrap.className = "st-cursor"; wrap.id = o.id; wrap.style.zIndex = o.z;
      wrap.setAttribute("data-layout-ignore", ""); wrap.setAttribute("data-design-ignore", "");
      wrap.innerHTML = `<svg width="${o.size}" height="${o.size}" viewBox="0 0 32 32"><path d="M6 3 L6 25 L11.5 19.6 L15.2 28 L19 26.4 L15.4 18.2 L23 18.2 Z" fill="${o.color}" stroke="rgba(0,0,0,.55)" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
      const ring = document.createElement("div");
      ring.className = "st-click-ring"; ring.style.borderColor = o.ring; ring.style.zIndex = o.z - 1;
      ring.setAttribute("data-layout-ignore", ""); ring.setAttribute("data-design-ignore", "");
      root.appendChild(ring); root.appendChild(wrap);
      const P = o.path.slice().sort((a, b) => a[0] - b[0]);
      const ease = g.parseEase("move");
      const posAt = (now) => {
        if (!P.length) return [W / 2, H / 2];
        if (now <= P[0][0]) return [P[0][1], P[0][2]];
        for (let i = 1; i < P.length; i++) {
          if (now <= P[i][0]) {
            const [ta, xa, ya] = P[i - 1], [tb, xb, yb] = P[i];
            const u = ease(clamp((now - ta) / Math.max(0.001, tb - ta), 0, 1));
            // a slight arc (perpendicular offset) — hands do not move on rulers
            const dx = xb - xa, dy = yb - ya, len = Math.hypot(dx, dy) || 1, bow = Math.sin(u * Math.PI) * Math.min(60, len * 0.08);
            return [lerp(xa, xb, u) + (-dy / len) * bow, lerp(ya, yb, u) + (dx / len) * bow];
          }
        }
        const l = P[P.length - 1]; return [l[1], l[2]];
      };
      const vis = o.visible || [P.length ? P[0][0] - 0.25 : 0, DUR];
      S.everyFrame((now) => {
        const [x, y] = posAt(now);
        let press = 1;
        for (const c of o.clicks) { const u = (now - c) / 0.22; if (u >= 0 && u <= 1) press = Math.min(press, 1 - 0.14 * Math.sin(u * Math.PI)); }
        const a = clamp((now - vis[0]) / 0.25, 0, 1) * clamp((vis[1] - now) / 0.2, 0, 1);
        wrap.style.opacity = String(a);
        wrap.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${press.toFixed(3)})`;
        let ro = 0, rs = 0.3, rx = x, ry = y;
        for (const c of o.clicks) { const u = (now - c) / 0.55; if (u >= 0 && u <= 1) { const e = 1 - Math.pow(1 - u, 3); ro = 0.85 * (1 - e); rs = 0.3 + 1.5 * e; [rx, ry] = posAt(c); } }
        ring.style.opacity = String(ro);
        ring.style.transform = `translate(${(rx + 6).toFixed(1)}px, ${(ry + 5).toFixed(1)}px) translate(-50%,-50%) scale(${rs.toFixed(3)})`;
      });
      return { posAt };
    };

    // ---- Film grain: 6 seeded noise tiles made once; each frame picks a tile + offset (re-seeded per frame,
    // never slid — dithering kills 8-bit banding in dark gradients). opacity ≈ 0.05–0.08 on dark looks.
    S.grain = (o) => {
      o = Object.assign({ opacity: 0.06, size: 220, tiles: 6, blend: "overlay", z: 90 }, o);
      const layer = document.createElement("div");
      layer.className = "st-grain"; layer.style.opacity = o.opacity; layer.style.mixBlendMode = o.blend; layer.style.zIndex = o.z;
      layer.setAttribute("data-design-ignore", ""); layer.setAttribute("data-layout-ignore", "");
      root.appendChild(layer);
      const r = mulberry32(99173);
      const urls = [];
      for (let k = 0; k < o.tiles; k++) {
        const c = document.createElement("canvas"); c.width = c.height = o.size;
        const x = c.getContext("2d"); const img = x.createImageData(o.size, o.size);
        for (let i = 0; i < img.data.length; i += 4) { const v = (r() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
        x.putImageData(img, 0, 0); urls.push(`url(${c.toDataURL("image/png")})`);
      }
      S.everyFrame((now) => {
        const fr = Math.round(now * FPS);
        const rr = mulberry32(fr * 7919 + 13);
        layer.style.backgroundImage = urls[fr % urls.length];
        layer.style.backgroundPosition = `${(rr() * o.size) | 0}px ${(rr() * o.size) | 0}px`;
      });
    };

    S.vignette = (o) => {
      o = Object.assign({ strength: 0.55, z: 89 }, o);
      const v = document.createElement("div");
      v.className = "st-vignette"; v.style.zIndex = o.z; v.setAttribute("data-design-ignore", ""); v.setAttribute("data-layout-ignore", "");
      v.style.background = `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,${o.strength}) 100%)`;
      root.appendChild(v);
    };

    // ---- Hard cut / flash guard: count white flashes so no 1-s window has more than 3 (WCAG 2.3.1)
    const flashes = [];
    S.flash = (sel, t, o) => {
      o = Object.assign({ dur: 0.18, peak: 0.85 }, o);
      flashes.push(t);
      const el = need(S.$(sel), "flash " + sel);
      el.style.opacity = 0; el.setAttribute("data-layout-ignore", "");
      S.everyFrame((now) => {
        const u = (now - t) / o.dur;
        el.style.opacity = u < 0 || u > 1 ? 0 : String(o.peak * (u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75));
      });
    };

    // ---- Register + guards
    S.done = () => {
      for (let i = 0; i < flashes.length; i++) {
        const n = flashes.filter((f) => f >= flashes[i] && f < flashes[i] + 1).length;
        if (n > 3) { notes.push(`more than 3 flashes in 1 s from t=${flashes[i]} (WCAG 2.3.1)`); break; }
      }
      // Linear eases are for continuous motion only; flag visible tweens that use them.
      tl.getChildren(true, true, false).forEach((tw) => {
        const e = tw.vars && tw.vars.ease;
        if ((e === "none" || e === "linear") && !(tw.vars && tw.vars.data === "linear-ok")) notes.push(`linear ease on a tween at ${tw.startTime().toFixed(2)}s — use glide/move, or data:"linear-ok" for truly continuous motion`);
      });
      if (tl.duration() > DUR + 0.001) notes.push(`timeline runs ${tl.duration().toFixed(2)}s, past data-duration ${DUR}s (cut off)`);
      global.__studioNotes = notes.slice();
      if (notes.length) console.warn("[studio] " + notes.join("\n[studio] "));
      for (const fn of frameFns) fn(0);
      global.__timelines[id] = tl;
      return S;
    };
    return S;
  }

  global.Studio = { init, springFn, mulberry32, version: "1.0.0" };
})(window);
