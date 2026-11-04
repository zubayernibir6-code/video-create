# env.sh — environment for the Video Create workspace on the Linux cloud machine (sourced from ~/.bashrc by setup.sh).
# These variables exist ONLY here. On the Windows PC none of the VC_* ones are set, so every tool keeps its PC paths.
export VC_WS="${VC_WS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"   # the workspace this file sits in
export VC_OPT="${VC_OPT:-/opt/vc}"
export VC_WORK_ROOT="${VC_WORK_ROOT:-/home/claude/VideoWork}"          # = C:/Users/Zubayer Nibir/VideoWork on the PC
export VC_ENV_FILE="$VC_WS/.env.local"
export VC_CHROME="$(command -v google-chrome || command -v chromium || true)"
export VC_HF_DIR="$(npm root -g 2>/dev/null)/hyperframes/"

# FFmpeg 9.0.2 first on PATH (same release family as the PC's tools/ffmpeg/ffmpeg-9.0.2-full_build)
export PATH="$VC_OPT/ffmpeg9/bin:$PATH"
export HYPERFRAMES_FFMPEG_PATH="$VC_OPT/ffmpeg9/bin/ffmpeg"
export HYPERFRAMES_FFPROBE_PATH="$VC_OPT/ffmpeg9/bin/ffprobe"
export HYPERFRAMES_PYTHON="$VC_WS/tools/pyenv/Scripts/python.exe"   # a link to the Linux venv's python
export WHISPER_PATH="$VC_OPT/whisper.cpp/build/bin/whisper-cli"

# the same pins and privacy switches as the PC (CLAUDE.md §0a, docs/tools-and-setup.md §0b)
export HYPERFRAMES_SKIP_SKILLS=1
export HYPERFRAMES_NO_AUTO_INSTALL=1
export DO_NOT_TRACK=1
export HF_HUB_DISABLE_TELEMETRY=1
export PRODUCER_STREAMING_ENCODE_MAX_DURATION_SECONDS=3600
