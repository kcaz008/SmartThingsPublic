"use client";

import { useState } from "react";
import { Field, inputClassName } from "@/components/form-controls";
import type { AiAnalysis, Source } from "@/lib/types";

type IntakeResult = {
  analysis: AiAnalysis;
  reply: string;
};

export function OpportunityIntakeForm({ sources }: { sources: Source[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      postText: String(formData.get("postText") ?? ""),
      authorName: String(formData.get("authorName") ?? ""),
      neighborhood: String(formData.get("neighborhood") ?? ""),
      sourceId: String(formData.get("sourceId") ?? ""),
      sourceName:
        sources.find((source) => source.id === formData.get("sourceId"))
          ?.name ?? "Manual intake",
    };

    try {
      const response = await fetch("/api/opportunities/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to analyze this opportunity.");
      }

      setResult((await response.json()) as IntakeResult);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to analyze this opportunity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Post title">
            <input
              name="title"
              required
              className={inputClassName}
              placeholder="AC stopped cooling this afternoon"
            />
          </Field>

          <Field label="Source">
            <select name="sourceId" className={inputClassName}>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Author name" hint="Optional">
            <input
              name="authorName"
              className={inputClassName}
              placeholder="Homeowner or poster name"
            />
          </Field>

          <Field label="Neighborhood">
            <input
              name="neighborhood"
              className={inputClassName}
              placeholder="Maple Grove"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Original post text">
            <textarea
              name="postText"
              required
              rows={8}
              className={inputClassName}
              placeholder="Paste the full post here so LocalSignal can detect urgency, intent, and reply tone."
            />
          </Field>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                AI analysis on save
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                This calls the local API route. Without API keys it uses a
                deterministic placeholder, so the MVP remains demoable.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Analyzing..." : "Save and draft"}
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
            Draft generated
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ResultMetric label="Category" value={result.analysis.category} />
            <ResultMetric label="Urgency" value={result.analysis.urgency} />
            <ResultMetric
              label="Confidence"
              value={`${Math.round(result.analysis.confidence * 100)}%`}
            />
          </div>
          <div className="mt-5 rounded-3xl bg-blue-50 p-5">
            <p className="text-sm font-bold text-blue-950">Reply draft</p>
            <p className="mt-2 text-base leading-8 text-slate-800">
              {result.reply}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}
