# Life RPG — UI Component & View Inventory (Design Spec)

> Companion document for an AI designer. Lists every screen, view, and reusable component the application needs across the full MVP (LR-001–LR-018), with purpose, key functionality, states, and design requirements. Cozy, warm, pastel aesthetic; accessible; responsive; reduced-motion aware. Practical views must stay directly reachable without going through the desk scene.

## 1. Design system (existing tokens)

- **Palette (light):** background `#f7f1e8`, surface `#fffaf2`, surface-2 `#f0e7d8`, foreground `#2b241c`, accent `#b8895a`, accent-2 `#8a6a4a`, muted `#7a6f62`, border `#e3d8c6`, focus `#6b4f32`, danger `#b04a3a`, success `#4f7a5a`.
- **Dark mode:** supported via `prefers-color-scheme` (see `globals.css`).
- **Typography:** Geist Sans (UI), Geist Mono (numeric/timer). Scale: h1 1.75rem/600, h2 1.25rem/600, body 0.875rem.
- **Shape:** rounded corners (0.625–0.875rem), soft shadows (1–2px), 1px borders.
- **Motion:** 80–120ms transitions; all disabled under `prefers-reduced-motion`.
- **Touch targets:** ≥ 44×44 CSS px on mobile.
- **Focus:** 2px solid focus ring, 2px offset, visible on all interactive elements.
- **Texture:** paper-like warm surfaces; subtle ambient motion (lamp glow, dust motes) only on desk home, disabled under reduced motion.

## 2. Global / shared components

### Layout & navigation
- **AppShell** — top-level layout: sticky header with primary nav, main content region (`#main`), footer. Provides skip-to-content link.
- **PrimaryNav (desktop)** — horizontal nav: Home, Tasks, Timer, Timesheet, Reports, Quests, Calendar, Companions, Milestones, Recognition, Inbox. Highlights active route.
- **MobileNav** — collapsible drawer or bottom tab bar for small screens; same destinations; ≥ 44px targets.
- **UserMenu** — display name/email + sign out; guest shows "Sign in".
- **SkipLink** — "Skip to main content" (already present).
- **Footer** — subtle branding.

### Primitives
- **Button** — variants: default, primary, danger, ghost, icon. Sizes sm/md. Loading state (spinner + disabled). Disabled state.
- **IconButton** — square, accessible label, tooltip.
- **Input** — text, email, number, datetime-local, date, time. Error border + message.
- **Textarea** — multi-line with char count optional.
- **Select** — native or custom dropdown; searchable variant for long lists (projects, tasks, timezones).
- **Checkbox / Radio / Switch** — with label and helper text.
- **FormField** — label + control + helper + error wrapper.
- **Card** — surface container with border/radius/shadow; variants: default, interactive (hover).
- **Modal / Dialog** — accessible dialog with focus trap, title, description, actions, close (Esc). Non-blocking preferred; avoid intrusive modals for routine actions.
- **ConfirmDialog** — destructive action confirmation.
- **Toast / Alert** — transient success/error/info; auto-dismiss; assertive for errors.
- **EmptyState** — illustrated placeholder + title + description + optional CTA.
- **LoadingSpinner / Skeleton** — for async data; skeleton for lists/cards.
- **ErrorState** — friendly error + retry.
- **Badge / Chip** — status, tag, permission, goal type. Color is never the only cue (icon/text included).
- **Tooltip** — hover/focus help.
- **ProgressBar** — determinate progress with label and accessible value.
- **Tabs** — keyboard-navigable tab panels.
- **Accordion / Collapsible** — for nested details, settings.
- **Table** — responsive (horizontal scroll on mobile), sortable headers optional, empty row.
- **Pagination** — page controls + count.
- **SearchInput** — debounced search.
- **FilterBar** — composable filters (date range, project, tag, status).
- **DatePicker / DateRangePicker / TimePicker / DateTimePicker** — accessible, timezone-aware display.
- **Avatar** — user/companion initials or image.
- **StatCard** — label + large value + optional trend/caption (non-judgmental language).
- **LinkCard** — navigational card (home grid).

## 3. Authentication & account (LR-003, LR-007, LR-018)

- **SignInPage** (`/signin`) — email input, "create account with email" (dev magic link/credentials), submit, loading, error. No password in MVP.
- **SignOut** — button in UserMenu.
- **ProfilePage** (`/profile`) — display name edit, IANA timezone selector (searchable), locale, preferences. Save/cancel, success toast, validation errors.
- **SettingsPage** (`/settings`) — notification/reminder preferences, reduced-motion preference, account section.
- **AccountLifecycleSection** — export data (download), delete account (confirm dialog with consequences), retention info. (Gated by approved decisions.)

## 4. Home — cozy desk room (LR-016)

- **DeskRoomHome** (`/`) — immersive illustrated room; objects are real buttons/links with accessible labels; conventional nav always available. Responsive: isometric room on desktop, vertical stack of object cards on mobile.
- **DeskCalendarObject** — entry to timetable/upcoming tasks.
- **NotebookObject** — entry to tasks/projects.
- **DeskTimerObject** — entry to timer; shows running state indicator.
- **BookshelfObject** — entry to learning topics/hobby journeys.
- **AchievementDisplayObject** — entry to quests/achievements.
- **TrophyShelfObject** — entry to Recognition Hall.
- **LettersAreaObject** — entry to inbox/reviews/invitations; unread badge.
- **AmbientLayer** — lamp glow, dust motes; disabled under reduced motion; non-blocking.
- **ProgressSceneVariants** — subtle scene changes based on progress (optional, non-blocking).
- **HomeCardGrid** (current interim home) — card links to Timer, Timesheet, Reports, Tasks, Sign in (fallback/non-decorative entry).

## 5. Projects & tasks (LR-005)

- **ProjectsPage** (`/projects`) — list/tree of projects; create button; archive toggle.
- **ProjectTree** — nested project list with expand/collapse, parent/child indentation, cycle-safe.
- **ProjectCard / ProjectRow** — name, description, task count, archived badge, actions (edit, archive, delete).
- **ProjectForm** — create/edit: name, description, parent project selector (same workspace), archive toggle. Validation errors.
- **TasksPage** (`/tasks`) — tasks grouped by project/status; filters (project, tag, status, due date); create task button.
- **TaskList** — list of TaskCards with bulk? (no bulk in MVP maybe).
- **TaskCard / TaskRow** — title, status, project, tags, due date, estimate, personal points, subtask count, completion toggle.
- **TaskDetail** — full task view: description, subtasks, tags, schedule link, achievement links, time entries, comments (if shared), activity logs, completion history.
- **TaskForm** — create/edit: title, description, project, parent task, tags, status, due date, estimate, personal point value, completion. Validates acyclic parent.
- **SubtaskList** — nested tasks under a task with add-inline.
- **TaskStatusBadge** — todo / in progress / done with icon+text.
- **CompletionToggle** — checkbox/button with brief non-blocking transition on complete; reopen policy per D-08.
- **TagPicker** — multi-select tags with create-new inline.
- **TagChip** — removable tag chip.
- **TagManager** (`/tags` or settings) — CRUD tags, rename, delete with usage count.
- **QuickActivityLogForm** — log activity: optional task/project, kind, occurred time, duration, notes. Works with no task/project.
- **ActivityLogList** — chronological list of quick logs with edit/delete.
- **ArchiveRestoreControls** — archive/restore project or task.

## 6. Timer & time entries (LR-006)

- **TimerPage** (`/timer`) — implemented baseline; big clock, state, controls, manual entry.
- **TimerDisplay** — large mono clock (HH:MM:SS), state label, task name.
- **TimerControls** — Start (with task selector), Pause, Resume, Stop. Disables appropriately by state.
- **TimerTaskSelector** — dropdown of tasks; "No task" option.
- **TimerStateBadge** — running/paused/stopped/idle.
- **ReloadRecoveryIndicator** — shows recovered timer after reload.
- **ManualEntryForm** — start/end datetime, task, notes; validation (end > start); overlap policy per D-09.
- **TimeEntryList** / **TimeEntryRow** — on timesheet; edit/correct.
- **CorrectionDialog** — edit an entry with reason; creates audited correction.

## 7. Timesheet (LR-006)

- **TimesheetPage** (`/timesheet`) — implemented baseline.
- **DateRangeFilter** — from/to date inputs + apply (shared component).
- **DailyTotalsGrid** — per-day totals.
- **EntriesTable** — sortable columns: start, end, duration, source, task/project, notes.
- **EntryRow** — with edit/correct/delete actions (owner only).
- **TotalSummary** — total tracked in range (non-judgmental).

## 8. Reports / insights (LR-017, LR-006)

- **ReportsPage** (`/reports`) — implemented baseline (time by project).
- **TimeByProjectList** — project name + tracked time + share bar.
- **TotalTrackedCard** — total tracked.
- **PlannedVsActualReport** — variance per task/occurrence/project (planned vs actual).
- **AchievementProgressReport** — progress by achievement/period.
- **LearningHoursByTopic** — bookshelf/learning topics.
- **TagTimeReport** — time by tag.
- **FiltersBar** — date range, project, tag, grouping.
- **EmptyReportState** — "No data yet" with guidance.
- **ExportButton** — export report (CSV?) (optional, gated).

## 9. Schedule / timetable (LR-007, LR-008 partial)

- **CalendarPage** (`/calendar`) — day/week timetable; upcoming & overdue.
- **DayView / WeekView** — time grid with occurrences and time entries optionally.
- **WeekNavigator** — prev/next week, today.
- **ScheduleRuleForm** — task, recurrence definition (daily/weekly/monthly/annual, rrule), timezone, local start time, expected duration, active window, reminder settings, version. Validates.
- **ScheduleRuleCard / Row** — summary + edit/deactivate.
- **OccurrenceCard** — scheduled task, time, status (upcoming/overdue/completed/skipped), actions.
- **OccurrenceActions** — snooze, reschedule, skip, complete, start timer.
- **SnoozeDialog** — pick snooze duration.
- **RescheduleDialog** — new date/time.
- **OverdueBadge** — clear overdue indicator (not alarming).
- **PlannedVsActualComparison** — per occurrence planned vs actual linked time.
- **MissedOccurrenceState** — remains overdue; never auto-completed; no progress loss.

## 10. Notifications / inbox (LR-008)

- **NotificationBell** — icon with unread count badge.
- **InboxPage** (`/inbox` or `/letters`) — notification list.
- **NotificationList** — chronological, grouped by day.
- **NotificationItem** — type icon, title, body, timestamp, read/unread, related link, snooze/dismiss.
- **MarkAllRead** — action.
- **ReminderPreferencesForm** — which reminders, timing, quiet hours (if approved), enable/disable.
- **EmptyInbox** — cozy empty state.

## 11. Achievements / progression (LR-010)

- **QuestsPage** (`/quests`) — achievement tree + progress.
- **AchievementTree** — hierarchical view (parent/child) with expand/collapse, acyclic.
- **AchievementCard** — goal type icon, title, target, progress bar, status, period, prerequisites.
- **AchievementForm** — goal type, title, parent, progression mode (direct/children/hybrid), target/condition, recurrence, timezone, prerequisites, personal point value, rule version. Validates acyclic parent.
- **GoalTypeBadge** — Main Quest, Side Quest, Hobby Journey, Achievement, Recurring Challenge, Collection.
- **TaskAchievementLinkEditor** — many-to-many task↔achievement with contribution value, evidence policy/version.
- **AchievementPeriodHistory** — current + past periods with progress/status.
- **PeriodSelector** — switch between periods.
- **EvidenceList** — canonical evidence per period (source type/id, contribution, rule version).
- **PrerequisiteList / UnlockBadge** — prerequisites and unlocked state.
- **AchievementProgressBar** — progress vs target.
- **CompletionCelebration** — major milestone animation (non-blocking, reduced-motion aware).
- **UnlockReveal** — prerequisite unlock feedback.

## 12. Ledgers — personal points & XP (LR-009)

- **PersonalPointsBalance** — distinct labeled balance (never combined with XP or companion points).
- **XpBalance** — distinct labeled balance.
- **PointTransactionList** — append-only transactions: amount (signed), reason, source, date, correction ref.
- **TransactionRow** — with correction link.
- **XpEventList** — XP events: amount, source, rule version, date.
- **CorrectionDialog** — compensating transaction with reason.
- **LedgerEmptyState** — no transactions yet.
- **NoCombinedScore** — explicit UI rule: never show a single combined total.

## 13. Companions (LR-011, LR-012, LR-013)

- **CompanionsPage** (`/companions`) — relationships list + invite.
- **InviteCompanionForm** — email/token, send invitation, expiry info.
- **InvitationCard** — state (pending/accepted/declined/revoked/expired), inviter/recipient, actions.
- **AcceptDeclineInvitation** — flow for recipient.
- **PermissionGrantsEditor** — presets + per-permission toggles (shared task/schedule status, selected project/task/tag views, shared time entries, selected achievement progress, task awards, comments, review requests, milestone approval) + resource scope selector. Default deny.
- **CompanionAliasEditor** — display alias (presentation-only; cannot affect permissions/audit).
- **CompanionRelationshipCard** — status, alias, grants summary, revoke action.
- **RevokeAccessDialog** — confirm revocation; explains immediate effect.
- **SharedView (companion)** — filtered read-only views of owner data per grants: shared tasks, schedule, time, achievements, comments.
- **CompanionDashboard** — companion's landing for a relationship.
- **CommentThread** — on shared task/achievement context.
- **CommentComposer** — body input, submit, permission-gated.
- **CommentItem** — author alias, body, timestamp, delete/report (policy-checked).
- **CommentEmptyState**.

## 14. Companion awards (LR-013)

- **AwardPointsForm** — task selector, amount (bounded), note; eligibility indicator; duplicate prevention feedback.
- **CompanionAwardList** — per task and per companion contributions.
- **AwardRow** — actor, recipient, task, amount, time, correction ref.
- **AwardCorrectionDialog** — compensating correction with reason.
- **PerContributorTotals** — per-companion totals (separate from personal points/XP).
- **AggregateCompanionPoints** — total companion-awarded (labeled distinctly).
- **EligibilityBadge** — whether task eligible for award (per D-01).
- **LimitReachedState** — when cap reached.

## 15. Milestones & review (LR-014, LR-015)

- **MilestonesPage** (`/milestones`) — list of milestones with status.
- **MilestoneCard** — title, context, current version, status (not submitted/pending/more info/approved/declined/withdrawn).
- **MilestoneForm** — create/edit milestone (title, context).
- **MilestoneVersionEditor** — description, message, evidence snapshot (text/links; uploads gated by D-06).
- **VersionHistoryList** — immutable versions with author/time.
- **SubmitForReviewDialog** — select authorized reviewer (per D-02), confirm.
- **ReviewRequestCard** — state, version, reviewer, timestamps.
- **ReviewInbox** (`/reviews` or letters) — pending review requests for a companion reviewer.
- **ReviewDecisionForm** — approve / decline / request more info + feedback; version-bound.
- **MoreInfoRequestView** — owner sees requested info; resubmit as new version.
- **WithdrawDialog** — withdraw a pending request.
- **ResubmitFlow** — create new version after decline/more-info.
- **ApprovalBadgeSelector** — optional badge choice at approval.
- **AppreciationStars** — optional appreciation at approval.
- **RecognitionReveal** — non-blocking celebration animation triggered only after approval persisted; reduced-motion aware.
- **DuplicateActionGuard** — prevents duplicate approval/badge.

## 16. Recognition Hall (LR-015)

- **RecognitionHallPage** (`/recognition` or trophy shelf) — private list of approved recognition.
- **RecognitionCard** — milestone, version, reviewer (alias), badge, appreciation, date.
- **RecognitionEmptyState** — no recognition yet.
- **PrivateBadge** — indicates private (not public).

## 17. Audit & operations (LR-018, mostly non-UI)

- **AuditEventViewer** (admin/owner debug, optional) — list of audit events with minimal metadata.
- **BackupRestoreStatus** — operational indicator (optional).

## 18. Design requirements checklist (apply to all components)

- Warm, cozy, muted pastel aesthetic; paper-like surfaces; rounded corners; soft shadows.
- Accessible labels, semantic headings, keyboard navigation, visible focus, color-not-only-state.
- Touch targets ≥ 44px on mobile; responsive layouts (mobile-first).
- Reduced-motion support; animations non-blocking and not required to understand state.
- Loading, empty, success, error states for every async view.
- Non-judgmental language (no mastery/worth framing; tracked time is not productivity).
- Direct conventional routes in addition to desk objects; desk is not a gate.
- Companion views show only permitted fields; no private data leakage.
- Distinct visual treatment for personal points vs XP vs companion points vs recognition (never combined).
- Empty states use cozy illustrations; progress subtly changes scenes where applicable.
- Forms validate at boundary; show field-level errors; disable submit while pending.

## 19. Notes for the designer

- The app is a modular monolith (Next.js); components are React + Tailwind. Prefer composition over large monoliths.
- Cozy desk-room home is LR-016 (later phase); functional views (tasks, timer, timesheet, reports, calendar, quests, companions, milestones, recognition, inbox) are the primary, always-available surfaces.
- Several decisions are unresolved (D-01–D-09); components touching those areas should be designed with placeholders/variants and not assume a specific policy (e.g., award eligibility, reviewer count, evidence uploads).
- Health/finance tracking (LR-019) is post-MVP and gated; do not design for it now except as a future extension point.
