#!/usr/bin/env python3
"""strips.py <video> <captions.ass> <outdir> [y0=1200]   (tools/caption-reel; system python, needs Pillow + ffmpeg)

One crop of the RENDERED video (x 40-1040, y y0 to y0+240: the chin and the caption) per caption PAGE, taken at the
middle event of the page, stacked 2 x 6 per image (strips_1.png ...) with the page number and time on each tile. A
47-page Reel is 4 images that Claude can read at full size, so every Bengali conjunct and every spelling is looked at
once (CLAUDE.md §0d rule 9) instead of 120 contact-sheet tiles. y0 = about 150 px above the caption ink top.

Verified 2026-11-09 on reel-4784-captions (47 pages -> 4 images): it showed "Flow।" reading as "Flowl", which led to the
danda rule in make_captions.py.
"""
import os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

video, ass, out = sys.argv[1:4]
y0 = int(sys.argv[4]) if len(sys.argv) > 4 else 1200
os.makedirs(out, exist_ok=True)

def sec(s):
    h, m, x = s.split(':')
    return int(h) * 3600 + int(m) * 60 + float(x)

ev = []
for line in open(ass, encoding='utf-8'):
    if line.startswith('Dialogue:'):
        p = line.split(',', 9)
        plain = re.sub(r'\{[^}]*\}', '', p[9]).strip()
        ev.append((sec(p[1]), sec(p[2]), plain))
pages = []
for e in ev:
    if pages and pages[-1][0][2] == e[2]:
        pages[-1].append(e)
    else:
        pages.append([e])
pick = [pg[len(pg) // 2] for pg in pages]
idx = [int(((a + b) / 2) * 30) for a, b, _ in pick]
sel = '+'.join(f'eq(n,{n})' for n in idx)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', f"select='{sel}',crop=1000:240:40:{y0}",
                '-fps_mode', 'passthrough', os.path.join(out, 'c_%03d.png')], check=True)
font = ImageFont.load_default()
per = 12
for k in range(0, len(pick), per):
    sheet = Image.new('RGB', (2000, 6 * 240), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for j, (a, b, t) in enumerate(pick[k:k + per]):
        im = Image.open(os.path.join(out, f'c_{k + j + 1:03d}.png'))
        x, y = (j % 2) * 1000, (j // 2) * 240
        sheet.paste(im, (x, y))
        d.rectangle([x, y, x + 150, y + 16], fill=(0, 0, 0))
        d.text((x + 4, y + 2), f'page {k + j + 1}  t={(a + b) / 2:.2f}s', fill=(0, 255, 0), font=font)
    sheet.save(os.path.join(out, f'strips_{k // per + 1}.png'))
print(len(pages), 'pages ->', (len(pick) + per - 1) // per, 'images in', out)
