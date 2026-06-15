import Link from "next/link";
import { ProfileFeed } from "~/components/profile-feed";
import { ShelfCard } from "~/components/shelf-card";
import { searchShelves } from "~/server/actions/shelves";

export default async function DashboardPage() {
  const trending = await searchShelves("", undefined);

  return (
    <>
      {/* Mobile: full-screen profile feed */}
      <div className="lg:hidden">
        <ProfileFeed />
      </div>

      {/* Desktop: trending discover feed */}
      <div className="hidden flex-col lg:flex">
        <div className="border-b border-border px-5 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
            trending
          </p>
        </div>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 p-4 xl:grid-cols-3">
            {trending.map((shelf) => (
              <Link key={shelf.id} href={`/dashboard/view_shelf/${shelf.slug}`}>
                <ShelfCard
                  shelf={{
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
                      init:
                        item.initials ?? item.name.slice(0, 2).toUpperCase(),
                      img: item.imageUrl ?? "",
                    })),
                  }}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24">
            <p className="text-[14px] text-muted">no public shelves yet</p>
            <Link
              href="/dashboard/create_shelf"
              className="mt-2 rounded-[12px] bg-accent px-4 py-2 text-[13px] font-bold text-white"
            >
              create the first one →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
