import { test, expect } from "@playwright/test";

test("a dashboard timeout leaves admin navigation usable and can be retried", async ({
  page,
}) => {
  let overviewRequests = 0;
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    if (path === "dashboard") {
      overviewRequests++;
      if (overviewRequests === 1) {
        return route.fulfill({
          status: 504,
          contentType: "text/html",
          body: "<!DOCTYPE html><h1>Gateway timeout</h1>",
        });
      }
      return route.fulfill({
        json: { data: { counts: { Projects: 2 }, messages: [], projects: [] } },
      });
    }
    return route.fulfill({
      json: { data: path === "me" ? { name: "Admin" } : {} },
    });
  });
  await page.goto("/admin");
  await expect(
    page.getByRole("navigation", { name: "Admin navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "HTTP 504" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry dashboard" }).click();
  await expect(page.locator(".stat-card")).toHaveText("Projects2");
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await expect(
    page.getByRole("navigation", { name: "Admin navigation" }),
  ).toBeVisible();
  expect(overviewRequests).toBe(2);
});
