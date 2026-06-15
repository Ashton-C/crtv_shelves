import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/server/db";
import { getReactions, toggleReaction } from "../reactions";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {
    query: {
      shelfItemReactions: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

const existingReaction = {
  id: 5,
  shelfItemId: 1,
  userId: "user_123",
  type: "fire",
  createdAt: new Date("2024-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("toggleReaction", () => {
  it("throws when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(toggleReaction(1, "fire")).rejects.toThrow("Unauthenticated");
  });

  it("inserts a new reaction and returns { active: true }", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelfItemReactions.findFirst).mockResolvedValueOnce(undefined);
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockResolvedValue([]),
    } as never);

    const result = await toggleReaction(1, "fire");

    expect(result).toEqual({ active: true });
    expect(db.insert).toHaveBeenCalled();
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("deletes an existing reaction and returns { active: false }", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelfItemReactions.findFirst).mockResolvedValueOnce(existingReaction);
    vi.mocked(db.delete).mockReturnValueOnce({
      where: vi.fn().mockResolvedValue([]),
    } as never);

    const result = await toggleReaction(1, "fire");

    expect(result).toEqual({ active: false });
    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("handles all four reaction types", async () => {
    const types = ["fire", "skull", "eyes", "check"] as const;

    for (const type of types) {
      vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
      vi.mocked(db.query.shelfItemReactions.findFirst).mockResolvedValueOnce(undefined);
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockResolvedValue([]),
      } as never);

      const result = await toggleReaction(1, type);
      expect(result.active).toBe(true);
    }
  });

  it("is idempotent — second toggle removes the reaction", async () => {
    // First toggle: inserts
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelfItemReactions.findFirst).mockResolvedValueOnce(undefined);
    vi.mocked(db.insert).mockReturnValueOnce({ values: vi.fn().mockResolvedValue([]) } as never);
    const first = await toggleReaction(1, "skull");
    expect(first.active).toBe(true);

    // Second toggle: deletes
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelfItemReactions.findFirst).mockResolvedValueOnce({
      ...existingReaction,
      type: "skull",
    });
    vi.mocked(db.delete).mockReturnValueOnce({ where: vi.fn().mockResolvedValue([]) } as never);
    const second = await toggleReaction(1, "skull");
    expect(second.active).toBe(false);
  });
});

describe("getReactions", () => {
  it("returns an empty array immediately for an empty itemIds list", async () => {
    const result = await getReactions([]);
    expect(result).toEqual([]);
    expect(db.query.shelfItemReactions.findMany).not.toHaveBeenCalled();
  });

  it("queries and returns reactions for the given item IDs", async () => {
    vi.mocked(db.query.shelfItemReactions.findMany).mockResolvedValueOnce([
      { ...existingReaction, type: "fire" },
      { ...existingReaction, id: 6, shelfItemId: 2, type: "check" },
    ]);

    const result = await getReactions([1, 2, 3]);

    expect(result).toHaveLength(2);
    expect(result[0]?.type).toBe("fire");
    expect(result[1]?.type).toBe("check");
  });

  it("returns an empty array when no reactions exist for the items", async () => {
    vi.mocked(db.query.shelfItemReactions.findMany).mockResolvedValueOnce([]);
    const result = await getReactions([1, 2, 3]);
    expect(result).toEqual([]);
  });
});
