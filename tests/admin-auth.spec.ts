import { test, expect } from "@playwright/test";

test("admin URLs redirect guests and logout clears access", async ({
  page,
}) => {
  let signedIn = false;
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    if (route.request().method() === "OPTIONS")
      return route.fulfill({ status: 204 });
    if (path === "login") signedIn = true;
    if (path === "logout") signedIn = false;
    const allowed = signedIn || ["csrf", "login", "logout"].includes(path);
    const data =
      path === "csrf"
        ? { token: "test" }
        : path === "dashboard"
          ? { data: { counts: {}, projects: [], messages: [] } }
          : path === "schema"
            ? { data: {} }
            : { data: { name: "Admin" } };
    await route.fulfill({
      status: allowed ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(allowed ? data : { message: "Please sign in." }),
    });
  });
  for (const path of [
    "/admin/projects",
    "/admin/education",
    "/admin/website",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(
      page.getByRole("navigation", { name: "Admin navigation" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
  }
  await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("navigation", { name: "Admin navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/media");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("navigation", { name: "Admin navigation" }),
  ).toHaveCount(0);
});
