import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tags } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { tagCreateSchema } from "@/server/validation/lr005";
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
    .from(tags)
    .where(eq(tags.workspaceId, workspace.id));
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
  const parsed = tagCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 422 });
  }
  try {
    const [created] = await db
      .insert(tags)
      .values({ workspaceId: workspace.id, name: parsed.data.name })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
  }
}