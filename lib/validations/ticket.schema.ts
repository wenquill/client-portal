import { z } from "zod";

const baseTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeId: z.string().uuid("Invalid assignee").optional(),
});

export const createTicketSchema = baseTicketSchema;

export const updateTicketSchema = baseTicketSchema.extend({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
