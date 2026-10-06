/* sets.js — backgrounds and props for "খাতা নিজেই কথা বলে" (1080×1920, flat cartoon, outlined like the cast).
 *
 *   HKSet.office({ night, evening })  wall, window (day/night/evening skies stacked, switch by opacity),
 *                                     clock (.set-clock-h/.set-clock-m), fan (.set-fan-blades), notice board,
 *                                     desk (.set-desk-top at y 1180). Night tint: .set-night (opacity 0..1).
 *   HKSet.counter() · HKSet.home() · HKSet.shelfRoom() · HKSet.dream() · HKSet.title(text, sub)
 *   HKProp.<name>(…) → an <svg> string for a prop; mount with HKSet.put(parent, svgString, {x,y,w,cls})
 * Animatable parts carry data-o pivots (SVG units) like the cast; call HKSet.pivots(el) after mounting.
 */
(function () {
  var INK = "#2A1E17";
  var W = 1080, H = 1920;
  function svg(vb, inner, cls) { return '<svg class="' + (cls || "") + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" overflow="visible">' + inner + "</svg>"; }
  function t(x, y, s, w, fill, txt, anchor, extra) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" font-family="&#39;Hind Siliguri&#39;, sans-serif" font-weight="' + w + '" font-size="' + s + '" fill="' + fill + '"' + (extra || "") + ">" + txt + "</text>"; }
  function bt(x, y, s, fill, txt, anchor, extra) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "middle") + '" font-family="&#39;Baloo Da 2&#39;, &#39;Hind Siliguri&#39;, sans-serif" font-weight="700" font-size="' + s + '" fill="' + fill + '"' + (extra || "") + ">" + txt + "</text>"; }
  function star(x, y, r, fill, cls) { return '<path class="' + (cls || "") + '" data-o="' + x + " " + y + '" d="M' + x + " " + (y - r) + " Q" + x + " " + y + " " + (x + r) + " " + y + " Q" + x + " " + y + " " + x + " " + (y + r) + " Q" + x + " " + y + " " + (x - r) + " " + y + " Q" + x + " " + y + " " + x + " " + (y - r) + 'Z" fill="' + fill + '"/>'; }

  // ── the window: three skies stacked; scenes switch with opacity ──────────────────────────────
  var nid = 0;
  function windowBox(x, y, w, h) {
    var cx = x + w / 2, clip = "sky-clip-" + (++nid);
    var s = '<g class="set-window">';
    s += '<rect x="' + (x - 18) + '" y="' + (y - 18) + '" width="' + (w + 36) + '" height="' + (h + 36) + '" rx="10" fill="#8B5A2B" stroke="' + INK + '" stroke-width="7"/>';
    s += '<clipPath id="' + clip + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/></clipPath><g clip-path="url(#' + clip + ')">';
    // day
    s += '<g class="sky-day"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#9ED3F0"/>' +
      '<g class="sky-sun" data-o="' + (x + w * 0.72) + " " + (y + h * 0.3) + '"><circle cx="' + (x + w * 0.72) + '" cy="' + (y + h * 0.3) + '" r="44" fill="#FFD25A" stroke="' + INK + '" stroke-width="5"/></g>' +
      '<g class="sky-cloud"><path d="M' + (x + 30) + " " + (y + h * 0.62) + " q20 -40 60 -24 q24 -36 66 -10 q40 -6 40 34 z" + '" fill="#FFFFFF" stroke="' + INK + '" stroke-width="4"/></g>' +
      '<path d="M' + x + " " + (y + h) + " L" + x + " " + (y + h * 0.78) + " Q" + (x + w * 0.3) + " " + (y + h * 0.68) + " " + (x + w * 0.55) + " " + (y + h * 0.8) + " T" + (x + w) + " " + (y + h * 0.74) + " L" + (x + w) + " " + (y + h) + ' Z" fill="#7FBF6A" stroke="' + INK + '" stroke-width="4"/></g>';
    // evening
    s += '<g class="sky-evening" opacity="0"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#F4A261"/><rect x="' + x + '" y="' + (y + h * 0.5) + '" width="' + w + '" height="' + (h * 0.5) + '" fill="#E76F51" opacity="0.6"/>' +
      '<circle cx="' + (x + w * 0.35) + '" cy="' + (y + h * 0.7) + '" r="50" fill="#FFB347" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M' + x + " " + (y + h) + " L" + x + " " + (y + h * 0.8) + " Q" + (x + w * 0.5) + " " + (y + h * 0.7) + " " + (x + w) + " " + (y + h * 0.82) + " L" + (x + w) + " " + (y + h) + ' Z" fill="#6A4C3B" stroke="' + INK + '" stroke-width="4"/></g>';
    // night
    s += '<g class="sky-night" opacity="0"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#1B2440"/>' +
      '<g class="sky-moon"><circle cx="' + (x + w * 0.7) + '" cy="' + (y + h * 0.32) + '" r="46" fill="#F6E7A8" stroke="' + INK + '" stroke-width="5"/><circle cx="' + (x + w * 0.7 + 22) + '" cy="' + (y + h * 0.32 - 14) + '" r="40" fill="#1B2440"/></g>' +
      star(x + w * 0.2, y + h * 0.22, 10, "#F6E7A8", "sky-star") + star(x + w * 0.42, y + h * 0.5, 7, "#F6E7A8", "sky-star") + star(x + w * 0.15, y + h * 0.62, 6, "#F6E7A8", "sky-star") + star(x + w * 0.88, y + h * 0.62, 8, "#F6E7A8", "sky-star") +
      '<path d="M' + x + " " + (y + h) + " L" + x + " " + (y + h * 0.8) + " Q" + (x + w * 0.4) + " " + (y + h * 0.72) + " " + (x + w) + " " + (y + h * 0.8) + " L" + (x + w) + " " + (y + h) + ' Z" fill="#0F1628" stroke="' + INK + '" stroke-width="4"/></g>';
    s += "</g>";
    s += '<line x1="' + cx + '" y1="' + y + '" x2="' + cx + '" y2="' + (y + h) + '" stroke="#8B5A2B" stroke-width="12"/><line x1="' + x + '" y1="' + (y + h / 2) + '" x2="' + (x + w) + '" y2="' + (y + h / 2) + '" stroke="#8B5A2B" stroke-width="12"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="' + INK + '" stroke-width="5"/>';
    s += '<rect x="' + (x - 30) + '" y="' + (y + h + 14) + '" width="' + (w + 60) + '" height="22" rx="6" fill="#A0703F" stroke="' + INK + '" stroke-width="5"/>';
    return s + "</g>";
  }
  function clock(cx, cy, r, h, m) {
    var s = '<g class="set-clock"><circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 12) + '" fill="#8B5A2B" stroke="' + INK + '" stroke-width="6"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#FFFDF5" stroke="' + INK + '" stroke-width="5"/>';
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2, x1 = cx + Math.sin(a) * (r - 10), y1 = cy - Math.cos(a) * (r - 10), x2 = cx + Math.sin(a) * (r - (i % 3 ? 20 : 28)), y2 = cy - Math.cos(a) * (r - (i % 3 ? 20 : 28));
      s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + INK + '" stroke-width="' + (i % 3 ? 4 : 7) + '" stroke-linecap="round"/>';
    }
    var ha = (h % 12 + m / 60) * 30, ma = m * 6;
    s += '<g class="set-clock-h" data-o="' + cx + " " + cy + '" data-a="' + ha + '"><line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.5) + '" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/></g>';
    s += '<g class="set-clock-m" data-o="' + cx + " " + cy + '" data-a="' + ma + '"><line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - r * 0.78) + '" stroke="#C0392B" stroke-width="7" stroke-linecap="round"/></g>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + INK + '"/></g>';
    return s;
  }
  function fan(cx) {
    return '<g class="set-fan"><rect x="' + (cx - 8) + '" y="-10" width="16" height="96" fill="#7A7F86" stroke="' + INK + '" stroke-width="4"/>' +
      '<g class="set-fan-blades" data-o="' + cx + ' 108"><path d="M' + (cx - 250) + " 102 Q" + cx + " 82 " + (cx + 250) + " 102 Q" + cx + ' 120 ' + (cx - 250) + ' 102 Z" fill="#B9BEC5" stroke="' + INK + '" stroke-width="5"/></g>' +
      '<ellipse cx="' + cx + '" cy="108" rx="44" ry="22" fill="#8E949C" stroke="' + INK + '" stroke-width="5"/></g>';
  }
  function desk(y) {
    var s = '<g class="set-desk"><rect class="set-desk-top" x="-20" y="' + y + '" width="1120" height="62" fill="#A86F3C" stroke="' + INK + '" stroke-width="7"/>';
    s += '<rect x="-20" y="' + (y + 8) + '" width="1120" height="10" fill="#C88A52"/>';
    s += '<rect x="-20" y="' + (y + 62) + '" width="1120" height="' + (H - y - 62 + 20) + '" fill="#7A4B25" stroke="' + INK + '" stroke-width="7"/>';
    for (var i = 0; i < 3; i++) {
      var dx = 60 + i * 340;
      s += '<rect x="' + dx + '" y="' + (y + 110) + '" width="280" height="150" rx="10" fill="#8A5A2F" stroke="' + INK + '" stroke-width="5"/><rect x="' + (dx + 110) + '" y="' + (y + 172) + '" width="60" height="16" rx="8" fill="#D4A535" stroke="' + INK + '" stroke-width="4"/>';
    }
    for (var k = 0; k < 9; k++) s += '<path d="M-20 ' + (y + 330 + k * 48) + ' Q300 ' + (y + 312 + k * 48) + ' 560 ' + (y + 334 + k * 48) + ' T1100 ' + (y + 326 + k * 48) + '" fill="none" stroke="#6A3F1D" stroke-width="4" opacity="0.55"/>';
    s += '<rect x="360" y="' + (y + 450) + '" width="360" height="74" rx="10" fill="#D4A535" stroke="' + INK + '" stroke-width="5"/>' + t(540, y + 500, 40, 700, "#5A3A10", "হিসাব শাখা");
    return s + "</g>";
  }
  function wall(fill, base) {
    return '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + fill + '"/>' +
      '<rect x="0" y="980" width="' + W + '" height="220" fill="' + base + '"/><line x1="0" y1="980" x2="' + W + '" y2="980" stroke="' + INK + '" stroke-width="5" opacity="0.5"/>';
  }

  window.HKSet = {
    W: W, H: H, DESK: 1180,
    office: function (o) {
      o = o || {};
      var s = wall("#F3E3C3", "#E5CFA4");
      s += windowBox(600, 250, 340, 380);
      s += clock(250, 360, 104, o.h === undefined ? 11 : o.h, o.m === undefined ? 4 : o.m);
      s += '<g class="set-board"><rect x="70" y="560" width="380" height="300" rx="10" fill="#C99A63" stroke="' + INK + '" stroke-width="6"/>' +
        '<rect x="96" y="590" width="150" height="190" fill="#FFFDF5" stroke="' + INK + '" stroke-width="4" transform="rotate(-3 171 685)"/>' + t(171, 630, 24, 700, "#8E2A20", "ফি তালিকা", "middle", ' transform="rotate(-3 171 685)"') +
        '<g transform="rotate(-3 171 685)"><line x1="112" y1="660" x2="230" y2="660" stroke="#9AA" stroke-width="4"/><line x1="112" y1="690" x2="218" y2="690" stroke="#9AA" stroke-width="4"/><line x1="112" y1="720" x2="226" y2="720" stroke="#9AA" stroke-width="4"/><line x1="112" y1="750" x2="200" y2="750" stroke="#9AA" stroke-width="4"/></g>' +
        '<rect x="276" y="600" width="150" height="130" fill="#E8F1F8" stroke="' + INK + '" stroke-width="4" transform="rotate(4 351 665)"/>' + t(351, 646, 22, 700, "#2E5AA8", "সেপ্টেম্বর", "middle", ' transform="rotate(4 351 665)"') + t(351, 700, 42, 700, "#C0392B", "৩০", "middle", ' transform="rotate(4 351 665)"') +
        '<circle cx="171" cy="596" r="9" fill="#C0392B"/><circle cx="351" cy="606" r="9" fill="#2E5AA8"/></g>';
      s += fan(540);
      s += '<rect class="set-night" x="0" y="0" width="' + W + '" height="' + H + '" fill="#101A33" opacity="0"/>';
      s += '<rect class="set-evening" x="0" y="0" width="' + W + '" height="' + H + '" fill="#F08A3C" opacity="0"/>';
      s += desk(this.DESK);
      var el = svg("0 0 " + W + " " + H, s, "set set-office");
      return el;
    },
    // the desk alone, as a layer drawn OVER people standing behind it (their legs disappear behind the front)
    deskFront: function () { return svg("0 0 " + W + " " + H, desk(this.DESK), "set set-desk-front"); },
    // the fee counter: a sign over the desk; parents queue in front (scenes mount the people)
    counter: function () {
      var s = '<g class="set-counter-sign"><rect x="300" y="150" width="480" height="110" rx="14" fill="#16603A" stroke="' + INK + '" stroke-width="7"/>' + bt(540, 225, 62, "#FFFFFF", "ফি জমা") +
        '<line x1="360" y1="150" x2="340" y2="40" stroke="' + INK + '" stroke-width="5"/><line x1="720" y1="150" x2="740" y2="40" stroke="' + INK + '" stroke-width="5"/></g>';
      return svg("0 0 " + W + " " + H, s, "set set-counter");
    },
    home: function () {
      var s = wall("#FBE3D4", "#F2C9B0");
      s += '<rect class="set-doorway" x="640" y="380" width="330" height="820" fill="#3A2A20" stroke="' + INK + '" stroke-width="7"/><rect x="640" y="1140" width="330" height="60" fill="#5A4030"/>';
      s += '<g class="set-door" data-o="970 790"><rect x="640" y="380" width="330" height="820" rx="12" fill="#9C6B3F" stroke="' + INK + '" stroke-width="7"/><rect x="680" y="430" width="250" height="300" rx="8" fill="#B27E4F" stroke="' + INK + '" stroke-width="5"/><rect x="680" y="790" width="250" height="330" rx="8" fill="#B27E4F" stroke="' + INK + '" stroke-width="5"/><circle cx="700" cy="800" r="16" fill="#D4A535" stroke="' + INK + '" stroke-width="4"/></g>';
      s += '<g class="set-frame"><rect x="120" y="360" width="300" height="230" rx="8" fill="#FFFDF5" stroke="#8B5A2B" stroke-width="16"/><path d="M140 560 L230 450 L300 520 L340 480 L400 560 Z" fill="#7FBF6A" stroke="' + INK + '" stroke-width="4"/><circle cx="350" cy="420" r="26" fill="#FFD25A" stroke="' + INK + '" stroke-width="4"/></g>';
      s += '<g class="set-plant"><path d="M150 1110 L130 980 M190 1110 L200 950 M230 1110 L260 990" stroke="#3E7D3A" stroke-width="10" stroke-linecap="round"/><ellipse cx="128" cy="975" rx="34" ry="16" fill="#5FA052" stroke="' + INK + '" stroke-width="4" transform="rotate(-30 128 975)"/><ellipse cx="202" cy="944" rx="34" ry="16" fill="#5FA052" stroke="' + INK + '" stroke-width="4" transform="rotate(10 202 944)"/><ellipse cx="262" cy="986" rx="34" ry="16" fill="#5FA052" stroke="' + INK + '" stroke-width="4" transform="rotate(40 262 986)"/><path d="M120 1100 L260 1100 L240 1200 L140 1200 Z" fill="#C0392B" stroke="' + INK + '" stroke-width="6"/></g>';
      s += '<rect x="0" y="1200" width="' + W + '" height="' + (H - 1200) + '" fill="#C8956A" stroke="' + INK + '" stroke-width="7"/>';
      for (var i = 0; i < 7; i++) s += '<line x1="' + (i * 170 - 40) + '" y1="1200" x2="' + (i * 170 - 180) + '" y2="' + H + '" stroke="#B07F57" stroke-width="5"/>';
      return svg("0 0 " + W + " " + H, s, "set set-home");
    },
    shelfRoom: function () {
      var s = wall("#F3E3C3", "#E5CFA4");
      s += '<g class="set-shelf"><rect x="110" y="300" width="860" height="900" rx="12" fill="#8B5A2B" stroke="' + INK + '" stroke-width="8"/>';
      var cols = ["#2E5AA8", "#16603A", "#8E2A20", "#6C5B9E", "#B8860B", "#3B4A5A"];
      for (var r = 0; r < 2; r++) {
        var y = 330 + r * 290;
        s += '<rect x="134" y="' + y + '" width="812" height="250" fill="#6E4523" stroke="' + INK + '" stroke-width="5"/>';
        for (var i = 0; i < 14; i++) {
          var bw = 40 + ((i * 7 + r * 3) % 4) * 6, bh = 170 + ((i * 11 + r * 5) % 5) * 14, bx = 150 + i * 56;
          s += '<rect x="' + bx + '" y="' + (y + 250 - bh) + '" width="' + bw + '" height="' + bh + '" rx="4" fill="' + cols[(i + r * 2) % 6] + '" stroke="' + INK + '" stroke-width="4"/><rect x="' + bx + '" y="' + (y + 250 - bh + 26) + '" width="' + bw + '" height="10" fill="#E4A11B" opacity="0.8"/>';
        }
      }
      s += '<rect x="134" y="910" width="812" height="16" fill="#A0703F" stroke="' + INK + '" stroke-width="5"/></g>';
      s += desk(this.DESK);
      return svg("0 0 " + W + " " + H, s, "set set-shelf");
    },
    dream: function () {
      var s = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#2A2350"/>';
      for (var i = 0; i < 26; i++) s += star((i * 397) % W, (i * 263) % 1150 + 60, 6 + (i % 4) * 3, "#F6E7A8", "dream-star");
      s += '<g class="dream-cloud"><path d="M150 980 Q120 820 280 800 Q320 640 520 680 Q640 560 780 680 Q960 690 940 860 Q1010 990 860 1040 L200 1040 Q110 1030 150 980 Z" fill="#E9E4FF" stroke="' + INK + '" stroke-width="7"/></g>';
      s += '<circle class="dream-b1" cx="260" cy="1120" r="34" fill="#E9E4FF" stroke="' + INK + '" stroke-width="6"/><circle class="dream-b2" cx="200" cy="1200" r="20" fill="#E9E4FF" stroke="' + INK + '" stroke-width="5"/>';
      s += desk(this.DESK + 60);
      return svg("0 0 " + W + " " + H, s, "set set-dream");
    },
    title: function (main, sub) {
      var s = '<g class="title-card"><rect x="70" y="0" width="940" height="330" rx="34" fill="#FFF8EC" stroke="' + INK + '" stroke-width="9"/>' +
        '<rect x="70" y="0" width="64" height="330" rx="20" fill="#8E2A20"/><rect x="104" y="0" width="30" height="330" fill="#8E2A20"/>' +
        bt(572, 158, 76, "#C0392B", main) + t(572, 248, 40, 700, "#6B5442", sub || "") + "</g>";
      return svg("0 0 1080 340", s, "title-svg");
    },
    // put a prop or set into a positioned div; returns the div
    put: function (parent, svgString, o) {
      o = o || {};
      var d = document.createElement("div");
      d.className = "prop " + (o.cls || "");
      if (o.decor !== false && /class="set /.test(svgString)) d.setAttribute("data-layout-ignore", "");   // background art: its text is scenery, not reading text
      d.style.cssText = "position:absolute;left:" + (o.x || 0) + "px;top:" + (o.y || 0) + "px;width:" + (o.w || W) + "px;" + (o.z ? "z-index:" + o.z + ";" : "") + (o.origin ? "transform-origin:" + o.origin + ";" : "");
      d.innerHTML = svgString;
      parent.appendChild(d);
      this.pivots(d);
      if (o.opacity !== undefined) gsap.set(d, { opacity: o.opacity });
      return d;
    },
    // the office as a living set for [0, dur]: fan turning, clock creeping, stars twinkling, lamp glowing.
    // mode: "day" | "evening" | "night"; o.h/o.m = clock time; o.lamp / o.pile add the desk props;
    // o.creep: false when the scene drives the clock hands itself (a time-lapse).
    officeScene: function (parent, tl, dur, o) {
      o = o || {};
      var mode = o.mode || "day";
      var box = this.put(parent, this.office({ h: o.h, m: o.m }), { x: 0, y: 0, w: W });
      var s = box.querySelector("svg"), Q = function (c) { return s.querySelector(c); };
      this.sky(s, mode);
      var spins = Math.max(1, Math.round(dur / 0.18));
      tl.fromTo(Q(".set-fan-blades"), { scaleX: 1 }, { scaleX: -1, duration: 0.18, ease: "sine.inOut", repeat: spins - 1, yoyo: true }, 0);
      var m0 = Number(Q(".set-clock-m").getAttribute("data-a"));
      if (o.creep !== false) tl.fromTo(Q(".set-clock-m"), { rotation: m0 }, { rotation: m0 + dur * 0.4, duration: dur, ease: "none" }, 0);
      Array.prototype.forEach.call(s.querySelectorAll(".sky-star"), function (st, i) {
        var d = 0.9 + i * 0.17;
        tl.fromTo(st, { scale: 1 }, { scale: 0.55, duration: d, ease: "sine.inOut", repeat: Math.max(1, Math.floor(dur / d)) - 1, yoyo: true }, i * 0.2);
      });
      var out = { box: box, svg: s };
      if (o.lamp) {
        out.lamp = this.put(parent, HKProp.lamp(), { x: 20, y: 680, w: 360 });
        gsap.set(out.lamp.querySelector(".lamp-light"), { opacity: mode === "night" ? 0.32 : 0 });
        if (mode === "night") tl.fromTo(out.lamp.querySelector(".lamp-light"), { opacity: 0.32 }, { opacity: 0.24, duration: 1.7, ease: "sine.inOut", repeat: Math.max(1, Math.floor(dur / 1.7)) - 1, yoyo: true }, 0);
      }
      if (o.pile) out.pile = this.put(parent, HKProp.pile(), { x: o.pileX === undefined ? 420 : o.pileX, y: 878, w: 380 });
      return out;
    },
    // switch the window and room light to a time of day (instantly, or tweened at tl/t over d seconds)
    sky: function (s, mode, tl, t, d) {
      var to = { day: [1, 0, 0, 0, 0], evening: [0, 1, 0, 0, 0.18], night: [0, 0, 1, 0.5, 0] }[mode];
      var els = [s.querySelector(".sky-day"), s.querySelector(".sky-evening"), s.querySelector(".sky-night"), s.querySelector(".set-night"), s.querySelector(".set-evening")];
      els.forEach(function (e, i) {
        if (tl) tl.to(e, { opacity: to[i], duration: d || 0.8, ease: "sine.inOut" }, t);
        else gsap.set(e, { opacity: to[i] });
      });
    },
    pivots: function (el) {
      Array.prototype.forEach.call(el.querySelectorAll("[data-o]"), function (n) {
        var p = n.getAttribute("data-o").split(" ");
        gsap.set(n, { svgOrigin: p[0] + " " + p[1] });
        if (n.hasAttribute("data-a")) gsap.set(n, { rotation: Number(n.getAttribute("data-a")) });
      });
    },
  };

  // ── props ────────────────────────────────────────────────────────────────────────────────────
  window.HKProp = {
    pile: function () {   // a stack of ledgers for the desk
      var cols = ["#2E5AA8", "#16603A", "#6C5B9E", "#B8860B", "#3B4A5A", "#2E5AA8"], s = "";
      for (var i = 0; i < 6; i++) {
        var y = 260 - i * 44, x = 10 + ((i * 17) % 3) * 10 - 10, w = 360 - ((i * 13) % 4) * 12;
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="44" rx="6" fill="' + cols[i] + '" stroke="' + INK + '" stroke-width="5"/><rect x="' + (x + w - 26) + '" y="' + (y + 6) + '" width="20" height="32" fill="#F7F1E3" stroke="' + INK + '" stroke-width="3"/>';
      }
      return svg("0 0 380 310", s, "prop-pile");
    },
    paper: function (rot) {
      return svg("0 0 140 180", '<g transform="rotate(' + (rot || 0) + ' 70 90)"><path d="M10 10 L110 10 L130 30 L130 170 L10 170 Z" fill="#FFFDF5" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M110 10 L110 30 L130 30" fill="#E8E0CC" stroke="' + INK + '" stroke-width="4"/><line x1="28" y1="60" x2="110" y2="60" stroke="#9AA" stroke-width="5"/><line x1="28" y1="90" x2="100" y2="90" stroke="#9AA" stroke-width="5"/><line x1="28" y1="120" x2="108" y2="120" stroke="#9AA" stroke-width="5"/><text x="70" y="44" text-anchor="middle" font-family="&#39;Hind Siliguri&#39;, sans-serif" font-weight="700" font-size="22" fill="#C0392B">রশিদ</text></g>', "prop-paper");
    },
    receiptBook: function () {
      return svg("0 0 220 160", '<rect x="10" y="20" width="200" height="130" rx="10" fill="#E9C46A" stroke="' + INK + '" stroke-width="6"/><rect x="10" y="20" width="200" height="34" rx="10" fill="#C08A2E" stroke="' + INK + '" stroke-width="6"/><text x="110" y="112" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="700" font-size="44" fill="#6B3E12">রশিদ বই</text>', "prop-rbook");
    },
    eraser: function () {
      return svg("0 0 150 90", '<g class="eraser"><rect x="10" y="20" width="130" height="58" rx="12" fill="#F4A6B8" stroke="' + INK + '" stroke-width="6"/><rect x="10" y="20" width="56" height="58" rx="12" fill="#6FA8DC" stroke="' + INK + '" stroke-width="6"/></g>', "prop-eraser");
    },
    pen: function () {
      return svg("0 0 60 260", '<rect x="18" y="10" width="24" height="200" rx="10" fill="#2E5AA8" stroke="' + INK + '" stroke-width="5"/><path d="M18 205 L30 250 L42 205 Z" fill="#E8D9B0" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><rect x="38" y="20" width="10" height="70" rx="4" fill="#D4A535" stroke="' + INK + '" stroke-width="3"/>', "prop-pen");
    },
    page: function () {   // the big open-ledger page card (scene 2)
      var s = '<rect x="10" y="10" width="560" height="430" rx="16" fill="#FFFDF5" stroke="' + INK + '" stroke-width="7"/>' +
        '<line x1="70" y1="10" x2="70" y2="440" stroke="#E3A8A8" stroke-width="4"/>';
      for (var i = 0; i < 7; i++) s += '<line x1="20" y1="' + (90 + i * 50) + '" x2="560" y2="' + (90 + i * 50) + '" stroke="#C9D7E4" stroke-width="3"/>';
      s += t(300, 64, 30, 700, "#8E2A20", "সেপ্টেম্বর · ফি") +
        '<g class="pg-r1">' + t(90, 128, 32, 600, "#24324A", "রুমানা আক্তার", "start") + t(540, 128, 32, 700, "#24324A", "১,২০০", "end") + "</g>" +
        '<g class="pg-r2">' + t(90, 178, 32, 600, "#24324A", "তানভীর হাসান", "start") + t(540, 178, 32, 700, "#24324A", "১,২০০", "end") + "</g>" +
        '<g class="pg-r3">' + t(90, 228, 32, 600, "#24324A", "নুসরাত জাহান", "start") + t(540, 228, 32, 700, "#24324A", "২,৪০০", "end") + "</g>" +
        '<g class="pg-scribble"><path d="M90 268 Q140 250 190 276 Q240 300 300 262 Q350 236 420 280 Q470 302 540 262" fill="none" stroke="#C0392B" stroke-width="7" stroke-linecap="round"/><path d="M96 300 L300 300 M120 286 L250 318 M250 286 L130 318" stroke="#C0392B" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="450" cy="360" rx="58" ry="36" fill="#24324A" opacity="0.85"/><circle cx="515" cy="390" r="12" fill="#24324A" opacity="0.85"/><circle cx="400" cy="398" r="8" fill="#24324A" opacity="0.85"/></g>';
      return svg("0 0 580 450", s, "prop-page");
    },
    box: function () {
      return svg("0 0 360 330", '<g class="box-body"><path d="M20 110 L340 110 L320 320 L40 320 Z" fill="#C9965B" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/><rect x="160" y="110" width="40" height="210" fill="#E8D19A" opacity="0.9"/><text x="180" y="250" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="700" font-size="40" fill="#6B3E12" transform="rotate(-4 180 250)">নতুন!</text></g>' +
        '<g class="box-lid" data-o="20 110"><path d="M8 80 L352 80 L352 116 L8 116 Z" fill="#B88447" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/><rect x="160" y="80" width="40" height="36" fill="#E8D19A"/></g>', "prop-box");
    },
    phone: function (amt, who, what) {   // the parent's phone; .ph-note slides in as the receipt notification
      return svg("0 0 300 520", '<rect x="20" y="10" width="260" height="500" rx="40" fill="#2B2F36" stroke="' + INK + '" stroke-width="7"/><rect x="40" y="56" width="220" height="404" rx="12" fill="#DDEBF7"/><rect x="120" y="28" width="60" height="10" rx="5" fill="#555"/>' +
        '<g class="ph-note"><rect x="50" y="86" width="200" height="214" rx="18" fill="#FFFFFF" stroke="#16603A" stroke-width="5"/><circle cx="84" cy="128" r="20" fill="#16603A"/><path d="M74 128 L82 136 L96 120" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        t(170, 132, 24, 700, "#16603A", "রশিদ") + t(150, 184, 32, 700, "#24324A", "৳ " + (amt || "১,২০০")) + t(150, 238, 20, 500, "#4A6355", who || "রুমানা · ৮ম") + t(150, 276, 18, 500, "#4A6355", what || "সেপ্টেম্বরের ফি") + "</g>", "prop-phone");
    },
    note: function (amt) {   // a taka note
      return svg("0 0 240 120", '<rect x="6" y="6" width="228" height="108" rx="10" fill="#8FC79A" stroke="' + INK + '" stroke-width="5"/><circle cx="120" cy="60" r="36" fill="#C7E6C7" stroke="#2E6B3A" stroke-width="4"/>' + t(120, 74, 38, 700, "#1E4D2B", "৳") + t(40, 40, 22, 700, "#1E4D2B", amt || "৫০০") + t(200, 102, 22, 700, "#1E4D2B", amt || "৫০০"), "prop-note");
    },
    zzz: function () { return svg("0 0 200 220", '<text class="z1" x="20" y="200" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="800" font-size="70" fill="#E9E4FF" stroke="' + INK + '" stroke-width="4">z</text><text class="z2" x="80" y="130" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="800" font-size="56" fill="#E9E4FF" stroke="' + INK + '" stroke-width="4">z</text><text class="z3" x="130" y="70" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="800" font-size="44" fill="#E9E4FF" stroke="' + INK + '" stroke-width="4">z</text>', "prop-zzz"); },
    heart: function (c) { return svg("0 0 100 92", '<path d="M50 88 Q6 56 8 28 Q12 4 34 6 Q48 8 50 26 Q52 8 66 6 Q88 4 92 28 Q94 56 50 88 Z" fill="' + (c || "#E85D75") + '" stroke="' + INK + '" stroke-width="5"/>', "prop-heart"); },
    mark: function (ch, c) { return svg("0 0 120 160", '<text x="60" y="140" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="800" font-size="150" fill="' + (c || "#E4A11B") + '" stroke="' + INK + '" stroke-width="6" paint-order="stroke">' + ch + "</text>", "prop-mark"); },
    burst: function (c) {
      var s = "";
      for (var i = 0; i < 10; i++) { var a = i / 10 * Math.PI * 2; s += '<line x1="' + (100 + Math.cos(a) * 46) + '" y1="' + (100 + Math.sin(a) * 46) + '" x2="' + (100 + Math.cos(a) * 92) + '" y2="' + (100 + Math.sin(a) * 92) + '" stroke="' + (c || "#E4A11B") + '" stroke-width="12" stroke-linecap="round"/>'; }
      return svg("0 0 200 200", s, "prop-burst");
    },
    ink: function () { return svg("0 0 200 140", '<path d="M40 70 Q30 20 90 26 Q140 6 160 50 Q196 70 160 104 Q130 136 80 118 Q20 116 40 70 Z" fill="#24324A" stroke="' + INK + '" stroke-width="4"/><circle cx="178" cy="24" r="12" fill="#24324A"/><circle cx="18" cy="120" r="9" fill="#24324A"/>', "prop-ink"); },
    umbrella: function () {
      return svg("0 0 360 420", '<line x1="180" y1="120" x2="180" y2="410" stroke="#6B4A1F" stroke-width="12" stroke-linecap="round"/><path d="M10 140 Q180 -40 350 140 Q308 116 266 140 Q222 112 180 140 Q138 112 94 140 Q52 116 10 140 Z" fill="#E85D4A" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/><path d="M94 140 Q120 40 180 14 M266 140 Q240 40 180 14" stroke="#FFFFFF" stroke-width="10" fill="none" opacity="0.9"/>', "prop-umbrella");
    },
    chair: function () {
      return svg("0 0 460 260", '<path d="M30 230 L120 120 L420 120 L440 140 L140 150 L60 240 Z" fill="#2E86AB" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/><path d="M40 170 L120 120 M70 200 L150 146" stroke="#FFFFFF" stroke-width="10"/><line x1="160" y1="150" x2="140" y2="250" stroke="' + INK + '" stroke-width="9"/><line x1="400" y1="140" x2="420" y2="250" stroke="' + INK + '" stroke-width="9"/>', "prop-chair");
    },
    tea: function () {
      return svg("0 0 140 130", '<path class="tea-steam" d="M50 34 Q40 18 52 4 M78 34 Q68 18 80 4" stroke="#B9BEC5" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M20 44 L110 44 L100 116 Q64 128 30 116 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/><path d="M108 58 Q138 62 128 88 Q120 104 102 98" fill="none" stroke="' + INK + '" stroke-width="7"/><rect x="26" y="50" width="78" height="14" fill="#A0522D"/>', "prop-tea");
    },
    bag: function () { return svg("0 0 200 170", '<path d="M60 50 Q60 14 100 14 Q140 14 140 50" fill="none" stroke="' + INK + '" stroke-width="9"/><rect x="14" y="48" width="172" height="112" rx="16" fill="#6E4523" stroke="' + INK + '" stroke-width="7"/><rect x="88" y="78" width="24" height="18" rx="4" fill="#D4A535" stroke="' + INK + '" stroke-width="4"/>', "prop-bag"); },
    report: function () {   // the printed report sheet sliding out of the app
      return svg("0 0 300 380", '<rect x="10" y="10" width="280" height="360" rx="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="6"/><rect x="10" y="10" width="280" height="56" rx="10" fill="#16603A"/>' + t(150, 48, 26, 700, "#FFFFFF", "মাসের রিপোর্ট") +
        '<rect x="44" y="190" width="30" height="70" fill="#16603A"/><rect x="90" y="160" width="30" height="100" fill="#16603A"/><rect x="136" y="176" width="30" height="84" fill="#16603A"/><rect x="182" y="140" width="30" height="120" fill="#16603A"/><rect x="228" y="120" width="30" height="140" fill="#E4A11B"/><line x1="30" y1="262" x2="270" y2="262" stroke="' + INK + '" stroke-width="4"/>' +
        t(40, 306, 22, 600, "#4A6355", "আদায়", "start") + t(262, 306, 24, 700, "#16603A", "৳ ৫১,৬০০", "end") + t(40, 356, 22, 600, "#4A6355", "ভুল", "start") + t(236, 356, 24, 700, "#16603A", "০", "end") + '<path d="M244 347 L251 354 L264 339" stroke="#16603A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', "prop-report");
    },
    numberCard: function (big, small, color) {
      return svg("0 0 860 360", '<rect x="10" y="10" width="840" height="340" rx="40" fill="#FFF8EC" stroke="' + INK + '" stroke-width="9"/>' + '<text class="nc-big" x="430" y="175" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, sans-serif" font-weight="800" font-size="140" fill="' + (color || "#16603A") + '">' + big + "</text>" + t(430, 312, 48, 700, "#6B5442", small || ""), "prop-ncard");
    },
    dizzyStars: function () {
      var s = '<ellipse cx="150" cy="60" rx="140" ry="40" fill="none" stroke="#E4A11B" stroke-width="5" stroke-dasharray="14 12"/>';
      s += star(30, 60, 22, "#E4A11B") + star(150, 22, 20, "#E4A11B") + star(270, 60, 22, "#E4A11B") + star(150, 98, 18, "#E4A11B");
      return svg("0 0 300 120", s, "prop-dstars");
    },
    cloud: function () {   // a dream cloud with its trail of thought-bubbles (.cl-b1/.cl-b2 at the bottom left)
      return svg("0 0 960 760", '<g class="cl-body"><path d="M90 470 Q40 300 210 270 Q240 110 440 140 Q560 30 700 140 Q900 140 890 320 Q960 470 820 540 L170 540 Q70 530 90 470 Z" fill="#EEE9FF" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round"/></g>' +
        '<circle class="cl-b1" cx="230" cy="620" r="40" fill="#EEE9FF" stroke="' + INK + '" stroke-width="7"/><circle class="cl-b2" cx="170" cy="710" r="24" fill="#EEE9FF" stroke="' + INK + '" stroke-width="6"/>', "prop-cloud");
    },
    file: function () {   // the headmaster's brown file, drawn around a hand at 0,0 (cast units)
      return '<g transform="rotate(-8)"><rect x="-58" y="-20" width="116" height="150" rx="8" fill="#B07A45" stroke="' + INK + '" stroke-width="5"/><rect x="-46" y="-4" width="92" height="22" rx="4" fill="#F2E3B3" stroke="' + INK + '" stroke-width="3"/></g>';
    },
    calendar: function (front, back, month, note) {   // .cal-front flips up off the rings and shows the page behind
      var ring = function (x) { return '<rect x="' + x + '" y="34" width="16" height="50" rx="8" fill="#9AA3AD" stroke="' + INK + '" stroke-width="4"/>'; };
      var page = function (cls, num, sub, o) {
        return '<g class="' + cls + '"' + (o || "") + '><rect x="20" y="64" width="320" height="350" rx="14" fill="#FFFDF5" stroke="' + INK + '" stroke-width="7"/><rect x="20" y="64" width="320" height="76" rx="14" fill="#C0392B" stroke="' + INK + '" stroke-width="7"/>' +
          t(180, 120, 40, 700, "#FFFFFF", month || "সেপ্টেম্বর") + bt(180, 274, 120, "#24324A", num) + (sub ? t(180, 382, 32, 700, "#C0392B", sub) : "") + "</g>";
      };
      return svg("0 0 360 430", page("cal-back", back, note) + page("cal-front", front, "", ' data-o="180 64"') + ring(100) + ring(244), "prop-cal");
    },
    stamp: function (top, big, c) {
      c = c || "#16603A";
      return svg("0 0 300 300", '<g transform="rotate(-12 150 150)"><circle cx="150" cy="150" r="132" fill="rgba(255,253,245,0.92)" stroke="' + c + '" stroke-width="12"/><circle cx="150" cy="150" r="108" fill="none" stroke="' + c + '" stroke-width="5"/>' +
        t(150, 118, 50, 700, c, top) + bt(150, 238, 120, c, big) + "</g>", "prop-stamp");
    },
    handBag: function () {   // a bag hanging from a hand at 0,0 (cast units, like file())
      return '<path d="M-34 14 Q-34 -22 0 -22 Q34 -22 34 14" fill="none" stroke="' + INK + '" stroke-width="9"/><rect x="-92" y="10" width="184" height="124" rx="16" fill="#6E4523" stroke="' + INK + '" stroke-width="7"/><rect x="-12" y="42" width="24" height="18" rx="4" fill="#D4A535" stroke="' + INK + '" stroke-width="4"/>';
    },
    handTea: function (hx, hy) {   // a cup of tea gripped by a cartoon glove at (hx, hy), in the character's own units
      return '<g transform="translate(' + (hx - 6) + ' ' + (hy - 92) + ')"><path class="tea-steam" d="M40 26 Q30 10 42 -4 M68 26 Q58 10 70 -4" stroke="#B9BEC5" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M10 36 L100 36 L90 108 Q54 120 20 108 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/><rect x="16" y="42" width="78" height="14" fill="#A0522D"/></g>';
    },
    medal: function (cx, cy) {   // a long-service medal (২০ years), drawn into the khata at its chest
      return '<g class="medal"><path d="M' + (cx - 30) + ' ' + (cy - 90) + ' L' + (cx - 6) + ' ' + (cy - 20) + ' L' + (cx + 6) + ' ' + (cy - 20) + ' L' + (cx + 30) + ' ' + (cy - 90) + '" fill="#2E5AA8" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="40" fill="#E4B33A" stroke="' + INK + '" stroke-width="5"/><circle cx="' + cx + '" cy="' + cy + '" r="30" fill="none" stroke="#B8860B" stroke-width="3"/>' + bt(cx, cy + 16, 40, "#6B3E12", "২০") + "</g>";
    },
    rainCloud: function () {
      var d = "";
      for (var i = 0; i < 5; i++) d += '<path class="drop" d="M' + (70 + i * 40) + ' 190 l-6 22" stroke="#5B8BD6" stroke-width="7" stroke-linecap="round"/>';
      return svg("0 0 320 260", d + '<path d="M50 170 Q14 170 18 134 Q22 100 62 102 Q70 52 124 58 Q156 20 202 46 Q252 40 262 92 Q306 98 300 136 Q296 172 256 170 Z" fill="#8A93A0" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/>', "prop-rain");
    },
    rays: function (c) {   // a cartoon sunburst for celebrations (rotate the div)
      var s = "";
      for (var i = 0; i < 18; i++) { var a = (i / 18) * Math.PI * 2, b = a + Math.PI / 18; s += '<path d="M600 600 L' + (600 + Math.cos(a) * 900) + " " + (600 + Math.sin(a) * 900) + " L" + (600 + Math.cos(b) * 900) + " " + (600 + Math.sin(b) * 900) + ' Z" fill="' + (c || "#FFD25A") + '"/>'; }
      return svg("0 0 1200 1200", s, "prop-rays");
    },
    lamp: function () {
      return svg("0 0 360 520", '<path class="lamp-light" d="M120 150 L-40 520 L360 520 L230 150 Z" fill="#FFE8A3" opacity="0.32"/><path d="M60 510 L230 510" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/><path d="M150 506 L150 300 L90 170" fill="none" stroke="#3B4A5A" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 170 L180 110 L220 180 L90 230 Z" fill="#16603A" stroke="' + INK + '" stroke-width="7" stroke-linejoin="round"/>', "prop-lamp");
    },
  };
})();
