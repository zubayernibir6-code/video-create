#!/usr/bin/env node
// variants-sync.mjs — keeps the Motion Studio codes in tools/variants.json and in the studio section of VARIANTS.md
// in step with tools/studio/catalog.json (kit v1, 2026-11-07). Idempotent: re-run after renders.
//
//   node tools/studio/variants-sync.mjs
//
// status per code: "beta" when renders/portfolio/<CODE>_<Brand>.mp4 exists (a demo rendered, no client video yet),
// "planned" otherwise. Footage and pack codes are not added (they map onto existing styles / bundles).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const cat = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
const vfile = path.join(WS, "tools", "variants.json");
const v = JSON.parse(readFileSync(vfile, "utf8"));
const studio = cat.services.filter((s) => !["footage", "packs"].includes(s.family));
const ids = new Set(studio.map((s) => s.code));
v.variants = v.variants.filter((x) => !ids.has(x.id));
const rows = [];
for (const s of studio) {
  const nice = s.sample?.brand ? `${s.code}_${s.sample.brand.replace(/[^A-Za-z0-9]+/g, "")}` : "";
  const file = nice ? `renders/portfolio/${nice}.mp4` : "";
  const done = file && existsSync(path.join(WS, file));
  v.variants.push({
    id: s.code, bn: s.bn, en: s.name, status: done ? "beta" : "planned",
    needs: "a brief (docs/business/client-kit/CLIENT-BRIEF.md): brand colours/fonts/logo, the message, screenshots or data as needed" + (s.voice ? "; a voice-over (AI or the client's)" : ""),
    builds: s.what,
    engine: "tools/studio (new-piece.mjs → studio.js page → sound.mjs → check.mjs → render-queue.mjs)" + (s.three ? " + three.js" : ""),
    skill: "motion-studio",
    proof: done ? `${file} (portfolio sample, concept work for the fictional brand ${s.sample.brand}; project projects/${s.sample.project}; finish.mjs QC in renders/${s.sample.project}/)` : "not rendered yet",
  });
  rows.push(`| ${s.code} | ${s.bn} | ${s.what} | ${s.bestFor || ""} | ${done ? `বেটা (নমুনা: \`${file}\`)` : "পরিকল্পনা"} |`);
}
writeFileSync(vfile, JSON.stringify(v, null, 2) + "\n"); // the file is 2-space indented: keep diffs small

const vm = path.join(WS, "VARIANTS.md");
let md = readFileSync(vm, "utf8");
const A = "<!-- studio:start -->", B = "<!-- studio:end -->";
const section = `${A}
### মোশন স্টুডিও: ক্লায়েন্টের জন্য, কোডে আঁকা (২০২৬-১১-০৭ থেকে)

ক্লায়েন্ট বা আপনি শুধু কোড বলবেন। দাম আর বিস্তারিত: \`docs/business/CATALOG.md\`। স্কিল: \`motion-studio\`।

| কোড | নাম | দেখতে কেমন | কার জন্য | অবস্থা |
| --- | --- | --- | --- | --- |
${rows.join("\n")}
${B}`;
if (md.includes(A) && md.includes(B)) md = md.replace(new RegExp(`${A}[\\s\\S]*?${B}`), section);
else md = md.replace(/\n### তৈরি ভিডিও থেকে, সব প্ল্যাটফর্মের জন্য/, `\n${section}\n\n### তৈরি ভিডিও থেকে, সব প্ল্যাটফর্মের জন্য`);
writeFileSync(vm, md);
console.log(`✓ ${studio.length} studio codes in tools/variants.json + VARIANTS.md (${rows.filter((r) => r.includes("বেটা")).length} with a rendered sample)`);
