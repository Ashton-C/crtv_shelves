"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, inArray, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { jaccardSimilarity } from "~/lib/compatibility";
import { db } from "~/server/db";
import { friendships, shelfItems, shelves, users } from "~/server/db/schema";

/** Normalises "@handle" / "Handle" to the stored form. */
function normaliseHandle(handle: string) {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

export async function sendFriendRequest(handle: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const addressee = await db.query.users.findFirst({
    where: eq(users.handle, normaliseHandle(handle)),
  });
  if (!addressee) throw new Error("User not found");
  if (addressee.id === userId) throw new Error("Cannot add yourself");

  // A relationship may already exist in either direction.
  const existing = await db.query.friendships.findFirst({
    where: or(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, addressee.id),
      ),
      and(
        eq(friendships.requesterId, addressee.id),
        eq(friendships.addresseeId, userId),
      ),
    ),
  });

  if (existing) {
    if (existing.status === "accepted") throw new Error("Already friends");

    // They already asked us — treat this as accepting rather than creating a
    // second, mirrored pending row that neither side could resolve.
    if (existing.requesterId === addressee.id && existing.status === "pending") {
      await db
        .update(friendships)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(friendships.id, existing.id));
      revalidatePath("/dashboard/manage_friends");
      return { result: "accepted_existing" as const };
    }

    if (existing.status === "pending") throw new Error("Request already sent");

    // Previously declined — allow a retry by reopening the same row.
    await db
      .update(friendships)
      .set({
        requesterId: userId,
        addresseeId: addressee.id,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(friendships.id, existing.id));
    revalidatePath("/dashboard/manage_friends");
    return { result: "sent" as const };
  }

  await db
    .insert(friendships)
    .values({
      requesterId: userId,
      addresseeId: addressee.id,
      status: "pending",
    })
    .onConflictDoNothing();

  revalidatePath("/dashboard/manage_friends");
  return { result: "sent" as const };
}

export async function respondToRequest(requestId: number, accept: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Scoped to addresseeId so a user can only answer requests sent TO them.
  const result = await db
    .update(friendships)
    .set({
      status: accept ? "accepted" : "declined",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(friendships.id, requestId),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending"),
      ),
    )
    .returning();

  if (result.length === 0) throw new Error("Request not found");

  revalidatePath("/dashboard/manage_friends");
  revalidatePath("/dashboard/activity");
  return { accepted: accept };
}

export async function removeFriend(friendUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, friendUserId),
        ),
        and(
          eq(friendships.requesterId, friendUserId),
          eq(friendships.addresseeId, userId),
        ),
      ),
    );

  revalidatePath("/dashboard/manage_friends");
}

/** Every accepted friend's user id, in either direction. */
async function getFriendIds(userId: string) {
  const accepted = await db.query.friendships.findMany({
    where: and(
      or(
        eq(friendships.requesterId, userId),
        eq(friendships.addresseeId, userId),
      ),
      eq(friendships.status, "accepted"),
    ),
  });

  return accepted.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId,
  );
}

export async function getFriends() {
  const { userId } = await auth();
  if (!userId) return [];

  const friendIds = await getFriendIds(userId);
  if (friendIds.length === 0) return [];

  // Load our own items ONCE rather than re-querying them per friend.
  const myShelves = await db.query.shelves.findMany({
    where: eq(shelves.userId, userId),
    with: { items: true },
  });
  const myItems = new Set(
    myShelves.flatMap((s) => s.items.map((i) => i.name.toLowerCase())),
  );

  return Promise.all(
    friendIds.map(async (fid) => {
      const [user, topShelf, theirShelves] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, fid) }),
        db.query.shelves.findFirst({
          where: and(eq(shelves.userId, fid), eq(shelves.isPrivate, false)),
          orderBy: [asc(shelves.displayOrder), desc(shelves.createdAt)],
          with: { items: { orderBy: [asc(shelfItems.rank)], limit: 4 } },
        }),
        db.query.shelves.findMany({
          where: and(eq(shelves.userId, fid), eq(shelves.isPrivate, false)),
          with: { items: true },
        }),
      ]);

      const theirItems = new Set(
        theirShelves.flatMap((s) => s.items.map((i) => i.name.toLowerCase())),
      );

      return {
        user,
        topShelf,
        compatibility: jaccardSimilarity(myItems, theirItems),
      };
    }),
  );
}

/** Incoming pending requests, with the requesting user attached. */
export async function getPendingRequests() {
  const { userId } = await auth();
  if (!userId) return [];

  const pending = await db.query.friendships.findMany({
    where: and(
      eq(friendships.addresseeId, userId),
      eq(friendships.status, "pending"),
    ),
    orderBy: [desc(friendships.createdAt)],
  });

  if (pending.length === 0) return [];

  const requesters = await db.query.users.findMany({
    where: inArray(
      users.id,
      pending.map((p) => p.requesterId),
    ),
  });
  const byId = new Map(requesters.map((u) => [u.id, u]));

  return pending
    .map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      user: byId.get(p.requesterId) ?? null,
    }))
    .filter((p): p is { id: number; createdAt: Date; user: NonNullable<typeof p.user> } => p.user !== null);
}

/** Outgoing requests we have sent that are still unanswered. */
export async function getSentRequests() {
  const { userId } = await auth();
  if (!userId) return [];

  const sent = await db.query.friendships.findMany({
    where: and(
      eq(friendships.requesterId, userId),
      eq(friendships.status, "pending"),
      ne(friendships.addresseeId, userId),
    ),
    orderBy: [desc(friendships.createdAt)],
  });

  if (sent.length === 0) return [];

  const addressees = await db.query.users.findMany({
    where: inArray(
      users.id,
      sent.map((s) => s.addresseeId),
    ),
  });
  const byId = new Map(addressees.map((u) => [u.id, u]));

  return sent
    .map((s) => ({ id: s.id, user: byId.get(s.addresseeId) ?? null }))
    .filter((s): s is { id: number; user: NonNullable<typeof s.user> } => s.user !== null);
}
