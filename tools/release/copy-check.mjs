#!/usr/bin/env node
// copy-check.mjs — checks every tagged text block of a post-copy file against the platform rules (release system step 5)
//
//   node tools/release/copy-check.mjs <copy.md> [--json]
//
// A block is a ``` fence with a tag on the line before it: <!-- copy: universal-reel -->. The kinds and their rules live in
// tools/release/platforms.json → copyRules (hashtag count at the end, X's weighted length, no link in the text, banned
// platform words, at most N words). On every block: the humanize skill's machine tells (copyRules.tells), at most one
// em dash and at most three emoji, and hashtags only at the very end.
// ERROR (exit 1) for a broken rule; untagged fences are listed as INFO so nothing is skipped silently.
// X's length: twitter-text v3 weights — U+0000–U+10FF (Latin and Bengali) and a few punctuation ranges count 1, every
// other code point 2 (emoji), a URL 23; the limit is 280.
// Verified 2026-10-30 on projects/claude-video-tutorial/RELEASE-COPY.md and on a copy broken on purpose.
import { readFileSync } from "node:fs";
import path from "node:path";
import { RULES } from "./spec-check.mjs";

const CR = RULES.copyRules;
const URL = /https?:\/\/\S+|www\.\S+|\(এখানে[^)]*লিংক[^)]*\)/gu;
export function xLength(s) {
  let n = 0, t = s.normalize("NFC");
  for (const u of t.match(/https?:\/\/\S+/g) ?? []) { n += 23; t = t.replace(u, ""); }
  for (const ch of t) {
    const cp = ch.codePointAt(0);
    n += cp <= 0x10ff || (cp >= 0x2000 && cp <= 0x200d) || (cp >= 0x2010 && cp <= 0x201f) || (cp >= 0x2032 && cp <= 0x2037) ? 1 : 2;
  }
  return n;
}
const EMOJI = /\p{Extended_Pictographic}/gu;

export function blocks(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n"), out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("```")) continue;
    const j = lines.indexOf("```", i + 1);
    if (j < 0) break;
    let k = i - 1;
    while (k >= 0 && !lines[k].trim()) k--;
    const tag = k >= 0 ? lines[k].match(/<!--\s*copy:\s*([\w-]+)\s*-->/)?.[1] ?? null : null;
    out.push({ line: i + 1, kind: tag, text: lines.slice(i + 1, j).join("\n").trim() });
    i = j;
  }
  return out;
}

export function checkBlock(b) {
  const errs = [], info = [];
  const rule = CR.kinds[b.kind];
  if (!rule) return { errs: [`unknown copy kind "${b.kind}" (known: ${Object.keys(CR.kinds).join(", ")})`], info };
  const t = b.text;
  // hashtags: count them, and they belong on the last line only
  const tags = t.match(/#[\p{L}\p{M}\p{N}_]+/gu) ?? [];
  const lastTags = new Set(t.split("\n").at(-1).match(/#[\p{L}\p{M}\p{N}_]+/gu) ?? []); // whole tags: "#AI" ≠ "#AIVideo"
  const inBody = t.split("\n").slice(0, -1).join("\n").match(/#[\p{L}\p{M}\p{N}_]+/gu) ?? [];
  if (!inBody.length && tags.some((h) => !lastTags.has(h))) inBody.push(...tags.filter((h) => !lastTags.has(h)));
  if (rule.hashtags && (tags.length < rule.hashtags[0] || tags.length > rule.hashtags[1])) errs.push(`${tags.length} hashtags, want ${rule.hashtags.join("–")}`);
  if (inBody.length) errs.push(`hashtags inside the text (${inBody.join(" ")}): put them on the last line`);
  if (rule.xLength) { const n = xLength(t); if (n > rule.xLength) errs.push(`X length ${n} > ${rule.xLength}`); else info.push(`X length ${n}/${rule.xLength}`); }
  if (rule.maxChars && [...t].length > rule.maxChars) errs.push(`${[...t].length} characters > ${rule.maxChars}`);
  // the feed shows only the start of a caption before "more": the first line must carry the hook and the keyword
  if (rule.firstLineChars) { const n = [...t.split("\n")[0]].length; if (n > rule.firstLineChars) errs.push(`first line ${n} characters > ${rule.firstLineChars} (the feed cuts it before "more")`); }
  if (rule.maxWords) { const w = t.split(/\s+/).length; if (w > rule.maxWords) errs.push(`${w} words > ${rule.maxWords}`); else info.push(`${w} words`); }
  if (rule.noLink && t.match(URL)) errs.push(`a link in the text (${t.match(URL)[0]}): ${b.kind === "linkedin-post" ? "first comment or nowhere" : "first comment / reply / Bio, never the post itself"}`);
  for (const w of rule.banned ?? []) if (t.toLowerCase().includes(w.toLowerCase())) errs.push(`"${w}" is not allowed in ${b.kind}${rule.why ? ` (${rule.why})` : ""}`);
  for (const w of CR.tells) if (t.toLowerCase().includes(w.toLowerCase())) errs.push(`machine tell "${w}" (humanize skill §4)`);
  // YouTube chapters (post-copy §3): the first at 0:00, at least 3, each at least 10 s long
  if (b.kind === "youtube-description") {
    const ch = t.split("\n").map((l) => l.match(/^(?:(\d+):)?(\d+):(\d{2})\s/)).filter(Boolean).map((m) => (Number(m[1] ?? 0) * 60 + Number(m[2])) * 60 + Number(m[3]));
    if (ch.length) {
      if (ch[0] !== 0) errs.push(`the first chapter must be 0:00`);
      if (ch.length < 3) errs.push(`${ch.length} chapters: YouTube wants at least 3`);
      ch.slice(1).forEach((s, i) => { if (s - ch[i] < 10) errs.push(`chapter at ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} is ${s - ch[i]} s after the one before (at least 10 s)`); });
      if (!errs.length) info.push(`${ch.length} chapters`);
    }
  }
  const dashes = (t.match(/—/g) ?? []).length;
  if (dashes > 1) errs.push(`${dashes} em dashes (at most 1)`);
  const emoji = (t.match(EMOJI) ?? []).length;
  if (emoji > 3) errs.push(`${emoji} emoji (at most 3)`);
  return { errs, info };
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === path.resolve(import.meta.filename).toLowerCase()) {
  const file = process.argv[2];
  if (!file) { console.log("Usage: node tools/release/copy-check.mjs <copy.md> [--json]"); process.exit(2); }
  const bs = blocks(readFileSync(file, "utf8"));
  let bad = 0;
  const res = bs.map((b) => ({ ...b, ...(b.kind ? checkBlock(b) : { errs: [], info: ["untagged: not checked"] }) }));
  if (process.argv.includes("--json")) console.log(JSON.stringify(res, null, 2));
  else for (const r of res) {
    const head = `line ${r.line}  ${(r.kind ?? "(untagged)").padEnd(16)} "${r.text.split("\n")[0].slice(0, 46)}…"`;
    if (r.errs.length) { bad++; console.log(`  ✗ ${head}`); for (const e of r.errs) console.log(`      ERROR ${e}`); }
    else console.log(`  ${r.kind ? "✓" : "·"} ${head}  ${r.info.join(", ")}`);
  }
  const tagged = res.filter((r) => r.kind).length;
  console.log(`copy-check: ${tagged} tagged block(s), ${res.length - tagged} untagged, ${bad} with errors`);
  process.exit(bad ? 1 : 0);
}
