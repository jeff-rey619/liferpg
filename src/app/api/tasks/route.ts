import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tasks, taskTags } from "@/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { taskCreateSchema } from "@/server/validation/lr005";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { wouldCreateCycle } from "@/server/lib/hierarchy";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const conditions = [eq(tasks.workspaceId, workspace.id)];
  if (projectId) conditions.push(eq(tasks.projectId, projectId));
  const rows = await db
    .select()
    .from(tasks)
    .where(and(...conditions));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  // validate project
  if (parsed.data.projectId) {
    const { projects } = await import("@/server/db/schema");
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
  // parent task cycle check (new task can't cycle yet, but validate parent exists)
  if (parsed.data.parentTaskId) {
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
  const [created] = await db
    .insert(tasks)
    .values({
      workspaceId: workspace.id,
      title: parsed.data.title,
      projectId: parsed.data.projectId ?? null,
      parentTaskId: parsed.data.parentTaskId ?? null,
      status: parsed.data.status ?? "todo",
      dueDate: parsed.data.dueDate ?? null,
      estimateMinutes: parsed.data.estimateMinutes ?? null,
      personalPoints: parsed.data.personalPoints ?? 0,
      completedAt:
        parsed.data.status === "done" ? new Date() : null,
    })
    .returning();
  if (parsed.data.tagIds && parsed.data.tagIds.length > 0) {
    await db.insert(taskTags).values(
      parsed.data.tagIds.map((tagId) => ({ taskId: created.id, tagId })),
    );
  }
  return NextResponse.json(created, { status: 201 });
}