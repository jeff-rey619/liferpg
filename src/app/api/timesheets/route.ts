import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timeEntries } from "@/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const conditions = [eq(timeEntries.workspaceId, workspace.id)];
  if (from) conditions.push(gte(timeEntries.startedAt, new Date(from)));
  if (to) conditions.push(lte(timeEntries.startedAt, new Date(to)));
  const rows = await db.select().from(timeEntries).where(and(...conditions));
  // daily totals
  const daily: Record<string, number> = {};
  for (const r of rows) {
    const day = r.startedAt.toISOString().slice(0, 10);
    daily[day] = (daily[day] ?? 0) + r.durationSeconds;
  }
  const totalSeconds = rows.reduce((s, r) => s + r.durationSeconds, 0);
  return NextResponse.json({ entries: rows, daily, totalSeconds });
}