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
# looks (his A/B/C pick, skill hook-ad): A brand-purple boxes, B bold yellow punch, C premium glass panel
F_ = "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding"
LOOKS = {
 "A": ["Cap,Hind Siliguri,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,5,3,5,60,60,0,1",
       "Hook,Baloo Da 2,130,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,8,4,5,40,40,0,1",
       "Box,Hind Siliguri,72,&H00FFFFFF,&H00FFFFFF,&H008A3078,&H008A3078,1,0,0,0,100,100,0,0,3,20,0,5,40,40,0,1",
       "Gold,Baloo Da 2,130,&H0035C8FF,&H0035C8FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,8,4,5,40,40,0,1"],
 "B": ["Cap,Hind Siliguri,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,6,0,5,60,60,0,1",
       "Hook,Baloo Da 2,130,&H0000E6FF,&H0000E6FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,10,6,5,40,40,0,1",
       "Box,Hind Siliguri,72,&H00101010,&H00101010,&H0000E6FF,&H0000E6FF,1,0,0,0,100,100,0,0,3,20,0,5,40,40,0,1",
       "Gold,Baloo Da 2,130,&H0000E6FF,&H0000E6FF,&H00101010,&H00101010,1,0,0,0,100,100,0,0,1,10,5,5,40,40,0,1"],
 "C": ["Cap,Hind Siliguri,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,1,0,0,0,100,100,0,0,1,4,2,5,60,60,0,1",
       "Hook,Baloo Da 2,130,&H00FFFFFF,&H00FFFFFF,&H40281420,&H80000000,1,0,0,0,100,100,0,0,1,4,6,5,40,40,0,1",
       "Box,Hind Siliguri,72,&H00FFFFFF,&H00FFFFFF,&H5A201018,&H5A201018,1,0,0,0,100,100,0,0,3,22,0,5,40,40,0,1",
       "Gold,Baloo Da 2,130,&H0070D8F5,&H0070D8F5,&H40281420,&H80000000,1,0,0,0,100,100,0,0,1,4,6,5,40,40,0,1"]}
LOOK = S.get("look", "A")
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{styles}[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
DEF = {"Box": 72, "Hook": 130, "Gold": 130}; TYPED = []
hdr = hdr.replace("{styles}", "\n".join("Style: " + x for x in LOOKS[LOOK]) + "\n")
ev, plan = [], []
SDUR = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", P(S["src"])], capture_output=True, text=True).stdout)
END = S.get("end"); END0 = out(SDUR)  # end card: a blurred still of the source at end.bg, after the last kept frame
def add(a, b, style, text, layer=1):
    if b > a: ev.append(f"Dialogue: {layer},{ts(out(a))},{ts(out(b))},{style},,0,0,0,,{text}")
POP = r"{\fscx40\fscy40\t(0,140,\fscx110\fscy110)\t(140,240,\fscx100\fscy100)}"
for c in S["cards"]:
    fs = c.get("fs", DEF[c["style"]]); y = c["y"] if "y" in c else place(fs, c["at"], c["until"], c.get("lines", 1))
    if c.get("type"):  # typed character by character over c["type"] seconds (phone numbers: one digit at a time)
        tx, n = c["text"], len(c["text"]); dt = c["type"] / n
        for k in range(1, n + 1):  # full string kept invisible after the cursor so the centre never jumps
            vis = tx[:k] + (r"{\alpha&HFF&}" + tx[k:] if k < n else "")
            add(c["at"] + (k - 1) * dt, c["at"] + k * dt if k < n else c["until"], c["style"], r"{\pos(540,%d)\fs%d%s}" % (y, fs, r"\fad(0,150)" if k == n else "") + vis)
        TYPED.append((c["at"], c["type"]))
    else:
        add(c["at"], c["until"], c["style"], r"{\pos(540,%d)\fs%d\fad(0,150)}" % (y, fs) + POP + c["text"])
    plan.append(f"{out(c['at']):6.2f}-{out(c['until']):6.2f}  y={y:4.0f}  {c['text']}")
if S.get("phone"):
    a, b = S["phone_at"]; y = place(120, a, b)
    bn = S["phone"].translate(str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")); bn = bn[:5] + "-" + bn[5:]
    add(a, b, "Gold", r"{\pos(540,%d)\fs120\fad(0,150)}" % y + POP + bn)
    plan.append(f"{out(a):6.2f}-{out(b):6.2f}  y={y:4.0f}  PHONE {bn}")
if END:
    for c in END["cards"]:
        a, b = END0 + c["at"], END0 + END["dur"]; fs = c.get("fs", DEF[c["style"]])
        ev.append(f"Dialogue: 1,{ts(a)},{ts(b)},{c['style']},,0,0,0,," + r"{\pos(540,%d)\fs%d}" % (c["y"], fs) + POP + c["text"])
        plan.append(f"{a:6.2f}-{b:6.2f}  y={c['y']:4d}  END {c['text']}")
R = S.get("route")
if R:  # route line with dots that fill as each stop is spoken + the current stop's name
    st0, en0, n = R["stops"][0][1], R["until"], len(R["stops"])
    y = place(72, st0, en0, lines=2) - 50; x0, x1 = 120, 960
    add(st0, en0, "Hook", r"{\an7\pos(0,0)\bord0\shad0\1c&H00FFFFFF&\1a&H30&\p1}m %d %d l %d %d l %d %d l %d %d{\p0}" % (x0, y - 3, x1, y - 3, x1, y + 3, x0, y + 3), 1)
    for i, (name, t) in enumerate(R["stops"]):
        cx = x0 + (x1 - x0) * i / (n - 1)
        circ = "m -16 0 b -16 -21 16 -21 16 0 b 16 21 -16 21 -16 0"
        add(st0, t, "Hook", r"{\an7\pos(%d,%d)\bord3\3c&H00FFFFFF&\shad0\1c&H008A3078&\p1}%s{\p0}" % (cx, y, circ), 2)
        add(t, en0, "Hook", r"{\an7\pos(%d,%d)\bord3\3c&H00FFFFFF&\shad0\1c&H0035C8FF&\fscx40\fscy40\t(0,160,\fscx130\fscy130)\t(160,260,\fscx100\fscy100)\p1}%s{\p0}" % (cx, y, circ), 3)
        nxt = R["stops"][i + 1][1] if i + 1 < n else en0
        add(t, nxt, "Box", r"{\pos(%d,%d)\fs%d\fad(0,100)}" % (min(max(cx, 260), 820), y + 115, R.get("fs", 84)) + POP + name, 4)
    plan.append(f"{out(st0):6.2f}-{out(en0):6.2f}  y={y:4.0f}  ROUTE {' > '.join(s for s, _ in R['stops'])}")
# word captions, 2-4 words, the spoken word gold; words inside a cut are dropped
phr, cur = [], []
for w in [w for w in W if keep(w["start"])]:
    brk = any(cur and cur[-1]["start"] < b_ <= w["start"] for b_ in S.get("breaks", []))
    if cur and (len(cur) == 4 or w["start"] - cur[-1]["end"] > 0.5 or brk): phr.append(cur); cur = []
    cur.append(w)
if cur: phr.append(cur)
for pi, p in enumerate(phr):
    end = p[-1]["end"] + 0.15
    if pi + 1 < len(phr): end = min(end, phr[pi + 1][0]["start"])  # never two caption lines at once
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
dur = SDUR
segs, t = [], 0.0
for a, b in CUT + [[dur, dur]]:
    if a > t: segs.append((t, a))
    t = b
HN = {}  # output time -> sfx name ("hits": [t] or [[t, "sfx.mp3"]])
for h in S["hits"]:
    t_, nm = (h, None) if not isinstance(h, list) else h
    if keep(t_): HN[round(out(t_), 3)] = nm
for a, _ in CUT:
    if out(a) < END0 - 0.05: HN.setdefault(round(out(a), 3), "whoosh-cinematic.mp3")
if END: HN[round(END0, 3)] = "impact-bass-2.mp3"
H = sorted(HN)
WH = sorted(set(round(out(t_), 3) for t_ in S.get("whip", []) if keep(t_)) | set(round(out(a), 3) for a, _ in CUT))
z = "+".join(f"0.12*exp(-7*(t-{h}))*gte(t,{h})" for h in H) or "0"
fl = "+".join(f"0.30*exp(-18*(t-{h}))*gte(t,{h})" for h in H) or "0"
SFX = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "sfx")
fc = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st={b-a-0.04}:d=0.04[a{i}];" for i, (a, b) in enumerate(segs))
NS = len(segs)
if END:  # a still of the source at end.bg, blurred + darkened, held for end.dur, silent (music carries it)
    bg, ed = END["bg"], END["dur"]
    fc += (f"[0:v]trim=start={bg}:duration=0.05,setpts=PTS-STARTPTS,fps=24,trim=end_frame=1,loop=loop={int(ed*24)+2}:size=1:start=0,"
           f"setpts=N/24/TB,trim=duration={ed},gblur=sigma=22,eq=brightness={END.get('dim', -0.16)}:saturation=0.9,setsar=1[v{NS}];"
           f"aevalsrc=0:d={ed}:s=48000:c=stereo[a{NS}];")
    NS += 1
fc += "".join(f"[v{i}][a{i}]" for i in range(NS)) + f"concat=n={NS}:v=1:a=1[cv][ca];"
fc += (f"[cv]scale=1080:1920:flags=lanczos:out_color_matrix=bt709,scale=w='trunc(1080*(1+{z})/2)*2':h='trunc(1920*(1+{z})/2)*2':eval=frame,crop=1080:1920,"
       f"eq=brightness='{fl}':contrast=1.06:saturation=1.12:eval=frame,unsharp=5:5:0.5,"
       + (("avgblur=sizeX=48:sizeY=1:enable='" + "+".join(f"between(t,{w-0.083},{w+0.083})" for w in WH) + "',") if WH else "") +
       f"ass={ass}:fontsdir={os.path.join(SFX, '..', 'fonts', 'bengali')},setsar=1,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709[v];")
names = ["whoosh-short.mp3", "impact-bass-1.mp3", "whoosh.mp3", "impact-bass-2.mp3"]
LEAD = {k: v.get("lead_s", 0) for k, v in json.load(open(os.path.join(SFX, "manifest.json"), encoding="utf-8")).items()} if os.path.exists(os.path.join(SFX, "manifest.json")) else {}
cmd = ["ffmpeg", "-v", "error", "-y", "-i", P(S["src"])]; k = 1; mixin = []
def sfx(name, t, vol):
    global k, fc
    cmd.extend(["-i", os.path.join(SFX, name)]); lead = LEAD.get(name.rsplit(".", 1)[0], 0.05)
    fc += f"[{k}:a]atrim=0:1.6,afade=t=out:st=1.2:d=0.4,adelay={int(max(0, t - lead) * 1000)}:all=1,volume={vol}[s{k}];"; mixin.append(f"[s{k}]"); k += 1
for i, h in enumerate(H): sfx(HN[h] or names[i % len(names)], h, 0.4)
for a, d in TYPED: sfx("typing.mp3", out(a), 0.22)
M = S.get("music")
if M:  # music bed, ducked under the voice (sidechain), ~18 dB below it
    cmd += ["-i", P(M["file"])]
    fc += f"[ca]asplit=2[cav][key];[{k}:a]volume={M.get('gain', 0.32)},aresample=48000[mb];[mb][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[mus];"
    mixin.append("[mus]"); k += 1
fc += ("[cav]" if M else "[ca]") + "".join(mixin) + f"amix=inputs={len(mixin)+1}:normalize=0:duration=first,acompressor=threshold=0.25:ratio=3:attack=5:release=120:makeup=1.6,alimiter=limit=0.8:level=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000[a]"
cmd += ["-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-r", "24", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", "-g", "24", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", P(S["out"]) + ".mp4"]
subprocess.run(cmd, check=True); print("wrote", P(S["out"]) + ".mp4")
