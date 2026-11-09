#!/bin/bash
# sdr30.sh <source video> <out.mp4> [seconds]
# A phone clip -> 30 fps, 1080x1920, SDR BT.709, picture only (no audio), CRF 12 so the later caption pass is the only
# visible encode. Linux / cloud (bash). Part of tools/caption-reel (skill zero-cost-video-editor, "captions only").
#
# Why: an iPhone clip is HDR (HLG, BT.2020, 10-bit). Played or scaled as if it were SDR it looks washed out; converted
# with zscale alone it is blown out. The studio's chain (docs/tools-and-setup.md:531) = linear light at 100 nits ->
# BT.709 primaries -> hable tone map -> BT.709 transfer, tv range. It is single-threaded: 61 s of 1080x1920 60 fps took
# 161 s on the 2-CPU cloud machine (the encode is the small part). An SDR source skips the tone map and is only
# re-timed to 30 fps. The rotation flag (a portrait clip stored 1920x1080) is applied by FFmpeg itself.
# Stops when the DISPLAY shape is not 9:16 (reframing is finish.mjs's job, not a silent stretch).
#
# Verified 2026-11-09 on IMG_4784_1.mov (HEVC Main10 HLG, 1920x1080 + rotate 90, 60 fps): a 3-s run (the 3rd argument)
# gives 90 frames, and frames 1-80 are bit-for-bit the delivered intermediate's (framemd5); frames 81-90 differ only
# because x264's 10-frame lookahead sees the end of the 3-s excerpt (the full clip has no such end). A CRF encode like
# this one is bit-exact from run to run; the ABR encode of render-release.sh is not (see there).
set -euo pipefail
SRC=${1:?usage: sdr30.sh <source> <out.mp4> [seconds]}; OUT=${2:?out.mp4}; LIM=${3:-}
FF=${HYPERFRAMES_FFMPEG_PATH:-ffmpeg}; FP=${HYPERFRAMES_FFPROBE_PATH:-ffprobe}
[ -f "$SRC" ] || { echo "no such file: $SRC" >&2; exit 1; }

read -r W H TRC < <("$FP" -v error -select_streams v:0 -show_entries stream=width,height,color_transfer:stream_side_data=rotation -of json "$SRC" |
  python3 -I -c '
import json, sys
s = json.load(sys.stdin)["streams"][0]
w, h = s["width"], s["height"]
rot = 0
for sd in s.get("side_data_list", []):
    if "rotation" in sd:
        rot = int(sd["rotation"])
if rot % 180:
    w, h = h, w
print(w, h, s.get("color_transfer", "unknown"))')
if [ $((W * 16)) -ne $((H * 9)) ]; then
  echo "display size is ${W}x${H}, not 9:16: reframe it first (tools/finish.mjs --reframe), then caption it" >&2
  exit 1
fi

CH="fps=30"
[ "$W" -ne 1080 ] && CH="$CH,scale=1080:1920:flags=lanczos"
case "$TRC" in
  arib-std-b67|smpte2084)
    echo "HDR source ($TRC, ${W}x${H}): tone-mapping to SDR BT.709"
    CH="$CH,zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p" ;;
  *) echo "SDR source ($TRC, ${W}x${H}): re-timing to 30 fps only"; CH="$CH,format=yuv420p" ;;
esac

mkdir -p "$(dirname "$OUT")"
T0=$(date +%s)
"$FF" -y -hide_banner -loglevel error -stats ${LIM:+-t "$LIM"} -i "$SRC" -vf "$CH" \
  -c:v libx264 -preset veryfast -crf 12 -pix_fmt yuv420p -g 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -an "$OUT"
echo
echo "DONE $OUT in $(( $(date +%s) - T0 )) s"
"$FP" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames,pix_fmt,color_space,color_transfer -of default=nw=1 "$OUT"
