import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/server/db";
import { getWrappedStats } from "../wrapped";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {
    query: {
      shelves: { findMany: vi.fn() },
    },
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeItem(id: number, name: string, rank = 1) {
  return {
    id,
    shelfId: 1,
    rank,
    name,
    sub: null,
    colorFrom: null,
    colorTo: null,
    initials: null,
    imageUrl: null,
    createdAt: new Date("2024-01-01"),
  };
}

function makeShelf(
  id: number,
  category: string,
  shareCount: number,
  items: ReturnType<typeof makeItem>[],
) {
  return {
    id,
    userId: "user_123",
    name: `shelf-${id}`,
    category,
    type: "Artists",
    size: "podium",
    slug: `shelf-${id}-abc`,
    isPrivate: false,
    isCollaborative: false,
    shareCount,
    displayOrder: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: null,
    items,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getWrappedStats", () => {
  it("returns null when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    expect(await getWrappedStats()).toBeNull();
  });

  it("returns null when the user has no shelves", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([]);
    expect(await getWrappedStats()).toBeNull();
  });

  it("counts totalShelves correctly", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 5, []),
      makeShelf(2, "film", 3, []),
      makeShelf(3, "tv", 1, []),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.totalShelves).toBe(3);
  });

  it("counts totalItems across all shelves", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 10, [makeItem(1, "A"), makeItem(2, "B"), makeItem(3, "C")]),
      makeShelf(2, "film", 5, [makeItem(4, "D")]),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.totalItems).toBe(4);
  });

  it("identifies the most frequent category as topCategory", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 10, []),
      makeShelf(2, "music", 8, []),
      makeShelf(3, "music", 3, []),
      makeShelf(4, "film", 5, []),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.topCategory).toBe("music");
  });

  it("includes shelf count in categoryCounts", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 10, []),
      makeShelf(2, "music", 5, []),
      makeShelf(3, "film", 3, []),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.categoryCounts).toEqual({ music: 2, film: 1 });
  });

  it("sets mostSharedShelf to the shelf with highest shareCount (first in sorted result)", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    // Shelves are returned already ordered by shareCount desc (as the query requests)
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 99, []),
      makeShelf(2, "film", 10, []),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.mostSharedShelf?.shareCount).toBe(99);
    expect(stats?.mostSharedShelf?.id).toBe(1);
  });

  it("takes the rank-1 item from each shelf for topItems", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 10, [makeItem(1, "Kendrick Lamar"), makeItem(2, "Frank Ocean")]),
      makeShelf(2, "film", 5, [makeItem(3, "The Godfather")]),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.topItems).toHaveLength(2);
    expect(stats?.topItems[0]?.item.name).toBe("Kendrick Lamar");
    expect(stats?.topItems[0]?.shelfName).toBe("shelf-1");
    expect(stats?.topItems[1]?.item.name).toBe("The Godfather");
  });

  it("skips shelves that have no items in topItems", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "music", 10, [makeItem(1, "Kendrick")]),
      makeShelf(2, "film", 5, []), // no items
      makeShelf(3, "tv", 3, [makeItem(3, "Breaking Bad")]),
    ]);

    const stats = await getWrappedStats();
    expect(stats?.topItems).toHaveLength(2);
    expect(stats?.topItems.map((x) => x.item.name)).toEqual(["Kendrick", "Breaking Bad"]);
  });

  it("limits topItems to 5 entries", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce(
      Array.from({ length: 8 }, (_, i) =>
        makeShelf(i + 1, "music", 10 - i, [makeItem(i + 1, `Artist ${i + 1}`)]),
      ),
    );

    const stats = await getWrappedStats();
    expect(stats?.topItems).toHaveLength(5);
  });

  it("handles a single shelf with a single item", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      makeShelf(1, "books", 0, [makeItem(1, "Dune")]),
    ]);

    const stats = await getWrappedStats();
    expect(stats).not.toBeNull();
    expect(stats?.totalShelves).toBe(1);
    expect(stats?.totalItems).toBe(1);
    expect(stats?.topCategory).toBe("books");
    expect(stats?.topItems[0]?.item.name).toBe("Dune");
  });
});
