import Link from "next/link";
import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { requireAuthContext } from "@/lib/auth";
import {
  listConnectedAccounts,
  listBusinesses,
  listFacebookManualPosts,
  listFacebookReplyHistory,
  listTeamMembers,
} from "@/lib/data";
import { formatDateTime, summarizeText } from "@/lib/format";
import {
  addConnectedAccountAction,
  addTeamMemberAction,
  importManualFacebookPostAction,
} from "./actions";

const platformLabels = {
  facebook: "Facebook",
  nextdoor: "Nextdoor",
  reddit: "Reddit",
  manual: "Manual import",
  other: "Other",
};

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  dispatcher: "Dispatcher",
  technician: "Technician",
};

const statusLabels = {
  not_connected: "Not connected",
  pending_oauth: "OAuth pending",
  connected: "Connected",
  needs_reauth: "Needs reauth",
  error: "Error",
};

export default async function ConnectedAccountsPage() {
  const authContext = await requireAuthContext();
  const [accounts, businesses, teamMembers, manualPosts, replyHistory] = await Promise.all([
    listConnectedAccounts(authContext.businessId),
    listBusinesses(),
    listTeamMembers(authContext.businessId),
    listFacebookManualPosts(authContext.businessId),
    listFacebookReplyHistory(authContext.businessId),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Connected accounts"
        title="Team-owned platform connections."
        description="Facebook connection will use official Meta login/API. Do not enter Facebook passwords here."
        action={
          <Link
            href="/settings"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to settings
          </Link>
        }
      />

      <div className="mb-6 rounded-3xl border border-amber-100 bg-signal-amber p-5">
        <p className="text-sm font-bold text-amber-950">
          Safe Facebook setup
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-950/80">
          LocalSignal will use official Meta OAuth/API when approved. This page
          stores team profiles, public display names, connection status, groups
          or pages, and manual demo reply history only. Never enter or store
          Facebook passwords.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-black text-slate-950">
              Team member accounts
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Each person logs into LocalSignal normally. Their profile can
              include the Facebook display name they use when replying
              manually.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {teamMembers.length ? (
                teamMembers.map((member) => {
                  const memberAccounts = accounts.filter(
                    (account) => account.teamMemberId === member.id,
                  );

                  return (
                    <article
                      key={member.id}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-slate-950">
                            {member.fullName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {member.email}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                          {roleLabels[member.role]}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                        <div>
                          <dt className="font-bold text-slate-900">Phone</dt>
                          <dd>{member.phone ?? "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-900">
                            Facebook display name
                          </dt>
                          <dd>
                            {member.facebookDisplayName ?? "Not provided"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-900">
                            Platform accounts
                          </dt>
                          <dd>
                            {memberAccounts.length
                              ? memberAccounts
                                  .map((account) => account.displayName)
                                  .join(", ")
                              : "None yet"}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                  Add a team member profile before tracking manual Facebook
                  replies.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                  Platform accounts
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Facebook placeholders by team member
                </h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                Connect Facebook
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {accounts.length ? (
                accounts.map((account) => {
                  const owner = teamMembers.find(
                    (member) => member.id === account.teamMemberId,
                  );

                  return (
                    <article
                      key={account.id}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                            {platformLabels[account.platform] ??
                              account.platform}
                          </p>
                          <h3 className="mt-2 text-lg font-black text-slate-950">
                            {account.displayName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Team member: {owner?.fullName ?? "Unassigned"}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          {statusLabels[account.status]}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                        <div>
                          <dt className="font-bold text-slate-900">
                            External account ID
                          </dt>
                          <dd>{account.externalAccountId ?? "Pending OAuth"}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-900">
                            Last sync
                          </dt>
                          <dd>
                            {account.lastSyncAt
                              ? formatDateTime(account.lastSyncAt)
                              : "Never"}
                          </dd>
                        </div>
                        <div className="md:col-span-2">
                          <dt className="font-bold text-slate-900">
                            Connected groups/pages
                          </dt>
                          <dd>
                            {account.connectedGroups.length
                              ? account.connectedGroups.join(", ")
                              : "None yet"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-900">
                            Allowed clients
                          </dt>
                          <dd>
                            {account.allowedBusinessIds.length
                              ? account.allowedBusinessIds
                                  .map(
                                    (id) =>
                                      businesses.find((business) => business.id === id)
                                        ?.name ?? id,
                                  )
                                  .join(", ")
                              : "All assigned clients"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-slate-900">
                            Reply style
                          </dt>
                          <dd className="capitalize">{account.replyStyle}</dd>
                        </div>
                      </dl>
                      <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
                        {account.notes ??
                          "Waiting for official Meta OAuth/API approval before automated sync."}
                      </p>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                  No connected account placeholders yet. Use Connect Facebook to
                  document the account owner, display name, groups/pages, and
                  reauth status.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
              Manual Facebook demo mode
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              Imported posts and reply history
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use this while Meta app approval is pending. LocalSignal can store
              pasted post/comment data, generate an AI suggestion, track who
              responded, and prevent duplicate replies for the same post and
              team member.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {manualPosts.length ? (
                manualPosts.map((post) => {
                  const replies = replyHistory.filter(
                    (reply) => reply.manualPostId === post.id,
                  );

                  return (
                    <article
                      key={post.id}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <p className="text-sm font-bold text-slate-950">
                        {post.authorName ?? "Unknown Facebook poster"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {summarizeText(post.postText, 140)}
                      </p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        {post.commentCount} comments at import
                      </p>
                      <div className="mt-4 space-y-3">
                        {replies.length ? (
                          replies.map((reply) => {
                            const responder = teamMembers.find(
                              (member) => member.id === reply.teamMemberId,
                            );

                            return (
                              <div
                                key={reply.id}
                                className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600"
                              >
                                <p className="font-bold text-slate-900">
                                  {responder?.fullName ?? "Unknown responder"}{" "}
                                  responded {reply.commentsAgo} comments ago
                                </p>
                                <p className="mt-2">
                                  {summarizeText(reply.responseText, 160)}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">
                            No tracked replies yet.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
                  No manual Facebook imports yet.
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <form
            action={addTeamMemberAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Add team member
            </h2>
            <div className="mt-5 space-y-4">
              <Field label="Name">
                <input name="fullName" required className={inputClassName} />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  className={inputClassName}
                />
              </Field>
              <Field label="Role">
                <select name="role" className={inputClassName}>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Phone">
                <input name="phone" className={inputClassName} />
              </Field>
              <Field label="Facebook display name" hint="Optional">
                <input name="facebookDisplayName" className={inputClassName} />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Save team member
            </button>
          </form>

          <form
            action={addConnectedAccountAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Connect Facebook
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is a safe placeholder for official Meta OAuth. It does not
              ask for or store Facebook passwords.
            </p>
            <div className="mt-5 space-y-4">
              <input type="hidden" name="platform" value="facebook" />
              <Field label="Team member">
                <select name="teamMemberId" className={inputClassName}>
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select name="status" className={inputClassName}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Facebook display name">
                <input
                  name="displayName"
                  required
                  className={inputClassName}
                  placeholder="Avery Chen"
                />
              </Field>
              <Field label="External account ID" hint="Optional OAuth field">
                <input
                  name="externalAccountId"
                  className={inputClassName}
                  placeholder="Meta account/page ID after OAuth"
                />
              </Field>
              <Field label="Connected groups/pages">
                <textarea
                  name="connectedGroups"
                  rows={3}
                  className={inputClassName}
                  placeholder="One group or page per line"
                />
              </Field>
              <Field label="Allowed clients/brands">
                <select
                  name="allowedBusinessIds"
                  multiple
                  className={inputClassName}
                  defaultValue={[authContext.businessId ?? ""]}
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Allowed groups/pages">
                <textarea
                  name="allowedGroups"
                  rows={3}
                  className={inputClassName}
                  placeholder="Groups/pages this account may reply in"
                />
              </Field>
              <Field label="Reply style">
                <select name="replyStyle" className={inputClassName}>
                  <option value="company">Company</option>
                  <option value="personal">Personal</option>
                  <option value="both">Both</option>
                </select>
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

          <form
            action={importManualFacebookPostAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Manual Facebook import
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Paste a post or comment thread while official API access is
              pending. Duplicate replies are blocked for the same post and team
              member.
            </p>
            <div className="mt-5 space-y-4">
              <Field label="Responder">
                <select name="teamMemberId" required className={inputClassName}>
                  <option value="">Select team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Facebook post ID" hint="Preferred for dedupe">
                <input name="externalPostId" className={inputClassName} />
              </Field>
              <Field label="Facebook post URL">
                <input name="postUrl" type="url" className={inputClassName} />
              </Field>
              <Field label="Poster name">
                <input name="authorName" className={inputClassName} />
              </Field>
              <Field label="Post/comment text">
                <textarea
                  name="postText"
                  required
                  rows={6}
                  className={inputClassName}
                  placeholder="Paste the Facebook post or comment data here."
                />
              </Field>
              <Field label="Comment count at import">
                <input
                  name="commentCount"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={inputClassName}
                />
              </Field>
              <Field label="Comments ago responder replied">
                <input
                  name="commentsAgo"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={inputClassName}
                />
              </Field>
              <Field label="Actual/manual response" hint="Optional">
                <textarea
                  name="manualResponse"
                  rows={4}
                  className={inputClassName}
                  placeholder="Leave blank to use the AI suggestion."
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={!teamMembers.length}
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Import and draft reply
            </button>
          </form>

          <div className="rounded-3xl border border-blue-100 bg-signal-sky p-5">
            <p className="text-sm font-bold text-blue-950">OAuth next step</p>
            <p className="mt-3 text-sm leading-6 text-blue-950/80">
              Production integrations should redirect to each platform&apos;s
              official OAuth flow, store encrypted access tokens server-side,
              keep refresh/expiry/scopes server-only, and respect Meta platform
              rate limits and posting policies.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
