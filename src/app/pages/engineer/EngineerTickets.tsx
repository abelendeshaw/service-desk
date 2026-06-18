import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowUpDown, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { filterTicketsForEngineer } from "../../lib/engineerTickets";
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

export function EngineerTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, slas, updateTicketStatus, addTicketComment } = useServiceDesk();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [resolveTicketId, setResolveTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const resolveTicket = resolveTicketId ? tickets.find((t) => t.id === resolveTicketId) : null;

  const myTickets = useMemo(
    () => filterTicketsForEngineer(tickets, user?.engineerId),
    [tickets, user?.engineerId],
  );

  const filtered = useMemo(() => {
    return myTickets.filter((t) => {
      if (
        search &&
        !t.subject.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.includes(search) &&
        !t.project.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && t.status.toLowerCase() !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority?.toLowerCase() !== priorityFilter) return false;
      return true;
    });
  }, [myTickets, search, statusFilter, priorityFilter]);

  const handleResolve = () => {
    if (!resolveTicket || !user) return;
    const note = resolutionNotes.trim();
    updateTicketStatus({
      ticketId: resolveTicket.id,
      status: "Resolved",
      reason: note || undefined,
    });
    if (note) {
      addTicketComment({
        ticketId: resolveTicket.id,
        body: note,
        internal: false,
        attachments: [],
        author: { name: user.name, initials: user.initials, role: "Field Engineer" },
      });
    }
    setResolveTicketId(null);
    setResolutionNotes("");
    toast.success("Ticket marked as resolved");
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">My Tickets</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Tickets assigned to you · {myTickets.length} total
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b bg-background px-6 py-3 flex-shrink-0 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject, ID, or project..."
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
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Support</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Project</TableHead>
              <TableHead className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Updated</TableHead>
              <TableHead className="w-36 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-16 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    {search || statusFilter !== "all" || priorityFilter !== "all"
                      ? "No tickets match your filters."
                      : "No tickets assigned to you yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ticket) => {
                const sc = statusConfig[ticket.status];
                const supportType = resolveTicketSupportType(ticket, slas);
                return (
                  <TableRow
                    key={ticket.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/engineer/tickets/${ticket.id}`)}
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
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">{ticket.project}</TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-muted-foreground">
                      {formatDate(ticket.updatedAt)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => navigate(`/engineer/tickets/${ticket.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 px-2 text-[11px] text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => {
                              setResolveTicketId(ticket.id);
                              setResolutionNotes("");
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Resolve
                          </Button>
                        )}
                      </div>
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

      <Dialog
        open={resolveTicketId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResolveTicketId(null);
            setResolutionNotes("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Ticket</DialogTitle>
            <DialogDescription>
              Mark ticket #{resolveTicket?.id} as resolved. Add an optional note for the client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-[12px]">
              Resolution note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe what was done to resolve the issue..."
              rows={5}
              className="resize-none text-[13px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTicketId(null)}>Cancel</Button>
            <Button onClick={handleResolve}>
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
