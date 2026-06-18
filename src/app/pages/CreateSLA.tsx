import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AlertCircle, ArrowLeft, FileText, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useServiceDesk } from '../store/serviceDeskStore';
import { calcSLAStatus, calcRemainingTime, calcDurationLabel, slaStatusConfig } from './SLAManagement';
import { Badge } from '../components/ui/badge';

const KNOWN_COMPANIES = [
  'EPSS', 'IE Innovation Ethiopia', 'ERA/MOTL', 'MinT', 'ESLSE',
  'MoTI', 'CBE', 'Ethio Telecom',
];

export function CreateSLA() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledCompany = searchParams.get('company') ?? '';
  const { createSLA } = useServiceDesk();

  const [form, setForm] = useState({
    companyName: prefilledCompany,
    projectName: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const statusPreview = form.startDate && form.endDate
    ? calcSLAStatus(form.startDate, form.endDate)
    : null;
  const remainingPreview = form.endDate ? calcRemainingTime(form.endDate) : null;
  const durationPreview = form.startDate && form.endDate
    ? calcDurationLabel(form.startDate, form.endDate)
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!form.companyName.trim()) { setFormError('Company name is required'); return; }
    if (!form.projectName.trim()) { setFormError('Project name is required'); return; }
    if (!form.startDate) { setFormError('Start date is required'); return; }
    if (!form.endDate) { setFormError('End date is required'); return; }
    if (form.endDate < form.startDate) { setFormError('End date must be after start date'); return; }

    setSubmitting(true);
    const id = createSLA({
      companyName: form.companyName.trim(),
      projectName: form.projectName.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      notes: form.notes.trim(),
    });
    setSubmitting(false);
    navigate(`/sla/${id}`);
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate('/sla')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">New SLA</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Create a new Service Level Agreement</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Organisation */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-[14px]">Client Organisation</CardTitle>
                <CardDescription className="text-[12px]">
                  Select an existing client or enter a new company name
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-4">
                <div>
                  <Label className="text-[13px]">Company Name <span className="text-red-500">*</span></Label>
                  <Input
                    list="companies-list"
                    className="mt-1.5 h-9 text-[13px]"
                    placeholder="e.g. EPSS"
                    value={form.companyName}
                    onChange={(e) => set('companyName', e.target.value)}
                  />
                  <datalist id="companies-list">
                    {KNOWN_COMPANIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <Label className="text-[13px]">Project Name <span className="text-red-500">*</span></Label>
                  <Input
                    className="mt-1.5 h-9 text-[13px]"
                    placeholder="e.g. EPSS Enterprise Support"
                    value={form.projectName}
                    onChange={(e) => set('projectName', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SLA Period */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-[14px]">SLA Period</CardTitle>
                <CardDescription className="text-[12px]">
                  Set the start and end dates for this agreement
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[13px]">SLA Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      className="mt-1.5 h-9 text-[13px]"
                      value={form.startDate}
                      onChange={(e) => set('startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-[13px]">SLA End Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      className="mt-1.5 h-9 text-[13px]"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={(e) => set('endDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Live preview */}
                {statusPreview && (
                  <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] text-muted-foreground">Status:</span>
                        <Badge variant="outline" className={`gap-1.5 text-[11px] ${slaStatusConfig[statusPreview].badgeClass}`}>
                          <span className={`size-1.5 rounded-full ${slaStatusConfig[statusPreview].dotClass}`} />
                          {statusPreview}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[12px]">
                        <span><span className="text-muted-foreground">Duration: </span><span className="font-medium">{durationPreview}</span></span>
                        <span><span className="text-muted-foreground">Remaining: </span>
                          <span className={`font-medium ${statusPreview === 'Expired' ? 'text-red-600' : statusPreview === 'Expiring Soon' ? 'text-amber-600' : ''}`}>
                            {remainingPreview}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b px-5 py-4">
                <CardTitle className="text-[14px]">Notes</CardTitle>
                <CardDescription className="text-[12px]">Optional description or terms summary</CardDescription>
              </CardHeader>
              <CardContent className="px-5 py-4">
                <Textarea
                  className="text-[13px]"
                  rows={4}
                  placeholder="Add notes about this SLA, key terms, scope of services..."
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Validation error */}
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="outline" size="sm" className="text-[13px]" type="button" onClick={() => navigate('/sla')}>
                Cancel
              </Button>
              <Button size="sm" className="text-[13px] gap-1.5" type="submit" disabled={submitting}>
                <FileText className="w-3.5 h-3.5" />
                Create SLA
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
