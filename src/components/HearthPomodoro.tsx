"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TimerSession = {
  id: string;
  state: "running" | "paused";
  taskId: string | null;
  startedAt: string;
  accumulatedSeconds: number;
};

type Task = { id: string; title: string };

function formatMMSS(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function HearthPomodoro() {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch("/api/timer")
      .then((r) => r.json())
      .then((d) => setSession(d && d.id ? d : null))
      .catch(() => setSession(null));
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!session || session.state !== "running") return;
    const start = new Date(session.startedAt).getTime();
    const acc = session.accumulatedSeconds;
    const tick = () => setElapsed(acc + Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const displayed =
    session && session.state === "paused"
      ? session.accumulatedSeconds
      : session && session.state === "running"
        ? elapsed
        : 25 * 60;

  const taskTitle = session?.taskId
    ? tasks.find((t) => t.id === session.taskId)?.title ?? "Linked quest"
    : "No linked quest";

  const status = session
    ? session.state === "running"
      ? "Running"
      : "Paused"
    : "Idle";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="h3">Brass Pomodoro</h3>
        <span
          className={
            session?.state === "running"
              ? "badge-seal badge-sage"
              : session?.state === "paused"
                ? "badge-seal badge-honey"
                : "badge-seal"
          }
        >
          {status}
        </span>
      </div>
      <div className="timer-dial mx-auto mt-3 h-24 w-24 text-2xl">
        {formatMMSS(displayed)}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {session ? taskTitle : "Wind up a focus session"}
      </p>
      <div className="mt-3 flex gap-2">
        <Link href="/timer" className="btn btn-primary flex-1 text-center text-xs">
          {session ? "Open Timer" : "Wind Up"}
        </Link>
        <Link href="/timer" className="btn btn-ghost text-xs">
          Reset
        </Link>
      </div>
    </div>
  );
}