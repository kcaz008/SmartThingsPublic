import type {
  AutopilotMode,
  OpportunityStatus,
  UrgencyLevel,
} from "@/lib/types";

const statusLabels: Record<OpportunityStatus, string> = {
  new: "New",
  drafted: "Drafted",
  approved: "Approved",
  replied: "Replied",
  booked: "Booked",
  won: "Won",
  lost: "Lost",
  ignored: "Ignored",
};

const autopilotLabels: Record<AutopilotMode, string> = {
  off: "Off",
  draft_only: "Draft only",
  approval_required: "Approval required",
};

const urgencyLabels: Record<UrgencyLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  emergency: "Emergency",
};

export function formatStatus(status: OpportunityStatus) {
  return statusLabels[status];
}

export function formatAutopilotMode(mode: AutopilotMode) {
  return autopilotLabels[mode];
}

export function formatUrgency(urgency: UrgencyLevel) {
  return urgencyLabels[urgency];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function summarizeText(value: string, maxLength = 72) {
  const trimmed = value.replace(/\s+/g, " ").trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trim()}...`;
}
