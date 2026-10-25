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
    if (session && session.state === "paused") {
      setElapsed(session.accumulatedSeconds);
    }
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

  async function start() {
    await call("/api/timer/start", { taskId: selectedTask || null });
  }
  async function pause() {
    await call("/api/timer/pause");
  }
  async function resume() {
    await call("/api/timer/resume");
  }
  async function stop() {
    await call("/api/timer/stop");
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
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Timer</h1>
      {message && <p className="text-sm text-red-600">{message}</p>}

      <div className="rounded border bg-surface p-4">
        <p className="text-4xl font-mono">{formatSeconds(elapsed)}</p>
        <p className="mt-1 text-sm text-muted">
          {session ? `State: ${session.state}` : "No active timer"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="rounded border px-2 py-1"
          >
            <option value="">No task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {!session && (
            <button onClick={start} className="rounded bg-accent px-3 py-1 text-white">
              Start
            </button>
          )}
          {session?.state === "running" && (
            <>
              <button onClick={pause} className="rounded border px-3 py-1">
                Pause
              </button>
              <button onClick={stop} className="rounded border px-3 py-1">
                Stop
              </button>
            </>
          )}
          {session?.state === "paused" && (
            <>
              <button onClick={resume} className="rounded bg-accent px-3 py-1 text-white">
                Resume
              </button>
              <button onClick={stop} className="rounded border px-3 py-1">
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded border bg-surface p-4">
        <h2 className="text-lg font-semibold">Manual entry</h2>
        <form onSubmit={submitManual} className="mt-3 flex flex-col gap-2">
          <label className="text-sm">
            Start
            <input
              type="datetime-local"
              value={manual.startedAt}
              onChange={(e) => setManual({ ...manual, startedAt: e.target.value })}
              className="ml-2 rounded border px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            End
            <input
              type="datetime-local"
              value={manual.endedAt}
              onChange={(e) => setManual({ ...manual, endedAt: e.target.value })}
              className="ml-2 rounded border px-2 py-1"
              required
            />
          </label>
          <label className="text-sm">
            Notes
            <input
              type="text"
              value={manual.notes}
              onChange={(e) => setManual({ ...manual, notes: e.target.value })}
              className="ml-2 rounded border px-2 py-1"
            />
          </label>
          <button type="submit" className="self-start rounded border px-3 py-1">
            Add entry
          </button>
        </form>
      </div>
    </section>
  );
}