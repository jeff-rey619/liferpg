import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="h1">Life RPG</h1>
        <p className="muted mt-2 max-w-2xl">
          A cozy, game-like life-management app. Track time, organize tasks, plan schedules,
          and grow — at your own pace. Work management stays useful even if you ignore the game.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/timer", title: "Timer", desc: "Start, pause, resume, stop. Manual entries too." },
          { href: "/timesheet", title: "Timesheet", desc: "Daily and weekly totals from actual time." },
          { href: "/reports", title: "Reports", desc: "Time by project, without judgment." },
          { href: "/tasks", title: "Tasks", desc: "Nested projects and tasks with tags." },
          { href: "/signin", title: "Sign in", desc: "Create an account with just an email." },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card transition hover:shadow-md">
            <h2 className="h2">{c.title}</h2>
            <p className="muted mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}