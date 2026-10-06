/* cast.js — the cartoon cast of "খাতা নিজেই কথা বলে", drawn in SVG and rigged for GSAP.
 *
 *   HKCast.mount(el, "khata", { expr: "tired" })   → puts the character's <svg> inside el, returns the svg
 *   HKCast.expr(svg, "happy", tl, t)               → sets an expression (with tl: at time t; else now)
 *   Acting (walk, talk, blink, gestures…) lives in act.js.
 *
 * Every animatable part has a class and a pivot (data-o, SVG user units; mount() hands it to GSAP's svgOrigin):
 *   .c-root (whole body, pivot = feet) · .c-arm-l/-r (shoulder) · .c-fore-l/-r (elbow) · .c-leg-l/-r (hip)
 *   .c-head (neck) · .c-lid (eyelid: scaleY 0 open → 1 shut) · .c-pupil · .c-brow-l/-r
 *   .c-mouth-open (scaleY 0 closed → 1 wide) · .c-mouth-line (shape swaps by expression)
 *   khata extras: .c-dizzy .c-shades .c-sweat .c-blush · app extras: .c-ui .ui-form .ui-list .ui-report
 * Characters: khata, karim, head, app, calc, girl, parent (options: skin, top, bottom, hair).
 * Deterministic: no clocks, no randomness.
 */
(function () {
  var INK = "#2A1E17";
  var uid = 0;
  function id(p) { uid += 1; return p + "-" + uid; }
  function g(cls, o, inner, extra) { return '<g class="' + cls + '"' + (o ? ' data-o="' + o + '"' : "") + (extra || "") + ">" + inner + "</g>"; }

  // ── shared parts ─────────────────────────────────────────────────────────────────────────────
  function eye(cx, cy, rx, ry, lidFill, opts) {
    opts = opts || {};
    var clip = id("eyeclip");
    var pr = opts.pupil || rx * 0.42;
    var py = cy + ry * 0.12;
    var s = '<g class="c-eye">' +
      '<clipPath id="' + clip + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#FFFFFF"/>' +
      '<g clip-path="url(#' + clip + ')">' +
        g("c-pupil", cx + " " + py,
          '<circle cx="' + cx + '" cy="' + py + '" r="' + pr + '" fill="' + (opts.pupilFill || INK) + '"/>' +
          '<circle cx="' + (cx - pr * 0.35) + '" cy="' + (py - pr * 0.35) + '" r="' + (pr * 0.32) + '" fill="#FFFFFF"/>') +
        (opts.dizzy ? g("c-dizzy", cx + " " + cy, '<path d="M' + cx + ' ' + cy + ' m0 -3 a3 3 0 1 1 -3 3 a7 7 0 1 1 7 7 a12 12 0 1 1 -12 -12 a18 18 0 1 1 18 18 a24 24 0 1 1 -24 -24" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>', ' opacity="0"') : "") +
        g("c-lid", cx + " " + (cy - ry - 2),
          '<rect x="' + (cx - rx - 4) + '" y="' + (cy - ry - 2) + '" width="' + (rx * 2 + 8) + '" height="' + (ry * 2 + 4) + '" fill="' + lidFill + '"/>' +
          '<line x1="' + (cx - rx - 4) + '" y1="' + (cy + ry + 2) + '" x2="' + (cx + rx + 4) + '" y2="' + (cy + ry + 2) + '" stroke="' + INK + '" stroke-width="5"/>') +
      '</g>' +
      (opts.lashes ? '<path d="M' + (cx - rx * 0.9) + ' ' + (cy - ry * 0.55) + ' l-9 -9 M' + (cx - rx * 0.45) + ' ' + (cy - ry * 0.95) + ' l-5 -12 M' + (cx + rx * 0.1) + ' ' + (cy - ry * 1.02) + ' l0 -12" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' : "") +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + INK + '" stroke-width="' + (opts.sw || 6) + '"/>' +
      '</g>';
    return s;
  }
  function brow(cls, x1, y1, x2, y2, lift, color, w) {
    var mx = (x1 + x2) / 2;
    return g(cls, mx + " " + ((y1 + y2) / 2), '<path d="M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + (Math.min(y1, y2) - lift) + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="' + (color || INK) + '" stroke-width="' + (w || 9) + '" stroke-linecap="round"/>');
  }
  // mouth: a line (always on top) + an opening that scales down from the line
  function mouth(cx, cy, w, opts) {
    opts = opts || {};
    var h = opts.h || w * 1.25;
    var dark = opts.dark || "#4A1410", tongue = opts.tongue || "#E8705F", line = opts.line || INK;
    return '<g class="c-mouth" transform="translate(' + cx + ' ' + cy + ')">' +
      '<g class="c-mouth-open">' +
        '<path d="M' + (-w) + ' 0 Q0 ' + (w * 0.25) + ' ' + w + ' 0 Q' + (w * 0.8) + ' ' + h + ' 0 ' + (h * 1.06) + ' Q' + (-w * 0.8) + ' ' + h + ' ' + (-w) + ' 0Z" fill="' + dark + '" stroke="' + line + '" stroke-width="' + (opts.sw || 6) + '" stroke-linejoin="round"/>' +
        '<path d="M' + (-w * 0.5) + ' ' + (h * 0.72) + ' Q0 ' + (h * 0.45) + ' ' + (w * 0.5) + ' ' + (h * 0.72) + ' Q' + (w * 0.36) + ' ' + h + ' 0 ' + h + ' Q' + (-w * 0.36) + ' ' + h + ' ' + (-w * 0.5) + ' ' + (h * 0.72) + 'Z" fill="' + tongue + '"/>' +
      '</g>' +
      '<path class="c-mouth-line" d="' + mouthLine("neutral", w) + '" fill="none" stroke="' + line + '" stroke-width="' + (opts.sw || 7) + '" stroke-linecap="round" data-w="' + w + '"/>' +
      '</g>';
  }
  function mouthLine(kind, w) {
    if (kind === "smile") return "M" + (-w) + " -4 Q0 " + (w * 0.55) + " " + w + " -4";
    if (kind === "frown") return "M" + (-w * 0.8) + " " + (w * 0.22) + " Q0 " + (-w * 0.22) + " " + (w * 0.8) + " " + (w * 0.22);
    if (kind === "flat") return "M" + (-w * 0.7) + " 0 L" + (w * 0.7) + " 0";
    return "M" + (-w) + " 0 Q0 " + (w * 0.3) + " " + w + " 0";
  }
  // rubber-hose arm with a cartoon glove; pivots at the shoulder (sx, sy)
  function hoseArm(cls, sx, sy, ex, ey, color, glove) {
    var left = ex < sx;
    var c1x = sx + (ex - sx) * 0.1 + (left ? -28 : 28), c1y = sy + (ey - sy) * 0.35;
    glove = glove || "#FFFFFF";
    return g(cls, sx + " " + sy,
      '<path d="M' + sx + ' ' + sy + ' Q' + c1x + ' ' + c1y + ' ' + ex + ' ' + ey + '" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round"/>' +
      g("c-hand", ex + " " + (ey + 10),
        '<circle cx="' + ex + '" cy="' + (ey + 10) + '" r="21" fill="' + glove + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<ellipse cx="' + (ex + (left ? 15 : -15)) + '" cy="' + (ey + 2) + '" rx="8" ry="11" fill="' + glove + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<g class="c-hold"></g>'));
  }
  // two-segment human arm: sleeve (upper) + skin forearm (elbow pivot) + hand; k scales it (child)
  function humanArm(side, sx, sy, sleeve, skin, rest, k) {
    k = k || 1;
    var s = side === "l" ? 1 : -1;
    var uw = 42 * k, ul = 122 * k, fw = 32 * k, fl = 104 * k, hr = 23 * k, el = 100 * k;
    return g("c-arm-" + side, sx + " " + sy,
      '<rect x="' + (sx - uw / 2) + '" y="' + (sy - 12 * k) + '" width="' + uw + '" height="' + ul + '" rx="' + (uw / 2) + '" fill="' + sleeve + '" stroke="' + INK + '" stroke-width="6"/>' +
      g("c-fore-" + side, sx + " " + (sy + el),
        '<rect x="' + (sx - fw / 2) + '" y="' + (sy + el - 8 * k) + '" width="' + fw + '" height="' + fl + '" rx="' + (fw / 2) + '" fill="' + skin + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<circle cx="' + sx + '" cy="' + (sy + el + fl) + '" r="' + hr + '" fill="' + skin + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<g class="c-hold" transform="translate(' + sx + ' ' + (sy + el + fl) + ')"></g>'),
      ' data-rest="' + (rest * s) + '"');
  }
  function leg(side, hx, hy, x, w, len, fill, shoe, shoeFill, sw) {
    return g("c-leg-" + side, hx + " " + hy,
      '<rect x="' + x + '" y="' + hy + '" width="' + w + '" height="' + len + '" rx="' + Math.min(14, w / 3) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 6) + '"/>' +
      '<ellipse cx="' + (x + w / 2 + (side === "l" ? -8 : 8)) + '" cy="' + (hy + len + 6) + '" rx="' + shoe + '" ry="' + (shoe * 0.42) + '" fill="' + shoeFill + '" stroke="' + INK + '" stroke-width="4"/>');
  }
  function shadow(cx, cy, rx) { return '<ellipse class="c-shadow" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (rx * 0.11) + '" fill="rgba(42,30,23,0.18)"/>'; }
  function wrap(name, vb, body, feetX, feetY) {
    return '<svg class="hk-char hk-' + name + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" overflow="visible">' +
      g("c-root", feetX + " " + feetY, body) + "</svg>";
  }
  function star(x, y, r, cls, fill) {
    return '<path class="c-spark ' + (cls || "") + '" data-o="' + x + ' ' + y + '" d="M' + x + ' ' + (y - r) + ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + ' Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="' + (fill || "#E4A11B") + '"/>';
  }

  // ── লাল খাতা: the old red ledger, hero and narrator ─────────────────────────────────────────────
  function khata() {
    var RED = "#C0392B", DARK = "#8E2A20", GOLD = "#E4A11B", PAPER = "#F7F1E3";
    var b = shadow(205, 562, 128);
    b += g("c-leg-l", "160 470", '<path d="M160 470 L154 536" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><ellipse cx="142" cy="542" rx="28" ry="13" fill="#3A2A20" stroke="' + INK + '" stroke-width="5"/>');
    b += g("c-leg-r", "252 470", '<path d="M252 470 L258 536" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><ellipse cx="270" cy="542" rx="28" ry="13" fill="#3A2A20" stroke="' + INK + '" stroke-width="5"/>');
    b += hoseArm("c-arm-l", 66, 300, 30, 404, INK);
    b += hoseArm("c-arm-r", 340, 300, 376, 404, INK);
    b += '<g class="c-body">';
    b += '<rect x="76" y="58" width="282" height="414" rx="16" fill="' + DARK + '" stroke="' + INK + '" stroke-width="6"/>';
    b += '<rect x="70" y="64" width="276" height="402" rx="10" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5"/>';
    for (var i = 0; i < 4; i++) b += '<line x1="' + (334 + i * 3) + '" y1="74" x2="' + (334 + i * 3) + '" y2="456" stroke="#D8CDB5" stroke-width="1.6"/>';
    b += '<rect x="56" y="48" width="280" height="428" rx="18" fill="' + RED + '" stroke="' + INK + '" stroke-width="7"/>';
    b += '<path d="M56 66 Q56 48 74 48 L98 48 L98 476 L74 476 Q56 476 56 458 Z" fill="' + DARK + '"/>';
    b += '<line x1="98" y1="52" x2="98" y2="472" stroke="' + INK + '" stroke-width="4"/>';
    b += '<rect x="58" y="104" width="40" height="11" fill="' + GOLD + '"/><rect x="58" y="408" width="40" height="11" fill="' + GOLD + '"/>';
    b += '<path d="M112 62 L320 62" stroke="#D9534A" stroke-width="6" stroke-linecap="round" opacity="0.8"/>';
    b += '<path d="M292 48 L336 48 L336 92 Z" fill="#D4A535" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<path d="M336 432 L336 476 L292 476 Z" fill="#D4A535" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<rect x="148" y="88" width="136" height="60" rx="10" fill="#F2E3B3" stroke="' + INK + '" stroke-width="5"/>';
    b += '<text x="216" y="130" text-anchor="middle" font-family="&#39;Baloo Da 2&#39;, &#39;Hind Siliguri&#39;, sans-serif" font-weight="700" font-size="38" fill="' + DARK + '">খাতা</text>';
    b += '</g>';
    b += '<g class="c-face">';
    b += '<path d="M144 320 Q166 330 188 320" fill="none" stroke="' + DARK + '" stroke-width="5" stroke-linecap="round"/>';
    b += '<path d="M246 320 Q268 330 290 320" fill="none" stroke="' + DARK + '" stroke-width="5" stroke-linecap="round"/>';
    b += '<g class="c-blush" opacity="0"><ellipse cx="140" cy="334" rx="22" ry="10" fill="#F28B82"/><ellipse cx="294" cy="334" rx="22" ry="10" fill="#F28B82"/></g>';
    b += eye(166, 258, 37, 45, RED, { dizzy: true });
    b += eye(268, 258, 37, 45, RED, { dizzy: true });
    b += '<g class="c-glasses"><circle cx="166" cy="258" r="48" fill="rgba(255,255,255,0.07)" stroke="#6B4A1F" stroke-width="5"/><circle cx="268" cy="258" r="48" fill="rgba(255,255,255,0.07)" stroke="#6B4A1F" stroke-width="5"/><path d="M213 250 Q217 242 221 250" fill="none" stroke="#6B4A1F" stroke-width="5"/></g>';
    b += brow("c-brow-l", 132, 194, 198, 190, 12);
    b += brow("c-brow-r", 236, 190, 302, 194, 12);
    b += mouth(216, 384, 46);
    b += '<g class="c-shades" opacity="0"><path d="M110 226 L222 226 L214 290 Q170 304 124 290 Z" fill="#1B1B1F" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M212 226 L324 226 L316 290 Q270 304 226 290 Z" fill="#1B1B1F" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/><path d="M128 238 L156 238" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/><path d="M230 238 L258 238" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/></g>';
    b += '</g>';
    b += g("c-sweat", "318 190", '<path d="M318 170 Q332 196 326 206 Q318 216 310 206 Q304 196 318 170 Z" fill="#7EC8F2" stroke="' + INK + '" stroke-width="4"/>', ' opacity="0"');
    return wrap("khata", "0 0 412 580", b, 205, 560);
  }

  // ── করিম স্যার ──────────────────────────────────────────────────────────────────────────────────
  function karim() {
    var SKIN = "#C68A5E", SHIRT = "#F4F4EE", PANT = "#3B4A5A", HAIR = "#1F1A17";
    var b = shadow(200, 770, 120);
    b += leg("l", 170, 552, 136, 62, 192, PANT, 42, INK);
    b += leg("r", 230, 552, 202, 62, 192, PANT, 42, INK);
    b += humanArm("l", 118, 352, SHIRT, SKIN, 14);
    b += humanArm("r", 282, 352, SHIRT, SKIN, 14);
    b += '<g class="c-body">';
    b += '<path d="M108 338 Q200 302 292 338 L282 566 L118 566 Z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<rect x="178" y="270" width="44" height="52" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<path d="M166 318 L200 368 L234 318" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<path d="M178 318 L200 352 L222 318 Z" fill="' + SKIN + '"/>';
    for (var i = 0; i < 4; i++) b += '<circle cx="200" cy="' + (392 + i * 42) + '" r="4.5" fill="' + INK + '"/>';
    b += '<rect x="226" y="396" width="42" height="46" rx="4" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    b += '<rect x="238" y="378" width="9" height="30" rx="3" fill="#2E5AA8" stroke="' + INK + '" stroke-width="3"/>';
    b += '<rect x="120" y="550" width="160" height="16" fill="' + INK + '"/><rect x="190" y="551" width="20" height="14" rx="2" fill="#B8860B"/>';
    b += '</g>';
    b += g("c-head", "200 290",
      '<ellipse cx="108" cy="190" rx="17" ry="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/><ellipse cx="292" cy="190" rx="17" ry="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<ellipse cx="200" cy="182" rx="94" ry="108" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="6"/>' +
      '<path d="M108 168 Q106 72 200 66 Q294 72 292 168 Q284 118 236 112 Q206 132 170 112 Q118 118 108 168 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M109 170 Q110 150 118 140 L122 176 Z" fill="#8C8C8C"/><path d="M291 170 Q290 150 282 140 L278 176 Z" fill="#8C8C8C"/>' +
      '<g class="c-face">' +
        eye(164, 178, 17, 19, SKIN, { sw: 5, pupil: 8 }) + eye(236, 178, 17, 19, SKIN, { sw: 5, pupil: 8 }) +
        '<g class="c-glasses"><circle cx="164" cy="178" r="33" fill="rgba(210,230,245,0.22)" stroke="' + INK + '" stroke-width="5"/><circle cx="236" cy="178" r="33" fill="rgba(210,230,245,0.22)" stroke="' + INK + '" stroke-width="5"/><path d="M196 172 Q200 164 204 172" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M131 172 L110 166" stroke="' + INK + '" stroke-width="5"/><path d="M269 172 L290 166" stroke="' + INK + '" stroke-width="5"/></g>' +
        brow("c-brow-l", 138, 132, 188, 130, 8, HAIR, 10) + brow("c-brow-r", 212, 130, 262, 132, 8, HAIR, 10) +
        '<path d="M200 196 Q188 226 204 230" fill="none" stroke="#8A5A3A" stroke-width="5" stroke-linecap="round"/>' +
        mouth(200, 262, 26, { sw: 5, h: 30 }) +
        '<path d="M146 246 Q172 226 200 238 Q228 226 254 246 Q236 258 200 248 Q164 258 146 246 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="3"/>' +
      '</g>');
    return wrap("karim", "0 0 400 790", b, 200, 760);
  }

  // ── হেডস্যার ───────────────────────────────────────────────────────────────────────────────────
  function head() {
    var SKIN = "#B97E55", PANJABI = "#AFCDEA", PAJAMA = "#EDEDE7", GREY = "#B9BDC2";
    var b = shadow(210, 790, 130);
    b += leg("l", 180, 640, 148, 60, 122, PAJAMA, 40, "#7A4E2D");
    b += leg("r", 240, 640, 212, 60, 122, PAJAMA, 40, "#7A4E2D");
    b += humanArm("l", 120, 356, PANJABI, SKIN, 12);
    b += humanArm("r", 300, 356, PANJABI, SKIN, 12);
    b += '<g class="c-body">';
    b += '<path d="M112 340 Q210 298 308 340 Q344 480 304 652 L116 652 Q76 480 112 340 Z" fill="' + PANJABI + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<path d="M210 330 L210 450" stroke="' + INK + '" stroke-width="4"/>';
    for (var i = 0; i < 3; i++) b += '<circle cx="210" cy="' + (360 + i * 34) + '" r="5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5"/>';
    b += '<rect x="186" y="276" width="48" height="52" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<path d="M180 322 Q210 340 240 322" fill="none" stroke="' + INK + '" stroke-width="5"/>';
    b += '</g>';
    b += g("c-head", "210 300",
      '<ellipse cx="114" cy="196" rx="17" ry="28" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/><ellipse cx="306" cy="196" rx="17" ry="28" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<ellipse cx="210" cy="186" rx="98" ry="112" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="6"/>' +
      '<ellipse cx="180" cy="104" rx="34" ry="14" fill="#D49B70" opacity="0.6"/>' +
      '<path d="M113 200 Q110 150 128 128 Q122 170 132 196 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/><path d="M307 200 Q310 150 292 128 Q298 170 288 196 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<g class="c-face">' +
        eye(174, 186, 16, 17, SKIN, { sw: 5, pupil: 7.5 }) + eye(246, 186, 16, 17, SKIN, { sw: 5, pupil: 7.5 }) +
        g("c-glasses", "210 205", '<rect x="144" y="186" width="60" height="38" rx="10" fill="rgba(210,230,245,0.25)" stroke="' + INK + '" stroke-width="5"/><rect x="216" y="186" width="60" height="38" rx="10" fill="rgba(210,230,245,0.25)" stroke="' + INK + '" stroke-width="5"/><path d="M204 200 L216 200" stroke="' + INK + '" stroke-width="5"/>') +
        brow("c-brow-l", 146, 152, 198, 150, 6, GREY, 13) + brow("c-brow-r", 222, 150, 274, 152, 6, GREY, 13) +
        '<path d="M210 206 Q196 238 214 242" fill="none" stroke="#7E4F31" stroke-width="5" stroke-linecap="round"/>' +
        mouth(210, 278, 28, { sw: 5, h: 32 }) +
        '<path d="M146 262 Q178 238 210 252 Q242 238 274 262 Q252 278 210 266 Q168 278 146 262 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/>' +
      '</g>');
    return wrap("head", "0 0 420 810", b, 210, 780);
  }

  // ── মেয়ে: Karim's daughter ───────────────────────────────────────────────────────────────────────
  function girl() {
    var SKIN = "#C98B5F", FROCK = "#F28FB0", HAIR = "#1F1A17";
    var b = shadow(130, 472, 70);
    b += leg("l", 112, 380, 98, 26, 76, SKIN, 22, "#C0392B", 5);
    b += leg("r", 148, 380, 136, 26, 76, SKIN, 22, "#C0392B", 5);
    b += humanArm("l", 76, 236, FROCK, SKIN, 18, 0.62);
    b += humanArm("r", 184, 236, FROCK, SKIN, 18, 0.62);
    b += '<g class="c-body"><path d="M84 222 Q130 204 176 222 L206 392 Q130 410 54 392 Z" fill="' + FROCK + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M66 360 Q130 378 194 360" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="130" cy="262" r="7" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/></g>';
    b += g("c-head", "130 210",
      '<path d="M58 92 Q30 120 40 170 Q46 196 34 214 Q60 206 66 170 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M202 92 Q230 120 220 170 Q214 196 226 214 Q200 206 194 170 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="48" cy="98" r="12" fill="#C0392B" stroke="' + INK + '" stroke-width="3"/><circle cx="212" cy="98" r="12" fill="#C0392B" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="130" cy="128" rx="70" ry="74" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<path d="M62 118 Q64 56 130 52 Q196 56 198 118 Q176 86 146 84 Q120 100 96 86 Q72 92 62 118 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<g class="c-face">' +
        eye(104, 136, 15, 18, SKIN, { sw: 4, pupil: 9, lashes: true }) + eye(156, 136, 15, 18, SKIN, { sw: 4, pupil: 9, lashes: true }) +
        '<ellipse cx="86" cy="166" rx="12" ry="7" fill="#F28B82" opacity="0.7"/><ellipse cx="174" cy="166" rx="12" ry="7" fill="#F28B82" opacity="0.7"/>' +
        brow("c-brow-l", 92, 108, 116, 106, 4, HAIR, 5) + brow("c-brow-r", 144, 106, 168, 108, 4, HAIR, 5) +
        mouth(130, 172, 16, { sw: 4, h: 18 }) +
      '</g>');
    return wrap("girl", "0 0 260 490", b, 130, 470);
  }

  // ── অভিভাবক: a queue of parents, varied by options ─────────────────────────────────────────────
  function parent(o) {
    o = o || {};
    var SKIN = o.skin || "#B57B52", TOP = o.top || "#4F8A6E", BOTTOM = o.bottom || "#3B3B44", HAIR = o.hairColor || "#1F1A17";
    var woman = o.hair === "woman" || o.hair === "hijab";
    var b = shadow(150, 640, 90);
    b += leg("l", 128, 470, 104, 46, 150, woman ? TOP : BOTTOM, 32, INK);
    b += leg("r", 172, 470, 150, 46, 150, woman ? TOP : BOTTOM, 32, INK);
    b += humanArm("l", 86, 290, TOP, SKIN, 10, 0.86);
    b += humanArm("r", 214, 290, TOP, SKIN, 10, 0.86);
    b += '<g class="c-body"><path d="M80 278 Q150 250 220 278 L' + (woman ? "236 560 L64 560" : "212 480 L88 480") + ' Z" fill="' + TOP + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>' +
      (o.hair === "woman" ? '<path d="M92 282 Q150 330 210 282 L222 300 Q150 352 80 300 Z" fill="' + (o.scarf || "#E4A11B") + '" stroke="' + INK + '" stroke-width="4"/>' : "") +
      '<rect x="134" y="226" width="32" height="40" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/></g>';
    var hair = o.hair === "hijab"
      ? '<path d="M66 150 Q62 54 150 50 Q238 54 234 150 Q236 236 196 262 L104 262 Q64 236 66 150 Z" fill="' + (o.scarf || "#6C5B9E") + '" stroke="' + INK + '" stroke-width="5"/>'
      : o.hair === "woman"
        ? '<path d="M78 150 Q72 60 150 56 Q228 60 222 150 Q230 200 214 232 L200 150 Q170 104 104 120 L98 232 Q70 200 78 150 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="5"/>'
        : '<path d="M84 130 Q84 62 150 60 Q216 62 216 130 Q200 96 150 98 Q100 96 84 130 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="5"/>';
    b += g("c-head", "150 240",
      (o.hair === "hijab" ? hair : "") +
      '<ellipse cx="150" cy="150" rx="66" ry="78" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>' +
      (o.hair === "hijab" ? "" : hair) +
      '<g class="c-face">' +
        eye(126, 152, 12, 13, SKIN, { sw: 4, pupil: 6 }) + eye(174, 152, 12, 13, SKIN, { sw: 4, pupil: 6 }) +
        brow("c-brow-l", 112, 128, 138, 126, 5, HAIR, 6) + brow("c-brow-r", 162, 126, 188, 128, 5, HAIR, 6) +
        (o.mustache ? '<path d="M128 194 Q150 182 172 194 Q150 202 128 194 Z" fill="' + HAIR + '"/>' : "") +
        mouth(150, 204, 18, { sw: 4, h: 20 }) +
      '</g>');
    return wrap("parent", "0 0 300 660", b, 150, 640);
  }

  // ── the app's demo screens, drawn in screen units (x 74–306, y 76–398); used on the tablet AND, scaled up, on the
  // floating panel the scenes show for reading. Each screen is hidden until a scene shows it. ──────────────────────
  function ui() {
    var G = "#16603A", AMBER = "#AC7914", RED = "#C0392B";
    var t = function (x, y, s, w, fill, txt, anchor, cls) { return '<text' + (cls ? ' class="' + cls + '"' : "") + ' x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "start") + '" font-family="&#39;Hind Siliguri&#39;, sans-serif" font-weight="' + w + '" font-size="' + s + '" fill="' + fill + '">' + txt + '</text>'; };
    var header = function (txt) { return '<path d="M74 98 Q74 76 96 76 L284 76 Q306 76 306 98 L306 120 L74 120 Z" fill="' + G + '"/>' + t(190, 107, 22, 700, "#FFFFFF", txt, "middle"); };
    var field = function (y, label, value, cls, color) {
      return '<rect x="88" y="' + y + '" width="204" height="44" rx="9" fill="#FFFFFF" stroke="#B9D8C4" stroke-width="2.5"/>' +
        t(100, y + 29, 17, 500, "#4A6355", label) + t(280, y + 30, 19, 700, color || G, value, "end", cls);
    };
    var b = '<g class="c-ui">';
    b += '<g class="ui-form" opacity="0">' + header("ফি এন্ট্রি") +
      field(134, "নাম", "রুমানা আক্তার", "ui-v1") + field(186, "শ্রেণি", "৮ম", "ui-v2") + field(238, "টাকা", "১,২০০", "ui-v3", AMBER) +
      '<g class="ui-btn" data-o="190 314"><rect x="128" y="296" width="124" height="38" rx="19" fill="' + G + '"/>' + t(178, 321, 19, 700, "#FFFFFF", "জমা", "middle") + '<path d="M207 313 L213 319 L225 306" stroke="#FFFFFF" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + '</g>' +
      '<line x1="88" y1="352" x2="292" y2="352" stroke="#B9D8C4" stroke-width="2"/>' +
      t(90, 382, 16, 500, "#4A6355", "মোট আদায়") + t(292, 384, 21, 700, G, "৳ ৫০,৪০০", "end", "ui-total") + '</g>';
    var row = function (y, n, nm, amt) { return t(92, y, 15, 500, "#4A6355", n) + t(122, y, 18, 600, G, nm) + t(292, y, 18, 700, RED, amt, "end") + '<line x1="88" y1="' + (y + 11) + '" x2="292" y2="' + (y + 11) + '" stroke="#D5E8DC" stroke-width="1.5"/>'; };
    b += '<g class="ui-list" opacity="0">' + header("৮ম শ্রেণি · বকেয়া") +
      t(190, 170, 40, 700, RED, "১৮ জন", "middle", "ui-count") +
      '<g class="ui-rows">' + row(208, "০১২", "তানভীর হাসান", "১,২০০") + row(242, "০১৯", "নুসরাত জাহান", "২,৪০০") + row(276, "০২৭", "আরিফুল ইসলাম", "১,২০০") + row(310, "০৩৩", "সুমাইয়া খাতুন", "৩,৬০০") + '</g>' +
      t(190, 352, 16, 500, "#4A6355", "+ আরও ১৪ জন", "middle") + '</g>';
    var bar = function (x, h, i) { return '<rect class="ui-bar ui-bar-' + i + '" data-o="' + (x + 11) + ' 262" x="' + x + '" y="' + (262 - h) + '" width="22" height="' + h + '" rx="4" fill="' + (i === 4 ? "#E4A11B" : G) + '"/>'; };
    b += '<g class="ui-report" opacity="0">' + header("সেপ্টেম্বর রিপোর্ট") +
      bar(104, 70, 0) + bar(140, 92, 1) + bar(176, 80, 2) + bar(212, 104, 3) + bar(248, 122, 4) +
      '<line x1="92" y1="263" x2="288" y2="263" stroke="' + G + '" stroke-width="2.5"/>' +
      t(92, 300, 17, 500, "#4A6355", "আদায়") + t(290, 300, 19, 700, G, "৳ ৫১,৬০০", "end") +
      t(92, 330, 17, 500, "#4A6355", "বকেয়া") + t(290, 330, 19, 700, RED, "১৮ জন", "end") +
      t(92, 360, 17, 500, "#4A6355", "ভুল") + t(268, 361, 19, 700, G, "০", "end") + '<path d="M274 353 L280 359 L291 346" stroke="' + G + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' + '</g>';
    return b + '</g>';
  }
  // the floating demo panel: the same screens on a card, for a readable close-up
  function panel() {
    return '<svg class="hk-panel" viewBox="60 62 260 350" xmlns="http://www.w3.org/2000/svg" overflow="visible">' +
      '<rect x="64" y="66" width="252" height="342" rx="26" fill="#EAF6EE" stroke="#16603A" stroke-width="6"/>' + ui() + '</svg>';
  }

  // ── হিসাব খাতা: the friendly tablet, with its demo screens ───────────────────────────────────────
  function app() {
    var G = "#16603A", GD = "#0E3F26", SCREEN = "#EAF6EE", AMBER = "#AC7914", RED = "#C0392B";
    var glow = id("glow");
    var t = function (x, y, s, w, fill, txt, anchor, cls) { return '<text' + (cls ? ' class="' + cls + '"' : "") + ' x="' + x + '" y="' + y + '" text-anchor="' + (anchor || "start") + '" font-family="&#39;Hind Siliguri&#39;, sans-serif" font-weight="' + w + '" font-size="' + s + '" fill="' + fill + '">' + txt + '</text>'; };
    var b = '<defs><radialGradient id="' + glow + '"><stop offset="0" stop-color="#9FE3B8" stop-opacity="0.75"/><stop offset="1" stop-color="#9FE3B8" stop-opacity="0"/></radialGradient></defs>';
    b += '<circle class="c-glow" cx="190" cy="240" r="215" fill="url(#' + glow + ')"/>';
    b += shadow(190, 520, 92);
    b += hoseArm("c-arm-l", 56, 268, 18, 352, G);
    b += hoseArm("c-arm-r", 324, 268, 362, 352, G);
    b += '<g class="c-body"><rect x="52" y="40" width="276" height="400" rx="40" fill="' + G + '" stroke="' + GD + '" stroke-width="7"/>';
    b += '<rect x="74" y="76" width="232" height="322" rx="22" fill="' + SCREEN + '" stroke="' + GD + '" stroke-width="4"/>';
    b += '<circle cx="190" cy="58" r="6" fill="' + GD + '"/></g>';
    b += '<g class="c-face">';
    b += eye(150, 196, 21, 28, SCREEN, { sw: 0.01, pupil: 30, pupilFill: G });
    b += eye(230, 196, 21, 28, SCREEN, { sw: 0.01, pupil: 30, pupilFill: G });
    b += '<circle cx="114" cy="252" r="15" fill="#F2A6A0" opacity="0.75"/><circle cx="266" cy="252" r="15" fill="#F2A6A0" opacity="0.75"/>';
    b += brow("c-brow-l", 128, 150, 170, 148, 10, G, 8) + brow("c-brow-r", 210, 148, 252, 150, 10, G, 8);
    b += mouth(190, 262, 38, { dark: GD, tongue: "#F08A80", line: G, sw: 7, h: 40 });
    b += t(190, 368, 30, 700, G, "হিসাব খাতা", "middle");
    b += '</g>';
    b += ui();
    b += star(30, 60, 22, "s1") + star(352, 30, 16, "s2") + star(360, 460, 20, "s3") + star(18, 470, 14, "s4");
    return wrap("app", "0 0 380 540", b, 190, 520);
  }

  // ── ক্যালকুলেটর: the beeping sidekick ─────────────────────────────────────────────────────────
  function calc() {
    var b = shadow(120, 330, 80);
    b += g("c-leg-l", "92 296", '<path d="M92 296 L88 322" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><ellipse cx="80" cy="326" rx="20" ry="9" fill="#3A2A20"/>');
    b += g("c-leg-r", "148 296", '<path d="M148 296 L152 322" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><ellipse cx="160" cy="326" rx="20" ry="9" fill="#3A2A20"/>');
    b += hoseArm("c-arm-l", 24, 170, 2, 232, INK);
    b += hoseArm("c-arm-r", 216, 170, 238, 232, INK);
    b += '<g class="c-body"><rect x="20" y="20" width="200" height="282" rx="26" fill="#5B6770" stroke="' + INK + '" stroke-width="6"/>';
    b += '<rect x="40" y="40" width="160" height="66" rx="10" fill="#C9E4C1" stroke="' + INK + '" stroke-width="4"/>';
    b += '<text class="c-display" x="188" y="88" text-anchor="end" font-family="&#39;Hind Siliguri&#39;, sans-serif" font-weight="700" font-size="36" fill="#24402A">০</text>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) {
      var amber = r === 2 && c === 3;
      b += '<rect class="c-key c-key-' + (r * 4 + c) + '" x="' + (42 + c * 41) + '" y="' + (196 + r * 32) + '" width="34" height="24" rx="6" fill="' + (amber ? "#E4A11B" : "#ECE6D8") + '" stroke="' + INK + '" stroke-width="3"/>';
    }
    b += '</g>';
    b += '<g class="c-face">' + eye(94, 140, 15, 16, "#5B6770", { sw: 4, pupil: 6.5 }) + eye(146, 140, 15, 16, "#5B6770", { sw: 4, pupil: 6.5 }) + mouth(120, 172, 16, { sw: 4, h: 18, line: "#1B2328" }) + '</g>';
    return wrap("calc", "0 0 240 340", b, 120, 330);
  }

  var BUILD = { khata: khata, karim: karim, head: head, app: app, calc: calc, girl: girl, parent: parent };

  // ── expressions: lid 0 open → 1 shut · brows: rotation (deg) + lift (px) · mouth line shape ───────
  var EXPR = {
    neutral: { lid: 0.12, browL: 0, browR: 0, browY: 0, line: "neutral", pupil: 1 },
    tired: { lid: 0.45, browL: -10, browR: 10, browY: 4, line: "frown", pupil: 1 },
    shocked: { lid: 0, browL: 8, browR: -8, browY: -18, line: "flat", pupil: 0.7 },
    happy: { lid: 0.08, browL: 4, browR: -4, browY: -8, line: "smile", pupil: 1.05 },
    sad: { lid: 0.3, browL: -14, browR: 14, browY: 2, line: "frown", pupil: 1 },
    suspicious: { lid: 0.55, browL: 10, browR: 10, browY: 6, line: "flat", pupil: 0.9 },
    angry: { lid: 0.3, browL: 16, browR: -16, browY: 8, line: "frown", pupil: 0.9 },
    pain: { lid: 0.7, browL: -18, browR: 18, browY: 0, line: "frown", pupil: 0.8 },
    sleep: { lid: 1, browL: -4, browR: 4, browY: 4, line: "neutral", pupil: 1 },
  };
  function q(svg, s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); }
  function set(tl, t, targets, vars) {
    if (!targets || (targets.length !== undefined && !targets.length)) return;
    if (tl) tl.set(targets, vars, t); else gsap.set(targets, vars);
  }

  window.HKCast = {
    mount: function (el, name, opts) {
      opts = opts || {};
      el.insertAdjacentHTML("beforeend", BUILD[name](opts));
      var svg = el.lastElementChild;
      q(svg, "[data-o]").forEach(function (n) {
        var o = n.getAttribute("data-o").split(" ");
        gsap.set(n, { svgOrigin: o[0] + " " + o[1] });
        var r = n.getAttribute("data-rest");
        if (r) gsap.set(n, { rotation: Number(r) });
      });
      q(svg, ".c-mouth-open").forEach(function (m) { gsap.set(m, { transformOrigin: "50% 0%", scaleY: 0 }); });
      svg.__expr = "neutral";
      this.expr(svg, opts.expr || "neutral");
      return svg;
    },
    expr: function (svg, name, tl, t) {
      var e = EXPR[name] || EXPR.neutral;
      set(tl, t, q(svg, ".c-face .c-lid"), { scaleY: e.lid });
      set(tl, t, q(svg, ".c-brow-l"), { rotation: e.browL, y: e.browY });
      set(tl, t, q(svg, ".c-brow-r"), { rotation: e.browR, y: e.browY });
      set(tl, t, q(svg, ".c-pupil"), { scale: e.pupil });
      q(svg, ".c-mouth-line").forEach(function (p) {
        set(tl, t, p, { attr: { d: mouthLine(e.line, Number(p.getAttribute("data-w"))) } });
      });
    },
    lidOf: function (name) { return (EXPR[name] || EXPR.neutral).lid; },
    q: q,
    mouthLine: mouthLine,
    panel: panel,
  };
})();
