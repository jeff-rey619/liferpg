# Spec: Simplify jargon, declutter, fix Tasks + Projects hierarchy UI

## Goal
Refactor the Tasks and Projects pages (plus stray jargon on other pages) so they read clearly,
use plain language, and stop scattering decorative noise. Do NOT add new features.

## Problems
1. **Project hierarchy UI is bad** — flat recursive list with `paddingLeft` only; nesting is
   invisible; no expand/collapse; no tree connectors.
2. **Tasks UI is bad** — cluttered filter row, scattered decorative badges, confusing jargon.
3. **Decorative elements everywhere** — "Ledger Vault: 1,420 Decor", "Almanac Decor" HUD strip,
   "Season of Amber Leaves", "Keeper Pippin" scattered as noise.
4. **Inconsistent jargon** — "Quest"/"Inscribe", "Expeditions"/"Canopy Trees"/"Timber Plots",
   "Plant project". Must use plain terms from `docs/glossary.md`.

## Hard rules
- Do NOT add new features, endpoints, or dependencies.
- Do NOT change any API logic — JSX + state only.
- Keep all existing functionality working (create, edit, delete, toggle status, filters, search).
- Use the plain terms from `docs/glossary.md` exactly.
- Decorative flavor stays only on the Home page; functional pages are clean and literal.

## Approach

### A. Replace jargon with plain terms (all pages)
- Tasks: `All Quests`→`All Tasks`, `+ New Quest`→`+ New Task`, `Inscribe a New Quest`→`Add Task`,
  `Delete this quest?`→`Delete this task?`, `Acorn XP`→`Points`, empty state→`No tasks yet. Add one above.`
- Projects: `Projects & Expeditions`→`Projects`, `Hierarchical Expeditions Ledger`→`Project tree`,
  `Active Canopy Trees`→`Projects`, `Plant project`→`Add project`, empty state→`No projects yet. Add one above.`
- Timer: `Brass Pomodoro`→`Timer`, `Wind Up`→`Start`, `Stop & Bank`→`Stop`, `Ledger by Hand`→`Manual entry`
- Timesheet: `Field Ledger`→`Timesheet`
- Reports: `Almanac`→`Reports`
- Activity: `Inscribe Quick Activity Log`→`Log activity`
- Nav (AppShell): update labels to plain terms.

### B. Remove scattered decorative clutter on functional pages
DELETE on Tasks, Projects, Activity (and check Timer/Timesheet/Reports/Schedule):
- Tasks header "Ledger Vault: 1,420 / Decor" pill
- Projects "Almanac Decor" HUD strip
- Projects "Season of Amber Leaves" chip
- Activity "Archive Tome #12 / Decor" chip
- Activity "Solstice Cycle 4" chip

Decorative flavor stays only on Home. If any decorative item must remain, keep ONE
de-emphasized strip — never scattered badges.

### C. Fix Projects hierarchy UI (main bug)
Rewrite `renderTree` as a proper collapsible tree:
- State: `expandedIds: Set<string>` (default all expanded).
- Each row: left toggle button (▸/▾) shown only if the project has children; toggles that
  project's children visibility.
- Show name (bold), description (muted), task-count badge, archived badge.
- Right: Edit, Delete, "Add child" (opens create modal with parent pre-selected).
- Visible nesting: vertical guide line + horizontal elbow connectors (`border-l` on child list,
  `border-b`/`border-l` on child `<li>`), plus indent.
- Keep inline edit as a `.card` inside the row.

### D. Clean up Tasks UI
- Header: title + task-count badge + `+ New Task` button. Remove decorative vault pill.
- Filter row inside one `.card`: search input (🔍 icon) + segmented status pill (All/Pending/
  In Progress/Completed) + segmented range pill (Today/Week/All) + project `<select>`. Grouped,
  not loose chips.
- "Daily progress" bar (completed/total) with plain labels — remove "Bounty", "Warm Tea bonus".
- Task rows: checkbox, title, status chip; second line = project, due, estimate, points, tags;
  right = Edit/Delete. Tags fetched on load (already). Subtask count as a small badge.
- Modal: heading "Add Task", plain fields, "Add Task"/"Cancel".

## Files to change
- `src/app/tasks/page.tsx` — jargon, declutter, filter row, remove vault
- `src/app/projects/page.tsx` — jargon, remove decor strip/season chip, rewrite renderTree
- `src/app/activity/page.tsx` — jargon, remove Solstice/Archive Tome chips
- `src/app/timesheet/page.tsx` — "Field Ledger"→"Timesheet"
- `src/app/timer/page.tsx` — "Brass Pomodoro"→"Timer", "Wind Up"→"Start"
- `src/app/reports/page.tsx` — "Almanac"→"Reports"
- `src/components/AppShell.tsx` — nav labels

## Verification
1. `npm run typecheck`
2. `npm run lint` (only pre-existing schema.ts `any`)
3. `npm test`
4. Browser check on LAN IP (192.168.137.27:3000): tasks/projects/activity render with plain
   terms, no scattered Decor badges, project tree shows expand/collapse + connectors.
5. Grep for leftover jargon:
   `grep -rn "Quest\|Inscribe\|Expedition\|Canopy\|Timber Plot\|Keeper\|Solstice\|Almanac\|Field Ledger\|Brass Pomodoro\|Wind Up" src/`