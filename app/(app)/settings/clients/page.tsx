import Link from "next/link";
import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { requireAuthContext } from "@/lib/auth";
import { listBusinesses, listTargetKeywords } from "@/lib/data";
import { recommendedKeywordGroups } from "@/lib/default-keywords";
import {
  addClientBusinessAction,
  addClientKeywordAction,
  addRecommendedKeywordsToClientAction,
} from "./actions";

export default async function ClientsPage() {
  await requireAuthContext();
  const businesses = await listBusinesses();
  const keywordSets = await Promise.all(
    businesses.map(async (business) => ({
      businessId: business.id,
      keywords: await listTargetKeywords(business.id),
    })),
  );

  return (
    <>
      <PageHeader
        eyebrow="Clients & brands"
        title="Manage multiple local business brands."
        description="Create client profiles, assign brand colors, and add AI keywords per business so the team does not mix up brands."
        action={
          <Link
            href="/settings"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to settings
          </Link>
        }
      />

      <ClientMessages />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          {businesses.map((business) => {
            const keywords =
              keywordSets.find((set) => set.businessId === business.id)?.keywords ??
              [];

            return (
              <article
                key={business.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="grid size-12 place-items-center rounded-2xl text-sm font-black text-white"
                      style={{ backgroundColor: business.brandColor }}
                    >
                      {business.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                        Client / brand
                      </p>
                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        {business.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {business.serviceArea}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                    {business.phone || "No phone"}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      CTA rule
                    </p>
                    <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                      {business.ctaPhoneRule.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Website
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {business.website || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    AI keywords for this business
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {keywords.length ? (
                      keywords.slice(0, 32).map((keyword) => (
                        <span
                          key={keyword.id}
                          className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                        >
                          {keyword.keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No keywords yet. Add recommended keywords below.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="space-y-6">
          <form
            action={addClientBusinessAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">Add client</h2>
            <div className="mt-5 space-y-4">
              <Field label="Business name">
                <input name="name" required className={inputClassName} />
              </Field>
              <Field label="Phone">
                <input name="phone" className={inputClassName} />
              </Field>
              <Field label="Website">
                <input name="website" type="url" className={inputClassName} />
              </Field>
              <Field label="Service area">
                <textarea
                  name="serviceArea"
                  required
                  rows={3}
                  className={inputClassName}
                />
              </Field>
              <Field label="Tone rules">
                <textarea name="toneRules" rows={3} className={inputClassName} />
              </Field>
              <Field label="Brand color">
                <input
                  name="brandColor"
                  type="color"
                  defaultValue="#2563eb"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-2 py-2"
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Create client
            </button>
          </form>

          <form
            action={addClientKeywordAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Add AI keyword
            </h2>
            <div className="mt-5 space-y-4">
              <Field label="Client">
                <select name="businessId" className={inputClassName}>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Keyword">
                <input
                  name="keyword"
                  required
                  className={inputClassName}
                  placeholder="AC not cooling"
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Add keyword to client
            </button>
          </form>

          <form
            action={addRecommendedKeywordsToClientAction}
            className="rounded-3xl border border-blue-100 bg-signal-sky p-5"
          >
            <h2 className="text-xl font-black text-blue-950">
              Add recommended set
            </h2>
            <Field label="Client">
              <select name="businessId" className={inputClassName}>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              className="mt-4 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-800 ring-1 ring-blue-100"
            >
              Add all recommended keywords
            </button>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Recommended categories
            </p>
            <div className="mt-4 space-y-3">
              {recommendedKeywordGroups.map((group) => (
                <p key={group.category} className="text-sm text-slate-600">
                  <span className="font-bold text-slate-900">
                    {group.category}:
                  </span>{" "}
                  {group.keywords.slice(0, 4).join(", ")}
                </p>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function ClientMessages() {
  return (
    <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
      <p className="font-bold">Client management is active.</p>
      <p className="mt-1">
        If creating a client does not appear immediately, apply the latest
        Supabase migrations for brand colors. The form also falls back to
        creating clients without color until that column exists.
      </p>
    </div>
  );
}
