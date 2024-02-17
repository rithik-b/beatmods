import { relations } from "drizzle-orm"
import {
  pgTable,
  unique,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  pgSchema,
  jsonb,
} from "drizzle-orm/pg-core"

export const approvalStatusPgEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
])

export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
  },
  (table) => {
    return {
      categoriesNameKey: unique("Categories_name_key").on(table.name),
    }
  },
)

export const gameVersionsTable = pgTable(
  "game_versions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    version: text("version").notNull(),
    published: boolean("published").default(false).notNull(),
  },
  (table) => {
    return {
      gameVersionsVersionKey: unique("GameVersions_version_key").on(
        table.version,
      ),
    }
  },
)

const gameVersionsRelations = relations(gameVersionsTable, ({ many }) => ({
  mods: many(modVersionSupportedGameVersionsTable),
}))

const usersTable = pgSchema("auth").table("users", {
  id: uuid("id").primaryKey().notNull(),
})

export const githubUsersTable = pgTable("github_users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  authId: uuid("auth_id").references(() => usersTable.id, {
    // Seperate and optional for seeding mock data
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  name: text("name"),
  userName: text("user_name").notNull(),
  avatarUrl: text("avatar_url"),
})

const githubUsersRelations = relations(githubUsersTable, ({ many }) => ({
  mods: many(modContributorsTable),
}))

export const modContributorsTable = pgTable("mod_contributors", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modId: text("mod_id")
    .notNull()
    .references(() => modsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => githubUsersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
})

const modContributorsRelations = relations(modContributorsTable, ({ one }) => ({
  user: one(githubUsersTable, {
    fields: [modContributorsTable.userId],
    references: [githubUsersTable.id],
  }),
  mod: one(modsTable, {
    fields: [modContributorsTable.modId],
    references: [modsTable.id],
  }),
}))

export const modVersionDependenciesTable = pgTable("mod_version_dependencies", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modVersionsId: uuid("mod_versions_id")
    .notNull()
    .references(() => modVersionsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  semver: text("semver").notNull(),
  dependencyId: text("dependency_id")
    .notNull()
    .references(() => modsTable.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
})

const modVersionDependenciesRelations = relations(
  modVersionDependenciesTable,
  ({ one }) => ({
    modVersion: one(modVersionsTable, {
      fields: [modVersionDependenciesTable.modVersionsId],
      references: [modVersionsTable.id],
    }),
    dependency: one(modsTable, {
      fields: [modVersionDependenciesTable.dependencyId],
      references: [modsTable.id],
    }),
  }),
)

export const modVersionSupportedGameVersionsTable = pgTable(
  "mod_version_supported_game_versions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    modVersionId: uuid("mod_version_id")
      .notNull()
      .references(() => modVersionsTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    gameVersionId: uuid("game_version_id").references(
      () => gameVersionsTable.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      },
    ),
  },
)

const modVersionSupportedGameVersionsRelations = relations(
  modVersionSupportedGameVersionsTable,
  ({ one }) => ({
    modVersion: one(modVersionsTable, {
      fields: [modVersionSupportedGameVersionsTable.modVersionId],
      references: [modVersionsTable.id],
    }),
    gameVersion: one(gameVersionsTable, {
      fields: [modVersionSupportedGameVersionsTable.gameVersionId],
      references: [gameVersionsTable.id],
    }),
  }),
)

export const modVersionsTable = pgTable("mod_versions", {
  modId: text("mod_id")
    .notNull()
    .references(() => modsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  version: text("version").notNull(),
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  downloadUrl: text("download_url").notNull(),
})

const modVersionsRelations = relations(modVersionsTable, ({ one, many }) => ({
  mod: one(modsTable, {
    fields: [modVersionsTable.modId],
    references: [modsTable.id],
  }),
  dependencies: many(modVersionDependenciesTable),
  supportedGameVersions: many(modVersionSupportedGameVersionsTable),
}))

export const modsTable = pgTable(
  "mods",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    moreInfoUrl: text("more_info_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    category: text("category")
      .notNull()
      .references(() => categoriesTable.name, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      modSlugKey: unique("Mod_slug_key").on(table.slug),
    }
  },
)

const modsRelations = relations(modsTable, ({ many }) => ({
  contributors: many(modContributorsTable),
  versions: many(modVersionsTable),
  dependendents: many(modVersionDependenciesTable),
}))

export const pendingModsTable = pgTable("pending_mods", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  modId: text("mod_id")
    .notNull()
    .references(() => modsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  description: text("description"),
  moreInfoUrl: text("more_info_url"),
  category: text("category").references(() => categoriesTable.name, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  status: approvalStatusPgEnum("status").default("pending").notNull(),
})

const pendingModsRelations = relations(pendingModsTable, ({ one, many }) => ({
  mod: one(modsTable, {
    fields: [pendingModsTable.modId],
    references: [modsTable.id],
  }),
  auditLogs: many(pendingModsAuditLogTable),
}))

export const pendingModsAuditLogTable = pgTable("pending_mods_audit_log", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  pendingModId: uuid("pending_mod_id")
    .notNull()
    .references(() => pendingModsTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: uuid("user_id")
    .notNull()
    .references(() => githubUsersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  diff: jsonb("diff").notNull(),
})

const pendingModsAuditLogRelations = relations(
  pendingModsAuditLogTable,
  ({ one }) => ({
    pendingMod: one(pendingModsTable, {
      fields: [pendingModsAuditLogTable.pendingModId],
      references: [pendingModsTable.id],
    }),
    user: one(githubUsersTable, {
      fields: [pendingModsAuditLogTable.userId],
      references: [githubUsersTable.id],
    }),
  }),
)

export const dbSchemaRelations = {
  gameVersionsRelations,
  githubUsersRelations,
  modContributorsRelations,
  modVersionsRelations,
  modsRelations,
  modVersionDependenciesRelations,
  modVersionSupportedGameVersionsRelations,
  pendingModsRelations,
  pendingModsAuditLogRelations,
}
