import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tasks, taskTags, projects } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { taskUpdateSchema } from "@/server/validation/lr005";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { wouldCreateCycle } from "@/server/lib/hierarchy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const { id } = await params;
  const [row] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspace.id)));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const tags = await db
    .select({ tagId: taskTags.tagId })
    .from(taskTags)
    .where(eq(taskTags.taskId, id));
  return NextResponse.json({ ...row, tagIds: tags.map((t) => t.tagId) });
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
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const { id } = await params;
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspace.id)));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  // cycle check on reparent
  if (parsed.data.parentTaskId !== undefined && parsed.data.parentTaskId !== null) {
    const all = await db
      .select({ id: tasks.id, parentTaskId: tasks.parentTaskId })
      .from(tasks)
      .where(eq(tasks.workspaceId, workspace.id));
    const parentMap = new Map(all.map((t) => [t.id, t.parentTaskId]));
    if (wouldCreateCycle(id, parsed.data.parentTaskId, parentMap)) {
      return NextResponse.json({ error: "Cycle detected" }, { status: 409 });
    }
    const [parent] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.id, parsed.data.parentTaskId),
          eq(tasks.workspaceId, workspace.id),
        ),
      );
    if (!parent) {
      return NextResponse.json({ error: "Parent task not found" }, { status: 404 });
    }
  }
  // validate project
  if (parsed.data.projectId) {
    const [p] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parsed.data.projectId),
          eq(projects.workspaceId, workspace.id),
        ),
      );
    if (!p) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.projectId !== undefined) updates.projectId = parsed.data.projectId;
  if (parsed.data.parentTaskId !== undefined)
    updates.parentTaskId = parsed.data.parentTaskId;
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    updates.completedAt = parsed.data.status === "done" ? new Date() : null;
  }
  if (parsed.data.dueDate !== undefined) updates.dueDate = parsed.data.dueDate;
  if (parsed.data.estimateMinutes !== undefined)
    updates.estimateMinutes = parsed.data.estimateMinutes;
  if (parsed.data.personalPoints !== undefined)
    updates.personalPoints = parsed.data.personalPoints;
  const [updated] = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, id))
    .returning();
  if (parsed.data.tagIds) {
    await db.delete(taskTags).where(eq(taskTags.taskId, id));
    if (parsed.data.tagIds.length > 0) {
      await db
        .insert(taskTags)
        .values(parsed.data.tagIds.map((tagId) => ({ taskId: id, tagId })));
    }
  }
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
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const { id } = await params;
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.workspaceId, workspace.id)));
  return NextResponse.json({ ok: true });
}