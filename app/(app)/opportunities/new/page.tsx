import { OpportunityIntakeForm } from "@/components/opportunity-intake-form";
import { PageHeader } from "@/components/page-header";
import { currentBusiness, sources } from "@/lib/sample-data";
import { formatAutopilotMode } from "@/lib/format";

export default function AddOpportunityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Manual intake"
        title="Add a neighborhood opportunity."
        description="Paste a community post, note where it came from, and let the AI placeholder classify intent and prepare a reply draft for human review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <OpportunityIntakeForm sources={sources} />

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Autopilot mode
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              {formatAutopilotMode(currentBusiness.autopilotMode)}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Draft-only autopilot means LocalSignal creates a suggested reply
              after entry. A human still reviews, copies, and posts manually.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-signal-sky p-5">
            <p className="text-sm font-bold text-blue-950">Reply guardrails</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-blue-950/80">
              <li>Include one practical HVAC detail.</li>
              <li>Disclose the business name naturally.</li>
              <li>Use a low-pressure contact prompt.</li>
              <li>Never claim automatic monitoring or posting.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
