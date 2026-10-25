"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  notes: string | null;
  source: string;
};

export default function TimesheetPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [daily, setDaily] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    const res = await fetch(`/api/timesheets?${params.toString()}`);
    const data = await res.json();
    setEntries(data.entries ?? []);
    setDaily(data.daily ?? {});
    setTotal(data.totalSeconds ?? 0);
  }

  useEffect(() => { load(); }, []);

  function fmt(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h1">Timesheet</h1>
        <p className="muted mt-1">Actual time recorded. Total: {fmt(total)}</p>
      </div>
      <div className="card flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="muted">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="muted">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
        </label>
        <button onClick={load} className="btn btn-primary">Filter</button>
      </div>

      <div className="card">
        <h2 className="h2">Daily totals</h2>
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
          {Object.entries(daily).map(([day, sec]) => (
            <li key={day} className="flex justify-between rounded-md bg-surface-2 px-3 py-1.5">
              <span>{day}</span>
              <span className="font-medium">{fmt(sec)}</span>
            </li>
          ))}
          {Object.keys(daily).length === 0 && <li className="muted">No entries</li>}
        </ul>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Source</th>
              <th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="p-2">{new Date(e.startedAt).toLocaleString()}</td>
                <td className="p-2">{new Date(e.endedAt).toLocaleString()}</td>
                <td className="p-2 font-medium">{fmt(e.durationSeconds)}</td>
                <td className="p-2">{e.source}</td>
                <td className="p-2 text-muted">{e.notes ?? ""}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-muted">No entries</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}