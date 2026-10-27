# Backlog: Simplify jargon, declutter, fix Tasks + Projects hierarchy UI

## A. Replace jargon with plain terms
- [ ] Tasks page: All Quests→All Tasks, + New Quest→+ New Task, Inscribe a New Quest→Add Task, Delete this quest?→Delete this task?, Acorn XP→Points, empty state→"No tasks yet. Add one above."
- [ ] Projects page: Projects & Expeditions→Projects, Hierarchical Expeditions Ledger→Project tree, Active Canopy Trees→Projects, Plant project→Add project, empty state→"No projects yet. Add one above."
- [ ] Timer page: Brass Pomodoro→Timer, Wind Up→Start, Stop & Bank→Stop, Ledger by Hand→Manual entry
- [ ] Timesheet page: Field Ledger→Timesheet
- [ ] Reports page: Almanac→Reports
- [ ] Activity page: Inscribe Quick Activity Log→Log activity
- [ ] AppShell nav: update labels to plain terms

## B. Remove scattered decorative clutter on functional pages
- [ ] Tasks: remove "Ledger Vault: 1,420 / Decor" pill
- [ ] Projects: remove "Almanac Decor" HUD strip
- [ ] Projects: remove "Season of Amber Leaves" chip
- [ ] Activity: remove "Archive Tome #12 / Decor" chip
- [ ] Activity: remove "Solstice Cycle 4" chip
- [ ] Check Timer/Timesheet/Reports/Schedule for stray decorative clutter and remove

## C. Fix Projects hierarchy UI
- [ ] Add `expandedIds: Set<string>` state (default all expanded)
- [ ] Rewrite renderTree: left toggle button (▸/▾) only if project has children
- [ ] Show name, description, task-count badge, archived badge
- [ ] Right side: Edit, Delete, "Add child" (opens create modal with parent pre-selected)
- [ ] Visible nesting: vertical guide line + horizontal elbow connectors + indent
- [ ] Keep inline edit as a `.card` inside the row

## D. Clean up Tasks UI
- [ ] Header: title + task-count badge + "+ New Task" button; remove decorative vault pill
- [ ] Filter row inside one `.card`: search input (🔍 icon) + segmented status pill + segmented range pill + project select (grouped)
- [ ] "Daily progress" bar with plain labels; remove "Bounty"/"Warm Tea bonus"
- [ ] Task rows: checkbox, title, status chip; second line = project, due, estimate, points, tags; right = Edit/Delete; subtask count as small badge
- [ ] Modal: heading "Add Task", plain fields, "Add Task"/"Cancel"

## Verification
- [ ] npm run typecheck
- [ ] npm run lint (only pre-existing schema.ts any)
- [ ] npm test
- [ ] Browser check on LAN IP: tasks/projects/activity render with plain terms, no scattered Decor badges, project tree shows expand/collapse + connectors
- [ ] Grep for leftover jargon

## Done when
All checkboxes ticked, all gates pass, and the UI reads in plain terms with no decorative
clutter on functional pages and a proper collapsible project tree.