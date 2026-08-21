import { relations } from "drizzle-orm";
import { index, pgTableCreator, unique } from "drizzle-orm/pg-core";

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
    isPublic: d.boolean().default(true).notNull(),
    shareByLink: d.boolean().default(true).notNull(),
    showShelfCounts: d.boolean().default(false).notNull(),
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
    name: d.varchar({ length: 32 }).notNull(),
    category: d.varchar({ length: 16 }).notNull(),
    type: d.varchar({ length: 32 }).notNull(),
    size: d.varchar({ length: 16 }).notNull(), // podium | focus | archive
    slug: d.varchar({ length: 64 }).notNull().unique(),
    isPrivate: d.boolean().default(false).notNull(),
    isCollaborative: d.boolean().default(false).notNull(),
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
    rank: d.integer().notNull(),
    name: d.varchar({ length: 128 }).notNull(),
    sub: d.varchar({ length: 128 }),
    colorFrom: d.varchar({ length: 7 }),
    colorTo: d.varchar({ length: 7 }),
    initials: d.varchar({ length: 2 }),
    imageUrl: d.varchar({ length: 512 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("shelf_item_shelf_idx").on(t.shelfId)],
);

export const shelfItemReactions = createTable(
  "shelf_item_reaction",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    shelfItemId: d.integer().notNull(),
    userId: d.varchar({ length: 128 }).notNull(),
    type: d.varchar({ length: 8 }).notNull(), // fire | skull | eyes | check
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("reaction_item_idx").on(t.shelfItemId),
    index("reaction_user_item_idx").on(t.userId, t.shelfItemId),
    unique("reaction_unique_idx").on(t.shelfItemId, t.userId, t.type),
  ],
);

export const shelfCollaborators = createTable(
  "shelf_collaborator",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    shelfId: d.integer().notNull(),
    userId: d.varchar({ length: 128 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("collab_shelf_idx").on(t.shelfId),
    index("collab_user_idx").on(t.userId),
    unique("collab_unique_idx").on(t.shelfId, t.userId),
  ],
);

// ── Relations ─────────────────────────────────────────────────────────────────

export const shelvesRelations = relations(shelves, ({ many }) => ({
  items: many(shelfItems),
  collaborators: many(shelfCollaborators),
}));

export const shelfItemsRelations = relations(shelfItems, ({ one, many }) => ({
  shelf: one(shelves, { fields: [shelfItems.shelfId], references: [shelves.id] }),
  reactions: many(shelfItemReactions),
}));

export const shelfItemReactionsRelations = relations(shelfItemReactions, ({ one }) => ({
  item: one(shelfItems, {
    fields: [shelfItemReactions.shelfItemId],
    references: [shelfItems.id],
  }),
}));

export const shelfCollaboratorsRelations = relations(shelfCollaborators, ({ one }) => ({
  shelf: one(shelves, {
    fields: [shelfCollaborators.shelfId],
    references: [shelves.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────

export const friendships = createTable(
  "friendship",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    requesterId: d.varchar({ length: 128 }).notNull(),
    addresseeId: d.varchar({ length: 128 }).notNull(),
    status: d.varchar({ length: 16 }).default("pending").notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("friendship_requester_idx").on(t.requesterId),
    index("friendship_addressee_idx").on(t.addresseeId),
    // Stops a duplicate request row in the same direction. The reverse
    // direction is handled in sendFriendRequest, which accepts the existing
    // request instead of inserting a mirrored one.
    unique("friendship_pair_idx").on(t.requesterId, t.addresseeId),
  ],
);
