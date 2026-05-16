import Link from "next/link";
import { Field, inputClassName } from "@/components/form-controls";
import { PageHeader } from "@/components/page-header";
import { requireAuthContext } from "@/lib/auth";
import {
  listReputationMemories,
  listSources,
  listTeamMembers,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { addReputationMemoryAction } from "./actions";

const memoryTypeLabels = {
  tone_works: "Tone that works",
  reply_converts: "Replies that convert",
  employee_closes: "Employee closes best",
  group_dislikes_promo: "Groups dislike promo",
};

const memoryTypeHelp = {
  tone_works: "Which wording style earns positive replies.",
  reply_converts: "Specific reply patterns that become booked or won work.",
  employee_closes: "Which team members tend to close certain opportunities.",
  group_dislikes_promo:
    "Groups or pages where promotional comments hurt performance.",
};

export default async function ReputationMemoryPage() {
  const authContext = await requireAuthContext();
  const [memories, sources, teamMembers] = await Promise.all([
    listReputationMemories(authContext.businessId),
    listSources(authContext.businessId),
    listTeamMembers(authContext.businessId),
  ]);

  const activeMemories = memories.filter((memory) => memory.active);

  return (
    <>
      <PageHeader
        eyebrow="Reputation memory"
        title="Teach AI what works in each neighborhood."
        description="Store practical memory about tone, converting replies, team strengths, and groups that dislike promotional comments. Active memories are included in AI drafting guidance."
        action={
          <Link
            href="/settings"
            className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Back to settings
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <MemoryStat label="Active memories" value={String(activeMemories.length)} />
        <MemoryStat
          label="Tone notes"
          value={String(
            activeMemories.filter((memory) => memory.memoryType === "tone_works")
              .length,
          )}
        />
        <MemoryStat
          label="Conversion notes"
          value={String(
            activeMemories.filter(
              (memory) => memory.memoryType === "reply_converts",
            ).length,
          )}
        />
        <MemoryStat
          label="Promo-sensitive groups"
          value={String(
            activeMemories.filter(
              (memory) => memory.memoryType === "group_dislikes_promo",
            ).length,
          )}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          {memories.length ? (
            memories.map((memory) => {
              const source = sources.find(
                (candidate) => candidate.id === memory.sourceId,
              );
              const teamMember = teamMembers.find(
                (candidate) => candidate.id === memory.teamMemberId,
              );

              return (
                <article
                  key={memory.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                        {memoryTypeLabels[memory.memoryType]}
                      </p>
                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        {memory.subject}
                      </h2>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      Score {memory.score}
                    </span>
                  </div>
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {memory.content}
                  </p>
                  <dl className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <dt className="font-bold text-slate-900">Evidence</dt>
                      <dd>{memory.evidenceCount} observations</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-900">Source/group</dt>
                      <dd>{source?.name ?? "Any source"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-slate-900">Team member</dt>
                      <dd>{teamMember?.fullName ?? "Any team member"}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs font-semibold text-slate-400">
                    Updated {formatDateTime(memory.updatedAt)}
                  </p>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600">
              No reputation memory yet. Add notes as you learn which replies,
              employees, and groups perform best.
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <form
            action={addReputationMemoryAction}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft"
          >
            <h2 className="text-xl font-black text-slate-950">
              Add memory
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep memories factual and evidence-based. These notes guide draft
              tone; they do not auto-post.
            </p>
            <div className="mt-5 space-y-4">
              <Field label="Memory type">
                <select name="memoryType" className={inputClassName}>
                  {Object.entries(memoryTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                {Object.entries(memoryTypeHelp).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold">
                      {memoryTypeLabels[key as keyof typeof memoryTypeLabels]}:
                    </span>{" "}
                    {value}
                  </p>
                ))}
              </div>
              <Field label="Subject">
                <input
                  name="subject"
                  required
                  className={inputClassName}
                  placeholder="Webster Groves Community"
                />
              </Field>
              <Field label="Memory detail">
                <textarea
                  name="content"
                  required
                  rows={5}
                  className={inputClassName}
                  placeholder="This group responds better to practical troubleshooting details than promotional comments."
                />
              </Field>
              <Field label="Source/group" hint="Optional">
                <select name="sourceId" className={inputClassName}>
                  <option value="">Any source</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Team member" hint="Optional">
                <select name="teamMemberId" className={inputClassName}>
                  <option value="">Any team member</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Confidence score">
                <input
                  name="score"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={70}
                  className={inputClassName}
                />
              </Field>
              <Field label="Evidence count">
                <input
                  name="evidenceCount"
                  type="number"
                  min={0}
                  defaultValue={1}
                  className={inputClassName}
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-5 rounded-2xl bg-signal-blue px-5 py-3 text-sm font-bold text-white"
            >
              Save memory
            </button>
          </form>

          <div className="rounded-3xl border border-blue-100 bg-signal-sky p-5">
            <p className="text-sm font-bold text-blue-950">
              How AI uses memory
            </p>
            <p className="mt-3 text-sm leading-6 text-blue-950/80">
              Active memories are appended to the AI tone rules during manual
              intake and Facebook demo imports, so suggestions can avoid
              spammy phrasing and lean into patterns that have converted.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function MemoryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
