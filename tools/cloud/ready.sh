#!/usr/bin/env bash
# ready.sh — waits until the background studio setup (started by tools/cloud/autostart.mjs) has finished, then runs
# `setup.sh --check`. Exit 0 = every tool is in place. Use it right before the first build/render of a cloud session.
#   bash tools/cloud/ready.sh            (prints a progress line every 30 s; gives up after 20 min)
# If no setup ran at all (hook missing), it runs setup.sh itself in the foreground.
WS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"; OPT="${VC_OPT:-/opt/vc}"
pid=$(cat "$OPT/setup.pid" 2>/dev/null); t=0
if [[ -z "$pid" && ! -f "$OPT/setup.ok" ]]; then VC_WS="$WS" bash "$WS/tools/cloud/setup.sh"; exit $?; fi
while [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; do
  (( t % 30 == 0 )) && echo "… setup still running ($t s): $(ls "$OPT"/logs 2>/dev/null | tr '\n' ' ')"
  sleep 5; t=$((t+5)); (( t > 1200 )) && { echo "✗ setup still running after 20 min — read $OPT/setup.run.log"; exit 1; }
done
VC_WS="$WS" bash "$WS/tools/cloud/setup.sh" --check | tail -3
st=${PIPESTATUS[0]}
[[ $st == 0 ]] && echo "✓ studio ready. In a fresh shell start commands with: . tools/cloud/env.sh &&" || echo "✗ something is missing: run  bash tools/cloud/setup.sh  (repairs only what is missing)"
exit $st
