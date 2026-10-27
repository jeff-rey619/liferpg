import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tags } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { z } from "zod";

const tagUpdateSchema = z.object({
  name: z.string().min(1).max(50),
});

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
    .from(tags)
    .where(and(eq(tags.id, id), eq(tags.workspaceId, workspace.id)));
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = tagUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  const name = parsed.data.name.trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 422 });
  }
  // unique check
  const [dup] = await db
    .select()
    .from(tags)
    .where(and(eq(tags.workspaceId, workspace.id), eq(tags.name, name)));
  if (dup && dup.id !== id) {
    return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
  }
  const [updated] = await db
    .update(tags)
    .set({ name })
    .where(and(eq(tags.id, id), eq(tags.workspaceId, workspace.id)))
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
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.workspaceId, workspace.id)));
  return NextResponse.json({ ok: true });
}