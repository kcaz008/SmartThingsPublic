import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { currentBusiness, currentUser } from "@/lib/sample-data";
import { autopilotModes } from "@/lib/types";
import { formatAutopilotMode } from "@/lib/format";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Tune the business profile and AI guardrails."
        description="These settings inform classification, tone, reply generation, and the draft-only autopilot workflow."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              Business profile
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="Business name">
                <input
                  className={inputClassName}
                  defaultValue={currentBusiness.name}
                />
              </Field>
              <Field label="Vertical">
                <input className={inputClassName} defaultValue="HVAC" />
              </Field>
              <Field label="Service area">
                <input
                  className={inputClassName}
                  defaultValue={currentBusiness.serviceArea}
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputClassName}
                  defaultValue={currentBusiness.phone}
                />
              </Field>
              <Field label="Website">
                <input
                  className={inputClassName}
                  defaultValue={currentBusiness.website}
                />
              </Field>
              <Field label="Autopilot mode">
                <select
                  className={inputClassName}
                  defaultValue={currentBusiness.autopilotMode}
                >
                  {autopilotModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {formatAutopilotMode(mode)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section>
            <Field
              label="Tone rules"
              hint="Used by OpenAI when draft generation is enabled"
            >
              <textarea
                rows={5}
                className={inputClassName}
                defaultValue={currentBusiness.toneRules}
              />
            </Field>
          </section>

          <button
            type="button"
            className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Save settings
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Signed in user
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              {currentUser.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{currentUser.email}</p>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold capitalize text-slate-700">
              Role: {currentUser.role}
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-signal-amber p-5">
            <p className="text-sm font-bold text-amber-950">
              Autopilot promise
            </p>
            <p className="mt-3 text-sm leading-6 text-amber-950/80">
              LocalSignal v1 only creates drafts. It never publishes,
              comments, messages, or posts to community platforms on behalf of
              the business.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
