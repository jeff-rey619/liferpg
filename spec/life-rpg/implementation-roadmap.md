# Life RPG — Implementation Dashboard and Roadmap

> **Purpose:** This is the execution dashboard for an AI or human engineer implementing Life RPG in small, verifiable units. It is deliberately explicit to reduce assumptions and invented behavior.
>
> **This file is a plan, not an instruction to begin coding.** No application implementation is authorized by this document alone. Begin only after the plan is explicitly approved and the relevant task is selected.

## 0. How to use this dashboard

1. Read this file, [PRD.md](PRD.md), [architecture.md](architecture.md), [backlog.md](backlog.md), and [implementation.md](implementation.md) before implementing any task.
2. Select exactly one LR task whose dependencies are complete. Do not implement later tasks opportunistically.
3. Confirm all task-specific decision gates are resolved. If unresolved, stop and ask for the decision; do not invent policy, data behavior, or product scope.
4. Inspect the repository before editing. The specification is greenfield, but verify current files, package manager, stack, and git state. If code already exists or differs from the assumed architecture, stop and report the mismatch before adapting the plan.
5. Write down the intended files, migration/API changes, permission impacts, and tests for that one LR task before editing.
6. Implement only that scope; run its checks; report changed files, checks, open issues, and the next eligible task.
7. Update this dashboard's status only when asked or when progress tracking is explicitly part of the task. Do not change statuses based on intention alone.

### Task status vocabulary

- `[ ] Not started` — no implementation has begun.
- `[~] In progress` — work has started but not passed acceptance.
- `[x] Complete` — all task acceptance and definition-of-done criteria passed.
- `[!] Blocked` — a dependency, product decision, repository mismatch, or failing validation prevents safe progress.

Current status is **planning only**. All tasks below are not started; the repository was observed as lacking application source when these documents were authored. Recheck before any future work.

## 1. Product and architecture guardrails

These are non-negotiable unless the specification is formally changed and approved.

### Product behavior

- The product must remain practically useful when game features are ignored.
- Planned time (schedule rules/occurrences) and actual time (timers/time entries) are different data and must never be silently merged.
- Missing an occurrence must not complete it, remove earned progress, or delete history.
- Companion points are everyday recognition, not milestone approval. Do not conflate the two flows.
- Personal achievement points, character XP, companion-awarded points, and milestone recognition are four separate concepts. Do not add or convert them into one score.
- Recognition remains private according to owner-granted sharing. MVP has no public achievement feed.
- Health and financial record tracking are post-MVP and must not be added to the MVP schema or UI.

### Architecture decisions (approved proposal; not yet a codebase convention)

- Proposed baseline: TypeScript modular monolith, Next.js, PostgreSQL, Drizzle migrations, Auth.js sessions, server-side domain services, responsive web UI.
- Browser code must not access the database directly.
- API handlers authenticate, authorize, validate, call domain services, and return minimal DTOs.
- Do not introduce microservices, message brokers, external notification providers, or a new dependency unless a task needs it and the choice is explicitly approved.
- If repository reality contradicts these assumptions, do not force this stack into the repository. Stop and request an architecture decision.

### Data integrity rules

- Derive actor and owner scope from server-side session state, not caller-submitted ownership fields.
- Default all records to private; companion access is explicit, scoped, server-enforced, and revocable.
- Use database constraints as well as application checks for concurrency-sensitive invariants.
- Use idempotency keys and stable source identity for retried writes and background jobs.
- Preserve audit history. Correct ledger errors with compensating transactions; do not rewrite or silently delete past awards.
- Achievement evaluation derives from canonical evidence and deduplicates source identity. Parent achievements do not simply sum child reward totals.
- Review decisions refer to immutable milestone versions. An old approval never silently approves newer content.
- Store instants in UTC and use the owner’s saved IANA timezone for local schedule/recurrence boundaries.

### Stop-and-ask conditions

Stop implementation of the affected task and ask for clarification if:

- A user-facing behavior changes points, permissions, privacy, data retention, or approval semantics and the spec does not determine the result.
- A task is blocked by an undecided item in Section 4.
- Existing application files, dependency versions, or deployment constraints contradict the proposed architecture.
- A destructive migration, irreversible data change, external service, paid provider, or sensitive-data flow is required.
- Two specifications disagree. Do not silently pick one; report the conflict and request a resolution.

Do not stop for an implementation detail that is fully determined by existing project conventions and does not change product behavior, permissions, public API, stored data, or operations.

## 2. High-level delivery dashboard

| Release slice | LR tasks | Goal | Exit gate |
|---|---|---|---|
| A. Reproducible foundation | LR-001–LR-004 | Build/test/deployable shell, database workflow, identity, ownership and accessible navigation. | Clean setup and CI pass; private owner boundary is verified. |
| B. Practical activity MVP | LR-005–LR-006 | Projects/tasks/quick logs and reliable actual-time tracking. | Task CRUD, timer/manual entries/timesheets work; overlap and ownership tests pass. |
| C. Planning | LR-007–LR-008 | Schedule rules, occurrences, in-app reminders and planned-vs-actual. | Retry-safe schedule/reminders; missed work stays incomplete; timezone tests pass. |
| D. Personal progression | LR-009–LR-010 | Separate personal/XP ledgers and deterministic achievements. | Evidence, recurring periods, recalculation and no-double-counting tests pass. |
| E. Private companions | LR-011–LR-013 | Invitations, scoped sharing, comments, ordinary companion awards. | Direct API and revocation tests pass; award currency stays separate. |
| F. Milestone recognition | LR-014–LR-015 | Versioned review workflow and private recognition. | Lifecycle, version binding, duplicate approval/badge tests pass. |
| G. Product experience | LR-016–LR-017 | Cozy desk home and practical insights. | Responsive/accessibility checks pass; report totals reconcile to sources. |
| H. Release readiness | LR-018 | Security, operations, lifecycle decisions, final verification. | Restore and critical-path validation pass; no known private-data access defect. |
| Post-MVP gate | LR-019 | Sensitive health/finance tracking. | Separate privacy/security review and explicit approval required. Not an MVP dependency. |

## 3. Dependency map and allowed parallelism

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

Parallel tasks are allowed only when dependencies are complete and their changes do not conflict. Candidate pairs after prerequisites: LR-008 and LR-009; LR-010 and LR-011; LR-012 and LR-013 (once LR-011 is complete, with LR-009 also needed for LR-013); LR-016 and LR-017 once their respective dependencies are complete. Shared migrations or source files may still require serial work. Never mark LR-018 complete while any LR-001–LR-017 work remains incomplete.

## 4. Product decisions to resolve before implementation

Record each decision in the relevant spec before coding the affected task. Until resolved, use the “safe interim rule” below only for planning; it is not permission to implement that behavior.

| Decision ID | Decision needed | Affected tasks | Safe interim rule (planning only) |
|---|---|---|---|
| D-01 | What qualifies a task for companion awards? Are awards allowed before task completion? What per-task/period caps apply? Who can correct/reverse? | LR-013 | Awards are separate and bounded; do not invent eligibility or numeric caps. |
| D-02 | Does a review request select one reviewer or multiple? Is quorum needed? Can the owner self-approve? | LR-014–LR-015 | One selected authorized companion; no self-approval, unless explicitly changed. |
| D-03 | Which goal types/rule operators ship initially? Can completion be reversed after source correction? | LR-010 | Constrained rule set only; do not add scripting or decide reversal semantics silently. |
| D-04 | Exact calendar rules for recurring achievements: week start, timezone changes, annual boundaries, DST gaps/folds. | LR-007, LR-010 | Owner timezone; do not hardcode a locale/week-start policy without confirmation. |
| D-05 | In-app only or external push/email/SMS reminders; which provider/platform and consent behavior? | LR-008 | In-app only; no external provider. |
| D-06 | Evidence may be text/URLs only or uploaded files? If uploads, what storage, scanning, retention, and authorization? | LR-014, LR-018 | Do not implement file uploads until decisions are made. |
| D-07 | Hosting region/provider, identity providers, invitation channel, account export/deletion, retention policy. | LR-003, LR-011, LR-018 | Keep provider-specific choices out of code until selected. |
| D-08 | What is the task-completion reopening policy and how does it affect earned progress? | LR-005, LR-010 | Preserve source and ledger history; do not make automatic destructive reversals. |
| D-09 | Manual time overlap policy: allow, warn, or reject? | LR-006 | Timer overlap prevention is required; manual-entry overlap behavior remains configurable/unresolved. |

## 5. Task execution cards

Task definitions in [backlog.md](backlog.md) remain canonical for detailed scope. These cards add an explicit execution sequence, boundaries, output evidence, and stop criteria. Each task must still satisfy its full backlog acceptance criteria and [implementation.md](implementation.md).

### A. Foundation and practical activity management

#### [ ] LR-001 — Bootstrap responsive application and quality gates
**Do only:** Create the app skeleton, configure the approved language/framework, environment validation, lint/typecheck/test commands, CI, base layout, and readiness endpoint.

**Order:** inspect current repo/git state → confirm empty/greenfield assumptions → scaffold → establish scripts → add minimal smoke test → configure CI → run all checks.

**Must not:** Add product domain models, auth, databases, billing, analytics, or visual assets beyond a neutral base shell.

**Evidence required:** documented setup commands; CI check output; readiness smoke test; no secrets in client bundle.

**Done when:** backlog LR-001 criteria pass and a clean checkout can install, build, and test.

**Stop if:** repository contains untracked/user work or existing app files not accounted for by the plan; do not overwrite them.

#### [ ] LR-002 — PostgreSQL, migrations, and test database
**Do only:** Configure PostgreSQL connection, Drizzle migration tooling, isolated test DB, fixtures, and schema bootstrap checks.

**Order:** establish safe test DB config → configure migration generation/application → create empty baseline migration metadata → test fresh database setup → prove tests refuse production connection.

**Must not:** Add business tables ahead of the corresponding domain task; run migrations against shared/production DB.

**Evidence required:** fresh migrate succeeds; test DB isolation verified; migration/test instructions documented.

**Done when:** LR-002 integration checks pass and local/CI DB setup is reproducible.

**Stop if:** database provider/hosting choice is required but not approved or credentials are missing; use local/test configuration only.

#### [ ] LR-003 — Identity, profile, workspace ownership, private defaults
**Do only:** Add session-based auth, user/profile/timezone, one private personal workspace, route guards, and server-side owner resolution.

**Order:** decide provider boundary (D-07 before external identity setup) → schema/migration → session helpers → workspace lookup service → route guards → profile API/UI → cross-owner negative tests.

**Must not:** Build companion access, public profiles, social discovery, or allow body/query owner IDs to establish authority.

**Evidence required:** tests for no session, owner A vs owner B, profile timezone persistence; session values are server-derived.

**Done when:** all workspace access is private and cross-user API tests fail closed.

**Stop if:** selected auth provider or account lifecycle requirement is unknown and affects implementation.

#### [ ] LR-004 — Accessible app shell and navigation
**Do only:** Build responsive layout, design tokens, keyboard/focus behavior, reduced motion support, and routes/navigation placeholders for major areas.

**Must not:** Implement the illustrated desk-room home (LR-016) or fake nonfunctional feature controls.

**Evidence required:** authenticated route smoke tests, desktop/mobile navigation checks, keyboard and reduced-motion check.

**Done when:** core destinations are directly reachable and shell states are accessible.

#### [ ] LR-005 — Projects, tasks, hierarchy, tags, quick activity
**Do only:** Create CRUD/archive for nested projects, tasks/subtasks, tags and quick activity logging, plus task state transitions.

**Order:** define hierarchy constraints → migration/schema → repositories/services → validation and owner policy → endpoints → forms/lists/detail views → unit/integration/E2E tests.

**Must not:** Add timers, schedules, achievement mechanics, companion visibility, or presumed task-point award behavior.

**Evidence required:** same-workspace foreign keys/checks; cycle prevention; owner isolation; independent quick activity path.

**Done when:** full LR-005 criteria pass. Task reopening behavior must be resolved (D-08) before implementing its interaction.

#### [ ] LR-006 — Actual time, timers, corrections, timesheets, reports
**Do only:** Implement actual-time records, timer lifecycle, manual entry/corrections, daily/weekly views, project totals, and default timer overlap prevention.

**Order:** define timer state machine and exact duration calculation → schema and one-active-timer DB constraint → transactional timer service → manual entries/corrections → endpoints → timer/timesheet UI → concurrency tests.

**Must not:** Store planned time here, auto-complete tasks on timer stop, grant points automatically, or silently discard corrected records.

**Evidence required:** overlap race test; pause excludes paused duration; start/stop retry behavior; manual correction audit; daily/weekly totals reconcile.

**Done when:** full LR-006 criteria pass. Resolve manual time overlap policy (D-09) before defining rejection behavior.

### B. Planning and progression

#### [ ] LR-007 — Schedule rules, occurrences, planned-versus-actual
**Do only:** Add weekly schedule rules, deterministic occurrences, timezone-aware day/week views, occurrence actions, overdue state, and comparison with actual entries.

**Order:** resolve D-04 recurrence/timezone rules → schema for versioned rule and stable occurrence key → generation service → transition service → secured generation invocation → API/UI → boundary/retry tests.

**Must not:** Treat a planned duration as an actual time entry; mark missed occurrences complete; change/remove points because an occurrence was missed.

**Evidence required:** duplicate generator run creates no duplicate; DST tests; missed task stays incomplete; reschedule is represented in history; timer launch does not force completion.

**Done when:** all LR-007 tests/acceptance pass and planned vs actual remains independently queryable.

#### [ ] LR-008 — In-app reminders and resilient dispatch
**Do only:** Persist reminder/notification state, provide in-app inbox and snooze, and expose a narrowly authenticated, retry-safe scheduled entry point.

**Must not:** Add push/email/SMS without decision D-05; assume a continuously running process; change task completion when notification fails.

**Evidence required:** duplicate invocation does not duplicate notification; failure is observable; user can still see upcoming/overdue tasks.

**Done when:** dispatch recovery and unavailable-background-execution scenarios pass.

#### [ ] LR-009 — Personal achievement points and character XP ledgers
**Do only:** Add separate append-only personal point and XP transactions with source references, idempotency, and compensating corrections.

**Must not:** Add companion points here; merge values into a single score; infer XP from hours unless an explicit product rule says so.

**Evidence required:** DB uniqueness/source identity; retry produces one transaction; correction is compensating; API/UI labels distinguish the two ledgers.

**Done when:** full LR-009 criteria pass with no cross-ledger mutation.

#### [ ] LR-010 — Achievement definitions, links, evaluator, periods
**Do only:** Implement the approved goal types, hierarchy, task-achievement link contributions, allowed rule operators, prerequisites, periodic history and deterministic progress evaluation.

**Order:** resolve D-03/D-04/D-08 → define canonical evidence types and dedupe key → schema → evaluator pure functions → transactional evidence/grant persistence → recalculation policy → APIs/UI → period/hierarchy tests.

**Must not:** Let parent totals be the sum of child rewards if that duplicates evidence; grant companion points or recognition as achievement credit; silently rewrite historical periods.

**Evidence required:** many tasks/many achievements test; direct/children/hybrid parent tests; same evidence deduplication; daily/weekly/monthly/annual boundaries; recomputation after link/target/source correction.

**Done when:** each supported rule has explicit behavior and tests. Do not offer a user-authored scripting language.

### C. Companion access and recognition

#### [ ] LR-011 — Companion invitations, scoped permissions, revocation
**Do only:** Create invitation/accept/decline/revoke lifecycle, permission grants/presets, aliases, and filtered shared read projections.

**Order:** define permission keys/scopes → schema → relationship lifecycle services → policy functions → shared projection queries → APIs/UI → direct-resource ID and revoked-grant tests.

**Must not:** Treat a relationship as blanket access; use aliases as identity; authorize via UI visibility alone; let a companion edit owner task/personal points.

**Evidence required:** access matrix tests for owner, permitted companion, out-of-scope companion, revoked companion, unrelated user, and anonymous user.

**Done when:** every read/list/aggregate uses server policy and revocation is effective on the next request.

#### [ ] LR-012 — Comments and encouragement
**Do only:** Add private comments on explicitly shared contexts and clearly defined deletion/report handling.

**Must not:** Create public feeds, unrestricted direct messages, or notification previews containing private content.

**Evidence required:** permitted context, unshared context, post-revocation read/write, actor/alias separation tests.

**Done when:** comments cannot reveal the existence or contents of unshared records.

#### [ ] LR-013 — Everyday companion task awards
**Do only:** Record separate companion awards with contributor, recipient, task, amount, timestamp, idempotency, limits, attribution, and controlled correction.

**Order:** resolve D-01 → define caps and correction authority → schema/unique keys → award transaction/policy → correction pathway → owner/companion DTOs → tests/UI.

**Must not:** Require a milestone review unless explicitly decided; convert award amount to personal achievement points or XP; allow unlimited re-awards.

**Evidence required:** multiple companions on same task; duplicate retry; cap race; source/actor display; correction history; revoked award permission denial.

**Done when:** full LR-013 criteria pass and each displayed total can be traced to individual award records.

#### [ ] LR-014 — Immutable milestone versions and review lifecycle
**Do only:** Create milestone version snapshots, selected reviewer request, statuses, pending review inbox, more-info/decline/withdraw/resubmit transitions.

**Order:** resolve D-02/D-06 → define state machine and allowed transitions → version/request schema → policy/transaction service → endpoints → owner/reviewer views → lifecycle/security tests.

**Must not:** Let reviewer edit owner records; let an old decision approve changed content; silently replace a version; expose evidence beyond granted scope.

**Evidence required:** unauthorized reviewer denied; request tied to exact version; more-info and decline remain distinct; resubmission creates new version; owner withdrawal and revoke behavior tested.

**Done when:** every status transition and permission case is test-covered and auditable.

#### [ ] LR-015 — Approval-bound badges/appreciation and Recognition Hall
**Do only:** Attach optional badge/appreciation to an approval decision and display recognition privately according to grants.

**Must not:** Treat a badge as approval itself; require a badge for approval; award on pending/declined requests; expose publicly; modify points/XP.

**Evidence required:** approve without badge; optional appreciation; duplicate approval/badge prevented; failed transaction shows no success/reveal; private hall access tests.

**Done when:** approval is persisted before any reveal animation and record links reviewer, date, and version.

### D. Product experience, insights, release

#### [ ] LR-016 — Cozy desk-room home
**Do only:** Build illustrated functional entry points for calendar, tasks/projects, timer, learning/hobbies, achievements, recognition, and messages.

**Must not:** Make the desk the only route to actions; add decorative controls without working destinations; introduce blocking animations.

**Evidence required:** mobile and desktop layout; keyboard access; visible labels; reduced motion; functional destination test for each object.

**Done when:** desk complements conventional pages and is not required for any critical flow.

#### [ ] LR-017 — Owner-scoped insights
**Do only:** Add practical time, schedule variance, project/tag/topic, and achievement reports sourced from existing records.

**Must not:** Store derived totals as competing sources of truth; imply tracked time equals mastery, productivity, or worth; include health/finance in MVP.

**Evidence required:** aggregate reconciliation tests; empty/date boundary cases; owner isolation; neutral labels.

**Done when:** filters and totals work and report access does not broaden sharing permissions.

#### [ ] LR-018 — Security, operations, account lifecycle, release verification
**Do only:** Complete threat review, audit policy, backup/restore, operational observability, rate limits, retention/export/deletion decisions, deployment/runbook and final regression.

**Must not:** Claim security based only on hidden UI; add destructive account deletion before history/retention behavior is decided; log private content to aid debugging.

**Evidence required:** restore exercise; critical-path E2E; all permission regression tests; scheduler failure recovery; runbook; account lifecycle decisions recorded.

**Done when:** no known private data access issue; restore and release acceptance checks pass; all MVP tasks LR-001–LR-017 are complete.

#### [ ] LR-019 — Sensitive finance and health tracking (post-MVP only)
**Do only:** Proceed after LR-018 and separate explicit approval of classification, consent, sharing, retention, deletion, export, and security.

**Must not:** Include in MVP or reuse generic companion permissions without new sensitive-data grant design.

**Evidence required:** privacy review; field-level access tests; no leakage to logs/general reports/companion views; export/deletion validation.

**Done when:** dedicated security/privacy review approves the feature. This task is not required for MVP release.

## 6. Standard execution prompt for a coding model

Copy this prompt when assigning one task. Fill in the bracketed fields. Do not ask the model to “implement the whole roadmap.”

```text
Implement only [LR-ID and task title] from spec/life-rpg/backlog.md.

Read first:
- spec/life-rpg/implementation-roadmap.md
- spec/life-rpg/PRD.md
- spec/life-rpg/architecture.md
- spec/life-rpg/backlog.md (the full LR task)
- spec/life-rpg/implementation.md

Repository safety:
- Inspect the current repository and git status before editing.
- Do not overwrite existing or uncommitted work.
- If the repo conflicts with the greenfield architecture, a dependency is incomplete, or a product decision is unresolved, stop and report the exact blocker. Do not guess.

Scope:
- Implement only this LR task and its necessary tests/docs.
- Do not start dependent or unrelated LR tasks.
- Do not add external services, new major dependencies, public features, or sensitive-data features unless the task and approved spec require them.
- Follow server-side ownership/permission enforcement and the data invariants in the roadmap.

Before editing, report:
1. Files/modules expected to change.
2. Data migration/API/permission impact.
3. Acceptance tests to run.
4. Any unresolved decision (if one exists, stop before implementation).

After editing:
- Run the applicable unit, integration, typecheck, lint, build, accessibility, and E2E checks available in this repository.
- Fix failures caused by the change; do not bypass checks.
- Report changed files, checks and results, acceptance criteria met, and any remaining limitation.
- Do not mark the LR task complete unless every acceptance and definition-of-done item passes.
```

## 7. Final MVP release gate

Do not call the MVP complete until all of the following are true:

- [ ] LR-001 through LR-018 completed, with LR-018 confirming release readiness; LR-019 remains excluded/gated.
- [ ] The practical activity flow works without achievements or companions enabled.
- [ ] Planned and actual time remain separate in persistence, API, and UI.
- [ ] Timer overlap, pause/resume, retry, and manual correction behavior is tested.
- [ ] Missed and rescheduled occurrences do not auto-complete or erase progress.
- [ ] Personal points, companion points, character XP, and recognition remain separate and auditable.
- [ ] Achievement hierarchy, task-to-many-achievement, recurring period, correction, and deduplication tests pass.
- [ ] Companion permissions are tested via direct API/resource requests, including revoked access.
- [ ] Everyday companion awards are distinct from milestone approvals and duplicate/cap controls work.
- [ ] Milestone decisions are version-bound and tested for decline, more-info, resubmission, edits, and duplicate attempts.
- [ ] Notification/background failures do not lose tasks, mark work complete, or duplicate user-visible records.
- [ ] Cozy views are responsive, keyboard-operable, and reduced-motion aware; routine actions never wait for animation.
- [ ] Reports reconcile to source records and do not expose other users' data.
- [ ] Migration, backup/restore, and operational instructions are validated.
- [ ] All blocking decisions in Section 4 have recorded outcomes for the features being shipped.
