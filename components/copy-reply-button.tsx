"use client";

import { useState } from "react";

export function CopyReplyButton({
  text,
  replyId,
}: {
  text: string;
  replyId?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyReply() {
    await navigator.clipboard.writeText(text);
    if (replyId) {
      await fetch(`/api/replies/${replyId}/copy`, { method: "POST" });
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copyReply}
      className="rounded-2xl bg-signal-blue px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
    >
      {copied ? "Copied draft" : "Copy reply"}
    </button>
  );
}
