import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Users,
  UserPlus,
  Clock,
  Building2,
  Send,
  AlertCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Paperclip,
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
import type { Ticket, TicketActivity } from "../../store/types";

const scrollClass =
  "min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const panelClass = "gap-0 rounded-none border-0 border-b p-0 shadow-none";
const panelHeaderClass = "px-5 py-4 pb-3";
const panelTitleClass = "text-[13px] font-semibold";
const panelContentClass = "px-5 pb-5 pt-0";

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

function getActivityLabel(item: TicketActivity, ticket: Ticket) {
  switch (item.type) {
    case "created":
      return item.detail ?? "Ticket created";
    case "assigned":
      return `Assigned to ${item.engineer.name}`;
    case "status":
      return `Status changed from ${item.from} to ${item.to}`;
    case "escalated":
      return `Escalated to ${item.target}: ${item.reason}`;
    case "comment": {
      const comment = ticket.comments.find((c) => c.id === item.commentId);
      return comment && !comment.internal ? comment.body : null;
    }
    default:
      return null;
  }
}

export function ClientTicketDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const ticketId = id.replace("#", "");
  const { user } = useAuth();
  const { tickets, engineers, addTicketComment, slas, confirmTicketResolution, rejectTicketResolution } = useServiceDesk();
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const ticket = tickets.find((t) => t.id === ticketId);
  const isOwnTicket = ticket?.project === user?.company;

  const visibleActivity = useMemo(() => {
    if (!ticket) return [];
    return ticket.activity.filter((item) => getActivityLabel(item, ticket) !== null);
  }, [ticket]);

  const assignedEngineers = useMemo(
    () =>
      ticket
        ? (ticket.assignedEngineerIds ?? (ticket.assignedEngineerId ? [ticket.assignedEngineerId] : []))
            .map((engineerId) => engineers.find((e) => e.id === engineerId))
            .filter((engineer): engineer is (typeof engineers)[number] => Boolean(engineer))
        : [],
    [engineers, ticket],
  );

  if (!ticket) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ticket not found</AlertTitle>
          <AlertDescription>
            This ticket does not exist or you do not have access.{" "}
            <button className="underline" onClick={() => navigate("/client/tickets")}>
              Back to tickets
            </button>
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
          <AlertDescription>
            You can only view tickets for your organization ({user?.company}).
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sc = statusColors[ticket.status] ?? statusColors.Open;
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/30">
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
          onClick={() => navigate("/client/tickets")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {user?.company ?? "Tickets"}
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <span className="font-mono text-[12px] text-muted-foreground">#{ticket.id}</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b bg-background px-6 py-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-violet-600 text-[13px] font-semibold text-white">
                {ticket.project.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  #{ticket.id}
                </span>
                <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.className}`}>
                  <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                  {ticket.status}
                </Badge>
                {ticket.priority && (
                  <Badge variant="outline" className="text-[11px]">
                    {ticket.priority}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                  {supportType}
                </Badge>
              </div>
              <h1 className="text-[16px] font-semibold leading-snug">{ticket.subject}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {getTicketProjectName(ticket, slas)}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {ticket.createdBy.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,2fr)_minmax(400px,2.5fr)] overflow-hidden">
          <div className={`min-w-0 border-r bg-background ${scrollClass}`}>
            {ticket.status === "Resolved" && (
              <div className="border-b bg-emerald-50 px-5 py-4">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-emerald-800">
                  <CheckCircle2 className="size-4" />
                  Resolution pending your confirmation
                </div>
                <p className="mb-3 text-[12px] text-emerald-900">
                  Please confirm the issue is resolved, or reopen the ticket with feedback.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="h-8 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() =>
                      user &&
                      confirmTicketResolution({
                        ticketId: ticket.id,
                        author: { name: user.name, initials: user.initials },
                      })
                    }
                  >
                    Confirm Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => {
                      if (!rejectReason.trim() || !user) return;
                      rejectTicketResolution({
                        ticketId: ticket.id,
                        reason: rejectReason.trim(),
                        author: { name: user.name, initials: user.initials },
                      });
                      setRejectReason("");
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Reopen Ticket
                  </Button>
                </div>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="If not resolved, explain what still needs attention..."
                  rows={2}
                  className="mt-3 resize-none text-[12px]"
                />
              </div>
            )}
            <div className="space-y-0">
              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className={panelContentClass}>
                  <div className="relative">
                    {[
                      {
                        icon: Calendar,
                        label: "Created",
                        date: ticket.createdAt,
                        urgent: false,
                      },
                      {
                        icon: Clock,
                        label: "Last updated",
                        date: ticket.updatedAt,
                        urgent: false,
                      },
                      {
                        icon: AlertTriangle,
                        label: "Resolution due",
                        date: ticket.resolutionDueDate,
                        urgent: Boolean(ticket.resolutionDueDate),
                        emptyLabel: "No due date",
                        dateOnly: true,
                      },
                    ].map((item, index, items) => {
                      const Icon = item.icon;
                      const parsed = item.date ? new Date(item.date) : null;
                      const isLast = index === items.length - 1;
                      return (
                        <div key={item.label} className={`relative flex gap-3.5 ${isLast ? "" : "pb-5"}`}>
                          {!isLast && (
                            <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border" />
                          )}
                          <div
                            className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background ${
                              item.urgent ? "border-red-200 bg-red-50" : ""
                            }`}
                          >
                            <Icon
                              className={`size-3 ${item.urgent ? "text-red-600" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="text-[12px] font-medium">{item.label}</div>
                            {parsed && !Number.isNaN(parsed.getTime()) ? (
                              <>
                                <div className="mt-0.5 text-[13px] text-foreground">
                                  {parsed.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                                {!item.dateOnly && (
                                  <div className="text-[11px] text-muted-foreground">
                                    {parsed.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div
                                className={`mt-0.5 text-[13px] ${
                                  item.urgent ? "font-medium text-red-600" : "text-muted-foreground"
                                }`}
                              >
                                {item.emptyLabel ?? "—"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {ticket.escalation && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-red-700">
                        <TrendingUp className="size-3.5" />
                        Escalated to {ticket.escalation.target}
                      </div>
                      <div className="text-[12px] leading-relaxed text-red-700">
                        {ticket.escalation.reason}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Assignment</CardTitle>
                </CardHeader>
                <CardContent className={panelContentClass}>
                  <div className="mb-2 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Field Engineers
                    </span>
                    <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                      {assignedEngineers.length}
                    </Badge>
                  </div>
                  {assignedEngineers.length > 0 ? (
                    <div className="space-y-2">
                      {assignedEngineers.map((engineer, i) => (
                        <div key={engineer.id} className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback
                              className="text-[11px] font-semibold text-white"
                              style={{
                                backgroundColor: ["#1d4ed8", "#7c3aed", "#0891b2", "#059669"][i % 4],
                              }}
                            >
                              {engineer.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px] text-muted-foreground">{engineer.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border border-dashed p-2.5 text-[13px] text-muted-foreground">
                      <UserPlus className="w-3.5 h-3.5" />
                      No field engineers assigned yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`${panelClass} border-b-0`}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Issues</CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 ${panelContentClass}`}>
                  {ticket.issues.length > 0 ? (
                    ticket.issues.map((issue) => (
                      <div key={issue.id} className="rounded-md border p-4">
                        <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                          Issue Name
                        </div>
                        <div className="text-[13px] font-medium">{issue.title}</div>
                        <div className="mt-3 border-t pt-3">
                          <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                            Description
                          </div>
                          <div className="text-[13px] text-muted-foreground">{issue.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-[13px] text-muted-foreground">
                      No issues linked to this ticket
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className={`min-w-0 bg-background ${scrollClass}`}>
            <div className="space-y-0">
              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Description</CardTitle>
                </CardHeader>
                <CardContent className={panelContentClass}>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">{ticket.description}</p>
                </CardContent>
              </Card>

              <Card className={`${panelClass} border-b-0`}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Activity</CardTitle>
                </CardHeader>

                <CardContent className={`space-y-5 ${panelContentClass}`}>
                  {visibleActivity.length > 0 ? (
                    visibleActivity.map((item, i) => {
                      const Icon = iconMap[item.type] ?? MessageSquare;
                      const content = getActivityLabel(item, ticket);
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            {i < visibleActivity.length - 1 && (
                              <div className="mt-2 w-px flex-1 bg-border" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pb-2">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-[13px] font-medium capitalize">{item.type}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {content && (
                              <div className="rounded-md border p-3 text-[13px] leading-relaxed text-muted-foreground">
                                {content}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-[13px] text-muted-foreground">
                      No activity yet
                    </div>
                  )}
                </CardContent>

                <CardContent className="border-t px-5 py-4 pt-4">
                  <div className="overflow-hidden rounded-md border">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ask a question or provide additional information..."
                      rows={3}
                      className="max-h-40 resize-none border-0 px-4 py-3 text-[13px] focus-visible:ring-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    />
                    <div className="flex items-center justify-between border-t bg-muted px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7" disabled>
                          <Paperclip className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 gap-1.5 px-3 text-[12px]"
                        disabled={!comment.trim()}
                        onClick={handleComment}
                      >
                        <Send className="w-3 h-3" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
