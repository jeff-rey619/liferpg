import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timeEntries } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

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
    .from(timeEntries)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, workspace.id)));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.startedAt) updates.startedAt = new Date(body.startedAt);
  if (body.endedAt) updates.endedAt = new Date(body.endedAt);
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.correctionOf !== undefined) updates.correctionOf = body.correctionOf;
  if (updates.startedAt || updates.endedAt) {
    const s = (updates.startedAt as Date) ?? existing.startedAt;
    const e = (updates.endedAt as Date) ?? existing.endedAt;
    if (e <= s) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 422 });
    }
    updates.durationSeconds = Math.floor((e.getTime() - s.getTime()) / 1000);
  }
  const [updated] = await db
    .update(timeEntries)
    .set(updates)
    .where(eq(timeEntries.id, id))
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
    .delete(timeEntries)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, workspace.id)));
  return NextResponse.json({ ok: true });
}