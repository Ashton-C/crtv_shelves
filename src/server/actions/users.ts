"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const AVATAR_COLORS = [
  "#FF5F00", "#7C1C1C", "#1C4A7C", "#1C4A3A",
  "#4E1C7C", "#7C1C4E", "#1C4A4A", "#5A3A1C",
];

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const base = clerkUser.username ?? clerkUser.firstName?.toLowerCase() ?? "user";
  const handle = `${base}${userId.slice(-4)}`.slice(0, 32).replace(/[^a-z0-9_.]/g, "");
  const displayName = clerkUser.firstName ?? clerkUser.username ?? handle;
  const initials = (
    (clerkUser.firstName?.[0] ?? "") + (clerkUser.lastName?.[0] ?? "")
  ).toUpperCase() || handle.slice(0, 2).toUpperCase();

  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] ?? "#FF5F00";

  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      username: displayName.slice(0, 64),
      handle: handle || userId.slice(0, 32),
      avatarColor,
      avatarInitials: initials.slice(0, 2),
    })
    .onConflictDoNothing()
    .returning();

  return user ?? null;
}

export async function getUserByHandle(handle: string) {
  return (
    (await db.query.users.findFirst({
      where: eq(users.handle, handle.replace(/^@/, "")),
    })) ?? null
  );
}
