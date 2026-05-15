import { test, expect } from "@playwright/test";

test("homepage loads and shows nominations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Your companion for")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Best Picture" }),
  ).toBeVisible();
});
