#!/usr/bin/env bash
# Paired probe: run the same JS on live + clone agent-browser sessions, diff.
# Usage: paired-probe.sh <js-file> [live-session] [clone-session]
JS_FILE="$1"
LIVE="${2:-live}"
CLONE="${3:-clone}"
JS=$(cat "$JS_FILE")
agent-browser --session "$LIVE" eval "$JS" > /tmp/live.json 2>/dev/null
agent-browser --session "$CLONE" eval "$JS" > /tmp/clone.json 2>/dev/null
echo "===== LIVE ====="; cat /tmp/live.json
echo "===== CLONE ====="; cat /tmp/clone.json
echo "===== DIFF ====="
diff /tmp/live.json /tmp/clone.json && echo "IDENTICAL"
