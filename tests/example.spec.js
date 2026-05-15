import { test, expect } from "@playwright/test";

test("homepage loads and shows nominations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Your companion for")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Best Picture" }),
  ).toBeVisible();
});

test("sidebar shows all categories", async ({ page, isMobile }) => {
  test.skip(isMobile, "Sidebar is hidden on mobile");
  await page.goto("/");
  await expect(page.getByText("Best Picture").first()).toBeVisible();
  await expect(page.getByText("Directing").first()).toBeVisible();
});

test("filter buttons work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Seen", exact: true }).first().click();
  await expect(page.getByText("No movies marked as seen yet.")).toBeVisible();
});

test("sidebar navigation scrolls to category", async ({ page, isMobile }) => {
  test.skip(isMobile, "Sidebar is hidden on mobile");
  await page.goto("/");
  await page.getByText("Cinematography").first().click();
  await expect(
    page.getByRole("heading", { name: "Cinematography" }),
  ).toBeInViewport();
});
