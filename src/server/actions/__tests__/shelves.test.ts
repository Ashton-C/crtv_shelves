import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/server/db";
import {
  createShelf,
  deleteShelf,
  searchShelves,
  updateShelf,
  type CreateShelfInput,
} from "../shelves";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {
    query: {
      shelves: { findFirst: vi.fn(), findMany: vi.fn() },
      shelfItems: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseShelf = {
  id: 1,
  userId: "user_owner",
  name: "my top albums",
  category: "music",
  type: "Albums",
  size: "podium",
  slug: "my-top-albums-test123",
  isPrivate: false,
  isCollaborative: false,
  shareCount: 0,
  displayOrder: 0,
  createdAt: new Date("2024-01-01"),
  updatedAt: null,
  collaborators: [],
};

const baseItem = {
  id: 10,
  shelfId: 1,
  rank: 1,
  name: "good kid, m.A.A.d city",
  sub: "Kendrick Lamar",
  colorFrom: null,
  colorTo: null,
  initials: null,
  imageUrl: null,
  createdAt: new Date("2024-01-01"),
};

const validInput: CreateShelfInput = {
  name: "my top albums",
  category: "music",
  type: "Albums",
  size: "podium",
  items: [
    { name: "good kid, m.A.A.d city", sub: "Kendrick Lamar" },
    { name: "Blonde", sub: "Frank Ocean" },
    { name: "", sub: "" }, // should be filtered out
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a mock for db.insert().values().returning() */
function mockShelfInsert(shelf = baseShelf) {
  return {
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([shelf]),
      onConflictDoNothing: vi.fn().mockResolvedValue([]),
    }),
  };
}

/** Returns a mock for db.insert().values() (no returning) */
function mockItemsInsert() {
  return { values: vi.fn().mockResolvedValue([]) };
}

/** Returns a mock for db.update().set().where() */
function mockUpdate() {
  return {
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
  };
}

/** Returns a mock for db.delete().where() */
function mockDelete() {
  return { where: vi.fn().mockResolvedValue([]) };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createShelf", () => {
  it("throws when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(createShelf(validInput)).rejects.toThrow("Unauthenticated");
  });

  it("returns the slug on success", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.insert)
      .mockReturnValueOnce(mockShelfInsert() as never)
      .mockReturnValueOnce(mockItemsInsert() as never);

    const result = await createShelf(validInput);
    expect(result.slug).toBe("my-top-albums-test123");
  });

  it("builds slug from name + nanoid", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);

    let capturedSlug = "";
    vi.mocked(db.insert).mockImplementation(() => ({
      values: vi.fn().mockImplementation((vals: Record<string, unknown>) => {
        if (typeof vals.slug === "string") capturedSlug = vals.slug;
        return {
          returning: vi.fn().mockResolvedValue([{ ...baseShelf, slug: vals.slug as string }]),
          onConflictDoNothing: vi.fn(),
        };
      }),
    } as never));

    await createShelf({ ...validInput, name: "best rap albums" });
    expect(capturedSlug).toBe("best-rap-albums-test123");
  });

  it("throws if shelf insert returns nothing", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.insert).mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
        onConflictDoNothing: vi.fn(),
      }),
    } as never);

    await expect(createShelf(validInput)).rejects.toThrow("Failed to create shelf");
  });

  it("filters out items with empty names", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);

    let itemValuesArg: unknown[] = [];
    vi.mocked(db.insert)
      .mockReturnValueOnce(mockShelfInsert() as never)
      .mockImplementationOnce(() => ({
        values: vi.fn().mockImplementation((vals: unknown[]) => {
          itemValuesArg = vals;
          return { returning: vi.fn().mockResolvedValue([]) };
        }),
      } as never));

    await createShelf(validInput); // input has 2 valid + 1 empty
    expect(itemValuesArg).toHaveLength(2);
  });

  it("skips items insert when all items are empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.insert).mockReturnValueOnce(mockShelfInsert() as never);

    const emptyItemsInput = { ...validInput, items: [{ name: "", sub: "" }] };
    await createShelf(emptyItemsInput);

    // insert only called once (for shelf), not again for items
    expect(db.insert).toHaveBeenCalledTimes(1);
  });
});

describe("updateShelf", () => {
  it("throws when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(updateShelf("my-shelf-test123", { name: "new name" })).rejects.toThrow(
      "Unauthenticated",
    );
  });

  it("throws when shelf does not exist", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_123" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce(undefined);
    await expect(updateShelf("nonexistent", { name: "x" })).rejects.toThrow("Not found");
  });

  it("throws when user is neither owner nor collaborator", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_outsider" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce({
      ...baseShelf,
      userId: "user_owner",
      collaborators: [],
    } as never);

    await expect(updateShelf(baseShelf.slug, { name: "x" })).rejects.toThrow("Not found");
  });

  it("allows the owner to update name", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_owner" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce(baseShelf);
    vi.mocked(db.update).mockReturnValueOnce(mockUpdate() as never);

    await expect(updateShelf(baseShelf.slug, { name: "new name" })).resolves.toEqual({
      slug: baseShelf.slug,
    });
    expect(db.update).toHaveBeenCalled();
  });

  it("allows a collaborator to update items", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_collab" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce({
      ...baseShelf,
      isCollaborative: true,
      collaborators: [{ id: 99, shelfId: 1, userId: "user_collab", createdAt: new Date() }],
    } as never);
    vi.mocked(db.delete).mockReturnValueOnce(mockDelete() as never);

    await expect(
      updateShelf(baseShelf.slug, { items: [{ name: "DAMN.", sub: "Kendrick" }] }),
    ).resolves.toEqual({ slug: baseShelf.slug });
    expect(db.delete).toHaveBeenCalled();
  });

  it("prevents a collaborator from updating the shelf name", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_collab" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce({
      ...baseShelf,
      collaborators: [{ id: 99, shelfId: 1, userId: "user_collab", createdAt: new Date() }],
    } as never);

    // Collaborators may only pass name — but the action should silently skip the
    // owner-only update rather than error or call db.update
    await updateShelf(baseShelf.slug, { name: "sneaky rename" });

    expect(db.update).not.toHaveBeenCalled();
  });

  it("deletes existing items and inserts replacements", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_owner" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce(baseShelf);
    vi.mocked(db.delete).mockReturnValueOnce(mockDelete() as never);
    vi.mocked(db.insert).mockReturnValueOnce(mockItemsInsert() as never);

    await updateShelf(baseShelf.slug, {
      items: [{ name: "DAMN.", sub: "Kendrick" }],
    });

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
  });
});

describe("deleteShelf", () => {
  it("throws when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(deleteShelf("my-shelf-test123")).rejects.toThrow("Unauthenticated");
  });

  it("throws when user is not the owner", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_outsider" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce({
      ...baseShelf,
      userId: "user_owner",
    });
    await expect(deleteShelf(baseShelf.slug)).rejects.toThrow("Not found");
  });

  it("deletes items then shelf when called by owner", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: "user_owner" } as never);
    vi.mocked(db.query.shelves.findFirst).mockResolvedValueOnce(baseShelf);
    vi.mocked(db.delete)
      .mockReturnValueOnce(mockDelete() as never) // items delete
      .mockReturnValueOnce(mockDelete() as never); // shelf delete

    await deleteShelf(baseShelf.slug);
    expect(db.delete).toHaveBeenCalledTimes(2);
  });
});

describe("searchShelves", () => {
  it("returns results from the database", async () => {
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([
      { ...baseShelf, items: [baseItem] },
    ] as never);

    const results = await searchShelves("albums");
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("my top albums");
  });

  it("returns empty array when nothing matches", async () => {
    vi.mocked(db.query.shelves.findMany).mockResolvedValueOnce([]);
    const results = await searchShelves("zzznomatch");
    expect(results).toHaveLength(0);
  });
});
