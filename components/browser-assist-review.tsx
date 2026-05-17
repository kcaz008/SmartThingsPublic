"use client";

import { useState } from "react";
import { Field, inputClassName } from "@/components/form-controls";
import type { Business, Source, TeamMember } from "@/lib/types";

type ReviewResponse = {
  importId: string | null;
  saved: boolean;
  duplicateWarning: string | null;
  review: {
    groupName: string;
    groupUrl?: string;
    postUrl?: string;
    posterName?: string | null;
    postText: string;
    visibleComments: string[];
    detectedIntent: string;
    leadScore: number;
    competitorMentions: string[];
    recommendedAction: string;
  };
  safety: string;
};

export function BrowserAssistReview({
  sources,
  teamMembers,
  businesses,
  activeBusinessId,
}: {
  sources: Source[];
  teamMembers: TeamMember[];
  businesses: Business[];
  activeBusinessId: string | null;
}) {
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function submitImport(
    event: React.FormEvent<HTMLFormElement>,
    confirmSave = false,
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const source = sources.find((item) => item.id === formData.get("sourceId"));
    const payload = {
      source: "facebook_browser_assist",
      groupName: String(formData.get("groupName") || source?.name || ""),
      groupUrl: String(formData.get("groupUrl") || source?.url || ""),
      postUrl: String(formData.get("postUrl") ?? ""),
      posterName: String(formData.get("posterName") ?? "") || null,
      postText: String(formData.get("postText") ?? ""),
      visibleComments: String(formData.get("visibleComments") ?? "")
        .split("\n")
        .map((comment) => comment.trim())
        .filter(Boolean),
      importedByTeamMemberId:
        String(formData.get("importedByTeamMemberId") ?? "") || null,
      clientId: String(formData.get("clientId") ?? activeBusinessId ?? "") || null,
      confirmSave,
    };

    const response = await fetch("/api/browser-import/facebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("Unable to import. Check required fields.");
      setIsSubmitting(false);
      return;
    }

    const json = (await response.json()) as ReviewResponse;
    setResult(json);
    setStatus(confirmSave ? "Saved as lead." : "Imported as pending review.");
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-black text-slate-950">
        Imported-post review screen
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Simulates what the browser helper will send after an employee selects
        visible posts/comments.
      </p>
      <form
        onSubmit={(event) => submitImport(event)}
        className="mt-5 grid gap-5 md:grid-cols-2"
      >
        <Field label="Client">
          <select name="clientId" defaultValue={activeBusinessId ?? ""} className={inputClassName}>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source/group">
          <select name="sourceId" className={inputClassName}>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Group name">
          <input name="groupName" className={inputClassName} placeholder="Garden City Moms & Neighbors" />
        </Field>
        <Field label="Group URL">
          <input name="groupUrl" type="url" className={inputClassName} />
        </Field>
        <Field label="Post URL">
          <input name="postUrl" type="url" className={inputClassName} />
        </Field>
        <Field label="Poster name">
          <input name="posterName" className={inputClassName} />
        </Field>
        <Field label="Imported by">
          <select name="importedByTeamMemberId" className={inputClassName}>
            <option value="">Unknown / not selected</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Post text">
            <textarea
              name="postText"
              required
              rows={5}
              className={inputClassName}
              placeholder="Paste selected visible post text here."
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Visible comments">
            <textarea
              name="visibleComments"
              rows={5}
              className={inputClassName}
              placeholder="One visible comment per line."
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Review import
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (form) {
                submitImport({ preventDefault: () => undefined, currentTarget: form } as React.FormEvent<HTMLFormElement>, true);
              }
            }}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Save as lead
          </button>
          <button type="button" onClick={() => setStatus("Marked ignored for demo.")} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            Ignore
          </button>
          <button type="button" onClick={() => setStatus("Assigned to selected team member for demo.")} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            Assign to team member
          </button>
          <button type="button" onClick={() => setStatus("Reply generation queued for demo.")} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            Generate reply
          </button>
          <button type="button" onClick={() => setStatus("Marked already responded for demo.")} className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
            Mark already responded
          </button>
        </div>
      </form>

      {status ? (
        <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">
          {status}
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Review result
          </p>
          {result.duplicateWarning ? (
            <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              {result.duplicateWarning}
            </p>
          ) : null}
          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            <ReviewRow label="Group" value={result.review.groupName} />
            <ReviewRow label="Poster" value={result.review.posterName ?? "Unknown"} />
            <ReviewRow label="Detected intent" value={result.review.detectedIntent} />
            <ReviewRow label="Lead score" value={String(result.review.leadScore)} />
            <ReviewRow
              label="Competitors"
              value={
                result.review.competitorMentions.length
                  ? result.review.competitorMentions.join(", ")
                  : "None detected"
              }
            />
            <ReviewRow label="Recommended action" value={result.review.recommendedAction} />
          </dl>
          <p className="mt-4 text-xs font-semibold text-slate-500">{result.safety}</p>
        </div>
      ) : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
