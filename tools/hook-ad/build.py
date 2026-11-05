"""build.py: hook-ad engine. One spec.json -> face-aware text layer (ASS) + render (cuts, punch zooms, flash, SFX, -14 LUFS).
    python3 -I tools/hook-ad/build.py <spec.json> [--render]
spec: {"src", "words" (asr.words.json), "faces" (faces.py output), "out", "fix": {asr: correct},
       "cut": [[a,b],...] source seconds removed (cut on shot changes only),
       "cards": [{"text","at","until","style":Box|Hook|Gold,"fs"}], "route": {"stops":[[name,at]],"until"},
       "hits": [source seconds], "phone": "01XXXXXXXXX" or null, "phone_at":[a,b]}
Placement (STYLE §13, his rule 2026-11-04): every card goes in the TOP band (269 px .. head top - 24) when it fits
for its whole show time, else BELOW the head (head bottom + 24 .. 1240) and the word captions (y=1190) step aside while it shows. Heads = largest
YuNet face, grown to hair and chin. Made 2026-11-04 (unity-hook-01 v3)."""
import json, subprocess, sys, os
S = json.load(open(sys.argv[1], encoding="utf-8")); D = os.path.dirname(os.path.abspath(sys.argv[1]))
P = lambda p: p if os.path.isabs(p) else os.path.join(D, p)
W = json.load(open(P(S["words"]), encoding="utf-8")); F = json.load(open(P(S["faces"])))
for w in W: w["text"] = S.get("fix", {}).get(w["text"], w["text"])
CUT = sorted(S.get("cut", []))
def keep(t): return all(not (a <= t < b) for a, b in CUT)
def out(t):  # source time -> output time
    return t - sum(min(b, t) - a for a, b in CUT if t > a)
TOP, CAPY, LOW = 269, 1190, 1240
BELOW = []  # (a,b) source-time spans where a card sits below the head: captions step aside
def heads(st, en):
    hs = []
    for r in F:
        if st - 0.13 <= r["t"] <= en + 0.13 and r["faces"]:
            x, y, w, h = max(r["faces"], key=lambda f: f[2] * f[3])
            if w * h < 80 * 100: continue
            hs.append((x - 0.25 * w, y - 0.55 * h, x + 1.25 * w, y + 1.2 * h))
    return hs
def place(fs, st, en, lines=1):
    h = fs * 1.3 * lines + 36
    hs = heads(st, en)
    top_lim = min([y0 for _, y0, _, _ in hs], default=1100) - 24
    if top_lim - TOP >= h: return TOP + 24 + h / 2
    below = max([y1 for _, _, _, y1 in hs], default=0) + 24
    if below + h <= LOW:
        BELOW.append((st, en)); return below + h / 2
    raise SystemExit(f"NO ROOM for a {fs}px card at {st:.2f}-{en:.2f}s (head {top_lim:.0f}..{below:.0f}): make it smaller or shorter")
def ts(t):
    t = max(0, t); return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
GOLD, WHITE = "&H0035C8FF&", "&H00FFFFFF&"
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Hind Siliguri,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,5,3,5,60,60,0,1
Style: Hook,Baloo Da 2,130,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,8,4,5,40,40,0,1
Style: Box,Hind Siliguri,72,&H00FFFFFF,&H00FFFFFF,&H008A3078,&H008A3078,1,0,0,0,100,100,0,0,3,20,0,5,40,40,0,1
Style: Gold,Baloo Da 2,130,&H0035C8FF,&H0035C8FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,8,4,5,40,40,0,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
DEF = {"Box": 72, "Hook": 130, "Gold": 130}
ev, plan = [], []
def add(a, b, style, text, layer=1):
    if b > a: ev.append(f"Dialogue: {layer},{ts(out(a))},{ts(out(b))},{style},,0,0,0,,{text}")
POP = r"{\fscx40\fscy40\t(0,140,\fscx110\fscy110)\t(140,240,\fscx100\fscy100)}"
for c in S["cards"]:
    fs = c.get("fs", DEF[c["style"]]); y = place(fs, c["at"], c["until"])
    add(c["at"], c["until"], c["style"], r"{\pos(540,%d)\fs%d\fad(0,150)}" % (y, fs) + POP + c["text"])
    plan.append(f"{out(c['at']):6.2f}-{out(c['until']):6.2f}  y={y:4.0f}  {c['text']}")
if S.get("phone"):
    a, b = S["phone_at"]; y = place(120, a, b)
    bn = S["phone"].translate(str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")); bn = bn[:5] + "-" + bn[5:]
    add(a, b, "Gold", r"{\pos(540,%d)\fs120\fad(0,150)}" % y + POP + bn)
    plan.append(f"{out(a):6.2f}-{out(b):6.2f}  y={y:4.0f}  PHONE {bn}")
R = S.get("route")
if R:  # route line with dots that fill as each stop is spoken + the current stop's name
    st0, en0, n = R["stops"][0][1], R["until"], len(R["stops"])
    y = place(72, st0, en0, lines=2) - 50; x0, x1 = 120, 960
    add(st0, en0, "Box", r"{\an7\pos(0,0)\bord0\shad0\1c&H00FFFFFF&\1a&H30&\p1}m %d %d l %d %d l %d %d l %d %d{\p0}" % (x0, y - 3, x1, y - 3, x1, y + 3, x0, y + 3), 1)
    for i, (name, t) in enumerate(R["stops"]):
        cx = x0 + (x1 - x0) * i / (n - 1)
        circ = "m -16 0 b -16 -21 16 -21 16 0 b 16 21 -16 21 -16 0"
        add(st0, t, "Box", r"{\an7\pos(%d,%d)\bord3\3c&H00FFFFFF&\shad0\1c&H008A3078&\p1}%s{\p0}" % (cx, y, circ), 2)
        add(t, en0, "Box", r"{\an7\pos(%d,%d)\bord3\3c&H00FFFFFF&\shad0\1c&H0035C8FF&\fscx40\fscy40\t(0,160,\fscx130\fscy130)\t(160,260,\fscx100\fscy100)\p1}%s{\p0}" % (cx, y, circ), 3)
        nxt = R["stops"][i + 1][1] if i + 1 < n else en0
        add(t, nxt, "Box", r"{\pos(%d,%d)\fad(0,100)}" % (min(max(cx, 230), 850), y + 105) + POP + name, 4)
    plan.append(f"{out(st0):6.2f}-{out(en0):6.2f}  y={y:4.0f}  ROUTE {' > '.join(s for s, _ in R['stops'])}")
# word captions, 2-4 words, the spoken word gold; words inside a cut are dropped
phr, cur = [], []
for w in [w for w in W if keep(w["start"])]:
    if cur and (len(cur) == 4 or w["start"] - cur[-1]["end"] > 0.5): phr.append(cur); cur = []
    cur.append(w)
if cur: phr.append(cur)
for p in phr:
    end = p[-1]["end"] + 0.15
    for i, w in enumerate(p):
        b = p[i + 1]["start"] if i + 1 < len(p) else end
        txt = " ".join((r"{\c" + GOLD + r"\fscx112\fscy112}" + x["text"] + r"{\c" + WHITE + r"\fscx100\fscy100}") if j == i else x["text"] for j, x in enumerate(p))
        a0 = w["start"]
        for x0, x1 in sorted(BELOW):  # clip the caption around cards that use the low band
            if x0 < b and a0 < x1:
                if a0 < x0: add(a0, x0, "Cap", r"{\pos(540,%d)}" % CAPY + txt, 5)
                a0 = max(a0, x1)
        add(a0, b, "Cap", r"{\pos(540,%d)}" % CAPY + txt, 5)
ass = P(S["out"]) + ".ass"; open(ass, "w", encoding="utf-8").write(hdr + "\n".join(ev) + "\n")
print("\n".join(plan))
if "--render" not in sys.argv: sys.exit(0)
# render: keep segments -> concat; punch zoom + flash + whoosh/bass on hits (output time); -14 LUFS
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", P(S["src"])], capture_output=True, text=True).stdout)
segs, t = [], 0.0
for a, b in CUT + [[dur, dur]]:
    if a > t: segs.append((t, a))
    t = b
H = sorted(set(round(out(h), 3) for h in S["hits"] if keep(h)) | set(round(out(a), 3) for a, _ in CUT))
z = "+".join(f"0.12*exp(-7*(t-{h}))*gte(t,{h})" for h in H) or "0"
fl = "+".join(f"0.30*exp(-18*(t-{h}))*gte(t,{h})" for h in H) or "0"
SFX = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "sfx")
fc = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={b-a-0.04}:d=0.04[a{i}];" for i, (a, b) in enumerate(segs))
fc += "".join(f"[v{i}][a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[cv][ca];"
fc += (f"[cv]scale=1080:1920:flags=lanczos,scale=w='trunc(1080*(1+{z})/2)*2':h='trunc(1920*(1+{z})/2)*2':eval=frame,crop=1080:1920,"
       f"eq=brightness='{fl}':contrast=1.06:saturation=1.12:eval=frame,unsharp=5:5:0.5,"
       f"ass={ass}:fontsdir={os.path.join(SFX, '..', 'fonts', 'bengali')},setsar=1[v];")
names = ["whoosh-short.mp3", "impact-bass-1.mp3", "whoosh.mp3", "impact-bass-2.mp3"]
cmd = ["ffmpeg", "-v", "error", "-y", "-i", P(S["src"])]
for i, h in enumerate(H):
    cmd += ["-i", os.path.join(SFX, names[i % len(names)])]
    fc += f"[{i+1}:a]adelay={int(max(0, h - 0.08) * 1000)}:all=1,volume=0.4[s{i}];"
fc += "[ca]" + "".join(f"[s{i}]" for i in range(len(H))) + f"amix=inputs={len(H)+1}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,aresample=48000[a]"
cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-r", "24", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-g", "24", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", P(S["out"]) + ".mp4"]
subprocess.run(cmd, check=True); print("wrote", P(S["out"]) + ".mp4")
