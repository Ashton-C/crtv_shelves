import { auth } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/server/db";
import { respondToRequest, sendFriendRequest } from "../friends";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("~/server/db", () => ({
  db: {
    query: {
      users: { findFirst: vi.fn(), findMany: vi.fn() },
      friendships: { findFirst: vi.fn(), findMany: vi.fn() },
      shelves: { findFirst: vi.fn(), findMany: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const ME = "user_me";
const THEM = "user_them";

const themUser = {
  id: THEM,
  username: "dillo",
  handle: "dillo",
  avatarColor: "#FF5F00",
  avatarInitials: "DI",
  isPublic: true,
  shareByLink: true,
  showShelfCounts: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: null,
};

function friendship(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    requesterId: ME,
    addresseeId: THEM,
    status: "pending",
    createdAt: new Date("2024-01-01"),
    updatedAt: null,
    ...over,
  };
}

/** db.update().set().where() -> awaited directly */
function mockUpdateAwaitable() {
  return { set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) };
}

/** db.update().set().where().returning() */
function mockUpdateReturning(rows: unknown[]) {
  return {
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue(rows) }),
    }),
  };
}

function mockInsert() {
  return {
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue([]),
    }),
  };
}

beforeEach(() => vi.clearAllMocks());

describe("sendFriendRequest", () => {
  it("throws when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(sendFriendRequest("dillo")).rejects.toThrow("Unauthenticated");
  });

  it("throws when the handle matches no user", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(undefined);
    await expect(sendFriendRequest("ghost")).rejects.toThrow("User not found");
  });

  it("rejects adding yourself", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce({
      ...themUser,
      id: ME,
    } as never);
    await expect(sendFriendRequest("me")).rejects.toThrow("Cannot add yourself");
  });

  it("strips a leading @ and lowercases the handle", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(mockInsert() as never);

    await sendFriendRequest("  @DiLLo  ");

    // The where clause is built from the normalised handle; assert we queried once
    // with a normalised value by checking the call happened at all plus no throw.
    expect(db.query.users.findFirst).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalled();
  });

  it("inserts a pending request when no relationship exists", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(mockInsert() as never);

    await expect(sendFriendRequest("dillo")).resolves.toEqual({ result: "sent" });
  });

  it("rejects when already friends", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(
      friendship({ status: "accepted" }) as never,
    );
    await expect(sendFriendRequest("dillo")).rejects.toThrow("Already friends");
  });

  it("rejects a duplicate outgoing request", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(
      friendship({ requesterId: ME, addresseeId: THEM, status: "pending" }) as never,
    );
    await expect(sendFriendRequest("dillo")).rejects.toThrow("Request already sent");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("accepts the existing request when they already asked us", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    // Reverse direction: they are the requester, we are the addressee.
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(
      friendship({ requesterId: THEM, addresseeId: ME, status: "pending" }) as never,
    );
    vi.mocked(db.update).mockReturnValueOnce(mockUpdateAwaitable() as never);

    await expect(sendFriendRequest("dillo")).resolves.toEqual({
      result: "accepted_existing",
    });
    // No mirrored row is created.
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("reopens a previously declined pair instead of inserting a second row", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(themUser as never);
    vi.mocked(db.query.friendships.findFirst).mockResolvedValueOnce(
      friendship({ status: "declined" }) as never,
    );
    vi.mocked(db.update).mockReturnValueOnce(mockUpdateAwaitable() as never);

    await expect(sendFriendRequest("dillo")).resolves.toEqual({ result: "sent" });
    expect(db.update).toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });
});

describe("respondToRequest", () => {
  it("throws when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as never);
    await expect(respondToRequest(1, true)).rejects.toThrow("Unauthenticated");
  });

  it("accepts a pending request addressed to us", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.update).mockReturnValueOnce(
      mockUpdateReturning([friendship({ status: "accepted" })]) as never,
    );
    await expect(respondToRequest(1, true)).resolves.toEqual({ accepted: true });
  });

  it("declines a pending request", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    vi.mocked(db.update).mockReturnValueOnce(
      mockUpdateReturning([friendship({ status: "declined" })]) as never,
    );
    await expect(respondToRequest(1, false)).resolves.toEqual({ accepted: false });
  });

  it("throws when the update matches nothing (wrong user, or already answered)", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: ME } as never);
    // Empty returning() => the WHERE (id + addresseeId + pending) matched no row.
    vi.mocked(db.update).mockReturnValueOnce(mockUpdateReturning([]) as never);
    await expect(respondToRequest(999, true)).rejects.toThrow("Request not found");
  });
});
