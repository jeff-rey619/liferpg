import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { activityLogs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { activityLogCreateSchema } from "@/server/validation/lr005";
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
    .from(activityLogs)
    .where(eq(activityLogs.workspaceId, workspace.id));
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
  const parsed = activityLogCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  const [created] = await db
    .insert(activityLogs)
    .values({
      workspaceId: workspace.id,
      taskId: parsed.data.taskId ?? null,
      projectId: parsed.data.projectId ?? null,
      kind: parsed.data.kind ?? "activity",
      occurredAt: parsed.data.occurredAt
        ? new Date(parsed.data.occurredAt)
        : new Date(),
      durationMinutes: parsed.data.durationMinutes ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}