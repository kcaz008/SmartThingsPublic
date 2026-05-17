import { PageHeader } from "@/components/page-header";
import { Field, inputClassName } from "@/components/form-controls";
import Link from "next/link";
import { requireAuthContext } from "@/lib/auth";
import { recommendedKeywordGroups } from "@/lib/default-keywords";
import { listSources, listTargetKeywords } from "@/lib/data";
import {
  addKeywordAction,
  addRecommendedKeywordsAction,
  addSourceAction,
} from "./actions";

const typeLabels: Record<string, string> = {
  facebook_group: "Facebook group",
  nextdoor: "Nextdoor",
  reddit: "Reddit",
  manual: "Manual",
  other: "Other",
};

export default async function SourcesPage() {
  const authContext = await requireAuthContext();
  const [sources, keywords] = await Promise.all([
    listSources(authContext.businessId),
    listTargetKeywords(authContext.businessId),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Lead sources"
        title="Monitor the places homeowners ask for help."
        description="MVP v1 keeps sources as tracked records and supports manual entry. Automated scraping and auto-posting are intentionally out of scope."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          <form
            action={addSourceAction}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Add neighborhood or group
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="Source name">
                <input
                  name="name"
                  required
                  className={inputClassName}
                  placeholder="Webster Groves Community"
                />
              </Field>
              <Field label="Source type">
                <select name="type" className={inputClassName}>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Neighborhood / town">
                <input
                  name="town"
                  className={inputClassName}
                  placeholder="Webster Groves"
                />
              </Field>
              <Field label="URL" hint="No passwords or private tokens">
                <input
                  name="url"
                  type="url"
                  className={inputClassName}
                  placeholder="https://facebook.com/groups/..."
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
            >
              Add source
            </button>
          </form>

          <div className="grid gap-5 lg:grid-cols-2">
            {sources.map((source) => (
              <article
                key={source.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                      {typeLabels[source.type]}
                    </p>
                    <h2 className="mt-2 text-xl font-black text-slate-950">
                      {source.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{source.town}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      source.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {source.active ? "Active" : "Paused"}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Town
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {source.town}
                  </p>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  {source.active
                    ? "Active for manual opportunity intake."
                    : "Paused and hidden from active monitoring workflows."}
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block font-semibold text-blue-700"
                    >
                      Open source
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="font-bold text-slate-900">Promo sensitivity</p>
                    <p className="capitalize">{source.promoSensitivity}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Admin strictness</p>
                    <p className="capitalize">{source.adminStrictness}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Best reply style</p>
                    <p className="capitalize">{source.bestReplyStyle}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Phone in public</p>
                    <p>{source.phoneSafeInPublic ? "Safe" : "Avoid"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">DM-first</p>
                    <p>{source.dmFirstPreferred ? "Preferred" : "Optional"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Second responder</p>
                    <p>{source.secondResponderWorks ? "Works here" : "Use rarely"}</p>
                  </div>
                </div>
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
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <form
            action={addKeywordAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Target keywords
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These guide imports and AI classification. Keep them service
              related and avoid aggressive competitor or personal targeting.
            </p>
            <Field label="Keyword or phrase">
              <input
                name="keyword"
                required
                className={inputClassName}
                placeholder="AC not cooling"
              />
            </Field>
            <button
              type="submit"
              className="mt-4 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Add keyword
            </button>
          </form>

          <form
            action={addRecommendedKeywordsAction}
            className="rounded-3xl border border-blue-100 bg-signal-sky p-5"
          >
            <p className="text-sm font-bold text-blue-950">
              Recommended keyword set
            </p>
            <p className="mt-3 text-sm leading-6 text-blue-950/80">
              Based on Atlantic Air & Heat&apos;s website: emergency service,
              AC/heating repair, heat pumps, mini splits, maintenance, duct
              cleaning, indoor air quality, financing, rebates, and Long Island
              service areas.
            </p>
            <button
              type="submit"
              className="mt-4 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-800 ring-1 ring-blue-100"
            >
              Add all recommended keywords
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Active keywords
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {keywords.length ? (
                keywords.map((keyword) => (
                  <span
                    key={keyword.id}
                    className="rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"
                  >
                    {keyword.keyword}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Add keywords like AC stopped, furnace quote, or thermostat
                  blank.
                </p>
              )}
              </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Keyword ideas by category
            </p>
            <div className="mt-4 space-y-4">
              {recommendedKeywordGroups.map((group) => (
                <div key={group.category} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">
                    {group.category}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.keywords.slice(0, 8).map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-signal-amber p-5">
            <p className="text-sm font-bold text-amber-950">
              Compliance guardrail
            </p>
            <p className="mt-3 text-sm leading-6 text-amber-950/80">
              LocalSignal stores source records and supports manual imports.
              Official platform APIs or OAuth are required before automated
              collection from private groups.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
