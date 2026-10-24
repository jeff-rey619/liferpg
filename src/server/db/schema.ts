import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// --- Auth.js (next-auth) tables ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    providerAccountIdx: uniqueIndex("accounts_provider_providerAccountId").on(
      t.provider,
      t.providerAccountId,
    ),
  }),
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("verification_tokens_token").on(t.token),
    identifierTokenIdx: uniqueIndex("verification_tokens_identifier_token").on(
      t.identifier,
      t.token,
    ),
  }),
);

// --- Life RPG domain tables (LR-003) ---
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("displayName").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  locale: text("locale"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Personal"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    ownerIdx: uniqueIndex("workspaces_ownerId").on(t.ownerId),
  }),
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceUserIdx: uniqueIndex("workspace_members_workspace_user").on(
      t.workspaceId,
      t.userId,
    ),
  }),
);

// --- LR-005: projects, tasks, tags, activity logs ---
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: uuid("parentId").references((): any => projects.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    archivedAt: timestamp("archivedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("projects_workspaceId").on(t.workspaceId),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: uuid("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    parentTaskId: uuid("parentTaskId").references((): any => tasks.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    status: text("status").notNull().default("todo"),
    dueDate: date("dueDate"),
    estimateMinutes: integer("estimateMinutes"),
    personalPoints: integer("personalPoints").notNull().default(0),
    completedAt: timestamp("completedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("tasks_workspaceId").on(t.workspaceId),
    projectIdx: index("tasks_projectId").on(t.projectId),
  }),
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceNameIdx: uniqueIndex("tags_workspace_name").on(
      t.workspaceId,
      t.name,
    ),
  }),
);

export const taskTags = pgTable(
  "task_tags",
  {
    taskId: uuid("taskId")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    tagId: uuid("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: uniqueIndex("task_tags_task_tag").on(t.taskId, t.tagId),
  }),
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    projectId: uuid("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    kind: text("kind").notNull().default("activity"),
    occurredAt: timestamp("occurredAt", { mode: "date" })
      .defaultNow()
      .notNull(),
    durationMinutes: integer("durationMinutes"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("activity_logs_workspaceId").on(t.workspaceId),
  }),
);

export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Tag = typeof tags.$inferSelect;