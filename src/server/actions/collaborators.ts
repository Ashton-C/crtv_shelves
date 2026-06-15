"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { shelfCollaborators, shelves, users } from "~/server/db/schema";

export async function inviteCollaborator(shelfSlug: string, handle: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, shelfSlug),
  });
  if (shelf?.userId !== userId) throw new Error("Not authorized");

  const invitee = await db.query.users.findFirst({
    where: eq(users.handle, handle.replace(/^@/, "")),
  });
  if (!invitee) throw new Error("User not found");
  if (invitee.id === userId) throw new Error("Cannot invite yourself");

  await db
    .insert(shelfCollaborators)
    .values({ shelfId: shelf.id, userId: invitee.id })
    .onConflictDoNothing();
}

export async function removeCollaborator(shelfSlug: string, collaboratorUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, shelfSlug),
  });
  if (shelf?.userId !== userId) throw new Error("Not authorized");

  await db
    .delete(shelfCollaborators)
    .where(
      and(
        eq(shelfCollaborators.shelfId, shelf.id),
        eq(shelfCollaborators.userId, collaboratorUserId),
      ),
    );
}

export async function getCollaborators(shelfId: number) {
  const collabs = await db.query.shelfCollaborators.findMany({
    where: eq(shelfCollaborators.shelfId, shelfId),
  });
  if (collabs.length === 0) return [];
  const userIds = collabs.map((c) => c.userId);
  return db.query.users.findMany({ where: inArray(users.id, userIds) });
}
