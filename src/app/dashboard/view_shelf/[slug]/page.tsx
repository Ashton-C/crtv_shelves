import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getCollaborators } from "~/server/actions/collaborators";
import { getReactions } from "~/server/actions/reactions";
import { getShelfBySlug } from "~/server/actions/shelves";
import ShelfViewClient from "./shelf-view-client";

export default async function ShelfViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();
  const { slug } = await params;
  const shelf = await getShelfBySlug(slug);

  if (!shelf) notFound();

  const itemIds = shelf.items.map((i) => i.id);
  const [reactions, collaborators] = await Promise.all([
    getReactions(itemIds),
    getCollaborators(shelf.id),
  ]);

  return (
    <ShelfViewClient
      isOwner={userId === shelf.userId}
      currentUserId={userId ?? null}
      shelf={{
        id: shelf.id,
        slug: shelf.slug,
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
          rank: item.rank,
        })),
      }}
      reactions={reactions.map((r) => ({
        shelfItemId: r.shelfItemId,
        userId: r.userId,
        type: r.type,
      }))}
      collaborators={collaborators.map((u) => ({
        id: u.id,
        handle: u.handle,
        username: u.username,
        avatarColor: u.avatarColor,
        avatarInitials: u.avatarInitials,
      }))}
    />
  );
}
