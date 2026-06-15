import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { ShelfCard } from "~/components/shelf-card";
import { getUserByHandle } from "~/server/actions/users";
import { getPublicShelvesByUserId } from "~/server/actions/shelves";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByHandle(username);
  if (!user) notFound();

  const shelves = await getPublicShelvesByUserId(user.id);

  return (
    <div className="min-h-screen bg-bg">
      {/* Back / nav strip */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-text transition-colors hover:bg-surface-2"
        >
          <FiArrowLeft size={18} />
        </Link>
        <span className="text-[13px] font-bold italic text-muted">
          crtv_shelves
        </span>
      </div>

      {/* Profile hero */}
      <div className="flex flex-col items-center gap-3 px-4 py-8">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-[24px] text-2xl font-black text-white"
          style={{
            background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
          }}
        >
          {user.avatarInitials}
        </div>
        <div className="text-center">
          <h1 className="text-[22px] font-black italic tracking-tight text-text">
            {user.username}
          </h1>
          <p className="text-[13px] text-muted">@{user.handle}</p>
        </div>
        <p className="text-[12px] text-muted">
          {shelves.length} {shelves.length === 1 ? "shelf" : "shelves"}
        </p>
      </div>

      {/* Shelf grid */}
      {shelves.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 px-4 pb-12 sm:grid-cols-3 lg:grid-cols-4">
          {shelves.map((shelf) => (
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
        <div className="py-16 text-center">
          <p className="text-[14px] text-muted">no public shelves yet</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="border-t border-border py-8 text-center">
        <p className="mb-3 text-[13px] text-muted">make your own shelves</p>
        <Link
          href="/signup"
          className="rounded-[14px] bg-accent px-6 py-3 text-[14px] font-bold text-white"
          style={{ boxShadow: "0 4px 20px rgba(255,95,0,0.4)" }}
        >
          join crtv_shelves →
        </Link>
      </div>
    </div>
  );
}
