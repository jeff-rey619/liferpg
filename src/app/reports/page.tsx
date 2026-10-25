"use client";

import { useEffect, useState } from "react";

type Report = { byProject: Record<string, { name: string; seconds: number }>; totalSeconds: number };

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/reports/time")
      .then((r) => r.json())
      .then(setReport);
  }, []);

  function fmt(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h1">Reports</h1>
        <p className="muted mt-1">Tracked time is not a measure of worth or productivity.</p>
      </div>
      <div className="card">
        <p className="text-sm text-muted">Total tracked</p>
        <p className="mt-1 text-3xl font-semibold">{fmt(report?.totalSeconds ?? 0)}</p>
      </div>
      <div className="card">
        <h2 className="h2">Time by project</h2>
        <ul className="mt-3 divide-y divide-border/60">
          {Object.entries(report?.byProject ?? {}).map(([key, v]) => (
            <li key={key} className="flex items-center justify-between py-2">
              <span>{v.name}</span>
              <span className="font-medium">{fmt(v.seconds)}</span>
            </li>
          ))}
          {Object.keys(report?.byProject ?? {}).length === 0 && (
            <li className="py-2 text-muted">No data yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}