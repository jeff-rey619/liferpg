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
  const [paused] = await db
    .select()
    .from(timerSessions)
    .where(
      and(eq(timerSessions.userId, session.user.id), eq(timerSessions.state, "paused")),
    )
    .limit(1);
  if (!paused) {
    return NextResponse.json({ error: "No paused timer" }, { status: 404 });
  }
  const now = new Date();
  const [updated] = await db
    .update(timerSessions)
    .set({
      state: "running",
      startedAt: now,
      pausedAt: null,
      updatedAt: now,
    })
    .where(eq(timerSessions.id, paused.id))
    .returning();
  return NextResponse.json(updated);
}