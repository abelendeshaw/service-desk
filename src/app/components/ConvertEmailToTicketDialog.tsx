import { useEffect, useMemo, useState } from "react";
import { Paperclip, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  TICKET_CATEGORIES,
  getClientSLAs,
  inferCompanyFromSender,
  normalizeTicketCategory,
} from "../lib/ticketProjects";
import { getTicketSupportType } from "../lib/ticketSupportType";
import { useServiceDesk } from "../store/serviceDeskStore";
import type { EmailThread, TicketPriority } from "../store/types";

const priorities: Exclude<TicketPriority, null>[] = ["Critical", "High", "Medium", "Low"];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  thread: EmailThread | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (ticketId: string) => void;
};

export function ConvertEmailToTicketDialog({ thread, open, onOpenChange, onCreated }: Props) {
  const { slas, clients, convertEmailToTicket } = useServiceDesk();
  const first = thread?.messages[0];
  const attachments = first?.attachments ?? [];

  const inferredCompany = useMemo(() => {
    if (!first?.from.email) return null;
    return inferCompanyFromSender(first.from.email, first.from.name, clients, slas);
  }, [first, clients, slas]);

  const projectOptions = useMemo(() => {
    if (inferredCompany) return getClientSLAs(inferredCompany, slas);
    return slas;
  }, [inferredCompany, slas]);

  const [form, setForm] = useState({
    subject: "",
    description: "",
    slaId: "",
    priority: "Medium" as Exclude<TicketPriority, null>,
    category: "General" as string,
  });

  useEffect(() => {
    if (!thread || !open) return;
    const defaultSla = projectOptions[0]?.id ?? "";
    setForm({
      subject: first?.subject ?? "",
      description: first?.body ?? "",
      slaId: defaultSla,
      priority: thread.priority ?? "Medium",
      category: normalizeTicketCategory(thread.tag),
    });
  }, [thread?.id, open, first?.subject, first?.body, thread?.priority, thread?.tag, projectOptions]);

  if (thread?.linkedTicketId) {
    return null;
  }

  const selectedSLA = projectOptions.find((s) => s.id === form.slaId);
  const company = inferredCompany ?? selectedSLA?.companyName ?? "";
  const supportType = company ? getTicketSupportType(slas, company) : "Normal Support";

  const canSubmit =
    form.subject.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    Boolean(form.slaId && selectedSLA);

  const validationHint = !form.subject.trim()
    ? "Enter a ticket title."
    : form.subject.trim().length < 3
      ? "Title must be at least 3 characters."
      : form.description.trim().length < 10
        ? `Description needs at least 10 characters (${form.description.trim().length}/10).`
        : !form.slaId
          ? "Select a project for this ticket."
          : null;

  const handleSubmit = () => {
    if (!thread || !selectedSLA || !canSubmit) return;
    const ticketId = convertEmailToTicket({
      emailId: thread.id,
      project: selectedSLA.companyName,
      projectName: selectedSLA.projectName,
      slaId: selectedSLA.id,
      subject: form.subject.trim(),
      description: form.description.trim(),
      priority: form.priority,
      category: form.category,
      supportType,
    });
    onOpenChange(false);
    onCreated(ticketId);
    toast.success(`Ticket #${ticketId} created from ${thread.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-4" />
            Create Ticket from Email
          </DialogTitle>
          <DialogDescription>
            Review and complete ticket details. Client information is taken from the sender.
          </DialogDescription>
        </DialogHeader>

        {first && (
          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Client (from email)
              </div>
              <div className="mt-1 text-[13px] font-medium">{first.from.name}</div>
              <div className="text-[12px] text-muted-foreground">{first.from.email}</div>
              {inferredCompany && (
                <div className="mt-1 text-[12px] text-primary">
                  Organization: {inferredCompany}
                </div>
              )}
            </div>
            {attachments.length > 0 && (
              <div>
                <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Attachments from email
                </div>
                <div className="space-y-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 rounded border bg-background px-2.5 py-1.5 text-[12px]"
                    >
                      <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">{att.name}</span>
                      <span className="shrink-0 text-muted-foreground">{formatFileSize(att.sizeBytes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-[12px]">Ticket Title *</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="mt-1.5 h-9 text-[13px]"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <Label className="text-[12px]">Project *</Label>
            <Select
              value={form.slaId || undefined}
              onValueChange={(v) => setForm((p) => ({ ...p, slaId: v }))}
            >
              <SelectTrigger className="mt-1.5 h-9 text-[13px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No projects available
                  </SelectItem>
                ) : (
                  projectOptions.map((sla) => (
                    <SelectItem key={sla.id} value={sla.id}>
                      {inferredCompany ? sla.projectName : `${sla.projectName} (${sla.companyName})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!inferredCompany && projectOptions.length > 0 && (
              <p className="mt-1 text-[11px] text-amber-700">
                Could not auto-detect client — please select the correct project.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px]">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Exclude<TicketPriority, null> }))}
              >
                <SelectTrigger className="mt-1.5 h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="mt-1.5 h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[12px]">Description *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={6}
              className="mt-1.5 resize-none text-[13px]"
              placeholder="Issue details from the email — edit or add context as needed"
            />
          </div>

          {validationHint && (
            <p className="text-[12px] text-amber-700">{validationHint}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
