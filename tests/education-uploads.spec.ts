import { test, expect } from "@playwright/test";

test("education editor uploads and attaches a photo", async ({ page }) => {
  let saved: Record<string, unknown> | undefined;
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    const method = route.request().method();
    let data: unknown = {
      data: [],
      meta: { current_page: 1, last_page: 1, total: 0 },
    };
    if (method === "OPTIONS") return route.fulfill({ status: 204 });
    if (path === "me") data = { data: { name: "Test admin" } };
    if (path === "csrf") data = { token: "test" };
    if (path === "dashboard")
      data = { data: { counts: {}, projects: [], messages: [] } };
    if (path === "schema")
      data = {
        data: {
          education: {
            table: "educations",
            fields: {
              institution: { type: "text", required: true },
              qualification: { type: "text", required: true },
              media_id: { type: "reference", reference: "media" },
              pdf_media_id: { type: "reference", reference: "media" },
            },
          },
        },
      };
    if (path === "media" && method === "POST") {
      expect(route.request().postData()).toContain("portfolio/education");
      data = {
        data: {
          id: 7,
          original_name: "diploma.png",
          mime_type: "image/png",
          url: "https://example.com/diploma.png",
        },
      };
    }
    if (path === "education" && method === "POST") {
      saved = route.request().postDataJSON();
      data = { data: { id: 1, ...saved } };
    }
    if (path === "education" && method === "GET" && saved)
      data = { data: [{ id: 1, ...saved }] };
    await route.fulfill({
      status: method === "POST" ? 201 : 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/admin/education");
  await page.getByRole("button", { name: "Add new", exact: true }).click();
  await page
    .getByLabel("Institution *", { exact: true })
    .fill("Example University");
  await page
    .getByLabel("Qualification *", { exact: true })
    .fill("Computer Science");
  await page
    .getByLabel("Upload education photo or diploma image", { exact: true })
    .setInputFiles({
      name: "diploma.png",
      mimeType: "image/png",
      buffer: Buffer.from("fixture"),
    });
  await expect(page.locator('select[name="media_id"]')).toHaveValue("7");
  await expect(
    page.getByLabel("Upload education pdf", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect.poll(() => saved?.media_id).toBe(7);
});
