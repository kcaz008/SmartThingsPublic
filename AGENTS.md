# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

LocalSignal is a Next.js 16 App Router SaaS MVP for HVAC lead generation. See `README.md` for the full stack description and page routes.

### Development commands

Standard npm scripts are defined in `package.json`:

- **Dev server**: `npm run dev` (port 3000 by default)
- **Lint**: `npm run lint` (ESLint 9 flat config in `eslint.config.mjs`)
- **Build**: `npm run build`
- **Type checking**: TypeScript is checked during `npm run build`

### Running without external services

The app runs fully without Supabase or OpenAI API keys. When keys are missing:

- **OpenAI**: `lib/openai.ts` returns deterministic placeholder analysis and reply drafts via regex heuristics.
- **Supabase**: The client returns `null` and the app uses hardcoded sample data from `lib/sample-data.ts`.

Copy `.env.example` to `.env.local` (values can be left empty) before starting the dev server.

### Legacy artifacts

The `smartapps/`, `devicetypes/`, `build.gradle`, `circle.yml`, and `settings.gradle` files are vestigial from the original SmartThingsPublic fork. They are excluded from ESLint and the Next.js build. Ignore them.

### No automated test suite

There is currently no test framework or test files in this repository. Validation is done through lint, build, and manual testing.
