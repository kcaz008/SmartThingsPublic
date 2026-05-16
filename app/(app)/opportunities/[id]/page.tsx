import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyReplyButton } from "@/components/copy-reply-button";
import { PageHeader } from "@/components/page-header";
import { PlainBadge, StatusBadge, UrgencyBadge } from "@/components/status-badge";
import {
  getOpportunityById,
  getReplyForOpportunity,
} from "@/lib/sample-data";
import { formatCurrency, formatDateTime, percentage } from "@/lib/format";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = getOpportunityById(id);

  if (!opportunity) {
    notFound();
  }

  const reply = getReplyForOpportunity(opportunity.id);

  return (
    <>
      <PageHeader
        eyebrow="Opportunity detail"
        title={opportunity.title}
        description="Review the original post, AI analysis, and reply draft before manually responding in the source community."
        action={
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={opportunity.status} />
              <UrgencyBadge urgency={opportunity.urgency} />
              <PlainBadge>{percentage(opportunity.confidence)} confidence</PlainBadge>
              <PlainBadge>{formatCurrency(opportunity.estimatedValue)}</PlainBadge>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Original post
              </p>
              <p className="mt-3 text-lg leading-8 text-slate-800">
                {opportunity.postText}
              </p>
            </div>
            <dl className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Poster
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {opportunity.authorName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Source
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {opportunity.sourceName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Detected
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(opportunity.detectedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                  AI reply draft
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Human review required
                </h2>
              </div>
              {reply ? <CopyReplyButton text={reply.body} /> : null}
            </div>
            {reply ? (
              <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-base leading-8 text-slate-800">{reply.body}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                No draft yet. Use autopilot or generate a draft after review.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              AI analysis
            </p>
            <div className="mt-4 space-y-4">
              <AnalysisRow label="Category" value={opportunity.aiAnalysis.category} />
              <AnalysisRow
                label="Homeowner intent"
                value={opportunity.aiAnalysis.homeownerIntent}
              />
              <AnalysisRow
                label="Recommended action"
                value={opportunity.aiAnalysis.recommendedAction}
              />
              <AnalysisRow
                label="Spam risk"
                value={opportunity.aiAnalysis.spamRisk}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Pipeline tracking
            </p>
            <div className="mt-4 space-y-3">
              {[
                "new",
                "drafted",
                "approved",
                "replied",
                "booked",
                "won",
              ].map((status) => (
                <div
                  key={status}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    status === opportunity.status
                      ? "bg-signal-navy text-white"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {status.replace("_", " ")}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
