import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { scheduleRules, tasks } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { scheduleRuleCreateSchema } from "@/server/validation/lr007";
import { parseWeeklyRule } from "@/server/lib/schedule";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const conditions = [eq(scheduleRules.workspaceId, workspace.id)];
  if (taskId) conditions.push(eq(scheduleRules.taskId, taskId));
  const rows = await db.select().from(scheduleRules).where(and(...conditions));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const parsed = scheduleRuleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  // validate task exists in workspace
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, parsed.data.taskId), eq(tasks.workspaceId, workspace.id)));
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (!parseWeeklyRule(parsed.data.rrule)) {
    return NextResponse.json({ error: "Unsupported recurrence rule" }, { status: 422 });
  }
  const [created] = await db
    .insert(scheduleRules)
    .values({
      workspaceId: workspace.id,
      taskId: parsed.data.taskId,
      rrule: parsed.data.rrule,
      timezone: parsed.data.timezone ?? "UTC",
      localStartTime: parsed.data.localStartTime,
      expectedDurationMinutes: parsed.data.expectedDurationMinutes ?? null,
      activeFrom: parsed.data.activeFrom ?? null,
      activeUntil: parsed.data.activeUntil ?? null,
      reminderMinutes: parsed.data.reminderMinutes ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}