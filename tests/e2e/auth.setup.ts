import { expect, test as setup } from "@playwright/test";
import { DEMO_EMAIL, DEMO_PASSWORD } from "./helpers";

// One authenticated session for the whole run — saved as a storageState and
// replayed into every main-project context (see playwright.config.ts for why
// per-test logins are not an option: the auth rate limiter).
setup("sign the demo user in", async ({ request }) => {
  const res = await request.post("/api/auth/login", {
    data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  expect(res.ok(), `login failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  await request.storageState({ path: "tests/e2e/.auth/user.json" });
});
