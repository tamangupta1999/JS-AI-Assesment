import { isValidTransition } from "@repo/shared";
import type { TicketStatus } from "@repo/shared";

export class InvalidTransitionError extends Error {
  constructor(from: TicketStatus, to: TicketStatus) {
    super(
      `Invalid status transition from '${from}' to '${to}'. Allowed transitions: ${isValidTransition(from, to) ? "none" : "see state machine"}`
    );
    this.name = "InvalidTransitionError";
  }
}

export function validateStatusTransition(
  currentStatus: TicketStatus,
  newStatus: TicketStatus
): void {
  if (currentStatus === newStatus) {
    return;
  }
  if (!isValidTransition(currentStatus, newStatus)) {
    throw new InvalidTransitionError(currentStatus, newStatus);
  }
}

export function formatTransitionError(
  from: TicketStatus,
  to: TicketStatus
): string {
  return `Cannot transition ticket from '${from}' to '${to}'. This transition is not allowed by the state machine.`;
}
