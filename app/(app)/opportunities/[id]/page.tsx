import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyReplyButton } from "@/components/copy-reply-button";
import { PageHeader } from "@/components/page-header";
import { ReplyVariantOptions } from "@/components/reply-variant-options";
import { PlainBadge, StatusBadge, UrgencyBadge } from "@/components/status-badge";
import { requireAuthContext } from "@/lib/auth";
import {
  getBusiness,
  getOpportunity,
  getReplyForOpportunity,
  getSource,
  listCompetitorMentions,
  listFacebookReplyHistory,
  listReputationMemories,
  listTeamMembers,
} from "@/lib/data";
import { formatDateTime, summarizeText } from "@/lib/format";
import { deriveLeadIntelligence } from "@/lib/lead-intelligence";
import { buildReplyVariants } from "@/lib/reply-variants";
import { reviewReplyAction } from "./actions";

export default async function OpportunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demoAction?: string }>;
}) {
  const authContext = await requireAuthContext();
  const { id } = await params;
  const { demoAction } = await searchParams;
  const opportunity = await getOpportunity(authContext.businessId, id);

  if (!opportunity) {
    notFound();
  }

  const [
    reply,
    source,
    teamMembers,
    replyHistory,
    reputationMemories,
    competitorMentions,
    business,
  ] = await Promise.all([
    getReplyForOpportunity(authContext.businessId, opportunity.id),
    getSource(authContext.businessId, opportunity.sourceId),
    listTeamMembers(authContext.businessId),
    listFacebookReplyHistory(authContext.businessId),
    listReputationMemories(authContext.businessId),
    listCompetitorMentions(authContext.businessId),
    getBusiness(authContext.businessId),
  ]);
  const intelligence = deriveLeadIntelligence({
    opportunity,
    source,
    teamMembers,
    reply,
    replyHistory,
    reputationMemories,
    competitorMentions,
  });
  const replyOptions = buildReplyVariants({
    companyName: business.name,
    phone: business.phone,
    serviceType: opportunity.serviceType,
    urgency: opportunity.urgency,
    town: opportunity.detectedTown,
    secondResponderName: intelligence.recommendedSecondResponder,
    ctaPhoneRule: business.ctaPhoneRule,
    phoneSafeInPublic:
      source?.phoneSafeInPublic && !intelligence.phoneAlreadyPosted,
  });
  const timeline = buildTimeline({
    opportunity,
    competitorMentions,
    reply,
    intelligence,
  });

  return (
    <>
      <PageHeader
        eyebrow="Opportunity detail"
        title={summarizeText(opportunity.originalText, 88)}
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

      {demoAction ? (
        <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
          <p className="font-bold">Demo action received.</p>
          <p className="mt-1">
            The {demoAction} button is wired, but this preview has no Supabase
            database, so it cannot persist changes. With Supabase configured,
            this action updates the reply/opportunity record and audit log.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={opportunity.status} />
              <UrgencyBadge urgency={opportunity.urgency} />
              <PlainBadge>{opportunity.leadScore} lead score</PlainBadge>
              <PlainBadge>{intelligence.temperature} lead</PlainBadge>
              <PlainBadge>{opportunity.serviceType}</PlainBadge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <IntelligenceMetric
                label="Recommended action"
                value={intelligence.suggestedNextAction}
              />
              <IntelligenceMetric
                label="Best responder"
                value={intelligence.bestResponder}
              />
              <IntelligenceMetric
                label="Response speed"
                value={intelligence.recommendedResponseSpeed}
              />
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Original post
              </p>
              <p className="mt-3 text-lg leading-8 text-slate-800">
                {opportunity.originalText}
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
                  {source?.name ?? "Unknown source"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(opportunity.createdAt)}
                </dd>
              </div>
            </dl>
            {opportunity.postUrl ? (
              <a
                href={opportunity.postUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-bold text-blue-700 ring-1 ring-blue-100"
              >
                Open original post
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Reply-as control
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-5">
              {[
                ["Reply as company", "Best for clear brand response."],
                ["Reply as team member", "Personal and less promotional."],
                ["Reply as second responder", "Use when a teammate already posted."],
                ["DM instead", "Use when group vibe is sensitive."],
                ["Do not reply", "Use when handled or too risky."],
              ].map(([label, help]) => (
                <div
                  key={label}
                  className={`rounded-2xl p-4 text-sm ${
                    label === intelligence.safetyLabel ||
                    (label === "Reply as second responder" &&
                      intelligence.secondResponderRecommended) ||
                    (label === "DM instead" && intelligence.safetyLabel === "DM only")
                      ? "bg-signal-navy text-white"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <p className="font-black">{label}</p>
                  <p className="mt-2 text-xs leading-5 opacity-80">{help}</p>
                </div>
              ))}
            </div>
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
              {reply ? (
                <CopyReplyButton text={reply.draftText} replyId={reply.id} />
              ) : null}
            </div>
            {reply ? (
              <>
                <ReplyVariantOptions variants={replyOptions} />
                <form action={reviewReplyAction} className="mt-5 space-y-4">
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={opportunity.id}
                  />
                  <input type="hidden" name="replyId" value={reply.id} />
                  <textarea
                    name="draftText"
                    rows={6}
                    defaultValue={reply.draftText}
                    className="w-full rounded-3xl border border-blue-100 bg-blue-50 p-5 text-base leading-8 text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      name="action"
                      value="approve"
                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
                    >
                      Approve draft
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="save"
                      className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
                    >
                      Save edit
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="reject"
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200"
                    >
                      Reject
                    </button>
                  </div>
                </form>
              </>
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
              Coordination label
            </p>
            <p className="mt-3 rounded-2xl bg-signal-navy px-4 py-3 text-sm font-black text-white">
              {intelligence.safetyLabel}
            </p>
            {intelligence.secondResponderRecommended ? (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <p className="font-bold">Second responder recommended</p>
                <p className="mt-1">{`First: ${intelligence.firstResponder}`}</p>
                <p>{`Next: ${intelligence.recommendedSecondResponder}`}</p>
                <p className="mt-1">{intelligence.secondResponderReason}</p>
              </div>
            ) : null}
            {intelligence.wrongBrandRisk ? (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                Wrong-brand risk: switch clients or avoid replying until this
                lead is assigned to the right brand.
              </div>
            ) : null}
            {intelligence.phoneAlreadyPosted ? (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                Phone number was already posted recently. Reply options avoid
                repeating it in public.
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Lead temperature
            </p>
            <div className="mt-4 space-y-4">
              <AnalysisRow label="Temperature" value={intelligence.temperature} />
              <AnalysisRow
                label="Likelihood"
                value={`${intelligence.likelihoodToConvert}%`}
              />
              <AnalysisRow
                label="Homeowner/renter"
                value={intelligence.homeownerRenterGuess}
              />
              <AnalysisRow
                label="Emergency"
                value={intelligence.emergency ? "Yes" : "No"}
              />
              <AnalysisRow label="Service type" value={opportunity.serviceType} />
              <AnalysisRow
                label="Detected town"
                value={opportunity.detectedTown}
              />
              <AnalysisRow
                label="Sentiment"
                value={opportunity.sentiment}
              />
              <AnalysisRow
                label="Intent type"
                value={opportunity.intentType.replaceAll("_", " ")}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Don&apos;t embarrass us
            </p>
            <div className="mt-4 space-y-3">
              {[
                ...intelligence.adminRiskWarnings,
                ...intelligence.embarrassmentWarnings,
                ...intelligence.collisionWarnings,
              ].length ? (
                [
                  ...intelligence.adminRiskWarnings,
                  ...intelligence.embarrassmentWarnings,
                  ...intelligence.collisionWarnings,
                ].map((warning) => (
                  <div
                    key={warning}
                    className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900"
                  >
                    {warning}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                  No obvious duplicate, hostile-thread, closed-lead, or
                  repetitive-reply warning.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Conversation timeline
            </p>
            <div className="mt-4 space-y-3">
              {timeline.map((item) => (
                <div key={`${item.time}-${item.text}`} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {item.time}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Competitor intelligence
            </p>
            <div className="mt-4 space-y-3">
              {intelligence.competitorInsights.length ? (
                intelligence.competitorInsights.map((insight) => (
                  <div
                    key={insight}
                    className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                  >
                    {insight}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No competitor mentions tracked for this lead yet.
                </p>
              )}
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

function IntelligenceMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
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

function buildTimeline({
  opportunity,
  competitorMentions,
  reply,
  intelligence,
}: {
  opportunity: NonNullable<Awaited<ReturnType<typeof getOpportunity>>>;
  competitorMentions: Awaited<ReturnType<typeof listCompetitorMentions>>;
  reply: Awaited<ReturnType<typeof getReplyForOpportunity>>;
  intelligence: ReturnType<typeof deriveLeadIntelligence>;
}) {
  const items = [
    {
      time: formatDateTime(opportunity.createdAt),
      text: `Original post by ${opportunity.authorName}.`,
    },
    ...competitorMentions
      .filter(
        (mention) =>
          mention.opportunityId === opportunity.id ||
          mention.sourceId === opportunity.sourceId,
      )
      .map((mention) => ({
        time: formatDateTime(mention.createdAt),
        text: `${mention.competitorName} mentioned ${
          mention.mentionedBeforeUs ? "before us" : "after us"
        }.`,
      })),
    ...(reply?.copied
      ? [
          {
            time: formatDateTime(reply.createdAt),
            text: reply.postedManually
              ? `${intelligence.firstResponder} replied publicly.`
              : `${intelligence.firstResponder} copied a draft but did not mark it posted.`,
          },
        ]
      : []),
    {
      time: "Now",
      text: intelligence.secondResponderRecommended
        ? `Suggested: ${intelligence.recommendedSecondResponder} should follow up.`
        : `Suggested: ${intelligence.safetyLabel}.`,
    },
  ];

  return items;
}
