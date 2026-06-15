"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { FiSearch } from "react-icons/fi";
import { ShelfCard } from "~/components/shelf-card";
import { CATEGORIES } from "~/lib/mock-data";
import { searchShelves } from "~/server/actions/shelves";

type ShelfResult = Awaited<ReturnType<typeof searchShelves>>[number];

const ALL_TABS = [
  { id: "all", label: "All" },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
];

function toCardShape(shelf: ShelfResult) {
  return {
    id: shelf.id,
    name: shelf.name,
    category: shelf.category,
    type: shelf.type,
    size: shelf.size as "podium" | "focus" | "archive",
    shareCount: shelf.shareCount,
    items: shelf.items.map((item) => ({
      id: item.id,
      name: item.name,
      sub: item.sub ?? "",
      c1: item.colorFrom ?? "#1C1B1B",
      c2: item.colorTo ?? "#131313",
      init: item.initials ?? item.name.slice(0, 2).toUpperCase(),
      img: item.imageUrl ?? "",
    })),
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<ShelfResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(
    (q: string, cat: string) => {
      startTransition(async () => {
        const data = await searchShelves(q, cat === "all" ? undefined : cat);
        setResults(data);
        setHasSearched(true);
      });
    },
    [],
  );

  // Debounce query changes
  useEffect(() => {
    const t = setTimeout(() => runSearch(query, category), 300);
    return () => clearTimeout(t);
  }, [query, category, runSearch]);

  // Load trending on mount
  useEffect(() => {
    runSearch("", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      {/* Search bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-bg px-4 pb-3 pt-3">
        <div className="flex items-center gap-2 rounded-[14px] border border-border bg-surface px-3 py-2.5">
          <FiSearch size={16} className="flex-shrink-0 text-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search shelves..."
            className="flex-1 bg-transparent text-[14px] text-text placeholder-muted/50 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[12px] text-muted hover:text-text"
            >
              clear
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className="flex-shrink-0 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                background: category === tab.id ? "#FF5F00" : "#1C1B1B",
                color: category === tab.id ? "#fff" : "#7A7775",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pb-1 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
          {isPending
            ? "searching…"
            : query.trim()
              ? `${results.length} result${results.length !== 1 ? "s" : ""}`
              : "trending"}
        </p>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 p-4 pt-2">
          {results.map((shelf) => (
            <Link
              key={shelf.id}
              href={`/dashboard/view_shelf/${shelf.slug}`}
            >
              <ShelfCard shelf={toCardShape(shelf)} />
            </Link>
          ))}
        </div>
      ) : hasSearched && !isPending ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
          <p className="text-[14px] text-muted">no shelves found</p>
          {query && (
            <p className="text-[12px] text-muted/60">
              try a different search term
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
