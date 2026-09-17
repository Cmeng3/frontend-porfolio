import { test, expect } from "@playwright/test";

for (const resource of ["project-categories", "technologies"]) {
  test(`${resource} visibility works in list and edit form`, async ({
    page,
  }) => {
    let record = {
      id: 1,
      name: "Backend",
      slug: "backend",
      is_visible: true,
      projects_count: 2,
    };
    await page.route("**/api/v1/admin/**", async (route) => {
      const path = new URL(route.request().url()).pathname.split("/admin/")[1];
      const method = route.request().method();
      if (method === "OPTIONS") return route.fulfill({ status: 204 });
      let data: unknown = { data: [] };
      if (path === "me") data = { data: { name: "Test admin" } };
      if (path === "csrf") data = { token: "test" };
      if (path === "dashboard")
        data = { data: { counts: {}, projects: [], messages: [] } };
      if (path === "schema")
        data = {
          data: {
            [resource]: {
              table: resource.replaceAll("-", "_"),
              fields: {
                name: { type: "text", required: true },
                slug: { type: "text", required: true },
                is_visible: { type: "checkbox", default: true },
              },
            },
          },
        };
      if (path.startsWith(resource)) {
        if (["PATCH", "PUT"].includes(method)) {
          record = { ...record, ...route.request().postDataJSON() };
          data = { data: record };
        } else
          data = {
            data: [record],
            meta: { total: 1, current_page: 1, last_page: 1 },
          };
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    await page.goto(`/admin/${resource}`);
    await expect(
      page.getByText("Used in 2 projects", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Hide Backend", exact: true })
      .click();
    await expect(page.getByText("Hidden", { exact: true })).toBeVisible();
    expect(record.is_visible).toBe(false);
    await page
      .getByRole("button", { name: "Edit Backend", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Visible on website", exact: true }),
    ).toHaveValue("false");
    await page
      .getByRole("combobox", { name: "Visible on website", exact: true })
      .selectOption("true");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(page.getByText("Visible", { exact: true })).toBeVisible();
    expect(record.is_visible).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
