import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { taskOccurrences, scheduleRules, tasks } from "@/server/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { getCurrentWorkspace } from "@/server/policies/owner";
import { expandOccurrences } from "@/server/lib/schedule";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workspace = await getCurrentWorkspace();
  if (!workspace) return NextResponse.json({ error: "No workspace" }, { status: 404 });

  const url = new URL(request.url);
  const ruleId = url.searchParams.get("ruleId");
  const taskId = url.searchParams.get("taskId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const generate = url.searchParams.get("generate") === "true";

  // resolve rules in scope
  const ruleConditions = [eq(scheduleRules.workspaceId, workspace.id)];
  if (ruleId) ruleConditions.push(eq(scheduleRules.id, ruleId));
  if (taskId) ruleConditions.push(eq(scheduleRules.taskId, taskId));
  const rules = await db.select().from(scheduleRules).where(and(...ruleConditions));
  if (rules.length === 0) return NextResponse.json([]);

  // validate task ownership when taskId filter
  if (taskId) {
    const [t] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, workspace.id)));
    if (!t) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const rangeStart = from ? new Date(from + "T00:00:00Z") : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rangeEnd = to ? new Date(to + "T23:59:59Z") : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  if (generate) {
    for (const rule of rules) {
      const occs = expandOccurrences(
        {
          rrule: rule.rrule,
          timezone: rule.timezone,
          localStartTime: rule.localStartTime,
          expectedDurationMinutes: rule.expectedDurationMinutes,
          activeFrom: rule.activeFrom,
          activeUntil: rule.activeUntil,
        },
        rangeStart,
        rangeEnd,
      );
      for (const o of occs) {
        await db
          .insert(taskOccurrences)
          .values({
            ruleId: rule.id,
            taskId: rule.taskId,
            occurrenceKey: o.occurrenceKey,
            scheduledStart: o.scheduledStart,
            scheduledEnd: o.scheduledEnd,
            status: "pending",
          })
          .onConflictDoNothing();
      }
    }
  }

  const ruleIds = rules.map((r) => r.id);
  const occConditions = [inArray(taskOccurrences.ruleId, ruleIds)];
  if (from) occConditions.push(gte(taskOccurrences.scheduledStart, rangeStart));
  if (to) occConditions.push(lte(taskOccurrences.scheduledStart, rangeEnd));
  const occs = await db
    .select()
    .from(taskOccurrences)
    .where(and(...occConditions));
  return NextResponse.json(occs);
}