import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { scheduleRules } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { scheduleRuleUpdateSchema } from "@/server/validation/lr007";
import { parseWeeklyRule } from "@/server/lib/schedule";

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
    .from(scheduleRules)
    .where(and(eq(scheduleRules.id, id), eq(scheduleRules.workspaceId, workspace.id)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    .from(scheduleRules)
    .where(and(eq(scheduleRules.id, id), eq(scheduleRules.workspaceId, workspace.id)));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const parsed = scheduleRuleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  if (parsed.data.rrule && !parseWeeklyRule(parsed.data.rrule)) {
    return NextResponse.json({ error: "Unsupported recurrence rule" }, { status: 422 });
  }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.rrule !== undefined) updates.rrule = parsed.data.rrule;
  if (parsed.data.timezone !== undefined) updates.timezone = parsed.data.timezone;
  if (parsed.data.localStartTime !== undefined) updates.localStartTime = parsed.data.localStartTime;
  if (parsed.data.expectedDurationMinutes !== undefined)
    updates.expectedDurationMinutes = parsed.data.expectedDurationMinutes;
  if (parsed.data.activeFrom !== undefined) updates.activeFrom = parsed.data.activeFrom;
  if (parsed.data.activeUntil !== undefined) updates.activeUntil = parsed.data.activeUntil;
  if (parsed.data.reminderMinutes !== undefined) updates.reminderMinutes = parsed.data.reminderMinutes;
  // bump version if recurrence-affecting fields changed
  if (
    parsed.data.rrule !== undefined ||
    parsed.data.timezone !== undefined ||
    parsed.data.localStartTime !== undefined
  ) {
    updates.version = (existing.version ?? 1) + 1;
  }
  const [updated] = await db
    .update(scheduleRules)
    .set(updates)
    .where(and(eq(scheduleRules.id, id), eq(scheduleRules.workspaceId, workspace.id)))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
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
  await db
    .delete(scheduleRules)
    .where(and(eq(scheduleRules.id, id), eq(scheduleRules.workspaceId, workspace.id)));
  return NextResponse.json({ ok: true });
}