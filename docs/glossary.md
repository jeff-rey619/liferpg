# Glossary — Cozy RPG ↔ Plain Terms

Use the **Plain term** in all UI copy, labels, buttons, empty states, and error messages.
The cozy flavor is only for the app's *name* and *visual theme* — never for functional text.
This keeps the UI consistent and avoids confusing jargon.

## Functional terms (these are real features)

| Plain term | Cozy name (do NOT use in UI) | Where it lives |
|---|---|---|
| Home | Desk Chamber | `/` |
| Tasks | Task Ledger, Quests | `/tasks` |
| Projects | Projects & Expeditions, Expeditions, Canopy Trees | `/projects` |
| Timer | Brass Pomodoro | `/timer` |
| Timesheet | Time Ledger, Field Ledger | `/timesheet` |
| Activity Log | Activity & Field Chronicle, Chronicle | `/activity` |
| Reports | Almanac | `/reports` |
| Schedule | — | `/schedule` |
| Add Task | Inscribe a New Quest, Inscribe Quest | tasks modal |
| Add Project | Establish New Project, Plant project | projects modal |
| Quick Log | Inscribe Quick Activity Log | activity modal |
| Task | Quest | everywhere |
| Project | Expedition, Canopy Tree, Timber Plot | everywhere |
| Points | Acorn XP, Personal Points | task rows |
| Status | Pending / In Progress / Completed | task rows |
| Tags | — | task rows |
| Due Date | — | task rows |
| Estimate | — | task rows |

## Decorative-only (visual flavor, never functional — greyed out, `aria-hidden`)

| Decorative element | Simple description |
|---|---|
| Acorn Bank / Ledger Vault | fake currency counter |
| Vitality / Full Hearts | fake health meter |
| XP bar / LV7 badge | fake level indicator |
| Season chip (Season of Amber Leaves) | fake season label |
| Solstice Cycle chip | fake cycle label |
| Decor HUD strip (Canopy: N Timber Plots, Guild Synchrony) | fake stats bar |
| Keeper Pippin | fake mascot reference |
| Archive Tome #12 | fake book counter |
| Hearth Curios & Honors | fake achievement shelf |
| Sun Sprout / Tea Kettle / Astrolabe tiles | fake desk objects |
| Companion Post / Unopened Letters | fake inbox |
| Weather chip (Breezy) | fake weather |
| Sticky note (Next: 3:00 PM) | fake itinerary |
| Settler Bounty / Warm Tea bonus | fake progress threshold |
| Nature / Crafting / Exploration color legend | fake categorization |

## Rule
- If a term maps to a real API field → use the **Plain term**.
- If it has no API/data behind it → it is **decorative**; render greyed out with `aria-hidden`
  and a "Decor" or "Soon" badge, `cursor-default`, no hover, not focusable.
- Do not invent new cozy jargon in labels. Keep copy short and literal.