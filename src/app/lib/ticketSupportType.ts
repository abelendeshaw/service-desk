import { calcSLAStatus, calcSupportType } from "../pages/SLAManagement";
import type { SLA, SLAStatus, Ticket } from "../store/types";

export type TicketSupportCategory = "CSAT" | "Normal Support";

export const supportTypeBadgeClass: Record<TicketSupportCategory, string> = {
  CSAT: "bg-red-50 text-red-700 border-red-200",
  "Normal Support": "bg-blue-50 text-blue-700 border-blue-200",
};

export function matchSLAs(slas: SLA[], company: string): SLA[] {
  const c = company.toLowerCase();
  return slas.filter((s) => {
    const sc = s.companyName.toLowerCase();
    return sc === c || sc.startsWith(c + " ");
  });
}

export function getProjectSLAStatus(slas: SLA[], project: string): SLAStatus | null {
  const matched = matchSLAs(slas, project);
  if (matched.length === 0) return null;
  const statuses = matched.map((s) => calcSLAStatus(s.startDate, s.endDate));
  if (statuses.includes("Expiring Soon")) return "Expiring Soon";
  if (statuses.includes("Active")) return "Active";
  if (statuses.includes("Upcoming")) return "Upcoming";
  return "Expired";
}

/** CSAT when the org's SLA is expired; otherwise Normal Support. */
export function getTicketSupportType(slas: SLA[], project: string): TicketSupportCategory {
  const status = getProjectSLAStatus(slas, project);
  return status ? (calcSupportType(status) as TicketSupportCategory) : "Normal Support";
}

export function supportTypeExplanation(slas: SLA[], project: string): string {
  const status = getProjectSLAStatus(slas, project);
  if (!status) {
    return "No active service agreement found — defaulting to Normal Support.";
  }
  if (status === "Expired") {
    return "Your service agreement has expired. Tickets are routed as CSAT.";
  }
  return `Your service agreement is ${status.toLowerCase()}. Tickets are routed as Normal Support.`;
}

/** Prefer stored CSAT/Normal Support; fall back to SLA lookup for legacy tickets. */
export function resolveTicketSupportType(ticket: Ticket, slas: SLA[]): TicketSupportCategory {
  if (ticket.supportType === "CSAT" || ticket.supportType === "Normal Support") {
    return ticket.supportType;
  }
  return getTicketSupportType(slas, ticket.project);
}
