import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "~/components/badge";
import { getWrappedStats } from "~/server/actions/wrapped";

export default async function WrappedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const stats = await getWrappedStats();

  if (!stats) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-8">
        <p className="text-[14px] text-muted">nothing to wrap yet</p>
        <Link
          href="/dashboard/create_shelf"
          className="rounded-[12px] bg-accent px-4 py-2 text-[13px] font-bold text-white"
        >
          create your first shelf →
        </Link>
      </div>
    );
  }

  const { totalShelves, totalItems, topCategory, mostSharedShelf, topItems, categoryCounts } =
    stats;

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">wrapped</h1>
        <p className="text-[11px] text-muted">your taste, all-time</p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* Big stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-[18px] bg-surface p-5">
            <p className="text-[42px] font-black leading-none text-accent">{totalShelves}</p>
            <p className="text-[12px] font-medium text-muted">shelves created</p>
          </div>
          <div className="flex flex-col gap-1 rounded-[18px] bg-surface p-5">
            <p className="text-[42px] font-black leading-none text-accent">{totalItems}</p>
            <p className="text-[12px] font-medium text-muted">items curated</p>
          </div>
        </div>

        {/* Top category */}
        {topCategory && (
          <div className="rounded-[18px] bg-surface p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">
              your main vibe
            </p>
            <Badge label={topCategory} accent />
            <p className="mt-2 text-[12px] text-muted">
              {categoryCounts[topCategory]}{" "}
              {(categoryCounts[topCategory] ?? 0) === 1 ? "shelf" : "shelves"}
            </p>
          </div>
        )}

        {/* Most shared */}
        {mostSharedShelf && mostSharedShelf.shareCount > 0 && (
          <div className="rounded-[18px] bg-surface p-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted">
              most shared
            </p>
            <Link href={`/dashboard/view_shelf/${mostSharedShelf.slug}`}>
              <p className="text-[20px] font-black italic tracking-tight text-text transition-colors hover:text-accent">
                {mostSharedShelf.name}
              </p>
            </Link>
            <p className="mt-1 text-[12px] text-muted">
              {mostSharedShelf.shareCount} share{mostSharedShelf.shareCount !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Top #1 picks */}
        {topItems.length > 0 && (
          <div className="rounded-[18px] bg-surface p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">
              your #1 picks
            </p>
            <div className="flex flex-col gap-3">
              {topItems.map(({ item, shelfName }, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span
                    className="w-5 flex-shrink-0 text-right text-[13px] font-black"
                    style={{ color: i === 0 ? "#FF5F00" : "#7A7775" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-text">{item.name}</p>
                    <p className="truncate text-[11px] text-muted">
                      {item.sub ? `${item.sub} · ` : ""}
                      <span className="italic">{shelfName}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {Object.keys(categoryCounts).length > 1 && (
          <div className="rounded-[18px] bg-surface p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted">
              breakdown
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <Badge label={cat} />
                    <span className="text-[12px] font-bold text-muted">
                      {count} {count === 1 ? "shelf" : "shelves"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Profile link */}
        <Link
          href="/dashboard"
          className="mt-1 rounded-[18px] border border-border bg-surface py-4 text-center text-[14px] font-bold text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          view my profile
        </Link>
      </div>
    </div>
  );
}
