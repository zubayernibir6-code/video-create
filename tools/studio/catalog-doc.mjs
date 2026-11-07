#!/usr/bin/env node
// catalog-doc.mjs — writes docs/business/CATALOG.md (Talha's Bengali service list) from tools/studio/catalog.json,
// so the guide and the machine catalog never disagree (kit v1, 2026-11-07).
//
//   node tools/studio/catalog-doc.mjs
//
// Re-run after any change to catalog.json (new code, price, sample). Sample status comes from the file system:
// a code's sample is "ready" when renders/portfolio/<CODE>_<Brand>.mp4 exists.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WS = path.resolve(import.meta.dirname, "..", "..");
const cat = JSON.parse(readFileSync(path.join(import.meta.dirname, "catalog.json"), "utf8"));
const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const usd = (p) => (p ? `$${bn(p.starter?.toLocaleString("en-US") ?? "")} / $${bn(p.standard?.toLocaleString("en-US") ?? "")} / $${bn(p.premium?.toLocaleString("en-US") ?? "")}` : "—");
let md = `# সার্ভিস-তালিকা (CATALOG)

এই ফাইল যন্ত্রে তৈরি হয় \`tools/studio/catalog.json\` থেকে (\`node tools/studio/catalog-doc.mjs\`)। হাতে বদলাবেন না, catalog.json বদলান।
শেষ আপডেট: ${cat.updated}।

**কীভাবে ব্যবহার করবেন:** ক্লায়েন্ট বা আপনি শুধু কোড বলবেন (যেমন "PL1, Lumen-এর মতো, আমাদের ব্র্যান্ডে")। Claude সেই কোডের ধাঁচ, দৈর্ঘ্য, মিউজিক আর ফন্ট নিয়ে প্রজেক্ট খুলবে:
\`node tools/studio/new-piece.mjs <নাম> --code=PL1 --brand="ক্লায়েন্টের নাম"\`

দাম তিন ধাপে: **শুরু / মাঝারি / প্রিমিয়াম** (USD, বিদেশি ক্লায়েন্ট)। দেশি ক্লায়েন্টের দাম টাকায় আলাদা কলামে। প্রথম ৩ ক্লায়েন্টে "শুরু" দাম, রিভিউর বদলে (প্লেবুক §৩)। সব নমুনা কাল্পনিক ব্র্যান্ডের কনসেপ্ট কাজ।

`;
for (const fam of cat.families) {
  const list = cat.services.filter((s) => s.family === fam.id);
  if (!list.length) continue;
  md += `## ${fam.bn} (${fam.name})\n\n| কোড | নাম | কী | কার জন্য | মাপ · দৈর্ঘ্য | দাম (USD) | টাকায় | নমুনা |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
  for (const s of list) {
    const nice = s.sample?.brand ? `${s.code}_${s.sample.brand.replace(/[^A-Za-z0-9]+/g, "")}` : "";
    const rendered = nice && existsSync(path.join(WS, "renders", "portfolio", `${nice}.mp4`));
    const sample = rendered ? `✅ \`renders/portfolio/${nice}.mp4\`` : s.sample?.status === "ready" ? `✅ ${s.sample.project}` : s.sample?.project ? `⏳ ${s.sample.project}` : "—";
    const dur = s.defaultDuration ? `${(s.aspects || []).join(", ")} · ${bn(s.durationRange?.[0] ?? s.defaultDuration)}–${bn(s.durationRange?.[1] ?? s.defaultDuration)} সে.` : (s.aspects || []).join(", ");
    md += `| **${s.code}** | ${s.bn}<br>${s.name} | ${s.what} | ${s.bestFor || ""} | ${dur} | ${usd(s.price)} | ${s.price?.bdt || ""} | ${sample} |\n`;
  }
  md += "\n";
}
md += `---\nকোডগুলো \`VARIANTS.md\` আর \`tools/variants.json\`-এও আছে। নতুন ধাঁচ মানে নতুন কোড + প্রমাণ-ভিডিও (CLAUDE.md §0g)।\n`;
writeFileSync(path.join(WS, "docs", "business", "CATALOG.md"), md);
console.log(`✓ docs/business/CATALOG.md — ${cat.services.length} services in ${cat.families.length} families`);

// ---- the English one-pager a client gets with a proposal (same data, client wording, USD only)
const money = (n) => `$${Number(n).toLocaleString("en-US")}`;
let en = `# Services & starting prices — Talha Zubayer, Motion Design

Every project: fixed price · a plan with a shot table for your approval before production · all aspect ratios and
captions included · 2 revision rounds · full rights on final payment. Pick a CODE and send the brief
(CLIENT-BRIEF.md). Prices are starting points for a standard scope; we quote a fixed number within 24 hours.

`;
for (const fam of cat.families) {
  const list = cat.services.filter((s) => s.family === fam.id && s.price);
  if (!list.length) continue;
  en += `## ${fam.name}\n\n| Code | Service | What you get | Best for | From | Turnaround |\n| --- | --- | --- | --- | --- | --- |\n`;
  for (const s of list) en += `| **${s.code}** | ${s.name} | ${s.what} | ${s.bestFor || ""} | ${money(s.price.starter)} | ${s.turnaround || "on request"} |\n`;
  en += "\n";
}
en += `---\nSamples: the portfolio page (one concept video per code, all fictional brands). Payment: invoice via Payoneer (card or bank transfer) or Upwork/Contra escrow; 30–50 % to start.\n`;
writeFileSync(path.join(WS, "docs", "business", "client-kit", "SERVICES-en.md"), en);
console.log("✓ docs/business/client-kit/SERVICES-en.md (client one-pager)");
