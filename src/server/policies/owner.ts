import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id));
  return workspace ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}