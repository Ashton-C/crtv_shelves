"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiCheck, FiClock, FiX } from "react-icons/fi";
import { respondToRequest } from "~/server/actions/friends";

type RequestUser = {
  id: string;
  username: string;
  handle: string;
  avatarColor: string;
  avatarInitials: string;
};

export default function PendingRequests({
  incoming,
  outgoing,
}: {
  incoming: { id: number; user: RequestUser }[];
  outgoing: { id: number; user: RequestUser }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Hide rows we've answered so the list feels instant, before revalidation lands.
  const [answered, setAnswered] = useState<Set<number>>(new Set());

  const respond = (requestId: number, accept: boolean) => {
    setBusyId(requestId);
    setError(null);
    startTransition(async () => {
      try {
        await respondToRequest(requestId, accept);
        setAnswered((prev) => new Set(prev).add(requestId));
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "something went wrong");
      } finally {
        setBusyId(null);
      }
    });
  };

  const visibleIncoming = incoming.filter((r) => !answered.has(r.id));

  if (visibleIncoming.length === 0 && outgoing.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 px-4 pb-3">
      {visibleIncoming.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            requests
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">
              {visibleIncoming.length}
            </span>
          </p>

          <div className="flex flex-col gap-2">
            {visibleIncoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-3"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[12px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${req.user.avatarColor}, ${req.user.avatarColor}99)`,
                  }}
                >
                  {req.user.avatarInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-text">
                    {req.user.username}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    @{req.user.handle}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => respond(req.id, false)}
                    disabled={isPending && busyId === req.id}
                    aria-label={`Decline request from ${req.user.username}`}
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-2 text-muted transition-colors hover:text-text disabled:opacity-40"
                  >
                    <FiX size={15} />
                  </button>
                  <button
                    onClick={() => respond(req.id, true)}
                    disabled={isPending && busyId === req.id}
                    aria-label={`Accept request from ${req.user.username}`}
                    className="flex h-8 items-center gap-1 rounded-[10px] bg-accent px-3 text-[12px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <FiCheck size={13} />
                    accept
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-2 text-[12px] font-medium text-red-400">{error}</p>
          )}
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
            sent
          </p>
          <div className="flex flex-wrap gap-1.5">
            {outgoing.map((req) => (
              <span
                key={req.id}
                className="flex items-center gap-1.5 rounded-[10px] border border-border bg-surface px-2.5 py-1.5 text-[12px] text-muted"
              >
                <FiClock size={11} />@{req.user.handle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
