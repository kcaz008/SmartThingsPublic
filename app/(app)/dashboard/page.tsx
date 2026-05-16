import Link from "next/link";
import { FilterChip } from "@/components/filter-chip";
import { OpportunityCard } from "@/components/opportunity-card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { opportunities, sources } from "@/lib/sample-data";

export default function DashboardPage() {
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
          label="Open signals"
          value={String(activeOpportunities.length)}
          helper="New, drafted, approved, replied, and booked opportunities."
        />
        <StatCard
          label="Drafts ready"
          value={String(draftedCount)}
          helper="AI-generated replies waiting for review and copy."
          tone="amber"
        />
        <StatCard
          label="Booked"
          value={String(bookedCount)}
          helper="Manual follow-up led to an appointment."
          tone="green"
        />
        <StatCard
          label="Avg. lead score"
          value={String(averageLeadScore)}
          helper="AI lead score across active neighborhood opportunities."
          tone="blue"
        />
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
              Autopilot is set to draft only. No posts are published
              automatically.
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
