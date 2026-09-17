import assert from "node:assert/strict";
import { test } from "node:test";
import { getSiteUrl } from "../../src/lib/site-url.ts";

test("uses the configured origin and normalizes hostnames", () => {
  assert.equal(
    getSiteUrl({ NEXT_PUBLIC_SITE_URL: " https://portfolio.example.com/ " }),
    "https://portfolio.example.com",
  );
  assert.equal(
    getSiteUrl({ NEXT_PUBLIC_SITE_URL: "portfolio.vercel.app" }),
    "https://portfolio.vercel.app",
  );
  assert.equal(
    getSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000/" }),
    "http://localhost:3000",
  );
});

test("invalid configuration falls back without disclosing its value", (t) => {
  const warning = t.mock.method(console, "warn", () => {});
  for (const value of [
    "not a URL",
    "[REDACTED]",
    "https://",
    "javascript:alert(1)",
    "https://user:secret@example.com",
    "ftp://example.com",
  ]) {
    assert.equal(
      getSiteUrl({
        NEXT_PUBLIC_SITE_URL: value,
        VERCEL_PROJECT_PRODUCTION_URL: "portfolio.vercel.app",
      }),
      "https://portfolio.vercel.app",
    );
  }
  assert.equal(warning.mock.callCount(), 6);
  assert.ok(
    warning.mock.calls.every(
      ({ arguments: args }) => !args.join(" ").includes("secret"),
    ),
  );
});

test("uses deployment URL or local development fallback", () => {
  assert.equal(
    getSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: "invalid hostname",
      VERCEL_URL: "portfolio-preview.vercel.app",
    }),
    "https://portfolio-preview.vercel.app",
  );
  assert.equal(
    getSiteUrl({ NEXT_PUBLIC_SITE_URL: " " }),
    "http://localhost:3000",
  );
});
