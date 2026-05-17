import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { autopilotModes } from "@/lib/types";
import { formatAutopilotMode } from "@/lib/format";
import { canManageBusiness, requireAuthContext } from "@/lib/auth";
import { getBusiness, listAuditLogs } from "@/lib/data";
import { updateBusinessSettingsAction } from "./actions";
import Link from "next/link";

export default async function SettingsPage() {
  const authContext = await requireAuthContext();
  const [currentBusiness, auditLogs] = await Promise.all([
    getBusiness(authContext.businessId),
    listAuditLogs(authContext.businessId, 8),
  ]);
  const canEdit = canManageBusiness(authContext.role);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Tune the business profile and AI guardrails."
        description="These settings inform classification, tone, reply generation, and the draft-only autopilot workflow."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <form
          action={updateBusinessSettingsAction}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
        >
          <section>
            <h2 className="text-xl font-black text-slate-950">
              Business profile
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="Business name">
                <input
                  name="name"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.name}
                />
              </Field>
              <Field label="Vertical">
                <input className={inputClassName} defaultValue="HVAC" />
              </Field>
              <Field label="Service area">
                <input
                  name="serviceArea"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.serviceArea}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="phone"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.phone}
                />
              </Field>
              <Field label="Website">
                <input
                  name="website"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.website}
                />
              </Field>
              <Field label="Autopilot mode">
                <select
                  name="autopilotMode"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.autopilotMode}
                >
                  {autopilotModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {formatAutopilotMode(mode)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Posting mode only posts when an official platform connection
                  is active. Without Meta/Facebook OAuth it stays in safe demo
                  mode and creates drafts only.
                </p>
              </Field>
            </div>
          </section>

          <section>
            <Field
              label="Tone rules"
              hint="Used by OpenAI when draft generation is enabled"
            >
              <textarea
                name="toneRules"
                disabled={!canEdit}
                rows={5}
                className={inputClassName}
                defaultValue={currentBusiness.toneRules}
              />
            </Field>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">
              Company knowledge
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AI replies use these details to stay accurate, vary wording, and
              avoid claims you do not want made in public threads.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="Services offered">
                <textarea
                  name="servicesOffered"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.servicesOffered}
                />
              </Field>
              <Field label="Emergency availability">
                <textarea
                  name="emergencyAvailability"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.emergencyAvailability}
                />
              </Field>
              <Field label="Brands serviced">
                <textarea
                  name="brandsServiced"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.brandsServiced}
                />
              </Field>
              <Field label="Financing options">
                <textarea
                  name="financingOptions"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.financingOptions}
                />
              </Field>
              <Field label="Warranty notes">
                <textarea
                  name="warrantyNotes"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.warrantyNotes}
                />
              </Field>
              <Field label="Preferred tone">
                <textarea
                  name="preferredTone"
                  disabled={!canEdit}
                  rows={4}
                  className={inputClassName}
                  defaultValue={currentBusiness.preferredTone}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Phrases to avoid">
                  <textarea
                    name="phrasesToAvoid"
                    disabled={!canEdit}
                    rows={4}
                    className={inputClassName}
                    defaultValue={currentBusiness.phrasesToAvoid}
                  />
                </Field>
              </div>
              <Field label="CTA / phone-number rule">
                <select
                  name="ctaPhoneRule"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.ctaPhoneRule}
                >
                  <option value="always_include_phone">Always include phone</option>
                  <option value="usually_include_phone">Usually include phone</option>
                  <option value="dm_only">Only include phone in DM</option>
                  <option value="never_first_public">
                    Never on first public reply
                  </option>
                  <option value="tracking_number">Use tracking number</option>
                  <option value="employee_phone">Use employee phone</option>
                  <option value="no_cta_if_promo_sensitive">
                    No CTA if promo-sensitive
                  </option>
                </select>
              </Field>
              <Field label="Tracking / preferred phone">
                <input
                  name="trackingPhone"
                  disabled={!canEdit}
                  className={inputClassName}
                  defaultValue={currentBusiness.trackingPhone ?? ""}
                />
              </Field>
              <Field label="Brand color">
                <input
                  name="brandColor"
                  type="color"
                  disabled={!canEdit}
                  defaultValue={currentBusiness.brandColor}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-2 py-2 disabled:opacity-60"
                />
              </Field>
            </div>
          </section>

          <button
            type="submit"
            disabled={!canEdit}
            className="rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
          >
            {canEdit ? "Save settings" : "Owner/admin required"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Signed in user
            </p>
            <h2 className="mt-3 text-xl font-black text-slate-950">
              {authContext.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {authContext.user.email}
            </p>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold capitalize text-slate-700">
              Role: {authContext.role}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Clients & brands
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Add businesses, assign color themes, and manage AI keywords per
              client.
            </p>
            <Link
              href="/settings/clients"
              className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Manage clients
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Connected accounts
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Store safe account status only. Use official OAuth/API flows
              before connecting platforms like Facebook.
            </p>
            <Link
              href="/settings/connected-accounts"
              className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Manage connections
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Reputation memory
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Track which tone works, which replies convert, who closes best,
              and which groups dislike promotional comments.
            </p>
            <Link
              href="/settings/reputation-memory"
              className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Manage memory
            </Link>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Recent audit log
            </p>
            <div className="mt-4 space-y-3">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-900">
                      {log.action}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Actions will appear here after signup, imports, approvals,
                  and setting changes.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
