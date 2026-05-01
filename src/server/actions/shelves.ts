"use server";

import { auth } from "@clerk/nextjs/server";
import { asc, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { shelfItems, shelves } from "~/server/db/schema";

export type CreateShelfInput = {
  name: string;
  category: string;
  type: string;
  size: string;
  items: { name: string; sub: string }[];
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
      isPrivate: false,
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
      items: {
        orderBy: [asc(shelfItems.rank)],
      },
    },
  });

  return shelf ?? null;
}
