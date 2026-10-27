"use client";

import { useEffect, useState } from "react";

type ScheduleRule = {
  id: string;
  taskId: string;
  rrule: string;
  timezone: string;
  localStartTime: string;
  expectedDurationMinutes: number | null;
  activeFrom: string | null;
  activeUntil: string | null;
  reminderMinutes: number | null;
};

type Occurrence = {
  id: string;
  ruleId: string;
  taskId: string;
  occurrenceKey: string;
  scheduledStart: string;
  scheduledEnd: string | null;
  status: string;
  completedTaskId: string | null;
};

type Task = { id: string; title: string };

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function mondayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(Date.UTC(y, m - 1, d + offset));
  return mon.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

function formatTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function SchedulePage() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState<string>("");
  const weekEnd = weekStart ? addDays(weekStart, 6) : "";

  // create rule form
  const [newTaskId, setNewTaskId] = useState("");
  const [newDays, setNewDays] = useState<number[]>([0]);
  const [newInterval, setNewInterval] = useState("1");
  const [newTime, setNewTime] = useState("09:00");
  const [newDuration, setNewDuration] = useState("60");
  const [newTz, setNewTz] = useState("UTC");
  const [creating, setCreating] = useState(false);

  // planned-vs-actual
  const [pvTask, setPvTask] = useState("");
  const [pvFrom, setPvFrom] = useState("");
  const [pvTo, setPvTo] = useState("");
  const [pvData, setPvData] = useState<{ planned: Occurrence[]; actualSeconds: number } | null>(null);

  async function loadAll() {
    try {
      const [rRes, tRes, oRes] = await Promise.all([
        fetch("/api/schedule-rules"),
        fetch("/api/tasks"),
        fetch(`/api/occurrences?from=${weekStart}&to=${weekEnd}&generate=true`),
      ]);
      if (!rRes.ok) throw new Error(`rules ${rRes.status}`);
      if (!tRes.ok) throw new Error(`tasks ${tRes.status}`);
      if (!oRes.ok) throw new Error(`occ ${oRes.status}`);
      setRules(await rRes.json());
      setTasks(await tRes.json());
      setOccurrences(await oRes.json());
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!weekStart) {
      Promise.resolve().then(() => setWeekStart(mondayOf(new Date().toISOString().slice(0, 10))));
      return;
    }
    Promise.all([
      fetch("/api/schedule-rules"),
      fetch("/api/tasks"),
      fetch(`/api/occurrences?from=${weekStart}&to=${weekEnd}&generate=true`),
    ])
      .then(async ([rRes, tRes, oRes]) => {
        if (!rRes.ok) throw new Error(`rules ${rRes.status}`);
        if (!tRes.ok) throw new Error(`tasks ${tRes.status}`);
        if (!oRes.ok) throw new Error(`occ ${oRes.status}`);
        setRules(await rRes.json());
        setTasks(await tRes.json());
        setOccurrences(await oRes.json());
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load");
        setLoading(false);
      });
  }, [weekStart]);

  const taskName = (id: string) => tasks.find((t) => t.id === id)?.title ?? "Unknown";

  async function createRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskId || newDays.length === 0) return;
    setCreating(true);
    setError(null);
    const dayNames = newDays.map((d) => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d]).join(",");
    const rrule = `FREQ=WEEKLY;BYDAY=${dayNames};INTERVAL=${newInterval || "1"}`;
    try {
      const res = await fetch("/api/schedule-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: newTaskId,
          rrule,
          timezone: newTz,
          localStartTime: newTime,
          expectedDurationMinutes: Number(newDuration) || null,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Could not create (${res.status})`);
      }
      const created: ScheduleRule = await res.json();
      setRules((prev) => [...prev, created]);
      const oRes = await fetch(`/api/occurrences?from=${weekStart}&to=${weekEnd}&generate=true`);
      if (oRes.ok) setOccurrences(await oRes.json());
      setNewTaskId("");
      setNewDays([0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create");
    } finally {
      setCreating(false);
    }
  }

  async function deleteRule(id: string) {
    if (!window.confirm("Delete this schedule rule and its occurrences?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/schedule-rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Could not delete (${res.status})`);
      setRules((prev) => prev.filter((r) => r.id !== id));
      setOccurrences((prev) => prev.filter((o) => o.ruleId !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function actionOccurrence(id: string, status: string, snoozeUntil?: string) {
    setError(null);
    try {
      const body: Record<string, unknown> = { status };
      if (snoozeUntil) body.snoozeUntil = snoozeUntil;
      const res = await fetch(`/api/occurrences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Could not update (${res.status})`);
      }
      const updated: Occurrence = await res.json();
      setOccurrences((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update");
    }
  }

  async function loadPv() {
    if (!pvTask) return;
    try {
      const params = new URLSearchParams({ taskId: pvTask });
      if (pvFrom) params.set("from", pvFrom);
      if (pvTo) params.set("to", pvTo);
      const res = await fetch(`/api/planned-vs-actual?${params.toString()}`);
      if (!res.ok) throw new Error(`pv ${res.status}`);
      setPvData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }

  if (loading) return <p className="muted">Loading schedule…</p>;

  const occsByDay: Record<string, Occurrence[]> = {};
  for (let i = 0; i < 7; i++) occsByDay[addDays(weekStart, i)] = [];
  for (const o of occurrences) {
    const rule = rules.find((r) => r.id === o.ruleId);
    const tz = rule?.timezone ?? "UTC";
    const localDay = new Date(o.scheduledStart).toLocaleDateString("en-CA", { timeZone: tz });
    if (occsByDay[localDay]) occsByDay[localDay].push(o);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Schedule</h1>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost text-xs" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            ← Prev
          </button>
          <span className="hud-pill">
            {weekStart} → {weekEnd}
          </span>
          <button type="button" className="btn btn-ghost text-xs" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Next →
          </button>
        </div>
      </div>

      {error && (
        <div className="toast-banner toast-error" role="alert">
          {error}
        </div>
      )}

      {/* Weekly grid */}
      <div className="woodgrain p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {DAY_LABELS.map((label, i) => {
            const day = addDays(weekStart, i);
            const dayOccs = occsByDay[day] ?? [];
            return (
              <div key={day} className="card flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="label text-xs">{label}</span>
                  <span className="text-xs text-muted">{day.slice(5)}</span>
                </div>
                {dayOccs.length === 0 ? (
                  <p className="muted text-xs">—</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {dayOccs.map((o) => {
                      const rule = rules.find((r) => r.id === o.ruleId);
                      const tz = rule?.timezone ?? "UTC";
                      return (
                        <li key={o.id} className="task-row flex-col items-start gap-1">
                          <div className="flex w-full items-center justify-between gap-1">
                            <span className="font-display text-xs font-bold text-mahogany">
                              {taskName(o.taskId)}
                            </span>
                            <span
                              className={[
                                "badge-seal text-[9px]",
                                o.status === "completed"
                                  ? "badge-sage"
                                  : o.status === "skipped"
                                    ? "badge-locked"
                                    : o.status === "snoozed"
                                      ? "badge-honey"
                                      : "badge-locked",
                              ].join(" ")}
                            >
                              {o.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted">
                            {formatTime(o.scheduledStart, tz)}
                            {o.scheduledEnd ? ` – ${formatTime(o.scheduledEnd, tz)}` : ""}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {o.status !== "completed" && (
                              <button type="button" className="btn btn-secondary text-[10px] px-2 py-0.5 min-h-0" onClick={() => actionOccurrence(o.id, "completed")}>
                                Done
                              </button>
                            )}
                            {o.status === "completed" && (
                              <button type="button" className="btn btn-ghost text-[10px] px-2 py-0.5 min-h-0" onClick={() => actionOccurrence(o.id, "pending")}>
                                Reopen
                              </button>
                            )}
                            <button type="button" className="btn btn-ghost text-[10px] px-2 py-0.5 min-h-0" onClick={() => actionOccurrence(o.id, "skipped")}>
                              Skip
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost text-[10px] px-2 py-0.5 min-h-0"
                              onClick={() => {
                                const v = window.prompt("Snooze until (ISO datetime):");
                                if (v) actionOccurrence(o.id, "snoozed", v);
                              }}
                            >
                              Snooze
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create rule */}
      <div className="card">
        <h2 className="h2 mb-3">New schedule rule</h2>
        <form onSubmit={createRule} className="grid gap-3 sm:grid-cols-2">
          <select value={newTaskId} onChange={(e) => setNewTaskId(e.target.value)} className="input" required>
            <option value="">Select task…</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => (
              <label key={label} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={newDays.includes(i)}
                  onChange={(e) => {
                    if (e.target.checked) setNewDays([...newDays, i]);
                    else setNewDays(newDays.filter((d) => d !== i));
                  }}
                  className="accent-honey"
                />
                {label}
              </label>
            ))}
          </div>
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="input" />
          <input type="number" min={0} value={newDuration} onChange={(e) => setNewDuration(e.target.value)} placeholder="duration (min)" className="input" />
          <input type="text" value={newTz} onChange={(e) => setNewTz(e.target.value)} placeholder="timezone (e.g. America/New_York)" className="input" />
          <input type="number" min={1} value={newInterval} onChange={(e) => setNewInterval(e.target.value)} placeholder="interval (weeks)" className="input" />
          <button type="submit" className="btn btn-primary sm:col-span-2" disabled={creating}>
            {creating ? "Creating…" : "Create rule"}
          </button>
        </form>
      </div>

      {/* Rules list */}
      <div className="card">
        <h2 className="h2 mb-3">Schedule rules</h2>
        {rules.length === 0 ? (
          <p className="muted text-sm">No schedule rules yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rules.map((r) => (
              <li key={r.id} className="task-row justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-mahogany">{taskName(r.taskId)}</p>
                  <p className="text-xs text-muted">
                    {r.rrule} · {r.localStartTime} · {r.timezone}
                  </p>
                </div>
                <button type="button" className="btn btn-danger text-xs" onClick={() => deleteRule(r.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Planned vs Actual */}
      <div className="card">
        <h2 className="h2 mb-3">Planned vs Actual</h2>
        <div className="flex flex-wrap items-end gap-3">
          <select value={pvTask} onChange={(e) => setPvTask(e.target.value)} className="input">
            <option value="">Select task…</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <input type="date" value={pvFrom} onChange={(e) => setPvFrom(e.target.value)} className="input" />
          <input type="date" value={pvTo} onChange={(e) => setPvTo(e.target.value)} className="input" />
          <button type="button" className="btn btn-primary text-xs" onClick={loadPv}>
            Load
          </button>
        </div>
        {pvData && (
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-sm text-mahogany">
              Planned: {pvData.planned.length} occurrences
            </p>
            <p className="text-sm text-mahogany">
              Actual: {Math.floor(pvData.actualSeconds / 3600)}h {Math.floor((pvData.actualSeconds % 3600) / 60)}m
            </p>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, pvData.planned.length ? (pvData.actualSeconds / (pvData.planned.length * 3600)) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}