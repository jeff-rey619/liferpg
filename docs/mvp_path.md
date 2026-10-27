# MVP Path — Decorative vs. Functional Inventory

This note tracks every UI element in the "Hearth & Timber" interface and classifies it as:

- **FUNCTIONAL** — backed by a working feature, clickable, real data.
- **LOCKED** — backed by a roadmap item that is planned but not yet implemented (will be built).
- **DECORATIVE** — pure visual flavor. No plan to implement ever. Must be clearly marked so users
  never mistake it for a working control.

## Strong indicator convention for DECORATIVE items
Every purely decorative element MUST carry all of the following so it is never confused for a
working control:

1. Visual de-emphasis: opacity ~0.4–0.6 + `grayscale` (or a muted color), no hover lift, no
   bevel press, no shadow on hover.
2. `cursor-default` (never `cursor-pointer`).
3. `aria-hidden="true"` (and `tabindex="-1"` if focusable).
4. A small "Soon" / "Decorative" badge or tooltip text explaining it is flavor only.
5. No click handler and no `href`.

LOCKED items use the same de-emphasis + badge, but the badge reads "Locked" (or "Coming") and the
element may link to a future page once implemented.

## Header HUD
| Element | Status | Notes |
|---|---|---|
| Nav tabs (Desk Chamber, Tasks, Projects, Schedule, Brass Pomodoro, Time Ledger, Activity, Almanac) | FUNCTIONAL | Real routes. |
| Player badge (name + class chip) | FUNCTIONAL (name) / DECORATIVE (class chip, XP bar) | Name from session. Class chip + XP bar are flavor (no class/level system). |
| "LV7" level badge | DECORATIVE | No leveling system. |
| XP bar (65%) | DECORATIVE | No XP ledger in MVP. |
| Acorn Bank (420 🌰) | DECORATIVE | No currency/economy. No roadmap item. |
| Vitality (5 hearts, "Full Hearts") | DECORATIVE | No health/damage mechanic. No roadmap item. |
| Cycle (Day/Dusk/Night + clock) | DECORATIVE (cosmetic) | Real clock, but no gameplay effect. |
| Sign in / Profile / Sign out buttons | FUNCTIONAL | Real auth. |

## Desk Chamber (home)
| Element | Status | Notes |
|---|---|---|
| Daily Hearth Quests bubble (done/total + progress bar) | FUNCTIONAL | Real task counts. |
| Lamp: Golden Radiance chip | DECORATIVE | No lighting toggle. |
| Hearth Curios & Honors shelf (Sun Elixir, Master Herbalist, Quiet Haven, Disc IV) | DECORATIVE | No trophy/achievement system. |
| Calendar card (day, month, season, weather chip) | FUNCTIONAL (date/season) / DECORATIVE (weather chip, sticky note, "unfold itinerary") | Weather + itinerary are flavor. |
| Field Ledger & Quests (task list, quick-add, toggle, expand) | FUNCTIONAL | Real /api/tasks CRUD. |
| Brass Pomodoro mini card (Wind Up / Reset links) | FUNCTIONAL (links to /timer) / DECORATIVE (dial is static) | Dial is flavor; buttons route to timer. |
| CRT terminal (total focus, projects tracked) | FUNCTIONAL | Real /api/reports/time. |
| Sun Sprout, Tea Kettle, Astrolabe tiles | DECORATIVE | No desk-object interactions. |
| Companion Post tray | DECORATIVE | No inbox/companion system. |
| Pippin mascot card | DECORATIVE | No companion. |
| Quick-access strip (Tasks, Projects, Activity, Tags) | FUNCTIONAL | Real links. |

## Other pages
| Element | Status | Notes |
|---|---|---|
| Task status chips (Completed / In Progress / Pending) | FUNCTIONAL | Real status. |
| "+N Acorn XP" chip on tasks | DECORATIVE | Decorative flavor; `personalPoints` exists but no economy. |
| TaskLedger "Expand/Fold Ledger" | FUNCTIONAL | Toggles list. |
| Timesheet edit/delete | FUNCTIONAL | Real PATCH/DELETE. |
| Reports date filters | FUNCTIONAL | Real query params. |
| Schedule weekly grid + occurrence actions | FUNCTIONAL | Real /api/schedule-rules + /api/occurrences. |
| Profile form (display name, TZ, locale) | FUNCTIONAL | Real /api/profile. |

## Roadmap items (LOCKED — will be implemented later)
These are planned; their UI surfaces are LOCKED (de-emphasized + "Locked"/"Coming" badge) until shipped:

- LR-008 — In-app reminders / inbox
- LR-009 — Personal points & XP ledgers (would back the XP bar / Acorn Bank)
- LR-010 — Achievements / goals / recurring periods (would back Hearth Curios & Honors)
- LR-011 — Companion sharing
- LR-012 — Comments
- LR-013 — Companion awards
- LR-014 — Immutable milestone versions + review lifecycle
- LR-015 — Recognition hall
- LR-016 — Full cozy desk objects as functional entry points
- LR-017 — Insights / planned-vs-actual reports (partially done via schedule)
- LR-018 — Security, ops, account lifecycle, release verification
- LR-019 — Finance & health tracking (post-MVP, gated)

## Purely decorative (no plan to ever implement)
These have no roadmap item and should stay DECORATIVE-only, clearly marked:

- Acorn Bank (420) — no economy/currency feature planned.
- Vitality (5 hearts, "Full Hearts") — no health/damage mechanic planned.
- XP bar + "LV7" level badge — no leveling/class system planned (LR-009 is points ledger, not levels).
- Pippin mascot card — no companion feature (LR-011 is sharing, not a mascot).
- Plant (Sun Sprout) — no growth mechanic.
- Trophy shelf (Hearth Curios & Honors) — no achievement display beyond what LR-010 covers; the shelf itself is flavor.
- Decor tiles (Tea Kettle, Astrolabe, Terrarium) — no interactions.
- Companion Post tray — no inbox (LR-008 is in-app reminders, not a mailbox UI).
- Lamp chip, weather chip, sticky note, "unfold itinerary" — flavor.
- "+N Acorn XP" chip on tasks — decorative; personalPoints exists but no economy.

## Rule of thumb
If an element is DECORATIVE, it must never look like a button, never hover-lift, never be focusable, and always carry a "Soon"/"Decorative" badge + `aria-hidden`.
If it is LOCKED, it is de-emphasized + badge "Locked"/"Coming", and may become clickable once the roadmap item ships.
Everything else is FUNCTIONAL and must be clearly interactive.