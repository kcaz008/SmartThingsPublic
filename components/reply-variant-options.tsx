"use client";

import { useState } from "react";
import type { ReplyVariant } from "@/lib/reply-variants";

export function ReplyVariantOptions({
  variants,
}: {
  variants: ReplyVariant[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {variants.map((variant) => (
        <ReplyVariantCard
          key={variant.id}
          variant={variant}
          selected={selectedId === variant.id}
          onSelected={() => setSelectedId(variant.id)}
        />
      ))}
    </div>
  );
}

function ReplyVariantCard({
  variant,
  selected,
  onSelected,
}: {
  variant: ReplyVariant;
  selected: boolean;
  onSelected: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [rewriteCount, setRewriteCount] = useState(0);
  const displayedReply = rewriteReply(variant.reply, rewriteCount);

  async function useReply() {
    await navigator.clipboard.writeText(displayedReply);
    onSelected();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  function recreateAi() {
    setRewriteCount((current) => current + 1);
    setCopied(false);
  }

  return (
    <article
      className={`rounded-3xl border p-5 transition ${
        selected
          ? "border-emerald-300 bg-emerald-50"
          : "border-blue-100 bg-blue-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-black text-blue-950">
          {variant.personality}
        </p>
        {selected ? (
          <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
            Selected
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs font-semibold leading-5 text-blue-900/70">
        {variant.description}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-800">{displayedReply}</p>
      <button
        type="button"
        onClick={useReply}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold shadow-lg transition ${
          selected
            ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
            : "bg-signal-blue text-white shadow-blue-500/20 hover:bg-blue-700"
        }`}
      >
        {copied ? "Copied - paste it now" : "Use this reply"}
      </button>
      <button
        type="button"
        onClick={recreateAi}
        className="mt-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-signal-blue ring-1 ring-blue-100 transition hover:bg-blue-50"
      >
        Recreate AI
      </button>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        One click copies this option so you can paste it into Facebook or DM.
      </p>
    </article>
  );
}

function rewriteReply(reply: string, count: number) {
  if (count === 0) {
    return reply;
  }

  const rewrites = [
    reply.replace(/^Sorry you are dealing with that/, "That sounds frustrating"),
    reply.replace(/Happy to help/g, "I can help").replace(/if you still need someone/gi, "if useful"),
    reply.replace(/A quick check/g, "The first thing I would check").replace(/Call or text/g, "You can call or text"),
  ];

  return rewrites[(count - 1) % rewrites.length] ?? reply;
}
