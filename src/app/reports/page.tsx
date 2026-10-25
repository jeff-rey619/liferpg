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
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="text-sm text-muted">Total tracked: {fmt(report?.totalSeconds ?? 0)}</p>
      <div className="rounded border bg-surface p-4">
        <h2 className="text-lg font-semibold">Time by project</h2>
        <ul className="mt-2 text-sm">
          {Object.entries(report?.byProject ?? {}).map(([key, v]) => (
            <li key={key} className="flex justify-between">
              <span>{v.name}</span>
              <span>{fmt(v.seconds)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}