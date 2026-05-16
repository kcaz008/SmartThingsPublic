"use client";

import { useState } from "react";
import type { ReplyVariant } from "@/lib/reply-variants";

export function ReplyVariantOptions({
  variants,
}: {
  variants: ReplyVariant[];
}) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {variants.map((variant) => (
        <ReplyVariantCard key={variant.id} variant={variant} />
      ))}
    </div>
  );
}

function ReplyVariantCard({ variant }: { variant: ReplyVariant }) {
  const [copied, setCopied] = useState(false);

  async function reproduceReply() {
    await navigator.clipboard.writeText(variant.reply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
      <p className="text-sm font-black text-blue-950">{variant.personality}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-blue-900/70">
        {variant.description}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-800">{variant.reply}</p>
      <button
        type="button"
        onClick={reproduceReply}
        className="mt-4 rounded-2xl bg-signal-blue px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
      >
        {copied ? "Copied" : "Reproduce"}
      </button>
    </article>
  );
}
