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

async function computeCompatibility(
  userId: string,
  friendId: string,
): Promise<number> {
  const [mine, theirs] = await Promise.all([
    db.query.shelves.findMany({
      where: eq(shelves.userId, userId),
      with: { items: true },
    }),
    db.query.shelves.findMany({
      where: and(eq(shelves.userId, friendId), eq(shelves.isPrivate, false)),
      with: { items: true },
    }),
  ]);

  const myItems = new Set(
    mine.flatMap((s) => s.items.map((i) => i.name.toLowerCase())),
  );
  const theirItems = new Set(
    theirs.flatMap((s) => s.items.map((i) => i.name.toLowerCase())),
  );

  const intersection = [...myItems].filter((i) => theirItems.has(i)).length;
  const union = new Set([...myItems, ...theirItems]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100);
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
      const [user, topShelf, compatibility] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, fid) }),
        db.query.shelves.findFirst({
          where: and(eq(shelves.userId, fid), eq(shelves.isPrivate, false)),
          orderBy: [asc(shelves.displayOrder), desc(shelves.createdAt)],
          with: { items: { orderBy: [asc(shelfItems.rank)], limit: 4 } },
        }),
        computeCompatibility(userId, fid),
      ]);
      return { user, topShelf, compatibility };
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
