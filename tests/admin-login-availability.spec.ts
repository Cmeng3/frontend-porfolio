import { test, expect } from "@playwright/test";

test("login form stays usable while the session check is pending or fails", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/v1/admin/me", async (route) => {
    await pending;
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unavailable" }),
    });
  });
  try {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  } finally {
    release();
  }
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Admin navigation" }),
  ).toHaveCount(0);
});

test("an empty unauthorized response does not hide the login form", async ({
  page,
}) => {
  await page.route("**/api/v1/admin/me", (route) =>
    route.fulfill({ status: 401, body: "" }),
  );
  await page.goto("/admin/login");
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
