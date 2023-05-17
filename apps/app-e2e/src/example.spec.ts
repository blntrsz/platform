import { expect, test } from "@playwright/test";

test("has hello traveler title", async ({ page }) => {
  await page.goto(process.env.E2E_URL ?? "http://localhost:5173");

  expect(page.getByText("Hello Traveler!")).toBeTruthy();
});
