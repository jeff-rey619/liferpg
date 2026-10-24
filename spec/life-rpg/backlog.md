# Life RPG — Atomic Implementation Backlog

Each item is independently testable and includes dependency, scope, data/API, tests, acceptance, and definition of done. IDs are stable. Do not start implementation before the plan is reviewed and approved. **LR-001–LR-018** comprise the proposed MVP; LR-019 is a post-MVP gated extension.

## Dependency map

```text
LR-001 → LR-002 → LR-003 → LR-004 → LR-005 → LR-006 → LR-007 → LR-008
                                   ├────────────→ LR-009 ──┐
                                   ├────────────→ LR-011 → LR-012
                                   │                         ├→ LR-013
LR-007 + LR-009 ──────────────────┴→ LR-010 ───────┐       └→ LR-014 → LR-015
LR-004 + LR-006 + LR-007 + LR-010 + LR-015 ────────┴→ LR-016
LR-006 + LR-007 + LR-010 ────────────────────────────→ LR-017
LR-001–LR-017 ───────────────────────────────────────→ LR-018 → LR-019 (gated)
```

## LR-001 — Bootstrap responsive application and quality gates ✅
- **Objective:** Establish a reproducible TypeScript web application foundation.
- **Dependencies:** None.
- **Scope:** Next.js skeleton, environment validation, lint/typecheck/test scripts, CI, error handling, responsive base layout.
- **Data/API:** No domain schema; readiness endpoint only.
- **Tests:** Unit—environment and error mapping. Integration—application boot/readiness. UI/E2E—desktop/mobile shell smoke test and navigation landmark.
- **Acceptance:** Clean checkout builds; CI runs checks; secrets stay server-side.
- **Definition of done:** Scripts and CI documented, checks green, no credentials committed.

## LR-002 — Add PostgreSQL, migrations, and test database workflow ✅
- **Objective:** Make schema changes repeatable and constraints testable.
- **Dependencies:** LR-001.
- **Scope:** PostgreSQL connection, Drizzle configuration, migration scripts, isolated test DB and fixtures.
- **Data/API:** Migration metadata only.
- **Tests:** Unit—migration/config validation. Integration—fresh database migration and rebuild/rollback validation. UI/E2E—app readiness.
- **Acceptance:** Schema can be built from migrations in a new environment; tests cannot target production DB.
- **Definition of done:** Migration/test workflow documented and CI verified.

## LR-003 — Implement identity, profiles, workspace ownership, and private defaults ✅
- **Objective:** Establish authenticated owner scope before domain records.
- **Dependencies:** LR-002.
- **Scope:** Auth.js sessions, profiles/timezone, one personal workspace, route guards, owner/workspace resolution.
- **Data/API:** `users`, `profiles`, `workspaces`, `workspace_members`; profile API.
- **Tests:** Unit—session-to-owner resolution. Integration—unauthenticated and cross-user workspace reads/writes denied. UI/E2E—sign-in/out and timezone update.
- **Acceptance:** Queries derive authorization from session, never caller-supplied owner ID.
- **Definition of done:** Auth error states, migrations, API contract, and security tests pass.

## LR-004 — Build accessible application shell and navigation ✅
- **Objective:** Provide responsive functional navigation.
- **Dependencies:** LR-001, LR-003.
- **Scope:** Page layouts, navigation, design tokens, keyboard/focus patterns, reduced-motion foundation.
- **Data/API:** None.
- **Tests:** Unit—navigation state where applicable. Integration—auth route access. UI/E2E—desktop/mobile navigation, keyboard traversal, reduced-motion setting.
- **Acceptance:** Tasks, timer, calendar, quests and reports are directly reachable without a decorative home step.
- **Definition of done:** Responsive/a11y checks in CI; loading, empty and error states included.

## LR-005 — Add projects, tasks, hierarchy, tags, and quick activity logs ✅
- **Objective:** Deliver practical organization independent of game systems.
- **Dependencies:** LR-003, LR-004.
- **Scope:** CRUD/archive for nested projects, tasks/subtasks, workspace tags, task status, quick activity logs; validate same-workspace links and acyclic parents.
- **Data/API:** `projects`, `tasks`, `tags`, `task_tags`, `activity_logs`; project/task/tag/activity endpoints.
- **Tests:** Unit—input validation, parent-cycle checks, task state transitions. Integration—CRUD, workspace boundaries, private access and idempotent completion. UI/E2E—create nested records, tag and quick-log.
- **Acceptance:** All data owner-scoped; quick log works without a task/project.
- **Definition of done:** API/domain contracts, empty/error states, behavior and access tests complete.

## LR-006 — Implement actual time, timers, manual corrections, timesheets, and project reports
- **Objective:** Deliver reliable time tracking separate from schedule.
- **Dependencies:** LR-005.
- **Scope:** Start/pause/resume/stop timer, optional task/project link, manual entries/corrections, daily/weekly timesheets, project totals, default no-overlap policy.
- **Data/API:** `timer_sessions`, `time_entries`, correction audit records; timer/time-entry/timesheet/report endpoints.
- **Tests:** Unit—duration/pause math, state machine, idempotency. Integration—concurrent starts enforce one running timer, stop retry, manual correction, owner isolation. UI/E2E—timer lifecycle, reload recovery, manual entry, reports.
- **Acceptance:** Paused duration excluded; stop creates actual time only; corrections audited.
- **Definition of done:** DB constraint plus service check; concurrency/retry tests and docs pass.

## LR-007 — Add weekly schedule rules, occurrences, and planned-versus-actual data
- **Objective:** Model scheduled work independently from actual entries.
- **Dependencies:** LR-005, LR-006.
- **Scope:** Weekly recurrence, local timezone/start and expected duration, deterministic occurrences, snooze/reschedule/skip/complete/overdue behavior.
- **Data/API:** `schedule_rules`, `task_occurrences`; schedule and occurrence endpoints; keep distinct from `time_entries`.
- **Tests:** Unit—weekly recurrence, stable keys, DST gaps/folds and timezone changes. Integration—job retries create no duplicates; missed tasks stay overdue; rescheduling history. UI/E2E—day/week timetable and task actions/start timer.
- **Acceptance:** Missed work is never auto-completed and cannot remove earned progress.
- **Definition of done:** Rule versioning, idempotent generation, state tests and comparison view complete.

## LR-008 — Add in-app reminders and resilient dispatch
- **Objective:** Notify users despite unreliable background execution.
- **Dependencies:** LR-007.
- **Scope:** Reminder preferences, in-app inbox, secured scheduled invocation, snooze and dedupe; no external notification provider in MVP.
- **Data/API:** `notifications`; inbox and authenticated job endpoints.
- **Tests:** Unit—due selection, timezone, dedupe/retry. Integration—duplicate job, unavailable scheduler, dispatch failure, changed preference. UI/E2E—read, mark read and snooze.
- **Acceptance:** Upcoming/overdue views remain useful if job execution fails; retries do not duplicate notifications.
- **Definition of done:** Job auth, failure visibility and recovery behavior documented/tested.

## LR-009 — Add separate append-only personal point and XP ledgers
- **Objective:** Establish independently auditable progression values.
- **Dependencies:** LR-005.
- **Scope:** Owner-configured personal task contributions, append-only transactions, explicit XP events, corrections via compensating transaction and source keys.
- **Data/API:** `personal_point_transactions`, `xp_events`; separate ledger DTOs.
- **Tests:** Unit—immutability, dedupe, compensating adjustment and currency separation. Integration—retry safety and no cross-ledger writes. UI/E2E—distinct labels/balances.
- **Acceptance:** No aggregate combined score; no automatic companion conversion.
- **Definition of done:** Unique constraints, transactional writes, audit and tests complete.

## LR-010 — Implement achievements, task links, evaluator, and recurring history
- **Objective:** Support flexible but constrained long-term progression.
- **Dependencies:** LR-005, LR-007, LR-009.
- **Scope:** Goal types, hierarchy, direct/children/hybrid modes, task-achievement contributions, prerequisites, targets/completion rules, daily/weekly/monthly/annual periods and history.
- **Data/API:** `achievement_definitions`, `task_achievement_links`, `achievement_periods`, `achievement_evidence`; achievement CRUD/progress/history endpoints.
- **Tests:** Unit—multiple tasks and goals, evidence dedupe, parent/child/hybrid modes, prerequisites and period boundaries. Integration—re-evaluation after source/link/target corrections, retries, timezone/DST, history. UI/E2E—configure tree and view current/past progression.
- **Acceptance:** Parent evaluates canonical evidence, not child reward totals; overlapping evidence cannot double-count unless explicitly configured.
- **Definition of done:** Rule-version/recalculation contract documented; scenario tests pass.

## LR-011 — Add companion invitations, scoped permissions, and revocation
- **Objective:** Establish least-privilege sharing.
- **Dependencies:** LR-003, LR-005.
- **Scope:** Invite/accept/decline/revoke, permission presets and per-resource grants, presentation-only alias, filtered companion read views.
- **Data/API:** `companion_relationships`, `companion_permission_grants`; invitation/grant/shared-read endpoints.
- **Tests:** Unit—deny-by-default and alias invariance. Integration—shared/unshared projects, task/schedule/time/achievement scopes, direct-ID probing and revoked access. UI/E2E—invite, accept, configure, revoke.
- **Acceptance:** Each read checks active relationship, permission key and resource scope on the server.
- **Definition of done:** Threat-oriented negative API tests pass; policy docs match behavior.

## LR-012 — Add comments and encouragement on shared contexts
- **Objective:** Enable private accountability conversations.
- **Dependencies:** LR-011.
- **Scope:** Comments on explicitly shared task/achievement contexts, deletion/report policy and relevant notification integration.
- **Data/API:** `comments`; shared-context comment endpoints.
- **Tests:** Unit—target validation and permission predicate. Integration—read/write after revocation and unrelated context denied. UI/E2E—companion and owner comment flows.
- **Acceptance:** Comments do not reveal private context; canonical actor identity is independent of alias.
- **Definition of done:** Permission/deletion behavior documented; tests pass.

## LR-013 — Add everyday companion point awards and controlled corrections
- **Objective:** Recognize ordinary task effort separately from milestone review.
- **Dependencies:** LR-009, LR-011.
- **Scope:** Eligibility, bounded awards, actor attribution, amount/time, idempotency, compensating corrections, per-contributor totals.
- **Data/API:** `companion_awards`; task award/correction endpoints.
- **Tests:** Unit—limits, separation and correction rules. Integration—multiple companions on one task, duplicate retries, revoked access, unauthorized resource, concurrent cap. UI/E2E—personal contribution, individual companion totals, aggregate companion points.
- **Acceptance:** No automatic conversion into personal points/XP; source of every contribution visible to owner.
- **Definition of done:** Constraints, audit trail, concurrency and duplicate tests pass.

## LR-014 — Add immutable milestone versions and review request lifecycle
- **Objective:** Bind decisions to exactly the submitted evidence.
- **Dependencies:** LR-010, LR-011.
- **Scope:** Milestone selection, evidence/context snapshot, selected reviewer, pending/more-info/declined/approved/withdrawn states, resubmission as a new version.
- **Data/API:** `milestones`, `milestone_versions`, `review_requests`, `review_decisions`; milestone/review endpoints.
- **Tests:** Unit—state machine/version rules/active request. Integration—unauthorized reviewer, revoked grant, more-info, decline/resubmit and edit after prior review. UI/E2E—submit, inbox, request changes, decline, withdraw/resubmit.
- **Acceptance:** Reviews attach to immutable version; stale approval cannot approve latest content; reviewer cannot edit task or personal-point records.
- **Definition of done:** Status and audit surfaces exist; lifecycle/permission tests pass.

## LR-015 — Add approval-bound recognition and private Recognition Hall
- **Objective:** Keep approval, badges, and appreciation as separate outcomes.
- **Dependencies:** LR-014.
- **Scope:** Approval action; optional badge, appreciation/stars and structured feedback; private Recognition Hall; reveal event only after successful persisted approval.
- **Data/API:** `badges`, `recognition_records`; review transaction and recognition endpoint.
- **Tests:** Unit—no recognition while pending/declined, optional badge, uniqueness. Integration—duplicate approval/badge, transaction failure and version binding. UI/E2E—approve without badge/with appreciation; hall view and post-commit reveal.
- **Acceptance:** Not public by default; no impact to achievement points or XP.
- **Definition of done:** Auditable reviewer/date/version links and accessible non-blocking reveal complete.

## LR-016 — Build cozy desk-room home as accessible navigation
- **Objective:** Give the product a cozy visual identity without sacrificing utility.
- **Dependencies:** LR-004, LR-006, LR-007, LR-010, LR-015.
- **Scope:** Calendar, notebook, timer, bookshelf, achievement display, trophy shelf, messages as functional objects; responsive illustrated environment.
- **Data/API:** Reuse existing APIs; no authoritative new domain data.
- **Tests:** Unit—component states/reduced motion. Integration—object routes preserve functional-view authorization. UI/E2E—desktop/mobile, touch targets, keyboard, reduced motion.
- **Acceptance:** Each object has accessible label/direct destination; no animation or home navigation blocks actions.
- **Definition of done:** Visual, responsive, accessibility and interaction review complete.

## LR-017 — Add owner-scoped insights and planned-versus-actual reports
- **Objective:** Provide practical, nonjudgmental summaries.
- **Dependencies:** LR-006, LR-007, LR-010.
- **Scope:** Project/tag time, topic learning where categorized, schedule variance and achievement history; derive aggregates from source facts.
- **Data/API:** Owner-scoped aggregate endpoints; no mutable report totals initially.
- **Tests:** Unit—aggregate arithmetic, date boundaries and empty periods. Integration—source reconciliation and access isolation. UI/E2E—filters/date range and accessible reports.
- **Acceptance:** Tracked hours are not labeled mastery/worth; totals reconcile to source records.
- **Definition of done:** Behavior tests and data/privacy review complete.

## LR-018 — Complete security, operations, account lifecycle, and release verification
- **Objective:** Make MVP operable and privacy-safe.
- **Dependencies:** LR-001 through LR-017.
- **Scope:** Audit-event review, attachment storage decision, backup/restore, retention/export/deletion decisions, rate limits, observability, deployment runbook, final threat model.
- **Data/API:** Finalize `audit_events`; implement export/deletion only after retention rules are approved.
- **Tests:** Unit—redaction/audit/retention helpers. Integration—restore smoke test, background failures/retries and authorization regression. UI/E2E—critical paths and keyboard/mobile checklist.
- **Acceptance:** No known cross-user access defect; backup restore validated; operational logs do not leak private content.
- **Definition of done:** Security checklist, runbook and release sign-off documented.

## LR-019 — Add finance and health tracking (post-MVP, gated)
- **Objective:** Extend life insights only after sensitive-data review.
- **Dependencies:** LR-018 plus explicit retention, consent, export/delete, sharing and security decisions.
- **Scope:** Optional user-defined categories/goals in separate sensitive domain, private by default; no companion access without explicit new grant types.
- **Data/API:** Separate sensitive tables/endpoints with data minimization and access audit.
- **Tests:** Unit—privacy classification and field-level rules. Integration—direct API, report/search, export/delete, companion denial/revocation. UI/E2E—consent and privacy controls.
- **Acceptance:** Sensitive values never enter logs, general reports, or companion views without explicit consent.
- **Definition of done:** Separate privacy/security review and lifecycle policy approved before release.

## Global validation scenarios

The test program across tasks must cover:

- Multiple tasks contributing to multiple achievements with independent configured contributions.
- Parent-child direct/children/hybrid progression and no double-counting.
- Recurring period boundaries, timezone, leap/calendar changes, DST gaps/folds.
- Missed, rescheduled, snoozed, skipped and completed tasks; no auto-completion or loss of earned progress.
- Overlapping timers, pause/resume, retry, manual correction, and concurrent starts.
- Multiple companions awarding one task, duplicate award prevention, correction, attribution and currency separation.
- Milestone submission, approval, decline, more-information request, resubmission, duplicate approval/badge prevention, withdrawal and edited versions.
- Revoked permission and direct API/resource-ID access to private data.
- Notification failures and unavailable background execution.
- Reports reconciling to source data without leaking another user's records.

## Cross-cutting definition of done

A backlog item is complete only when schema/migration, domain/API behavior, required UI, loading/empty/error states, behavior and permission tests, and relevant documentation are finished. Tests must assert outcomes and access enforcement, not only component rendering. CI must run applicable formatting/lint, typecheck, unit, integration, and E2E suites before release.
