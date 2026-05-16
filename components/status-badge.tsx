import type { OpportunityStatus, UrgencyLevel } from "@/lib/types";
import { formatStatus, formatUrgency } from "@/lib/format";

const statusStyles: Record<OpportunityStatus, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-200",
  drafted: "bg-blue-50 text-blue-700 ring-blue-200",
  approved: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  replied: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  booked: "bg-amber-50 text-amber-700 ring-amber-200",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  lost: "bg-rose-50 text-rose-700 ring-rose-200",
  ignored: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

const urgencyStyles: Record<UrgencyLevel, string> = {
  low: "bg-slate-50 text-slate-600 ring-slate-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-orange-50 text-orange-700 ring-orange-200",
  emergency: "bg-red-50 text-red-700 ring-red-200",
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  return <Badge className={statusStyles[status]}>{formatStatus(status)}</Badge>;
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  return (
    <Badge className={urgencyStyles[urgency]}>{formatUrgency(urgency)}</Badge>
  );
}

export function PlainBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="bg-white text-slate-600 ring-slate-200">{children}</Badge>
  );
}
