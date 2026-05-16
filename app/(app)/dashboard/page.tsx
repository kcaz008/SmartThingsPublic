import Link from "next/link";
import { FilterChip } from "@/components/filter-chip";
import { OpportunityCard } from "@/components/opportunity-card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { requireAuthContext } from "@/lib/auth";
import {
  listCompetitorMentions,
  listFacebookReplyHistory,
  listOpportunities,
  listReputationMemories,
  listSources,
  listTeamMembers,
} from "@/lib/data";
import {
  buildLeadAnalytics,
  deriveLeadIntelligence,
} from "@/lib/lead-intelligence";

export default async function DashboardPage() {
  const authContext = await requireAuthContext();
  const [
    opportunities,
    sources,
    teamMembers,
    replyHistory,
    reputationMemories,
    competitorMentions,
  ] = await Promise.all([
    listOpportunities(authContext.businessId),
    listSources(authContext.businessId),
    listTeamMembers(authContext.businessId),
    listFacebookReplyHistory(authContext.businessId),
    listReputationMemories(authContext.businessId),
    listCompetitorMentions(authContext.businessId),
  ]);
  const intelligenceById = new Map(
    opportunities.map((opportunity) => {
      const source = sources.find((item) => item.id === opportunity.sourceId);
      return [
        opportunity.id,
        deriveLeadIntelligence({
          opportunity,
          source,
          teamMembers,
          replyHistory,
          reputationMemories,
          competitorMentions,
        }),
      ];
    }),
  );
  const analytics = buildLeadAnalytics({
    opportunities,
    sources,
    intelligenceById,
    competitorMentions,
  });
  const activeOpportunities = opportunities.filter(
    (opportunity) => !["won", "lost", "ignored"].includes(opportunity.status),
  );
  const averageLeadScore = activeOpportunities.length
    ? Math.round(
        activeOpportunities.reduce(
          (total, opportunity) => total + opportunity.leadScore,
          0,
        ) / activeOpportunities.length,
      )
    : 0;
  const draftedCount = opportunities.filter(
    (opportunity) => opportunity.status === "drafted",
  ).length;
  const bookedCount = opportunities.filter(
    (opportunity) => opportunity.status === "booked",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Find HVAC leads before competitors do."
        description="Track community posts, identify intent, draft neighborly replies, and move each opportunity through your local sales workflow."
        action={
          <Link
            href="/opportunities/new"
            className="inline-flex rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
          >
            Add opportunity
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hot this week"
          value={String(analytics.hotLeadsThisWeek)}
          helper="Leads that need fast, careful response."
        />
        <StatCard
          label="Drafts ready"
          value={String(draftedCount)}
          helper="AI-generated replies waiting for review and copy."
          tone="amber"
        />
        <StatCard
          label="Response rate"
          value={`${analytics.responseRate}%`}
          helper="Replied, booked, or won out of all tracked leads."
          tone="green"
        />
        <StatCard
          label="Follow-ups needed"
          value={String(analytics.followUpsNeeded)}
          helper={`Avg score ${averageLeadScore}; ${bookedCount} booked.`}
          tone="blue"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <AnalyticsCard title="Leads by town" items={analytics.leadsByTown} />
        <AnalyticsCard title="Leads by group" items={analytics.leadsByGroup} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Competitive signals
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {analytics.competitorMentions}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Competitor mentions tracked across local groups. Booked/closed:
            {" "}
            {analytics.bookedClosedCount}.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CoordinationCard
          title="Leads needing second responder"
          value={String(analytics.secondResponderNeeded)}
          helper="A teammate should follow after the first public reply."
        />
        <CoordinationCard
          title="Team collisions"
          value={String(analytics.teamCollisions)}
          helper="Recent replies, assignments, or closed-lead conflicts."
        />
        <CoordinationCard
          title="Wrong-brand risk"
          value={String(analytics.wrongBrandRisk)}
          helper="Leads that may not match the active client brand."
        />
        <CoordinationCard
          title="DM recommended"
          value={String(analytics.dmRecommended)}
          helper="Groups or threads where public replies are risky."
        />
        <CoordinationCard
          title="Hot leads with no owner"
          value={String(analytics.hotUnassigned)}
          helper="Hot opportunities that still need assignment."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Follow-ups by employee
          </p>
          <div className="mt-4 space-y-3">
            {analytics.followUpsByEmployee.length ? (
              analytics.followUpsByEmployee.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No follow-ups queued.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <FilterChip active>All active</FilterChip>
            <FilterChip>Emergency</FilterChip>
            <FilterChip>Needs draft</FilterChip>
            <FilterChip>Booked</FilterChip>
          </div>
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                source={sources.find((source) => source.id === opportunity.sourceId)}
                intelligence={intelligenceById.get(opportunity.id)}
              />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Today&apos;s focus
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              Respond quickly, keep it human.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              LocalSignal flags urgency and spam risk so replies sound like a
              helpful neighbor, not a bot or billboard.
            </p>
            <div className="mt-5 rounded-2xl bg-signal-mint p-4 text-sm font-semibold text-emerald-900">
              Manual approval is the default. LocalSignal drafts replies but
              does not publish posts automatically.
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Source health
              </p>
              <Link href="/sources" className="text-sm font-bold text-blue-700">
                Manage
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {sources.slice(0, 3).map((source) => (
                <div
                  key={source.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-slate-900">{source.name}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        source.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {source.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{source.town}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function CoordinationCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function AnalyticsCard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {item.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
