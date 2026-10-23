import raw from "./voiceover.words.json";

export type VoiceWord = {
  id: string;
  text: string;
  start: number;
  end: number;
};

export const voiceWords = raw as VoiceWord[];

/** Show the word a hair before the voice, so the caption lands with the sound. */
export const CAPTION_LEAD = 0.08;

export type CaptionLine = {
  start: number;
  end: number;
  words: VoiceWord[];
};

export const captionLines = (words: VoiceWord[]): CaptionLine[] => {
  const lines: CaptionLine[] = [];
  let cur: VoiceWord[] = [];
  const flush = () => {
    if (cur.length === 0) {
      return;
    }
    lines.push({
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      words: cur,
    });
    cur = [];
  };
  for (const w of words) {
    const prev = cur[cur.length - 1];
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (
      prev &&
      (w.start - prev.end > 0.45 ||
        chars + w.text.length > 34 ||
        w.end - cur[0].start > 3.2)
    ) {
      flush();
    }
    cur.push(w);
  }
  flush();
  return lines;
};

export const wordIndexAt = (time: number) => {
  const t = time + CAPTION_LEAD;
  let last = -1;
  for (let i = 0; i < voiceWords.length; i++) {
    const w = voiceWords[i];
    const next = voiceWords[i + 1];
    const end = next ? Math.min(w.end, next.start) : w.end;
    if (t >= w.start && t < end) {
      return i;
    }
    if (w.start <= t) {
      last = i;
    }
  }
  if (last < 0) {
    return -1;
  }
  const w = voiceWords[last];
  const next = voiceWords[last + 1];
  const spokenEnd = next ? Math.min(w.end, next.start) : w.end;
  const gap = next ? next.start - spokenEnd : 9;
  if (t - spokenEnd < 0.18 && gap < 0.4) {
    return last;
  }
  return -1;
};

export const lineAt = (time: number) => {
  const lines = captionLines(voiceWords);
  const idx = wordIndexAt(time);
  if (idx >= 0) {
    const id = voiceWords[idx].id;
    const hit = lines.find((line) => line.words.some((w) => w.id === id));
    if (hit) {
      return hit;
    }
  }
  const t = time + CAPTION_LEAD;
  return (
    lines.find((line) => t >= line.start && t <= line.end + 0.2) ?? null
  );
};

export const hits = (word: string, keys: string[]) => {
  const n = word.toLowerCase();
  return keys.some((k) => n.includes(k.toLowerCase()));
};
