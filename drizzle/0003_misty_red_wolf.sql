CREATE TABLE "achievement_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"parentId" uuid,
	"goalType" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"progressionMode" text DEFAULT 'direct' NOT NULL,
	"target" integer,
	"ruleVersion" text DEFAULT '1' NOT NULL,
	"recurrence" text,
	"timezone" text,
	"prerequisites" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievement_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodId" uuid NOT NULL,
	"achievementId" uuid NOT NULL,
	"sourceType" text NOT NULL,
	"sourceId" uuid NOT NULL,
	"contribution" integer DEFAULT 1 NOT NULL,
	"ruleVersion" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievement_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"achievementId" uuid NOT NULL,
	"periodKey" text NOT NULL,
	"periodStart" timestamp NOT NULL,
	"periodEnd" timestamp NOT NULL,
	"ruleVersion" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actorId" uuid,
	"action" text NOT NULL,
	"targetType" text NOT NULL,
	"targetId" uuid,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorId" uuid NOT NULL,
	"relationshipId" uuid,
	"targetType" text NOT NULL,
	"targetId" uuid NOT NULL,
	"body" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "companion_awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationshipId" uuid NOT NULL,
	"actorId" uuid NOT NULL,
	"recipientId" uuid NOT NULL,
	"taskId" uuid,
	"amount" integer NOT NULL,
	"note" text,
	"idempotencyKey" text NOT NULL,
	"correctionOf" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companion_permission_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relationshipId" uuid NOT NULL,
	"ownerId" uuid NOT NULL,
	"permissionKey" text NOT NULL,
	"resourceScope" text,
	"grantedAt" timestamp DEFAULT now() NOT NULL,
	"revokedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "companion_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviterId" uuid NOT NULL,
	"recipientId" uuid,
	"state" text DEFAULT 'pending' NOT NULL,
	"invitationTokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestoneId" uuid NOT NULL,
	"version" integer NOT NULL,
	"description" text,
	"message" text,
	"evidenceSnapshot" jsonb,
	"authorId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"title" text NOT NULL,
	"currentVersion" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'not_submitted' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"workspaceId" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"relatedOccurrenceId" uuid,
	"scheduledAt" timestamp,
	"deliveredAt" timestamp,
	"readAt" timestamp,
	"dedupeKey" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_point_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"workspaceId" uuid,
	"taskId" uuid,
	"achievementId" uuid,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"idempotencyKey" text NOT NULL,
	"correctionOf" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recognition_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"milestoneId" uuid NOT NULL,
	"versionId" uuid NOT NULL,
	"requestId" uuid NOT NULL,
	"badgeId" uuid,
	"appreciation" text,
	"awardedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requestId" uuid NOT NULL,
	"reviewerId" uuid NOT NULL,
	"decision" text NOT NULL,
	"feedback" text,
	"idempotencyKey" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"versionId" uuid NOT NULL,
	"milestoneId" uuid NOT NULL,
	"reviewerRelationshipId" uuid,
	"state" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"rrule" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"localStartTime" text NOT NULL,
	"expectedDurationMinutes" integer,
	"activeFrom" date,
	"activeUntil" date,
	"reminderMinutes" integer,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_achievement_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taskId" uuid NOT NULL,
	"achievementId" uuid NOT NULL,
	"contribution" integer DEFAULT 1 NOT NULL,
	"evidencePolicy" text,
	"ruleVersion" text DEFAULT '1' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ruleId" uuid NOT NULL,
	"taskId" uuid NOT NULL,
	"occurrenceKey" text NOT NULL,
	"scheduledStart" timestamp NOT NULL,
	"scheduledEnd" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"completedTaskId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"taskId" uuid,
	"projectId" uuid,
	"source" text DEFAULT 'timer' NOT NULL,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp NOT NULL,
	"durationSeconds" integer NOT NULL,
	"notes" text,
	"correctionOf" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"taskId" uuid,
	"state" text DEFAULT 'running' NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"pausedAt" timestamp,
	"stoppedAt" timestamp,
	"accumulatedSeconds" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"sourceType" text NOT NULL,
	"sourceId" uuid,
	"amount" integer NOT NULL,
	"ruleVersion" text,
	"idempotencyKey" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievement_definitions" ADD CONSTRAINT "achievement_definitions_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_definitions" ADD CONSTRAINT "achievement_definitions_parentId_achievement_definitions_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."achievement_definitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_evidence" ADD CONSTRAINT "achievement_evidence_periodId_achievement_periods_id_fk" FOREIGN KEY ("periodId") REFERENCES "public"."achievement_periods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_evidence" ADD CONSTRAINT "achievement_evidence_achievementId_achievement_definitions_id_fk" FOREIGN KEY ("achievementId") REFERENCES "public"."achievement_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_periods" ADD CONSTRAINT "achievement_periods_achievementId_achievement_definitions_id_fk" FOREIGN KEY ("achievementId") REFERENCES "public"."achievement_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_users_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_relationshipId_companion_relationships_id_fk" FOREIGN KEY ("relationshipId") REFERENCES "public"."companion_relationships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_awards" ADD CONSTRAINT "companion_awards_relationshipId_companion_relationships_id_fk" FOREIGN KEY ("relationshipId") REFERENCES "public"."companion_relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_awards" ADD CONSTRAINT "companion_awards_actorId_users_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_awards" ADD CONSTRAINT "companion_awards_recipientId_users_id_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_awards" ADD CONSTRAINT "companion_awards_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_awards" ADD CONSTRAINT "companion_awards_correctionOf_companion_awards_id_fk" FOREIGN KEY ("correctionOf") REFERENCES "public"."companion_awards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_permission_grants" ADD CONSTRAINT "companion_permission_grants_relationshipId_companion_relationships_id_fk" FOREIGN KEY ("relationshipId") REFERENCES "public"."companion_relationships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_permission_grants" ADD CONSTRAINT "companion_permission_grants_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_relationships" ADD CONSTRAINT "companion_relationships_inviterId_users_id_fk" FOREIGN KEY ("inviterId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companion_relationships" ADD CONSTRAINT "companion_relationships_recipientId_users_id_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_versions" ADD CONSTRAINT "milestone_versions_milestoneId_milestones_id_fk" FOREIGN KEY ("milestoneId") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_versions" ADD CONSTRAINT "milestone_versions_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_relatedOccurrenceId_task_occurrences_id_fk" FOREIGN KEY ("relatedOccurrenceId") REFERENCES "public"."task_occurrences"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_point_transactions" ADD CONSTRAINT "personal_point_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_point_transactions" ADD CONSTRAINT "personal_point_transactions_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_point_transactions" ADD CONSTRAINT "personal_point_transactions_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_point_transactions" ADD CONSTRAINT "personal_point_transactions_correctionOf_personal_point_transactions_id_fk" FOREIGN KEY ("correctionOf") REFERENCES "public"."personal_point_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognition_records" ADD CONSTRAINT "recognition_records_milestoneId_milestones_id_fk" FOREIGN KEY ("milestoneId") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognition_records" ADD CONSTRAINT "recognition_records_versionId_milestone_versions_id_fk" FOREIGN KEY ("versionId") REFERENCES "public"."milestone_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognition_records" ADD CONSTRAINT "recognition_records_requestId_review_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."review_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognition_records" ADD CONSTRAINT "recognition_records_badgeId_badges_id_fk" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_requestId_review_requests_id_fk" FOREIGN KEY ("requestId") REFERENCES "public"."review_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_decisions" ADD CONSTRAINT "review_decisions_reviewerId_users_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_versionId_milestone_versions_id_fk" FOREIGN KEY ("versionId") REFERENCES "public"."milestone_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_milestoneId_milestones_id_fk" FOREIGN KEY ("milestoneId") REFERENCES "public"."milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_reviewerRelationshipId_companion_relationships_id_fk" FOREIGN KEY ("reviewerRelationshipId") REFERENCES "public"."companion_relationships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_achievement_links" ADD CONSTRAINT "task_achievement_links_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_achievement_links" ADD CONSTRAINT "task_achievement_links_achievementId_achievement_definitions_id_fk" FOREIGN KEY ("achievementId") REFERENCES "public"."achievement_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_ruleId_schedule_rules_id_fk" FOREIGN KEY ("ruleId") REFERENCES "public"."schedule_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_occurrences" ADD CONSTRAINT "task_occurrences_completedTaskId_tasks_id_fk" FOREIGN KEY ("completedTaskId") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_correctionOf_time_entries_id_fk" FOREIGN KEY ("correctionOf") REFERENCES "public"."time_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_workspaceId_workspaces_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievement_definitions_workspaceId" ON "achievement_definitions" USING btree ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX "achievement_evidence_identity" ON "achievement_evidence" USING btree ("periodId","sourceType","sourceId");--> statement-breakpoint
CREATE UNIQUE INDEX "achievement_periods_achievement_period" ON "achievement_periods" USING btree ("achievementId","periodKey");--> statement-breakpoint
CREATE INDEX "audit_events_target" ON "audit_events" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "comments_target" ON "comments" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE UNIQUE INDEX "companion_awards_idempotency" ON "companion_awards" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE UNIQUE INDEX "companion_permission_grants_rel_perm" ON "companion_permission_grants" USING btree ("relationshipId","permissionKey","resourceScope");--> statement-breakpoint
CREATE UNIQUE INDEX "companion_relationships_token" ON "companion_relationships" USING btree ("invitationTokenHash");--> statement-breakpoint
CREATE UNIQUE INDEX "milestone_versions_milestone_version" ON "milestone_versions" USING btree ("milestoneId","version");--> statement-breakpoint
CREATE INDEX "milestones_workspaceId" ON "milestones" USING btree ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_dedupeKey" ON "notifications" USING btree ("dedupeKey");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_point_transactions_idempotency" ON "personal_point_transactions" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE UNIQUE INDEX "recognition_records_request" ON "recognition_records" USING btree ("requestId");--> statement-breakpoint
CREATE UNIQUE INDEX "review_decisions_idempotency" ON "review_decisions" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE UNIQUE INDEX "review_requests_version" ON "review_requests" USING btree ("versionId");--> statement-breakpoint
CREATE INDEX "schedule_rules_workspaceId" ON "schedule_rules" USING btree ("workspaceId");--> statement-breakpoint
CREATE UNIQUE INDEX "task_achievement_links_task_achievement" ON "task_achievement_links" USING btree ("taskId","achievementId");--> statement-breakpoint
CREATE UNIQUE INDEX "task_occurrences_rule_key" ON "task_occurrences" USING btree ("ruleId","occurrenceKey");--> statement-breakpoint
CREATE INDEX "time_entries_workspaceId" ON "time_entries" USING btree ("workspaceId");--> statement-breakpoint
CREATE INDEX "timer_sessions_userId" ON "timer_sessions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "xp_events_idempotency" ON "xp_events" USING btree ("idempotencyKey");