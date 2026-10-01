// wizard-cleanup.mjs — removes the scratch goal created by the wizard-flow
// screenshot capture (scripts/capture-wizard.sh) so db/custom.db returns to
// the pristine seeded state (3 goals / 31 tasks / 36 activity entries).
// Usage: DATABASE_URL="file:<abs>/db/custom.db" bun scripts/wizard-cleanup.mjs
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const TITLE = "Improve search relevance ranking";

(async () => {
  const g = await p.goal.findFirst({ where: { title: TITLE } });
  if (!g) {
    console.log("scratch goal already absent");
  } else {
    await p.task.deleteMany({ where: { goalId: g.id } });
    await p.goal.delete({ where: { id: g.id } });
    // the wizard flow logs goal_analyzed / goal_created / task_assigned ×N /
    // tasks_generated entries — all stamped after 2026-08-01 (the seed's
    // latest entry is Jul 16 2026), so the same cutoff re-pins the feed.
    const r = await p.activityLog.deleteMany({ where: { createdAt: { gt: new Date("2026-08-01") } } });
    console.log(`deleted scratch goal + ${r.count} activity entries`);
  }
  console.log(
    "final state — goals:",
    await p.goal.count(),
    "| tasks:",
    await p.task.count(),
    "| activity:",
    await p.activityLog.count(),
  );
  await p.$disconnect();
})();
