import { notFound } from "next/navigation";
import { getShelfBySlug } from "~/server/actions/shelves";
import ShelfViewClient from "./shelf-view-client";

export default async function ShelfViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shelf = await getShelfBySlug(slug);

  if (!shelf) notFound();

  return (
    <ShelfViewClient
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
          init: item.initials ?? item.name.slice(0, 2).toUpperCase(),
          img: item.imageUrl ?? "",
          rank: item.rank,
        })),
      }}
    />
  );
}
