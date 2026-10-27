import { z } from "zod";

export const scheduleRuleCreateSchema = z.object({
  taskId: z.string().uuid(),
  rrule: z.string().min(1),
  timezone: z.string().min(1).max(100).optional(),
  localStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  expectedDurationMinutes: z.number().int().min(0).optional().nullable(),
  activeFrom: z.string().date().optional().nullable(),
  activeUntil: z.string().date().optional().nullable(),
  reminderMinutes: z.number().int().min(0).optional().nullable(),
});

export const scheduleRuleUpdateSchema = z.object({
  rrule: z.string().min(1).optional(),
  timezone: z.string().min(1).max(100).optional(),
  localStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  expectedDurationMinutes: z.number().int().min(0).optional().nullable(),
  activeFrom: z.string().date().optional().nullable(),
  activeUntil: z.string().date().optional().nullable(),
  reminderMinutes: z.number().int().min(0).optional().nullable(),
});

export const occurrenceActionSchema = z.object({
  status: z.enum(["pending", "completed", "skipped", "snoozed"]),
  snoozeUntil: z.string().datetime().optional(),
  completedTaskId: z.string().uuid().optional().nullable(),
});