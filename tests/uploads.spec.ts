import { test, expect } from "@playwright/test";
import schema from "./fixtures/admin-schema.json";

for (const resource of ["resumes", "projects"] as const) {
  test(`uploads attach ${resource === "resumes" ? "resume PDF" : "project screenshots"} directly in the editor`, async ({
    page,
  }) => {
    let saved: Record<string, unknown> | undefined;
    let uploads = 0;
    const folders: string[] = [];
    await page.route("**/api/v1/admin/**", async (route) => {
      const path = new URL(route.request().url()).pathname.split("/admin/")[1];
      const method = route.request().method();
      let data: unknown;
      if (method === "OPTIONS") {
        await route.fulfill({ status: 204 });
        return;
      }
      if (path === "me") data = { data: { name: "Test admin" } };
      else if (path === "schema")
        data = {
          data: {
            ...schema,
            resumes: {
              model: "Resume",
              table: "resumes",
              relations: ["media"],
              fields: {
                title: { type: "text", required: true },
                media_id: {
                  type: "reference",
                  reference: "media",
                  required: true,
                },
                is_visible: {
                  type: "checkbox",
                  required: false,
                  default: true,
                },
              },
            },
          },
        };
      else if (path === "dashboard")
        data = { data: { counts: {}, projects: [], messages: [] } };
      else if (path === "csrf") data = { token: "test-token" };
      else if (path === "media" && method === "POST") {
        uploads++;
        folders.push(route.request().postData() || "");
        data = {
          data: {
            id: uploads,
            original_name:
              resource === "resumes" ? "cv.pdf" : `screen-${uploads}.png`,
            mime_type: resource === "resumes" ? "application/pdf" : "image/png",
            url: "https://example.com/test-file",
          },
        };
      } else if (path === resource && method === "POST") {
        saved = route.request().postDataJSON();
        data = { data: { id: 1, ...saved } };
      } else
        data = {
          data: path === resource && saved ? [{ id: 1, ...saved }] : [],
          meta: { total: saved ? 1 : 0, current_page: 1, last_page: 1 },
        };
      await route.fulfill({
        status: method === "POST" ? 201 : 200,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    await page.route("https://example.com/test-file", (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB7kAAAAASUVORK5CYII=",
          "base64",
        ),
      }),
    );
    await page.goto("/admin/uploads");
    await expect(
      page.getByRole("heading", { name: "Photos & uploads" }),
    ).toBeVisible();
    await page.locator(`a[href="/admin/${resource}"]`).click();
    await page.getByRole("button", { name: "Add new", exact: true }).click();
    await page.getByLabel("Title *", { exact: true }).fill("Uploaded entry");
    if (resource === "projects")
      await page.getByLabel("Slug *", { exact: true }).fill("uploaded-entry");
    if (resource === "resumes") {
      await page
        .getByLabel("Upload resume pdf", { exact: true })
        .setInputFiles({
          name: "cv.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4 test fixture"),
        });
      await expect(page.locator('select[name="media_id"]')).toHaveValue("1");
      await expect(
        page.getByTitle("cv.pdf PDF preview", { exact: true }),
      ).toBeVisible();
    } else {
      await page
        .getByLabel("Upload screenshots & gallery", { exact: true })
        .setInputFiles(
          [1, 2].map((n) => ({
            name: `screen-${n}.png`,
            mimeType: "image/png",
            buffer: Buffer.from("test fixture"),
          })),
        );
      await expect(page.locator('select[name="media_ids"]')).toHaveValues([
        "1",
        "2",
      ]);
    }
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(
      page.getByText("Uploaded entry", { exact: true }),
    ).toBeVisible();
    if (resource === "resumes") {
      expect(saved?.media_id).toBe(1);
      expect(saved?.is_visible).toBe(true);
      expect(saved).not.toHaveProperty("published_at");
    } else expect(saved?.media_ids).toEqual([1, 2]);
    expect(
      folders.every((body) =>
        body.includes(
          "portfolio/" + (resource === "resumes" ? "resume" : "projects"),
        ),
      ),
    ).toBe(true);
  });
}
