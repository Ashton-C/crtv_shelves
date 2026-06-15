"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import {
  ALL_ITEMS,
  ITEM_POOL_BY_CATEGORY,
} from "~/lib/mock-data";

export function ItemSearchModal({
  category,
  slotIndex,
  onAdd,
  onClose,
}: {
  category: string;
  slotIndex: number;
  onAdd: (item: { name: string; sub: string }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const pool = ITEM_POOL_BY_CATEGORY[category] ?? ALL_ITEMS;
  const results = query.trim()
    ? pool.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.sub.toLowerCase().includes(query.toLowerCase()),
      )
    : pool.slice(0, 12);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="flex max-h-[75vh] flex-col rounded-t-[24px] bg-bg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-[15px] font-bold text-text">
            #{slotIndex + 1} — add item
          </p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-3 py-2.5">
            <FiSearch size={15} className="flex-shrink-0 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search or type a name..."
              className="flex-1 bg-transparent text-[14px] text-text placeholder-muted/50 outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onAdd({ name: item.name, sub: item.sub });
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition-colors hover:bg-surface"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${item.c1}, ${item.c2})`,
                    }}
                  >
                    {item.init}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[14px] font-bold text-text">
                      {item.name}
                    </p>
                    <p className="truncate text-[11px] text-muted">{item.sub}</p>
                  </div>
                  <FiPlus size={16} className="flex-shrink-0 text-accent" />
                </button>
              ))}
              {query.trim() &&
                !results.some(
                  (r) => r.name.toLowerCase() === query.toLowerCase(),
                ) && (
                  <button
                    onClick={() => {
                      onAdd({ name: query.trim(), sub: "" });
                      onClose();
                    }}
                    className="flex items-center gap-3 rounded-[14px] border border-dashed border-border px-3 py-2.5 transition-colors hover:bg-surface"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-xs font-bold text-muted">
                      +
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-text">
                        &ldquo;{query.trim()}&rdquo;
                      </p>
                      <p className="text-[11px] text-muted">add custom entry</p>
                    </div>
                    <FiPlus size={16} className="flex-shrink-0 text-accent" />
                  </button>
                )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-muted">no results</p>
              {query.trim() && (
                <button
                  onClick={() => {
                    onAdd({ name: query.trim(), sub: "" });
                    onClose();
                  }}
                  className="mt-3 rounded-[12px] bg-accent px-4 py-2 text-[13px] font-bold text-white"
                >
                  add &ldquo;{query.trim()}&rdquo;
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
