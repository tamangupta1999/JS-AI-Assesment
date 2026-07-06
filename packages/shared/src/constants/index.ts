export const USER_ROLES = ["admin", "agent", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["resolved", "cancelled"],
  resolved: ["closed"],
  closed: [],
  cancelled: [],
};

export function isValidTransition(
  from: TicketStatus,
  to: TicketStatus
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function getValidNextStatuses(status: TicketStatus): TicketStatus[] {
  return VALID_TRANSITIONS[status];
}
