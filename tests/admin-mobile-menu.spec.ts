import { test, expect } from "@playwright/test";

test("phone admin menu collapses and desktop navigation stays visible", async ({
  page,
}) => {
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    const data =
      path === "me"
        ? { data: { name: "Admin" } }
        : path === "dashboard"
          ? { data: { counts: {}, projects: [], messages: [] } }
          : { data: {} };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  const toggle = page.getByRole("button", { name: "Admin menu Dashboard" });
  const nav = page.getByRole("navigation", { name: "Admin navigation" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(nav).toBeVisible();
  await nav
    .getByRole("button", { name: "Photos & uploads", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/uploads$/);
  await expect(nav).toBeHidden();
  const uploadsToggle = page.getByRole("button", {
    name: "Admin menu Photos & uploads",
  });
  await uploadsToggle.click();
  await nav.getByRole("button", { name: "Dashboard", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(uploadsToggle).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(uploadsToggle).toBeInViewport();
  const headerBottom = await page
    .locator(".site-header")
    .evaluate((element) => element.getBoundingClientRect().bottom);
  const toggleTop = await uploadsToggle.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(toggleTop).toBeGreaterThanOrEqual(headerBottom);
  await uploadsToggle.click();
  await expect(nav).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(uploadsToggle).toBeHidden();
  await expect(nav).toBeVisible();
});
