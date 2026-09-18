import { test, expect } from "@playwright/test";

test("sidebar survives section navigation while content is loading", async ({
  page,
}) => {
  const requests: Record<string, number> = {};
  let releaseProjects!: () => void;
  const pendingProjects = new Promise<void>((resolve) => {
    releaseProjects = resolve;
  });
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    requests[path] = (requests[path] || 0) + 1;
    if (path === "me")
      return route.fulfill({ json: { data: { name: "Admin" } } });
    if (path === "schema")
      return route.fulfill({
        json: {
          data: {
            projects: {
              model: "Project",
              table: "projects",
              fields: { title: { type: "text", required: true } },
              relations: [],
            },
          },
        },
      });
    if (path === "dashboard")
      return route.fulfill({
        json: { data: { counts: {}, messages: [], projects: [] } },
      });
    if (path === "projects") await pendingProjects;
    return route.fulfill({
      json: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } },
    });
  });
  await page.goto("/admin");
  const nav = page.getByRole("navigation", { name: "Admin navigation" });
  await expect(nav).toBeVisible();
  const originalSidebar = await page.locator(".admin-sidebar").elementHandle();
  try {
    await nav.getByRole("button", { name: "Projects", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/projects$/);
    await expect(nav).toBeVisible();
    expect(await originalSidebar!.evaluate((node) => node.isConnected)).toBe(
      true,
    );
    await expect(
      nav.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  } finally {
    releaseProjects();
  }
  await nav.getByRole("button", { name: "Edit website", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/website$/);
  expect(await originalSidebar!.evaluate((node) => node.isConnected)).toBe(
    true,
  );
  await page.goBack();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  expect(await originalSidebar!.evaluate((node) => node.isConnected)).toBe(
    true,
  );
  expect(requests.me).toBe(1);
  expect(requests.schema).toBe(1);
});
