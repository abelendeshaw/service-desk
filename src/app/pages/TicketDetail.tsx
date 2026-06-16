import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  Trash2,
  Plus,
  Users,
  UserPlus,
  Pencil,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  Paperclip,
  ChevronRight,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { useServiceDesk } from "../store/serviceDeskStore";

const scrollClass =
  "min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const panelClass = "gap-0 rounded-none border-0 border-b p-0 shadow-none";
const panelHeaderClass = "px-5 py-4 pb-3";
const panelTitleClass = "text-[13px] font-semibold";
const panelContentClass = "px-5 pb-5 pt-0";

const iconMap: Record<string, any> = {
  created: MessageSquare,
  assigned: Users,
  comment: MessageSquare,
  status: CheckCircle2,
};

export function TicketDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const ticketId = (params.id ?? "").replace("#", "");
  const {
    tickets,
    engineers,
    assignTicket,
    setTicketEngineers,
    updateTicketStatus,
    escalateTicket,
    addTicketComment,
    getOrCreateTicketArticle,
  } = useServiceDesk();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("");
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("Open");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignedEngineerIds, setEditAssignedEngineerIds] = useState<
    string[]
  >([]);
  const statusOptions = [
    "Open",
    "In Progress",
    "Escalated",
    "Resolved",
    "Closed",
  ];
  const priorityOptions = ["Critical", "High", "Medium", "Low"];
  const escalationTargets = [
    "Team Lead",
    "Support Manager",
    "Operations Manager",
    "Vendor",
    "Client Management",
  ] as const;
  type EscalationTargetOption = (typeof escalationTargets)[number];
  const [escalationTarget, setEscalationTarget] =
    useState<EscalationTargetOption>("Support Manager");
  const [escalationAssigneeId, setEscalationAssigneeId] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const canEscalate = Boolean(escalationAssigneeId && escalationReason.trim());

  const statusColors: Record<string, { className: string; dotClass: string }> =
    {
      Open: {
        className: "bg-blue-50 text-blue-700 border-blue-200",
        dotClass: "bg-blue-500",
      },
      "In Progress": {
        className: "bg-amber-50 text-amber-700 border-amber-200",
        dotClass: "bg-amber-500",
      },
      Escalated: {
        className: "bg-red-50 text-red-700 border-red-200",
        dotClass: "bg-red-500",
      },
      Resolved: {
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotClass: "bg-emerald-500",
      },
      Closed: {
        className: "bg-muted text-muted-foreground border-border",
        dotClass: "bg-muted-foreground",
      },
    };

  React.useEffect(() => {
    if (!ticket) return;
    setStatus(ticket.status);
    setPriority(ticket.priority ?? "");
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority ?? "");
    setEditAssignedEngineerIds(
      ticket.assignedEngineerIds ??
        (ticket.assignedEngineerId ? [ticket.assignedEngineerId] : []),
    );
  }, [ticket]);

  const sc = statusColors[status] ?? statusColors.Open;
  const assignedEngineers = (
    ticket?.assignedEngineerIds ??
    (ticket?.assignedEngineerId ? [ticket.assignedEngineerId] : [])
  )
    .map((id) => engineers.find((e) => e.id === id))
    .filter((engineer): engineer is (typeof engineers)[number] => Boolean(engineer));
  const requiresEscalationFields = editStatus === "Escalated";
  const canSaveDetails =
    !requiresEscalationFields ||
    Boolean(escalationAssigneeId && escalationReason.trim());

  const handleSaveDetails = () => {
    if (!ticket) return;
    const currentAssignedIds =
      ticket.assignedEngineerIds ??
      (ticket.assignedEngineerId ? [ticket.assignedEngineerId] : []);
    if (editAssignedEngineerIds.join("|") !== currentAssignedIds.join("|")) {
      setTicketEngineers({
        ticketId: ticket.id,
        engineerIds: editAssignedEngineerIds,
      });
    }

    if (editStatus !== ticket.status) {
      if (editStatus === "Escalated") {
        if (!escalationAssigneeId || !escalationReason.trim()) return;
        if (
          escalationAssigneeId !== "unassigned" &&
          escalationAssigneeId !== ticket.assignedEngineerId
        ) {
          assignTicket({
            ticketId: ticket.id,
            engineerId: escalationAssigneeId,
          });
        }
        escalateTicket({
          ticketId: ticket.id,
          target: escalationTarget,
          reason: escalationReason.trim(),
        });
        setStatus("Escalated");
      } else {
        updateTicketStatus({ ticketId: ticket.id, status: editStatus as any });
        setStatus(editStatus);
      }
    }

    setPriority(editPriority);
    setEscalationReason("");
    setEscalationAssigneeId("");
    setIsEditDetailsOpen(false);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/30">
      {!ticket ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-[13px] text-muted-foreground">
            Ticket not found.
          </div>
        </div>
      ) : (
        <>
          {/* Top Action Bar */}
          <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
            <Button
              onClick={() => navigate("/tickets")}
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-[12px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tickets
            </Button>

            <Separator orientation="vertical" className="mx-1 h-4" />

            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="px-1 text-[12px] text-muted-foreground">
              #{ticket.id}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-[12px]"
                onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-[12px] text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
              <Button
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-[12px]"
                onClick={() => {
                  getOrCreateTicketArticle({ ticketId: ticket.id });
                  navigate(`/knowledge/edit/${ticket.id}`);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Article
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Full-width ticket summary */}
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
                    <Badge
                      variant="outline"
                      className={`gap-1.5 text-[11px] ${sc.className}`}
                    >
                      <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                      {status}
                    </Badge>
                    {ticket.priority && (
                      <Badge variant="outline" className="text-[11px]">
                        {ticket.priority}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-[16px] font-semibold leading-snug">
                    {ticket.subject}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Created {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {ticket.project}
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
            {/* Left — ticket details & assignment */}
            <div className={`min-w-0 border-r bg-background ${scrollClass}`}>
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
                    <div className="flex items-center justify-between">
                      <CardTitle className={panelTitleClass}>Assignment</CardTitle>
                      <Button variant="link" className="h-auto p-0 text-[11px]">
                        Manage
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={`space-y-5 ${panelContentClass}`}>
                    <div>
                      <div className="mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Teams
                        </span>
                      </div>
                      <div className="space-y-2">
                        {["Wongel Wondyifraw", "Sisay Shiferaw", "Masresha Melese"].map((name, i) => (
                          <div key={name} className="flex items-center gap-2.5">
                            <Avatar className="size-7">
                              <AvatarFallback
                                className="text-[11px] font-semibold text-white"
                                style={{
                                  backgroundColor: ["#1d4ed8", "#7c3aed", "#0891b2"][i],
                                }}
                              >
                                {name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] text-muted-foreground">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
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
                          No field engineers assigned
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${panelClass} border-b-0`}>
                  <CardHeader className={panelHeaderClass}>
                    <div className="flex items-center justify-between">
                      <CardTitle className={panelTitleClass}>Issues</CardTitle>
                      <Button variant="link" className="h-auto gap-1 p-0 text-[12px]">
                        <Plus className="w-3.5 h-3.5" /> Add Issue
                      </Button>
                    </div>
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
                            <div className="text-[13px] text-muted-foreground">
                              {issue.description}
                            </div>
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

            {/* Right — description & activity */}
            <div className={`min-w-0 bg-background ${scrollClass}`}>
              <div className="space-y-0">
                <Card className={panelClass}>
                  <CardHeader className={panelHeaderClass}>
                    <CardTitle className={panelTitleClass}>Description</CardTitle>
                  </CardHeader>
                  <CardContent className={panelContentClass}>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {ticket.description}
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${panelClass} border-b-0`}>
                  <CardHeader className={panelHeaderClass}>
                    <CardTitle className={panelTitleClass}>Activity</CardTitle>
                  </CardHeader>

                  <CardContent className={`space-y-5 ${panelContentClass}`}>
                    {[...ticket.activity].slice(0, 30).map((item, i) => {
                      const Icon = iconMap[item.type] || MessageSquare;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            {i < Math.min(ticket.activity.length, 30) - 1 && (
                              <div className="mt-2 w-px flex-1 bg-border" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pb-2">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-[13px] font-medium capitalize">
                                {item.type}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {"detail" in item && item.detail ? (
                              <div className="rounded-md border p-3 text-[13px] leading-relaxed text-muted-foreground">
                                {item.detail}
                              </div>
                            ) : (
                              <div className="text-[12px] capitalize text-muted-foreground">
                                {item.type}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>

                  <CardContent className="border-t px-5 py-4 pt-4">
                    <div className="overflow-hidden rounded-md border">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment or reply..."
                        rows={3}
                        className="max-h-40 resize-none border-0 px-4 py-3 text-[13px] focus-visible:ring-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      />
                      <div className="flex items-center justify-between border-t bg-muted px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-7">
                            <Paperclip className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="h-7 gap-1.5 px-3 text-[12px]"
                          onClick={() => {
                            if (!comment.trim()) return;
                            addTicketComment({
                              ticketId: ticket.id,
                              body: comment.trim(),
                              internal: false,
                              attachments: [],
                            });
                            setComment("");
                          }}
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            </div>
          </div>
          <Dialog open={isEditDetailsOpen} onOpenChange={setIsEditDetailsOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Ticket Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-1">
                <div>
                  <div className="mb-1 text-[11px] text-muted-foreground">
                    Status
                  </div>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-8 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted-foreground">
                    Priority
                  </div>
                  <Select
                    value={editPriority || "none"}
                    onValueChange={(v) =>
                      setEditPriority(v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-8 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No priority</SelectItem>
                      {priorityOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted-foreground">
                    Assigned Engineer
                  </div>
                  <div className="space-y-1 rounded-md border p-2.5">
                    {engineers.map((e) => {
                      const checked = editAssignedEngineerIds.includes(e.id);
                      return (
                        <label
                          key={e.id}
                          className="flex items-center gap-2 text-[12px] text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              if (event.target.checked) {
                                setEditAssignedEngineerIds((prev) =>
                                  Array.from(new Set([...prev, e.id])),
                                );
                              } else {
                                setEditAssignedEngineerIds((prev) =>
                                  prev.filter((id) => id !== e.id),
                                );
                              }
                            }}
                          />
                          {e.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
                {requiresEscalationFields && (
                  <div className="space-y-2 rounded-md border p-3">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      Escalation Details
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] text-muted-foreground">
                        Escalation Target
                      </div>
                      <Select
                        value={escalationTarget}
                        onValueChange={(v) => {
                          if (
                            escalationTargets.includes(
                              v as EscalationTargetOption,
                            )
                          ) {
                            setEscalationTarget(v as EscalationTargetOption);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {escalationTargets.map((target) => (
                            <SelectItem key={target} value={target}>
                              {target}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] text-muted-foreground">
                        Escalation Owner
                      </div>
                      <Select
                        value={escalationAssigneeId || "unassigned"}
                        onValueChange={(v) =>
                          setEscalationAssigneeId(v === "unassigned" ? "" : v)
                        }
                      >
                        <SelectTrigger className="h-8 text-[12px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            Select escalation owner
                          </SelectItem>
                          {engineers.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] text-muted-foreground">
                        Reason
                      </div>
                      <Textarea
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="Describe why this ticket should be escalated..."
                        rows={3}
                        className="min-h-[76px] text-[12px]"
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDetailsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveDetails} disabled={!canSaveDetails}>
                  Save Details
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
