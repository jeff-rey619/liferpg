"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  displayName: string;
  timezone: string;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [locale, setLocale] = useState("");

  const timezones =
    typeof Intl !== "undefined" && "supportedValuesOf" in Intl
      ? (Intl as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone")
      : [];

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error(`profile ${res.status}`);
        const p: Profile = await res.json();
        setProfile(p);
        setDisplayName(p.displayName ?? "");
        setTimezone(p.timezone ?? "UTC");
        setLocale(p.locale ?? "");
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Could not load");
        setLoading(false);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = {};
      if (displayName.trim()) body.displayName = displayName.trim();
      if (timezone) body.timezone = timezone;
      if (locale.trim()) body.locale = locale.trim();
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Could not save (${res.status})`);
      }
      const updated: Profile = await res.json();
      setProfile(updated);
      setSuccess("Profile saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading profile…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Profile</h1>
        <span className="hud-pill">Hearth identity</span>
      </div>

      {error && (
        <div className="toast-banner toast-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="card border-sage text-sage" role="status">
          {success}
        </div>
      )}

      <div className="card max-w-2xl">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="label mb-1 block">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input w-full"
              maxLength={100}
            />
          </div>
          <div>
            <label className="label mb-1 block">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input w-full"
            >
              {timezones.length === 0 && <option value={timezone}>{timezone}</option>}
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="muted mt-1 text-xs">
              Used for schedule boundaries and occurrence times.
            </p>
          </div>
          <div>
            <label className="label mb-1 block">Locale (optional)</label>
            <input
              type="text"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="e.g. en-US"
              className="input w-full"
              maxLength={20}
            />
          </div>
          {profile && (
            <p className="muted text-xs">
              Member since {new Date(profile.createdAt).toLocaleDateString()}.
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}