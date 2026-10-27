import { describe, it, expect } from "vitest";
import {
  parseWeeklyRule,
  weekdayNames,
  localDateToUtc,
  utcToLocalDate,
  expandOccurrences,
  isOverdue,
} from "./schedule";

describe("parseWeeklyRule", () => {
  it("parses basic weekly", () => {
    expect(parseWeeklyRule("FREQ=WEEKLY;BYDAY=MO,WE")).toEqual({ byDays: [0, 2], interval: 1 });
  });
  it("parses interval", () => {
    expect(parseWeeklyRule("FREQ=WEEKLY;BYDAY=FR;INTERVAL=2")).toEqual({ byDays: [4], interval: 2 });
  });
  it("single day", () => {
    expect(parseWeeklyRule("FREQ=WEEKLY;BYDAY=SU")).toEqual({ byDays: [6], interval: 1 });
  });
  it("invalid freq returns null", () => {
    expect(parseWeeklyRule("FREQ=DAILY;BYDAY=MO")).toBeNull();
  });
  it("empty BYDAY returns null", () => {
    expect(parseWeeklyRule("FREQ=WEEKLY")).toBeNull();
  });
  it("bad interval returns null", () => {
    expect(parseWeeklyRule("FREQ=WEEKLY;BYDAY=MO;INTERVAL=0")).toBeNull();
  });
});

describe("weekdayNames", () => {
  it("maps indices to names", () => {
    expect(weekdayNames([0, 2, 6])).toEqual(["MO", "WE", "SU"]);
  });
});

describe("utcToLocalDate / localDateToUtc", () => {
  it("round-trips UTC date", () => {
    const d = new Date("2025-03-10T12:00:00Z");
    const s = utcToLocalDate(d, "UTC");
    expect(s).toBe("2025-03-10");
    const back = localDateToUtc(s, "12:00", "UTC");
    expect(back.toISOString()).toBe("2025-03-10T12:00:00.000Z");
  });
  it("converts to a timezone", () => {
    // 2025-03-10 09:00 America/New_York = 13:00 or 14:00 UTC depending DST
    const utc = localDateToUtc("2025-03-10", "09:00", "America/New_York");
    // EST (before spring forward Mar 9) is UTC-5, EDT UTC-4. Mar 10 is EDT -> 13:00 UTC
    expect(utc.toISOString()).toBe("2025-03-10T13:00:00.000Z");
  });
});

describe("expandOccurrences", () => {
  it("weekly Mon/Wed over 2 weeks -> 4 occurrences", () => {
    const rule = {
      rrule: "FREQ=WEEKLY;BYDAY=MO,WE",
      timezone: "UTC",
      localStartTime: "09:00",
      expectedDurationMinutes: 60,
      activeFrom: null,
      activeUntil: null,
    };
    const start = new Date("2025-01-06T00:00:00Z"); // Monday
    const end = new Date("2025-01-19T23:59:59Z");
    const occs = expandOccurrences(rule, start, end);
    expect(occs.length).toBe(4);
    expect(occs.map((o) => o.occurrenceKey)).toEqual([
      "2025-01-06",
      "2025-01-08",
      "2025-01-13",
      "2025-01-15",
    ]);
  });
  it("respects activeFrom/activeUntil", () => {
    const rule = {
      rrule: "FREQ=WEEKLY;BYDAY=MO",
      timezone: "UTC",
      localStartTime: "09:00",
      expectedDurationMinutes: 30,
      activeFrom: "2025-01-13",
      activeUntil: "2025-01-20",
    };
    const start = new Date("2025-01-01T00:00:00Z");
    const end = new Date("2025-01-31T23:59:59Z");
    const occs = expandOccurrences(rule, start, end);
    expect(occs.map((o) => o.occurrenceKey)).toEqual(["2025-01-13", "2025-01-20"]);
  });
  it("interval=2 skips a week", () => {
    const rule = {
      rrule: "FREQ=WEEKLY;BYDAY=MO;INTERVAL=2",
      timezone: "UTC",
      localStartTime: "09:00",
      expectedDurationMinutes: null,
      activeFrom: null,
      activeUntil: null,
    };
    const start = new Date("2025-01-06T00:00:00Z");
    const end = new Date("2025-01-26T23:59:59Z");
    const occs = expandOccurrences(rule, start, end);
    expect(occs.map((o) => o.occurrenceKey)).toEqual(["2025-01-06", "2025-01-20"]);
  });
  it("invalid rule returns empty", () => {
    const rule = {
      rrule: "FREQ=DAILY;BYDAY=MO",
      timezone: "UTC",
      localStartTime: "09:00",
      expectedDurationMinutes: null,
      activeFrom: null,
      activeUntil: null,
    };
    const start = new Date("2025-01-06T00:00:00Z");
    const end = new Date("2025-01-12T23:59:59Z");
    expect(expandOccurrences(rule, start, end)).toEqual([]);
  });
});

describe("isOverdue", () => {
  it("pending past end -> true", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    const occ = {
      status: "pending",
      scheduledStart: new Date("2025-01-09T09:00:00Z"),
      scheduledEnd: new Date("2025-01-09T10:00:00Z"),
    };
    expect(isOverdue(occ, now)).toBe(true);
  });
  it("completed -> false", () => {
    const now = new Date("2025-01-10T12:00:00Z");
    const occ = {
      status: "completed",
      scheduledStart: new Date("2025-01-09T09:00:00Z"),
      scheduledEnd: new Date("2025-01-09T10:00:00Z"),
    };
    expect(isOverdue(occ, now)).toBe(false);
  });
  it("future -> false", () => {
    const now = new Date("2025-01-08T08:00:00Z");
    const occ = {
      status: "pending",
      scheduledStart: new Date("2025-01-09T09:00:00Z"),
      scheduledEnd: new Date("2025-01-09T10:00:00Z"),
    };
    expect(isOverdue(occ, now)).toBe(false);
  });
});