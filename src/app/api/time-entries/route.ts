import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { timeEntries } from "@/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const conditions = [eq(timeEntries.workspaceId, workspace.id)];
  if (from) conditions.push(gte(timeEntries.startedAt, new Date(from)));
  if (to) conditions.push(lte(timeEntries.startedAt, new Date(to)));
  const rows = await db
    .select()
    .from(timeEntries)
    .where(and(...conditions));
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
  const startedAt = new Date(body.startedAt);
  const endedAt = new Date(body.endedAt);
  if (isNaN(startedAt.getTime()) || isNaN(endedAt.getTime()) || endedAt <= startedAt) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 422 });
  }
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
  const [created] = await db
    .insert(timeEntries)
    .values({
      workspaceId: workspace.id,
      userId: session.user.id,
      taskId: body.taskId ?? null,
      projectId: body.projectId ?? null,
      source: "manual",
      startedAt,
      endedAt,
      durationSeconds,
      notes: body.notes ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}