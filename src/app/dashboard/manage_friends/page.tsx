import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { CollageTile } from "~/components/item-thumb";
import { getFriends } from "~/server/actions/friends";
import AddFriendInput from "./add-friend-input";

export default async function ManageFriendsPage() {
  const { userId } = await auth();
  const friends = userId ? await getFriends() : [];

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">
          friends
        </h1>
      </div>

      {/* Search / add friend */}
      <div className="px-4 py-3">
        <AddFriendInput />
      </div>

      {/* Friend list */}
      {friends.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
          <p className="text-[13px] text-muted">no friends yet</p>
          <p className="text-[12px] text-muted/60">
            search by handle to add someone
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {friends.map(({ user, topShelf, compatibility }) => {
            if (!user) return null;
            const preview = topShelf?.items.slice(0, 4) ?? [];
            const empty = Math.max(0, 4 - preview.length);

            return (
              <Link
                key={user.id}
                href={topShelf ? `/dashboard/view_shelf/${topShelf.slug}` : `/u/${user.handle}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
              >
                {/* Avatar */}
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[15px] text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                  }}
                >
                  {user.avatarInitials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-text">
                    {user.username}
                  </p>
                  <p className="truncate text-[11px] font-medium text-muted">
                    @{user.handle}
                    {topShelf && (
                      <>
                        {" · "}
                        <span className="italic">{topShelf.name}</span>
                      </>
                    )}
                  </p>
                  {compatibility > 0 && (
                    <p className="mt-0.5 text-[10px] font-bold"
                      style={{ color: compatibility >= 50 ? "#FF5F00" : "#7A7775" }}>
                      {compatibility}% taste match
                    </p>
                  )}
                </div>

                {/* Mini collage */}
                <div className="grid h-11 w-11 flex-shrink-0 grid-cols-2 gap-[2px] overflow-hidden rounded-[10px]">
                  {preview.map((item) => (
                    <CollageTile
                      key={item.id}
                      item={{
                        id: item.id,
                        name: item.name,
                        sub: item.sub ?? "",
                        c1: item.colorFrom ?? "#1C1B1B",
                        c2: item.colorTo ?? "#131313",
                        init:
                          item.initials ?? item.name.slice(0, 2).toUpperCase(),
                        img: item.imageUrl ?? "",
                      }}
                    />
                  ))}
                  {Array.from({ length: empty }).map((_, i) => (
                    <div key={i} className="bg-surface-2" />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
