import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { taskOccurrences, scheduleRules } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { occurrenceActionSchema } from "@/server/validation/lr007";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const { id } = await params;
  const [row] = await db
    .select()
    .from(taskOccurrences)
    .where(eq(taskOccurrences.id, id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // ownership via rule
  const [rule] = await db
    .select()
    .from(scheduleRules)
    .where(and(eq(scheduleRules.id, row.ruleId), eq(scheduleRules.workspaceId, workspace.id)));
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const { id } = await params;
  const [existing] = await db
    .select()
    .from(taskOccurrences)
    .where(eq(taskOccurrences.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [rule] = await db
    .select()
    .from(scheduleRules)
    .where(and(eq(scheduleRules.id, existing.ruleId), eq(scheduleRules.workspaceId, workspace.id)));
  if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = occurrenceActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const status = parsed.data.status;
  updates.status = status;
  if (status === "completed") {
    updates.completedTaskId = parsed.data.completedTaskId ?? existing.completedTaskId;
  } else if (status === "pending") {
    updates.completedTaskId = null;
  }
  if (status === "snoozed" && parsed.data.snoozeUntil) {
    const until = new Date(parsed.data.snoozeUntil);
    updates.scheduledStart = until;
    if (existing.scheduledEnd && existing.scheduledStart) {
      const dur = existing.scheduledEnd.getTime() - existing.scheduledStart.getTime();
      updates.scheduledEnd = new Date(until.getTime() + dur);
    }
  }
  const [updated] = await db
    .update(taskOccurrences)
    .set(updates)
    .where(eq(taskOccurrences.id, id))
    .returning();
  return NextResponse.json(updated);
}