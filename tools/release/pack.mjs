#!/usr/bin/env node
// pack.mjs — the release folder and his upload checklist for one main video and everything cut from it
// (release system step 6, 2026-10-30)
//
//   node tools/release/pack.mjs projects/<main> [--out=<folder>] [--release=<release.json>]
//
// Reads projects/<main>/release.json (the list: the main video, its universal Reels, its LinkedIn cut, the subtitle
// files, the covers, the copy file and which copy heading belongs to which item), then:
//   1. spec-check.mjs on every file that exists (its profile(s)); a missing file is PENDING, with the command that makes it
//   2. copy-check.mjs on the copy file (RELEASE-COPY.md) — the pack stops on a copy ERROR
//   3. a folder per platform under --out (default release.json "out"): 1-YouTube, 2-Facebook, 3-Instagram, 4-X,
//      5-LinkedIn, each holding exactly what goes there (hard links on the same drive: no extra space; a copy otherwise)
//   4. RELEASE.md (Bengali, in the project AND the out folder): the posting order, then per platform and item the file,
//      the text to paste (taken from the copy file's tagged blocks under the item's heading), where the link goes and
//      the settings; the check results and what is still pending. release.result.json beside it.
// Exit 1 if a spec-check FAILs or the copy check has an ERROR. Verified 2026-10-30 on projects/claude-video-tutorial.
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { blocks, checkBlock } from "./copy-check.mjs";
import { RULES, checkFile } from "./spec-check.mjs";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=")]; }));
if (!dir) { console.log("Usage: node tools/release/pack.mjs projects/<main> [--out=<folder>] [--release=<release.json>]"); process.exit(2); }
const P = path.resolve(dir);
const rel = JSON.parse(readFileSync(path.resolve(opt.release ?? path.join(P, "release.json")), "utf8"));
const at = (p) => (p ? path.resolve(P, p) : null);
const OUT = path.resolve(opt.out ?? rel.out);
const MB = (f) => `${(statSync(f).size / 1048576).toFixed(1)} MB`;

// ── 1. files + spec-check ──
const items = rel.items.map((it) => {
  const file = at(it.file), ready = !!file && existsSync(file);
  const res = ready ? checkFile(file, { targets: [].concat(it.profiles ?? it.profile) }) : null;
  const srt = it.srt ? { bn: `${at(it.srt)}.bn.srt`, fb: `${at(it.srt)}.bn_IN.srt` } : null;
  const verdict = !res ? "PENDING" : ["FAIL", "WARN"].find((v) => res.groups.some((g) => g.verdict === v)) ?? "PASS";
  return { ...it, file, ready, res, verdict,
    srt: srt && existsSync(srt.bn) ? srt : null, cover: at(it.cover) && existsSync(at(it.cover)) ? at(it.cover) : null, thumb: at(it.thumb) && existsSync(at(it.thumb)) ? at(it.thumb) : null };
});

// ── 2. copy-check, and the tagged blocks under each item's heading ──
const copyFile = at(rel.copy);
const md = readFileSync(copyFile, "utf8").replace(/\r\n/g, "\n");
const bs = blocks(md);
const copyErrs = bs.filter((b) => b.kind).map((b) => ({ b, ...checkBlock(b) })).filter((r) => r.errs.length);
const lines = md.split("\n");
const headingAt = (line) => { for (let i = line - 1; i >= 0; i--) if (/^#{2,3} /.test(lines[i])) return lines[i].replace(/^#+ /, ""); return ""; };
const copyFor = (title, kind) => bs.filter((b) => b.kind === kind && headingAt(b.line).includes(title)).map((b) => b.text);

// ── 3. the platform folders ──
const DEST = { youtube: "1-YouTube", facebook: "2-Facebook", instagram: "3-Instagram", x: "4-X", linkedin: "5-LinkedIn" };
const placed = [], firstCopy = new Map();
function place(src, platform, name) {
  if (!src) return null;
  const d = path.join(OUT, DEST[platform]);
  mkdirSync(d, { recursive: true });
  const to = path.join(d, name);
  if (existsSync(to)) rmSync(to); // only ever a link or copy this tool made
  // a hard link needs the same drive: across drives the file is copied ONCE, and its other places link to that copy
  try { linkSync(firstCopy.get(src) ?? src, to); placed.push({ to, how: "link" }); }
  catch { copyFileSync(src, to); firstCopy.set(src, to); placed.push({ to, how: "copy" }); }
  return to;
}
const routes = { // platform → what of an item goes there
  main: { youtube: ["file", "srt.bn", "thumb"], facebook: ["file", "srt.fb"], linkedin: ["file", "srt.bn"] },
  "universal-reel": { youtube: ["file"], facebook: ["file"], instagram: ["file", "cover"], x: ["file"] },
  "linkedin-clip": { linkedin: ["file", "cover"] },
};
const kindOf = (it) => (it.profile === "universal-reel" ? "universal-reel" : it.profile === "linkedin-clip" ? "linkedin-clip" : "main");
const get = (it, k) => (k === "srt.bn" ? it.srt?.bn : k === "srt.fb" ? it.srt?.fb : it[k]);
// the name a file gets in its platform folder: main.mp4, main.bn.srt, main.bn_IN.srt, reel-1-cover.jpg …
const nameOf = (it, k, src) => `${it.id}${k === "file" ? path.extname(src) : k === "srt.bn" ? ".bn.srt" : k === "srt.fb" ? ".bn_IN.srt" : `-${k}${path.extname(src)}`}`;
// a main video of 140 s or less fits X's free-account cap: it goes to X natively too
const xNative = (it) => kindOf(it) === "main" && it.ready && it.res.measured.duration <= 140;
for (const it of items) {
  if (!it.ready) continue;
  if (xNative(it)) place(it.file, "x", nameOf(it, "file", it.file));
  for (const [pf, keys] of Object.entries(routes[kindOf(it)])) for (const k of keys) {
    const src = get(it, k);
    if (src) place(src, pf, nameOf(it, k, src));
  }
}

// ── 4. RELEASE.md ──
const fileLine = (it, pf, k = "file") => { const src = get(it, k); return src && it.ready ? `\`${path.join(OUT, DEST[pf], nameOf(it, k, src)).replace(/\\/g, "/")}\`` : "— (এখনো নেই)"; };
const main = items.find((it) => kindOf(it) === "main");
const reels = items.filter((it) => kindOf(it) === "universal-reel");
const lis = items.filter((it) => kindOf(it) === "linkedin-clip");
const pend = items.filter((it) => !it.ready);
const say = { PASS: "✓ পাস", WARN: "✓ পাস (সতর্কতাসহ)", FAIL: "✗ আটকাবে", PENDING: "⏳ রেন্ডার বাকি" };
// every text to paste sits in its own ``` fence (one tap to copy in the app)
const one = (arr) => (arr.length ? arr.map((t) => "```\n" + t + "\n```").join("\n\n") : "_(লেখা পাওয়া যায়নি: RELEASE-COPY.md দেখুন)_");
let R = `# রিলিজ চেকলিস্ট: ${rel.series}

তৈরি: ${new Date().toLocaleString("sv-SE").slice(0, 16)} · \`node tools/release/pack.mjs ${path.relative(path.resolve(P, "..", ".."), P).replace(/\\/g, "/")}\` · ফাইলের ফোল্ডার: \`${OUT.replace(/\\/g, "/")}\`
লেখা পরীক্ষা: ${copyErrs.length ? `✗ ${copyErrs.length}টা বক্সে ভুল` : `✓ ${bs.filter((b) => b.kind).length}টা বক্স পাস`} · ফাইল তৈরি: ${items.length - pend.length}/${items.length}${pend.length ? ` (বাকি: ${pend.map((p) => p.bn).join(", ")})` : ""}

## পরীক্ষার ফল

| ফাইল | কী | মাপ | প্ল্যাটফর্মের নিয়ম |
| --- | --- | --- | --- |
${items.map((it) => `| ${it.bn} | ${[].concat(it.profiles ?? it.profile).join(", ")} | ${it.ready ? `${it.res.measured.w}×${it.res.measured.h}, ${it.res.measured.duration.toFixed(1)} s, ${MB(it.file)}` : "—"} | ${say[it.verdict]}${it.res ? ` (${it.res.groups.map((g) => `${g.target} ${g.verdict}`).join(", ")})` : ""} |`).join("\n")}

## আপলোডের ক্রম

${main ? `১. **দিন ১:** পুরো ভিডিও YouTube-এ (লিংকটা আমাকে দিন, লেখায় বসিয়ে দেব), তারপর Facebook পেজে, তারপর LinkedIn-এ।
২. **এরপর দিনে একটা Reel:** ${reels.map((r) => r.bn).join(" → ")}। প্রতিটা Reel একই দিনে Facebook, Instagram, X আর YouTube Shorts-এ। সময়: Page Insights-এ যখন ফলোয়াররা বেশি অনলাইনে।
৩. **LinkedIn কাট** পুরো ভিডিওর পরের দিন বা তার পরে, আলাদা পোস্টে।` : `১. **এই Reel-টাই মূল ভিডিও** (আলাদা পুরো ভিডিও নেই): ${reels.map((r) => r.bn).join(" → ")}। একই দিনে Facebook, Instagram, X আর YouTube Shorts-এ। সময়: Page Insights-এ যখন ফলোয়াররা বেশি অনলাইনে।
২. **LinkedIn কাট** একই দিনে বা পরদিন, আলাদা পোস্টে।`}
`;
if (main) {
  R += `\n## ১. YouTube\n\n**পুরো ভিডিও** — ফাইল ${fileLine(main, "youtube")}${main.srt ? `, সাবটাইটেল ${fileLine(main, "youtube", "srt.bn")} (Studio → Subtitles → Upload file → With timing)` : ""}, থাম্বনেইল ${fileLine(main, "youtube", "thumb")}।\n\nটাইটেল:\n\n${one(copyFor(main.copy, "youtube-title"))}\n\nডেসক্রিপশন:\n\n${one(copyFor(main.copy, "youtube-description"))}\n\nTags বক্স:\n\n${one(copyFor(main.copy, "youtube-tags"))}\n\nপিন করা কমেন্ট:\n\n${one(copyFor(main.copy, "youtube-pinned"))}\n`;
  for (const r of reels) R += `\n**Shorts: ${r.bn}** — ফাইল ${fileLine(r, "youtube")}। আপলোডের সময় **Related video**-তে পুরো ভিডিওটা বেছে দিন।\n\nটাইটেল:\n\n${one(copyFor(r.copy, "youtube-title"))}\n\nডেসক্রিপশন:\n\n${one(copyFor(r.copy, "universal-reel"))}\n`;
  R += `\n## ২. Facebook পেজ\n\n**পুরো ভিডিও** — ফাইল ${fileLine(main, "facebook")}${main.srt ? `, সাবটাইটেল ${fileLine(main, "facebook", "srt.fb")} (ভিডিও এডিট → Subtitles & captions → Upload SRT; নামটাই ভাষা বলে দেয়)` : ""}।\n\nপোস্ট:\n\n${one(copyFor(main.copy, "facebook-post"))}\n\nনিজের প্রথম কমেন্ট (লিংক):\n\n${one(copyFor(main.copy, "first-comment"))}\n`;
} else R += `\n## ১–২. YouTube আর Facebook\n\n_(release.json-এ পুরো ভিডিও নেই)_\n`;
for (const r of reels) R += `\n**Reel: ${r.bn}** — ফাইল ${fileLine(r, "facebook")}।\n\nক্যাপশন:\n\n${one(copyFor(r.copy, "universal-reel"))}\n\nনিজের প্রথম কমেন্ট:\n\n${one(copyFor(r.copy, "first-comment"))}\n`;
R += `\n## ৩. Instagram\n\nপুরো ভিডিওর লিংক থাকবে Bio-তে (একবার বসিয়ে রাখুন)। প্রতিটা Reel-এর কভার: কভার ছবি আপলোড করুন বা ভিডিওর প্রথম ফ্রেম রাখুন।\n`;
for (const r of reels) R += `\n**${r.bn}** — ফাইল ${fileLine(r, "instagram")}, কভার ${fileLine(r, "instagram", "cover")}।\n\nক্যাপশন (Facebook-এর হুবহু):\n\n${one(copyFor(r.copy, "universal-reel"))}\n`;
R += `\n## ৪. X\n\nফ্রি অ্যাকাউন্টে ভিডিও ১৪০ সেকেন্ড পর্যন্ত: Reel-গুলো সরাসরি যাবে, পুরো ভিডিও ${main && xNative(main) ? "ও সরাসরি যাবে (এটা ১৪০ সেকেন্ডের কম)" : "যাবে লেখা + লিংকে"}।\n`;
for (const r of reels) R += `\n**${r.bn}** — ফাইল ${fileLine(r, "x")}।\n\nপোস্ট (Facebook-এর হুবহু):\n\n${one(copyFor(r.copy, "universal-reel"))}\n\nনিজের পোস্টের নিচে উত্তর (লিংক):\n\n${one(copyFor(r.copy, "x-reply"))}\n`;
if (rel.xMain) R += `\n**পুরো ভিডিও ${main && xNative(main) ? `(সরাসরি)** — ফাইল ${fileLine(main, "x")}` : "(লেখা + লিংক)**"}\n\nপোস্ট:\n\n${one(copyFor(rel.xMain, "x-post"))}\n\nউত্তর:\n\n${one(copyFor(rel.xMain, "x-reply"))}\n`;
R += `\n## ৫. LinkedIn\n\nকমেন্ট, লাইক বা DM চাওয়া নেই। লিংক পোস্টে নয়। সাবটাইটেল শুধু ডেস্কটপ থেকে যোগ করা যায়।\n`;
for (const l of lis) R += `\n**${l.bn}** — ফাইল ${fileLine(l, "linkedin")}, কভার ${fileLine(l, "linkedin", "cover")}।\n\nপোস্ট:\n\n${one(copyFor(l.copy, "linkedin-post"))}\n\nপ্রথম কমেন্ট (চাইলে):\n\n${one(copyFor(l.copy, "first-comment"))}\n`;
if (main && rel.linkedinMain) R += `\n**পুরো ভিডিও (চাইলে)** — ফাইল ${fileLine(main, "linkedin")}${main.srt ? `, সাবটাইটেল ${fileLine(main, "linkedin", "srt.bn")} (ডেস্কটপ থেকে)` : ""}।\n\nপোস্ট:\n\n${one(copyFor(rel.linkedinMain, "linkedin-post"))}\n`;
// his notes (claims left out of the copy, open questions) reach the checklist
const notes = [...(rel.notes ?? [])];
// a cloned / synthetic voice (release.json "voice": "clone") must be disclosed on every platform (voice-clone skill)
if (rel.voice === "clone") notes.unshift("**AI গলা:** এই ভিডিওর ভয়েস আপনার নিজের গলার ক্লোন। Facebook/Instagram-এ পোস্ট করার সময় \"AI info\" (AI দিয়ে বানানো) লেবেল চালু করুন — Meta-র নিয়মে বাস্তব-শোনানো AI অডিওতে এটা বাধ্যতামূলক। YouTube-এ লাগবে না: YouTube-এর নিয়মে নিজের গলার ক্লোন দিয়ে ভয়েস-ওভার জানানোর তালিকায় নেই (চালু করলেও আয়ে প্রভাব নেই)। X আর LinkedIn-এ পোস্টের লেখায় \"AI দিয়ে বানানো গলা\" লেখা ভালো।");
if (notes.length) R += `\n## মনে রাখবেন\n\n${notes.map((n) => `- ${n}`).join("\n")}\n`;
if (pend.length) R +=`\n## যা এখনো বাকি\n\n${pend.map((p) => `- **${p.bn}**: ফাইল নেই (\`${(p.file ?? "?").replace(/\\/g, "/")}\`)। ${p.make ?? "রেন্ডার করুন"}`).join("\n")}\n`;
const warns = items.filter((it) => it.res).flatMap((it) => it.res.groups.flatMap((g) => g.results.filter((x) => x.status === "WARN").map((x) => `${it.bn}: ${g.target}/${x.group} ${x.check} ${x.value} (চাই ${x.want})`)));
if (warns.length) R += `\n## সতর্কতা (আটকাবে না, তবে ভালো করা যায়)\n\n${[...new Set(warns)].map((w) => `- ${w}`).join("\n")}\n`;

mkdirSync(OUT, { recursive: true });
// the project's own copy only when packing the project's own release.json (a trial --release=… writes to --out only)
if (!opt.release || path.resolve(opt.release) === path.join(P, "release.json")) writeFileSync(path.join(P, "RELEASE.md"), R);
writeFileSync(path.join(OUT, "RELEASE.md"), R);
writeFileSync(path.join(OUT, "release.result.json"), JSON.stringify({ made: new Date().toISOString(), items: items.map(({ res, ...it }) => ({ ...it, checks: res?.groups.map((g) => ({ target: g.target, verdict: g.verdict })) })), copyErrors: copyErrs.map((r) => ({ line: r.b.line, kind: r.b.kind, errs: r.errs })), placed }, null, 2));

console.log(`pack: ${rel.series} → ${OUT}`);
for (const it of items) console.log(`  ${it.verdict.padEnd(7)} ${it.id.padEnd(12)} ${it.bn}${it.ready ? `  ${MB(it.file)}` : ""}`);
console.log(`  copy: ${copyErrs.length ? `✗ ${copyErrs.length} block(s) with errors — fix RELEASE-COPY.md (node tools/release/copy-check.mjs …)` : `✓ ${bs.filter((b) => b.kind).length} blocks`}`);
console.log(`  placed ${placed.length} file(s) (${placed.filter((p) => p.how === "link").length} hard links, ${placed.filter((p) => p.how === "copy").length} copies); checklist: ${path.join(OUT, "RELEASE.md")}`);
process.exit(copyErrs.length || items.some((it) => it.verdict === "FAIL") ? 1 : 0);
