# Life RPG — Technical Architecture

## Context and recommendation

The repository has no existing application code, package manifest, database schema, or testing conventions. This document describes a greenfield responsive web application, not modifications to an existing stack.

### Recommended stack and architecture

Use a **TypeScript modular monolith**:

- Next.js for the responsive web app, server-rendered pages, and API route handlers.
- PostgreSQL for relational data, transactions, uniqueness constraints, and auditability.
- Drizzle ORM and committed migrations.
- Auth.js-backed sessions and server-side identity resolution.
- Request/response schema validation at all boundaries.
- A co-located domain/service layer; browsers never access the database directly.
- A secured scheduled invocation for reminder delivery and occurrence generation, calling the same idempotent services.

Handlers authenticate, authorize, validate, invoke domain services, and return filtered DTOs. Feature modules are code boundaries in one process and database. Do not split services until usage or operations demonstrate need. This architecture makes timer, reward, permission, and approval transactions straightforward to test atomically.

### Suggested code boundaries

```text
src/
  app/                    # route layouts and handlers
  components/             # shared accessible UI; no authorization rules
  features/
    activity/             # projects, tasks, tags, logs, timers, timesheets
    schedule/             # rules, occurrences, reminders
    progression/          # achievements, evidence, personal points, XP
    companions/           # invitations, permission grants, shared views
    recognition/          # milestone versions, reviews, badges
    insights/             # owner-scoped aggregates
  server/
    auth/                 # session and identity helpers
    db/                   # schema, migrations, connection
    policies/             # server-side access predicates
    jobs/                 # authenticated scheduled endpoints
    validation/           # boundary schemas and error mapping
  tests/                  # unit, integration, browser/E2E fixtures
```

## Domain model and initial schema

Use UUID primary keys and explicit owner/workspace scope. Store instants in UTC and preserve the owner's IANA timezone for local calendar/recurrence calculations. Use integer-safe point units or exact decimals; avoid floating point. History-bearing records are immutable or corrected through compensating events.

| Entity | Key fields and relationships |
|---|---|
| `users` | Identity and creation timestamp; provider credentials managed by auth provider where possible. |
| `profiles` | `user_id`, display name, IANA timezone, locale and preferences; one per user. |
| `workspaces` | Owner, name, privacy defaults; one personal workspace per user in MVP. |
| `workspace_members` | Workspace/user role; membership does not imply companion permissions. |
| `projects` | Workspace, nullable parent project, name/description/archive timestamp; same-workspace parent and cycle prevention. |
| `tasks` | Workspace, optional project and parent task, title, status, due date, estimate, owner-configured personal points, completion/version metadata. |
| `tags`, `task_tags` | Workspace-owned reusable tags; unique task/tag pair. |
| `activity_logs` | Owner/workspace, optional task/project, kind, occurred time/duration, notes; canonical quick/manual activity. |
| `time_entries` | Owner/workspace, optional task/project, UTC start/end, timer/manual source, notes, correction reference. Actual time only. |
| `timer_sessions` | Owner/workspace, optional task, state and timestamps, accumulated duration, version. Partial unique index permits at most one running session per user. |
| `schedule_rules` | Task, recurrence definition/version, local start/timezone, expected duration, active period and reminder settings. Planned time only. |
| `task_occurrences` | Rule/task, stable occurrence key, scheduled interval, status, completion link; unique rule/key. Never auto-completed. |
| `notifications` | Recipient, related occurrence/review/invitation, type, scheduled/delivered/read timestamps, dedupe key and delivery state. In-app for MVP. |
| `achievement_definitions` | Owner/workspace, goal type/title, nullable parent, progression mode, target/condition, recurrence/timezone, rule version and prerequisites. Hierarchy must be acyclic. |
| `task_achievement_links` | Task, achievement, configured contribution, evidence policy/version; unique pair. Supports many-to-many. |
| `achievement_periods` | Achievement, stable period key and boundaries, rule version, progress/status; unique achievement/period. Retains recurrence history. |
| `achievement_evidence` | Period/grant, canonical source type/id, contribution and rule version; unique evidence identity to prevent duplicate credit. |
| `personal_point_transactions` | Owner, source/task, optional achievement/period, signed amount, reason, idempotency key, correction reference. Append-only. |
| `xp_events` | Owner, canonical source, signed amount, rule version and idempotency key. Separate from achievement points. |
| `companion_relationships` | Inviter/recipient, state, invitation token hash/expiry and timestamps; prevents duplicate active invitation/relationship. |
| `companion_permission_grants` | Relationship, owner, permission key, optional resource scope, grant/revoke timestamps. Default deny. |
| `companion_awards` | Relationship/actor, recipient, task, amount, note, timestamp, idempotency key, correction reference. A separate award ledger. |
| `comments` | Author, target type/id, relationship context, body and lifecycle metadata. Read/write is policy-checked. |
| `milestones` | Owner/workspace, context, current version and status. |
| `milestone_versions` | Milestone, immutable version, description/message, evidence/context snapshot and author/time. Unique milestone/version. |
| `review_requests` | Submitted version, selected reviewer relationship, state and timestamps; one active request per version/reviewer. |
| `review_decisions` | Request/version, reviewer, approved/declined/more-info decision, feedback, timestamp and idempotency key. Append-only. |
| `badges`, `recognition_records` | Badge definitions; optional badge/appreciation tied to an approved request/version. Unique award key. Recognition is not currency. |
| `audit_events` | Actor, action, target, time, request/idempotency correlation and minimal before/after metadata. Exclude secrets and unnecessary sensitive payloads. |

### Logical relationship diagram

```text
User ──1:1── Profile
User ──1:N── Workspace ──1:N── Project ──parent/child── Project
                         ├──1:N── Task ──parent/child── Task
                         │           ├──N:M── Tag
                         │           ├──1:N── TimeEntry / TimerSession
                         │           ├──1:N── TaskOccurrence ←── ScheduleRule
                         │           ├──N:M── AchievementDefinition (TaskAchievementLink)
                         │           └──1:N── CompanionAward
                         └──1:N── ActivityLog
AchievementDefinition ──parent/child── AchievementDefinition
AchievementDefinition ──1:N── AchievementPeriod ──1:N── Evidence / PersonalPointTransaction
User ──1:N── XPEvent (separate ledger)
User ──N:M── CompanionRelationship ──1:N── PermissionGrant
Milestone ──1:N── immutable MilestoneVersion ──1:N── ReviewRequest ──1:N── ReviewDecision
ReviewDecision ──0..N── RecognitionRecord (only after approval)
User/Workspace ──1:N── Notification / AuditEvent
```

## Domain invariants and recalculation

- Task completion, quick activity, schedule occurrence, time entry, personal point, companion award, XP, and milestone recognition are separate facts.
- Stopping a timer records actual time; it does not silently complete a task or grant achievement credit.
- Achievement evaluators read canonical evidence, not child-achievement point totals. In hybrid mode, define direct and child evidence as a deduplicated union by canonical source identity.
- Every evidence/grant carries evaluator version and stable period key. Re-evaluation derives expected progress from source facts and records versioned compensating adjustments rather than deleting history.
- Use unique source/idempotency keys for timer operations, occurrence generation, reward transactions, review decisions, and notification jobs. Combine application checks with DB unique constraints and transactions.
- Corrections to a time entry, task, link, or target trigger deterministic recomputation and audit events. Define completion reversal policy before implementing that behavior; never silently erase prior period history or review history.
- Enforce one running timer per user in both service logic and database. Pause accounting excludes paused intervals. Manual-entry overlap policy is configurable and corrections are explicit.
- Parent-child project/task/achievement edges must stay in one workspace and be acyclic.

## API boundaries and security

Expose authenticated domain endpoints such as `/api/projects`, `/api/tasks`, `/api/time-entries`, `/api/timer`, `/api/schedules`, `/api/achievements`, `/api/companions`, `/api/milestones`, `/api/reviews`, and `/api/insights`.

- Resolve user/workspace from the authenticated session; caller-supplied IDs are selectors, never authority.
- Validate request and response DTOs at boundaries. Route handlers delegate rules to server-only services.
- Enforce permission checks in service/repository paths for every resource fetch and mutation, including direct IDs and aggregates.
- Default deny. Companion projections return only permitted fields/resources; comments and attachments are separately checked.
- Re-check current grant status on each request; revocation applies immediately.
- Use CSRF-safe session mutations, rate-limit invitation and review actions, and use idempotency keys for retried operations.
- Return consistent `401/403/404/409/422` errors. Consider `404` for inaccessible objects to avoid confirming private record existence.
- Never let a display alias affect permissions or audit actor identity.
- Do not collect health/financial data in MVP. Later add a separate data classification, retention, consent, and access-control review.

### Permission matrix

| Capability | Owner | Companion with applicable grant | Unrelated/unauthenticated |
|---|---|---|---|
| Read/write owner work, time, schedule | Full owner access | Only shared resources/fields; no owner-record writes | None |
| View task/schedule/time | Yes | Only with view grant and matching scope | None |
| View achievement progress | Yes | Only shared achievement scope | None |
| Award companion points | Cannot self-award | Eligible task + award grant + policy limits | None |
| Comment/encourage | Yes | Shared context + comment grant | None |
| Submit milestone request | Own milestone only | No | None |
| Review milestone/award recognition | Cannot self-approve | Selected authorized reviewer, submitted version only | None |
| Revoke access | Yes | May decline/leave; cannot expand grants | None |
| Edit owner tasks/personal point values | Yes | Never | Never |

## Cozy UI architecture and behavior

The desk/room is a navigable home view, not a gate. Desk calendar, notebook, timer, bookshelf, achievement display, trophy shelf, and letters link to real functional views. Pair illustrated surfaces with readable labels and direct conventional pages.

Use warm muted/pastel tokens, consistent typography/spacing, adequate text contrast, semantic headings, accessible names/errors/status, visible keyboard focus, and mobile touch targets (at least 44×44 CSS px where practical). Support reduced motion and responsive mobile/desktop layouts.

Routine completion has a brief non-blocking transition. Major milestones may use a larger celebration. Recognition animation starts only after the approval transaction succeeds. No animation blocks input, delays navigation, or is required to understand state.

## Testing strategy

- **Unit:** Timer state/duration, recurrence and timezone math, achievement evaluator, evidence dedupe, progression ledgers, permission predicates, status machines, idempotency.
- **Integration:** PostgreSQL constraints/migrations, transaction services, concurrent timer/award/review attempts, APIs using owner/companion/unrelated identities, scheduled-job retry/failure.
- **E2E:** Sign-in; task/timer/timesheet; schedule actions; achievement progression; invitations/revocation; companion award; milestone submit/review/resubmit; responsive and keyboard journeys.
- **Security:** Direct API/resource-ID access, revoked grants, cross-workspace requests, session/CSRF, rate limits and evidence attachment access. Verify backend behavior, not merely hidden controls.
- **Accessibility:** Automated checks plus keyboard/screen-reader review, contrast, reduced motion, mobile touch behavior.

Required scenarios include multiple tasks linked to multiple achievements; direct/children/hybrid parents without double-counting; daily/weekly/monthly/annual boundaries, timezone/DST; missed/rescheduled work preserving progress; overlapping timers/manual corrections; multiple companions and duplicate awards; milestone more-info/decline/resubmission/duplicate approval and badge; revoked permissions/private API attempts; changed milestone after review; notification failure and unavailable background execution; reports reconciling with source records.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Point balances become conflated. | Separate ledgers and DTO fields; no implicit conversion; tests and visible labels. |
| Hierarchical evidence double-counts. | Canonical source identity, rule versions, dedupe constraints, deterministic recalculation. |
| Companion data leaks through IDs, reports, comments or evidence. | Deny-by-default server policies, filtered DTOs and negative API tests for every scope. |
| Retries/concurrency duplicate timers, awards, reminders or approvals. | Transactions, idempotency keys, unique indexes, optimistic locking/serialization where needed. |
| Recurrence shifts or duplicates around timezone/DST. | Store timezone/rule version/stable local occurrence key and test folds/gaps. |
| Background delivery unavailable. | Durable in-app state, retry visibility, upcoming/overdue fallback and operational alerting. |
| Historical milestone review misrepresents changed content. | Immutable version snapshots; decision binds to exact version. |
| Gamification adds pressure or friction. | Practical-first views, neutral language, optional mechanics, direct navigation and non-blocking motion. |
| Sensitive health/finance data creates privacy risk. | Exclude from MVP; separate security/privacy review before implementation. |

## Decisions needed before affected implementation

1. Companion award eligibility, caps, correction/reversal policy.
2. One reviewer versus quorum/multiple reviewers; confirm no self-approval.
3. Initial achievement types/rules, completion reversal, and recurrence boundary policy.
4. In-app only versus email/push notifications and delivery provider.
5. Evidence links/text versus uploads; uploads require storage, malware, retention, and authorization decisions.
6. Hosting region/provider, identity providers, invitation channel, retention, export, and account deletion requirements.
