import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Mail,
  Users,
  ChevronRight,
  Info,
  Bold,
  Italic,
  Link,
  List,
  Paperclip,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { useServiceDesk } from '../store/serviceDeskStore';
import { hasClientContact } from '../lib/clientsData';
import type { TicketPriority } from '../store/types';

const steps = ['Compose', 'Routing', 'Review'];

const fallbackRecipients = [
  { name: 'EPSS Client', email: 'epss@gmail.com', initials: 'EP', color: '#7c3aed' },
  { name: 'IE Client', email: 'ie@gmail.com', initials: 'IE', color: '#7c3aed' },
  { name: 'MinT Client', email: 'mint@gmail.com', initials: 'MI', color: '#7c3aed' },
  { name: 'MoTI Client', email: 'moti@gmail.com', initials: 'MT', color: '#7c3aed' },
  { name: 'ERA/MOTL Client', email: 'eramotl@gmail.com', initials: 'ER', color: '#7c3aed' },
];

const teams = ['END Team', 'ICT Field Team', 'CSD Team', 'NOC Team'];
const priorities: Exclude<TicketPriority, null>[] = ['Critical', 'High', 'Medium', 'Low'];
const FIELD_ENGINEER_AUTO = '__auto__';

const priorityBadgeClass: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function CreateEmailSupport() {
  const navigate = useNavigate();
  const { clients, engineers } = useServiceDesk();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    to: '',
    cc: '',
    subject: '',
    body: '',
    priority: 'Medium' as Exclude<TicketPriority, null>,
    fieldEngineer: FIELD_ENGINEER_AUTO,
    team: '',
  });
  const [attachments, setAttachments] = useState<string[]>([]);

  const recipients = useMemo(() => {
    const fromStore = clients
      .filter((c) => hasClientContact(c) && c.email)
      .map((c) => ({
        name: c.name || c.company,
        email: c.email,
        initials: c.initials,
        color: c.color,
      }));
    if (fromStore.length > 0) return fromStore;
    return fallbackRecipients;
  }, [clients]);

  const selectedRecipient = recipients.find((c) => c.email === form.to);

  const checklist = [
    { label: 'Recipient selected', done: !!form.to },
    { label: 'Subject added', done: !!form.subject.trim() },
    { label: 'Message body written', done: form.body.trim().length > 20 },
    { label: 'Priority set', done: !!form.priority },
    { label: 'Team assigned', done: !!form.team },
  ];

  const canContinueStep0 = form.to && form.subject.trim() && form.body.trim().length > 10;
  const canContinueStep1 = !!form.team;

  const fieldEngineerLabel =
    form.fieldEngineer === FIELD_ENGINEER_AUTO ? 'Auto-assign' : form.fieldEngineer;

  const handleSend = () => {
    toast.success('Email sent to client');
    navigate('/tickets?tab=email');
  };

  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <div className="border-sidebar-border flex-shrink-0 border-b bg-sidebar px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-8 border-violet-400/25 bg-white"
            onClick={() => navigate('/tickets?tab=email')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sidebar-foreground text-[20px] font-semibold tracking-tight">
              Compose Email
            </h1>
            <p className="text-sidebar-muted-foreground mt-0.5 text-[13px]">
              Send a support message to a client
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                      i < step
                        ? 'bg-emerald-600 text-white'
                        : i === step
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-[12px] font-medium ${
                      i === step ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-12 ${i < step ? 'bg-emerald-500' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="flex flex-col gap-4 lg:col-span-3">
              {step === 0 && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="size-4 text-primary" />
                        Recipients
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="mb-1.5 text-[12px]">
                          To <span className="text-red-500">*</span>
                        </Label>
                        <Select value={form.to} onValueChange={(v) => setForm((p) => ({ ...p, to: v }))}>
                          <SelectTrigger className="h-9 text-[13px]">
                            <SelectValue placeholder="Select client recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipients.map((c) => (
                              <SelectItem key={c.email} value={c.email}>
                                {c.name} — {c.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRecipient && (
                          <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                            <Avatar className="size-7">
                              <AvatarFallback
                                className="text-[10px] font-semibold text-white"
                                style={{ backgroundColor: selectedRecipient.color }}
                              >
                                {selectedRecipient.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-[12px] font-medium">{selectedRecipient.name}</div>
                              <div className="text-[11px] text-muted-foreground">{selectedRecipient.email}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="mb-1.5 text-[12px]">
                          CC <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          value={form.cc}
                          onChange={(e) => setForm((p) => ({ ...p, cc: e.target.value }))}
                          placeholder="cc@company.com"
                          className="h-9 text-[13px]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="size-4 text-primary" />
                        Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="mb-1.5 text-[12px]">
                          Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={form.subject}
                          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                          placeholder="Brief description of the issue or request"
                          className="h-9 text-[13px]"
                        />
                      </div>
                      <div>
                        <Label className="mb-1.5 text-[12px]">Priority</Label>
                        <div className="flex items-center gap-2">
                          {priorities.map((p) => (
                            <Button
                              key={p}
                              type="button"
                              variant={form.priority === p ? 'default' : 'outline'}
                              size="sm"
                              className={`h-8 flex-1 text-[12px] ${
                                form.priority === p ? '' : 'text-muted-foreground'
                              }`}
                              onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                            >
                              {p}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1.5 text-[12px]">
                          Body <span className="text-red-500">*</span>
                        </Label>
                        <div className="overflow-hidden rounded-md border">
                          <div className="flex items-center gap-0.5 border-b bg-muted/50 px-2 py-1.5">
                            {[Bold, Italic, Link, List].map((Icon, idx) => (
                              <Button
                                key={idx}
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground"
                              >
                                <Icon className="size-3.5" />
                              </Button>
                            ))}
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                              onClick={() =>
                                setAttachments((prev) => [...prev, `attachment-${prev.length + 1}.pdf`])
                              }
                            >
                              <Paperclip className="size-3" />
                              Attach
                            </Button>
                          </div>
                          <Textarea
                            value={form.body}
                            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                            placeholder="Write your message here. Include relevant details such as error messages, affected systems, and urgency level..."
                            rows={8}
                            className="resize-none rounded-none border-0 text-[13px] focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((att, i) => (
                            <div
                              key={att}
                              className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1.5"
                            >
                              <Paperclip className="size-3 text-muted-foreground" />
                              <span className="text-[12px]">{att}</span>
                              <button
                                type="button"
                                onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                              >
                                <X className="size-3 text-muted-foreground hover:text-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {step === 1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="size-4 text-primary" />
                      Routing & Assignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="mb-1.5 text-[12px]">
                        Assign Team <span className="text-red-500">*</span>
                      </Label>
                      <Select value={form.team} onValueChange={(v) => setForm((p) => ({ ...p, team: v }))}>
                        <SelectTrigger className="h-9 text-[13px]">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1.5 text-[12px]">
                        Assign Field Engineer{' '}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <Select
                        value={form.fieldEngineer}
                        onValueChange={(v) => setForm((p) => ({ ...p, fieldEngineer: v }))}
                      >
                        <SelectTrigger className="h-9 text-[13px]">
                          <SelectValue placeholder="Auto-assign based on availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FIELD_ENGINEER_AUTO}>
                            Auto-assign based on availability
                          </SelectItem>
                          {engineers.map((e) => (
                            <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="rounded-md border bg-muted/40 p-3">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Routing Preview
                      </div>
                      <div className="space-y-1 text-[12px]">
                        {[
                          { label: 'To', value: form.to || '—' },
                          { label: 'Team', value: form.team || 'Not assigned' },
                          { label: 'Field Engineer', value: fieldEngineerLabel },
                          { label: 'Priority', value: form.priority },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex gap-2">
                            <span className="w-24 text-muted-foreground">{label}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Review & Send</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-md border">
                      <div className="border-b bg-muted/40 px-4 py-3">
                        <div className="space-y-1 text-[12px]">
                          <div className="flex gap-2">
                            <span className="w-14 text-muted-foreground">From:</span>
                            <span className="font-medium">support@ienetworks.co</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="w-14 text-muted-foreground">To:</span>
                            <span className="font-medium">{form.to || '—'}</span>
                          </div>
                          {form.cc && (
                            <div className="flex gap-2">
                              <span className="w-14 text-muted-foreground">CC:</span>
                              <span className="font-medium">{form.cc}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <span className="w-14 text-muted-foreground">Subject:</span>
                            <span className="font-medium">{form.subject || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        {form.body ? (
                          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-muted-foreground">
                            {form.body}
                          </pre>
                        ) : (
                          <p className="text-[13px] italic text-muted-foreground">No message body</p>
                        )}
                      </div>
                    </div>

                    <div className="divide-y rounded-md border">
                      {[
                        { label: 'Team', value: form.team || '—' },
                        { label: 'Field Engineer', value: fieldEngineerLabel },
                        { label: 'Priority', value: form.priority },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-4 px-4 py-2.5">
                          <div className="w-28 shrink-0 text-[12px] text-muted-foreground">{label}</div>
                          <div className="text-[13px] font-medium">{value}</div>
                        </div>
                      ))}
                    </div>

                    <Alert className="border-primary/20 bg-primary/5">
                      <AlertCircle className="size-4 text-primary" />
                      <AlertTitle className="text-[13px] text-foreground">Ready to send</AlertTitle>
                      <AlertDescription className="text-[12px]">
                        This email will be sent from{' '}
                        <span className="font-medium">support@ienetworks.co</span> and logged in Email
                        Support.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Alert className="border-violet-200 bg-violet-50 dark:border-violet-400/25 dark:bg-violet-500/10">
                <Info className="size-4 text-primary" />
                <AlertTitle className="text-[13px] text-foreground">Email guidelines</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 space-y-1 text-[12px] leading-relaxed">
                    <li>Use clear, professional subject lines</li>
                    <li>Reference ticket IDs when applicable</li>
                    <li>Set appropriate priority levels</li>
                    <li>Assign to the correct team</li>
                    <li>All emails are tracked and logged</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {checklist.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          done ? 'border-emerald-600 bg-emerald-600' : 'border-muted-foreground/30'
                        }`}
                      >
                        {done && <CheckCircle2 className="size-2.5 text-white" />}
                      </div>
                      <span className={`text-[12px] ${done ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {form.subject && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-[13px] font-medium leading-snug">{form.subject}</div>
                    {selectedRecipient && (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarFallback
                            className="text-[9px] font-semibold text-white"
                            style={{ backgroundColor: selectedRecipient.color }}
                          >
                            {selectedRecipient.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[12px] text-muted-foreground">{selectedRecipient.name}</span>
                      </div>
                    )}
                    {form.priority && (
                      <Badge variant="outline" className={`text-[11px] ${priorityBadgeClass[form.priority]}`}>
                        {form.priority}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <Button
              variant="outline"
              onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate('/tickets?tab=email'))}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < steps.length - 1 ? (
              <Button
                className="gap-1.5"
                disabled={step === 0 ? !canContinueStep0 : !canContinueStep1}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <ChevronRight className="size-3.5" />
              </Button>
            ) : (
              <Button className="gap-1.5" onClick={handleSend}>
                <Send className="size-3.5" />
                Send Email
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
