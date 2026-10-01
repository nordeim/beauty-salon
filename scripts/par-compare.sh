#!/usr/bin/env bash
# par-compare.sh — runs the same JS probe on the live and clone browser
# sessions and prints both results side by side for delta analysis.
# Usage: ./scripts/par-compare.sh /path/to/probe.js   (probe must define `PROBE` JS string or be plain JS with return)
set -euo pipefail
PROBE_FILE="$1"
LIVE=$(agent-browser --session live eval "$(cat "$PROBE_FILE")" 2>/dev/null | tail -1)
CLONE=$(agent-browser --session clone eval "$(cat "$PROBE_FILE")" 2>/dev/null | tail -1)
echo "LIVE : $LIVE"
echo "CLONE: $CLONE"
