import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("contact topics, validation, retry, confirmation and responsive layout", async ({
  page,
}) => {
  let attempt = 0;
  let sent: Record<string, string> | undefined;
  await page.route("**/api/v1/contact", (route) => {
    attempt++;
    sent = route.request().postDataJSON();
    return route.fulfill(
      attempt === 1
        ? {
            status: 422,
            contentType: "application/json",
            body: JSON.stringify({
              errors: { email: ["Please use a valid reply address."] },
            }),
          }
        : attempt === 2
          ? {
              status: 503,
              contentType: "text/html",
              body: "Unavailable",
            }
          : {
              status: 201,
              contentType: "application/json",
              body: JSON.stringify({ message: "Received" }),
            },
    );
  });
  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "Send me a message" }),
  ).toBeVisible();
  await page.screenshot({
    path: "../docs/screenshots/contact-desktop.png",
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../docs/screenshots/contact-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("Name *", { exact: true }).fill("Test Visitor");
  await page.getByLabel("Email *", { exact: true }).fill("visitor@example.com");
  await page
    .getByRole("button", { name: "Job opportunity", exact: true })
    .click();
  await expect(page.locator('input[name="subject"]')).toHaveValue(
    "Job opportunity",
  );
  await page
    .getByLabel("Message *", { exact: true })
    .fill("I would like to discuss a backend developer opportunity.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.locator(".contact-message-form").getByRole("alert"),
  ).toContainText("highlighted fields");
  await expect(page.getByLabel("Email *", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByLabel("Message *", { exact: true })).toHaveValue(
    "I would like to discuss a backend developer opportunity.",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.locator(".contact-message-form").getByRole("alert"),
  ).toContainText("message service is unavailable");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Thanks for reaching out." }),
  ).toBeVisible();
  expect(sent?.subject).toBe("Job opportunity");
  await page.getByRole("button", { name: "Send another message" }).click();
  await expect(page.getByLabel("Name *", { exact: true })).toHaveValue("");
});
