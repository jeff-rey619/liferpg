import Link from "next/link";
import { DeskCalendar } from "@/components/DeskCalendar";
import { TaskLedger } from "@/components/TaskLedger";
import { HearthStats } from "@/components/HearthStats";
import { HearthQuestsBubble } from "@/components/HearthQuestsBubble";
import { DecorBadge } from "@/components/DecorBadge";
import { HearthPomodoro } from "@/components/HearthPomodoro";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      {/* Room frame band (dusk wall) */}
      <section className="wallpaper-dusk relative overflow-hidden p-5 sm:p-6">
        <div className="lamp-glow pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lamplight/30 blur-3xl" aria-hidden="true" />
        {/* Rain streaks */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(110deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 14px)",
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <HearthQuestsBubble />
          <span className="relative badge-seal badge-honey cursor-default opacity-70" title="Decorative">
            <DecorBadge label="Decor" />
            💡 Lamp: Golden Radiance
          </span>
        </div>

        {/* Hearth Curios & Honors */}
        <div className="relative mt-4">
          <h2 className="mb-2 font-display text-sm font-extrabold uppercase tracking-wider text-inverse-on-surface">
            Hearth Curios &amp; Honors
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-hidden="true">
            <span className="relative badge-seal badge-locked shrink-0 cursor-default" title="Coming soon">
              <DecorBadge label="Decor" />
              ☀️ Sun Elixir
            </span>
            <span className="relative badge-seal badge-locked shrink-0 cursor-default" title="Coming soon">
              <DecorBadge label="Decor" />
              🏆 Master Herbalist
            </span>
            <span className="relative badge-seal badge-locked shrink-0 cursor-default" title="Coming soon">
              <DecorBadge label="Decor" />
              🌿 Quiet Haven
            </span>
            <span className="relative badge-seal badge-locked shrink-0 cursor-default" title="Coming soon">
              <DecorBadge label="Decor" />
              🔒 Disc IV (Need 500 XP)
            </span>
          </div>
        </div>
      </section>

      {/* Desk board */}
      <section className="woodgrain relative p-4 sm:p-6">
        {/* Brass rivets */}
        <span className="absolute left-3 top-3 h-3 w-3 rounded-full border-2 border-mahogany bg-surface-2 shadow-[0_2px_0_var(--mahogany)]" aria-hidden="true" />
        <span className="absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-mahogany bg-surface-2 shadow-[0_2px_0_var(--mahogany)]" aria-hidden="true" />
        <span className="absolute bottom-3 left-3 h-3 w-3 rounded-full border-2 border-mahogany bg-surface-2 shadow-[0_2px_0_var(--mahogany)]" aria-hidden="true" />
        <span className="absolute bottom-3 right-3 h-3 w-3 rounded-full border-2 border-mahogany bg-surface-2 shadow-[0_2px_0_var(--mahogany)]" aria-hidden="true" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <DeskCalendar />
          </div>
          <div className="lg:col-span-6">
            <TaskLedger />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* Brass Pomodoro mini card — reflects live timer state */}
            <HearthPomodoro />
            <HearthStats />
          </div>
        </div>
      </section>

      {/* Quick access strip */}
      <section className="flex flex-wrap gap-2">
        <Link href="/tasks" className="btn btn-ghost text-xs">
          📋 Open Tasks
        </Link>
        <Link href="/projects" className="btn btn-ghost text-xs">
          🌿 Open Projects
        </Link>
        <Link href="/activity" className="btn btn-ghost text-xs">
          📓 Open Activity
        </Link>
        <Link href="/tags" className="btn btn-ghost text-xs">
          🏷️ Open Tags
        </Link>
      </section>
      <section className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2" aria-hidden="true">
          <div className="relative well flex w-24 flex-col items-center gap-1 p-3 text-center opacity-50 grayscale cursor-default">
            <DecorBadge label="Soon" />
            <span className="text-2xl">🌱</span>
            <span className="label text-[9px]">Sun Sprout</span>
          </div>
          <div className="relative well flex w-24 flex-col items-center gap-1 p-3 text-center opacity-50 grayscale cursor-default">
            <DecorBadge label="Soon" />
            <span className="text-2xl">🍵</span>
            <span className="label text-[9px]">Tea Kettle</span>
          </div>
          <div className="relative well flex w-24 flex-col items-center gap-1 p-3 text-center opacity-50 grayscale cursor-default">
            <DecorBadge label="Soon" />
            <span className="text-2xl">🧭</span>
            <span className="label text-[9px]">Astrolabe</span>
          </div>
        </div>

        <div className="relative hud-pill opacity-50 grayscale cursor-default" aria-hidden="true" title="Messages coming soon">
          <DecorBadge label="Soon" />
          <span>✉️</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] uppercase tracking-wider text-muted">Companion Post</span>
            <span className="font-display text-sm font-extrabold text-mahogany">2 Unopened Letters</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-terracotta" />
        </div>

        <div className="relative card ml-auto flex items-center gap-3 opacity-80">
          <DecorBadge label="Soon" />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-mahogany bg-linen text-3xl shadow-[inset_0_2px_4px_rgba(43,30,26,0.12)]">
            🐰
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="h3">Pippin</h3>
              <span className="badge-seal badge-sage">Purring • Sleepy</span>
            </div>
            <p className="muted text-xs italic opacity-70">
              &ldquo;A fine hour for warm tea and honest scribbing…&rdquo;
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}