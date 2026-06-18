import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlignLeft, ChevronRight, Tag, Ticket, User } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getClientSLAs } from "../../lib/ticketProjects";
import { getTicketSupportType, supportTypeBadgeClass, supportTypeExplanation } from "../../lib/ticketSupportType";
import { useAuth } from "../../store/authStore";
import { useServiceDesk } from "../../store/serviceDeskStore";
import type { TicketPriority } from "../../store/types";

const steps = ["Issue Details", "Review & Submit"];
const priorities: Exclude<TicketPriority, null>[] = ["Critical", "High", "Medium", "Low"];

export function ClientCreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTicket, slas } = useServiceDesk();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    subject: "",
    priority: "Medium" as Exclude<TicketPriority, null>,
    description: "",
    slaId: "",
  });

  const clientProjects = useMemo(
    () => (user ? getClientSLAs(user.company, slas) : []),
    [user, slas],
  );

  const selectedSLA = clientProjects.find((s) => s.id === form.slaId);

  const supportType = useMemo(
    () => (user ? getTicketSupportType(slas, user.company) : "Normal Support"),
    [slas, user],
  );
  const supportExplanation = useMemo(
    () => (user ? supportTypeExplanation(slas, user.company) : ""),
    [slas, user],
  );

  if (!user) return null;

  const projectValid = Boolean(form.slaId && selectedSLA);
  const subjectValid = form.subject.trim().length >= 3;
  const descriptionValid = form.description.trim().length >= 10;
  const canContinue = projectValid && subjectValid && descriptionValid;

  const validationMessage = !projectValid
    ? "Select a project for this ticket."
    : !subjectValid
    ? "Enter a subject with at least 3 characters."
    : !descriptionValid
      ? `Description needs at least 10 characters (${form.description.trim().length}/10).`
      : null;

  const handleContinue = () => {
    if (!canContinue) return;
    setStep(1);
  };

  const handleSubmit = () => {
    if (!selectedSLA) return;
    const id = createTicket({
      project: user.company,
      projectName: selectedSLA.projectName,
      slaId: selectedSLA.id,
      category: "General",
      contactName: user.name,
      supportType,
      subject: form.subject.trim(),
      description: form.description.trim(),
      priority: form.priority,
      resolutionDueDate: null,
      issues: [
        {
          title: form.subject.trim(),
          description: form.description.trim(),
          attachments: [],
        },
      ],
      initialAssignmentEngineerId: null,
      initialAssignmentAt: null,
      createdBy: {
        name: user.name,
        email: user.email,
        initials: user.initials,
        role: "Client Contact",
      },
    });
    navigate(`/client/tickets/${id}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <div className="bg-sidebar border-sidebar-border flex-shrink-0 border-b px-6 py-5">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="outline" size="icon" className="size-8 border-violet-400/25 bg-white" onClick={() => navigate("/client/tickets")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sidebar-foreground text-[20px] font-semibold tracking-tight">Submit Ticket</h1>
            <p className="text-sidebar-muted-foreground mt-0.5 text-[13px]">
              Request support for {user.company}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    i < step ? "bg-emerald-600 text-white" : i === step ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[12px] font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && <div className={`h-px w-10 ${i < step ? "bg-emerald-500" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlignLeft className="size-4" />
                Describe your issue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Created by <span className="font-medium text-foreground">{user.name}</span>
                  {" · "}
                  {user.email}
                  {" · "}
                  {user.company}
                </span>
              </div>
              <div className="rounded-md border px-3 py-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Label className="text-[12px] text-muted-foreground">Support Type</Label>
                  <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                    {supportType}
                  </Badge>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{supportExplanation}</p>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Project <span className="text-red-500">*</span></Label>
                <Select
                  value={form.slaId}
                  onValueChange={(v) => setForm((p) => ({ ...p, slaId: v }))}
                >
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {clientProjects.map((sla) => (
                      <SelectItem key={sla.id} value={sla.id}>{sla.projectName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Subject <span className="text-red-500">*</span></Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief summary of the issue"
                  className="h-9 text-[13px]"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Exclude<TicketPriority, null> }))}
                >
                  <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-[12px]">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Include affected systems, error messages, when it started, and business impact..."
                  rows={8}
                  className="resize-none text-[13px]"
                />
                <p className={`mt-1.5 text-[11px] ${descriptionValid ? "text-muted-foreground" : "text-amber-700"}`}>
                  {form.description.trim().length}/10 characters minimum
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="size-4" />
                Review your request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {[
                { label: "Created By", value: `${user.name} (${user.email})` },
                { label: "Organization", value: user.company },
                { label: "Project", value: selectedSLA?.projectName ?? "—" },
                { label: "Subject", value: form.subject },
                { label: "Priority", value: form.priority },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 border-b py-3 last:border-0">
                  <div className="w-28 shrink-0 text-[12px] text-muted-foreground">{label}</div>
                  <div className="text-[13px] font-medium">{value}</div>
                </div>
              ))}
              <div className="flex gap-4 border-b py-3">
                <div className="w-28 shrink-0 text-[12px] text-muted-foreground">Support Type</div>
                <Badge variant="outline" className={`text-[11px] ${supportTypeBadgeClass[supportType]}`}>
                  {supportType}
                </Badge>
              </div>
              <div className="border-b py-3 last:border-0">
                <div className="mb-1 text-[12px] text-muted-foreground">Description</div>
                <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">{form.description}</div>
              </div>
              <div className="mt-4 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] text-violet-900">
                Your ticket will be assigned to a field engineer by the support team. You&apos;ll receive updates as it progresses.
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t pt-5">
          {step === 0 && validationMessage && !canContinue && (
            <p className="text-[12px] text-amber-700">{validationMessage}</p>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate("/client/tickets"))}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                Continue <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button type="button" className="gap-1.5 bg-violet-600 hover:bg-violet-700" onClick={handleSubmit}>
                <Ticket className="w-3.5 h-3.5" />
                Submit Ticket
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
