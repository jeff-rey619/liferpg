# Life RPG — Schema Inventory (by feature)

Generated from `src/server/db/schema.ts`. Total: 32 tables.

## Identity & Workspace (LR-003)
- `users` — identity (id, name, email, emailVerified, image, createdAt)
- `accounts` — OAuth provider accounts (next-auth)
- `sessions` — sessions (next-auth, JWT strategy)
- `verification_tokens` — email verification (next-auth)
- `profiles` — display name, IANA timezone, locale (1:1 user)
- `workspaces` — personal workspace (1 per user, unique ownerId)
- `workspace_members` — workspace membership/role

## Organization (LR-005)
- `projects` — nested projects (self-ref parentId, archive)
- `tasks` — tasks/subtasks (project, parentTask, status, dueDate, estimate, personalPoints, completedAt)
- `tags` — workspace reusable tags (unique name per workspace)
- `task_tags` — many-to-many task↔tag
- `activity_logs` — quick activity entries (task/project optional, duration, notes)

## Time Tracking (LR-006)
- `timer_sessions` — running/paused/stopped timer (one running per user enforced in service+DB), accumulatedSeconds, version
- `time_entries` — actual time records (start/end/duration, source timer|manual, correctionOf)

## Scheduling (LR-007)
- `schedule_rules` — recurrence (rrule, timezone, local start, expected duration, active window, reminder)
- `task_occurrences` — deterministic occurrence instances (unique rule+key, status, completion link)

## Notifications (LR-008)
- `notifications` — in-app inbox (type, title, body, related occurrence, scheduled/delivered/read, dedupeKey unique)

## Progression Ledgers (LR-009)
- `personal_point_transactions` — append-only signed amounts (idempotencyKey unique, correctionOf)
- `xp_events` — separate XP ledger (idempotencyKey unique)

## Achievements (LR-010)
- `achievement_definitions` — goal tree (parent, goalType, progressionMode direct/children/hybrid, target, recurrence, ruleVersion, prerequisites jsonb)
- `task_achievement_links` — many-to-many task↔achievement with contribution
- `achievement_periods` — recurring period history (unique achievement+periodKey, progress, status)
- `achievement_evidence` — canonical evidence per period (unique period+sourceType+sourceId)

## Companions (LR-011)
- `companion_relationships` — invitation state, token hash, expiry
- `companion_permission_grants` — per-permission grants with scope and revoke

## Comments (LR-012)
- `comments` — on shared contexts (targetType/targetId, soft delete)

## Everyday Awards (LR-013)
- `companion_awards` — bounded awards (actor, recipient, task, amount, idempotencyKey, correctionOf)

## Milestones & Reviews (LR-014, LR-015)
- `milestones` — owner milestone (currentVersion, status)
- `milestone_versions` — immutable versions (version, description, message, evidenceSnapshot jsonb, author)
- `review_requests` — one active per version (state)
- `review_decisions` — append-only decisions (approved/declined/more_info, idempotencyKey)
- `badges` — badge definitions
- `recognition_records` — approval-bound recognition (badge, appreciation, awardedAt)

## Audit (LR-018)
- `audit_events` — actor, action, targetType/targetId, metadata jsonb, createdAt

## Notes
- All PKs are UUID (`defaultRandom`).
- Instants stored UTC (`timestamp mode date`); owner timezone preserved in `profiles.timezone`.
- Points/amounts are integers (no floats).
- History-bearing records use compensating/correction references rather than deletion.
- Unique indexes enforce idempotency and single-active constraints at DB level.