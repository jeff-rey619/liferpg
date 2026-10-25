import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timerSessions, timeEntries } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function POST() {
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
        .limit(1);
  const current = running ?? paused;
  if (!current) {
    return NextResponse.json({ error: "No active timer" }, { status: 404 });
  }
  const now = new Date();
  let totalSeconds = current.accumulatedSeconds;
  if (current.state === "running") {
    totalSeconds += Math.floor((now.getTime() - current.startedAt.getTime()) / 1000);
  }
  // create time entry
  const startedAt = current.startedAt;
  const endedAt = now;
  const [entry] = await db
    .insert(timeEntries)
    .values({
      workspaceId: workspace.id,
      userId: session.user.id,
      taskId: current.taskId,
      source: "timer",
      startedAt,
      endedAt,
      durationSeconds: totalSeconds,
    })
    .returning();
  await db
    .update(timerSessions)
    .set({
      state: "stopped",
      stoppedAt: now,
      accumulatedSeconds: totalSeconds,
      updatedAt: now,
    })
    .where(eq(timerSessions.id, current.id));
  return NextResponse.json({ session: current, entry });
}