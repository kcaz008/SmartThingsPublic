import Link from "next/link";
import { ReplyVariantOptions } from "@/components/reply-variant-options";
import { currentBusiness } from "@/lib/sample-data";
import { buildReplyVariants } from "@/lib/reply-variants";

const demoPosts = [
  {
    title: "Hot emergency lead",
    source: "Garden City Moms & Neighbors",
    town: "Garden City",
    serviceType: "HVAC Repair",
    urgency: "high",
    post:
      "Anyone know an AC company that can come tonight? Upstairs is 84 and we have a newborn. Please no spam, just someone reliable.",
    scrubbed:
      "High urgency HVAC repair lead in Garden City. Parent needs same-night AC help and is sensitive to spammy public comments.",
    recommendation: "DM-first or soft public reply. Avoid sounding promotional.",
  },
  {
    title: "Second opinion quote",
    source: "Massapequa Community Forum",
    town: "Massapequa",
    serviceType: "HVAC Estimate",
    urgency: "medium",
    post:
      "Got a huge quote to replace our central air. Has anyone gotten a fair second opinion around Massapequa before spending this much?",
    scrubbed:
      "Warm replacement/estimate lead. Homeowner is price-sensitive and wants a trustworthy second opinion.",
    recommendation: "Helpful public reply with no pressure. Mention review/inspection, not a hard sell.",
  },
  {
    title: "Promo-sensitive thread",
    source: "Huntington Homeowners",
    town: "Huntington",
    serviceType: "HVAC Service",
    urgency: "medium",
    post:
      "Last time I asked this, 10 companies jumped in. Please only reply if you are a neighbor with real advice. AC is freezing over again.",
    scrubbed:
      "Medium urgency AC freezing lead. Thread explicitly dislikes company pile-ons.",
    recommendation: "Do not post a company ad. Use DM option or very soft personal guidance.",
  },
  {
    title: "Phone already posted",
    source: "Long Island Homeowners",
    town: "Smithtown",
    serviceType: "HVAC Repair",
    urgency: "high",
    post:
      "Someone already posted Atlantic's number, (516) 777-0242. Before I call, any idea why my condenser keeps shutting off?",
    scrubbed:
      "Hot troubleshooting lead. Phone number was already posted, so the next reply should not repeat it.",
    recommendation: "Give a helpful diagnostic clue. Avoid repeating the phone number.",
    phoneSafeInPublic: false,
  },
];

export default function ExamplePostsDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-signal-blue">
              Public demo
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Fake local posts with AI reply choices.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Use these sample Facebook-style HVAC leads to show how the app
              turns noisy posts into action items and gives the team multiple
              reply options.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo/scrubbed-lead"
              className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Scrubbed lead demo
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Login
            </Link>
          </div>
        </div>

        <section className="space-y-8">
          {demoPosts.map((post) => (
            <article
              key={post.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
                <aside>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                    {post.source}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    {post.title}
                  </h2>
                  <p className="mt-3 rounded-3xl bg-slate-50 p-5 text-base leading-7 text-slate-800">
                    {post.post}
                  </p>

                  <div className="mt-5 rounded-3xl bg-emerald-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Scrubbed/actionable
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {post.scrubbed}
                    </p>
                  </div>

                  <div className="mt-4 rounded-3xl bg-amber-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                      Recommendation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      {post.recommendation}
                    </p>
                  </div>
                </aside>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                    Choose a reply
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">
                    4 AI options: company, personal, second responder, or DM.
                  </h3>
                  <ReplyVariantOptions
                    variants={buildReplyVariants({
                      companyName: currentBusiness.name,
                      phone: currentBusiness.phone,
                      serviceType: post.serviceType,
                      urgency: post.urgency,
                      town: post.town,
                      secondResponderName: "Account owner",
                      ctaPhoneRule: currentBusiness.ctaPhoneRule,
                      phoneSafeInPublic: post.phoneSafeInPublic ?? true,
                    })}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
