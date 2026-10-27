# Life RPG — User Guide (MVP)

A cozy, game-like life manager. Track tasks, time, projects, tags, and activity. Everything is
private to your workspace.

## Getting started
1. Run `npm run dev` (binds to 0.0.0.0 for LAN access) and open http://localhost:3000 — or
   http://<your-LAN-IP>:3000 (e.g. http://192.168.137.27:3000).
2. Sign in with your email on the **Sign in** page (passwordless, dev-mode auth).
3. You land on the **Desk Chamber** (home): a cozy desk with a calendar, task ledger, timer,
   and stats terminal.

### Environment gotchas (already handled in this repo)
- **LAN access**: `next.config.ts` sets `allowedDevOrigins` for private IP ranges. Without it,
  Next.js blocks cross-origin dev requests and pages appear stuck on "Loading…" when opened via a
  LAN IP instead of localhost.
- **Fonts**: fonts are self-hosted in `src/app/fonts/` (imported via `src/app/fonts.css`), not
  loaded from `next/font/google`. The app builds and runs offline — Google Fonts would fail
  without internet.
- **NODE_ENV**: do not set `NODE_ENV` in `.env`. Next.js sets it automatically; a hardcoded value
  overrides the framework and breaks `next build` with a React dev/prod mismatch.
- **Docker**: dev uses `docker-compose.dev.yml` (NODE_ENV=development). For a production build run
  `NODE_ENV=production npm run build` (or use `docker-compose.yml`, which sets production).

## Navigation (header HUD)
The header is a game-style HUD. Tabs:
- 🪵 **Desk Chamber** — home desk scene.
- 📋 **Tasks** — full task ledger.
- 🌿 **Projects** — project tree.
- ⏳ **Brass Pomodoro** — timer + manual time entry.
- 📖 **Time Ledger** — timesheet (daily totals + entries).
- 📓 **Activity** — quick activity log.
- 📜 **Almanac** — reports (time by project).
- 👤 **Profile** — display name, timezone, locale.
- 🎒 **Sign out**.

## Tasks
- Home has a quick **Field Ledger & Quests** widget: tick a checkbox to mark done, type in
  "Inscribe a new cozy quest…" and press *Inscribe ✎* to add.
- **Tasks page** (`/tasks`): filter by project/status/search, create with project/parent,
  edit inline (title, status, project, due date, estimate, points, tags), delete, and view
  subtasks. Statuses: todo / in progress / done.

## Projects
- **Projects page** (`/projects`): plant a project (name, description, optional parent),
  view as a tree, edit/archive/unarchive, delete (tasks get unlinked). Toggle "Show archived".

## Tags
- **Tags page** (`/tags`): create tags, rename, delete (cascades to tasks). Tags can be
  attached to tasks in the task editor.

## Timer & time tracking
- **Brass Pomodoro** (`/timer`): *Wind Up* starts a timer (optionally linked to a task),
  *Pause* / *Resume* / *Stop & Bank*. Reload the page — an active timer recovers. *Ledger by hand*
  form records a manual entry (start/end/notes).
- **Time Ledger** (`/timesheet`): filter by date range, see daily totals and entries. Edit or
  delete any entry (confirm on delete).
- **Almanac** (`/reports`): total tracked time + time by project with progress bars; filter by
  date range.

## Activity
- **Activity page** (`/activity`): quick-log (kind, time, duration, notes, optional task/project)
  and view recent activity newest-first.

## Profile
- **Profile** (`/profile`): set display name, timezone (drives future schedule boundaries),
  locale. Saved via PATCH.

## Schedule & planned vs actual
- **Schedule page** (`/schedule`): create a weekly schedule rule for a task (pick weekdays,
  start time, duration, timezone, active range). Occurrences are generated for the displayed
  week. Navigate weeks with Prev/Next.
- Each occurrence: *Done* (mark complete), *Skip*, *Snooze* (enter a new datetime), *Reopen*.
- **Planned vs Actual** section: pick a task + date range to compare planned occurrences
  against tracked time (progress bar).

## Decorative elements
Anything greyed out / marked "Soon" (curios, decor tiles, companion post, mascot, weather chip,
sticky note) is visual flavor only — not yet implemented. Real controls are the chunky beveled
buttons and form inputs.

## Notes
- Tracked time is never framed as a measure of worth.
- Personal points, XP, companion points, and recognition are kept separate (not all implemented
  yet — coming in later roadmap tasks).
- Planned (scheduled) time and actual (tracked) time are separate data.