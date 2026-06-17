import type { Ticket } from "../store/types";

export function isTicketAssignedToEngineer(ticket: Ticket, engineerId: string | undefined): boolean {
  if (!engineerId) return false;
  return (
    ticket.assignedEngineerIds?.includes(engineerId) ||
    ticket.assignedEngineerId === engineerId
  );
}

export function filterTicketsForEngineer(tickets: Ticket[], engineerId: string | undefined): Ticket[] {
  if (!engineerId) return [];
  return tickets.filter((t) => isTicketAssignedToEngineer(t, engineerId));
}
