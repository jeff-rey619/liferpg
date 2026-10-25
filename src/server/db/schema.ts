import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

// --- Life RPG domain: identity/workspace (LR-003) ---
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

// --- LR-006: time tracking ---
export const timerSessions = pgTable(
  "timer_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    state: text("state").notNull().default("running"), // running|paused|stopped
    startedAt: timestamp("startedAt", { mode: "date" }).defaultNow().notNull(),
    pausedAt: timestamp("pausedAt", { mode: "date" }),
    stoppedAt: timestamp("stoppedAt", { mode: "date" }),
    accumulatedSeconds: integer("accumulatedSeconds").notNull().default(0),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("timer_sessions_userId").on(t.userId),
    oneRunning: uniqueIndex("timer_sessions_one_running").on(t.userId).where(sql`state = 'running'`),
  }),
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    projectId: uuid("projectId").references(() => projects.id, {
      onDelete: "set null",
    }),
    source: text("source").notNull().default("timer"), // timer|manual
    startedAt: timestamp("startedAt", { mode: "date" }).notNull(),
    endedAt: timestamp("endedAt", { mode: "date" }).notNull(),
    durationSeconds: integer("durationSeconds").notNull(),
    notes: text("notes"),
    correctionOf: uuid("correctionOf").references((): any => timeEntries.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("time_entries_workspaceId").on(t.workspaceId),
  }),
);

// --- LR-007: schedule ---
export const scheduleRules = pgTable(
  "schedule_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    taskId: uuid("taskId")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    rrule: text("rrule").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    localStartTime: text("localStartTime").notNull(),
    expectedDurationMinutes: integer("expectedDurationMinutes"),
    activeFrom: date("activeFrom"),
    activeUntil: date("activeUntil"),
    reminderMinutes: integer("reminderMinutes"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("schedule_rules_workspaceId").on(t.workspaceId),
  }),
);

export const taskOccurrences = pgTable(
  "task_occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ruleId: uuid("ruleId")
      .notNull()
      .references(() => scheduleRules.id, { onDelete: "cascade" }),
    taskId: uuid("taskId")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    occurrenceKey: text("occurrenceKey").notNull(),
    scheduledStart: timestamp("scheduledStart", { mode: "date" }).notNull(),
    scheduledEnd: timestamp("scheduledEnd", { mode: "date" }),
    status: text("status").notNull().default("pending"), // pending|completed|skipped|snoozed|overdue
    completedTaskId: uuid("completedTaskId").references(() => tasks.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    ruleKeyIdx: uniqueIndex("task_occurrences_rule_key").on(
      t.ruleId,
      t.occurrenceKey,
    ),
  }),
);

// --- LR-008: notifications ---
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspaceId").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    relatedOccurrenceId: uuid("relatedOccurrenceId").references(
      () => taskOccurrences.id,
      { onDelete: "set null" },
    ),
    scheduledAt: timestamp("scheduledAt", { mode: "date" }),
    deliveredAt: timestamp("deliveredAt", { mode: "date" }),
    readAt: timestamp("readAt", { mode: "date" }),
    dedupeKey: text("dedupeKey"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    dedupeIdx: uniqueIndex("notifications_dedupeKey").on(t.dedupeKey),
  }),
);

// --- LR-009: ledgers ---
export const personalPointTransactions = pgTable(
  "personal_point_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspaceId").references(() => workspaces.id, {
      onDelete: "cascade",
    }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    achievementId: uuid("achievementId"),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    idempotencyKey: text("idempotencyKey").notNull(),
    correctionOf: uuid("correctionOf").references(
      (): any => personalPointTransactions.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    idempotencyIdx: uniqueIndex("personal_point_transactions_idempotency").on(
      t.idempotencyKey,
    ),
  }),
);

export const xpEvents = pgTable(
  "xp_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceType: text("sourceType").notNull(),
    sourceId: uuid("sourceId"),
    amount: integer("amount").notNull(),
    ruleVersion: text("ruleVersion"),
    idempotencyKey: text("idempotencyKey").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    idempotencyIdx: uniqueIndex("xp_events_idempotency").on(t.idempotencyKey),
  }),
);

// --- LR-010: achievements ---
export const achievementDefinitions = pgTable(
  "achievement_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: uuid("parentId").references((): any => achievementDefinitions.id, {
      onDelete: "set null",
    }),
    goalType: text("goalType").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    progressionMode: text("progressionMode").notNull().default("direct"), // direct|children|hybrid
    target: integer("target"),
    ruleVersion: text("ruleVersion").notNull().default("1"),
    recurrence: text("recurrence"), // daily|weekly|monthly|annual
    timezone: text("timezone"),
    prerequisites: jsonb("prerequisites"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("achievement_definitions_workspaceId").on(t.workspaceId),
  }),
);

export const taskAchievementLinks = pgTable(
  "task_achievement_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("taskId")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    achievementId: uuid("achievementId")
      .notNull()
      .references(() => achievementDefinitions.id, { onDelete: "cascade" }),
    contribution: integer("contribution").notNull().default(1),
    evidencePolicy: text("evidencePolicy"),
    ruleVersion: text("ruleVersion").notNull().default("1"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    taskAchievementIdx: uniqueIndex("task_achievement_links_task_achievement").on(
      t.taskId,
      t.achievementId,
    ),
  }),
);

export const achievementPeriods = pgTable(
  "achievement_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    achievementId: uuid("achievementId")
      .notNull()
      .references(() => achievementDefinitions.id, { onDelete: "cascade" }),
    periodKey: text("periodKey").notNull(),
    periodStart: timestamp("periodStart", { mode: "date" }).notNull(),
    periodEnd: timestamp("periodEnd", { mode: "date" }).notNull(),
    ruleVersion: text("ruleVersion").notNull(),
    progress: integer("progress").notNull().default(0),
    status: text("status").notNull().default("in_progress"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    achievementPeriodIdx: uniqueIndex(
      "achievement_periods_achievement_period",
    ).on(t.achievementId, t.periodKey),
  }),
);

export const achievementEvidence = pgTable(
  "achievement_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    periodId: uuid("periodId")
      .notNull()
      .references(() => achievementPeriods.id, { onDelete: "cascade" }),
    achievementId: uuid("achievementId")
      .notNull()
      .references(() => achievementDefinitions.id, { onDelete: "cascade" }),
    sourceType: text("sourceType").notNull(),
    sourceId: uuid("sourceId").notNull(),
    contribution: integer("contribution").notNull().default(1),
    ruleVersion: text("ruleVersion").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    evidenceIdx: uniqueIndex("achievement_evidence_identity").on(
      t.periodId,
      t.sourceType,
      t.sourceId,
    ),
  }),
);

// --- LR-011: companions ---
export const companionRelationships = pgTable(
  "companion_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inviterId: uuid("inviterId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: uuid("recipientId").references(() => users.id, {
      onDelete: "cascade",
    }),
    state: text("state").notNull().default("pending"), // pending|accepted|declined|revoked
    invitationTokenHash: text("invitationTokenHash").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("companion_relationships_token").on(
      t.invitationTokenHash,
    ),
  }),
);

export const companionPermissionGrants = pgTable(
  "companion_permission_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    relationshipId: uuid("relationshipId")
      .notNull()
      .references(() => companionRelationships.id, { onDelete: "cascade" }),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionKey: text("permissionKey").notNull(),
    resourceScope: text("resourceScope"),
    grantedAt: timestamp("grantedAt", { mode: "date" }).defaultNow().notNull(),
    revokedAt: timestamp("revokedAt", { mode: "date" }),
  },
  (t) => ({
    relPermIdx: uniqueIndex("companion_permission_grants_rel_perm").on(
      t.relationshipId,
      t.permissionKey,
      t.resourceScope,
    ),
  }),
);

// --- LR-012: comments ---
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("authorId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    relationshipId: uuid("relationshipId").references(
      () => companionRelationships.id,
      { onDelete: "set null" },
    ),
    targetType: text("targetType").notNull(),
    targetId: uuid("targetId").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    deletedAt: timestamp("deletedAt", { mode: "date" }),
  },
  (t) => ({
    targetIdx: index("comments_target").on(t.targetType, t.targetId),
  }),
);

// --- LR-013: companion awards ---
export const companionAwards = pgTable(
  "companion_awards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    relationshipId: uuid("relationshipId")
      .notNull()
      .references(() => companionRelationships.id, { onDelete: "cascade" }),
    actorId: uuid("actorId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: uuid("recipientId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("taskId").references(() => tasks.id, { onDelete: "set null" }),
    amount: integer("amount").notNull(),
    note: text("note"),
    idempotencyKey: text("idempotencyKey").notNull(),
    correctionOf: uuid("correctionOf").references((): any => companionAwards.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    idempotencyIdx: uniqueIndex("companion_awards_idempotency").on(
      t.idempotencyKey,
    ),
  }),
);

// --- LR-014/LR-015: milestones, reviews, recognition ---
export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspaceId")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    currentVersion: integer("currentVersion").notNull().default(1),
    status: text("status").notNull().default("not_submitted"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index("milestones_workspaceId").on(t.workspaceId),
  }),
);

export const milestoneVersions = pgTable(
  "milestone_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    milestoneId: uuid("milestoneId")
      .notNull()
      .references(() => milestones.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    description: text("description"),
    message: text("message"),
    evidenceSnapshot: jsonb("evidenceSnapshot"),
    authorId: uuid("authorId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    milestoneVersionIdx: uniqueIndex("milestone_versions_milestone_version").on(
      t.milestoneId,
      t.version,
    ),
  }),
);

export const reviewRequests = pgTable(
  "review_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    versionId: uuid("versionId")
      .notNull()
      .references(() => milestoneVersions.id, { onDelete: "cascade" }),
    milestoneId: uuid("milestoneId")
      .notNull()
      .references(() => milestones.id, { onDelete: "cascade" }),
    reviewerRelationshipId: uuid("reviewerRelationshipId").references(
      () => companionRelationships.id,
      { onDelete: "set null" },
    ),
    state: text("state").notNull().default("pending"), // pending|more_info|approved|declined|withdrawn
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    versionIdx: uniqueIndex("review_requests_version").on(t.versionId),
  }),
);

export const reviewDecisions = pgTable(
  "review_decisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("requestId")
      .notNull()
      .references(() => reviewRequests.id, { onDelete: "cascade" }),
    reviewerId: uuid("reviewerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    decision: text("decision").notNull(), // approved|declined|more_info
    feedback: text("feedback"),
    idempotencyKey: text("idempotencyKey").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    idempotencyIdx: uniqueIndex("review_decisions_idempotency").on(
      t.idempotencyKey,
    ),
  }),
);

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const recognitionRecords = pgTable(
  "recognition_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    milestoneId: uuid("milestoneId")
      .notNull()
      .references(() => milestones.id, { onDelete: "cascade" }),
    versionId: uuid("versionId")
      .notNull()
      .references(() => milestoneVersions.id, { onDelete: "cascade" }),
    requestId: uuid("requestId")
      .notNull()
      .references(() => reviewRequests.id, { onDelete: "cascade" }),
    badgeId: uuid("badgeId").references(() => badges.id, {
      onDelete: "set null",
    }),
    appreciation: text("appreciation"),
    awardedAt: timestamp("awardedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    requestIdx: uniqueIndex("recognition_records_request").on(t.requestId),
  }),
);

// --- audit events (LR-018) ---
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actorId").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("targetType").notNull(),
    targetId: uuid("targetId"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => ({
    targetIdx: index("audit_events_target").on(t.targetType, t.targetId),
  }),
);

// --- type exports ---
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;