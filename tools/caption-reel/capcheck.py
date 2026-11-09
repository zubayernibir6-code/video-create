#!/usr/bin/env python3
"""capcheck.py <captions.ass> [face_series.json]   (tools/caption-reel; system python, needs numpy + ffmpeg)

Renders the caption track ALONE on a mid-grey 1080x1920 frame at the midpoint of EVERY Dialogue event and measures the
ink box (text + outline + shadow). It prints: the widest page and the side margins (the Reels side zone is 6 % = 65 px),
the tallest page (a page that wrapped onto a second line is about twice as tall: > 150 px is flagged), the topmost and
lowest ink, and, given a face series (a list of {t, whisker_tip_y, ...} from tools/hook-ad/faces.py or a hand
measurement), the gap between each event's ink top and the lowest face point in that event's time window
(negative = the caption touches the face). It also writes <captions>.capcheck.json (one row per event).
Needs the ASS fonts in ~/.fonts (libass finds them there). Takes ~10 s for 124 events.

Exit code 0 = PASS, 1 = FAIL (a page wraps, leaves the 65 px side zone, or touches the face).
Verified 2026-11-09 on reel-4784-captions: the delivered captions PASS (124 events, widest 802 px, min side margin
139 px, no wrapped page, smallest gap to the face 16 px). Two broken copies of the same words FAIL: size 140 (9 pages
wrap, up to 259 px tall, and touch the face) and centre y 1280 instead of 1350 (33 events touch the face).
"""
import json, os, subprocess, sys
import numpy as np

ass = sys.argv[1]
faces = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
W, H, FPS = 1080, 1920, 30

def sec(s):
    h, m, x = s.split(':')
    return int(h) * 3600 + int(m) * 60 + float(x)

events = []
for line in open(ass, encoding='utf-8'):
    if line.startswith('Dialogue:'):
        p = line.split(',', 9)
        events.append((sec(p[1]), sec(p[2]), p[9].strip()))
idx = [int(((a + b) / 2) * FPS) for a, b, _ in events]
order = sorted(set(idx))
sel = '+'.join(f'eq(n,{n})' for n in order)
vf = f"select='{sel}',ass={ass}:fontsdir={os.path.expanduser('~')}/.fonts:shaping=complex,format=gray"
cmd = ['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', f'color=c=0x808080:s={W}x{H}:r={FPS}:d=120',
       '-vf', vf, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1']
data = subprocess.run(cmd, capture_output=True, check=True).stdout
frames = np.frombuffer(data, np.uint8).reshape(-1, H, W)
assert len(frames) == len(order), f'got {len(frames)} frames for {len(order)} wanted'
box = {}
for n, f in zip(order, frames):
    bg = int(np.median(f))
    m = np.abs(f.astype(np.int16) - bg) > 10
    rows, cols = np.where(m.any(axis=1))[0], np.where(m.any(axis=0))[0]
    box[n] = (int(rows[0]), int(rows[-1]), int(cols[0]), int(cols[-1])) if len(rows) else None

res = []
for (a, b, txt), n in zip(events, idx):
    bx = box[n]
    if bx is None:
        res.append(dict(a=a, b=b, text=txt, empty=True)); continue
    top, bot, left, right = bx
    r = dict(a=round(a, 2), b=round(b, 2), top=top, bot=bot, left=left, right=right, w=right - left + 1, h=bot - top + 1)
    if faces:
        near = [f['whisker_tip_y'] for f in faces if a - 0.12 <= f['t'] <= b + 0.12 and f.get('whisker_tip_y')]
        if near:
            r['face_low'] = max(near); r['gap'] = top - max(near)
    res.append(r)
ok = [r for r in res if not r.get('empty')]
print(f'{len(events)} events, {len(ok)} measured, {len(res) - len(ok)} empty')
print(f"widest {max(r['w'] for r in ok)} px | min left {min(r['left'] for r in ok)} | max right {max(r['right'] for r in ok)} (frame {W}; side zone 6% = 65 px) | min margin {min(min(r['left'], W - 1 - r['right']) for r in ok)}")
print(f"tallest {max(r['h'] for r in ok)} px | ink top {min(r['top'] for r in ok)}..{max(r['top'] for r in ok)} | ink bottom {min(r['bot'] for r in ok)}..{max(r['bot'] for r in ok)}")
tall = [r for r in ok if r['h'] > 150]
print('wrapped/too-tall pages:', len(tall), [(r['a'], r['h']) for r in tall][:8])
bad = bool(tall) or min(min(r['left'], W - 1 - r['right']) for r in ok) < 65
if faces:
    g = sorted((r['gap'], r['a'], r['top'], r['face_low']) for r in ok if 'gap' in r)
    print('smallest gaps to the face (gap, t, ink_top, face_low):', g[:6])
    print('events touching the face (gap < 0):', sum(1 for x in g if x[0] < 0), '| gap < 12 px:', sum(1 for x in g if x[0] < 12))
    bad = bad or any(x[0] < 0 for x in g)
json.dump(res, open(os.path.splitext(ass)[0] + '.capcheck.json', 'w'), ensure_ascii=False)
print('RESULT:', 'FAIL (a page wraps, leaves the side zone, or touches the face)' if bad else 'PASS')
sys.exit(1 if bad else 0)
