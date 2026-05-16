import { PageHeader } from "@/components/page-header";
import { sources } from "@/lib/sample-data";

const typeLabels: Record<string, string> = {
  facebook_group: "Facebook group",
  nextdoor: "Nextdoor",
  reddit: "Reddit",
  manual: "Manual",
  other: "Other",
};

export default function SourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Lead sources"
        title="Monitor the places homeowners ask for help."
        description="MVP v1 keeps sources as tracked records and supports manual entry. Automated scraping and auto-posting are intentionally out of scope."
        action={
          <button className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
            Add source
          </button>
        }
      />

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
                  className="mt-2 block font-semibold text-blue-700"
                >
                  Open source
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
