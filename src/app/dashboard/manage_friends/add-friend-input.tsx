"use client";

import { useState, useTransition } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { sendFriendRequest } from "~/server/actions/friends";

export default function AddFriendInput() {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!handle.trim()) return;
    startTransition(async () => {
      try {
        await sendFriendRequest(handle.trim());
        setStatus("sent");
        setHandle("");
        setTimeout(() => setStatus("idle"), 2500);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 2500);
      }
    });
  };

  return (
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
          className="flex h-7 items-center gap-1 rounded-[8px] px-2.5 text-[12px] font-semibold transition-colors disabled:opacity-50"
          style={{
            background:
              status === "sent"
                ? "rgba(0,200,100,0.15)"
                : status === "error"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(255,95,0,0.15)",
            color:
              status === "sent"
                ? "#00c864"
                : status === "error"
                  ? "#ef4444"
                  : "#FF5F00",
          }}
        >
          <FiUserPlus size={12} />
          {status === "sent" ? "sent!" : status === "error" ? "not found" : "add"}
        </button>
      )}
    </div>
  );
}
