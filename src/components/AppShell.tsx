"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/timer", label: "Timer" },
  { href: "/calendar", label: "Calendar" },
  { href: "/quests", label: "Quests" },
  { href: "/reports", label: "Reports" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-black/10 bg-surface">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3"
        >
          <Link href="/" className="font-semibold">
            Life RPG
          </Link>
          <ul className="flex flex-1 flex-wrap gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded px-2 py-1 text-sm hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {session?.user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded border px-3 py-1 text-sm"
            >
              Sign out
            </button>
          ) : (
            <Link href="/signin" className="rounded border px-3 py-1 text-sm">
              Sign in
            </Link>
          )}
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}