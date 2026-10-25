import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timerSessions, timeEntries, tasks } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const [running] = await db
    .select()
    .from(timerSessions)
    .where(
      and(
        eq(timerSessions.userId, session.user.id),
        eq(timerSessions.state, "running"),
      ),
    )
    .orderBy(desc(timerSessions.startedAt))
    .limit(1);
  const [paused] = running
    ? [null]
    : await db
        .select()
        .from(timerSessions)
        .where(
          and(
            eq(timerSessions.userId, session.user.id),
            eq(timerSessions.state, "paused"),
          ),
        )
        .orderBy(desc(timerSessions.startedAt))
        .limit(1);
  const current = running ?? paused ?? null;
  return NextResponse.json(current);
}