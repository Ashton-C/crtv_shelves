"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export type UserSettings = {
  isPublic: boolean;
  shareByLink: boolean;
  showShelfCounts: boolean;
};

export async function getUserSettings(): Promise<UserSettings | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) return null;

  return {
    isPublic: user.isPublic,
    shareByLink: user.shareByLink,
    showShelfCounts: user.showShelfCounts,
  };
}

export async function updateSettings(prefs: Partial<UserSettings>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .update(users)
    .set({ ...prefs, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
