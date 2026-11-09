#!/bin/bash
# render-release.sh <sdr30.mp4> <audio source> <captions.ass> <out.mp4>
# The delivery encode of a captions-only Reel (tools/caption-reel; skill zero-cost-video-editor, "captions only").
# Burns the .ass onto the tone-mapped picture (sdr30.sh) in ONE pass, takes the ORIGINAL audio, normalises it to
# -14 LUFS / TP -1.5 (two-pass loudnorm; the measurement is cached per source in <out dir>/.work), and encodes with the
# house "release" recipe of tools/finish.mjs: ABR 10 Mbps (max 14), 2 s keyframes, NO B-frames, MP4 without an edit
# list, AAC's 1024 priming samples trimmed, so the picture sits on the exact n/30 grid, the sound on its original time,
# and tools/release/spec-check.mjs --for=universal-reel passes with no editList WARN. -preset veryfast: 61 s of
# 1080x1920 took 68-99 s on the 2-CPU cloud machine (3 runs; a caption-only change after a spelling fix = this one command).
# Linux / cloud (bash). Paths must not contain spaces, colons or commas (they go into an FFmpeg filter string).
# Captions need the pack fonts for libass: FONTSDIR (default ~/.fonts holds Hind Siliguri).
#
# Verified 2026-11-09: a re-render of the delivered Reel (reel-4784-captions) with this script passes qc.mjs and
# spec-check --for=universal-reel with no WARN, and matches the delivered file within the encoder's own noise: PSNR
# 43.5 dB (min 41.4), the same as two runs of the IDENTICAL command give each other (42.7 dB). The ABR + VBV encode is
# not bit-exact from run to run on the cloud machine (x264, 3 threads), so compare renders with PSNR, never with a hash.
# The audio is sample-identical except the last 43 ms (this script cuts at the picture's exact length, the first render
# at a typed 61.2333 s, 1.6 samples apart).
set -euo pipefail
SDR=${1:?usage: render-release.sh <sdr30.mp4> <audio source> <captions.ass> <out.mp4>}; SRC=${2:?audio source}
ASS=${3:?captions.ass}; OUT=${4:?out.mp4}
FF=${HYPERFRAMES_FFMPEG_PATH:-ffmpeg}; FP=${HYPERFRAMES_FFPROBE_PATH:-ffprobe}
FONTS=${FONTSDIR:-$HOME/.fonts}
for f in "$SDR" "$SRC" "$ASS"; do [ -f "$f" ] || { echo "no such file: $f" >&2; exit 1; }; done
case "$ASS$FONTS" in *[:,\'\ ]*) echo "ass / fonts path must not contain space : , '" >&2; exit 1 ;; esac

mkdir -p "$(dirname "$OUT")"
WORK="$(dirname "$OUT")/.work"; mkdir -p "$WORK"
LN="$WORK/loudnorm.$(basename "$SRC").$(stat -c %s "$SRC").json"
T0=$(date +%s)
if [ ! -s "$LN" ]; then
  "$FF" -hide_banner -nostats -i "$SRC" -vn -map 0:a:0 -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2> "$WORK/loudnorm.raw"
  sed -n '/^{/,/^}/p' "$WORK/loudnorm.raw" > "$LN"
fi
j() { python3 -I -c "import json;print(json.load(open('$LN'))['$1'])"; }
echo "measured: I=$(j input_i) TP=$(j input_tp) LRA=$(j input_lra)"
NORM="loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=$(j input_i):measured_TP=$(j input_tp):measured_LRA=$(j input_lra):measured_thresh=$(j input_thresh):offset=$(j target_offset),aresample=48000"
DUR=$("$FP" -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$SDR")
AF="$NORM,aresample=48000,atrim=start_sample=1024,asetpts=PTS-STARTPTS,atrim=end=$DUR"

"$FF" -y -hide_banner -loglevel error -stats \
  -i "$SDR" -i "$SRC" -map 0:v:0 -map 1:a:0 \
  -vf "ass=$ASS:fontsdir=$FONTS:shaping=complex" -af "$AF" \
  -c:v libx264 -preset veryfast -b:v 10M -maxrate 14M -bufsize 20M -g 60 -keyint_min 30 -bf 0 -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ac 2 -movflags +faststart -use_editlist 0 -avoid_negative_ts disabled "$OUT"
echo
echo "DONE $OUT in $(( $(date +%s) - T0 )) s"
echo "next: node tools/qc.mjs $OUT --w=1080 --h=1920 --fps=30 --dur=<seconds>; node tools/release/spec-check.mjs $OUT --for=universal-reel"
