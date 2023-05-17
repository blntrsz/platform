import { expect, test } from "@playwright/test";

test("has hello traveler title", async ({ page }) => {
  await page.goto("http://localhost:5173");

  expect(page.getByText("Hello Traveler!")).toBeTruthy();
});
