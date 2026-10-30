// motion.ts — the physics and geometry of every motion-graphics B-roll in this workspace (docs/broll-motion-spec.md).
// Typed TypeScript, run by Node 24's type stripping (no build step); the same functions are injected into the page
// with pageScript(), so the code the test proves is the code that renders.
//   import { springEase, cubicBezier, mulberry32, phyllotaxis, PHI, goldenPoint, grainTile, pageScript } from "./motion.ts";
//   node tools/broll/motion.test.ts      (the physics and determinism checks)
// Everything here is a pure function of its inputs: no Math.random, no Date (CLAUDE.md §0i State).
// Verified 2026-10-30: motion.test.ts (spring k = 170, c = 14: overshoot 13.5 %, within 2 % by 0.57 s; the expo-out
// bezier is monotonic and lands on 1; the PRNG and the phyllotaxis are deterministic).

export type Ease = (p: number) => number;
export interface Vec2 { x: number; y: number }
export interface SpringParams { stiffness: number; damping: number; mass: number }

export const PHI: number = (1 + Math.sqrt(5)) / 2;            // 1.6180339887…
export const GOLDEN_ANGLE: number = Math.PI * (3 - Math.sqrt(5)); // 137.5077…° in radians

/** Unit-step response of a damped spring at time t seconds (0 at t = 0, settles to 1). Analytic, so any frame can
 *  be evaluated on its own: the renderer seeks frame by frame. */
export function springValue(t: number, k: number, c: number, m: number): number {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k / m), zeta = c / (2 * Math.sqrt(k * m));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
  }
  if (zeta === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1)), r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/** A GSAP-ready ease for a tween of `duration` seconds driven by a spring: progress p ∈ [0, 1] → spring(p·duration).
 *  The last frame snaps to exactly 1 (the residue after ~0.8 s is < 0.4 %). Self-contained for injection. */
export function springEase(duration: number, k: number, c: number, m: number): Ease {
  const sv = (t: number): number => {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k / m), zeta = c / (2 * Math.sqrt(k * m));
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  };
  return (p: number): number => (p >= 1 ? 1 : sv(p * duration));
}

/** CSS cubic-bezier(x1, y1, x2, y2) as an ease: solves x(s) = p by Newton–Raphson with a bisection fallback, then
 *  returns y(s). Self-contained for injection. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (s: number): number => ((ax * s + bx) * s + cx) * s;
  const sy = (s: number): number => ((ay * s + by) * s + cy) * s;
  const dx = (s: number): number => (3 * ax * s + 2 * bx) * s + cx;
  return (p: number): number => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let s = p;
    for (let i = 0; i < 8; i++) { const e = sx(s) - p, d = dx(s); if (Math.abs(e) < 1e-7) return sy(s); if (Math.abs(d) < 1e-6) break; s -= e / d; }
    let lo = 0, hi = 1; s = p;
    for (let i = 0; i < 40; i++) { const v = sx(s); if (Math.abs(v - p) < 1e-7) break; if (v < p) lo = s; else hi = s; s = (lo + hi) / 2; }
    return sy(s);
  };
}

/** Seeded PRNG (mulberry32): the same seed gives the same sequence on every run and in every browser. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sunflower (phyllotaxis) points: point i at angle i·137.508° and radius scale·√i around the centre. */
export function phyllotaxis(n: number, scale: number, center: Vec2, rotation: number = 0): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 1; i <= n; i++) {
    const a = i * GOLDEN_ANGLE + rotation, r = scale * Math.sqrt(i);
    out.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
  }
  return out;
}

/** The φ-grid intersection a focal subject should sit on: (W/φ, H − H/φ) = (0.618 W, 0.382 H). */
export function goldenPoint(w: number, h: number): Vec2 {
  return { x: w / PHI, y: h - h / PHI };
}

/** A procedural grain tile (SVG fractal noise) as a data URI, for an overlay layer. */
export function grainTile(size: number, baseFrequency: number, seed: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** The source of these functions for a page <script>: what the test ran is what the browser runs. */
export function pageScript(): string {
  return [springEase, cubicBezier, mulberry32].map((f) => f.toString()).join("\n");
}
