"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "~/server/db";
import { friendships, shelfItems, shelves, users } from "~/server/db/schema";

export async function getFriendActivity() {
  const { userId } = await auth();
  if (!userId) return [];

  const accepted = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, "accepted"),
    ),
  });

  const friendIds = accepted.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );
  if (friendIds.length === 0) return [];

  const recentShelves = await db.query.shelves.findMany({
    where: and(inArray(shelves.userId, friendIds), eq(shelves.isPrivate, false)),
    orderBy: [desc(shelves.createdAt)],
    limit: 30,
    with: { items: { orderBy: [asc(shelfItems.rank)], limit: 4 } },
  });

  const uniqueUserIds = [...new Set(recentShelves.map((s) => s.userId))];
  if (uniqueUserIds.length === 0) return [];

  const shelfUsers = await db.query.users.findMany({
    where: inArray(users.id, uniqueUserIds),
  });
  const userMap = Object.fromEntries(shelfUsers.map((u) => [u.id, u]));

  return recentShelves.map((shelf) => ({
    shelf,
    user: userMap[shelf.userId] ?? null,
  }));
}
