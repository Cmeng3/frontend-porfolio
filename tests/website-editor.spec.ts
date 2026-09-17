import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readWebsiteCopy } from "../src/lib/website-copy";

test("website text keeps defaults and accepts edited text", () => {
  const copy = readWebsiteCopy({
    heroGreeting: "Hello, I’m",
    footer: "Custom footer",
    focusTitle: 123,
  });
  expect(copy.heroGreeting).toBe("Hello, I’m");
  expect(copy.footer).toBe("Custom footer");
  expect(copy.focusTitle).toBe("From application logic to deployment.");
});

test("guided editor saves profile, uploads photo, preserves settings and warns on unsaved changes", async ({
  page,
}) => {
  let profile: Record<string, unknown> = {
    id: 1,
    slug: "chimeng-ly",
    name: "Chimeng Ly",
    headline: "Developer",
    introduction: "Original introduction",
    avatar_media_id: null,
  };
  let setting: Record<string, unknown> = {
    id: 2,
    key: "site",
    value: {
      title: "Portfolio",
      heroGreeting: "Hi, I’m",
      customSetting: { keep: true },
    },
    is_public: true,
  };
  const writes: { path: string; body: Record<string, unknown> }[] = [];
  let uploaded = false;
  const image = {
    id: 7,
    original_name: "portrait.png",
    url: "https://images.example.com/portrait.png",
    mime_type: "image/png",
    alt_text: "Profile photo",
    width: 1,
    height: 1,
  };
  await page.route("https://images.example.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB7kAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    const method = route.request().method();
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204 });
      return;
    }
    let data: unknown = {};
    if (path === "csrf") data = { token: "test-token" };
    else if (path === "me") data = { data: { name: "Test Administrator" } };
    else if (path === "schema") data = { data: {} };
    else if (path === "dashboard")
      data = { data: { counts: { Projects: 0 }, projects: [], messages: [] } };
    else if (path === "media" && method === "POST") {
      expect(route.request().postData()).toContain("portfolio/profile");
      uploaded = true;
      data = { data: image };
    } else if (method === "PATCH") {
      const body = route.request().postDataJSON();
      writes.push({ path, body });
      if (path === "profile/1") {
        profile = { ...profile, ...body };
        data = { data: profile };
      } else {
        setting = { ...setting, ...body };
        data = { data: setting };
      }
    } else
      data = {
        data:
          path === "profile"
            ? [profile]
            : path === "site-settings"
              ? [setting]
              : path === "media" && uploaded
                ? [image]
                : [],
        meta: { current_page: 1, last_page: 1, total: 1 },
      };
    await route.fulfill({
      status: method === "POST" ? 201 : 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/admin/website");
  await expect(
    page.getByRole("heading", { name: "Edit website", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Your name *", { exact: true }).fill("Updated Name");
  await page
    .getByRole("textbox", { name: "Homepage introduction", exact: true })
    .fill("My updated introduction.");
  await expect(
    page.getByRole("complementary", { name: "Profile text preview" }),
  ).toContainText("Updated Name");
  await page
    .getByLabel("Or upload a new photo", { exact: true })
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: Buffer.from("test-upload"),
    });
  await expect(page.getByLabel("Choose a photo from your library")).toHaveValue(
    "7",
  );
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(
    page.getByText("Profile saved. Your changes are now on the website.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(writes[0].body.avatar_media_id).toBe(7);
  expect(writes[0].body.name).toBe("Updated Name");
  await page
    .getByRole("textbox", { name: "Greeting before your name", exact: true })
    .fill("Hello there");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("navigation", { name: "Admin navigation" })
    .getByRole("button", { name: "Dashboard", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Edit website", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save website text", exact: true })
    .click();
  await expect(
    page.getByText("Website text saved and published.", { exact: true }),
  ).toBeVisible();
  expect(writes[1].body.value).toMatchObject({
    heroGreeting: "Hello there",
    customSetting: { keep: true },
  });
  await page.reload();
  await expect(page.getByLabel("Choose a photo from your library")).toHaveValue(
    "7",
  );
  await expect(page.getByLabel("Your name *", { exact: true })).toHaveValue(
    "Updated Name",
  );
  await expect(
    page.getByRole("textbox", {
      name: "Greeting before your name",
      exact: true,
    }),
  ).toHaveValue("Hello there");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: "../docs/screenshots/website-editor.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
