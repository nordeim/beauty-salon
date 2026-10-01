#!/usr/bin/env bash
# Side-by-side computed style probe (v3): multi-selector dashboard probe.
# Usage: ./scripts/par-probe3.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PROBE='
const g=(sel,props)=>{const el=document.querySelector(sel);if(!el)return {sel,missing:true};const cs=getComputedStyle(el);const out={sel,text:(el.textContent||"").trim().slice(0,40)};props.forEach(p=>out[p]=cs.getPropertyValue(p));return out;};
const box=(sel)=>{const el=document.querySelector(sel);if(!el)return{sel,missing:true};const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return{sel,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),radius:cs.borderRadius,shadow:cs.boxShadow,pad:cs.padding,display:cs.display,gap:cs.gap};};
return JSON.stringify({
  h1:g("h1",["font-size","line-height","font-weight","letter-spacing","color"]),
  statsPanel:box("main a[href], main [class*=stats] a, main section a"),
  statFirst:g("main a[href*=\"goals\"], main section a",["display","flex-direction","align-items","justify-content","padding","gap"]),
  statNums:[...document.querySelectorAll("main a")].filter(a=>/ACTIVE|BLOCKED|COMPLETED/i.test(a.textContent)).map(a=>{const cs=getComputedStyle(a);return{text:a.textContent.trim().slice(0,30),pad:cs.padding,align:cs.alignItems,justify:cs.justifyContent};}),
  bigNums:[...document.querySelectorAll("main a span, main a div")].filter(e=>/^[0-9]{1,3}$/.test((e.textContent||"").trim())&&parseInt(getComputedStyle(e).fontSize)>30).map(e=>{const cs=getComputedStyle(e);return{t:e.textContent.trim(),fs:cs.fontSize,fw:cs.fontWeight,ls:cs.letterSpacing,color:cs.color};}),
  activityH2:[...document.querySelectorAll("h2")].map(h=>({t:h.textContent.trim().slice(0,20),fs:getComputedStyle(h).fontSize,fw:getComputedStyle(h).fontWeight,ls:getComputedStyle(h).letterSpacing,color:getComputedStyle(h).color})).filter(x=>/ACTIVITY|GOALS/.test(x.t)),
  grid:[...document.querySelectorAll("main > div")].slice(0,3).map(d=>{const cs=getComputedStyle(d);return{cls:d.className.slice(0,60),display:cs.display,gap:cs.gap,cols:cs.gridTemplateColumns.slice(0,80)};}),
},null,1)'

run_session() {
  local sess="$1"
  local raw
  raw=$(AGENT_BROWSER_SESSION="$sess" agent-browser eval "(() => { $PROBE })()" --json 2>/dev/null | tail -1)
  python3 - "$raw" <<'PY' 2>/dev/null || echo "$raw"
import json, sys
try:
    payload = json.loads(sys.argv[1])
    result = payload.get("data", {}).get("result")
    if isinstance(result, str):
        try: print(json.dumps(json.loads(result), indent=1, ensure_ascii=False))
        except Exception: print(result)
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
