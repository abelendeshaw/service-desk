import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Users,
  Clock,
  Building2,
  Send,
  AlertCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { resolveTicketSupportType, supportTypeBadgeClass } from "../../lib/ticketSupportType";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";

const iconMap: Record<string, typeof MessageSquare> = {
  created: MessageSquare,
  assigned: Users,
  comment: MessageSquare,
  status: CheckCircle2,
  escalated: AlertCircle,
};

const statusColors: Record<string, { className: string; dotClass: string }> = {
  Open: { className: "bg-blue-50 text-blue-700 border-blue-200", dotClass: "bg-blue-500" },
  "In Progress": { className: "bg-amber-50 text-amber-700 border-amber-200", dotClass: "bg-amber-500" },
  Escalated: { className: "bg-red-50 text-red-700 border-red-200", dotClass: "bg-red-500" },
  Resolved: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotClass: "bg-emerald-500" },
  Closed: { className: "bg-muted text-muted-foreground border-border", dotClass: "bg-muted-foreground" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientTicketDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const ticketId = id.replace("#", "");
  const { user } = useAuth();
  const { tickets, engineers, addTicketComment, slas } = useServiceDesk();
  const [comment, setComment] = useState("");

  const ticket = tickets.find((t) => t.id === ticketId);
  const isOwnTicket = ticket?.project === user?.company;

  const publicComments = useMemo(
    () => (ticket?.comments ?? []).filter((c) => !c.internal),
    [ticket?.comments],
  );

  const publicActivity = useMemo(
    () =>
      (ticket?.activity ?? []).filter((a) => a.type !== "comment" || true),
    [ticket?.activity],
  );

  if (!ticket) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ticket not found</AlertTitle>
          <AlertDescription>
            This ticket does not exist or you do not have access.{" "}
            <button className="underline" onClick={() => navigate("/client/tickets")}>Back to tickets</button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isOwnTicket) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access denied</AlertTitle>
          <AlertDescription>You can only view tickets for your organization ({user?.company}).</AlertDescription>
        </Alert>
      </div>
    );
  }

  const engineer = engineers.find((e) => e.id === ticket.assignedEngineerId);
  const sc = statusColors[ticket.status];
  const supportType = resolveTicketSupportType(ticket, slas);

  const handleComment = () => {
    if (!comment.trim() || !user) return;
    addTicketComment({
      ticketId: ticket.id,
      body: comment.trim(),
      internal: false,
      attachments: [],
      author: { name: user.name, initials: user.initials, role: "Client Contact" },
    });
    setComment("");
    toast.success("Comment posted");
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]" onClick={() => navigate("/client/tickets")}>
          <ArrowLeft className="w-3.5 h-3.5" />
          My Tickets
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="font-mono text-[12px] text-muted-foreground">#{ticket.id}</span>
        <Badge variant="outline" className={`ml-2 gap-1.5 text-[11px] ${sc?.className}`}>
          <span className={`size-1.5 rounded-full ${sc?.dotClass}`} />
          {ticket.status}
        </Badge>
        <Badge variant="secondary" className="ml-auto text-[11px]">Read-only</Badge>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">{ticket.subject}</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Opened {formatDateTime(ticket.createdAt)} · Last updated {formatDateTime(ticket.updatedAt)}
              </p>
            </div>

            <Card className="p-5">
              <h3 className="mb-3 text-[13px] font-semibold">Description</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{ticket.description}</p>
            </Card>

            {ticket.issues.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-3 text-[13px] font-semibold">Issues</h3>
                <div className="space-y-3">
                  {ticket.issues.map((issue) => (
                    <div key={issue.id} className="rounded-md border p-3">
                      <div className="text-[13px] font-medium">{issue.title}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{issue.description}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="gap-0 overflow-hidden p-0">
              <CardHeader className="border-b">
                <CardTitle className="text-[14px]">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {publicActivity.map((item, i) => {
                  const Icon = iconMap[item.type] ?? MessageSquare;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        {i < publicActivity.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">{item.author.name}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                        </div>
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          {item.type === "created" && (item.detail ?? "Ticket created")}
                          {item.type === "assigned" && `Assigned to ${item.engineer.name}`}
                          {item.type === "status" && `Status changed from ${item.from} to ${item.to}`}
                          {item.type === "escalated" && `Escalated to ${item.target}: ${item.reason}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {publicComments.length > 0 && (
              <Card className="gap-0 overflow-hidden p-0">
                <CardHeader className="border-b">
                  <CardTitle className="text-[14px]">Comments</CardTitle>
                </CardHeader>
                <CardContent className="divide-y p-0">
                  {publicComments.map((c) => (
                    <div key={c.id} className="flex gap-3 px-5 py-4">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px] font-semibold">{c.author.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">{c.author.name}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-[13px] text-muted-foreground">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="p-5">
              <h3 className="mb-3 text-[13px] font-semibold">Add a Comment</h3>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ask a question or provide additional information..."
                rows={3}
                className="resize-none text-[13px]"
              />
              <div className="mt-3 flex justify-end">
                <Button size="sm" className="gap-1.5 text-[12px]" disabled={!comment.trim()} onClick={handleComment}>
                  <Send className="w-3 h-3" />
                  Post Comment
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="w-[280px] shrink-0 overflow-y-auto border-l bg-background p-4">
          <Card className="border-0 shadow-none">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-[11px] uppercase tracking-wider text-muted-foreground">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <div>
                <div className="mb-0.5 text-[11px] text-muted-foreground">Support Type</div>
                <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                  {supportType}
                </Badge>
              </div>
              {[
                { label: "Status", value: ticket.status },
                { label: "Priority", value: ticket.priority ?? "—" },
                { label: "Created By", value: ticket.createdBy.name, sub: ticket.createdBy.email, icon: User },
                { label: "Project", value: ticket.project, icon: Building2 },
                { label: "Field Engineer", value: engineer?.name ?? "Unassigned", icon: Users },
                { label: "Due Date", value: ticket.resolutionDueDate ?? "—", icon: Clock },
              ].map(({ label, value, sub, icon: Icon }) => (
                <div key={label}>
                  <div className="mb-0.5 text-[11px] text-muted-foreground">{label}</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-medium">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>{value}</span>
                  </div>
                  {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
