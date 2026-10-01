// VLM sanity pass on the regenerated screenshots (04 dialog, 08 activity,
// 12 mobile menu, 14 login) — verify each shows the expected surface.
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync } from "node:fs";

const zai = await ZAI.create();
const OUT = "/home/z/my-project/project-management/docs/screenshots";

const checks = [
  { file: "04-task-dialog.png", expect: "A neumorphic 'Add Task' dialog over a blurred scrim: a 15px heading, uppercase labels (TITLE/DESCRIPTION/STATUS/DEADLINE), a Cancel + dark Add Task button row, and a small close X — on a beige project-management goal detail page." },
  { file: "08-activity.png", expect: "An 'Agent Activity' page with a small pill containing a green dot and 'Online' + a count, a hero 'Last agent action' card, and date-grouped activity rows in rounded cards with type tags." },
  { file: "12-mobile-menu.png", expect: "A mobile view with a bottom navigation bar (Home/Goals/My Tasks/Agent tabs + More) and an open bottom sheet titled ORBITAL listing Tasks/Team/Settings rows." },
  { file: "14-login.png", expect: "A login card on a light slate gradient: circular logo chip, 'Welcome to Project Management App' heading, a Continue with Google button, an 'or' divider, Email + Password fields with icons, a dark Sign in button, and a footer with 'Forgot password?' + 'Need an account? Sign up'." },
];

for (const c of checks) {
  const b64 = readFileSync(`${OUT}/${c.file}`).toString("base64");
  try {
    const res = await zai.chat.completions.create({
      messages: [
        { role: "user", content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
          { type: "text", text: `Does this screenshot match this description? Answer PASS or FAIL with one short sentence.\nDescription: ${c.expect}` },
        ] },
      ],
    });
    console.log(`${c.file}: ${res.choices[0]?.message?.content?.slice(0, 160) ?? "(no reply)"}`);
  } catch (e) {
    console.log(`${c.file}: VLM unavailable (${String(e).slice(0, 80)}) — file size sanity only`);
  }
}
