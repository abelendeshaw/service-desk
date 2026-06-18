import type { SLA, Ticket } from "../store/types";
import type { ServiceDeskClient } from "./clientsData";

export const TICKET_CATEGORIES = [
  "Network",
  "Security",
  "Server",
  "Access",
  "General",
  "Reporting",
  "Infrastructure",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

/** Company code on ticket.project */
export function ticketCompany(ticket: Ticket): string {
  return ticket.project;
}

export function getTicketProjectName(ticket: Ticket, slas: SLA[]): string {
  if (ticket.projectName) return ticket.projectName;
  if (ticket.slaId) {
    const sla = slas.find((s) => s.id === ticket.slaId);
    if (sla) return sla.projectName;
  }
  const match = slas.find(
    (s) => s.companyName.toLowerCase() === ticket.project.toLowerCase(),
  );
  return match?.projectName ?? ticket.project;
}

export function getClientSLAs(company: string, slas: SLA[]): SLA[] {
  const c = company.toLowerCase();
  return slas.filter((s) => {
    const sc = s.companyName.toLowerCase();
    return sc === c || sc.startsWith(c + " ") || c.startsWith(sc);
  });
}

export function ticketMatchesCompany(ticket: Ticket, company: string): boolean {
  return ticket.project.toLowerCase() === company.toLowerCase();
}

export function ticketMatchesProjectFilter(
  ticket: Ticket,
  filter: string,
  slas: SLA[],
): boolean {
  if (filter === "all") return true;
  if (ticket.slaId === filter) return true;
  if (ticket.projectName === filter) return true;
  const sla = slas.find((s) => s.id === filter);
  if (sla && ticket.project.toLowerCase() === sla.companyName.toLowerCase()) {
    return ticket.projectName === sla.projectName || !ticket.projectName;
  }
  return ticket.project === filter || getTicketProjectName(ticket, slas) === filter;
}

export function normalizeTicketCategory(tag: string | null | undefined): TicketCategory {
  if (!tag) return "General";
  const match = TICKET_CATEGORIES.find((c) => c.toLowerCase() === tag.toLowerCase());
  if (match) return match;
  if (tag.toLowerCase().includes("network")) return "Network";
  if (tag.toLowerCase().includes("security") || tag.toLowerCase().includes("critical")) return "Security";
  if (tag.toLowerCase().includes("access")) return "Access";
  if (tag.toLowerCase().includes("report")) return "Reporting";
  if (tag.toLowerCase().includes("infrastructure") || tag.toLowerCase().includes("server")) return "Infrastructure";
  return "General";
}

export function inferCompanyFromSender(
  email: string,
  senderName: string,
  clients: ServiceDeskClient[],
  slas: SLA[],
): string | null {
  const fromEmail = inferCompanyFromEmail(email, clients);
  if (fromEmail) return fromEmail;

  const nameLower = senderName.toLowerCase();
  for (const c of clients) {
    if (nameLower.includes(c.company.toLowerCase())) return c.company;
  }
  for (const s of slas) {
    const cn = s.companyName.toLowerCase();
    if (nameLower.includes(cn) || cn.includes(nameLower.split(" ")[0])) return s.companyName;
  }
  return null;
}

export function inferCompanyFromEmail(
  email: string,
  clients: ServiceDeskClient[],
): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  const byClient = clients.find((c) => c.email.split("@")[1]?.toLowerCase() === domain);
  if (byClient) return byClient.company;
  const domainMap: Record<string, string> = {
    "epss.com": "EPSS",
    "ienetworks.co": "IE",
    "mint.gov.et": "MinT",
    "moti.gov.et": "MoTI",
  };
  if (domainMap[domain]) return domainMap[domain];
  if (domain === "gmail.com") {
    const local = email.split("@")[0]?.toLowerCase() ?? "";
    if (local === "ie" || local.startsWith("ie")) return "IE";
    if (local.includes("mint")) return "MinT";
    if (local.includes("moti")) return "MoTI";
    if (local.includes("epss")) return "EPSS";
    if (local.includes("era")) return "ERA/MOTL";
    return "EPSS";
  }
  const prefix = domain.split(".")[0];
  const byCompany = clients.find((c) => c.company.toLowerCase() === prefix);
  return byCompany?.company ?? null;
}

export function enrichTicket(ticket: Ticket, slas: SLA[]): Ticket {
  if (ticket.projectName && ticket.slaId) return ticket;
  const companySlas = getClientSLAs(ticket.project, slas);
  const sla =
    (ticket.slaId ? slas.find((s) => s.id === ticket.slaId) : null) ??
    companySlas[0];
  return {
    ...ticket,
    projectName: ticket.projectName ?? sla?.projectName ?? ticket.project,
    slaId: ticket.slaId ?? sla?.id ?? null,
    category: ticket.category ?? null,
  };
}
