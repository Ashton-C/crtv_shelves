"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiEdit2, FiShare2 } from "react-icons/fi";
import { Badge } from "~/components/badge";
import { ItemThumb } from "~/components/item-thumb";
import type { Shelf } from "~/lib/mock-data";
import { toggleReaction, type ReactionType } from "~/server/actions/reactions";

const REACTION_TYPES: ReactionType[] = ["fire", "skull", "eyes", "check"];
const REACTION_EMOJIS: Record<ReactionType, string> = {
  fire: "🔥",
  skull: "💀",
  eyes: "👀",
  check: "✅",
};

type ReactionMap = Record<number, Record<ReactionType, { count: number; active: boolean }>>;

function buildReactionMap(
  reactions: { shelfItemId: number; userId: string; type: string }[],
  itemIds: number[],
  currentUserId: string | null,
): ReactionMap {
  const map: ReactionMap = {};
  for (const id of itemIds) {
    map[id] = {
      fire: { count: 0, active: false },
      skull: { count: 0, active: false },
      eyes: { count: 0, active: false },
      check: { count: 0, active: false },
    };
  }
  for (const r of reactions) {
    const item = map[r.shelfItemId];
    if (!item) continue;
    const t = r.type as ReactionType;
    if (!(t in item)) continue;
    const entry = item[t];
    if (!entry) continue;
    entry.count++;
    if (r.userId === currentUserId) entry.active = true;
  }
  return map;
}

type ShelfWithRanks = Omit<Shelf, "items"> & {
  slug: string;
  items: (Shelf["items"][number] & { rank: number })[];
};

type Collaborator = {
  id: string;
  handle: string;
  username: string;
  avatarColor: string;
  avatarInitials: string;
};

export default function ShelfViewClient({
  shelf,
  isOwner,
  currentUserId,
  reactions: initialReactions,
  collaborators,
}: {
  shelf: ShelfWithRanks;
  isOwner: boolean;
  currentUserId: string | null;
  reactions: { shelfItemId: number; userId: string; type: string }[];
  collaborators: Collaborator[];
}) {
  const [copied, setCopied] = useState(false);
  const [reactionMap, setReactionMap] = useState<ReactionMap>(() =>
    buildReactionMap(
      initialReactions,
      shelf.items.map((i) => i.id),
      currentUserId,
    ),
  );

  const gradientColor = shelf.items[0]?.c1 ?? "#FF5F00";

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReaction = (itemId: number, type: ReactionType) => {
    if (!currentUserId) return;
    setReactionMap((prev) => {
      const item = prev[itemId];
      if (!item) return prev;
      const entry = item[type];
      if (!entry) return prev;
      return {
        ...prev,
        [itemId]: {
          ...item,
          [type]: {
            count: entry.active ? entry.count - 1 : entry.count + 1,
            active: !entry.active,
          },
        },
      };
    });
    void toggleReaction(itemId, type);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Gradient header */}
      <div
        className="relative px-4 pb-6 pt-12"
        style={{
          background: `linear-gradient(180deg, ${gradientColor}66 0%, ${gradientColor}22 60%, #131313 100%)`,
        }}
      >
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href={`/dashboard/edit_shelf/${shelf.slug}`}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
                style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}
              >
                <FiEdit2 size={16} />
              </Link>
            )}
            <button
              onClick={handleShare}
              className="flex h-9 items-center gap-2 rounded-[10px] px-3 text-[12px] font-semibold text-white transition-colors"
              style={{
                background: copied ? "rgba(255,95,0,0.3)" : "rgba(0,0,0,0.3)",
                backdropFilter: "blur(8px)",
                border: copied ? "1px solid #FF5F00" : "none",
              }}
            >
              <FiShare2 size={14} />
              {copied ? "copied!" : "share"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Badge label={shelf.category} accent />
          <h1 className="text-[28px] font-black italic leading-tight tracking-tight text-text">
            {shelf.name}
          </h1>
          <p className="text-[12px] text-muted">
            {shelf.type} · {shelf.items.length} items · {shelf.shareCount} shares
            {collaborators.length > 0 && (
              <>
                {" · with "}
                {collaborators.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}@{c.handle}
                  </span>
                ))}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Ranked list */}
      <div className="flex flex-col px-4 pb-8">
        {shelf.items.map((item, i) => (
          <div key={item.id}>
            <div className="relative flex items-center gap-3 pt-3">
              <span
                className="pointer-events-none absolute left-0 select-none text-[80px] font-black leading-none"
                style={{ color: "rgba(255,255,255,0.04)" }}
              >
                {i + 1}
              </span>
              <span
                className="w-5 flex-shrink-0 text-right text-[13px] font-black"
                style={{ color: i === 0 ? "#FF5F00" : "#7A7775" }}
              >
                {i + 1}
              </span>
              <ItemThumb item={item} size={52} rank={i + 1} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-text">{item.name}</p>
                <p className="text-[11px] font-medium text-muted">{item.sub}</p>
              </div>
            </div>

            {/* Reactions */}
            <div className="flex gap-1.5 py-2 pl-8">
              {REACTION_TYPES.map((type) => {
                const r = reactionMap[item.id]?.[type];
                const count = r?.count ?? 0;
                const active = r?.active ?? false;
                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(item.id, type)}
                    disabled={!currentUserId}
                    className="flex items-center gap-1 rounded-[8px] px-2 py-1 text-[11px] font-semibold transition-all"
                    style={{
                      background: active ? "rgba(255,95,0,0.15)" : "#1C1B1B",
                      color: active ? "#FF5F00" : "#7A7775",
                      border: active
                        ? "1px solid rgba(255,95,0,0.3)"
                        : "1px solid transparent",
                    }}
                  >
                    <span>{REACTION_EMOJIS[type]}</span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
