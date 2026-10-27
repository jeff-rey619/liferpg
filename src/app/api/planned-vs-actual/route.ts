import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { taskOccurrences, scheduleRules, timeEntries, tasks } from "@/server/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 422 });

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspace.id)));
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const rangeStart = from ? new Date(from + "T00:00:00Z") : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rangeEnd = to ? new Date(to + "T23:59:59Z") : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // planned
  const rules = await db
    .select()
    .from(scheduleRules)
    .where(and(eq(scheduleRules.workspaceId, workspace.id), eq(scheduleRules.taskId, taskId)));
  const ruleIds = rules.map((r) => r.id);
  const planned =
    ruleIds.length > 0
      ? await db
          .select()
          .from(taskOccurrences)
          .where(
            and(
              inArray(taskOccurrences.ruleId, ruleIds),
              gte(taskOccurrences.scheduledStart, rangeStart),
              lte(taskOccurrences.scheduledStart, rangeEnd),
            ),
          )
      : [];

  // actual
  const entries = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.workspaceId, workspace.id), eq(timeEntries.taskId, taskId)));
  const inRange = entries.filter((e) => {
    const s = new Date(e.startedAt).getTime();
    return s >= rangeStart.getTime() && s <= rangeEnd.getTime();
  });
  const actualSeconds = inRange.reduce((s, e) => s + e.durationSeconds, 0);

  return NextResponse.json({ planned, actualSeconds, actualEntries: inRange });
}