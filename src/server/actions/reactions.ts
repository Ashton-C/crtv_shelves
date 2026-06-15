"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { shelfItemReactions } from "~/server/db/schema";

export type ReactionType = "fire" | "skull" | "eyes" | "check";

export async function toggleReaction(shelfItemId: number, type: ReactionType) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const existing = await db.query.shelfItemReactions.findFirst({
    where: and(
      eq(shelfItemReactions.shelfItemId, shelfItemId),
      eq(shelfItemReactions.userId, userId),
      eq(shelfItemReactions.type, type),
    ),
  });

  if (existing) {
    await db.delete(shelfItemReactions).where(eq(shelfItemReactions.id, existing.id));
    return { active: false };
  } else {
    await db.insert(shelfItemReactions).values({ shelfItemId, userId, type });
    return { active: true };
  }
}

export async function getReactions(shelfItemIds: number[]) {
  if (shelfItemIds.length === 0) return [];
  return db.query.shelfItemReactions.findMany({
    where: inArray(shelfItemReactions.shelfItemId, shelfItemIds),
  });
}
