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

Apply `supabase/schema.sql` to create:

- `businesses`
- `sources`
- `opportunities`
- `ai_replies`

The schema includes opportunity statuses, autopilot modes, source types,
business-scoped indexes, and row-level security policies keyed by the
authenticated user's `app_metadata.business_id` claim.

## MVP pages

- Dashboard: command-center metrics, filters, source health, opportunities
- Add Opportunity: manual post intake with AI analysis and reply drafting
- Opportunity Detail: original post, AI analysis, draft, copy-to-clipboard
- Sources: tracked community/source records
- Settings: business profile, tone rules, autopilot mode
