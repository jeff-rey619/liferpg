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

  useEffect(() => {
    load();
  }, []);

  function fmt(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Timesheet</h1>
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded border px-2 py-1"
        />
        <button onClick={load} className="rounded border px-3 py-1">
          Filter
        </button>
      </div>
      <p className="text-sm text-muted">Total: {fmt(total)}</p>
      <div className="rounded border bg-surface p-4">
        <h2 className="text-lg font-semibold">Daily totals</h2>
        <ul className="mt-2 text-sm">
          {Object.entries(daily).map(([day, sec]) => (
            <li key={day}>
              {day}: {fmt(sec)}
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-x-auto rounded border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Start</th>
              <th className="p-2 text-left">End</th>
              <th className="p-2 text-left">Duration</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="p-2">{new Date(e.startedAt).toLocaleString()}</td>
                <td className="p-2">{new Date(e.endedAt).toLocaleString()}</td>
                <td className="p-2">{fmt(e.durationSeconds)}</td>
                <td className="p-2">{e.source}</td>
                <td className="p-2">{e.notes ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}