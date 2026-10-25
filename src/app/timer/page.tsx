"use client";

import { useEffect, useState } from "react";

type TimerSession = {
  id: string;
  state: string;
  taskId: string | null;
  startedAt: string;
  accumulatedSeconds: number;
};

type Task = { id: string; title: string };

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function TimerPage() {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const [manual, setManual] = useState({ startedAt: "", endedAt: "", notes: "" });
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/timer");
    const data = await res.json();
    setSession(data && data.id ? data : null);
  }

  useEffect(() => {
    refresh();
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => setTasks(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!session || session.state !== "running") return;
    const start = new Date(session.startedAt).getTime();
    const acc = session.accumulatedSeconds;
    const tick = () => {
      const now = Date.now();
      setElapsed(acc + Math.floor((now - start) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  useEffect(() => {
    if (session && session.state === "paused") setElapsed(session.accumulatedSeconds);
    if (!session) setElapsed(0);
  }, [session]);

  async function call(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Error");
    else setMessage("");
    await refresh();
    return data;
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startedAt: new Date(manual.startedAt).toISOString(),
        endedAt: new Date(manual.endedAt).toISOString(),
        notes: manual.notes || null,
        taskId: selectedTask || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Error");
    else {
      setMessage("Manual entry added");
      setManual({ startedAt: "", endedAt: "", notes: "" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h1">Timer</h1>
        <p className="muted mt-1">Track actual time. Stopping records time only — it does not complete tasks.</p>
      </div>
      {message && (
        <div className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {message}
        </div>
      )}

      <div className="card flex flex-col items-center gap-4 text-center">
        <p className="font-mono text-6xl font-semibold tracking-tight">{formatSeconds(elapsed)}</p>
        <p className="muted">{session ? `State: ${session.state}` : "No active timer"}</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="input"
          >
            <option value="">No task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          {!session && (
            <button onClick={() => call("/api/timer/start", { taskId: selectedTask || null })} className="btn btn-primary">
              Start
            </button>
          )}
          {session?.state === "running" && (
            <>
              <button onClick={() => call("/api/timer/pause")} className="btn">Pause</button>
              <button onClick={() => call("/api/timer/stop")} className="btn btn-danger">Stop</button>
            </>
          )}
          {session?.state === "paused" && (
            <>
              <button onClick={() => call("/api/timer/resume")} className="btn btn-primary">Resume</button>
              <button onClick={() => call("/api/timer/stop")} className="btn btn-danger">Stop</button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="h2">Manual entry</h2>
        <form onSubmit={submitManual} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="muted">Start</span>
            <input type="datetime-local" value={manual.startedAt}
              onChange={(e) => setManual({ ...manual, startedAt: e.target.value })}
              className="input" required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="muted">End</span>
            <input type="datetime-local" value={manual.endedAt}
              onChange={(e) => setManual({ ...manual, endedAt: e.target.value })}
              className="input" required />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="muted">Notes</span>
            <input type="text" value={manual.notes}
              onChange={(e) => setManual({ ...manual, notes: e.target.value })}
              className="input" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn">Add entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}