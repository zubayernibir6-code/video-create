# FFmpeg recipes (tested in D:\Video Create)

Every recipe below was run on 2026-10-24 on this laptop with FFmpeg 9.0.2, on synthetic test media (a 12 s
1080p test clip carrying a Piper Bengali voice line, a 30 s synthesised music bed, pack SFX), and measured.
More recipes verified here, including stabilise, denoise, LUTs, HDR → SDR and green screen, are in the
workspace's CLAUDE.md §0c.

- Run from the project folder with relative paths: a drive letter (`D:`) breaks filter arguments.
- From node, pass each argument as an array item (`spawnSync("ffmpeg", [...])`); the quotes below are for Git Bash.
- Python is only `PY` = `"D:/Video Create/tools/pyenv/Scripts/python.exe"`.
- **Colour labels:** every intermediate libx264 encode gets
  `-x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709` (as burn-subs and finish.mjs do). A file that
  lacks them can be labelled without re-encoding:
  `ffmpeg -i in.mp4 -c copy -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0 out.mp4`
  (finish.mjs QC turned WARN into PASS).

## Probe

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate,avg_frame_rate,color_transfer -of json input/aroll.mp4
```
If `r_frame_rate` and `avg_frame_rate` differ, the file is variable frame rate: convert it first for long FFmpeg
edits. `color_transfer` arib-std-b67 or smpte2084 means an HDR phone clip: tone-map it first (CLAUDE.md §0c).

## CFR (constant frame rate)

```bash
ffmpeg -i input/phone.mp4 -vf fps=30 -c:v libx264 -crf 18 -preset fast -c:a aac -ar 48000 work/phone_cfr.mp4
```

## Cut and join the keep list

keep.json comes from `silence_keep.py`: `{"source", "duration", "segments": [{"start", "end"}, …]}`. In node:
```js
const keep = JSON.parse(fs.readFileSync("work/keep.json", "utf8")).segments;
const parts = keep.map((k, i) =>
  `[0:v]trim=start=${k.start}:end=${k.end},setpts=PTS-STARTPTS[v${i}];` +
  `[0:a]atrim=start=${k.start}:end=${k.end},asetpts=PTS-STARTPTS[a${i}]`);
const fc = parts.join(";") + ";" + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[vc][a];[vc]fps=30[v]`;
spawnSync("ffmpeg", ["-i", "input/aroll.mp4", "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "work/cut.mp4"], { stdio: "inherit" });
```
Tested: three segments of 2.5 + 3.5 + 3.0 s gave exactly 9.0 s. silence_keep cuts don't fall on whole frames, so
without `fps=30` (the output fps) six pieces came out at 29.87 fps with a frame missing at one join; with it, exactly
30 fps and an identical soundtrack.

## Reframe 16:9 → 9:16

Centre crop (subject in the middle):
```bash
ffmpeg -i work/cut.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920,setsar=1" -c:a copy work/v916.mp4
```
Blurred fill (whole frame visible, blurred copy behind; STYLE.md §৬: only when in a hurry):
```bash
ffmpeg -i work/cut.mp4 -filter_complex "[0:v]split=2[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2[bgb];[fg]scale=1080:-2[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1[v]" -map "[v]" -map 0:a -c:a copy work/v916_blur.mp4
```
Off-centre subject: replace `crop=ih*9/16:ih` with `crop=ih*9/16:ih:X:0` and pick X from a contact sheet.

## Punch-in on one segment (1.15×)

```bash
ffmpeg -i work/v916.mp4 -filter_complex "[0:v]split=2[a][b];[a]trim=0:2,setpts=PTS-STARTPTS[a1];[b]trim=start=2,setpts=PTS-STARTPTS,crop=iw/1.15:ih/1.15,scale=1080:1920,setsar=1[b1];[a1][b1]concat=n=2:v=1:a=0[v]" -map "[v]" -map 0:a -c:a copy work/punch.mp4
```
A punch-in is a cut, not a move. Animated zooms belong in HyperFrames, and land on 1× (CLAUDE.md §0d rule 1).

## Ken Burns on a photo (3 s, zooms OUT and lands on 1×)

The move ends on the photo's own framing (STYLE.md §৫). Scale the photo to 2× first so the slow zoom doesn't jitter:
```bash
ffmpeg -i input/broll/photo.jpg -vf "scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='1.25-0.25*on/89':d=90:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30" -frames:v 90 -c:v libx264 -crf 16 -pix_fmt yuv420p work/broll/photo_kb.mp4
```
For N frames use `on/(N-1)` and `d=N`. Tested: the last frame matched a plain 1× crop of the photo (PSNR 34 dB).

## B-roll cutaway (A-roll audio keeps playing)

B-roll from 2.0 s to 4.5 s on the output timeline:
```bash
ffmpeg -i work/v916.mp4 -i work/broll/clip.mp4 -filter_complex "[1:v]trim=0:2.5,setpts=PTS-STARTPTS+2.0/TB[b];[0:v][b]overlay=0:0:enable='between(t,2.0,4.5)':eof_action=pass[v]" -map "[v]" -map 0:a -c:v libx264 -crf 18 -c:a copy work/with_broll.mp4
```
Scale/crop the B-roll to the output size first (as in reframe). Tested: the B-roll fills the frame at 3 s and is
gone at 5 s. For picture-in-picture, scale it smaller and change the overlay x:y.

## Captions (Bengali-safe)

```bash
PY "<this skill>/scripts/make_captions.py" work/voice.words.json --keep work/keep.json -o work/captions.ass --preset bold-pop --font "Hind Siliguri" --size 59 --words-per-page 3 --width 1080 --height 1920
node "D:/Video Create/tools/burn-subs.mjs" work/with_broll.mp4 work/captions.ass work/captioned.mp4
```
burn-subs runs libass with only the pack fonts in a clean temp folder, so conjuncts shape correctly; never use
FFmpeg's `subtitles=` or `drawtext` for Bengali (they gave স্‌বপ্‌ন instead of স্বপ্ন). make_captions centres at 60 %
of the height; for 16:9 pass `--center-y` at 90 % of H. `captions.srt` beside the .ass is for uploading.

## Audio: ducked music + SFX on the beat

Voice from the video (input 0), music (1), whoosh hitting at 1.95 s (2), pop hitting at 3.0 s (3). D = the video's
length, F = the fade-out = min(2.5, D ÷ 4) and END = D − F, all written as plain numbers (`afade` refuses `9-2.5`,
and a 2.5 s fade on a 2.5 s clip starts below zero, which it also refuses). Each SFX starts `lead_s` early
(assets/sfx/manifest.json: whoosh 0.076, pop 0.116), so `adelay` = (hit − lead_s) × 1000:
```bash
ffmpeg -i work/captioned.mp4 -i "D:/Video Create/assets/music/<mood>/<track>.mp3" -i "D:/Video Create/assets/sfx/whoosh.mp3" -i "D:/Video Create/assets/sfx/pop.mp3" -filter_complex "[0:a]asplit=2[vo][sc];[1:a]atrim=0:D,asetpts=PTS-STARTPTS,afade=t=in:d=0.5,afade=t=out:st=END:d=F,volume=0.25[m];[m][sc]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=350[mduck];[2:a]adelay=1874:all=1,volume=0.5[w];[3:a]adelay=2884:all=1,volume=0.4[p];[vo][mduck][w][p]amix=inputs=4:duration=first:normalize=0,alimiter=limit=0.89:level=disabled,aresample=48000[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k work/<name>.mp4
```
(Paths in `-i` may hold a drive letter; only filter arguments may not.) Measured with a −16 LUFS voice and a
−16 LUFS music file:
- music at `volume=0.25`: 18.5 dB under the voice while it speaks. The kit's 0.5 left it only 12.5 dB under.
- true peak −1.0 dBFS (the limiter); the whoosh was audible from 1.94 s for a 1.95 s hit.
- `threshold` is a linear level, not dB (CLAUDE.md §4f): lower it (0.01) for a deeper duck.
For a separate voice file, use it in place of `[0:a]`. Overlapping SFX are fine here (amix); only HyperFrames needs
separate track lanes. Loudness is NOT set here: finish.mjs brings the master to −14 LUFS (tested: −15.5 → −14.0).

## Transition between two clips

Both clips must share size, fps, pixel format and timebase. OFFSET = length of clip A − DUR.
```bash
ffmpeg -i work/partA.mp4 -i work/partB.mp4 -filter_complex "[0:v]fps=30,format=yuv420p,settb=AVTB[a0];[1:v]fps=30,format=yuv420p,settb=AVTB[b0];[a0][b0]xfade=transition=slideleft:duration=0.4:offset=OFFSET[v];[0:a][1:a]acrossfade=d=0.4[a]" -map "[v]" -map "[a]" work/joined.mp4
```
Tested: 4 s + 5 s with a 0.4 s slide gave 8.6 s. Everything after the transition moves 0.4 s earlier: shift
caption and SFX times to match. Other transitions: fade, fadeblack, wipeleft, slideup, circleopen, zoomin,
smoothleft, pixelize. A clip with no audio needs a silent track first: `-f lavfi -i anullsrc=r=48000:cl=stereo -shortest`.

## Speed up a stretch (screen recordings)

Seconds 4–12 at 2×:
```bash
ffmpeg -i work/screen.mp4 -filter_complex "[0:v]trim=0:4,setpts=PTS-STARTPTS[v0];[0:a]atrim=0:4,asetpts=PTS-STARTPTS[a0];[0:v]trim=4:12,setpts=(PTS-STARTPTS)/2[v1];[0:a]atrim=4:12,asetpts=PTS-STARTPTS,atempo=2.0[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" work/screen_fast.mp4
```
Tested: 4 + 8/2 = 8.0 s (the file measured 8.07 s; the extra is the audio track's last frame).

## Zoom into part of a screen recording (static)

```bash
ffmpeg -i work/screen.mp4 -vf "crop=960:540:400:200,scale=1920:1080" work/screen_zoom.mp4
```
(crop=w:h:x:y in source pixels; keep 16:9 for 16:9 output, 9:16 for vertical.)

## Multi-cam sync (offset between two cameras)

Save as `work/sync.py` and run `PY work/sync.py input/camA.mp4 input/camB.mp4` (numpy is in pyenv):
```python
import subprocess, sys, numpy as np
def load(path, sr=8000, secs=60):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-t", str(secs), "-ac", "1", "-ar", str(sr),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32)
a, b = load(sys.argv[1]), load(sys.argv[2])
n = 1 << int(np.ceil(np.log2(len(a) + len(b))))
corr = np.fft.irfft(np.fft.rfft(b, n) * np.conj(np.fft.rfft(a, n)), n)
lag = int(np.argmax(corr)); lag = lag - n if lag > n // 2 else lag
print(f"camB is {lag / 8000:+.3f}s behind camA")   # positive: trim that much off the start of camB
```
Tested: found a planted 0.733 s offset exactly.

## Delivery

Never hand-roll the final encode. `node "D:/Video Create/tools/finish.mjs" work/<name>.mp4 --formats=9x16,1x1`
brings loudness to −14 LUFS, runs QC and writes every format, a thumbnail and a GIF to `renders/<name>/<date>/`.

## Thumbnail candidates and single frames

```bash
ffmpeg -ss 4.8 -i work/<name>.mp4 -frames:v 1 work/frame_4.8.png
```
To see the whole video at once: `node "D:/Video Create/tools/contact-sheet.mjs" <video>`.

## Cut rhythm of a reference video

```bash
ffmpeg -i "D:/Video Create/assets/refs/ref-01.mp4" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"
```
Tested: found the cut in a two-shot clip at exactly 2.0 s. Average shot length = duration ÷ (cuts + 1). Pair it
with a contact sheet of the reference; what to borrow goes in STYLE.md §১২ only with his OK.

## SFX of last resort (synthesised)

The pack (`assets/sfx`, 31 sounds) comes first. Only if nothing fits:
```bash
ffmpeg -f lavfi -i "anoisesrc=d=0.6:c=pink:a=0.6" -af "highpass=f=400,lowpass=f=5000,afade=t=in:d=0.35,afade=t=out:st=0.35:d=0.25" work/sfx/whoosh-synth.wav
ffmpeg -f lavfi -i "sine=f=880:d=0.09" -af "afade=t=out:st=0.02:d=0.07,volume=0.8" work/sfx/pop-synth.wav
```
They go in the project's `work/sfx/`, never into the shared `assets/sfx`.
