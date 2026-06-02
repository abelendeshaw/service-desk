import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Calendar, Clock, Edit2, FileText,
  AlertTriangle, CheckCircle2, XCircle, Trash2, Building2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useServiceDesk } from '../store/serviceDeskStore';
import {
  calcSLAStatus, calcRemainingTime, calcDurationLabel,
  slaStatusConfig, EXPIRING_THRESHOLD_DAYS,
} from './SLAManagement';

function initials2(name: string) {
  const parts = name.trim().split(/[\s/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const avatarColors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#1d4ed8', '#dc2626', '#6366f1', '#0f766e'];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function SLADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { slas, updateSLA, deleteSLA } = useServiceDesk();

  const sla = slas.find((s) => s.id === id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!sla) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <FileText className="w-10 h-10 text-muted-foreground" />
        <div className="text-[14px] font-medium">SLA not found</div>
        <Button size="sm" variant="outline" className="text-[13px]" onClick={() => navigate('/sla')}>
          Back to SLA Management
        </Button>
      </div>
    );
  }

  const status = calcSLAStatus(sla.startDate, sla.endDate);
  const remaining = calcRemainingTime(sla.endDate);
  const duration = calcDurationLabel(sla.startDate, sla.endDate);
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

  // All SLAs for same company (context)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const companySLAs = slas.filter((s) => s.companyName === sla.companyName && s.id !== sla.id);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate('/sla')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="size-10 rounded-lg">
              <AvatarFallback
                className="rounded-lg text-[12px] font-bold text-white"
                style={{ backgroundColor: avatarColor(sla.companyName) }}
              >
                {initials2(sla.companyName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[18px] font-semibold">{sla.companyName}</h1>
                <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status}
                </Badge>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{sla.id}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{sla.projectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => setEditOpen(true)}>
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[13px] text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          {/* Alert banner */}
          {(status === 'Expiring Soon' || status === 'Expired') && (
            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
              status === 'Expired'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <div className="text-[13px]">
                {status === 'Expired'
                  ? `This SLA expired on ${sla.endDate}. ${remaining}`
                  : `This SLA is expiring soon — ${remaining}. Consider initiating a renegotiation.`}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-5">
            {/* Left: main detail */}
            <div className="col-span-2 space-y-4">
              {/* Duration + Progress */}
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-[14px]">SLA Period</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-lg border bg-muted/30 px-3 py-3">
                      <div className="text-[11px] text-muted-foreground mb-1">Start Date</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[14px] font-semibold">{sla.startDate}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 px-3 py-3">
                      <div className="text-[11px] text-muted-foreground mb-1">End Date</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Calendar className={`w-3.5 h-3.5 ${status === 'Expired' ? 'text-red-500' : status === 'Expiring Soon' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        <span className={`text-[14px] font-semibold ${status === 'Expired' ? 'text-red-600' : status === 'Expiring Soon' ? 'text-amber-600' : ''}`}>
                          {sla.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 px-3 py-3">
                      <div className="text-[11px] text-muted-foreground mb-1">Total Duration</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[14px] font-semibold">{duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-muted-foreground">Progress</span>
                      <span className="text-[12px] font-medium">{progressPct}% elapsed</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPct}%`, backgroundColor: sc.color }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                      <span>{sla.startDate}</span>
                      <span>{sla.endDate}</span>
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
                    status === 'Expired' ? 'bg-red-50 border-red-200'
                    : status === 'Expiring Soon' ? 'bg-amber-50 border-amber-200'
                    : status === 'Upcoming' ? 'bg-blue-50 border-blue-200'
                    : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: sc.color }} />
                    <div>
                      <div className="text-[13px] font-semibold" style={{ color: sc.color }}>{remaining}</div>
                      {daysRemaining > 0 && (
                        <div className="text-[12px] text-muted-foreground">{daysRemaining} calendar days · within {EXPIRING_THRESHOLD_DAYS}-day threshold = Expiring Soon</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {sla.notes && (
                <Card className="gap-0 p-0">
                  <CardHeader className="border-b px-5 py-4">
                    <CardTitle className="text-[14px]">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-4">
                    <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{sla.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Other SLAs for same company */}
              {companySLAs.length > 0 && (
                <Card className="gap-0 p-0">
                  <CardHeader className="border-b px-5 py-4">
                    <CardTitle className="text-[14px]">Other SLAs — {sla.companyName}</CardTitle>
                    <CardDescription className="text-[12px]">{companySLAs.length} other agreement{companySLAs.length !== 1 ? 's' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 divide-y">
                    {companySLAs.map((s) => {
                      const st = calcSLAStatus(s.startDate, s.endDate);
                      const cfg = slaStatusConfig[st];
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => navigate(`/sla/${s.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium">{s.projectName}</div>
                            <div className="text-[12px] text-muted-foreground">{s.startDate} → {s.endDate}</div>
                          </div>
                          <Badge variant="outline" className={`gap-1.5 text-[11px] ${cfg.badgeClass}`}>
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

            {/* Right: sidebar */}
            <div className="space-y-4">
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-[14px]">Details</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3.5">
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Company</div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-medium">{sla.companyName}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Project</div>
                    <span className="text-[13px]">{sla.projectName}</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</div>
                    <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">SLA ID</div>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-muted-foreground">{sla.id}</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Created</div>
                    <span className="text-[12px] text-muted-foreground">{sla.createdAt.slice(0, 10)}</span>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Last Updated</div>
                    <span className="text-[12px] text-muted-foreground">{sla.updatedAt.slice(0, 10)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <Card className="gap-0 p-0">
                <CardHeader className="border-b px-5 py-4">
                  <CardTitle className="text-[14px]">Duration Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3">
                  {[
                    { label: 'Total days', value: `${totalDays}d` },
                    { label: 'Days elapsed', value: `${Math.max(0, elapsed)}d` },
                    { label: 'Days remaining', value: daysRemaining > 0 ? `${daysRemaining}d` : '—' },
                    { label: 'Progress', value: `${progressPct}%` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-[12px] text-muted-foreground">{item.label}</span>
                      <span className="text-[13px] font-medium">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editOpen && (
        <EditDialog
          sla={sla}
          onClose={() => setEditOpen(false)}
          onSave={(data) => { updateSLA({ id: sla.id, ...data }); setEditOpen(false); }}
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete SLA — {sla.id}?</DialogTitle>
            <DialogDescription>
              This will permanently remove the SLA for <strong>{sla.companyName}</strong> ({sla.projectName}). This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" className="text-[13px]" onClick={() => { deleteSLA(sla.id); navigate('/sla'); }}>
              Delete SLA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline edit dialog
// ---------------------------------------------------------------------------

import type { SLA } from '../store/types';

function EditDialog({ sla, onClose, onSave }: {
  sla: SLA;
  onClose: () => void;
  onSave: (data: { companyName: string; projectName: string; startDate: string; endDate: string; notes: string }) => void;
}) {
  const [form, setForm] = useState({
    companyName: sla.companyName,
    projectName: sla.projectName,
    startDate: sla.startDate,
    endDate: sla.endDate,
    notes: sla.notes,
  });

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  const statusPreview = form.startDate && form.endDate ? calcSLAStatus(form.startDate, form.endDate) : null;

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
              {' · '}{calcRemainingTime(form.endDate)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px]" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-[13px]" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
