/* cast.js — the cartoon cast of "খাতা নিজেই কথা বলে", drawn in SVG and rigged for GSAP.
 *
 *   HKCast.mount(el, "khata", { expr: "tired" })   → puts the character's <svg> inside el, returns the svg
 *   HKCast.expr(svg, "happy", tl, t)               → sets an expression (with tl: at time t; else now)
 *   HKCast.blink(svg, tl, t) · HKCast.talk(svg, tl, t0, env, fps) · HKCast.look(svg, dx, dy, tl, t)
 *
 * Every animatable part has a class:  .c-root (whole body; origin = feet), .c-arm-l/.c-arm-r (origin =
 * shoulder), .c-fore-l/.c-fore-r (elbow), .c-lid (eyelid, scaleY 0 open → 1 shut), .c-pupil, .c-brow-l/-r,
 * .c-mouth-open (scaleY 0 closed → 1 wide), .c-mouth-line (shape swaps by expression).
 * Deterministic: no clocks, no randomness. Characters: khata, karim, head, app, calc.
 */
(function () {
  var INK = "#2A1E17";
  var uid = 0;
  function id(p) { uid += 1; return p + "-" + uid; }

  // ── shared parts ─────────────────────────────────────────────────────────────────────────────
  function eye(cx, cy, rx, ry, lidFill, opts) {
    opts = opts || {};
    var clip = id("eyeclip");
    var pr = opts.pupil || rx * 0.42;
    return '<g class="c-eye" data-cx="' + cx + '" data-cy="' + cy + '">' +
      '<clipPath id="' + clip + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#FFFFFF"/>' +
      '<g clip-path="url(#' + clip + ')">' +
        '<g class="c-pupil" data-o="' + cx + ' ' + (cy + ry * 0.12) + '">' +
          '<circle cx="' + cx + '" cy="' + (cy + ry * 0.12) + '" r="' + pr + '" fill="' + (opts.pupilFill || INK) + '"/>' +
          '<circle cx="' + (cx - pr * 0.35) + '" cy="' + (cy + ry * 0.12 - pr * 0.35) + '" r="' + (pr * 0.32) + '" fill="#FFFFFF"/>' +
        '</g>' +
        '<g class="c-lid" data-o="' + cx + ' ' + (cy - ry - 2) + '">' +
          '<rect x="' + (cx - rx - 4) + '" y="' + (cy - ry - 2) + '" width="' + (rx * 2 + 8) + '" height="' + (ry * 2 + 4) + '" fill="' + lidFill + '"/>' +
          '<line x1="' + (cx - rx - 4) + '" y1="' + (cy + ry + 2) + '" x2="' + (cx + rx + 4) + '" y2="' + (cy + ry + 2) + '" stroke="' + INK + '" stroke-width="5"/>' +
        '</g>' +
      '</g>' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + INK + '" stroke-width="' + (opts.sw || 6) + '"/>' +
      '</g>';
  }
  function brow(cls, x1, y1, x2, y2, lift, color, w) {
    var mx = (x1 + x2) / 2;
    return '<g class="' + cls + '" data-o="' + mx + ' ' + ((y1 + y2) / 2) + '">' +
      '<path d="M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + (Math.min(y1, y2) - lift) + ' ' + x2 + ' ' + y2 + '" fill="none" stroke="' + (color || INK) + '" stroke-width="' + (w || 9) + '" stroke-linecap="round"/></g>';
  }
  // mouth: a line (always drawn on top) + an opening that scales down from the line
  function mouth(cx, cy, w, opts) {
    opts = opts || {};
    var h = opts.h || w * 1.25;
    var dark = opts.dark || "#4A1410", tongue = opts.tongue || "#E8705F", line = opts.line || INK;
    return '<g class="c-mouth" transform="translate(' + cx + ' ' + cy + ')">' +
      '<g class="c-mouth-open" data-o="0 0">' +
        '<path d="M' + (-w) + ' 0 Q0 ' + (w * 0.25) + ' ' + w + ' 0 Q' + (w * 0.8) + ' ' + h + ' 0 ' + (h * 1.06) + ' Q' + (-w * 0.8) + ' ' + h + ' ' + (-w) + ' 0Z" fill="' + dark + '" stroke="' + line + '" stroke-width="' + (opts.sw || 6) + '" stroke-linejoin="round"/>' +
        '<path d="M' + (-w * 0.5) + ' ' + (h * 0.72) + ' Q0 ' + (h * 0.45) + ' ' + (w * 0.5) + ' ' + (h * 0.72) + ' Q' + (w * 0.36) + ' ' + h + ' 0 ' + (h * 1.0) + ' Q' + (-w * 0.36) + ' ' + h + ' ' + (-w * 0.5) + ' ' + (h * 0.72) + 'Z" fill="' + tongue + '"/>' +
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
  function hoseArm(cls, sx, sy, ex, ey, color, glove) {
    // rubber-hose arm with a cartoon glove; rotates around the shoulder (sx, sy)
    var c1x = sx + (ex - sx) * 0.1 + (sx < 200 ? -28 : 28), c1y = sy + (ey - sy) * 0.35;
    return '<g class="' + cls + '" data-o="' + sx + ' ' + sy + '">' +
      '<path d="M' + sx + ' ' + sy + ' Q' + c1x + ' ' + c1y + ' ' + ex + ' ' + ey + '" fill="none" stroke="' + color + '" stroke-width="11" stroke-linecap="round"/>' +
      '<circle cx="' + ex + '" cy="' + (ey + 10) + '" r="21" fill="' + (glove || "#FFFFFF") + '" stroke="' + INK + '" stroke-width="5"/>' +
      '<ellipse cx="' + (ex + (sx < 200 ? 15 : -15)) + '" cy="' + (ey + 2) + '" rx="8" ry="11" fill="' + (glove || "#FFFFFF") + '" stroke="' + INK + '" stroke-width="4"/>' +
      '</g>';
  }
  // two-segment human arm: sleeve (upper) + skin forearm (elbow pivot) + hand
  function humanArm(side, sx, sy, sleeve, skin, rest) {
    var s = side === "l" ? 1 : -1;
    return '<g class="c-arm-' + side + '" data-o="' + sx + ' ' + sy + '" data-rest="' + (rest * s) + '">' +
      '<rect x="' + (sx - 21) + '" y="' + (sy - 12) + '" width="42" height="122" rx="21" fill="' + sleeve + '" stroke="' + INK + '" stroke-width="6"/>' +
      '<g class="c-fore-' + side + '" data-o="' + sx + ' ' + (sy + 100) + '">' +
        '<rect x="' + (sx - 16) + '" y="' + (sy + 92) + '" width="32" height="104" rx="16" fill="' + skin + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<circle cx="' + sx + '" cy="' + (sy + 204) + '" r="23" fill="' + skin + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<g class="c-hold-' + side + '"></g>' +
      '</g>' +
      '</g>';
  }
  function shadow(cx, cy, rx) { return '<ellipse class="c-shadow" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (rx * 0.11) + '" fill="rgba(42,30,23,0.18)"/>'; }
  function wrap(name, vb, body, feetX, feetY) {
    return '<svg class="hk-char hk-' + name + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" overflow="visible">' +
      '<g class="c-root" data-o="' + feetX + ' ' + feetY + '">' + body + '</g></svg>';
  }

  // ── লাল খাতা: the old red ledger, hero and narrator ─────────────────────────────────────────────
  function khata() {
    var RED = "#C0392B", DARK = "#8E2A20", GOLD = "#E4A11B", PAPER = "#F7F1E3";
    var b = shadow(205, 562, 128);
    b += '<g class="c-leg-l"><path d="M160 470 L154 536" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><ellipse cx="142" cy="542" rx="28" ry="13" fill="#3A2A20" stroke="' + INK + '" stroke-width="5"/></g>';
    b += '<g class="c-leg-r"><path d="M252 470 L258 536" stroke="' + INK + '" stroke-width="11" stroke-linecap="round"/><ellipse cx="270" cy="542" rx="28" ry="13" fill="#3A2A20" stroke="' + INK + '" stroke-width="5"/></g>';
    b += hoseArm("c-arm-l", 66, 300, 30, 404, INK);
    b += hoseArm("c-arm-r", 340, 300, 376, 404, INK);
    // back cover + page block (the book's thickness, seen on the right)
    b += '<rect x="76" y="58" width="282" height="414" rx="16" fill="' + DARK + '" stroke="' + INK + '" stroke-width="6"/>';
    b += '<rect x="70" y="64" width="276" height="402" rx="10" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="5"/>';
    for (var i = 0; i < 4; i++) b += '<line x1="' + (334 + i * 3) + '" y1="74" x2="' + (334 + i * 3) + '" y2="456" stroke="#D8CDB5" stroke-width="1.6"/>';
    // front cover
    b += '<g class="c-cover">';
    b += '<rect x="56" y="48" width="280" height="428" rx="18" fill="' + RED + '" stroke="' + INK + '" stroke-width="7"/>';
    b += '<path d="M56 66 Q56 48 74 48 L98 48 L98 476 L74 476 Q56 476 56 458 Z" fill="' + DARK + '"/>';
    b += '<line x1="98" y1="52" x2="98" y2="472" stroke="' + INK + '" stroke-width="4"/>';
    b += '<rect x="58" y="104" width="40" height="11" fill="' + GOLD + '"/><rect x="58" y="408" width="40" height="11" fill="' + GOLD + '"/>';
    b += '<path d="M112 62 L320 62" stroke="#D9534A" stroke-width="6" stroke-linecap="round" opacity="0.8"/>';
    b += '<path d="M292 48 L336 48 L336 92 Z" fill="#D4A535" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<path d="M336 432 L336 476 L292 476 Z" fill="#D4A535" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<rect x="148" y="88" width="136" height="60" rx="10" fill="#F2E3B3" stroke="' + INK + '" stroke-width="5"/>';
    b += '<text x="216" y="130" text-anchor="middle" font-family="Baloo Da 2, Hind Siliguri, sans-serif" font-weight="700" font-size="38" fill="' + DARK + '">খাতা</text>';
    b += '</g>';
    // face
    b += '<g class="c-face">';
    b += '<path d="M144 320 Q166 330 188 320" fill="none" stroke="' + DARK + '" stroke-width="5" stroke-linecap="round"/>';
    b += '<path d="M246 320 Q268 330 290 320" fill="none" stroke="' + DARK + '" stroke-width="5" stroke-linecap="round"/>';
    b += eye(166, 258, 37, 45, RED);
    b += eye(268, 258, 37, 45, RED);
    b += '<g class="c-glasses"><circle cx="166" cy="258" r="48" fill="rgba(255,255,255,0.07)" stroke="#6B4A1F" stroke-width="5"/><circle cx="268" cy="258" r="48" fill="rgba(255,255,255,0.07)" stroke="#6B4A1F" stroke-width="5"/><path d="M213 250 Q217 242 221 250" fill="none" stroke="#6B4A1F" stroke-width="5"/></g>';
    b += brow("c-brow-l", 132, 194, 198, 190, 12);
    b += brow("c-brow-r", 236, 190, 302, 194, 12);
    b += mouth(216, 384, 46);
    b += '</g>';
    return wrap("khata", "0 0 412 580", b, 205, 560);
  }

  // ── human base (করিম স্যার, হেডস্যার) ─────────────────────────────────────────────────────────
  function karim() {
    var SKIN = "#C68A5E", SHIRT = "#F4F4EE", PANT = "#3B4A5A", HAIR = "#1F1A17";
    var b = shadow(200, 770, 120);
    b += '<path d="M140 548 L132 742 L192 742 L199 566 L203 566 L210 742 L270 742 L262 548 Z" fill="' + PANT + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<ellipse cx="158" cy="750" rx="42" ry="17" fill="' + INK + '"/><ellipse cx="242" cy="750" rx="42" ry="17" fill="' + INK + '"/>';
    b += humanArm("l", 118, 352, SHIRT, SKIN, 14);
    b += humanArm("r", 282, 352, SHIRT, SKIN, 14);
    b += '<path d="M108 338 Q200 302 292 338 L282 562 L118 562 Z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<rect x="178" y="270" width="44" height="52" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<path d="M166 318 L200 368 L234 318" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<path d="M178 318 L200 352 L222 318 Z" fill="' + SKIN + '"/>';
    for (var i = 0; i < 4; i++) b += '<circle cx="200" cy="' + (392 + i * 42) + '" r="4.5" fill="' + INK + '"/>';
    b += '<rect x="226" y="396" width="42" height="46" rx="4" fill="none" stroke="' + INK + '" stroke-width="4"/>';
    b += '<rect x="238" y="378" width="9" height="30" rx="3" fill="#2E5AA8" stroke="' + INK + '" stroke-width="3"/>';
    b += '<rect x="120" y="550" width="160" height="16" fill="' + INK + '"/><rect x="190" y="551" width="20" height="14" rx="2" fill="#B8860B"/>';
    // head
    b += '<ellipse cx="108" cy="190" rx="17" ry="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/><ellipse cx="292" cy="190" rx="17" ry="27" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<g class="c-head" data-o="200 280">';
    b += '<ellipse cx="200" cy="182" rx="94" ry="108" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="6"/>';
    b += '<path d="M108 168 Q106 72 200 66 Q294 72 292 168 Q284 118 236 112 Q206 132 170 112 Q118 118 108 168 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>';
    b += '<path d="M109 170 Q110 150 118 140 L122 176 Z" fill="#8C8C8C"/><path d="M291 170 Q290 150 282 140 L278 176 Z" fill="#8C8C8C"/>';
    b += '<g class="c-face">';
    b += eye(164, 178, 17, 19, SKIN, { sw: 5, pupil: 8 });
    b += eye(236, 178, 17, 19, SKIN, { sw: 5, pupil: 8 });
    b += '<g class="c-glasses"><circle cx="164" cy="178" r="33" fill="rgba(210,230,245,0.22)" stroke="' + INK + '" stroke-width="5"/><circle cx="236" cy="178" r="33" fill="rgba(210,230,245,0.22)" stroke="' + INK + '" stroke-width="5"/><path d="M196 172 Q200 164 204 172" fill="none" stroke="' + INK + '" stroke-width="5"/><path d="M131 172 L110 166" stroke="' + INK + '" stroke-width="5"/><path d="M269 172 L290 166" stroke="' + INK + '" stroke-width="5"/></g>';
    b += brow("c-brow-l", 138, 132, 188, 130, 8, HAIR, 10);
    b += brow("c-brow-r", 212, 130, 262, 132, 8, HAIR, 10);
    b += '<path d="M200 196 Q188 226 204 230" fill="none" stroke="#8A5A3A" stroke-width="5" stroke-linecap="round"/>';
    b += mouth(200, 262, 26, { sw: 5, h: 30 });
    b += '<path d="M146 246 Q172 226 200 238 Q228 226 254 246 Q236 258 200 248 Q164 258 146 246 Z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="3"/>';
    b += '</g></g>';
    return wrap("karim", "0 0 400 790", b, 200, 760);
  }

  function head() {
    var SKIN = "#B97E55", PANJABI = "#AFCDEA", PAJAMA = "#EDEDE7", GREY = "#B9BDC2";
    var b = shadow(210, 790, 130);
    b += '<path d="M148 640 L142 762 L200 762 L207 660 L213 660 L220 762 L278 762 L272 640 Z" fill="' + PAJAMA + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<path d="M128 770 Q170 752 208 770 Z" fill="#7A4E2D" stroke="' + INK + '" stroke-width="5"/><path d="M212 770 Q252 752 292 770 Z" fill="#7A4E2D" stroke="' + INK + '" stroke-width="5"/>';
    b += humanArm("l", 120, 356, PANJABI, SKIN, 12);
    b += humanArm("r", 300, 356, PANJABI, SKIN, 12);
    b += '<path d="M112 340 Q210 298 308 340 Q344 480 304 652 L116 652 Q76 480 112 340 Z" fill="' + PANJABI + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>';
    b += '<path d="M210 330 L210 450" stroke="' + INK + '" stroke-width="4"/>';
    for (var i = 0; i < 3; i++) b += '<circle cx="210" cy="' + (360 + i * 34) + '" r="5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5"/>';
    b += '<rect x="186" y="276" width="48" height="52" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<path d="M180 322 Q210 340 240 322" fill="none" stroke="' + INK + '" stroke-width="5"/>';
    b += '<ellipse cx="114" cy="196" rx="17" ry="28" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/><ellipse cx="306" cy="196" rx="17" ry="28" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="5"/>';
    b += '<g class="c-head" data-o="210 290">';
    b += '<ellipse cx="210" cy="186" rx="98" ry="112" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="6"/>';
    b += '<ellipse cx="180" cy="104" rx="34" ry="14" fill="#D49B70" opacity="0.6"/>';
    b += '<path d="M113 200 Q110 150 128 128 Q122 170 132 196 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/><path d="M307 200 Q310 150 292 128 Q298 170 288 196 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/>';
    b += '<g class="c-face">';
    b += eye(174, 186, 16, 17, SKIN, { sw: 5, pupil: 7.5 });
    b += eye(246, 186, 16, 17, SKIN, { sw: 5, pupil: 7.5 });
    b += '<g class="c-glasses"><rect x="144" y="186" width="60" height="38" rx="10" fill="rgba(210,230,245,0.25)" stroke="' + INK + '" stroke-width="5"/><rect x="216" y="186" width="60" height="38" rx="10" fill="rgba(210,230,245,0.25)" stroke="' + INK + '" stroke-width="5"/><path d="M204 200 L216 200" stroke="' + INK + '" stroke-width="5"/></g>';
    b += brow("c-brow-l", 146, 152, 198, 150, 6, GREY, 13);
    b += brow("c-brow-r", 222, 150, 274, 152, 6, GREY, 13);
    b += '<path d="M210 206 Q196 238 214 242" fill="none" stroke="#7E4F31" stroke-width="5" stroke-linecap="round"/>';
    b += mouth(210, 278, 28, { sw: 5, h: 32 });
    b += '<path d="M146 262 Q178 238 210 252 Q242 238 274 262 Q252 278 210 266 Q168 278 146 262 Z" fill="' + GREY + '" stroke="' + INK + '" stroke-width="4"/>';
    b += '</g></g>';
    return wrap("head", "0 0 420 810", b, 210, 780);
  }

  // ── হিসাব খাতা: the friendly tablet ────────────────────────────────────────────────────────────
  function app() {
    var G = "#16603A", GD = "#0E3F26", SCREEN = "#EAF6EE";
    var glow = id("glow");
    var b = '<defs><radialGradient id="' + glow + '"><stop offset="0" stop-color="#9FE3B8" stop-opacity="0.75"/><stop offset="1" stop-color="#9FE3B8" stop-opacity="0"/></radialGradient></defs>';
    b += '<circle class="c-glow" cx="190" cy="240" r="215" fill="url(#' + glow + ')"/>';
    b += shadow(190, 520, 92);
    b += hoseArm("c-arm-l", 56, 268, 18, 352, G);
    b += hoseArm("c-arm-r", 324, 268, 362, 352, G);
    b += '<rect x="52" y="40" width="276" height="400" rx="40" fill="' + G + '" stroke="' + GD + '" stroke-width="7"/>';
    b += '<rect x="74" y="76" width="232" height="322" rx="22" fill="' + SCREEN + '" stroke="' + GD + '" stroke-width="4"/>';
    b += '<circle cx="190" cy="58" r="6" fill="' + GD + '"/>';
    b += '<g class="c-face">';
    b += eye(150, 196, 21, 28, SCREEN, { sw: 0.01, pupil: 30, pupilFill: G });
    b += eye(230, 196, 21, 28, SCREEN, { sw: 0.01, pupil: 30, pupilFill: G });
    b += '<circle cx="114" cy="252" r="15" fill="#F2A6A0" opacity="0.75"/><circle cx="266" cy="252" r="15" fill="#F2A6A0" opacity="0.75"/>';
    b += brow("c-brow-l", 128, 150, 170, 148, 10, G, 8);
    b += brow("c-brow-r", 210, 148, 252, 150, 10, G, 8);
    b += mouth(190, 262, 38, { dark: GD, tongue: "#F08A80", line: G, sw: 7, h: 40 });
    b += '<text x="190" y="368" text-anchor="middle" font-family="Hind Siliguri, sans-serif" font-weight="700" font-size="30" fill="' + G + '">হিসাব খাতা</text>';
    b += '</g>';
    var star = function (x, y, r, cls) { return '<path class="c-spark ' + cls + '" data-o="' + x + ' ' + y + '" d="M' + x + ' ' + (y - r) + ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + ' Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + ' Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'Z" fill="#E4A11B"/>'; };
    b += star(30, 60, 22, "s1") + star(352, 30, 16, "s2") + star(360, 460, 20, "s3") + star(18, 470, 14, "s4");
    return wrap("app", "0 0 380 540", b, 190, 520);
  }

  // ── ক্যালকুলেটর: the beeping sidekick ─────────────────────────────────────────────────────────
  function calc() {
    var b = shadow(120, 330, 80);
    b += '<path d="M92 296 L88 322" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><ellipse cx="80" cy="326" rx="20" ry="9" fill="#3A2A20"/>';
    b += '<path d="M148 296 L152 322" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><ellipse cx="160" cy="326" rx="20" ry="9" fill="#3A2A20"/>';
    b += hoseArm("c-arm-l", 24, 170, 2, 232, INK);
    b += hoseArm("c-arm-r", 216, 170, 238, 232, INK);
    b += '<rect x="20" y="20" width="200" height="282" rx="26" fill="#5B6770" stroke="' + INK + '" stroke-width="6"/>';
    b += '<rect x="40" y="40" width="160" height="66" rx="10" fill="#C9E4C1" stroke="' + INK + '" stroke-width="4"/>';
    b += '<text class="c-display" x="188" y="88" text-anchor="end" font-family="Hind Siliguri, JetBrains Mono, sans-serif" font-weight="700" font-size="36" fill="#24402A">০</text>';
    b += '<g class="c-face">';
    b += eye(94, 140, 15, 16, "#5B6770", { sw: 4, pupil: 6.5 });
    b += eye(146, 140, 15, 16, "#5B6770", { sw: 4, pupil: 6.5 });
    b += mouth(120, 172, 16, { sw: 4, h: 18, line: "#1B2328" });
    b += '</g>';
    for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) {
      var amber = r === 2 && c === 3;
      b += '<rect x="' + (42 + c * 41) + '" y="' + (196 + r * 32) + '" width="34" height="24" rx="6" fill="' + (amber ? "#E4A11B" : "#ECE6D8") + '" stroke="' + INK + '" stroke-width="3"/>';
    }
    return wrap("calc", "0 0 240 340", b, 120, 330);
  }

  var BUILD = { khata: khata, karim: karim, head: head, app: app, calc: calc };

  // ── expressions: lid 0 open → 1 shut · brows: rotation (deg) + lift (px) · mouth line shape ───────
  var EXPR = {
    neutral: { lid: 0.12, browL: 0, browR: 0, browY: 0, line: "neutral", pupil: 1 },
    tired: { lid: 0.45, browL: -10, browR: 10, browY: 4, line: "frown", pupil: 1 },
    shocked: { lid: 0, browL: 8, browR: -8, browY: -18, line: "flat", pupil: 0.7 },
    happy: { lid: 0.08, browL: 4, browR: -4, browY: -8, line: "smile", pupil: 1.05 },
    sad: { lid: 0.3, browL: -14, browR: 14, browY: 2, line: "frown", pupil: 1 },
    suspicious: { lid: 0.55, browL: 10, browR: 10, browY: 6, line: "flat", pupil: 0.9 },
    angry: { lid: 0.3, browL: 16, browR: -16, browY: 8, line: "frown", pupil: 0.9 },
  };
  function q(svg, s) { return Array.prototype.slice.call(svg.querySelectorAll(s)); }
  function set(tl, t, targets, vars) {
    if (!targets || (targets.length !== undefined && !targets.length)) return;
    if (tl) tl.set(targets, vars, t); else gsap.set(targets, vars);
  }

  window.HKCast = {
    mount: function (el, name, opts) {
      opts = opts || {};
      el.insertAdjacentHTML("beforeend", BUILD[name]());
      var svg = el.lastElementChild;
      // pivots in SVG user units (data-o), then the rest pose: mouths closed, arms at rest, eyes open
      q(svg, "[data-o]").forEach(function (g) {
        var o = g.getAttribute("data-o").split(" ");
        if (g.closest(".c-mouth")) {   // mouth parts live inside a translated group: pivot is local 0 0
          gsap.set(g, { transformOrigin: "50% 0%" });
        } else gsap.set(g, { svgOrigin: o[0] + " " + o[1] });
        var r = g.getAttribute("data-rest");
        if (r) gsap.set(g, { rotation: Number(r) });
      });
      gsap.set(q(svg, ".c-mouth-open"), { scaleY: 0 });
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
    // a blink: lids shut and reopen to the expression's lid (default 0.12) in 0.16 s
    blink: function (svg, tl, t, rest) {
      var lids = q(svg, ".c-face .c-lid");
      tl.to(lids, { scaleY: 1, duration: 0.07, ease: "power1.in" }, t);
      tl.to(lids, { scaleY: rest === undefined ? 0.12 : rest, duration: 0.09, ease: "power1.out" }, t + 0.07);
    },
    look: function (svg, dx, dy, tl, t, dur) {
      tl.to(q(svg, ".c-pupil"), { x: dx, y: dy, duration: dur || 0.25, ease: "power2.out" }, t);
    },
    // lip flap from a loudness envelope (0..1 per frame at fps): one set per frame, deterministic
    talk: function (svg, tl, t0, env, fps) {
      var m = q(svg, ".c-mouth-open");
      var step = 1 / (fps || 30);
      for (var i = 0; i < env.length; i++) tl.set(m, { scaleY: env[i] }, t0 + i * step);
      tl.set(m, { scaleY: 0 }, t0 + env.length * step);
    },
    mouthLine: mouthLine,
  };
})();
