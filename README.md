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

The app is demoable without API keys. If `OPENAI_API_KEY` is missing, the API
routes return deterministic placeholder classification and reply drafts.

## Supabase

Apply `supabase/schema.sql` to create:

- `businesses`
- `users`
- `sources`
- `opportunities`
- `ai_replies`

The schema includes opportunity statuses, autopilot modes, indexes, updated-at
triggers, and row-level security policies scoped by business.

## MVP pages

- Dashboard: command-center metrics, filters, source health, opportunities
- Add Opportunity: manual post intake with AI analysis and reply drafting
- Opportunity Detail: original post, AI analysis, draft, copy-to-clipboard
- Sources: tracked community/source records
- Settings: business profile, reply tone, autopilot mode
