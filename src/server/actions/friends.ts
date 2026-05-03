"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { db } from "~/server/db";
import { friendships, shelfItems, shelves, users } from "~/server/db/schema";

export async function sendFriendRequest(handle: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const addressee = await db.query.users.findFirst({
    where: eq(users.handle, handle.replace(/^@/, "")),
  });
  if (!addressee) throw new Error("User not found");
  if (addressee.id === userId) throw new Error("Cannot add yourself");

  await db
    .insert(friendships)
    .values({ requesterId: userId, addresseeId: addressee.id, status: "pending" })
    .onConflictDoNothing();
}

export async function respondToRequest(requestId: number, accept: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .update(friendships)
    .set({ status: accept ? "accepted" : "declined", updatedAt: new Date() })
    .where(and(eq(friendships.id, requestId), eq(friendships.addresseeId, userId)));
}

export async function getFriends() {
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

  return Promise.all(
    friendIds.map(async (fid) => {
      const user = await db.query.users.findFirst({ where: eq(users.id, fid) });
      const topShelf = await db.query.shelves.findFirst({
        where: and(eq(shelves.userId, fid), eq(shelves.isPrivate, false)),
        orderBy: [asc(shelves.displayOrder), desc(shelves.createdAt)],
        with: { items: { orderBy: [asc(shelfItems.rank)], limit: 4 } },
      });
      return { user, topShelf };
    }),
  );
}

export async function getPendingRequests() {
  const { userId } = await auth();
  if (!userId) return [];

  return db.query.friendships.findMany({
    where: and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, "pending"),
    ),
  });
}
