# Life RPG — Implementation Handbook

This document explains how to implement the approved Life RPG backlog. It is a procedural guide, not application code. It assumes the greenfield responsive web architecture in [architecture.md](architecture.md) and tasks in [backlog.md](backlog.md).

## Implementation boundaries

- Work one backlog task (LR ID) or a clearly scoped subtask at a time.
- Respect declared dependencies; do not begin dependent work before its prerequisites are complete.
- Do not introduce application code until the product and implementation plan have been reviewed and approved.
- Keep this a modular monolith. Feature boundaries are modules, not separately deployed services.
- Keep the practical activity-management flows useful independently of RPG features.
- Do not add public social features or health/finance tracking to the MVP.

## Recommended module structure

Organize domain code by feature, with server-only data access and services:

```text
src/
  app/                    # pages, layouts, route handlers
  components/             # shared accessible presentation components
  features/
    activity/             # projects, tasks, tags, logs, timers, timesheets
    schedule/             # schedule rules, occurrences, reminders
    progression/          # achievements, evidence, personal points, XP
    companions/            # invitations, grants, shared projections, awards
    recognition/           # milestone versions, review decisions, badges
    insights/              # owner-scoped reports
  server/
    auth/                 # session and identity resolution
    db/                   # connection, schema and migrations
    policies/             # server-side authorization predicates
    jobs/                 # authenticated scheduled operations
    validation/           # request validation and error mapping
  tests/                  # unit, integration, and browser/e2e suites
```

Keep UI components free of authorization decisions. A hidden control is not an access-control policy. Route handlers should be thin and delegate domain behavior to server-side feature services.

## Standard implementation sequence

For each LR task:

1. **Confirm behavior.** Read the relevant PRD and architecture sections. Resolve any open product decision that changes data shape, permission, or lifecycle behavior before implementation.
2. **Define invariants.** List ownership, state transitions, uniqueness/idempotency, correction, and audit requirements for the task.
3. **Design persistence.** Specify entities, foreign keys, uniqueness constraints, indexes, delete behavior, and migration strategy before adding routes or UI.
4. **Implement domain services.** Put validation of business rules, transactions, concurrency handling, and durable side effects in server-only services.
5. **Apply authorization.** Resolve actor from the session; check ownership or a currently active scoped companion grant for each resource.
6. **Add API boundaries.** Validate input, derive owner/workspace scope server-side, return minimal typed DTOs, and map expected conflicts/errors consistently.
7. **Add UI.** Build accessible loading, empty, success, and error states. Provide direct functional routes in addition to the cozy desk entry points.
8. **Test behavior.** Add unit, integration, permission, and relevant browser tests. Include retries, concurrency, and negative access cases where applicable.
9. **Review documentation.** Update the backlog status and technical docs if a decision or contract changed; do not silently diverge from the approved spec.
10. **Verify completion.** Run relevant lint, typecheck, unit, integration, accessibility, and E2E checks before marking the task complete.

## Cross-cutting domain invariants

### Ownership and companion access

- Derive the authenticated actor from the server session, never from a submitted `ownerId` or `workspaceId` as an authorization source.
- Default every resource to private.
- Companion permissions are additive only when the owner grants them; enforce them in the server service/query path for every read and write.
- Apply resource scopes to individual records, lists, aggregates, comments, notifications, and evidence attachments.
- Check that the relationship and grant remain active on every request; revocation takes effect immediately.
- Companion display aliases are presentation-only. Permission checks and audit records use canonical account IDs.
- Companions may award eligible companion points or review an assigned milestone, but cannot edit the owner's task records or personal point values.

### Time and schedules

- Store actual instants in UTC; retain the owner's IANA timezone for schedule generation and period boundaries.
- Keep schedule rules/occurrences (planned time) distinct from time entries/timer sessions (actual time).
- Stopping a timer records actual time only; it does not automatically complete a task or grant achievement credit.
- Enforce at most one running timer per user in both service logic and a database constraint.
- Account explicitly for paused duration, retries, manual corrections, and concurrent start/stop requests.
- Missed occurrences remain overdue or otherwise explicitly unresolved; they are never marked complete automatically and do not erase earned progress.
- Occurrence generation and reminder dispatch must be deterministic and safe to retry.

### Progress, points, and recognition

- Keep personal achievement points, character XP, companion-awarded points, and milestone recognition as distinct records and displayed values.
- Do not implicitly convert or sum these into a single balance.
- Use append-only point/XP transactions with stable source/idempotency keys. Correct errors with compensating transactions and audit references.
- Evaluate achievement progress from canonical evidence. Parent achievements must not sum child rewards if that would count the same evidence more than once.
- Store evaluator/rule version and recurring period key with progress evidence. Preserve historical periods during recalculation.
- Bind each milestone review decision and recognition to an immutable milestone version. Edits or resubmissions create a new version; old approvals do not silently approve changed content.
- An approval can exist without a badge or appreciation. Recognition is not a currency.
- Trigger badge/review animation only after the approval transaction has succeeded and persisted.

## Data and migration conventions

- Use explicit foreign keys and workspace/owner constraints. Parent project, task, and achievement relationships must remain within the same owner/workspace and be acyclic.
- Add uniqueness constraints for many-to-many links, period grants, idempotency keys, active timer state, and duplicate review/recognition actions as required by the domain.
- Prefer database constraints for invariants that must hold under concurrency; application validation alone is insufficient for race-sensitive behavior.
- Make migrations small, ordered, reviewed, and reversible where practical. Test fresh database setup and migration against representative existing data when applicable.
- Avoid destructive schema/data changes without a reviewed migration and explicit recovery plan.
- Store exact integer-safe point amounts; do not use floating-point arithmetic for point ledgers or time totals.
- Keep audit payloads minimal. Do not put secrets or unnecessary private content in logs.

## API and service conventions

- API handlers authenticate, parse/validate, invoke a feature service, and serialize a minimal response.
- Services own business transitions and transaction boundaries. Keep multi-record changes—such as approval plus recognition, or timer stop plus time-entry write—atomic.
- Use idempotency keys for operations likely to be retried: timer start/stop, generated occurrences, reminder dispatch, companion awards, review decisions, and other ledger writes.
- Use transactions, unique constraints, and optimistic locking or row locking where concurrent operations can conflict.
- Validate all external/user-controlled input at the boundary. Do not trust UI validation.
- Use consistent API outcomes: unauthenticated, forbidden/not-found, conflict, and invalid input should be distinguishable internally and safely serialized.
- Return 404 for inaccessible resources where revealing existence would expose private data.
- Never serialize internal audit data or hidden private fields into companion DTOs.

## Background work and notifications

- Scheduled invocations must be authenticated and narrowly scoped.
- Make jobs safe to run more than once; use stable keys and database uniqueness to prevent duplicate occurrences and notifications.
- Persist notification state so clients can recover after delayed or unavailable background execution.
- A failed scheduler must not block users from seeing upcoming/overdue tasks or manually acting on them.
- Record operational failure metadata without logging private message bodies or secrets.
- External push/email/SMS delivery is out of MVP unless explicitly approved with a provider, consent, retry, and retention design.

## Testing conventions

### Unit tests

Test pure domain rules: timer duration and transitions, schedule period boundaries, achievement evaluation/deduplication, point ledger rules, permission predicates, and milestone state transitions.

### Integration tests

Use a real isolated PostgreSQL test database for migrations, constraints, service transactions, and concurrency behavior. Test APIs under owner, authorized companion, revoked companion, unrelated user, and unauthenticated identities.

### Browser/E2E tests

Cover the critical user flows from the backlog: log/track work, plan/reschedule/miss work, view progression, invite/revoke companion, award everyday points, submit/review/resubmit milestone, and inspect private recognition. Include mobile layout and keyboard operation.

### Required negative tests

- Direct API/resource-ID access to another user's private records is denied.
- Revoking a grant invalidates later reads and writes.
- Companions cannot edit task records or personal point values.
- Duplicate request retries cannot create duplicate timers, awards, approvals, badges, occurrences, or notifications.
- A changed milestone version is not treated as previously approved.
- A failed notification/background job does not mark work complete or lose the reminder state.

Tests must assert domain behavior and authorization outcomes, not only that a component renders.

## Security and privacy review checklist

Before completing any feature involving user data, confirm:

- [ ] Identity and owner scope are resolved server-side.
- [ ] Authorization is checked for collection and single-resource reads, writes, aggregates, and related records.
- [ ] Companion permission is explicit, scoped, active, and revocable.
- [ ] Returned DTOs contain only fields the actor may see.
- [ ] Inputs are validated and mutations are protected against CSRF/session misuse as applicable.
- [ ] Retry and concurrency behavior cannot duplicate or bypass domain rules.
- [ ] Sensitive data is not exposed in logs, errors, URLs, or notification previews.
- [ ] New data has documented retention/deletion/export expectations where applicable.

## Accessibility and cozy UI checklist

- [ ] Essential controls have semantic labels and keyboard operation.
- [ ] Focus is visible and follows a sensible order.
- [ ] Status changes and errors are announced accessibly.
- [ ] Color is not the only way to convey state.
- [ ] Touch targets are usable on mobile; aim for at least 44×44 CSS px.
- [ ] Reduced-motion preferences are respected.
- [ ] Animation is non-blocking and does not delay navigation or routine actions.
- [ ] The functional page remains reachable without navigating through the desk scene.

## Definition of Done

A backlog task is complete when:

1. Its agreed scope and dependencies are satisfied.
2. Schema/migrations, domain service, authorization, API, and UI are implemented where applicable.
3. Unit and integration tests cover expected and failure behavior; E2E tests cover critical user-visible behavior where applicable.
4. Security and permission tests verify actual server-side access controls.
5. Loading, empty, success, and error states are handled.
6. Accessibility requirements relevant to the feature are met.
7. Lint, typecheck, tests, and build pass in CI.
8. Relevant spec/API documentation reflects any changed contract or decision.
9. No unrelated source or specification scope has been added.

## Work-unit and change management

- Keep a change focused on one LR task or a clearly documented subtask; avoid bundling unrelated phases.
- A proposed change should state the LR ID, dependencies, files/modules affected, migration impact, permission impact, tests, and acceptance checks.
- If implementation reveals a requirement ambiguity, pause that scope and record the decision in the relevant specification before coding the ambiguous behavior.
- If a design change is needed, update `PRD.md`, `architecture.md`, or `backlog.md` as appropriate and obtain review before proceeding.
- Do not mark a task complete while a test, security check, migration, or acceptance criterion remains unresolved.
