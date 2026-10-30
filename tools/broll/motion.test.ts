// motion.test.ts — proves the B-roll physics before anything renders (docs/broll-motion-spec.md §4).
//   node tools/broll/motion.test.ts     → one line per check, exit 1 on any failure
import { cubicBezier, fibonacci, GOLDEN_ANGLE, monotoneCubic, mulberry32, pageScript, phyllotaxis, springEase, springValue } from "./motion.ts";

let failed = 0;
const check = (name: string, ok: boolean, detail: string): void => {
  console.log(`${ok ? "✓" : "✗"} ${name}: ${detail}`);
  if (!ok) failed++;
};

// spring k = 170, c = 14, m = 1 (his brief): sample at 1 ms
const K = 170, C = 14, M = 1;
let peak = 0, peakAt = 0, settledAt = 0;
for (let t = 0; t <= 2; t += 0.001) {
  const v = springValue(t, K, C, M);
  if (v > peak) { peak = v; peakAt = t; }
  if (Math.abs(v - 1) > 0.02) settledAt = t;
}
check("spring overshoot", Math.abs((peak - 1) * 100 - 13.5) < 0.5, `${((peak - 1) * 100).toFixed(2)} % at ${peakAt.toFixed(3)} s (theory 13.5 %)`);
check("spring settle (±2 %)", settledAt <= 0.6, `last outside ±2 % at ${settledAt.toFixed(3)} s (theory 4/(ζω₀) = 0.57 s)`);
check("spring endpoints", springValue(0, K, C, M) === 0 && Math.abs(springValue(2, K, C, M) - 1) < 1e-5, `x(0) = 0, x(2 s) = ${springValue(2, K, C, M).toFixed(6)}`);
const se = springEase(0.9, K, C, M);
check("springEase lands on 1", se(1) === 1 && se(0) === 0 && Math.abs(se(0.999) - 1) < 0.01, `ease(0) = ${se(0)}, ease(0.999) = ${se(0.999).toFixed(4)}, ease(1) = ${se(1)}`);
check("springEase = springValue", Math.abs(se(0.5) - springValue(0.45, K, C, M)) < 1e-12, "the injected closure matches the analytic solution");

// cubic-bezier(0.16, 1, 0.3, 1): monotonic, lands on 1, fast start
const ez = cubicBezier(0.16, 1, 0.3, 1);
let mono = true, prev = -1;
for (let p = 0; p <= 1.0000001; p += 0.001) { const v = ez(p); if (v < prev - 1e-9) mono = false; prev = v; }
check("bezier monotonic", mono, "no step backwards over 1001 samples");
check("bezier endpoints", ez(0) === 0 && ez(1) === 1, `e(0) = ${ez(0)}, e(1) = ${ez(1)}`);
check("bezier is expo-out", ez(0.11) > 0.5 && ez(0.5) > 0.9, `e(0.11) = ${ez(0.11).toFixed(3)}, e(0.5) = ${ez(0.5).toFixed(3)}`);

// determinism
const a = mulberry32(42), b = mulberry32(42);
const sa = Array.from({ length: 1000 }, a), sb = Array.from({ length: 1000 }, b);
check("PRNG deterministic", sa.every((v, i) => v === sb[i]) && sa.every((v) => v >= 0 && v < 1), `1000 values equal for seed 42, all in [0, 1)`);
const p1 = phyllotaxis(34, 60, { x: 0, y: 0 }), p2 = phyllotaxis(34, 60, { x: 0, y: 0 });
check("phyllotaxis", p1.length === 34 && JSON.stringify(p1) === JSON.stringify(p2) && Math.abs(GOLDEN_ANGLE * 180 / Math.PI - 137.5078) < 1e-3, `34 points, golden angle ${(GOLDEN_ANGLE * 180 / Math.PI).toFixed(4)}°`);


// continuous Fibonacci: exact at the integers, increasing in between (the MG2 growth curve)
const fibs = [1, 2, 3, 5, 8, 13, 21, 34, 55];
let fibMono = true, fprev = -1;
for (let n = 2; n <= 10.0000001; n += 0.001) { const v = fibonacci(n); if (v < fprev - 1e-12) fibMono = false; fprev = v; }
check("fibonacci", fibs.every((v, k) => Math.abs(fibonacci(k + 2) - v) < 1e-9) && fibMono, `F(2…10) = ${fibs.join(", ")} exactly, increasing over 8001 samples`);

// monotone cubic: through every knot, never backwards, no overshoot
const kx = [0.3, 0.95, 1.5, 2.0, 2.45, 2.85, 3.25, 3.7, 4.2], ky = [0, 210, 421, 633, 851, 1081, 1341, 1667, 2122];
const mc = monotoneCubic(kx, ky);
let mcMono = true, mcIn = true, mprev = -Infinity;
for (let t = 0; t <= 5; t += 0.0005) { const v = mc(t); if (v < mprev - 1e-9) mcMono = false; if (v < 0 || v > 2122) mcIn = false; mprev = v; }
check("monotoneCubic", kx.every((x, i) => Math.abs(mc(x) - ky[i]) < 1e-9) && mcMono && mcIn && mc(0) === 0 && mc(9) === 2122, "hits all 9 knots, never decreases, stays inside [first, last], clamps outside");

// the injected page code compiles as plain JS and gives the same numbers
const injected = new Function(`${pageScript()}; return { springEase, cubicBezier, mulberry32 };`)() as { springEase: typeof springEase; cubicBezier: typeof cubicBezier; mulberry32: typeof mulberry32 };
check("page code = tested code", injected.springEase(0.9, K, C, M)(0.37) === se(0.37) && injected.cubicBezier(0.16, 1, 0.3, 1)(0.42) === ez(0.42) && injected.mulberry32(7)() === mulberry32(7)(), "springEase, cubicBezier and mulberry32 agree after injection");

console.log(failed ? `\n✗ ${failed} check(s) failed` : "\n✓ all motion checks pass");
process.exit(failed ? 1 : 0);
