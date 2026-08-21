"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { shelfItems, shelves } from "~/server/db/schema";

export type CreateShelfInput = {
  name: string;
  category: string;
  type: string;
  size: string;
  items: { name: string; sub: string; imageUrl?: string | null }[];
  isPrivate?: boolean;
};

export async function createShelf(input: CreateShelfInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const slug = `${input.name.trim().replace(/\s+/g, "-")}-${nanoid(6)}`;

  const [shelf] = await db
    .insert(shelves)
    .values({
      userId,
      name: input.name.trim(),
      category: input.category,
      type: input.type,
      size: input.size,
      slug,
      isPrivate: input.isPrivate ?? false,
    })
    .returning();

  if (!shelf) throw new Error("Failed to create shelf");

  const filledItems = input.items.filter((item) => item.name.trim());
  if (filledItems.length > 0) {
    await db.insert(shelfItems).values(
      filledItems.map((item, i) => ({
        shelfId: shelf.id,
        rank: i + 1,
        name: item.name.trim(),
        sub: item.sub.trim() || null,
        imageUrl: item.imageUrl ?? null,
      })),
    );
  }

  return { slug: shelf.slug };
}

export async function getUserShelves() {
  const { userId } = await auth();
  if (!userId) return [];

  const userShelves = await db.query.shelves.findMany({
    where: eq(shelves.userId, userId),
    orderBy: [asc(shelves.displayOrder), desc(shelves.createdAt)],
    with: {
      items: {
        orderBy: [asc(shelfItems.rank)],
        limit: 4,
      },
    },
  });

  return userShelves;
}

export async function getShelfBySlug(slug: string) {
  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, slug),
    with: {
      items: { orderBy: [asc(shelfItems.rank)] },
      collaborators: true,
    },
  });

  return shelf ?? null;
}

export async function getPublicShelvesByUserId(userId: string) {
  return db.query.shelves.findMany({
    where: and(eq(shelves.userId, userId), eq(shelves.isPrivate, false)),
    orderBy: [asc(shelves.displayOrder), desc(shelves.createdAt)],
    with: {
      items: {
        orderBy: [asc(shelfItems.rank)],
        limit: 4,
      },
    },
  });
}

export async function updateShelf(
  slug: string,
  input: {
    name?: string;
    items?: { name: string; sub: string; imageUrl?: string | null }[];
    isCollaborative?: boolean;
    isPrivate?: boolean;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, slug),
    with: { collaborators: true },
  });

  const isOwner = shelf?.userId === userId;
  const isCollab = shelf?.collaborators.some((c) => c.userId === userId) ?? false;
  if (!shelf || (!isOwner && !isCollab)) throw new Error("Not found");

  const ownerFieldsTouched =
    input.name !== undefined ||
    input.isCollaborative !== undefined ||
    input.isPrivate !== undefined;

  if (isOwner && ownerFieldsTouched) {
    await db
      .update(shelves)
      .set({
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.isCollaborative !== undefined
          ? { isCollaborative: input.isCollaborative }
          : {}),
        ...(input.isPrivate !== undefined
          ? { isPrivate: input.isPrivate }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(shelves.id, shelf.id));
  }

  if (input.items !== undefined) {
    await db.delete(shelfItems).where(eq(shelfItems.shelfId, shelf.id));
    const filled = input.items.filter((i) => i.name.trim());
    if (filled.length > 0) {
      await db.insert(shelfItems).values(
        filled.map((item, i) => ({
          shelfId: shelf.id,
          rank: i + 1,
          name: item.name.trim(),
          sub: item.sub.trim() || null,
          imageUrl: item.imageUrl ?? null,
        })),
      );
    }
  }

  return { slug: shelf.slug };
}

export async function reorderShelves(orderedIds: number[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await Promise.all(
    orderedIds.map((id, i) =>
      db
        .update(shelves)
        .set({ displayOrder: i })
        .where(and(eq(shelves.id, id), eq(shelves.userId, userId))),
    ),
  );
}

export async function searchShelves(query: string, category?: string) {
  const nameFilter = query.trim()
    ? ilike(shelves.name, `%${query.trim()}%`)
    : undefined;
  const categoryFilter =
    category && category !== "all"
      ? ilike(shelves.category, category)
      : undefined;

  return db.query.shelves.findMany({
    where: and(eq(shelves.isPrivate, false), nameFilter, categoryFilter),
    orderBy: [desc(shelves.shareCount), desc(shelves.createdAt)],
    limit: 24,
    with: { items: { orderBy: [asc(shelfItems.rank)], limit: 4 } },
  });
}

export async function deleteShelf(slug: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, slug),
  });
  if (shelf?.userId !== userId) throw new Error("Not found");

  await db.delete(shelfItems).where(eq(shelfItems.shelfId, shelf.id));
  await db.delete(shelves).where(eq(shelves.id, shelf.id));
}
