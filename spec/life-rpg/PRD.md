# Life RPG — Product Requirements and Roadmap

## Product vision

Life RPG is a cozy, game-like life-management application combining practical daily tracking with optional RPG progression and private social accountability. It brings together time tracking, nested projects and tasks, timetables, recurring activities, achievements, companion-awarded points, milestone recognition, and an illustrated personal desk/room.

The product must remain useful as a practical life-management tool when users ignore the game mechanics.

## Product principles

1. Work management and time tracking remain useful without progression features.
2. Planned time and actual time are separate records and workflows.
3. Everything is private by default. Companion access is invited, scoped, server-enforced, and revocable.
4. Personal achievement points, character XP, companion points, and milestone recognition remain distinct.
5. Awards and progress are auditable and idempotent; current progress is derived from canonical evidence.
6. Missing a scheduled task never implies completion or removes earned progress.
7. Cozy visual design should not slow routine work or block direct navigation.
8. Time tracked is not a measure of mastery, productivity, or personal worth.

## MVP scope

The first useful end-to-end release includes:

- Responsive authenticated web app, private workspace, profile and timezone.
- Nested projects, tasks/subtasks, reusable tags, quick activity logging, task completion.
- Start/pause/resume/stop timer, manual entries and corrections, timesheets, project reports, and prevention of overlapping running timers by default.
- Weekly schedules and recurring activities, deterministic task occurrences, in-app reminders, snooze/reschedule/skip/complete actions, overdue handling, and planned-versus-actual reporting.
- A constrained achievement rule set with parent/child progression, task-achievement links, recurring history, personal point transactions, and separate XP events.
- Invitation-based companion access with granular sharing, comments/encouragement, and everyday companion awards.
- Version-bound milestone review requests, pending review inbox, more-information request, approval/decline, optional badges/appreciation, and private Recognition Hall.
- Cozy desk-room home screen and conventional, accessible functional views.
- Basic personal time and progression reports.

### Explicit MVP exclusions

- Native mobile apps, public profiles/achievement feeds, discovery, marketplace, multiplayer mechanics, and real-time collaboration.
- Email, SMS, and push reminders. Start with in-app notifications and a secured scheduled invocation.
- Arbitrary user-defined achievement scripting; begin with validated rule types.
- Health, spending, and financial records. These are sensitive domains requiring separate privacy, retention, consent, sharing, and security decisions.
- Advanced calendar integrations and complex recurrence beyond daily, weekly, monthly, and annual periods.
- Microservices or other infrastructure without demonstrated need.

## Phased roadmap

| Phase | Scope | Exit criteria / dependencies |
|---|---|---|
| 0 — Foundation | App skeleton, authentication, database/migrations, CI, domain validation and authorization primitives. | Ownership boundaries and migration/test workflow established before feature data. |
| 1 — Core activity management | Projects, tasks, tags, quick logging, timers/manual entries, timesheets and reports. | Timer invariants and source records covered by service/API behavior tests. |
| 2 — Timetable and reminders | Timetable, recurrence, occurrences, reminders, task actions and planned-vs-actual. | Idempotent generation and timezone/DST behavior tested; missed work never auto-completes. |
| 3 — Personal progression | Achievement hierarchy, task links, personal point ledger, XP ledger, recurrence and history. | Deterministic re-evaluation, no double-counting, historical periods retained. |
| 4 — Companion access | Invitations, scoped grants, shared projections and comments. | Cross-user, direct-resource-ID and revoked-access tests pass. |
| 5 — Everyday companion points | Independent awards, limits/corrections, attribution and per-contributor display. | Multi-companion and duplicate tests pass; no conversion into personal points or XP. |
| 6 — Milestone recognition | Immutable versions, review inbox/statuses, decisions, optional badges/appreciation. | Reviews bind to exact versions; duplicate actions blocked; owner records remain unchanged. |
| 7 — Cozy game UI | Desk-room home, functional objects, responsive layouts, accessibility and motion. | Direct navigation, keyboard/touch access, and reduced motion work. |
| 8 — Insights and life tracking | Broader reports and categories; sensitive finance/health only after separate approval. | Reports derive from canonical records and obey access scopes. |

## Core user flows

### Track work
Create a task/project or quick activity → start timer with optional task link → pause/resume/stop → actual time appears in timesheet/report. Manual corrections are audited. A timer stop does not itself complete a task.

### Plan work
Create a scheduled task or recurrence → generate deterministic occurrences using the owner's timezone → receive an in-app reminder → snooze, reschedule, skip, complete, or start timer. A missed occurrence remains overdue and does not erase progress.

### Progress personally
Configure an achievement and task links → qualifying canonical work creates achievement evidence and personal point transactions according to the rule version → XP events are separately applied by explicit rules → recurring period history remains viewable.

### Share with a companion
Invite a trusted person → they accept → owner grants individual permissions and scopes → companion sees only permitted views → owner revokes access and subsequent API requests are denied.

### Award everyday effort
An authorized companion opens an eligible shared task → awards bounded points → system records actor, recipient, task, amount, and timestamp → owner sees individual companion contributions separately from personal points and XP. This is not milestone approval.

### Review a milestone
Owner submits a milestone version and selects an authorized reviewer → reviewer inspects shared evidence and asks for information, declines, or approves → badge/appreciation are optional separate actions → edits and resubmissions create new versions → Recognition Hall shows approved recognition privately.

## Goal and progression requirements

Supported goal types include Main Quest, Side Quest, Hobby Journey, Achievement, Recurring Challenge, and Collection. The system supports parent/child achievements, many-to-many task links with custom contribution values, targets/completion conditions, prerequisites/unlocks, and direct/children/hybrid progression modes.

Daily, weekly, monthly, and annual recurring achievements retain historical period records. Parent progress uses canonical evidence and deduplication, not the sum of child rewards.

The following remain distinct in records and presentation:

1. Personal achievement points configured by the owner.
2. Character XP from explicit game progression rules.
3. Companion points awarded by another person.
4. Milestone recognition (approval, badge, appreciation), which is not a numeric balance.

## Companion and recognition requirements

Companion access is invitation-based and private. Permission presets may be customized. Permissions include shared task/schedule status, selected project/task/tag views, shared time entries, selected achievement progress, task awards, comments, review requests, and milestone approval. Display aliases are presentation-only and cannot change permission checks or audit identity.

Everyday companion awards do not require a milestone request. They record contributor, recipient, task, amount, and time; prevent duplicate/unlimited repeated awards; permit controlled audited corrections; and never automatically alter personal achievement points or XP.

Milestone states include not submitted, pending, additional information requested, approved, declined, and withdrawn. Review decisions bind to immutable submission versions. Approval, appreciation, and badge awards are separate choices. Decline does not delete the owner's achievement, task, or earned personal points. Owner edits/resubmits create a new version and preserve prior history. No public achievement system is part of MVP.

## Cozy visual and interaction requirements

The home is an immersive desk/room, not a mandatory intermediate page. Functional objects are direct entry points:

- Desk calendar — timetable and upcoming tasks.
- Notebook — tasks and projects.
- Desk timer — time tracking.
- Bookshelf — learning topics and hobby journeys.
- Achievement display — quests and milestones.
- Trophy shelf — approved recognition.
- Letters/message area — invitations, feedback, and review inbox.

Use warm muted/pastel colors, consistent typography/spacing, illustrated objects, subtle environmental details, responsive layouts, accessible labels, keyboard navigation, visible focus, and practical touch targets. Provide reduced-motion support. Avoid excessive shadows, intrusive modals, and unnecessary animation.

Routine completion gets a brief, unobtrusive transition. Major personal milestones may receive a more substantial celebration. Recognition reveal is triggered only after approval is persisted. Animations never block actions or navigation.

## Insights and later life tracking

Reports may include planned versus actual time, learning hours by topic, project time, task/tag reports, achievement progression, recurring history, spending/financial goals, health/activity records, and personal time allocation. Users may define categories and goals. Do not equate tracked time with mastery or worth. Sensitive records remain private unless the owner explicitly grants appropriate access. Health/finance data remains outside MVP pending a dedicated review.

## Decisions requiring confirmation before affected work

1. Companion points: confirm eligibility (e.g. completed task requirement), per-task/period limits, reversals, and whether caps are owner-configurable.
2. Review authority: proposed default is one selected authorized reviewer per request, no self-approval, and resubmission as a new version; decide if multiple reviewers/quorum are required.
3. MVP goal types, rule operators, completion reopening after corrections, and calendar boundary semantics for recurring periods.
4. Whether reminders must include external push/email, and the supported platform/provider.
5. Evidence support: text/links initially or uploads; uploads require storage, malware/content policy, retention, and permission design.
6. Hosting region/provider, identity providers, invitation channel, account export/deletion, and retention policy.
