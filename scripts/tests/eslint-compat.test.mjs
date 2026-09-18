import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

test("legacy plugins still report React, accessibility and import problems on ESLint 10", async () => {
  const eslint = new ESLint({
    overrideConfig: { rules: { "import/no-duplicates": "error" } },
  });
  const [result] = await eslint.lintText(
    `import { useState } from "react";
     import { useEffect } from "react";
     export default function Example() {
       return <div>{[1, 2].map(value => <span>{value}</span>)}<img src="/example.png" /></div>;
     }`,
    { filePath: "src/lint-compat-check.tsx" },
  );
  const rules = new Set(result.messages.map((message) => message.ruleId));
  for (const rule of [
    "react/jsx-key",
    "jsx-a11y/alt-text",
    "import/no-duplicates",
  ]) {
    assert.ok(rules.has(rule), `Expected ${rule} to remain active`);
  }
});
