#!/usr/bin/env bash
# capture-screens.sh — regenerates the README screenshots from the
# production build (server on :3000, seeded db/custom.db) using
# agent-browser. Usage: ./scripts/capture-screens.sh [outdir]
# Requires: bun run build && bun .next/standalone/server.js (PORT=3000).
set -euo pipefail
OUT="${1:-docs/screenshots}"
BASE="http://localhost:3000"
SESS="shots"
mkdir -p "$OUT"

login() {
  agent-browser --session "$SESS" open "$BASE/login" > /dev/null 2>&1
  sleep 3
  agent-browser --session "$SESS" eval "
const setVal = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};
const inputs = document.querySelectorAll('input');
setVal(inputs[0], 'demo@orbital.app');
setVal(inputs[1], 'Demo1234!');
[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Sign in').click();
'ok';
" > /dev/null 2>&1
  sleep 5
}

shot() { # shot <name> <url> [extra-eval]
  agent-browser --session "$SESS" open "$BASE$2" > /dev/null 2>&1
  sleep 4
  if [ -n "${3:-}" ]; then agent-browser --session "$SESS" eval "$3" > /dev/null 2>&1; sleep 2; fi
  agent-browser --session "$SESS" screenshot "$OUT/$1.png" > /dev/null 2>&1
  echo "captured $1"
}

agent-browser --session "$SESS" close > /dev/null 2>&1 || true
agent-browser --session "$SESS" set viewport 1440 900 > /dev/null 2>&1 || agent-browser --session "$SESS" open "$BASE" > /dev/null 2>&1
agent-browser --session "$SESS" set viewport 1440 900 > /dev/null 2>&1
login

# Desktop views (1440×900)
shot 01-dashboard "/"
shot 02-goals "/goals"
shot 03-goal-detail "/goals" "
(() => { const card = [...document.querySelectorAll('main a[href^=\"/goals/\"]')].find(b => /Product Onboarding Redesign/.test(b.textContent||'') && b.getBoundingClientRect().width > 200 && b.getBoundingClientRect().height > 100); if (card) card.click(); return 'ok'; })()"
sleep 2
agent-browser --session "$SESS" screenshot "$OUT/03-goal-detail.png" > /dev/null 2>&1
echo "captured 03-goal-detail"
shot 04-task-dialog "/goals" "
(() => { const card = [...document.querySelectorAll('main a[href^=\"/goals/\"]')].find(b => /Product Onboarding Redesign/.test(b.textContent||'') && b.getBoundingClientRect().width > 200 && b.getBoundingClientRect().height > 100); if (card) card.click(); return 'ok'; })()"
sleep 2
agent-browser --session "$SESS" eval "
(() => { const task = [...document.querySelectorAll('main button')].find(b => /User research interviews/.test(b.textContent||'') && b.getBoundingClientRect().width > 300); if (task) task.click(); return 'ok'; })()" > /dev/null 2>&1
sleep 2
agent-browser --session "$SESS" screenshot "$OUT/04-task-dialog.png" > /dev/null 2>&1
echo "captured 04-task-dialog"
shot 07-my-tasks "/my-tasks"
shot 16-tasks "/tasks"
shot 08-activity "/activity"
shot 09-team "/team"
shot 10-settings "/settings"

# Mobile (390×844)
agent-browser --session "$SESS" set viewport 390 844 > /dev/null 2>&1
shot 13-mobile-dashboard "/"
shot 11-mobile-goals "/goals"
# MORE sheet open
agent-browser --session "$SESS" eval "
(() => { const btn = [...document.querySelectorAll('button')].find(b => (b.textContent||'').trim() === 'More' && b.getBoundingClientRect().y > 700); if (btn) btn.click(); return 'ok'; })()" > /dev/null 2>&1
sleep 2
agent-browser --session "$SESS" screenshot "$OUT/12-mobile-menu.png" > /dev/null 2>&1
echo "captured 12-mobile-menu"

# Tablet (768)
agent-browser --session "$SESS" set viewport 768 1024 > /dev/null 2>&1
shot 15-tablet-dashboard "/"

# Login (logged out, fresh)
agent-browser --session "$SESS" close > /dev/null 2>&1
agent-browser --session "$SESS" set viewport 1440 900 > /dev/null 2>&1 || true
agent-browser --session "$SESS" open "$BASE/login" > /dev/null 2>&1
agent-browser --session "$SESS" set viewport 1440 900 > /dev/null 2>&1
sleep 4
agent-browser --session "$SESS" screenshot "$OUT/14-login.png" > /dev/null 2>&1
echo "captured 14-login"

agent-browser --session "$SESS" close > /dev/null 2>&1
echo "done (05/06 wizard-flow shots are captured separately with a real AI generation)"
