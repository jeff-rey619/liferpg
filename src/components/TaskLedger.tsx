"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DecorBadge } from "@/components/DecorBadge";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  personalPoints: number;
};

export function TaskLedger() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setTasks(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load ledger");
        setLoading(false);
      });
  }, []);

  async function toggle(task: Task, checked: boolean) {
    const nextStatus = checked ? "done" : "todo";
    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
    );
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated: Task = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)),
      );
    } catch (e) {
      // revert
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      );
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Could not inscribe (${res.status})`);
      }
      const created: Task = await res.json();
      setTasks((prev) => [created, ...prev]);
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not inscribe");
    } finally {
      setSubmitting(false);
    }
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const visible = expanded ? tasks : tasks.slice(0, 5);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="h2 flex items-center gap-2">
            <span aria-hidden="true">📖</span> Field Ledger &amp; Quests
          </h2>
          <p className="muted text-xs">
            Tick tasks to earn acorns and bloom your desk plant!
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary text-xs"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Fold Ledger" : "Expand Ledger"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="badge-seal badge-honey">{doneCount} / {tasks.length} Done</span>
        <div className="progress-track flex-1">
          <div
            className="progress-fill"
            style={{
              width: tasks.length ? `${(doneCount / tasks.length) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      {error && (
        <div className="well border-danger text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted text-sm">Loading ledger…</p>
      ) : tasks.length === 0 ? (
        <p className="muted text-sm">Your ledger is empty — inscribe a quest above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((task) => (
            <li key={task.id} className={task.status === "done" ? "task-row task-row-done" : "task-row"}>
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={(e) => toggle(task, e.target.checked)}
                aria-label={`Mark ${task.title} ${task.status === "done" ? "incomplete" : "complete"}`}
                className="mt-1 h-5 w-5 shrink-0 rounded-lg border-2 border-mahogany accent-honey"
              />
              <div className="flex-1">
                <p className="task-row-title font-display text-sm font-bold text-mahogany">
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {task.status === "done" && (
                    <span className="badge-seal badge-sage">Completed ✓</span>
                  )}
                  {task.status === "in_progress" && (
                    <span className="badge-seal badge-honey">In Progress</span>
                  )}
                  {task.status === "todo" && (
                    <span className="badge-seal" style={{ background: "#ffdbd2", color: "#82270e" }}>
                      Pending
                    </span>
                  )}
                  {task.personalPoints > 0 && (
                    <span className="relative badge-seal badge-honey">
                      <DecorBadge label="Decor" />
                      +{task.personalPoints} Acorn XP
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Inscribe a new cozy quest..."
          className="input flex-1 text-sm"
          maxLength={300}
        />
        <button type="submit" className="btn btn-primary text-xs" disabled={submitting}>
          Inscribe ✎
        </button>
      </form>

      <div className="text-right text-xs">
        <Link href="/timesheet" className="text-muted underline underline-offset-2">
          View full ledger →
        </Link>
      </div>
    </div>
  );
}