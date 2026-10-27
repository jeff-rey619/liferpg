"use client";

import { useEffect, useState } from "react";

type Tag = { id: string; name: string };
type Task = { id: string; title: string };

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/tags"), fetch("/api/tasks")])
      .then(async ([gRes, tRes]) => {
        if (!gRes.ok) throw new Error(`tags ${gRes.status}`);
        if (!tRes.ok) throw new Error(`tasks ${tRes.status}`);
        setTags(await gRes.json());
        setTasks(await tRes.json());
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load");
        setLoading(false);
      });
  }, []);

  async function createTag(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Could not create (${res.status})`);
      }
      const created: Tag = await res.json();
      setTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(t: Tag) {
    setEditingId(t.id);
    setEditName(t.name);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Could not save (${res.status})`);
      }
      const updated: Tag = await res.json();
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTag(id: string) {
    if (!window.confirm("Delete this tag? It will be removed from all tasks.")) return;
    setError(null);
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Could not delete (${res.status})`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    }
  }

  if (loading) return <p className="muted">Loading tags…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Tags</h1>
        <span className="hud-pill">{tags.length} tags</span>
      </div>

      {error && (
        <div className="toast-banner toast-error" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <h2 className="h2 mb-3">New tag</h2>
        <form onSubmit={createTag} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name"
            className="input flex-1"
            maxLength={50}
          />
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? "Creating…" : "Create tag"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="h2 mb-3">Your tags</h2>
        {tags.length === 0 ? (
          <p className="muted text-sm">No tags yet. Create one above.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center gap-1">
                {editingId === t.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input text-sm"
                      maxLength={50}
                    />
                    <button type="button" className="btn btn-primary text-xs" onClick={() => saveEdit(t.id)} disabled={saving}>
                      {saving ? "…" : "Save"}
                    </button>
                    <button type="button" className="btn btn-ghost text-xs" onClick={() => setEditingId(null)} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="badge-seal badge-sage cursor-default">#{t.name}</span>
                    <button type="button" className="btn btn-ghost text-xs" onClick={() => startEdit(t)}>
                      Rename
                    </button>
                    <button type="button" className="btn btn-danger text-xs" onClick={() => deleteTag(t.id)}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="muted mt-3 text-xs">
          Tag usage counts require per-task tag data; not shown in this pass.
        </p>
      </div>
    </div>
  );
}