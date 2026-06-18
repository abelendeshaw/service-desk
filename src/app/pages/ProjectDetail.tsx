import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Building2, Calendar, Clock, FileText,
  FolderKanban, ShieldCheck, Ticket as TicketIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { useServiceDesk } from "../store/serviceDeskStore";
import {
  calcSLAStatus, calcRemainingTime, calcDurationLabel,
  calcSupportType, slaStatusConfig,
} from "./SLAManagement";

const ticketStatusConfig: Record<string, { dot: string; badgeClass: string }> = {
  Open: { dot: "bg-blue-500", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  "In Progress": { dot: "bg-violet-500", badgeClass: "bg-violet-50 text-violet-700 border-violet-200" },
  Escalated: { dot: "bg-red-500", badgeClass: "bg-red-50 text-red-700 border-red-200" },
  Resolved: { dot: "bg-emerald-500", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Closed: { dot: "bg-muted-foreground", badgeClass: "bg-muted text-muted-foreground border-border" },
};

function initials2(name: string) {
  const parts = name.trim().split(/[\s/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { slas, tickets, clients } = useServiceDesk();

  const sla = slas.find((s) => s.id === id);

  const projectTickets = useMemo(
    () =>
      sla
        ? tickets.filter(
            (t) =>
              t.slaId === sla.id ||
              (t.project.toLowerCase() === sla.companyName.toLowerCase() &&
                (t.projectName === sla.projectName || !t.projectName)),
          )
        : [],
    [sla, tickets],
  );

  const associatedClients = useMemo(
    () =>
      sla
        ? clients.filter(
            (c) =>
              c.company.toLowerCase() === sla.companyName.toLowerCase() ||
              sla.companyName.toLowerCase().startsWith(c.company.toLowerCase()),
          )
        : [],
    [sla, clients],
  );

  if (!sla) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <FileText className="size-10 text-muted-foreground" />
        <p className="text-[14px] font-medium">Project not found</p>
        <Button size="sm" variant="outline" onClick={() => navigate("/sla")}>
          Back to SLA Management
        </Button>
      </div>
    );
  }

  const status = calcSLAStatus(sla.startDate, sla.endDate);
  const sc = slaStatusConfig[status];
  const StatusIcon = sc.icon;
  const supportType = calcSupportType(status);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(sla.startDate + "T00:00:00");
  const end = new Date(sla.endDate + "T00:00:00");
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
  const elapsed = Math.max(0, Math.min(totalDays, Math.round((today.getTime() - start.getTime()) / 86_400_000)));
  const progressPct = Math.round((elapsed / totalDays) * 100);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" />
            </Button>
            <Avatar className="size-11 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-[13px] font-bold text-primary-foreground">
                {initials2(sla.projectName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-semibold tracking-tight">{sla.projectName}</h1>
                <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                  <StatusIcon className="size-3" />
                  {status}
                </Badge>
                <Badge variant="outline" className="font-mono text-[11px]">{sla.id}</Badge>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">{sla.companyName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/sla/${sla.id}`)}>
            Edit SLA
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Calendar className="size-4" />
                  Contract Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[14px] font-semibold">{sla.startDate} → {sla.endDate}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{calcDurationLabel(sla.startDate, sla.endDate)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Clock className="size-4" />
                  Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[14px] font-semibold">{calcRemainingTime(sla.endDate)}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  Support Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-[12px]">{supportType}</Badge>
                <div className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">{sla.notes || "No notes"}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="gap-0 p-0">
            <CardHeader className="border-b px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <Building2 className="size-4 text-muted-foreground" />
                Associated Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {associatedClients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associatedClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate(`/clients/${encodeURIComponent(client.id)}`)}
                      >
                        <TableCell className="font-medium">{client.company}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{client.name || "—"}</TableCell>
                        <TableCell>{client.tier}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">{client.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                  No client record linked to {sla.companyName}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 p-0">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[14px]">
                  <TicketIcon className="size-4 text-muted-foreground" />
                  Related Tickets
                  <Badge variant="secondary" className="text-[11px]">{projectTickets.length}</Badge>
                </CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-[12px]" onClick={() => navigate("/tickets/new")}>
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {projectTickets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectTickets.map((ticket) => {
                      const tsc = ticketStatusConfig[ticket.status] ?? ticketStatusConfig.Open;
                      return (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <TableCell className="font-mono text-[12px]">{ticket.id}</TableCell>
                          <TableCell className="max-w-[280px] truncate font-medium">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 text-[11px] ${tsc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${tsc.dot}`} />
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[13px]">{ticket.priority ?? "—"}</TableCell>
                          <TableCell className="text-[12px] text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-5 py-8 text-center text-[13px] text-muted-foreground">
                  No tickets for this project yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[14px]">
                <FolderKanban className="size-4 text-muted-foreground" />
                SLA Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Company</div>
                <div className="mt-1 font-medium">{sla.companyName}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Project</div>
                <div className="mt-1 font-medium">{sla.projectName}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Notes</div>
                <div className="mt-1 leading-relaxed text-muted-foreground">{sla.notes || "—"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
