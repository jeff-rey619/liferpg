import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { projects } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { projectCreateSchema } from "@/server/validation/lr005";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspace.id));
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
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  if (parsed.data.parentId) {
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
  const [created] = await db
    .insert(projects)
    .values({
      workspaceId: workspace.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      parentId: parsed.data.parentId ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}