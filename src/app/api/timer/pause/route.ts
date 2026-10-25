import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timerSessions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [running] = await db
    .select()
    .from(timerSessions)
    .where(
      and(eq(timerSessions.userId, session.user.id), eq(timerSessions.state, "running")),
    )
    .limit(1);
  if (!running) {
    return NextResponse.json({ error: "No running timer" }, { status: 404 });
  }
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - running.startedAt.getTime()) / 1000);
  const [updated] = await db
    .update(timerSessions)
    .set({
      state: "paused",
      pausedAt: now,
      accumulatedSeconds: running.accumulatedSeconds + elapsed,
      updatedAt: now,
    })
    .where(eq(timerSessions.id, running.id))
    .returning();
  return NextResponse.json(updated);
}