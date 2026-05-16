import Link from "next/link";
import { formatDateTime, summarizeText } from "@/lib/format";
import { getSourceById } from "@/lib/sample-data";
import type { Opportunity } from "@/lib/types";
import { PlainBadge, StatusBadge, UrgencyBadge } from "@/components/status-badge";

export function OpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const source = getSourceById(opportunity.sourceId);

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={opportunity.status} />
        <UrgencyBadge urgency={opportunity.urgency} />
        <PlainBadge>{opportunity.leadScore} lead score</PlainBadge>
      </div>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">
            {summarizeText(opportunity.originalText)}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {opportunity.originalText}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Service
          </p>
          <p className="mt-1 text-lg font-black text-slate-950">
            {opportunity.serviceType}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
        <span>{source?.name ?? "Unknown source"}</span>
        <span>{opportunity.detectedTown}</span>
        <span>{formatDateTime(opportunity.createdAt)}</span>
      </div>
    </Link>
  );
}
