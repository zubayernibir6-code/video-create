// srt.mjs — shared subtitle reader for burn-subs.mjs and srt-to-words.mjs.
//
// Reads .srt and .vtt the way Windows actually saves them: UTF-8 with or without a BOM, UTF-16
// ("Unicode" in Notepad), CRLF line endings. HyperFrames 0.8.33's own SRT import splits cues on
// "\n\n" only, so a CRLF file from Notepad imports as nothing; reading it here first avoids that.
// All text is NFC-normalised so the same Bengali word always has the same code points.

import { readFileSync } from "node:fs";

export function readSubtitleText(file) {
  const buf = readFileSync(file);
  let text;
  if (buf[0] === 0xff && buf[1] === 0xfe) text = buf.subarray(2).toString("utf16le");
  else if (buf[0] === 0xfe && buf[1] === 0xff) text = Buffer.from(buf.subarray(2)).swap16().toString("utf16le");
  else text = buf.toString("utf8").replace(/^﻿/, "");
  return text.replace(/\r\n?/g, "\n").normalize("NFC");
}

// "00:01:02,345", "00:01:02.345" or "01:02.345" → seconds
function seconds(ts) {
  const m = ts.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})$/);
  if (!m) throw new Error(`Bad subtitle timestamp: "${ts}"`);
  return Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0")) / 1000;
}

// → [{ start, end, text }] where text keeps its line breaks ("\n") and loses HTML-style tags.
export function parseSubtitles(file) {
  const text = readSubtitleText(file).replace(/^WEBVTT[^\n]*\n/, "");
  const cues = [];
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split("\n");
    const at = lines.findIndex((l) => l.includes("-->"));
    if (at === -1) continue;
    const [a, b] = lines[at].split("-->");
    const body = lines
      .slice(at + 1)
      .map((l) => l.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join("\n");
    if (!body) continue;
    cues.push({ start: seconds(a), end: seconds(b.trim().split(/\s+/)[0]), text: body });
  }
  if (!cues.length) throw new Error(`No subtitles found in ${file}`);
  return cues.sort((x, y) => x.start - y.start);
}
