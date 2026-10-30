#!/usr/bin/env node
// design-lint.mjs — the design review a professional would do before rendering, done by measuring the real
// page at every 0.25 s of the timeline. `hyperframes check` catches broken things (overflow, overlap,
// contrast); this catches the things that make a video look amateur:
//
//   node "E:/Video Create/tools/design-lint.mjs" <project> [--step=0.25] [--fix] [--strict] [--json]
//
//   ERROR  bn_tracking     letter-spacing on Bengali text — it pulls the clusters apart and breaks the matra
//                          line ("সং খ্যা য়"). --fix sets those CSS rules to letter-spacing: 0.
//   ERROR  frame_breach    content between a frame's top and bottom hairlines sticks out past their ends.
//   ERROR  card_straddle   text half on, half off a card / panel it sits over.
//   ERROR  font_fallback   Bengali text partly drawn in a SYSTEM font because no listed family has those glyphs
//                          (asked from Chrome itself, per scene): looks different per machine. WARN for Latin.
//   WARN   peer_misaligned elements that share a class and sit side by side (or stacked) are 2–24 px apart
//                          on every edge, top, bottom and baseline: almost aligned, which reads as a mistake.
//   WARN   orphan_word     a heading that wraps one lonely word onto its last line.
//   INFO   small_text      text under 20 px at 1080p: unreadable on a phone (fine for page furniture).
//   Only when the page's root has data-safe-profile="<profile>" (or --profile=<profile>, e.g. to test an old page):
//   ERROR  safe_zone       text outside the profile's text-safe box (tools/release/platforms.json → limits(): for
//                          universal-reel x 65–886, y 288–1248 at 1080×1920), where platform buttons, the caption
//                          strip or the 4:5 feed crop cover it. Escape: data-safe-ignore.
//   WARN   text_zones      more than 3 separate text zones on screen at once (zone = the root child the text is in):
//                          the eye has no single place to go. Visual hierarchy: header, chips, caption.
//
// Layout findings only count when HELD: seen at 2+ consecutive samples with the element standing still, so
// entrances, exits and crossfades never trigger them. When a finding comes from a scaled ancestor (a slow
// "camera push" that leaves the card and hairlines behind), the message names it — end pushes at scale 1.
// Escape hatches, on the element or a wrapper: data-design-ignore (skip it), data-design-allow-breach,
// data-design-allow-straddle, data-design-allow-misalign. data-layout-ignore is honoured too.
// Exit code 1 on any ERROR (with --strict, on WARN too). Needs no network.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { openProject } from "./hf-page.mjs";
import { limits } from "./release/spec-check.mjs";

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=") || true]; }));
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.log("Usage: node design-lint.mjs <project folder> [--step=0.25] [--fix] [--strict] [--json]");
  process.exit(2);
}
const projectDir = path.resolve(target);
if (!existsSync(path.join(projectDir, "index.html"))) { console.error(`✗ No index.html in ${projectDir}`); process.exit(2); }
const STEP = Math.max(0.05, parseFloat(flags.step) || 0.25);

// ── in-page collector: everything the rules need, measured at one seek time ─────────────────────────────
function collect() {
  const W = innerWidth, H = innerHeight;
  const BN = /[\u0980-\u09E5\u09F0-\u09FF]/;   // Bengali letters, not digits: digits have no matra line
  const csC = new Map();
  const cs = (el) => { let s = csC.get(el); if (!s) { s = getComputedStyle(el); csC.set(el, s); } return s; };
  const r1 = (v) => Math.round(v * 10) / 10;
  const rectOf = (r) => ({ l: r1(r.left), t: r1(r.top), r: r1(r.right), b: r1(r.bottom) });
  const alpha = (c) => {
    if (!c || c === "transparent") return 0;
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    return p.length > 3 ? parseFloat(p[3]) * (p[3].endsWith("%") ? 0.01 : 1) : 1;
  };
  const matrix = (el) => {
    const t = cs(el).transform;
    if (!t || t === "none") return null;
    const m = t.match(/matrix(3d)?\(([^)]+)\)/);
    if (!m) return null;
    const v = m[2].split(",").map(Number);
    return m[1] ? { a: v[0], b: v[1] } : { a: v[0], b: v[1] };
  };
  const opacityChain = new Map();
  const visibleFactor = (el) => {          // 0 when not painted, else the effective opacity
    if (!el || el.nodeType !== 1) return 1;
    if (opacityChain.has(el)) return opacityChain.get(el);
    const s = cs(el);
    const own = s.display === "none" ? 0 : parseFloat(s.opacity || "1");
    const v = own === 0 ? 0 : own * visibleFactor(el.parentElement);
    opacityChain.set(el, v);
    return v;
  };
  const vis = (el) => (cs(el).visibility === "visible" ? visibleFactor(el) : 0);
  const comp = (el) => el.closest("[data-composition-id]")?.getAttribute("data-composition-id") ?? "?";
  const flagOf = (el, name) => !!el.closest(`[${name}]`);
  const ignored = (el) => flagOf(el, "data-design-ignore") || flagOf(el, "data-layout-ignore");
  const idOf = (el) => {
    const hf = el.getAttribute("data-hf-id");
    if (hf) return hf;
    const parts = [];
    for (let n = el; n && !n.hasAttribute?.("data-composition-id"); n = n.parentElement) {
      const i = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      parts.unshift(`${n.tagName.toLowerCase()}:${i}`);
    }
    return parts.join(">");
  };
  const clsOf = (el) => (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).sort().join(".");
  const scaledAncestors = (el) => {
    const out = [];
    for (let n = el; n && !(n.hasAttribute("data-composition-id") && n !== el); n = n.parentElement) {
      const m = matrix(n);
      if (!m) continue;
      const s = Math.hypot(m.a, m.b);
      if (Math.abs(s - 1) > 0.004) out.push({ id: idOf(n), cls: clsOf(n), s: Math.round(s * 1000) / 1000 });
    }
    return out;
  };
  const rotated = (el) => {
    for (let n = el; n && !n.hasAttribute("data-composition-id"); n = n.parentElement) {
      const m = matrix(n);
      if (m && Math.abs(Math.atan2(m.b, m.a)) > 0.01) return true;
    }
    return false;
  };
  const clippedAway = (el, r) => {       // hidden behind an overflow-clipping ancestor (mask reveals)
    let { left: l, top: t, right: rr, bottom: b } = r;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = cs(n);
      if (s.overflow === "visible" && s.overflowX === "visible" && s.overflowY === "visible" && s.clipPath === "none") continue;
      const c = n.getBoundingClientRect();
      l = Math.max(l, c.left); t = Math.max(t, c.top); rr = Math.min(rr, c.right); b = Math.min(b, c.bottom);
      if (rr - l <= 1 || b - t <= 1) return true;
    }
    return (rr - l) * (b - t) < 0.15 * (r.width * r.height);
  };
  const canvas = document.createElement("canvas").getContext("2d");
  // A text range's box is the font's whole ascent+descent, far taller than the ink for display faces
  // (Baloo reserves room for vowel signs). Measure the ink so "outside the card" means visibly outside.
  const metricsOf = (el, text) => {
    const s = cs(el);
    canvas.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const m = canvas.measureText(text);
    const fa = m.fontBoundingBoxAscent || parseFloat(s.fontSize) * 0.8;
    return { fa, ia: m.actualBoundingBoxAscent ?? fa, id: m.actualBoundingBoxDescent ?? 0 };
  };
  // the selectors (as the page sees them) of every CSS rule that sets `prop` on el — so --fix can find them
  const rulesSetting = (el, prop) => {
    const out = [];
    const walk = (rules) => {
      for (const r of rules) {
        if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue; }
        if (!r.selectorText || !r.style?.[prop]) continue;
        for (const part of r.selectorText.split(",")) { try { if (el.matches(part.trim())) out.push(part.trim()); } catch {} }
      }
    };
    for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch {} }
    return out;
  };
  const INLINE = new Set(["inline", "inline-block", "inline-flex", "inline-grid", "contents", "ruby"]);
  const ownerOf = (el) => {
    let n = el;
    while (n.parentElement && INLINE.has(cs(n).display) && !n.parentElement.hasAttribute("data-composition-id")) n = n.parentElement;
    return n;
  };
  const scaleOf = (el) => { const w = el.offsetWidth; return w ? el.getBoundingClientRect().width / w : 1; };
  const zoneOf = (el) => {
    let n = el;
    while (n.parentElement && !n.parentElement.hasAttribute("data-composition-id")) n = n.parentElement;
    return n.id ? `#${n.id}` : n.className && typeof n.className === "string" ? `.${n.className.trim().split(/\s+/)[0]}` : n.tagName.toLowerCase();
  };

  // text blocks
  const owners = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;
    const leaf = node.parentElement;
    if (!leaf || leaf.closest("script,style,template,svg,title")) continue;
    if (ignored(leaf)) continue;
    const v = vis(leaf);
    if (v < 0.3) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
    if (!rects.length) continue;
    if (clippedAway(leaf, rects[0])) continue;
    const owner = ownerOf(leaf);
    let o = owners.get(owner);
    if (!o) {
      o = { el: owner, text: "", rects: [], leaves: [], vis: 0, fontPx: 0, firstTop: Infinity, baseline: null, lastRight: null, lastLeaf: null };
      owners.set(owner, o);
    }
    // words wrapped in separate spans: put the space back when there is a visible gap
    if (o.lastLeaf && o.lastLeaf !== leaf && rects[0].left - o.lastRight > 0.15 * parseFloat(cs(leaf).fontSize) && !/\s$/.test(o.text)) o.text += " ";
    o.text += text;
    o.lastRight = rects.at(-1).right;
    o.lastLeaf = leaf;
    o.vis = Math.max(o.vis, v);
    const s = cs(leaf);
    let sEl = leaf;
    while (cs(sEl).display === "inline" && sEl.parentElement) sEl = sEl.parentElement;
    const sc = scaleOf(sEl) || 1;
    const fontPx = parseFloat(s.fontSize) * sc;
    o.fontPx = Math.max(o.fontPx, fontPx);
    const mt = metricsOf(leaf, text.trim());
    const asc = mt.fa * sc;
    for (const r of rects) o.rects.push({ left: r.left, right: r.right, top: r.top + asc - mt.ia * sc, bottom: r.top + asc + mt.id * sc });
    const top = Math.min(...rects.map((r) => r.top));
    if (top < o.firstTop - 2 || (Math.abs(top - o.firstTop) <= 2 && (o.baseline === null || top + asc > o.baseline))) {
      if (top < o.firstTop - 2) o.baseline = null;
      o.firstTop = Math.min(o.firstTop, top);
      o.baseline = Math.max(o.baseline ?? -Infinity, top + asc);
    }
    // positive tracking opens gaps in the matra line; slight negative tracking is harmless
    const ls = parseFloat(s.letterSpacing) || 0;
    const em = ls / parseFloat(s.fontSize);
    if (BN.test(text) && (em >= 0.008 || em <= -0.04)) {
      let decl = leaf;     // walk up to the element whose own CSS sets the spacing
      while (decl.parentElement && cs(decl.parentElement).letterSpacing === s.letterSpacing && !decl.parentElement.hasAttribute("data-composition-id")) decl = decl.parentElement;
      o.leaves.push({ lsPx: Math.round(ls * 100) / 100, em: Math.round(em * 1000) / 1000, declId: idOf(decl), declCls: clsOf(decl), inlineStyle: (decl.getAttribute("style") || "").includes("letter-spacing"), rules: rulesSetting(decl, "letterSpacing") });
    }
  }
  const texts = [];
  for (const o of owners.values()) {
    const rs = o.rects;
    const box = { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) };
    const lines = [];
    for (const r of [...rs].sort((a, b) => a.top - b.top)) {
      const cy = (r.top + r.bottom) / 2;
      const line = lines.find((L) => cy > L.t && cy < L.b);
      if (line) { line.l = Math.min(line.l, r.left); line.r = Math.max(line.r, r.right); line.t = Math.min(line.t, r.top); line.b = Math.max(line.b, r.bottom); }
      else lines.push({ l: r.left, r: r.right, t: r.top, b: r.bottom });
    }
    texts.push({
      kind: "text", id: idOf(o.el), comp: comp(o.el), cls: clsOf(o.el), tag: o.el.tagName.toLowerCase(),
      text: o.text.replace(/\s+/g, " ").trim().slice(0, 60), words: o.text.trim().split(/\s+/).length,
      rect: rectOf(box), lines: lines.length, lastLineW: r1(lines.at(-1).r - lines.at(-1).l), maxLineW: r1(Math.max(...lines.map((L) => L.r - L.l))),
      fontPx: r1(o.fontPx), baseline: o.baseline === null ? null : r1(o.baseline), vis: r1(o.vis), bnTracking: o.leaves,
      rot: rotated(o.el), scaled: scaledAncestors(o.el), zone: zoneOf(o.el),
      allow: { breach: flagOf(o.el, "data-design-allow-breach") || flagOf(o.el, "data-layout-allow-overflow"), straddle: flagOf(o.el, "data-design-allow-straddle"), misalign: flagOf(o.el, "data-design-allow-misalign"), safe: flagOf(o.el, "data-safe-ignore") },
      _el: o.el,
    });
  }

  // cards (painted panels), rules (hairlines) and media
  const cards = [], rules = [], media = [];
  for (const el of document.body.querySelectorAll("*")) {
    const tag = el.tagName.toLowerCase();
    if (el.closest("svg") && tag !== "svg") continue;
    if (["script", "style", "template", "br", "source", "track"].includes(tag)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (ignored(el)) continue;
    const v = vis(el);
    if (v < 0.12) continue;
    const s = cs(el);
    const base = () => ({ id: idOf(el), comp: comp(el), cls: clsOf(el), tag, rect: rectOf(r), vis: Math.round(v * 100) / 100, rot: rotated(el), scaled: scaledAncestors(el),
      allow: { breach: flagOf(el, "data-design-allow-breach") || flagOf(el, "data-layout-allow-overflow"), straddle: flagOf(el, "data-design-allow-straddle"), misalign: flagOf(el, "data-design-allow-misalign") }, _el: el });
    const thinH = r.height <= 6 && r.width >= 40, thinV = r.width <= 6 && r.height >= 40;
    if (tag === "svg") {
      if ((thinH || thinV) && el.querySelector("line,path,rect,polyline")) rules.push({ ...base(), kind: "rule", dir: thinH ? "h" : "v" });
      else if (r.width * r.height >= 0.003 * W * H) media.push({ ...base(), kind: "media" });
      continue;
    }
    if (["img", "video", "canvas"].includes(tag)) { if (r.width * r.height >= 0.003 * W * H) media.push({ ...base(), kind: "media" }); continue; }
    const bg = alpha(s.backgroundColor) * v;
    const sides = ["Top", "Right", "Bottom", "Left"].filter((k) => parseFloat(s[`border${k}Width`]) >= 1 && alpha(s[`border${k}Color`]) * v >= 0.25).length;
    if (thinH || thinV) {
      if (bg >= 0.2 || sides >= 1) rules.push({ ...base(), kind: "rule", dir: thinH ? "h" : "v" });
      continue;
    }
    const area = r.width * r.height;
    // a card is an upright panel: a rotated stroke's bounding box is not a surface anything sits on
    if ((bg >= 0.12 || sides >= 3) && area >= 0.012 * W * H && r.width >= 12 && r.height >= 12 && !(r.width >= 0.96 * W && r.height >= 0.96 * H) && !rotated(el)) cards.push({ ...base(), kind: "card" });
  }
  for (const t of texts) {
    t.inCards = cards.filter((c) => c._el.contains(t._el)).map((c) => c.id);
  }
  const strip = (a) => a.map(({ _el, ...rest }) => rest);
  return { W, H, profile: document.querySelector("[data-safe-profile]")?.getAttribute("data-safe-profile") ?? null, texts: strip(texts), cards: strip(cards), rules: strip(rules), media: strip(media) };
}

// ── rules, applied to one sample ─────────────────────────────────────────────────────────────────────────
const hits = new Map();   // key → { code, sev, comp, ids, samples: [{ t, rects, msg, detail }] }
function hit(code, sev, comp, ids, t, rects, msg, detail = {}) {
  const key = `${code}|${comp}|${ids.join("+")}`;
  let h = hits.get(key);
  if (!h) { h = { code, sev, comp, ids, samples: [] }; hits.set(key, h); }
  h.samples.push({ t, rects, msg, detail });
  if (sev === "error") h.sev = "error";
}
const area = (r) => Math.max(0, r.r - r.l) * Math.max(0, r.b - r.t);
const inter = (a, b) => area({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) });
const scaleNote = (it) => (it.scaled?.length ? ` — it is held at scale ${it.scaled[0].s} by its ancestor .${it.scaled[0].cls || it.scaled[0].id} (a camera push that leaves the frame furniture behind: end the push at scale 1, or push the furniture too)` : "");
const px = (v) => `${Math.round(v)} px`;

// platform safe zones and visual hierarchy, for pages that declare a profile (release system step 2)
const boxes = new Map();
function safeRules(t, s, prof) {
  const key = `${prof}|${s.W}x${s.H}`;
  if (!boxes.has(key)) boxes.set(key, limits(prof, s.W, s.H).box);
  const b = boxes.get(key);
  const zones = new Set();
  for (const tx of s.texts) {
    if (tx.vis < 0.5) continue;
    zones.add(tx.zone);
    if (tx.allow.safe) continue;
    const r = tx.rect;
    const [side, d] = Object.entries({ left: b.x0 - r.l, right: r.r - b.x1, top: b.y0 - r.t, bottom: r.b - b.y1 }).sort((p, q) => q[1] - p[1])[0];
    if (d > 1) hit("safe_zone", "error", tx.comp, [tx.id], t, [tx.rect],
      `"${tx.text}" (${tx.zone}) sits ${px(d)} past the ${side} edge of the ${prof} text-safe box (x ${b.x0}–${b.x1}, y ${b.y0}–${b.y1}) — a platform's buttons, caption strip or feed crop can cover it there`, { size: d });
  }
  if (zones.size > 3) hit("text_zones", "warn", "main", ["zones"], t, [],
    `${zones.size} text zones on screen at once (${[...zones].join(", ")}) — the eye has no single place to go; keep at most 3 (header, chips, caption)`, { size: zones.size });
}

function analyse(t, s) {
  const prof = typeof flags.profile === "string" ? flags.profile : s.profile;
  if (prof) safeRules(t, s, prof);
  const minPx = 20 * Math.min(s.W, s.H) / 1080;
  const byComp = new Map();
  for (const kind of ["texts", "cards", "rules", "media"]) for (const it of s[kind]) {
    if (!byComp.has(it.comp)) byComp.set(it.comp, { texts: [], cards: [], rules: [], media: [] });
    byComp.get(it.comp)[kind].push(it);
  }
  for (const [comp, g] of byComp) {
    for (const tx of g.texts) {
      for (const leaf of tx.bnTracking) {
        const sev = leaf.em >= 0.03 ? "error" : "warn";
        const what = leaf.em < 0 ? "tight enough that glyphs may collide" : leaf.em >= 0.03 ? "it pulls the clusters apart and breaks the matra line" : "a slight gap in the matra line";
        hit("bn_tracking", sev, comp, [leaf.declId], t, [tx.rect],
          `letter-spacing ${leaf.em}em on Bengali "${tx.text}" (${leaf.rules?.[0] ?? (leaf.declCls ? "." + leaf.declCls : leaf.declId)}): ${what} — Bengali takes no tracking; set it to 0`,
          { declCls: leaf.declCls, declId: leaf.declId, inlineStyle: leaf.inlineStyle, rules: leaf.rules });
      }
      if (tx.fontPx < minPx && tx.vis >= 0.5 && tx.text.length >= 2) hit("small_text", "info", comp, [tx.id], t, null, `${tx.fontPx} px: "${tx.text}"`);
      if (tx.vis >= 0.5 && tx.fontPx >= 36 && tx.lines >= 2 && tx.words >= 3 && tx.lastLineW < 0.25 * tx.maxLineW)
        hit("orphan_word", "warn", comp, [tx.id], t, [tx.rect], `"${tx.text}" leaves one short word alone on its last line (${px(tx.lastLineW)} of ${px(tx.maxLineW)}) — rebalance the break or use text-wrap: balance`);
    }

    // frame hairlines: full-width horizontal rules of this composition
    const guides = g.rules.filter((r) => r.dir === "h" && r.rect.r - r.rect.l >= 0.6 * s.W && r.vis >= 0.3 && !r.rot);
    if (guides.length >= 2) {
      const ys = guides.map((r) => (r.rect.t + r.rect.b) / 2);
      const topY = Math.min(...ys), botY = Math.max(...ys);
      if (botY - topY >= 0.4 * s.H) {
        const L = Math.max(...guides.map((r) => r.rect.l)), R = Math.min(...guides.map((r) => r.rect.r));
        const content = [...g.texts, ...g.cards, ...g.media, ...g.rules.filter((r) => !guides.includes(r))];
        for (const it of content) {
          if (it.vis < 0.5 || it.allow.breach || it.rot) continue;
          const cy = (it.rect.t + it.rect.b) / 2;
          if (cy <= topY || cy >= botY) continue;
          const over = Math.max(L - it.rect.l, it.rect.r - R);
          if (over > 2) {
            const side = L - it.rect.l > it.rect.r - R ? "left" : "right";
            hit("frame_breach", "error", comp, [it.id], t, [it.rect, { l: L, r: R, t: topY, b: botY }],
              `${it.kind} ${it.text ? `"${it.text}"` : `.${it.cls || it.id}`} sticks out ${px(over)} past the ${side} end of the frame hairlines (x ${Math.round(L)}–${Math.round(R)})${scaleNote(it)}`,
              { size: over });
          }
        }
      }
    }

    // text half on, half off a card
    for (const tx of g.texts) {
      if (tx.vis < 0.5 || tx.allow.straddle) continue;
      const ta = area(tx.rect);
      if (ta <= 0) continue;
      for (const c of g.cards) {
        if (c.allow.straddle || area(c.rect) < 1.5 * ta) continue;
        const f = inter(tx.rect, c.rect) / ta;
        if (f > 0.03 && f < 0.97) {
          const out = Math.round((1 - f) * 100);
          hit("card_straddle", "error", comp, [tx.id, c.id], t, [tx.rect, c.rect],
            `"${tx.text}" hangs ${out}% outside the card .${c.cls || c.id} it sits on${tx.inCards.includes(c.id) ? " (it is inside the card in the HTML, so it overflows it)" : " (the card is placed separately — size it from its content instead)"}${scaleNote(tx)}`,
            { size: out });
        }
      }
    }

    // peers that are almost, but not quite, aligned
    const groups = new Map();
    for (const it of [...g.texts, ...g.rules, ...g.cards]) {
      if (it.vis < 0.5 || it.rot || it.allow.misalign || !it.cls) continue;
      const k = `${it.kind}:${it.tag}.${it.cls}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(it);
    }
    for (const [k, items] of groups) {
      if (items.length < 2 || items.length > 12) continue;
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const a = items[i].rect, b = items[j].rect;
        const xOverlap = Math.min(a.r, b.r) - Math.max(a.l, b.l), yOverlap = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        const minH = Math.min(a.b - a.t, b.b - b.t), minW = Math.min(a.r - a.l, b.r - b.l);
        let deltas, axis;
        if (xOverlap <= 0 && yOverlap > -0.5 * minH - 30) {          // side by side → compare horizontal lines
          axis = "row";
          deltas = { top: a.t - b.t, bottom: a.b - b.b, centre: (a.t + a.b - b.t - b.b) / 2 };
          if (items[i].baseline != null && items[j].baseline != null) deltas.baseline = items[i].baseline - items[j].baseline;
        } else if (yOverlap <= 0 && xOverlap > 0.3 * minW) {         // stacked → compare vertical lines
          axis = "column";
          deltas = { left: a.l - b.l, right: a.r - b.r, centre: (a.l + a.r - b.l - b.r) / 2 };
        } else continue;
        const tol = 1.5;
        const abs = Object.entries(deltas).map(([n, d]) => [n, Math.abs(d)]);
        if (abs.some(([, d]) => d <= tol)) continue;
        const [name, d] = abs.sort((p, q) => p[1] - q[1])[0];
        if (d > 24) continue;
        const label = (it) => (it.text ? `"${it.text}"` : `.${it.cls}`);
        hit("peer_misaligned", "warn", comp, [items[i].id, items[j].id], t, [a, b],
          `${label(items[i])} and ${label(items[j])} (both .${k.split(".").slice(1).join(".")}, in a ${axis}) miss alignment by ${px(d)} — nearest is the ${name}; line them up exactly${scaleNote(items[i])}`,
          { size: d });
      }
    }
  }
}

// ── held = seen at 2+ consecutive samples while standing still ───────────────────────────────────────────
function held(h) {
  if (["bn_tracking", "small_text", "font_fallback"].includes(h.code)) return h.samples;
  const keep = new Set();
  const ss = h.samples;
  for (let i = 1; i < ss.length; i++) {
    if (Math.abs(ss[i].t - ss[i - 1].t - STEP) > STEP / 2) continue;
    const still = ss[i].rects.every((r, k) => {
      const p = ss[i - 1].rects[k];
      return Math.max(Math.abs(r.l - p.l), Math.abs(r.t - p.t), Math.abs(r.r - p.r), Math.abs(r.b - p.b)) <= 1.5;
    });
    if (still) { keep.add(ss[i - 1]); keep.add(ss[i]); }
  }
  return [...keep].sort((a, b) => a.t - b.t);
}
const ranges = (ts) => {
  const out = [];
  for (const t of ts) {
    const last = out.at(-1);
    if (last && t - last[1] <= STEP * 1.5) last[1] = t; else out.push([t, t]);
  }
  return out.map(([a, b]) => (a === b ? `${a.toFixed(2)} s` : `${a.toFixed(2)}–${b.toFixed(2)} s`)).join(", ");
};

// ── where each finding lives in the source ───────────────────────────────────────────────────────────────
const indexHtml = readFileSync(path.join(projectDir, "index.html"), "utf8");
const srcOf = (comp) => {
  if (comp === "main" || comp === "?") return "index.html";
  const m = indexHtml.match(new RegExp(`data-composition-id="${comp}"[^>]*data-composition-src="([^"]+)"`)) ||
    indexHtml.match(new RegExp(`data-composition-src="([^"]+)"[^>]*data-composition-id="${comp}"`));
  return m ? m[1] : "index.html";
};
const lineOf = (file, id) => {
  const f = path.join(projectDir, file);
  if (!existsSync(f) || !id.startsWith("hf-")) return null;
  const i = readFileSync(f, "utf8").split("\n").findIndex((l) => l.includes(`data-hf-id="${id}"`));
  return i >= 0 ? i + 1 : null;
};

// ── which fonts really drew the text — Chrome's own answer, through the DevTools protocol ───────────────
// A family without a glyph (JetBrains Mono has no Bengali digits) makes Chrome borrow a SYSTEM font: the
// look changes from machine to machine, and here it drew a "১" that reads like "৲". Checked once per scene,
// at its held end, for every visible text.
async function checkFonts(page, t) {
  const marked = await page.evaluate(() => {
    let i = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!node.nodeValue.trim() || !el || el.closest("script,style,template,title,[data-design-ignore],[data-layout-ignore]") || el.hasAttribute("data-dl-font")) continue;
      if (getComputedStyle(el).visibility !== "visible") continue;
      let o = 1;
      for (let p = el; p && o > 0.05; p = p.parentElement) { const s = getComputedStyle(p); o *= s.display === "none" ? 0 : parseFloat(s.opacity); }
      if (o < 0.3) continue;
      el.setAttribute("data-dl-font", String(i++));
    }
    return i;
  });
  if (!marked) return;
  const cdp = page.createCDPSession ? await page.createCDPSession() : await page.target().createCDPSession();
  const bad = new Map();   // marker index → system fonts used
  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
    const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: "[data-dl-font]" });
    for (const nodeId of nodeIds) {
      const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
      const sys = fonts.filter((f) => !f.isCustomFont);
      if (!sys.length) continue;
      const { attributes } = await cdp.send("DOM.getAttributes", { nodeId });
      bad.set(attributes[attributes.indexOf("data-dl-font") + 1], sys.map((f) => `${f.familyName} (${f.glyphCount} glyph${f.glyphCount === 1 ? "" : "s"})`));
    }
  } finally {
    await cdp.detach().catch(() => {});
  }
  const info = await page.evaluate((keys) => {
    const out = {};
    for (const k of keys) {
      const el = document.querySelector(`[data-dl-font="${k}"]`);
      out[k] = {
        id: el.getAttribute("data-hf-id") || el.tagName.toLowerCase(),
        comp: el.closest("[data-composition-id]")?.getAttribute("data-composition-id") ?? "?",
        text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
        family: getComputedStyle(el).fontFamily,
      };
    }
    document.querySelectorAll("[data-dl-font]").forEach((e) => e.removeAttribute("data-dl-font"));
    return out;
  }, [...bad.keys()]);
  for (const [k, sys] of bad) {
    const e = info[k];
    const bengali = /[ঀ-৿]/.test(e.text);
    hit("font_fallback", bengali ? "error" : "warn", e.comp, [e.id], t, null,
      `"${e.text}" is partly drawn in the SYSTEM font ${sys.join(", ")} — none of ${e.family} has those characters. Add a pack font that has them to the font-family list${bengali ? ' (for Bengali: "Hind Siliguri" right after the Latin face)' : ""}`);
  }
}

// ── run ──────────────────────────────────────────────────────────────────────────────────────────────────
const started = Date.now();
const proj = await openProject(projectDir);
let samples = 0;
try {
  const end = proj.duration;
  if (!(end > 0)) throw new Error("could not read the composition duration");
  for (let t = 0; t < end - 0.01; t = Math.round((t + STEP) * 1000) / 1000) {
    await proj.seek(t);
    analyse(t, await proj.page.evaluate(collect));
    samples++;
  }
  // fonts: once per scene, 0.6 s before it ends (built, not yet leaving); the whole piece if it has no scenes
  const ends = [...indexHtml.matchAll(/<[^>]*data-composition-src="[^"]*"[^>]*>/g)].map((m) => {
    const s = parseFloat(m[0].match(/data-start="([\d.]+)"/)?.[1]), d = parseFloat(m[0].match(/data-duration="([\d.]+)"/)?.[1]);
    return Number.isFinite(s) && Number.isFinite(d) ? Math.max(0, s + d - 0.6) : null;
  }).filter((x) => x !== null);
  for (const t of ends.length ? ends : [Math.max(0, end - 0.6)]) {
    await proj.seek(t);
    await checkFonts(proj.page, t);
  }
} finally {
  await proj.close();
}

const findings = [];
for (const h of hits.values()) {
  const ss = held(h);
  if (!ss.length) continue;
  const worst = ss.reduce((a, b) => ((b.detail.size ?? 0) > (a.detail.size ?? 0) ? b : a));   // described from a HELD moment
  const file = srcOf(h.comp);
  findings.push({ code: h.code, severity: h.sev, composition: h.comp, file, line: lineOf(file, h.ids[0]), ids: h.ids, times: ranges(ss.map((x) => x.t)), message: worst.msg, detail: worst.detail });
}
const order = { error: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));

// ── --fix: Bengali tracking is mechanical, so it can be repaired in the source ─────────────────────────
const fixed = [];
if (flags.fix) {
  for (const f of findings.filter((x) => x.code === "bn_tracking")) {
    const file = path.join(projectDir, f.file);
    let src = readFileSync(file, "utf8");
    const before = src;
    const classes = (f.detail.declCls || "").split(".").filter(Boolean);
    // HyperFrames scopes sub-composition CSS, so compare the last two compound selectors, not the whole text
    const tail = (sel) => sel.replace(/\s*[>+~]\s*/g, " ").trim().split(/\s+/).slice(-2).join(" ");
    const pageTails = new Set((f.detail.rules || []).map(tail));
    src = src.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (_, open, css, close) => open + css.replace(/([^{}]+)\{([^{}]*)\}/g, (whole, sel, body) => {
      if (!/letter-spacing\s*:/.test(body)) return whole;
      const lastCompounds = sel.split(",").map((x) => x.trim().split(/\s+/).at(-1));
      const byRule = sel.split(",").some((x) => pageTails.has(tail(x)));
      if (!byRule && !lastCompounds.some((c) => classes.some((k) => new RegExp(`\\.${k.replace(/[-]/g, "\\-")}(?![\\w-])`).test(c)))) return whole;
      return `${sel}{${body.replace(/letter-spacing\s*:\s*[^;]+;/, "letter-spacing: 0;")}}`;
    }) + close);
    if (f.detail.inlineStyle && f.detail.declId.startsWith("hf-")) {
      src = src.replace(new RegExp(`(data-hf-id="${f.detail.declId}"[^>]*style="[^"]*)letter-spacing\\s*:\\s*[^;"]+;?`), "$1letter-spacing: 0;");
    }
    if (src !== before) { writeFileSync(file, src); fixed.push(`${f.file}: .${f.detail.declCls || f.detail.declId} → letter-spacing: 0`); f.fixed = true; }
  }
}

const count = (sev) => findings.filter((f) => f.severity === sev && !f.fixed).length;
const errors = count("error"), warns = count("warn"), infos = count("info");
if (flags.json) {
  console.log(JSON.stringify({ ok: errors === 0 && (!flags.strict || warns === 0), samples, step: STEP, findings, fixed }, null, 2));
} else {
  console.log(`design-lint: ${path.basename(projectDir)} — ${samples} moments checked every ${STEP} s in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  const icon = { error: "✗ ERROR", warn: "⚠ WARN ", info: "· INFO " };
  const smalls = findings.filter((f) => f.code === "small_text");
  for (const f of findings.filter((x) => x.code !== "small_text")) {
    console.log(`  ${f.fixed ? "✓ FIXED" : icon[f.severity]} ${f.code.padEnd(15)} ${f.file}${f.line ? `:${f.line}` : ""}  [${f.times}]`);
    console.log(`           ${f.message}`);
  }
  if (smalls.length) {
    const byFile = {};
    for (const f of smalls) (byFile[f.file] ??= []).push(f.message);
    console.log(`  ${icon.info} small_text      ${smalls.length} text(s) under 20 px (unreadable on a phone; fine only as page furniture):`);
    for (const [file, list] of Object.entries(byFile)) console.log(`           ${file}: ${list.slice(0, 4).join(" · ")}${list.length > 4 ? ` · +${list.length - 4} more` : ""}`);
  }
  for (const x of fixed) console.log(`  ✓ fixed ${x}`);
  console.log(`  ${errors} error(s), ${warns} warning(s), ${infos} info${fixed.length ? ` — ${fixed.length} fixed, run again to confirm` : ""}`);
}
process.exitCode = errors > 0 || (flags.strict && warns > 0) ? 1 : 0;
