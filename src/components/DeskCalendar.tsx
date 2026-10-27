"use client";

import { useSyncExternalStore } from "react";
import { DecorBadge } from "@/components/DecorBadge";

type Today = { day: string; month: string; weekday: string; season: string };

let cached: Today | null = null;

function seasonFor(month: number): string {
  if (month >= 2 && month <= 4) return "Spring Cycle";
  if (month >= 5 && month <= 7) return "Summer Cycle";
  if (month >= 8 && month <= 10) return "Autumn Cycle";
  return "Winter Cycle";
}

function getClientSnapshot(): Today {
  if (!cached) {
    const now = new Date();
    cached = {
      day: now.toLocaleDateString(undefined, { day: "numeric" }),
      month: now.toLocaleDateString(undefined, { month: "long" }),
      weekday: now.toLocaleDateString(undefined, { weekday: "long" }),
      season: seasonFor(now.getMonth()),
    };
  }
  return cached;
}

const subscribe = () => () => {};
const getServerSnapshot = (): Today | null => null;

export function DeskCalendar() {
  const today = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <article className="card relative flex flex-col gap-3">
      {/* Wire binding */}
      <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-4 w-2 rounded-full border-2 border-mahogany bg-surface-2 shadow-[0_2px_0_var(--mahogany)]"
          />
        ))}
      </div>
      <div className="flex items-start justify-between gap-2">
        <span className="badge-seal badge-honey">{today?.season ?? "Cycle"}</span>
        <span className="relative chip chip-active cursor-default opacity-60" title="Decorative" aria-hidden="true">
          <DecorBadge label="Decor" />
          <span aria-hidden="true">🌤</span> Breezy
        </span>
      </div>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-5xl leading-none font-extrabold text-mahogany">
          {today?.day ?? "—"}
        </span>
        <span className="h3 text-honey-deep uppercase">{today?.month ?? ""}</span>
      </p>
      <div className="relative sticky-note text-xs text-mahogany opacity-70" aria-hidden="true">
        <DecorBadge label="Decor" />
        <span className="font-label text-[10px] uppercase tracking-wider text-mahogany/70">
          Next
        </span>
        <p className="font-display text-sm font-bold">3:00 PM — Alchemical Research Review</p>
      </div>
      <p className="muted text-xs opacity-50" aria-hidden="true">
        Click to unfold itinerary →
      </p>
    </article>
  );
}