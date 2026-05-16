import { PageHeader } from "@/components/page-header";

const workflow = [
  "Log into Facebook normally in your browser.",
  "Open the Facebook group page you want to review.",
  'Click the LocalSignal extension button: "Scan Current Page."',
  "LocalSignal reads visible post text from that page only.",
  "Relevant HVAC opportunities are returned as manual opportunity cards.",
  "Copy a draft reply or mark each card ignored, replied, booked, or won.",
];

const rules = [
  "No Facebook password storage.",
  "No fake accounts.",
  "No pretending to be a customer.",
  "No automatic posting or comments.",
  "No background scraping.",
  "Only scans after the user clicks the button.",
  "Only analyzes posts visible to the logged-in user.",
];

export default function AutoAssistPage() {
  return (
    <>
      <PageHeader
        eyebrow="Button-activated Auto-Assist"
        title="Scan the current Facebook group page only when you ask."
        description="LocalSignal's browser extension turns visible posts into HVAC opportunity cards for manual follow-up. It never logs into Facebook, stores credentials, scrapes in the background, or posts comments."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-black text-slate-950">
            Manual scan workflow
          </h2>
          <div className="mt-6 space-y-4">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-signal-blue text-sm font-black text-white">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-emerald-100 bg-signal-mint p-5">
            <p className="text-sm font-bold text-emerald-950">
              Extension location
            </p>
            <p className="mt-3 text-sm leading-6 text-emerald-950/80">
              Load the unpacked extension from{" "}
              <code className="rounded bg-white/70 px-1 py-0.5">
                browser-extension
              </code>{" "}
              during MVP testing.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Safety rules
            </p>
            <ul className="mt-4 space-y-3">
              {rules.map((rule) => (
                <li
                  key={rule}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
