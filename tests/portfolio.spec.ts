import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public navigation, mobile menu, theme and accessibility", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Hi, I’m/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View projects ↗" }),
  ).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({
    path: "../docs/screenshots/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Skills", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Skills", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Backend", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "../docs/screenshots/skills-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("all public sections and admin login load", async ({ page }) => {
  for (const [path, title] of [
    ["about", "About"],
    ["projects", "Projects"],
    ["experience", "Experience"],
    ["education", "Education"],
    ["certifications", "Certifications"],
    ["engineering", "Engineering"],
    ["blog", "Blog"],
    ["resume", "Resume"],
    ["contact", "Contact"],
  ]) {
    await page.goto("/" + path);
    await expect(
      page.getByRole("heading", { level: 1, name: title, exact: true }),
    ).toBeVisible();
  }
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Portfolio administration" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({
    path: "../docs/screenshots/admin-login.png",
    fullPage: true,
  });
});
test("contact client handles validation and success without sending a real message", async ({
  page,
}) => {
  await page.route("**/api/v1/contact", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Thank you. Your message has been received.",
      }),
    }),
  );
  await page.goto("/contact");
  await page.getByLabel("Name *", { exact: true }).fill("Test Visitor");
  await page.getByLabel("Email *", { exact: true }).fill("test@example.com");
  await page
    .getByLabel("Message *", { exact: true })
    .fill("A browser test message that is not sent to the database.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Thank you. Your message has been received.",
  );
});

test("admin signs in, creates a draft with defaults, and logs out", async ({
  page,
}) => {
  const schema = (
    await import("./fixtures/admin-schema.json", { with: { type: "json" } })
  ).default;
  let signedIn = false;
  let saved: Record<string, unknown> | undefined;
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    const method = route.request().method();
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204 });
      return;
    }
    let status = 200;
    let data: unknown = {};
    if (path === "csrf") data = { token: "browser-test-csrf" };
    else if (path === "login") {
      signedIn = true;
      data = { data: { name: "Test Administrator" } };
    } else if (path === "logout") {
      signedIn = false;
      await route.fulfill({ status: 204 });
      return;
    } else if (!signedIn) {
      status = 401;
      data = { message: "Please sign in." };
    } else if (path === "me") data = { data: { name: "Test Administrator" } };
    else if (path === "schema") data = { data: schema };
    else if (path === "dashboard")
      data = {
        data: {
          counts: { Projects: saved ? 1 : 0 },
          messages: [],
          projects: [],
        },
      };
    else if (path === "projects" && method === "POST") {
      saved = route.request().postDataJSON();
      status = 201;
      data = { data: { id: 1, ...saved } };
    } else
      data = {
        data: path === "projects" && saved ? [{ id: 1, ...saved }] : [],
        meta: { current_page: 1, last_page: 1, total: saved ? 1 : 0 },
      };
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Test-password-only-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/projects$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "projects", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add new", exact: true }).click();
  await page.getByLabel("Title *", { exact: true }).fill("Browser draft");
  await page.getByLabel("Slug *", { exact: true }).fill("browser-draft");
  await expect(page.getByLabel("Sort Order", { exact: true })).toHaveValue("0");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByText("Browser draft", { exact: true })).toBeVisible();
  expect(saved?.published_at).toBeNull();
  expect(saved?.sort_order).toBe(0);
  expect(saved?.technology_ids).toEqual([]);
  await page.screenshot({
    path: "../docs/screenshots/admin-projects.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Portfolio administration" }),
  ).toBeVisible();
});
test("dark theme remains readable and survives reload", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Switch to dark theme", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({
    path: "../docs/screenshots/home-dark.png",
    fullPage: true,
  });
});
