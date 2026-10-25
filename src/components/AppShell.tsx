"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/timer", label: "Timer" },
  { href: "/timesheet", label: "Timesheet" },
  { href: "/reports", label: "Reports" },
  { href: "/quests", label: "Quests" },
  { href: "/calendar", label: "Calendar" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-accent">
            Life RPG
          </Link>
          <ul className="flex flex-1 flex-wrap gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <button type="button" onClick={() => signOut()} className="btn">
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/signin" className="btn btn-primary">
              Sign in
            </Link>
          )}
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-4 text-center text-xs text-muted">
        Life RPG — cozy life management
      </footer>
    </div>
  );
}