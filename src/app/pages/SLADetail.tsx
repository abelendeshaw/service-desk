import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  FileText,
  AlertTriangle,
  Trash2,
  Building2,
  ChevronRight,
  ShieldCheck,
  FolderKanban,
  Ticket as TicketIcon,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { SLA } from '../store/types';
import {
  calcSLAStatus,
  calcRemainingTime,
  calcDurationLabel,
  calcSupportType,
  slaStatusConfig,
  EXPIRING_THRESHOLD_DAYS,
} from './SLAManagement';

const scrollClass =
  'min-h-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';
const panelClass = 'gap-0 rounded-none border-0 border-b p-0 shadow-none';
const panelHeaderClass = 'px-5 py-4 pb-3';
const panelTitleClass = 'text-[13px] font-semibold';
const panelContentClass = 'px-5 pb-5 pt-0';

const ticketStatusConfig: Record<string, { dot: string; badgeClass: string }> = {
  Open: { dot: 'bg-blue-500', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  'In Progress': { dot: 'bg-violet-500', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' },
  Escalated: { dot: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  Resolved: { dot: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Closed: { dot: 'bg-muted-foreground', badgeClass: 'bg-muted text-muted-foreground border-border' },
};

function initials2(name: string) {
  const parts = name.trim().split(/[\s/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function SLADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { slas, tickets, updateSLA, deleteSLA } = useServiceDesk();

  const sla = slas.find((s) => s.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const companySLAs = useMemo(
    () => (sla ? slas.filter((s) => s.companyName === sla.companyName && s.id !== sla.id) : []),
    [sla, slas],
  );

  const relatedTickets = useMemo(
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

  if (!sla) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/30">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <FileText className="size-10 text-muted-foreground" />
          <p className="text-[14px] font-medium">SLA not found</p>
          <Button size="sm" variant="outline" className="text-[13px]" onClick={() => navigate('/sla')}>
            Back to SLA Management
          </Button>
        </div>
      </div>
    );
  }

  const status = calcSLAStatus(sla.startDate, sla.endDate);
  const remaining = calcRemainingTime(sla.endDate);
  const duration = calcDurationLabel(sla.startDate, sla.endDate);
  const supportType = calcSupportType(status);
  const sc = slaStatusConfig[status];
  const StatusIcon = sc.icon;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(sla.startDate + 'T00:00:00');
  const end = new Date(sla.endDate + 'T00:00:00');
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
  const elapsed = Math.max(0, Math.min(totalDays, Math.round((today.getTime() - start.getTime()) / 86_400_000)));
  const progressPct = Math.round((elapsed / totalDays) * 100);
  const daysRemaining = Math.round((end.getTime() - today.getTime()) / 86_400_000);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/30">
      {/* Top action bar */}
      <div className="flex h-[48px] shrink-0 items-center gap-1 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-[12px]"
          onClick={() => navigate('/sla')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          SLA Management
        </Button>
        <Separator orientation="vertical" className="mx-1 h-4" />
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="px-1 font-mono text-[12px] text-muted-foreground">{sla.id}</span>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-[12px]"
            onClick={() => setEditOpen(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-[12px] text-red-600 hover:text-red-700"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-[12px]"
            onClick={() => navigate(`/projects/${sla.id}`)}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Project View
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Summary header */}
        <div className="shrink-0 border-b bg-background px-6 py-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-violet-600 text-[13px] font-semibold text-white">
                {initials2(sla.projectName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {sla.id}
                </span>
                <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                  <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                  {status}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {supportType}
                </Badge>
              </div>
              <h1 className="text-[16px] font-semibold leading-snug">{sla.projectName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {sla.companyName}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {sla.createdAt.slice(0, 10)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(320px,2fr)_minmax(400px,2.5fr)] overflow-hidden">
          {/* Left — SLA details */}
          <div className={`min-w-0 border-r bg-background ${scrollClass}`}>
            {(status === 'Expiring Soon' || status === 'Expired') && (
              <div
                className={`mx-5 mt-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${
                  status === 'Expired'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div className="text-[13px]">
                  {status === 'Expired'
                    ? `This SLA expired on ${sla.endDate}. ${remaining}`
                    : `This SLA is expiring soon — ${remaining}. Consider initiating a renegotiation.`}
                </div>
              </div>
            )}

            <div className="space-y-0">
              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>SLA Details</CardTitle>
                </CardHeader>
                <CardContent className={panelContentClass}>
                  <div className="relative">
                    {[
                      {
                        icon: Calendar,
                        label: 'Start date',
                        date: sla.startDate,
                        dateOnly: true,
                        urgent: false,
                      },
                      {
                        icon: Calendar,
                        label: 'End date',
                        date: sla.endDate,
                        dateOnly: true,
                        urgent: status === 'Expired' || status === 'Expiring Soon',
                      },
                      {
                        icon: Clock,
                        label: 'Created',
                        date: sla.createdAt,
                        urgent: false,
                      },
                      {
                        icon: Clock,
                        label: 'Last updated',
                        date: sla.updatedAt,
                        urgent: false,
                      },
                    ].map((item, index, items) => {
                      const Icon = item.icon;
                      const parsed = item.date ? new Date(item.date.includes('T') ? item.date : `${item.date}T00:00:00`) : null;
                      const isLast = index === items.length - 1;
                      return (
                        <div key={item.label} className={`relative flex gap-3.5 ${isLast ? '' : 'pb-5'}`}>
                          {!isLast && (
                            <div className="absolute left-[11px] top-7 bottom-0 w-px bg-border" />
                          )}
                          <div
                            className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border bg-background ${
                              item.urgent ? 'border-amber-200 bg-amber-50' : ''
                            }`}
                          >
                            <Icon
                              className={`size-3 ${item.urgent ? 'text-amber-600' : 'text-muted-foreground'}`}
                            />
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="text-[12px] font-medium">{item.label}</div>
                            {parsed && !Number.isNaN(parsed.getTime()) ? (
                              <div className="mt-0.5 text-[13px] text-foreground">
                                {parsed.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            ) : (
                              <div className="mt-0.5 text-[13px] text-muted-foreground">—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] text-muted-foreground">Contract progress</span>
                      <span className="text-[12px] font-medium">{progressPct}% elapsed</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%`, backgroundColor: sc.color }}
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-4 flex items-center gap-3 rounded-lg border px-3.5 py-3 ${
                      status === 'Expired'
                        ? 'border-red-200 bg-red-50'
                        : status === 'Expiring Soon'
                          ? 'border-amber-200 bg-amber-50'
                          : status === 'Upcoming'
                            ? 'border-blue-200 bg-blue-50'
                            : 'border-emerald-200 bg-emerald-50'
                    }`}
                  >
                    <StatusIcon className="size-4 shrink-0" style={{ color: sc.color }} />
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: sc.color }}>
                        {remaining}
                      </div>
                      {daysRemaining > 0 && (
                        <div className="text-[11px] text-muted-foreground">
                          {daysRemaining} calendar days · within {EXPIRING_THRESHOLD_DAYS}-day threshold = Expiring Soon
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Contract Summary</CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 ${panelContentClass}`}>
                  {[
                    { label: 'Total duration', value: duration },
                    { label: 'Total days', value: `${totalDays}d` },
                    { label: 'Days elapsed', value: `${Math.max(0, elapsed)}d` },
                    { label: 'Days remaining', value: daysRemaining > 0 ? `${daysRemaining}d` : '—' },
                    { label: 'Support type', value: supportType },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b py-2.5 last:border-0">
                      <span className="text-[12px] text-muted-foreground">{item.label}</span>
                      <span className="text-[13px] font-medium">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {companySLAs.length > 0 && (
                <Card className={`${panelClass} border-b-0`}>
                  <CardHeader className={panelHeaderClass}>
                    <CardTitle className={panelTitleClass}>
                      Other Projects — {sla.companyName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={`space-y-2 ${panelContentClass}`}>
                    {companySLAs.map((s) => {
                      const st = calcSLAStatus(s.startDate, s.endDate);
                      const cfg = slaStatusConfig[st];
                      return (
                        <div
                          key={s.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                          onClick={() => navigate(`/sla/${s.id}`)}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FolderKanban className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium">{s.projectName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {s.startDate} → {s.endDate}
                            </div>
                          </div>
                          <Badge variant="outline" className={`gap-1 text-[11px] ${cfg.badgeClass}`}>
                            <span className={`size-1.5 rounded-full ${cfg.dotClass}`} />
                            {st}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right — notes & related tickets */}
          <div className={`min-w-0 bg-background ${scrollClass}`}>
            <div className="space-y-0">
              <Card className={panelClass}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={panelTitleClass}>Notes</CardTitle>
                </CardHeader>
                <CardContent className={panelContentClass}>
                  {sla.notes ? (
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                      {sla.notes}
                    </p>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-[13px] text-muted-foreground">
                      No notes for this SLA
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`${panelClass} border-b-0`}>
                <CardHeader className={panelHeaderClass}>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`${panelTitleClass} flex items-center gap-2`}>
                      <TicketIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      Related Tickets
                      <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px]">
                        {relatedTickets.length}
                      </Badge>
                    </CardTitle>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-[11px]"
                      onClick={() => navigate('/tickets/new')}
                    >
                      New Ticket
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={`space-y-2 ${panelContentClass}`}>
                  {relatedTickets.length > 0 ? (
                    relatedTickets.map((ticket) => {
                      const tsc = ticketStatusConfig[ticket.status] ?? ticketStatusConfig.Open;
                      return (
                        <div
                          key={ticket.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-100">
                            <TicketIcon className="w-4 h-4 text-violet-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 font-mono text-[11px] text-muted-foreground">
                              #{ticket.id}
                            </div>
                            <div className="truncate text-[13px] font-medium">{ticket.subject}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline" className={`gap-1 text-[11px] ${tsc.badgeClass}`}>
                            <span className={`size-1.5 rounded-full ${tsc.dot}`} />
                            {ticket.status}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-[13px] text-muted-foreground">
                      No tickets linked to this project yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`${panelClass} border-b-0`}>
                <CardHeader className={panelHeaderClass}>
                  <CardTitle className={`${panelTitleClass} flex items-center gap-2`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    Agreement Info
                  </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 ${panelContentClass}`}>
                  <div className="flex gap-4 border-b py-2.5">
                    <div className="w-28 shrink-0 text-[12px] text-muted-foreground">Company</div>
                    <div className="text-[13px] font-medium">{sla.companyName}</div>
                  </div>
                  <div className="flex gap-4 border-b py-2.5">
                    <div className="w-28 shrink-0 text-[12px] text-muted-foreground">Project</div>
                    <div className="text-[13px] font-medium">{sla.projectName}</div>
                  </div>
                  <div className="flex gap-4 py-2.5">
                    <div className="w-28 shrink-0 text-[12px] text-muted-foreground">SLA ID</div>
                    <div className="font-mono text-[13px]">{sla.id}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <EditDialog
          sla={sla}
          onClose={() => setEditOpen(false)}
          onSave={(data) => {
            updateSLA({ id: sla.id, ...data });
            setEditOpen(false);
          }}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete SLA — {sla.id}?</DialogTitle>
            <DialogDescription>
              This will permanently remove the SLA for <strong>{sla.companyName}</strong> ({sla.projectName}). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-[13px]"
              onClick={() => {
                deleteSLA(sla.id);
                navigate('/sla');
              }}
            >
              Delete SLA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditDialog({
  sla,
  onClose,
  onSave,
}: {
  sla: SLA;
  onClose: () => void;
  onSave: (data: {
    companyName: string;
    projectName: string;
    startDate: string;
    endDate: string;
    notes: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    companyName: sla.companyName,
    projectName: sla.projectName,
    startDate: sla.startDate,
    endDate: sla.endDate,
    notes: sla.notes,
  });

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  const statusPreview =
    form.startDate && form.endDate ? calcSLAStatus(form.startDate, form.endDate) : null;

  function handleSave() {
    if (!form.companyName || !form.projectName || !form.startDate || !form.endDate) {
      toast.error('All required fields must be filled');
      return;
    }
    onSave(form);
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit SLA — {sla.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[13px]">Company Name</Label>
              <Input className="mt-1 h-8 text-[13px]" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">Project Name</Label>
              <Input className="mt-1 h-8 text-[13px]" value={form.projectName} onChange={(e) => set('projectName', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">Start Date</Label>
              <Input type="date" className="mt-1 h-8 text-[13px]" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            </div>
            <div>
              <Label className="text-[13px]">End Date</Label>
              <Input type="date" className="mt-1 h-8 text-[13px]" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-[13px]">Notes</Label>
            <Textarea className="mt-1 text-[13px]" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          {statusPreview && (
            <div className="rounded bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
              Status preview: <span className="font-medium text-foreground">{statusPreview}</span>
              {' · '}
              {calcRemainingTime(form.endDate)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px]" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="text-[13px]" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
