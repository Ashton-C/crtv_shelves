import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { MOCK_USER } from "~/lib/mock-data";
import { getUserShelves } from "~/server/actions/shelves";
import { ShelfCard } from "./shelf-card";

export async function ProfileFeed() {
  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;

  const dbShelves = userId ? await getUserShelves() : [];

  const displayName =
    clerkUser?.username ??
    clerkUser?.firstName ??
    MOCK_USER.name;

  const displayHandle = clerkUser?.username
    ? `@${clerkUser.username}`
    : MOCK_USER.handle;

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] text-sm font-bold text-white"
          style={{
            background: `linear-gradient(135deg, ${MOCK_USER.avatarColor}, ${MOCK_USER.avatarColor}99)`,
          }}
        >
          {initials}
        </div>
        <div>
          <div className="text-[14px] font-bold text-text">{displayName}</div>
          <div className="text-[12px] text-muted">{displayHandle}</div>
        </div>
      </div>

      {/* Shelf grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {dbShelves.length > 0
          ? dbShelves.map((shelf) => {
              // Map DB shelf to the shape ShelfCard expects
              const shelfForCard = {
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
              return (
                <Link key={shelf.id} href={`/dashboard/view_shelf/${shelf.slug}`}>
                  <ShelfCard shelf={shelfForCard} />
                </Link>
              );
            })
          : null}
        <Link href="/dashboard/create_shelf">
          <div className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-border opacity-50 transition-opacity hover:opacity-80">
            <FiPlus size={20} className="text-muted" />
            <span className="text-[12px] text-muted">new shelf</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
