import { test, expect } from "@playwright/test";

test("admin reads contact messages and saves reply status and private notes", async ({
  page,
}) => {
  let item: Record<string, unknown> = {
    id: 1,
    name: "Recruiter",
    email: "recruiter@example.com",
    subject: "Backend opportunity",
    message: "We would like to discuss a backend role.\nPlease get in touch.",
    status: "unread",
    created_at: "2026-09-17T10:00:00Z",
    admin_notes: null,
  };
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.route("**/api/v1/admin/**", async (route) => {
    const path = new URL(route.request().url()).pathname.split("/admin/")[1];
    let data: unknown;
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204 });
      return;
    }
    if (path === "me") data = { data: { name: "Administrator" } };
    else if (path === "schema") data = { data: {} };
    else if (path === "dashboard")
      data = { data: { counts: {}, projects: [], messages: [] } };
    else if (path === "csrf") data = { token: "test-token" };
    else if (path === "contact-messages/1") {
      if (route.request().method() === "PATCH")
        item = { ...item, ...route.request().postDataJSON() };
      data = { data: item };
    } else
      data = {
        data: [item],
        meta: { total: 1, current_page: 1, last_page: 1 },
      };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/admin/contact-messages");
  await page.getByRole("button", { name: /Backend opportunity/ }).click();
  await expect(page.locator(".inbox-message")).toContainText(
    "Please get in touch.",
  );
  expect(item.status).toBe("read");
  await expect(
    page.getByRole("link", { name: "Reply by email" }),
  ).toHaveAttribute("href", /^mailto:recruiter%40example.com\?subject=/);
  await expect(
    page
      .getByRole("combobox", { name: "Status", exact: true })
      .locator('option[value="unread"]'),
  ).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("replied");
  await page
    .getByRole("textbox", { name: "Private notes", exact: true })
    .fill("Replied using my email app.");
  await page.getByRole("button", { name: "Save message" }).click();
  await expect(page.getByRole("status")).toContainText("saved");
  expect(item.admin_notes).toBe("Replied using my email app.");
  expect(item.status).toBe("replied");
  expect(errors.filter((e) => e.includes("same key"))).toEqual([]);
  await page.getByRole("button", { name: "Back to inbox" }).click();
  await expect(
    page.getByRole("button", { name: /Backend opportunity/ }),
  ).toContainText("replied");
});
