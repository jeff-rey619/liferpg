import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  archived: z.boolean().optional(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(300),
  projectId: z.string().uuid().optional().nullable(),
  parentTaskId: z.string().uuid().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  dueDate: z.string().date().optional().nullable(),
  estimateMinutes: z.number().int().min(0).optional().nullable(),
  personalPoints: z.number().int().min(0).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  projectId: z.string().uuid().optional().nullable(),
  parentTaskId: z.string().uuid().optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  dueDate: z.string().date().optional().nullable(),
  estimateMinutes: z.number().int().min(0).optional().nullable(),
  personalPoints: z.number().int().min(0).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
});

export const activityLogCreateSchema = z.object({
  taskId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  kind: z.string().min(1).max(50).optional(),
  occurredAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});