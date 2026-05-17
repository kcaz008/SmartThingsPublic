import Link from "next/link";
import { BrowserAssistReview } from "@/components/browser-assist-review";
import { PageHeader } from "@/components/page-header";
import { requireAuthContext } from "@/lib/auth";
import { listBusinesses, listSources, listTeamMembers } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default async function BrowserAssistPage() {
  const authContext = await requireAuthContext();
  const [sources, teamMembers, businesses] = await Promise.all([
    listSources(authContext.businessId),
    listTeamMembers(authContext.businessId),
    listBusinesses(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Browser Assist"
        title="Human-in-the-loop Facebook importing."
        description="Employees manually open Facebook groups they already have access to, choose visible posts/comments, and send only selected content to LocalSignal."
        action={
          <Link
            href="/sources"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            View sources
          </Link>
        }
      />

      <div className="mb-6 rounded-3xl border border-amber-100 bg-signal-amber p-5">
        <p className="text-sm font-bold text-amber-950">Safety promise</p>
        <p className="mt-2 text-sm leading-6 text-amber-950/80">
          Browser Assist is user-initiated. It only imports posts the employee
          chooses from pages they are actively viewing. LocalSignal does not
          store Facebook passwords, does not auto-post, and does not run hidden
          background scraping.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        <ModeCard
          title="A. Manual Paste Import"
          status="Available now"
          body="Paste post/comment text manually, then generate lead analysis and replies."
        />
        <ModeCard
          title="B. Browser Assist / Click-to-Import"
          status="Planned next"
          body="Open a Facebook group/post yourself, click Import visible posts, review selected posts, then send only chosen content to LocalSignal."
        />
        <ModeCard
          title="C. Official Meta OAuth/API"
          status="Future"
          body="Use official Meta Login/API only where Meta allows it. Requires app review and stores tokens server-side only."
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_26rem]">
        <BrowserAssistReview
          sources={sources}
          teamMembers={teamMembers}
          businesses={businesses}
          activeBusinessId={authContext.businessId}
        />

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Group watchlist
            </p>
            <div className="mt-4 space-y-4">
              {sources.map((source) => {
                const assigned = teamMembers.find(
                  (member) => member.id === source.assignedTeamMemberId,
                );

                return (
                  <div key={source.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black text-slate-950">{source.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{source.town}</p>
                    <dl className="mt-3 grid gap-2 text-xs text-slate-600">
                      <WatchRow
                        label="Assigned"
                        value={assigned?.fullName ?? "Unassigned"}
                      />
                      <WatchRow
                        label="Last checked"
                        value={
                          source.lastCheckedAt
                            ? formatDateTime(source.lastCheckedAt)
                            : "Not tracked"
                        }
                      />
                      <WatchRow
                        label="Frequency"
                        value={source.checkFrequency ?? "Set manually"}
                      />
                      <WatchRow
                        label="Promo / admin"
                        value={`${source.promoSensitivity} / ${source.adminStrictness}`}
                      />
                      <WatchRow
                        label="Phone public"
                        value={source.phoneSafeInPublic ? "Yes" : "No"}
                      />
                      <WatchRow
                        label="DM preferred"
                        value={source.dmFirstPreferred ? "Yes" : "No"}
                      />
                    </dl>
                    {source.notes ? (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {source.notes}
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                        >
                          Open group
                        </a>
                      ) : null}
                      <Link
                        href="/opportunities/new"
                        className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                      >
                        Import pasted post
                      </Link>
                      <button
                        type="button"
                        disabled
                        className="rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-500"
                      >
                        Import visible posts with extension
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

function ModeCard({
  title,
  status,
  body,
}: {
  title: string;
  status: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
        {status}
      </span>
      <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function WatchRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="font-bold text-slate-900">{label}</dt>
      <dd className="text-right capitalize">{value}</dd>
    </div>
  );
}
