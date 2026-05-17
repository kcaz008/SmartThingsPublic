# LocalSignal

LocalSignal is a SaaS MVP for local service businesses that detects sales
opportunities from neighborhood/community posts and drafts human-sounding,
non-spammy replies. MVP v1 is focused on HVAC and intentionally does not
auto-post.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase auth/database
- OpenAI API for classification and reply generation

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The dashboard, sources, settings, opportunities,
and API routes require login.

## Required environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Supabase is required for real login/signup, protected routes, session
persistence, tenant-scoped data, and audit logs. If `OPENAI_API_KEY` is missing,
the AI routes return deterministic placeholder classification and reply drafts.
Never store Facebook, Nextdoor, Reddit, or customer passwords in environment
variables or the database.

## AI analysis contract

`createAiAnalysis` in `lib/openai.ts` accepts:

- `post_text`
- `source_name`
- `source_type`
- `service_area`
- `company_name`
- `company_phone`
- `tone_rules`

It returns valid JSON with relevance, HVAC service type, detected town, urgency,
lead score, sentiment, intent type, reasoning summary, and a suggested reply.
The prompt and fallback enforce LocalSignal guardrails: no fake customer claims,
no personal recommendations, non-salesy local tone, under 75 words, and at most
one business-name mention.

## Supabase

Apply `supabase/schema.sql` in a new project, or apply the files in
`supabase/migrations/` to an existing LocalSignal schema.

The schema creates:

- `businesses`
- `sources`
- `opportunities`
- `ai_replies`
- `team_members`
- `target_keywords`
- `connected_accounts`
- `facebook_manual_posts`
- `facebook_reply_history`
- `reputation_memories`
- `competitor_mentions`
- `audit_logs`

The schema includes opportunity statuses, autopilot modes, source types,
business-scoped indexes, and row-level security policies keyed by the
authenticated user's `app_metadata.business_id` claim.

Signup uses `SUPABASE_SERVICE_ROLE_KEY` to create:

1. A business tenant
2. A Supabase Auth user
3. `app_metadata.business_id` and `app_metadata.role = owner`

### Seed/test user

Set the seed variables in `.env.local`, then run:

```bash
npm run seed:user
```

The seed script requires `SEED_USER_PASSWORD`; it is intentionally blank in
`.env.example` so no password is committed.

### Runtime verification

After `.env.local` contains real Supabase values and the schema is applied, run:

```bash
npm run check:runtime
```

That verifies the required Supabase tables are reachable with the service role.
To also verify login for a test user, set `CHECK_USER_EMAIL` and
`CHECK_USER_PASSWORD` in your shell or `.env.local` before running the command.

## MVP pages

- Dashboard: command-center metrics, filters, source health, opportunities
- Lead Analytics: leads by town/group, hot leads this week, response rate,
  booked/closed count, competitor mentions, follow-ups needed
- Team Coordination: active client/brand switcher, reply-as guidance, second
  responder recommendations, collision warnings, conversation timelines, group
  vibe/rules, and CTA/phone-number rules
- Add Opportunity: manual post intake with AI analysis and reply drafting
- Opportunity Detail: original post, lead temperature, suggested next action,
  best responder routing, admin-risk warnings, competitor intelligence, AI
  draft, copy-to-clipboard
- Sources: tracked community/source records and target keywords
- Settings: business profile, tone rules, autopilot mode, audit log
- Company Knowledge Settings: service areas, services offered, emergency
  availability, brands serviced, financing, warranty notes, preferred tone, and
  phrases to avoid
- Reputation Memory: tone, conversion, team-profile, and group-promotion learnings
  used as AI drafting guidance
- Connected Accounts: team profiles, safe Meta OAuth placeholders, Facebook
  group/page status, and manual Facebook demo reply history with duplicate
  prevention

## Local end-to-end flow

1. Create/apply the Supabase schema.
2. Fill `.env.local`.
3. Run `npm run dev`.
4. Visit `/signup` and create a business.
5. Add sources and keywords at `/sources`.
6. Add a post at `/opportunities/new`.
7. Review, edit, approve, reject, or copy the draft on the opportunity detail
   page.
8. Check `/settings` for audit-log entries.

## Deployment

The simplest deployment target is Vercel:

1. Push this repository to GitHub.
2. Import it in Vercel as a Next.js project.
3. Add the same environment variables listed above.
4. In Supabase Auth, add your production URL to allowed redirect URLs.
5. Run `npm run build` locally before deploying.

For another Node host, build and start with:

```bash
npm install
npm run build
npm run start
```

The existing `circle.yml` is for the legacy SmartThings/Gradle tree in this
repository and does not deploy the LocalSignal Next.js app.
