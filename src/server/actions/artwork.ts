"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { resolveArtwork } from "~/server/services/artwork";
import { shelfItems, shelves } from "~/server/db/schema";

/**
 * Fills in missing cover art for a shelf's items.
 *
 * Called AFTER a shelf is created or saved rather than during, so the write
 * stays fast: each lookup is a serial network round trip (see
 * resolveArtworkForItems for why it cannot be parallelised), which would
 * otherwise add seconds to the save.
 *
 * Only touches rows where imageUrl IS NULL, so an uploaded or previously
 * resolved image is never overwritten.
 */
export async function backfillShelfArtwork(slug: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.slug, slug),
    with: { collaborators: true, items: true },
  });
  if (!shelf) throw new Error("Not found");

  const isOwner = shelf.userId === userId;
  const isCollab = shelf.collaborators.some((c) => c.userId === userId);
  if (!isOwner && !isCollab) throw new Error("Not found");

  const missing = shelf.items.filter((i) => !i.imageUrl);
  if (missing.length === 0) return { updated: 0 };

  let updated = 0;
  for (const item of missing) {
    const hit = await resolveArtwork(item.name, shelf.category, shelf.type);
    if (!hit) continue;
    await db
      .update(shelfItems)
      .set({ imageUrl: hit.url })
      .where(and(eq(shelfItems.id, item.id), isNull(shelfItems.imageUrl)));
    updated++;
  }

  if (updated > 0) {
    revalidatePath(`/dashboard/view_shelf/${slug}`);
    revalidatePath("/dashboard");
  }

  return { updated };
}

/**
 * Look up art for a single name, used by the item picker so a chosen item
 * shows its cover immediately. Returns null rather than throwing.
 */
export async function lookupArtwork(
  name: string,
  category: string,
  type: string,
) {
  const { userId } = await auth();
  if (!userId) return null;
  const hit = await resolveArtwork(name, category, type);
  return hit?.url ?? null;
}

/** Clears an item's art so the next backfill re-resolves it. */
export async function clearItemArtwork(itemId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const item = await db.query.shelfItems.findFirst({
    where: eq(shelfItems.id, itemId),
  });
  if (!item) throw new Error("Not found");

  const shelf = await db.query.shelves.findFirst({
    where: eq(shelves.id, item.shelfId),
    with: { collaborators: true },
  });
  if (!shelf) throw new Error("Not found");

  const allowed =
    shelf.userId === userId ||
    shelf.collaborators.some((c) => c.userId === userId);
  if (!allowed) throw new Error("Not found");

  await db
    .update(shelfItems)
    .set({ imageUrl: null })
    .where(eq(shelfItems.id, itemId));

  revalidatePath(`/dashboard/view_shelf/${shelf.slug}`);
}
