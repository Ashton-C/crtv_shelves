import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { CollageTile } from "~/components/item-thumb";
import { MOCK_FRIENDS } from "~/lib/mock-data";

export default function ManageFriendsPage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">
          friends
        </h1>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 rounded-[12px] border border-border bg-surface px-3 py-2.5">
          <FiSearch size={16} className="flex-shrink-0 text-muted" />
          <input
            type="text"
            placeholder="search friends..."
            className="flex-1 bg-transparent text-[13px] text-text placeholder-muted/50 outline-none"
          />
        </div>
      </div>

      {/* Friend list */}
      <div className="flex flex-col divide-y divide-border">
        {MOCK_FRIENDS.map((friend) => {
          const preview = friend.topShelf.items.slice(0, 4);
          const empty = Math.max(0, 4 - preview.length);
          return (
            <Link
              key={friend.id}
              href={`/dashboard/view_shelf/${friend.topShelf.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
            >
              {/* Avatar */}
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[15px] text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${friend.color}, ${friend.color}99)`,
                }}
              >
                {friend.initials}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-text">{friend.name}</p>
                <p className="truncate text-[11px] font-medium text-muted">
                  <span className="italic">{friend.topShelf.name}</span>
                  {" · "}
                  {friend.topShelf.type}
                </p>
              </div>

              {/* Mini collage */}
              <div className="grid h-11 w-11 flex-shrink-0 grid-cols-2 gap-[2px] overflow-hidden rounded-[10px]">
                {preview.map((item) => (
                  <CollageTile key={item.id} item={item} />
                ))}
                {Array.from({ length: empty }).map((_, i) => (
                  <div key={i} className="bg-surface-2" />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
