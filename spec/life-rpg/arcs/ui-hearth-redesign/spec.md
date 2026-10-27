# Spec: "Hearth & Timber" UI Redesign

## Goal
Rebuild the UI so every page visually matches `spec/life-rpg/designs/stitch_cozy_desk_rpg_interface/screen.png`,
showing ONLY our real features. Port the visual language (chunky bevels, parchment cards, hard offset
shadows, woodgrain desk, dusk wall) — do not copy `code.html` wholesale (it has fake game data).

## Scope
- Restyle: AppShell (HUD header), Home, Timer, Timesheet, Reports, Sign-in, error/not-found.
- New UI on existing APIs: task ledger on Home (list / quick-add / toggle done); time-entry edit+delete in Timesheet.
- Game flavor (XP bar, Acorn Bank, hearts, mascot, plant, trophy shelf): decorative + static.

## Feature mapping
| Real feature | Design element (code.html lines) | Where it goes |
|---|---|---|
| Nav: /, /timer, /timesheet, /reports | Nav tab group (253–270) | AppShell HUD |
| Session user + sign in/out | Player badge pill (208–224) + backpack button (284–286) | AppShell HUD |
| Current date/time | "Cycle: Dusk 06:42 PM" pill (273–279) | AppShell HUD |
| Tasks API (list/create/toggle) | "Field Ledger & Quests" (467–522) | TaskLedger on Home |
| Task counts (done/total) | "Daily Hearth Quests 3/5" bar (324–338) | Home room frame |
| DeskCalendar date | Wirebound calendar card (432–466) | Home desk board |
| Timer page | "Brass Pomodoro" dial (526–554) | /timer + mini card on Home |
| Reports total + by project | CRT terminal (555–574) | Home mini terminal + /reports |
| Timesheet entries + edit/delete | Parchment ledger table | /timesheet |
| Manual time entry form | Toy inputs (517) + game buttons | /timer "Ledger by hand" card |
| Sign-in | Parchment card (659–664) | /signin |

## Hard rules
- Do NOT modify server/api/schema/drizzle/tests/package.json. UI-only change (+ one client component).
- No new dependencies. Icons = emoji + tiny inline SVG.
- Tailwind v4 + existing globals.css classes; extend globals.css, no CSS modules or inline styles.
- Use CSS vars / Tailwind tokens; never hardcode a color that has a token.
- Keep a11y: real interactive elements, keep :focus-visible + prefers-reduced-motion, aria-hidden on decor.
- Keep dark-mode token override working; don't chase pixel parity.
- Every existing feature keeps working; change markup/classes, not logic.
- Emoji only where the design uses them.

## Out of scope
Achievements/trophy modals, companions/mail, notifications inbox, schedule/itinerary, XP/points logic,
projects/tags CRUD UI, dark-mode pixel parity, Material Symbols icon font, any backend/schema change.