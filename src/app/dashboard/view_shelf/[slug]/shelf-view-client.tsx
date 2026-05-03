"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiEdit2, FiShare2 } from "react-icons/fi";
import { Badge } from "~/components/badge";
import { ItemThumb } from "~/components/item-thumb";
import type { Shelf } from "~/lib/mock-data";

type ShelfWithRanks = Omit<Shelf, "items"> & {
  slug: string;
  items: (Shelf["items"][number] & { rank: number })[];
};

export default function ShelfViewClient({
  shelf,
  isOwner,
}: {
  shelf: ShelfWithRanks;
  isOwner: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const gradientColor = shelf.items[0]?.c1 ?? "#FF5F00";

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
          </p>
        </div>
      </div>

      {/* Ranked list */}
      <div className="flex flex-col px-4 pb-8">
        {shelf.items.map((item, i) => (
          <div key={item.id} className="relative flex items-center gap-3 py-3">
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
        ))}
      </div>
    </div>
  );
}
