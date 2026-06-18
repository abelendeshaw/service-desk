import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowUpDown, Eye, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getClientSLAs, getTicketProjectName, ticketMatchesProjectFilter } from "../../lib/ticketProjects";
import { resolveTicketSupportType, supportTypeBadgeClass } from "../../lib/ticketSupportType";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";

const statusConfig: Record<string, { dotClass: string; badgeClass: string }> = {
  Open: { dotClass: "bg-blue-500", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  "In Progress": { dotClass: "bg-amber-500", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  Escalated: { dotClass: "bg-red-500", badgeClass: "bg-red-50 text-red-700 border-red-200" },
  Resolved: { dotClass: "bg-emerald-500", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Closed: { dotClass: "bg-muted-foreground", badgeClass: "bg-muted text-muted-foreground border-border" },
};

const priorityConfig: Record<string, { textClass: string }> = {
  Critical: { textClass: "text-red-700" },
  High: { textClass: "text-amber-700" },
  Medium: { textClass: "text-blue-700" },
  Low: { textClass: "text-emerald-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function ClientTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, engineers, slas } = useServiceDesk();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const clientProjects = useMemo(
    () => (user ? getClientSLAs(user.company, slas) : []),
    [user, slas],
  );

  const myTickets = useMemo(
    () => tickets.filter((t) => t.project === user?.company),
    [tickets, user?.company],
  );

  const filtered = useMemo(() => {
    return myTickets.filter((t) => {
      if (
        search &&
        !t.subject.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.includes(search)
      ) {
        return false;
      }
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority?.toLowerCase() !== priorityFilter) return false;
      if (!ticketMatchesProjectFilter(t, projectFilter, slas)) return false;
      return true;
    });
  }, [myTickets, search, statusFilter, priorityFilter, projectFilter, slas]);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">{user?.company}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Support tickets · {myTickets.length} total
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-violet-600 text-[13px] hover:bg-violet-700"
            onClick={() => navigate("/client/tickets/new")}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-muted pl-9 pr-3 text-[13px]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px] text-[13px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in progress">In Progress</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[130px] text-[13px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="h-8 w-[200px] text-[13px]"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {clientProjects.map((sla) => (
              <SelectItem key={sla.id} value={sla.id}>{sla.projectName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Project</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Support</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Field Engineer</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Updated</TableHead>
              <TableHead className="w-16 px-5 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-[13px] text-muted-foreground">
                      {search || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"
                        ? "No tickets match your filters."
                        : "No tickets yet. Submit your first support request."}
                    </p>
                    {!search && statusFilter === "all" && priorityFilter === "all" && (
                      <Button
                        size="sm"
                        className="gap-1.5 bg-violet-600 hover:bg-violet-700"
                        onClick={() => navigate("/client/tickets/new")}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Ticket
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ticket) => {
                const sc = statusConfig[ticket.status];
                const engineer = engineers.find((e) => e.id === ticket.assignedEngineerId);
                const supportType = resolveTicketSupportType(ticket, slas);
                return (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/client/tickets/${ticket.id}`)}
                  >
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 rounded-md">
                          <AvatarFallback className="rounded-md bg-violet-100 text-[11px] font-semibold text-violet-700">
                            {ticket.project.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="max-w-md truncate text-[13px] font-medium">{ticket.subject}</div>
                          <div className="text-[11px] text-muted-foreground">#{ticket.id} · {formatDate(ticket.createdAt)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {getTicketProjectName(ticket, slas)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc?.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                        {supportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      {ticket.priority ? (
                        <span className={`text-[12px] font-medium ${priorityConfig[ticket.priority]?.textClass}`}>
                          {ticket.priority}
                        </span>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {engineer?.name ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Button variant="ghost" size="icon" className="size-7">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
        <span className="text-[12px] text-muted-foreground">
          Showing {filtered.length} of {myTickets.length} tickets
        </span>
        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <ArrowUpDown className="w-3 h-3" />
          Sorted by latest update
        </div>
      </div>
    </div>
  );
}
