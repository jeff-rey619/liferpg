# Life RPG — Product and Architecture Decision Log

This log is the source of truth for decisions that are not fully determined by the current specification. Unresolved decisions must not be guessed by an implementation model. Resolve an item before implementing its affected tasks, then update this file and the relevant PRD, architecture, backlog, or roadmap document.

## How to use this log

- **Status:** `Unresolved`, `Proposed`, `Approved`, `Rejected`, or `Superseded`.
- A proposal is not an approved decision. Only mark a decision `Approved` after explicit project-owner confirmation.
- Record the decision date and decision owner when resolved. Do not invent either value.
- Update affected specifications and tests when an approved decision changes requirements.
- Preserve old decisions for auditability. If a decision changes, mark the prior record `Superseded` and create a new record or add a dated revision.
- If a task depends on an unresolved decision, stop that task and ask for clarification. Continue only on independent tasks whose requirements are determined.

## Decision dashboard

| ID | Topic | Status | Affected tasks |
|---|---|---|---|
| D-01 | Companion award eligibility, limits, and corrections | Unresolved | LR-013 |
| D-02 | Milestone reviewer count and approval authority | Unresolved | LR-014, LR-015 |
| D-03 | Initial achievement rules and completion reversal | Unresolved | LR-010 |
| D-04 | Recurrence calendar and timezone boundaries | Unresolved | LR-007, LR-010 |
| D-05 | Reminder delivery channels | Unresolved | LR-008 |
| D-06 | Milestone evidence and attachment support | Unresolved | LR-014, LR-018 |
| D-07 | Hosting, identity, invitation and account lifecycle | Unresolved | LR-003, LR-011, LR-018 |
| D-08 | Task completion reopening and progression effects | Unresolved | LR-005, LR-010 |
| D-09 | Manual time-entry overlap behavior | Unresolved | LR-006 |

## D-01 — Companion award eligibility, limits, and corrections

- **Status:** Unresolved
- **Affected tasks:** LR-013
- **Question:** Which tasks may receive companion-awarded points? Must the task be completed? What per-task, per-companion, or time-period limits apply? Who may correct or reverse an accidental award, and under what conditions?
- **Current requirements:** Awards are separate from milestone approval, attributed to contributor/recipient/task/amount/time, not unlimited or duplicated, correctable with an audit trail, and never automatically converted to personal points or XP.
- **Must not assume:** Task-completion eligibility, numeric caps, reset period, owner/companion correction authority, or recipient veto behavior.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD companion-award rules; architecture award constraints; backlog LR-013 acceptance/tests; roadmap D-01.

## D-02 — Milestone reviewer count and approval authority

- **Status:** Unresolved
- **Affected tasks:** LR-014, LR-015
- **Question:** Does each request select exactly one companion, or may it be reviewed by multiple companions? If multiple reviewers are allowed, is one approval sufficient or is a quorum required? Can the owner ever self-approve?
- **Current requirements:** Only authorized companions review; decisions are explicit, version-bound and auditable; reviewers cannot change owner task or personal-point records. The roadmap's proposed default is one selected reviewer and no self-approval, but it is not approved policy.
- **Must not assume:** Multi-reviewer behavior, quorum, reviewer reassignment, or whether approval can be changed after submission.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD review workflow; architecture uniqueness/state model; backlog LR-014/LR-015; roadmap D-02.

## D-03 — Initial achievement rules and completion reversal

- **Status:** Unresolved
- **Affected tasks:** LR-010
- **Question:** Which goal types and rule operators are available in the first release? If a source record or contribution changes after completion, can an achievement become incomplete again? How should the historical grant and point transactions be represented?
- **Current requirements:** Support the listed goal types, hierarchy, direct/children/hybrid modes, prerequisites, recurring periods and custom task contributions. Avoid double-counting and retain audit history.
- **Must not assume:** Arbitrary rule scripting, an unrestricted condition language, automatic completion reversal, or deletion of a previously earned transaction.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD progression rules; architecture evaluator/recalculation rules; backlog LR-010; roadmap D-03.

## D-04 — Recurrence calendar and timezone boundaries

- **Status:** Unresolved
- **Affected tasks:** LR-007, LR-010
- **Question:** Which day begins a week? Are recurring periods based on the owner's local timezone? What happens when a schedule falls in a daylight-saving gap or fold? How are timezone changes applied to existing rules and open periods?
- **Current requirements:** Persist IANA timezone, test period boundaries and DST, make generation deterministic, and retain historical period records.
- **Must not assume:** A universal week-start day, UTC calendar periods for all users, an unstated DST disambiguation rule, or retroactive rewriting of occurrences after timezone changes.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD recurrence behavior; architecture schedule/period model; backlog LR-007/LR-010 tests; roadmap D-04.

## D-05 — Reminder delivery channels

- **Status:** Unresolved
- **Affected tasks:** LR-008
- **Question:** Are in-app reminders sufficient for MVP, or is email/push (or another channel) a launch requirement? If external delivery is required, which platforms/providers and consent controls are approved?
- **Current requirements:** Reminders are configurable, retry-safe and must degrade safely if background execution is unavailable. The current MVP proposal is in-app notifications only.
- **Must not assume:** External provider, costs, push permissions, delivery guarantees, quiet-hour behavior, or consent defaults.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD notifications; architecture job/provider model; backlog LR-008 scope/tests; roadmap D-05.

## D-06 — Milestone evidence and attachment support

- **Status:** Unresolved
- **Affected tasks:** LR-014, LR-018
- **Question:** Can submissions contain only text/links, or may users upload screenshots/files? If files are supported, what storage, size/type limits, malware scanning, access controls, retention and deletion behavior are required?
- **Current requirements:** Owners may share evidence with the selected authorized reviewer. Access must respect grants, and history is version-bound.
- **Must not assume:** Public URLs, unrestricted uploads, file types, storage vendor, scanning, retention, or that an attachment remains accessible after access revocation.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD evidence options; architecture storage/access model; backlog LR-014/LR-018; roadmap D-06.

## D-07 — Hosting, identity, invitation, and account lifecycle

- **Status:** Unresolved
- **Affected tasks:** LR-003, LR-011, LR-018
- **Question:** Which hosting region/provider and identity providers are in scope? How are companions invited? What export, account deletion, retention, and recovery expectations apply?
- **Current requirements:** Authenticated accounts, invitation-based private relationships, explicit revocation and account lifecycle decisions before release.
- **Must not assume:** A vendor, geography, login method, email delivery mechanism, retention period, or irreversible deletion policy.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD account/invitation expectations; architecture deployment/auth; backlog LR-003/LR-011/LR-018; roadmap D-07.

## D-08 — Task completion reopening and progression effects

- **Status:** Unresolved
- **Affected tasks:** LR-005, LR-010
- **Question:** May a completed task be reopened? If reopened or corrected, does achievement progress recalculate, and can an achievement completion be reversed? How are prior point transactions and history retained?
- **Current requirements:** Corrections and progression must be auditable; missed schedule items do not erase earned progress; canonical evidence drives progress.
- **Must not assume:** Completion is permanently final, reopening automatically reverses points, or historical transactions may be deleted.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD task/progression behavior; architecture evidence recalculation; backlog LR-005/LR-010; roadmap D-08.

## D-09 — Manual time-entry overlap behavior

- **Status:** Unresolved
- **Affected tasks:** LR-006
- **Question:** When a manual time entry overlaps another manual entry or a timer entry, should the system reject it, warn and allow it, or allow it only through an explicit correction flow? Do overlapping entries belonging to different tasks have a different rule?
- **Current requirements:** Prevent overlapping active timers by default. Manual time entries and corrections are supported and auditable. The PRD does not fully specify overlap policy for manual entries.
- **Must not assume:** Global prohibition on overlapping entries, automatic truncation/merging, or silent correction.
- **Decision:** _Unresolved — fill after approval._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** PRD time-entry rules; architecture validation policy; backlog LR-006 tests; roadmap D-09.

## Decision record template

Copy this section for each new decision. Keep the options and consequences concrete; do not mark a recommendation approved without confirmation.

```markdown
## D-XX — [Short topic]

- **Status:** Unresolved
- **Affected tasks:** [LR IDs]
- **Question:** [One precise question]
- **Options considered:**
  1. [Option] — [behavior and consequence]
  2. [Option] — [behavior and consequence]
- **Decision:** _Unresolved — fill after approval._
- **Rationale:** _Record confirmed rationale._
- **Decision owner:** _Not assigned._
- **Decision date:** _Not recorded._
- **Specification updates required:** [files/sections]
- **Tests/acceptance changes:** [tests to add/update]
```

## AI/implementation handoff rule

Before implementing an LR task, check this file for unresolved decisions that affect that task. If any are unresolved, do not infer an answer from examples, implementation convenience, or a proposed default. Ask for the decision and wait. If none apply, implement only the approved scope in the backlog and report the exact files and verification results.
