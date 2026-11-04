#!/usr/bin/env bash
# setup.sh — builds the Video Create studio on a fresh Linux cloud machine (Claude's cloud workspace), so the same
# tools, skills, pins and checks as the Windows PC work here. Idempotent: every step is skipped when already done,
# so it is safe to run at the start of every cloud session.
#
#   bash tools/cloud/setup.sh            install / repair everything (downloads run IN PARALLEL; ~10 s when done)
#   bash tools/cloud/setup.sh --check    only report what is in place (exit 1 if something is missing)
# Normally you never type this: the SessionStart hook (tools/cloud/autostart.mjs) starts it in the background on a
# fresh cloud machine, and `bash tools/cloud/ready.sh` waits for it before the first render.
#
# Needs the workspace files at $VC_WS (default /home/claude/video-create): copied from D:\Video Create through the
# desktop link (list: tools/cloud/MANIFEST.txt) or cloned from a private repo. Never touches the PC.
# Heavy programs go to $VC_OPT (/opt/vc), outside the workspace, and are linked in where the tools expect the
# Windows ones (tools/pyenv/Scripts/python.exe, tools/deep-filter/deep-filter.exe, …).
# Pins (same as the PC): HyperFrames 0.8.134 + its skills from tag v0.8.134, chrome-headless-shell 152.0.7977.30,
# FFmpeg 9.0.x, Python 3.11 + tools/cloud/requirements-linux.txt, DeepFilterNet 0.5.6, whisper.cpp 1.9.1,
# Bengali ASR SayedShaun/bengali-whisper-medium-ct2 @ 32da13b9, Lucide icons 1.52.0 (the PC's 1,866 names only).
# Verified 2026-11-04: see CLOUD.md (proof render).
set -uo pipefail
VC_WS="${VC_WS:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"   # the workspace this script sits in
VC_OPT="${VC_OPT:-/opt/vc}"
CHECK=0; [[ "${1:-}" == "--check" ]] && CHECK=1
export HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_AUTO_INSTALL=1 DO_NOT_TRACK=1 HF_HUB_DISABLE_TELEMETRY=1
LOG="$VC_OPT/setup.log"; mkdir -p "$VC_OPT"; : >> "$LOG"
ok=0; bad=0
say()  { printf '%s\n' "$*"; }
pass() { say "  ✓ $*"; ok=$((ok+1)); }
miss() { say "  ✗ $*"; bad=$((bad+1)); }
step() { say ""; say "== $*"; }
run()  { "$@" >> "$LOG" 2>&1; }

[[ -f "$VC_WS/CLAUDE.md" && -d "$VC_WS/tools" ]] || { say "✗ workspace not found at $VC_WS (copy D:\\Video Create first: tools/cloud/MANIFEST.txt)"; exit 1; }
cd "$VC_WS"

# ---- install jobs. They are independent, so they run at the same time (the slow ones are network downloads and
# the whisper.cpp build); each writes its own log under $VC_OPT/logs. Measured 2026-11-04: see CLOUD.md §5.
mkdir -p "$VC_OPT/logs"
job_ffmpeg()  { CHECK=0; if [[ ! -x "$VC_OPT/ffmpeg9/bin/ffmpeg" && $CHECK == 0 ]]; then
  curl -fsSL -o "$VC_OPT/ff.tar.xz" "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n9.0-latest-linux64-gpl-9.0.tar.xz" \
    && mkdir -p "$VC_OPT/ffmpeg9" && tar -xJf "$VC_OPT/ff.tar.xz" -C "$VC_OPT/ffmpeg9" --strip-components=1 && rm -f "$VC_OPT/ff.tar.xz"
fi
}
job_hf()      { CHECK=0; if [[ "$(hyperframes --version 2>/dev/null)" != "0.8.134" && $CHECK == 0 ]]; then run npm i -g hyperframes@0.8.134; fi
if [[ $CHECK == 0 ]]; then run hyperframes browser ensure; run hyperframes telemetry disable; fi
}
job_skills()  { CHECK=0; if [[ ! -d "$VC_OPT/hf-skills/skills/hyperframes" && $CHECK == 0 ]]; then
  rm -rf "$VC_OPT/hf-skills"
  run git clone --depth 1 --branch v0.8.134 --filter=blob:none --sparse https://github.com/heygen-com/hyperframes "$VC_OPT/hf-skills" \
    && run git -C "$VC_OPT/hf-skills" sparse-checkout set skills
fi
}
job_py()      { CHECK=0; if [[ ! -x "$VC_OPT/pyenv/bin/python" && $CHECK == 0 ]]; then
  PY311=$(command -v python3.11 || true)
  run uv venv --python "${PY311:-3.11}" "$VC_OPT/pyenv"
fi
if [[ $CHECK == 0 ]]; then VIRTUAL_ENV="$VC_OPT/pyenv" run uv pip install --python "$VC_OPT/pyenv/bin/python" -r tools/cloud/requirements-linux.txt; fi
  local M="$VC_OPT/models/asr/bengali-whisper-medium-ct2"
if [[ ! -s "$M/model.bin" && $CHECK == 0 ]]; then
  run "$VC_OPT/pyenv/bin/python" -I -c "from huggingface_hub import snapshot_download as s; s('SayedShaun/bengali-whisper-medium-ct2', revision='32da13b97a574b1265c90cced9c90b440fe4b557', local_dir='$M')"
fi
}
job_piper()   { CHECK=0; local P="$VC_WS/assets/voices/piper/bn_BD-google-medium.onnx"
if [[ ! -s "$P" && $CHECK == 0 ]]; then
  run curl -fsSL -o "$P" "https://huggingface.co/rhasspy/piper-voices/resolve/main/bn/bn_BD/google/medium/bn_BD-google-medium.onnx"
fi
}
job_df()      { CHECK=0; if [[ ! -x "$VC_OPT/deep-filter/deep-filter" && $CHECK == 0 ]]; then
  mkdir -p "$VC_OPT/deep-filter"
  run curl -fsSL -o "$VC_OPT/deep-filter/deep-filter" "https://github.com/Rikorose/DeepFilterNet/releases/download/v0.5.6/deep-filter-0.5.6-x86_64-unknown-linux-musl"
  chmod +x "$VC_OPT/deep-filter/deep-filter"
fi
}
job_whisper() { CHECK=0; if [[ ! -x "$VC_OPT/whisper.cpp/build/bin/whisper-cli" && $CHECK == 0 ]]; then
  rm -rf "$VC_OPT/whisper.cpp"
  run git clone --depth 1 --branch v1.9.1 https://github.com/ggml-org/whisper.cpp "$VC_OPT/whisper.cpp" \
    && (cd "$VC_OPT/whisper.cpp" && run cmake -B build -DCMAKE_BUILD_TYPE=Release -DWHISPER_BUILD_TESTS=OFF -DGGML_NATIVE=OFF && run cmake --build build -j"$(nproc)" --config Release)
fi
}
job_lucide()  { CHECK=0; local L="$VC_WS/assets/icons/lucide/icons"
if [[ "$(ls "$L"/*.svg 2>/dev/null | wc -l)" -lt 1866 && $CHECK == 0 ]]; then
  T=$(mktemp -d); run curl -fsSL -o "$T/l.tgz" "https://registry.npmjs.org/lucide-static/-/lucide-static-1.52.0.tgz" && tar -xzf "$T/l.tgz" -C "$T"
  mkdir -p "$L"
  tail -n +3 transfer-kit/knowledge/lucide-icons.txt | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$' | while read -r n; do cp "$T/package/icons/$n.svg" "$L/" 2>/dev/null; done
  rm -rf "$T"
fi
}
if [[ $CHECK == 0 ]]; then
  T0=$(date +%s); say "installing in parallel (logs: $VC_OPT/logs) …"
  pids=()
  for j in ffmpeg hf skills py piper df whisper lucide; do
    ( LOG="$VC_OPT/logs/$j.log"; : > "$LOG"; "job_$j" ) & pids+=($!)
  done
  wait "${pids[@]}"
  say "installs finished in $(( $(date +%s) - T0 )) s; checking …"
fi

step "1. FFmpeg 9.0 (static, BtbN)"
v=$("$VC_OPT/ffmpeg9/bin/ffmpeg" -version 2>/dev/null | head -1 | awk '{print $3}')
[[ "$v" == n9.0* ]] && pass "ffmpeg $v" || miss "ffmpeg 9.0 missing"
f=$("$VC_OPT/ffmpeg9/bin/ffmpeg" -hide_banner -filters 2>/dev/null | grep -cE " (ass|loudnorm|xfade|zscale|lut3d|afftdn|ebur128) ")
[[ "$f" -ge 7 ]] && pass "filters ass/loudnorm/xfade/zscale/lut3d/afftdn/ebur128" || miss "FFmpeg filters missing ($f/7)"

step "2. HyperFrames 0.8.134 + chrome-headless-shell (pinned)"
[[ "$(hyperframes --version 2>/dev/null)" == "0.8.134" ]] && pass "hyperframes 0.8.134" || miss "hyperframes 0.8.134"
ls ~/.cache/hyperframes/chrome/chrome-headless-shell/linux-152.0.7977.30/chrome-headless-shell-linux64/chrome-headless-shell >/dev/null 2>&1 \
  && pass "chrome-headless-shell 152.0.7977.30" || miss "chrome-headless-shell 152.0.7977.30"

step "3. HyperFrames skills, tag v0.8.134 (never 'skills update')"
if [[ $CHECK == 0 && -d "$VC_OPT/hf-skills/skills" ]]; then
  for d in ~/.claude/skills ~/.agents/skills; do
    mkdir -p "$d"
    for s in "$VC_OPT"/hf-skills/skills/*/; do cp -a "$s" "$d/"; done
    for s in "$VC_WS"/.claude/skills/*/; do cp -a "$s" "$d/"; done     # workspace skills too (source of truth stays in the workspace)
  done
fi
n=$(ls -d ~/.claude/skills/*/ 2>/dev/null | wc -l)
[[ "$(git -C "$VC_OPT/hf-skills" rev-parse --short HEAD 2>/dev/null)" == 0dc957f* ]] && pass "skills tag v0.8.134 (0dc957f); $n skills in ~/.claude/skills" || miss "HyperFrames skills v0.8.134"

step "4. Python 3.11 venv (the PC's tools/pyenv package set)"
mkdir -p "$VC_OPT/pyenv/Scripts"; ln -sfn ../bin/python "$VC_OPT/pyenv/Scripts/python.exe"; ln -sfn ../bin/python "$VC_OPT/pyenv/Scripts/python"
"$VC_OPT/pyenv/bin/python" -I -c "import faster_whisper,ctranslate2,piper,kokoro_onnx,librosa,soundfile,onnxruntime,av" >/dev/null 2>&1 \
  && pass "python $("$VC_OPT/pyenv/bin/python" -V 2>&1 | awk '{print $2}') + faster-whisper/piper/kokoro/librosa" || miss "python packages"

step "5. Models and programs"
M="$VC_OPT/models/asr/bengali-whisper-medium-ct2"
[[ "$(stat -c %s "$M/model.bin" 2>/dev/null)" == "774731149" ]] && pass "Bengali ASR model (774,731,149 B, same as PC)" || miss "Bengali ASR model"
P="$VC_WS/assets/voices/piper/bn_BD-google-medium.onnx"
[[ "$(stat -c %s "$P" 2>/dev/null)" == "76782515" ]] && pass "Piper bn_BD voice (76,782,515 B)" || miss "Piper Bengali voice"
"$VC_OPT/deep-filter/deep-filter" --version 2>/dev/null | grep -q 0.5.6 && pass "DeepFilterNet 0.5.6" || miss "DeepFilterNet"
[[ -x "$VC_OPT/whisper.cpp/build/bin/whisper-cli" ]] && pass "whisper.cpp 1.9.1 (whisper-cli)" || miss "whisper.cpp"

step "6. Lucide icons 1.52.0 (the PC's 1,866 names)"
L="$VC_WS/assets/icons/lucide/icons"
[[ "$(ls "$L"/*.svg 2>/dev/null | wc -l)" -ge 1866 ]] && pass "$(ls "$L"/*.svg | wc -l) Lucide icons" || miss "Lucide icons"

step "7. Links where the tools expect the Windows programs"
mkdir -p tools/deep-filter tools/ffmpeg/ffmpeg-9.0.2-full_build/bin tools/whisper.cpp assets/models/asr
ln -sfn "$VC_OPT/pyenv" tools/pyenv
ln -sfn "$VC_OPT/deep-filter/deep-filter" tools/deep-filter/deep-filter.exe
for b in ffmpeg ffprobe; do ln -sfn "$VC_OPT/ffmpeg9/bin/$b" "tools/ffmpeg/ffmpeg-9.0.2-full_build/bin/$b"; ln -sfn "$VC_OPT/ffmpeg9/bin/$b" "tools/ffmpeg/ffmpeg-9.0.2-full_build/bin/$b.exe"; done
for b in whisper-cli main; do ln -sfn "$VC_OPT/whisper.cpp/build/bin/$b" "tools/whisper.cpp/$b"; ln -sfn "$VC_OPT/whisper.cpp/build/bin/$b" "tools/whisper.cpp/$b.exe"; done
ln -sfn "$VC_OPT/models/asr/bengali-whisper-medium-ct2" assets/models/asr/bengali-whisper-medium-ct2
mkdir -p /home/claude/VideoWork ~/.local/bin
# FFmpeg 9 as THE ffmpeg for every shell, even one that never read env.sh (~/.local/bin is ahead of /usr/local/bin and
# /usr/bin on this machine's PATH; the system FFmpeg 6.1 lacks `-/filter_complex`, which the mix tools use)
for b in ffmpeg ffprobe; do ln -sfn "$VC_OPT/ffmpeg9/bin/$b" ~/.local/bin/$b; done
[[ "$(command -v ffmpeg)" == "$HOME/.local/bin/ffmpeg" ]] && pass "ffmpeg on PATH = FFmpeg 9 (~/.local/bin)" || miss "ffmpeg on PATH is $(command -v ffmpeg), not FFmpeg 9"
[[ -x tools/pyenv/Scripts/python.exe && -x tools/deep-filter/deep-filter.exe && -s assets/models/asr/bengali-whisper-medium-ct2/model.bin ]] \
  && pass "tools/pyenv/Scripts/python.exe, deep-filter.exe, ffmpeg.exe, whisper-cli.exe, ASR model linked" || miss "links"

step "8. Fonts for libass / Chrome fallback"
FD=~/.local/share/fonts/video-create; mkdir -p "$FD"
cp -n assets/fonts/bengali/*.ttf assets/fonts/latin/*.ttf "$FD/" 2>/dev/null; run fc-cache -f "$FD"
[[ $(fc-list : family | grep -c -E "Hind Siliguri|Baloo Da 2") -ge 2 ]] && pass "pack fonts registered (Hind Siliguri, Baloo Da 2, …)" || miss "fonts"

step "9. Linux overlay (env fallbacks; the PC behaviour is unchanged)"
if [[ $CHECK == 0 ]]; then node tools/cloud/linux-overlay.mjs | tail -1; fi
# keep the 14 cloud-only lines out of every commit/push (git ignores worktree changes on these files), so a
# workspace cloned from GitHub stays "clean" and the PC never receives them by accident
if git rev-parse --git-dir >/dev/null 2>&1; then
  grep -oE '^  \["tools/[^"]+"' tools/cloud/linux-overlay.mjs | sed 's/^  \["//;s/"$//' | sort -u \
    | while read -r f; do git ls-files --error-unmatch "$f" >/dev/null 2>&1 && git update-index --skip-worktree "$f"; done
fi
node tools/cloud/linux-overlay.mjs --check >/dev/null 2>&1 && pass "overlay in place (14 env fallbacks)" || miss "overlay not applied (run setup.sh without --check)"

step "10. Shell environment"
# at the TOP of ~/.bashrc: the stock file returns early for non-interactive shells, and a session's command shell is a
# snapshot taken when the session starts (so a fresh container picks it up from its NEXT session; this one sources it)
if [[ $CHECK == 0 ]] && ! head -3 ~/.bashrc 2>/dev/null | grep -q "tools/cloud/env.sh"; then
  grep -v "tools/cloud/env.sh\|^# Video Create studio" ~/.bashrc > ~/.bashrc.vc 2>/dev/null || true
  { printf '# Video Create studio (tools/cloud/setup.sh)\n[ -f %s/tools/cloud/env.sh ] && . %s/tools/cloud/env.sh\n' "$VC_WS" "$VC_WS"; cat ~/.bashrc.vc; } > ~/.bashrc
  rm -f ~/.bashrc.vc
fi
head -3 ~/.bashrc | grep -q "tools/cloud/env.sh" && pass "~/.bashrc sources tools/cloud/env.sh (line 2)" || miss "env not at the top of ~/.bashrc"
if [[ $CHECK == 0 && ! -d "$VC_WS/.git" ]]; then
  (git -C "$VC_WS" init -q -b master && git -C "$VC_WS" config core.autocrlf false && git -C "$VC_WS" config core.longpaths true \
    && git -C "$VC_WS" config user.name "Talha Zubayer" && git -C "$VC_WS" config user.email "nibir@lamppost.org.bd" \
    && printf 'tools/pyenv\ntools/deep-filter/deep-filter.exe\ntools/ffmpeg/\ntools/whisper.cpp/\nassets/models/\nassets/icons/lucide/icons/\n' >> "$VC_WS/.git/info/exclude" \
    && git -C "$VC_WS" add -A >/dev/null && git -C "$VC_WS" commit -qm "Cloud copy of D:\\Video Create (baseline; changes since then = what to copy back)") >> "$LOG" 2>&1
fi
[[ -d "$VC_WS/.git" ]] && pass "cloud git baseline (git status = what changed here)" || miss "cloud git baseline"

say ""
say "setup: $ok ok, $bad missing   (log: $LOG)"
if [[ $bad == 0 ]]; then date -Is > "$VC_OPT/setup.ok"; else rm -f "$VC_OPT/setup.ok"; fi
[[ $bad == 0 ]]
