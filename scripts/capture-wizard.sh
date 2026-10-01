#!/usr/bin/env bash
# capture-wizard.sh — captures the two wizard-flow screenshots (05/06) with a
# REAL AI generation against the production server on :3000 (seeded
# db/custom.db): 05 = the "Drafting your task plan…" generating step,
# 06 = the auto-navigated goal-detail of the freshly generated goal.
# The scratch goal + its activity entries are cleaned up afterwards
# (scripts/wizard-cleanup.mjs).
set -euo pipefail
OUT="${1:-docs/screenshots}"
BASE="http://localhost:3000"
SESS="wizard"
TITLE="Improve search relevance ranking"
mkdir -p "$OUT"

agent-browser --session "$SESS" close >/dev/null 2>&1 || true
agent-browser --session "$SESS" set viewport 1440 900 >/dev/null 2>&1 || true

# ---- login ----
agent-browser --session "$SESS" open "$BASE/login" >/dev/null 2>&1
# Re-assert the viewport AFTER the page exists: `set viewport` on a session
# whose implicit browser launch is still racing can be dropped, leaving the
# window at its default size (observed as 1280x577 shots in session 41 —
# the committed set is 1440x900). With a page open, the resize always lands.
agent-browser --session "$SESS" set viewport 1440 900 >/dev/null 2>&1 || true
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
'ok';" >/dev/null 2>&1
sleep 5

# ---- open the wizard from the goals view ----
agent-browser --session "$SESS" open "$BASE/goals" >/dev/null 2>&1
sleep 4
agent-browser --session "$SESS" eval "
(() => { const btn = [...document.querySelectorAll('main button')].find(b => /New Goal/.test((b.textContent||'').trim()) && b.getBoundingClientRect().width > 0); if (btn) { btn.click(); return 'clicked'; } return 'NOT FOUND'; })();" | tail -1
sleep 2

# ---- step 1: fill details, continue ----
agent-browser --session "$SESS" eval "
(() => {
  const setVal = (el, value) => {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const title = document.querySelector('#goal-title');
  const desc = document.querySelector('#goal-description');
  if (!title) return 'NO FORM';
  setVal(title, '$TITLE');
  setVal(desc, 'Users report our site search returns irrelevant results for common queries. We want to tune ranking signals, add typo tolerance and measure satisfaction improvements within one quarter.');
  return 'filled';
})();" | tail -1
sleep 1
agent-browser --session "$SESS" eval "
(() => { const btn = [...document.querySelectorAll('[role=dialog] button')].find(b => (b.textContent||'').trim() === 'Continue'); if (btn) { btn.click(); return 'clicked'; } return 'NOT FOUND'; })();" | tail -1

# ---- step 2: wait for the questions step, then Generate Tasks ----
QS=""
for i in $(seq 1 20); do
  QS=$(agent-browser --session "$SESS" eval "(() => document.querySelector('[role=dialog] p[id^=clarify-q-0]') ? 'questions' : '')()" 2>/dev/null | tail -1 || true)
  if [ "$QS" = "questions" ]; then break; fi
  sleep 1
done
echo "questions step: $QS"
sleep 1
agent-browser --session "$SESS" eval "
(() => { const btn = [...document.querySelectorAll('[role=dialog] button')].find(b => /Generate Tasks/.test((b.textContent||'').trim())); if (btn) { btn.click(); return 'clicked'; } return 'NOT FOUND'; })();" | tail -1

# ---- step 3: screenshot the generating spinner (05) ----
sleep 2
agent-browser --session "$SESS" screenshot "$OUT/05-generating.png" >/dev/null 2>&1
echo "captured 05-generating"

# ---- wait for the dialog to close and the goal-detail to land (06) ----
DONE=""
for i in $(seq 1 40); do
  DONE=$(agent-browser --session "$SESS" eval "(() => { const dlg = document.querySelector('[role=dialog]'); const h1 = document.querySelector('main h1'); if (!dlg && h1 && h1.textContent.includes('$TITLE')) return 'done'; return ''; })()" 2>/dev/null | tail -1 || true)
  if [ "$DONE" = "done" ]; then break; fi
  sleep 1
done
echo "goal-detail: $DONE"
sleep 3
agent-browser --session "$SESS" screenshot "$OUT/06-new-goal-detail.png" >/dev/null 2>&1
echo "captured 06-new-goal-detail"
agent-browser --session "$SESS" close >/dev/null 2>&1 || true
echo "done — run scripts/wizard-cleanup.mjs to remove the scratch goal"
