import Link from "next/link";
import { ReplyVariantOptions } from "@/components/reply-variant-options";
import {
  currentBusiness,
  opportunities,
  sources,
} from "@/lib/sample-data";
import { buildReplyVariants } from "@/lib/reply-variants";
import { scrubOpportunityForAction } from "@/lib/scrub-lead";

export default function ScrubbedLeadDemoPage() {
  const opportunity =
    opportunities.find((item) => item.id === "opp_scrubbed_demo") ??
    opportunities[0];
  const source = sources.find((item) => item.id === opportunity.sourceId);
  const scrubbedLead = scrubOpportunityForAction(opportunity, source);
  const variants = buildReplyVariants({
    companyName: currentBusiness.name,
    phone: currentBusiness.phone,
    serviceType: opportunity.serviceType,
    urgency: opportunity.urgency,
    town: opportunity.detectedTown,
    secondResponderName: "Maria Lopez",
    ctaPhoneRule: currentBusiness.ctaPhoneRule,
    phoneSafeInPublic: source?.phoneSafeInPublic,
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-signal-blue">
              Public demo
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Scrub a noisy Facebook lead into an action item.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              This demo shows how LocalSignal removes sensitive details,
              summarizes the actionable HVAC lead, then gives 4 one-click AI
              reply options with Recreate AI controls.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to app
          </Link>
          <Link
            href="/demo/example-posts"
            className="inline-flex rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
          >
            See example posts
          </Link>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Raw post
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-800">
                {opportunity.originalText}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                Scrubbed actionable item
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                {scrubbedLead.actionableItem}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {scrubbedLead.whyItMatters}
              </p>
              <div className="mt-5 rounded-3xl bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Cleaned post
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-800">
                  {scrubbedLead.cleanedPost}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {scrubbedLead.removedDetails.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
                  >
                    Removed: {detail}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Choose one AI reply
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                One click copies the option. Recreate AI rewrites that option.
              </h2>
              <ReplyVariantOptions variants={variants} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-blue-100 bg-signal-sky p-5">
              <p className="text-sm font-bold text-blue-950">
                What this demonstrates
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-blue-950/80">
                <li>Personal phone, address, and email are scrubbed.</li>
                <li>The team sees a clean action item first.</li>
                <li>Reply options match different personalities.</li>
                <li>Use this reply copies instantly.</li>
                <li>Recreate AI gives a quick rewrite without extra steps.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                Source
              </p>
              <p className="mt-3 font-black text-slate-950">
                {source?.name ?? "Unknown source"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {opportunity.detectedTown}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
