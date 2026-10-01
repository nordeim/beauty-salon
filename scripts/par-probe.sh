#!/usr/bin/env bash
# Side-by-side computed-style probe: runs the same eval on the live session
# and the clone session, then prints both results for delta analysis.
# Usage: ./scripts/par-probe.sh '<js expression returning JSON>'
set -euo pipefail
PROBE="$1"
OUTDIR="${2:-/home/z/my-project/project-management/research/live-capture-s8}"
mkdir -p "$OUTDIR"
LIVE=$(AGENT_BROWSER_SESSION=live agent-browser eval "(() => { $PROBE })()" --json 2>/dev/null | tail -1)
CLONE=$(AGENT_BROWSER_SESSION=clone agent-browser eval "(() => { $PROBE })()" --json 2>/dev/null | tail -1)
echo "LIVE : $LIVE"
echo "CLONE: $CLONE"
