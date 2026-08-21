"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { sendFriendRequest } from "~/server/actions/friends";

export default function AddFriendInput() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!handle.trim()) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await sendFriendRequest(handle.trim());
        setFeedback({
          kind: "ok",
          message:
            res.result === "accepted_existing"
              ? "they'd already asked — you're friends!"
              : "request sent",
        });
        setHandle("");
        router.refresh();
      } catch (e) {
        // Surface the real reason ("Already friends", "Request already sent",
        // "User not found") rather than collapsing everything to "not found".
        setFeedback({
          kind: "error",
          message: e instanceof Error ? e.message.toLowerCase() : "failed",
        });
      }
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 rounded-[12px] border border-border bg-surface px-3 py-2.5">
        <FiSearch size={16} className="flex-shrink-0 text-muted" />
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="add by handle..."
          className="flex-1 bg-transparent text-[13px] text-text placeholder-muted/50 outline-none"
        />
        {handle.trim() && (
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="flex h-7 items-center gap-1 rounded-[8px] bg-accent/15 px-2.5 text-[12px] font-semibold text-accent transition-colors disabled:opacity-50"
          >
            <FiUserPlus size={12} />
            {isPending ? "..." : "add"}
          </button>
        )}
      </div>

      {feedback && (
        <p
          className="px-1 text-[12px] font-medium"
          style={{ color: feedback.kind === "ok" ? "#00c864" : "#ef4444" }}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
