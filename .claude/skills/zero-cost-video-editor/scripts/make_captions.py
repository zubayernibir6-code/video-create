#!/usr/bin/env python3
"""Turn word timings into burned-in captions (.ass) plus an .srt for uploading.

    python scripts/make_captions.py work/words.json -o work/captions.ass --preset bold-pop
    python scripts/make_captions.py work/words.json --keep work/keep.json -o work/captions.ass

Reads: a flat list [{"text"|"word", "start", "end"}] (HyperFrames transcript.json),
       {"segments": [{"words": [...]}]} (stable-ts / Whisper JSON), or {"words": [...]}.
--keep remaps source times onto the cut timeline, so you can transcribe once, cut, then caption.

Burn in with the `ass` filter and complex shaping (needed for Bangla conjuncts):
    ffmpeg -i cut.mp4 -vf "ass=work/captions.ass:shaping=complex:fontsdir=assets/fonts" ...
"""
import argparse
import json
import sys
from pathlib import Path

PRESETS = {
    # white text, thick black outline, active word in colour: the classic Reels/Shorts look
    "bold-pop": dict(size=78, primary="#FFFFFF", highlight="#FFD700", outline="#000000", outline_w=6,
                     shadow=0, box=False, words=3, bold=True, scale_active=108),
    # sentence-style subtitles on a dark box, no word highlight: tutorials, long-form
    "clean": dict(size=58, primary="#FFFFFF", highlight=None, outline="#000000", outline_w=10,
                  shadow=0, box=True, words=7, bold=False, scale_active=100),
    # quiet, editorial: thin, soft shadow, no outline (pair with a serif font)
    "serif-minimal": dict(size=64, primary="#F5F1E8", highlight="#D9B77E", outline="#000000", outline_w=0,
                          shadow=2, box=False, words=5, bold=False, scale_active=100),
}
BREAK_AFTER = ("।", ".", "?", "!", ",", ";", ":", "…")


def ass_colour(hex_rgb: str, alpha: int = 0) -> str:
    h = hex_rgb.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def load_words(path: str):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        if "segments" in data:
            raw = [w for s in data["segments"] for w in s.get("words", [])]
        elif "words" in data:
            raw = data["words"]
        else:
            sys.exit("words file not recognised: expected a list or {segments|words}")
    else:
        raw = data
    words = []
    for w in raw:
        t = str(w.get("text", w.get("word", ""))).strip()
        for ch in "{}\\":
            t = t.replace(ch, "")
        if t and w.get("start") is not None and w.get("end") is not None:
            words.append({"text": t, "start": float(w["start"]), "end": float(w["end"])})
    return sorted(words, key=lambda w: w["start"])


def remap(words, keep_path: str):
    data = json.loads(Path(keep_path).read_text(encoding="utf-8"))
    segs = [(float(k["start"]), float(k["end"])) for k in (data["segments"] if isinstance(data, dict) else data)]
    out, offset = [], 0.0
    bounds = []
    for a, b in segs:
        bounds.append((a, b, offset))
        offset += b - a
    for w in words:
        mid = (w["start"] + w["end"]) / 2
        for a, b, o in bounds:
            if a <= mid < b:
                out.append({**w, "start": max(a, w["start"]) - a + o, "end": min(b, w["end"]) - a + o})
                break
    return out


def paginate(words, max_words: int, max_gap: float):
    pages, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        if (len(cur) >= max_words or nxt is None or w["text"].endswith(BREAK_AFTER)
                or (nxt["start"] - w["end"]) > max_gap):
            pages.append(cur)
            cur = []
    return pages


def ts_ass(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def ts_srt(t: float) -> str:
    ms = int(round(max(0.0, t) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("words")
    ap.add_argument("-o", "--out", default="work/captions.ass")
    ap.add_argument("--keep", help="keep.json from silence_keep.py, to shift times onto the cut")
    ap.add_argument("--preset", choices=PRESETS, default="bold-pop")
    ap.add_argument("--font", default="Hind Siliguri", help="font family name (file must be in --fontsdir when burning)")
    ap.add_argument("--size", type=int)
    ap.add_argument("--words-per-page", type=int)
    ap.add_argument("--highlight", help="#RRGGBB for the spoken word; 'none' to switch off")
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1920)
    ap.add_argument("--center-y", type=int,
                    help="vertical centre of the caption line in px (default: 60%% of height, inside the Reels safe zone)")
    ap.add_argument("--upper", action="store_true", help="UPPERCASE (Latin text only)")
    ap.add_argument("--max-gap", type=float, default=0.6, help="start a new page after a pause this long (s)")
    a = ap.parse_args()

    p = dict(PRESETS[a.preset])
    if a.size: p["size"] = a.size
    if a.words_per_page: p["words"] = a.words_per_page
    if a.highlight: p["highlight"] = None if a.highlight.lower() == "none" else a.highlight

    words = load_words(a.words)
    if a.keep:
        words = remap(words, a.keep)
    if not words:
        sys.exit("no words to caption")
    if a.upper:
        for w in words:
            w["text"] = w["text"].upper()

    center_y = a.center_y or int(a.height * 0.60)
    margin_v = max(0, a.height - center_y - p["size"] // 2)          # bottom-centre alignment
    border_style = 3 if p["box"] else 1
    outline_col = ass_colour(p["outline"], 0x40 if p["box"] else 0)
    style = (f"Style: Cap,{a.font},{p['size']},{ass_colour(p['primary'])},{ass_colour(p['primary'])},"
             f"{outline_col},&H64000000,{-1 if p['bold'] else 0},0,0,0,100,100,0,0,{border_style},"
             f"{p['outline_w']},{p['shadow']},2,{int(a.width * 0.08)},{int(a.width * 0.08)},{margin_v},1")
    lines = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {a.width}", f"PlayResY: {a.height}",
             "WrapStyle: 0", "ScaledBorderAndShadow: yes", "", "[V4+ Styles]",
             "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, "
             "Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
             "MarginL, MarginR, MarginV, Encoding", style, "", "[Events]",
             "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]

    pages = paginate(words, p["words"], a.max_gap)
    srt = []
    for n, page in enumerate(pages):
        page_end = page[-1]["end"] + 0.15
        if n + 1 < len(pages):
            page_end = min(page_end, pages[n + 1][0]["start"])
        srt.append(f"{n + 1}\n{ts_srt(page[0]['start'])} --> {ts_srt(page_end)}\n{' '.join(w['text'] for w in page)}\n")
        if not p["highlight"]:
            lines.append(f"Dialogue: 0,{ts_ass(page[0]['start'])},{ts_ass(page_end)},Cap,,0,0,0,,"
                         + " ".join(w["text"] for w in page))
            continue
        hl = ass_colour(p["highlight"])
        for i, w in enumerate(page):
            start = w["start"]
            end = page[i + 1]["start"] if i + 1 < len(page) else page_end
            if end <= start:
                continue
            txt = " ".join((f"{{\\c{hl}\\fscx{p['scale_active']}\\fscy{p['scale_active']}}}{x['text']}{{\\r}}"
                            if j == i else x["text"]) for j, x in enumerate(page))
            lines.append(f"Dialogue: 0,{ts_ass(start)},{ts_ass(end)},Cap,,0,0,0,,{txt}")

    out = Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    out.with_suffix(".srt").write_text("\n".join(srt), encoding="utf-8")
    print(f"{len(words)} words -> {len(pages)} caption pages | {out} + {out.with_suffix('.srt')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
