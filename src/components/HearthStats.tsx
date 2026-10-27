"use client";

import { useEffect, useState } from "react";

type Report = {
  totalSeconds: number;
  byProject: Record<string, { name: string | null; seconds: number }>;
};

export function HearthStats() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch("/api/reports/time")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setReport(d))
      .catch(() => {});
  }, []);

  const total = report?.totalSeconds ?? 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const projectCount = report ? Object.keys(report.byProject).length : 0;

  return (
    <div className="crt">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[#7fe8a2]">TERMINAL://HEARTH_OS</span>
        <span className="flex items-center gap-1 text-[10px] text-[#7fe8a2]">
          <span className="lamp-glow inline-block h-2 w-2 rounded-full bg-[#7fe8a2]" />
          LIVE
        </span>
      </div>
      <div className="crt-screen font-mono text-xs leading-relaxed">
        <p>&gt; TOTAL FOCUS: {h}h {m}m</p>
        <p>&gt; PROJECTS TRACKED: {projectCount}</p>
        <p>&gt; SYNCING FIELD LOGS...</p>
        <p className="animate-pulse">&gt; READY FOR PROMPT ▊</p>
        <div className="crt-scanlines" aria-hidden="true" />
      </div>
    </div>
  );
}