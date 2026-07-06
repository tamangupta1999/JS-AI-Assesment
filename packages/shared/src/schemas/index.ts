import { z } from "zod";
import {
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  USER_ROLES,
} from "../constants/index.js";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  priority: z.enum(TICKET_PRIORITIES).default("medium"),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});

export const createCommentSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export const ticketQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedTo: z.string().uuid().optional(),
  sort: z.enum(["createdAt", "updatedAt", "priority", "status"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type TicketQueryInput = z.infer<typeof ticketQuerySchema>;
