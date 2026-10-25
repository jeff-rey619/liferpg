import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timerSessions, tasks } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const taskId = body?.taskId ?? null;
  if (taskId) {
    const [t] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspace.id)));
    if (!t) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  // check existing running
  const [existing] = await db
    .select()
    .from(timerSessions)
    .where(
      and(eq(timerSessions.userId, session.user.id), eq(timerSessions.state, "running")),
    )
    .limit(1);
  if (existing) {
    return NextResponse.json({ error: "Timer already running" }, { status: 409 });
  }
  const [created] = await db
    .insert(timerSessions)
    .values({
      workspaceId: workspace.id,
      userId: session.user.id,
      taskId,
      state: "running",
      startedAt: new Date(),
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}