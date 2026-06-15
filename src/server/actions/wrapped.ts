"use server";

import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { shelfItems, shelves } from "~/server/db/schema";

export async function getWrappedStats() {
  const { userId } = await auth();
  if (!userId) return null;

  const userShelves = await db.query.shelves.findMany({
    where: eq(shelves.userId, userId),
    orderBy: [desc(shelves.shareCount), desc(shelves.createdAt)],
    with: { items: { orderBy: [asc(shelfItems.rank)] } },
  });

  if (userShelves.length === 0) return null;

  const totalShelves = userShelves.length;
  const totalItems = userShelves.reduce((acc, s) => acc + s.items.length, 0);

  const categoryCounts: Record<string, number> = {};
  for (const s of userShelves) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
  }

  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const mostSharedShelf = userShelves[0] ?? null;

  // Rank-1 item from each shelf, ordered by shelf shareCount
  const topItems = userShelves
    .map((s) => ({ item: s.items[0] ?? null, shelfName: s.name }))
    .filter((x): x is { item: NonNullable<typeof x.item>; shelfName: string } =>
      x.item !== null,
    )
    .slice(0, 5);

  return {
    totalShelves,
    totalItems,
    topCategory,
    mostSharedShelf,
    topItems,
    categoryCounts,
  };
}
