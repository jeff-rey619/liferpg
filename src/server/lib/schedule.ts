// Weekly recurrence helpers for LR-007 (schedule rules + occurrences).
// Pure functions; no DB or framework dependencies. Recurrence strings are
// RRULE-compatible (weekly subset) so they can be upgraded to a full RRULE
// parser later without changing stored data.

const DAY_NAMES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;
const DAY_TO_INDEX: Record<string, number> = {
  MO: 0, TU: 1, WE: 2, TH: 3, FR: 4, SA: 5, SU: 6,
};

export type WeeklyRule = { byDays: number[]; interval: number };

export function parseWeeklyRule(rrule: string): WeeklyRule | null {
  if (!rrule) return null;
  const map: Record<string, string> = {};
  for (const part of rrule.split(";")) {
    const [k, v] = part.split("=");
    if (k && v) map[k.trim().toUpperCase()] = v.trim();
  }
  if (map.FREQ !== "WEEKLY") return null;
  const interval = map.INTERVAL ? parseInt(map.INTERVAL, 10) : 1;
  if (!Number.isFinite(interval) || interval < 1) return null;
  const byDays: number[] = [];
  if (map.BYDAY) {
    for (const d of map.BYDAY.split(",")) {
      const idx = DAY_TO_INDEX[d.trim().toUpperCase()];
      if (idx !== undefined) byDays.push(idx);
    }
  }
  if (byDays.length === 0) return null;
  return { byDays: [...new Set(byDays)].sort((a, b) => a - b), interval };
}

export function weekdayNames(days: number[]): string[] {
  return days.map((d) => DAY_NAMES[d]).filter(Boolean);
}

// --- timezone helpers (IANA, via Intl) ---

export function utcToLocalDate(date: Date, tz: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date); // en-CA -> YYYY-MM-DD
}

function tzOffsetMs(at: Date, tz: string): number {
  const utcStr = at.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = at.toLocaleString("en-US", { timeZone: tz });
  return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

export function localDateToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, mo, da] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const naive = new Date(Date.UTC(y, mo - 1, da, h, mi, 0, 0));
  const offset = tzOffsetMs(naive, tz);
  return new Date(naive.getTime() - offset);
}

function weekdayInTz(date: Date, tz: string): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(date);
  const jsMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const js = jsMap[wd];
  if (js === undefined) return 0;
  return js === 0 ? 6 : js - 1;
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

function mondayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay(); // 0=Sun..6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(Date.UTC(y, m - 1, d + offset));
  return mon.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

export type ExpandRule = {
  rrule: string;
  timezone: string;
  localStartTime: string;
  expectedDurationMinutes: number | null;
  activeFrom: string | null;
  activeUntil: string | null;
};

export type ExpandedOccurrence = {
  occurrenceKey: string;
  scheduledStart: Date;
  scheduledEnd: Date | null;
};

export function expandOccurrences(
  rule: ExpandRule,
  rangeStart: Date,
  rangeEnd: Date,
): ExpandedOccurrence[] {
  const parsed = parseWeeklyRule(rule.rrule);
  if (!parsed) return [];
  const tz = rule.timezone || "UTC";
  const startStr = utcToLocalDate(rangeStart, tz);
  const endStr = utcToLocalDate(rangeEnd, tz);
  const fromStr = rule.activeFrom && rule.activeFrom > startStr ? rule.activeFrom : startStr;
  const untilStr = rule.activeUntil && rule.activeUntil < endStr ? rule.activeUntil : endStr;
  if (fromStr > untilStr) return [];

  const anchorMonday = mondayOf(rule.activeFrom ?? fromStr);
  const result: ExpandedOccurrence[] = [];
  let cursor = fromStr;
  while (cursor <= untilStr) {
    const wd = weekdayInTz(new Date(cursor + "T12:00:00Z"), tz);
    if (parsed.byDays.includes(wd)) {
      const weekMon = mondayOf(cursor);
      const weekIndex = Math.round(daysBetween(anchorMonday, weekMon) / 7);
      if (weekIndex >= 0 && weekIndex % parsed.interval === 0) {
        const scheduledStart = localDateToUtc(cursor, rule.localStartTime, tz);
        if (scheduledStart >= rangeStart && scheduledStart <= rangeEnd) {
          const scheduledEnd =
            rule.expectedDurationMinutes != null
              ? new Date(scheduledStart.getTime() + rule.expectedDurationMinutes * 60 * 1000)
              : null;
          result.push({ occurrenceKey: cursor, scheduledStart, scheduledEnd });
        }
      }
    }
    cursor = addDays(cursor, 1);
  }
  return result;
}

export function isOverdue(
  occ: {
    scheduledEnd: Date | null;
    scheduledStart: Date;
    status: string;
  },
  now: Date,
): boolean {
  if (occ.status !== "pending") return false;
  const end = occ.scheduledEnd ?? new Date(occ.scheduledStart.getTime() + 60 * 60 * 1000);
  return end.getTime() < now.getTime();
}