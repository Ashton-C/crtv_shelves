import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CollageTile } from "~/components/item-thumb";
import { getFriendActivity } from "~/server/actions/activity";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const activity = await getFriendActivity();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-[15px] font-bold tracking-tight text-text">activity</h1>
      </div>

      {activity.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
          <p className="text-[13px] text-muted">no activity yet</p>
          <p className="text-[12px] text-muted/60">
            add friends to see what they&apos;re curating
          </p>
          <Link
            href="/dashboard/manage_friends"
            className="mt-2 rounded-[12px] bg-accent px-4 py-2 text-[13px] font-bold text-white"
          >
            find friends →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {activity.map(({ shelf, user }) => {
            if (!user) return null;
            const preview = shelf.items.slice(0, 4);
            const empty = Math.max(0, 4 - preview.length);

            return (
              <Link
                key={shelf.id}
                href={`/dashboard/view_shelf/${shelf.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
              >
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[12px] font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                  }}
                >
                  {user.avatarInitials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-text">
                    <span className="font-bold">{user.username}</span>
                    {" added "}
                    <span className="font-bold italic">{shelf.name}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {shelf.category} · {timeAgo(shelf.createdAt)}
                  </p>
                </div>

                {/* Mini collage */}
                <div className="grid h-10 w-10 flex-shrink-0 grid-cols-2 gap-[2px] overflow-hidden rounded-[10px]">
                  {preview.map((item) => (
                    <CollageTile
                      key={item.id}
                      item={{
                        id: item.id,
                        name: item.name,
                        sub: item.sub ?? "",
                        c1: item.colorFrom ?? "#1C1B1B",
                        c2: item.colorTo ?? "#131313",
                        init: item.initials ?? item.name.slice(0, 2).toUpperCase(),
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
