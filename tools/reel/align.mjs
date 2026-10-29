// align.mjs — caption words for a tools-reel: the SCRIPT's spelling (tool names exactly as written) with the VOICE's
// timing (the transcriber's words.json). Language-agnostic (English or Bengali).
//
//   import { alignScript } from "./align.mjs";
//   const { words, matched } = alignScript(lines, asrWords);   // lines: string[]; asrWords: [{text,start,end}]
//   → words: [{ text, start, end, line }]   matched: share of script words that found a spoken word (0–1)
//
// Dynamic programming over the two word lists. Moves: one-to-one (equal or similar spelling), one script word = two
// spoken words ("Context7" = "Context" + "7,"), two script words = one spoken word ("Dev Tools" = "DevTools"), or a
// skip on either side. Script words with no partner get times spread over the gap between their neighbours.
// Verified 2026-10-29 on the reference's own transcript (206 words) and a Kokoro test voice.

export const norm = (s) => String(s).toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{M}\p{N}]/gu, "");

function similar(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > Math.max(m, n) / 2) return 0;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return 1 - prev[n] / Math.max(m, n);
}

export function alignScript(lines, asr) {
  const script = lines.flatMap((l, line) => String(l).split(/\s+/).filter(Boolean).map((text) => ({ text, line, n: norm(text) })));
  const spoken = asr.map((w) => ({ ...w, n: norm(w.text) })).filter((w) => w.n);
  const S = script.length, A = spoken.length;
  const NEG = -1e9, GAP = -1;
  const score = Array.from({ length: S + 1 }, () => new Float64Array(A + 1).fill(NEG));
  const move = Array.from({ length: S + 1 }, () => new Int8Array(A + 1));
  score[0][0] = 0;
  for (let i = 0; i <= S; i++) {
    for (let j = 0; j <= A; j++) {
      const here = score[i][j];
      if (here === NEG) continue;
      const put = (ii, jj, s, m) => { if (ii <= S && jj <= A && here + s > score[ii][jj]) { score[ii][jj] = here + s; move[ii][jj] = m; } };
      if (i < S && j < A) {
        const sim = similar(script[i].n, spoken[j].n);
        put(i + 1, j + 1, sim === 1 ? 3 : sim >= 0.6 ? 1.5 : -0.5, 1);
      }
      if (i < S && j + 1 < A && script[i].n === spoken[j].n + spoken[j + 1].n) put(i + 1, j + 2, 4, 2);
      if (i + 1 < S && j < A && script[i].n + script[i + 1].n === spoken[j].n) put(i + 2, j + 1, 4, 3);
      if (i < S) put(i + 1, j, GAP, 4);
      if (j < A) put(i, j + 1, GAP, 5);
    }
  }
  // walk back
  const pairs = new Array(S).fill(null);
  let i = S, j = A, good = 0;
  while (i > 0 || j > 0) {
    const m = move[i][j];
    if (m === 1) { i--; j--; pairs[i] = { start: spoken[j].start, end: spoken[j].end }; if (similar(script[i].n, spoken[j].n) >= 0.6) good++; }
    else if (m === 2) { i--; j -= 2; pairs[i] = { start: spoken[j].start, end: spoken[j + 1].end }; good++; }
    else if (m === 3) {
      i -= 2; j--;
      const w = spoken[j], mid = w.start + (w.end - w.start) * (script[i].n.length / (script[i].n.length + script[i + 1].n.length));
      pairs[i] = { start: w.start, end: mid }; pairs[i + 1] = { start: mid, end: w.end }; good += 2;
    } else if (m === 4) i--;
    else if (m === 5) j--;
    else break;
  }
  // script words the voice did not match: spread over the gap between known neighbours, by letter count
  for (let k = 0; k < S; k++) {
    if (pairs[k]) continue;
    let e = k;
    while (e < S && !pairs[e]) e++;
    const from = k > 0 ? pairs[k - 1].end : 0;
    const to = e < S ? pairs[e].start : from + 0.3 * (e - k);
    const total = script.slice(k, e).reduce((a, w) => a + Math.max(1, w.n.length), 0);
    let t = from;
    for (let q = k; q < e; q++) {
      const d = ((to - from) * Math.max(1, script[q].n.length)) / total;
      pairs[q] = { start: t, end: t + d, guessed: true };
      t += d;
    }
    k = e - 1;
  }
  const words = script.map((w, k) => ({ text: w.text, line: w.line, start: +pairs[k].start.toFixed(3), end: +pairs[k].end.toFixed(3), ...(pairs[k].guessed ? { guessed: true } : {}) }));
  return { words, matched: S ? good / S : 0 };
}
