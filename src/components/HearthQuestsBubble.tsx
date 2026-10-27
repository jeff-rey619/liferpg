"use client";

import { useEffect, useState } from "react";

type Task = { id: string; status: string };

export function HearthQuestsBubble() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTasks(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const done = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <div className="hud-pill flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">📜</span>
        <span className="text-[10px] uppercase tracking-wider text-muted">Daily Hearth Quests</span>
        <span className="font-display text-sm font-extrabold text-mahogany">
          {done} / {total} Complete
        </span>
      </div>
      <div className="progress-track w-full">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}