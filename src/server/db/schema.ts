import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `crtv_shelves_${name}`);

// Populated by Clerk on first sign-in
export const users = createTable(
  "user",
  (d) => ({
    id: d.varchar({ length: 128 }).primaryKey(), // Clerk user ID
    username: d.varchar({ length: 64 }).notNull(),
    handle: d.varchar({ length: 32 }).notNull().unique(),
    avatarColor: d.varchar({ length: 7 }).default("#FF5F00").notNull(),
    avatarInitials: d.varchar({ length: 2 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("user_handle_idx").on(t.handle)],
);

export const shelves = createTable(
  "shelf",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    userId: d.varchar({ length: 128 }).notNull(),
    name: d.varchar({ length: 32 }).notNull(), // always lowercase in UI
    category: d.varchar({ length: 16 }).notNull(), // Music | Film | TV | Books | Games
    type: d.varchar({ length: 32 }).notNull(), // Artists | Albums | Films | etc.
    size: d.varchar({ length: 16 }).notNull(), // podium | focus | archive
    slug: d.varchar({ length: 64 }).notNull().unique(),
    isPrivate: d.boolean().default(false).notNull(),
    shareCount: d.integer().default(0).notNull(),
    displayOrder: d.integer().default(0).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("shelf_user_idx").on(t.userId),
    index("shelf_slug_idx").on(t.slug),
  ],
);

export const shelfItems = createTable(
  "shelf_item",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    shelfId: d.integer().notNull(),
    rank: d.integer().notNull(), // 1-indexed, #1 = top
    name: d.varchar({ length: 128 }).notNull(),
    sub: d.varchar({ length: 128 }), // e.g. "Hip-Hop · Compton"
    colorFrom: d.varchar({ length: 7 }), // gradient c1 (hex)
    colorTo: d.varchar({ length: 7 }), // gradient c2 (hex)
    initials: d.varchar({ length: 2 }),
    imageUrl: d.varchar({ length: 512 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("shelf_item_shelf_idx").on(t.shelfId)],
);

export const friendships = createTable(
  "friendship",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    requesterId: d.varchar({ length: 128 }).notNull(),
    addresseeId: d.varchar({ length: 128 }).notNull(),
    status: d.varchar({ length: 16 }).default("pending").notNull(), // pending | accepted | declined
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("friendship_requester_idx").on(t.requesterId),
    index("friendship_addressee_idx").on(t.addresseeId),
  ],
);
