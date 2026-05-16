import Link from "next/link";
import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { requireAuthContext } from "@/lib/auth";
import { listConnectedAccounts } from "@/lib/data";
import { addConnectedAccountAction } from "./actions";

const providerLabels = {
  facebook_group: "Facebook group",
  nextdoor: "Nextdoor",
  reddit: "Reddit",
  manual: "Manual import",
  other: "Other",
};

export default async function ConnectedAccountsPage() {
  const authContext = await requireAuthContext();
  const accounts = await listConnectedAccounts(authContext.businessId);

  return (
    <>
      <PageHeader
        eyebrow="Connected accounts"
        title="Connect platforms safely."
        description="LocalSignal stores connection status and OAuth placeholders only. Do not enter Facebook, Nextdoor, Reddit, or customer passwords."
        action={
          <Link
            href="/settings"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to settings
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          {accounts.length ? (
            accounts.map((account) => (
              <article
                key={account.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                      {providerLabels[account.provider] ?? account.provider}
                    </p>
                    <h2 className="mt-2 text-xl font-black text-slate-950">
                      {account.displayName}
                    </h2>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold capitalize text-amber-800">
                    {account.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {account.notes ??
                    "Waiting for an official OAuth/API implementation before data collection is enabled."}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600">
              No connected account placeholders yet. Add one to document which
              official integration this client needs.
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <form
            action={addConnectedAccountAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Add connection placeholder
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This does not scrape, post, or store credentials. It records the
              platform account or group that needs an approved integration.
            </p>
            <div className="mt-5 space-y-4">
              <Field label="Provider">
                <select name="provider" className={inputClassName}>
                  {Object.entries(providerLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Display name">
                <input
                  name="displayName"
                  required
                  className={inputClassName}
                  placeholder="Webster Groves Community"
                />
              </Field>
              <Field label="Notes">
                <textarea
                  name="notes"
                  rows={4}
                  className={inputClassName}
                  placeholder="Needs official Graph API OAuth review before import."
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Save placeholder
            </button>
          </form>

          <div className="rounded-3xl border border-blue-100 bg-signal-sky p-5">
            <p className="text-sm font-bold text-blue-950">OAuth next step</p>
            <p className="mt-3 text-sm leading-6 text-blue-950/80">
              Production integrations should redirect to each platform&apos;s
              official OAuth flow, store encrypted access tokens server-side,
              and respect platform rate limits and posting policies.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
