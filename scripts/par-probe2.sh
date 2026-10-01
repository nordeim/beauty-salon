#!/usr/bin/env bash
# Side-by-side computed-style probe (v2): runs the same eval on the live session
# and the clone session, extracts the JSON result cleanly, then prints both for
# delta analysis. Falls back to raw output if parsing fails.
# Usage: ./scripts/par-probe2.sh '<js expression returning JSON>' [outdir]
set -euo pipefail
PROBE="$1"
OUTDIR="${2:-/home/z/my-project/project-management/research/live-capture-s9}"
mkdir -p "$OUTDIR"

run_session() {
  local sess="$1"
  local raw
  raw=$(AGENT_BROWSER_SESSION="$sess" agent-browser eval "(() => { $PROBE })()" --json 2>/dev/null | tail -1)
  # Extract .data.result when present; otherwise echo raw.
  python3 - "$raw" <<'PY' 2>/dev/null || echo "$raw"
import json, sys
try:
    payload = json.loads(sys.argv[1])
    result = payload.get("data", {}).get("result")
    if isinstance(result, str):
        # Result may itself be JSON-encoded
        try:
            parsed = json.loads(result)
            print(json.dumps(parsed, indent=1, ensure_ascii=False))
        except Exception:
            print(result)
    else:
        print(json.dumps(result, indent=1, ensure_ascii=False))
except Exception:
    print(sys.argv[1])
PY
}

echo "=== LIVE ==="
run_session live
echo "=== CLONE ==="
run_session clone
