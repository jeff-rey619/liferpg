import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { projects } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { projectUpdateSchema } from "@/server/validation/lr005";
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
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspace.id)));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const { id } = await params;
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspace.id)));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  // cycle check on reparent
  if (parsed.data.parentId !== undefined && parsed.data.parentId !== null) {
    const all = await db
      .select({ id: projects.id, parentId: projects.parentId })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id));
    const parentMap = new Map(all.map((p) => [p.id, p.parentId]));
    if (wouldCreateCycle(id, parsed.data.parentId, parentMap)) {
      return NextResponse.json(
        { error: "Cycle detected" },
        { status: 409 },
      );
    }
    const [parent] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, parsed.data.parentId),
          eq(projects.workspaceId, workspace.id),
        ),
      );
    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }
  }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description;
  if (parsed.data.parentId !== undefined) updates.parentId = parsed.data.parentId;
  if (parsed.data.archived !== undefined)
    updates.archivedAt = parsed.data.archived ? new Date() : null;
  const [updated] = await db
    .update(projects)
    .set(updates)
    .where(eq(projects.id, id))
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
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const { id } = await params;
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspace.id)));
  return NextResponse.json({ ok: true });
}