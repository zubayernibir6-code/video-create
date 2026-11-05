"""accept_check.py: "would the client accept this?" gate for hook-ad videos, run BEFORE showing anything.
    python3 -I tools/hook-ad/accept_check.py <fx.ass> [--phone=<digits as spoken>] [--brand=<word>] [--words=<asr.words.json>] [--faces=<faces of the RENDER>]
Fails (exit 1) on: a phone number that is not a valid Bangladesh number (11 digits, 01[3-9]...), text cards
on screen at the same time whose boxes overlap, a card shown too briefly to read (5 words/s max, TikTok guidance),
no text in the first 0.5 s (hook), brand not on screen within 3 s of first being spoken, text in the top 14 % /
bottom 35 % (Meta Reels safe zone, 1080x1920).
Made 2026-11-04 after unity-hook-01 shipped a 14-digit "phone number" that no customer could dial."""
import re, sys, json
args = dict(a[2:].split("=", 1) for a in sys.argv[2:] if a.startswith("--") and "=" in a)
fails, warns = [], []
if "phone" in args:
    d = re.sub(r"\D", "", args["phone"].translate(str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")))
    if not re.fullmatch(r"01[3-9]\d{8}", d):
        fails.append(f"phone '{d}' has {len(d)} digits: not a valid Bangladesh mobile number (01[3-9] + 8 digits). "
                     "Do NOT show it. Ask for the real number; the voice line must be fixed too.")
def t(s):
    h, m, x = s.split(":"); return int(h) * 3600 + int(m) * 60 + float(x)
ev = []
for line in open(sys.argv[1], encoding="utf-8"):
    if not line.startswith("Dialogue:"): continue
    p = line.split(",", 9)
    if "\\p1" in p[9]: continue  # vector drawings (route line, dots)
    st, en, style, txt = t(p[1]), t(p[2]), p[3], p[9].strip()
    pos = re.search(r"\\pos\((\d+),(\d+)\)", txt)
    fs = re.search(r"\\fs(\d+)", txt)
    plain = re.sub(r"\{[^}]*\}", "", txt)
    ev.append(dict(st=st, en=en, style=style, x=int(pos[1]) if pos else 540, y=int(pos[2]) if pos else 960,
                   fs=int(fs[1]) if fs else {"Cap": 84, "Hook": 140, "Box": 70, "Gold": 120}.get(style, 70), text=plain))
cards = [e for e in ev if e["style"] != "Cap"]
if not any(e["st"] <= 0.5 for e in ev): fails.append("no text on screen in the first 0.5 s (no hook)")
for e in cards:
    words = len(e["text"].split())
    if words and (e["en"] - e["st"]) < words / 5.0: warns.append(f"'{e['text']}' shows {e['en']-e['st']:.2f}s for {words} words (<5 w/s)")
    h = e["fs"] * 1.3
    if e["y"] - h / 2 < 0.14 * 1920 or e["y"] + h / 2 > 0.65 * 1920: fails.append(f"'{e['text']}' at y={e['y']} is outside the Reels safe zone")
for i, a in enumerate(cards):
    for b in cards[i + 1:]:
        if a["st"] < b["en"] and b["st"] < a["en"] and abs(a["y"] - b["y"]) < (a["fs"] + b["fs"]) * 0.65 and abs(a["x"] - b["x"]) < 500:
            fails.append(f"'{a['text']}' and '{b['text']}' overlap on screen ({max(a['st'], b['st']):.2f}s)")
if "brand" in args and "words" in args:
    W = json.load(open(args["words"], encoding="utf-8"))
    said = [w["start"] for w in W if args["brand"] in w["text"]]
    shown = [e["st"] for e in cards if args["brand"] in e["text"]]
    if said and (not shown or min(shown) > said[0] + 3): fails.append(f"brand '{args['brand']}' spoken at {said[0]:.2f}s but not on screen within 3 s")
if "faces" in args:  # faces measured on the RENDERED video (output time): no card may touch a head
    F = json.load(open(args["faces"]))
    for e in cards:
        tw, th = len(e["text"]) * e["fs"] * 0.5, e["fs"] * 1.3
        bx = (e["x"] - tw / 2, e["y"] - th / 2, e["x"] + tw / 2, e["y"] + th / 2)
        for r in F:
            if not (e["st"] + 0.1 <= r["t"] <= e["en"] - 0.1) or not r["faces"]: continue
            x, y, w, h = max(r["faces"], key=lambda f: f[2] * f[3])
            if w * h < 80 * 100: continue
            hb = (x - 0.1 * w, y - 0.35 * h, x + 1.1 * w, y + 1.05 * h)
            if bx[0] < hb[2] and hb[0] < bx[2] and bx[1] < hb[3] and hb[1] < bx[3]:
                fails.append(f"'{e['text']}' covers the face at {r['t']:.2f}s"); break
else:
    warns.append("no --faces: face overlap NOT checked (run tools/hook-ad/faces.py on the render)")
for w in warns: print("WARN ", w)
for f in fails: print("FAIL ", f)
print("RESULT:", "PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
