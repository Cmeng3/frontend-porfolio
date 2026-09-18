# Frontend

See the [root README](../README.md) for setup, environment variables, architecture, and verification commands.

Run `npm.cmd run dev` here and visit http://localhost:3000.

Use Node.js 22.x, version 22.13 or newer, for ESLint 10. On Vercel, select Node.js 22.x to match the major version pinned in `package.json`. This allows patch updates without automatically switching to a new major version. Commit both `package.json` and `package-lock.json` when updating dependencies.

The Next.js preset still includes React, accessibility and import plugins that declare older ESLint peer ranges. Three scoped dependency overrides and the official `@eslint/compat` adapter preserve their rules with ESLint 10. `npm run test:lint-config` checks that these plugins still catch representative problems. Remove the overrides and adapter when the upstream plugins support ESLint 10 directly.

The `allowScripts` entry approves only the reviewed `unrs-resolver@1.12.2` native-binding setup script. Review this approval again when that dependency changes; do not globally enable all dependency scripts.
