#!/usr/bin/env node
// bijoy2unicode.mjs — turn Bijoy / SutonnyMJ-typed Bengali (the "garbage" letters you see when such text
// is pasted outside a SutonnyMJ font) into proper Unicode Bengali that videos, subtitles and the web can use.
//
//   node "E:/Video Create/tools/bijoy2unicode.mjs" <file.txt>          → writes <file>-unicode.txt beside it
//   node "E:/Video Create/tools/bijoy2unicode.mjs" "Avwg evsjvq Mvb MvB|"   → prints আমি বাংলায় গান গাই।
//
// Text files may be saved by Notepad as ANSI (Windows-1252), UTF-8 or Unicode (UTF-16): all three are read.
// Engine: tools/bijoy (bijoy-unicode-converter 0.1.2, MIT). Tested 2026-10-06 on 21 known strings: 20 exact.
// The one miss was a reph + ya-phola + e-kar cluster (দৈর্ঘ্যের came out as দৈর্ঘ্যরে), so proofread long texts.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ConvertToUnicode } from "./bijoy/src/index.js";

function readText(file) {
  const buf = readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf[0] === 0xfe && buf[1] === 0xff) return Buffer.from(buf.subarray(2)).swap16().toString("utf16le");
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^\uFEFF/, "");
  } catch {
    return new TextDecoder("windows-1252").decode(buf); // Notepad "ANSI" on an English-locale Windows
  }
}

const convert = (s) => ConvertToUnicode("bijoy", s.replace(/\r\n?/g, "\n")).normalize("NFC");

const arg = process.argv.slice(2).join(" ");
if (!arg) {
  console.log('Usage: node bijoy2unicode.mjs <file.txt>   or   node bijoy2unicode.mjs "<Bijoy text>"');
  process.exit(2);
}
if (existsSync(arg) && /\.txt$/i.test(arg)) {
  const out = path.join(path.dirname(arg), `${path.parse(arg).name}-unicode.txt`);
  const text = convert(readText(arg));
  writeFileSync(out, text, "utf8");
  console.log(`✓ ${out}`);
  console.log(`  ${text.split("\n").length} line(s). Please read it through once: rare clusters like দৈর্ঘ্যের can come out misordered.`);
} else {
  console.log(convert(arg));
}
