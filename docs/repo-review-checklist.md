# LocalSignal repo review checklist

## What this app is

- Framework: Next.js App Router, React, TypeScript, Tailwind CSS.
- Frontend routes: `app/(app)/dashboard`, `sources`, `settings`,
  `settings/connected-accounts`, `opportunities/new`, and
  `opportunities/[id]`.
- Backend/API routes: `app/api/opportunities/analyze`,
  `app/api/replies`, and `app/api/replies/[id]/copy`.
- Database: Supabase Postgres with Supabase Auth. The app scopes tenant data
  by `auth.jwt().app_metadata.business_id`.
- AI: OpenAI Responses API through `lib/openai.ts`, with deterministic
  placeholder output when no OpenAI key is present.
- Local start: `npm install`, `cp .env.example .env.local`, fill Supabase
  values, apply schema, then `npm run dev`.

## Prioritized gaps found

### P0 - required before real use

- Missing real login/signup and protected dashboard. Fixed with Supabase Auth,
  cookie sessions, `/login`, `/signup`, logout, middleware protection, and
  owner role metadata.
- UI read hard-coded sample data instead of tenant data. Fixed for dashboard,
  sources, settings, manual intake, opportunity detail, replies, keywords,
  connected accounts, and audit logs when Supabase is configured.
- Manual intake did not persist leads or drafts. Fixed by saving
  `opportunities` and `ai_replies` with draft/manual approval defaults.
- No schema for audit logs, target keywords, team profiles, safe connected
  accounts, or manual Facebook reply history. Fixed in `supabase/schema.sql`
  and migrations.
- API routes had no auth or rate limits. Fixed with auth checks and in-memory
  per-user limits.

### P1 - important hardening still recommended

- Rate limits are process-local. Use a shared store such as Upstash Redis,
  Supabase, or platform edge rate limiting in production.
- Multi-business switching is not implemented. The schema and auth metadata
  support tenant isolation, but the UI currently uses one active business per
  user.
- Connected account OAuth is a safe placeholder only. Real integrations must
  use official APIs/OAuth and encrypted server-side token storage; token
  placeholder columns are intentionally not exposed in the UI.
- Audit logging depends on `SUPABASE_SERVICE_ROLE_KEY`. Production should also
  add monitoring/alerting for failed audit writes.
- There is no automated CI for the Next.js app; existing CircleCI config is for
  legacy SmartThings Gradle content.

### P2 - polish and expansion

- Add a full CRUD UI for opportunity status transitions beyond approve/edit/
  reject/copy.
- Add admin screens for inviting users and changing roles.
- Add import jobs for official platform/API data sources.
- Add unit/integration tests around auth actions, data mappers, and API routes.

## Compliance posture

- Autopilot defaults to `off`; manual approval is the default workflow.
- The app creates reply drafts and logs user actions; it does not auto-post.
- Connected accounts intentionally do not store external account passwords.
- Facebook setup copy explicitly says Meta login/API will be used and Facebook
  passwords must not be entered.
- Manual Facebook mode stores pasted post/comment data, tracks responder
  history and comments-ago, generates an AI suggestion, and prevents duplicate
  replies for the same post/team member.
- Reputation Memory stores tone, conversion, team-profile closing, and
  promo-sensitive group learnings and includes active notes in AI drafting
  guidance.
- Source/keyword setup warns that official APIs/OAuth are required for private
  or platform-governed data access.
