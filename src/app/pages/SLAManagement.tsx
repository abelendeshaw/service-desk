import React, { useRef, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Plus, Search, Upload, AlertTriangle,
  CheckCircle2, Clock, XCircle, Download,
  Filter, ArrowUpDown, Calendar, FileUp,
  Mail, Inbox, Star, StarOff, RefreshCw, Tag, Paperclip, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RowActionsMenu } from '../components/RowActionsMenu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { useServiceDesk } from '../store/serviceDeskStore';
import type { SLA, SLAStatus } from '../store/types';

// ---------------------------------------------------------------------------
// SLA helpers (shared with CreateSLA and SLADetail)
// ---------------------------------------------------------------------------

export const EXPIRING_THRESHOLD_DAYS = 30;

export function calcSLAStatus(startDate: string, endDate: string): SLAStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  if (today < start) return 'Upcoming';
  if (today > end) return 'Expired';
  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  if (diffDays <= EXPIRING_THRESHOLD_DAYS) return 'Expiring Soon';
  return 'Active';
}

export function calcRemainingTime(endDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + 'T00:00:00');
  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return `Expired ${abs} day${abs !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  const years = Math.floor(diffDays / 365);
  const afterYears = diffDays - years * 365;
  const months = Math.floor(afterYears / 30);
  const days = afterYears - months * 30;
  if (years >= 1) return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} remaining`;
  return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} remaining`;
}

export function calcDurationLabel(startDate: string, endDate: string): string {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (diffDays < 0) return '—';
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  if (years >= 1) return `${years}yr ${months}mo`;
  if (months >= 1) return `${months}mo ${days}d`;
  return `${days}d`;
}

export function calcSupportType(status: SLAStatus): string {
  return status === 'Expired' ? 'CSAT' : 'Normal Support';
}

// ---------------------------------------------------------------------------
// Status & support-type config
// ---------------------------------------------------------------------------

export const slaStatusConfig: Record<SLAStatus, { badgeClass: string; dotClass: string; icon: React.ElementType; color: string }> = {
  Active:         { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotClass: 'bg-emerald-500', icon: CheckCircle2, color: '#059669' },
  'Expiring Soon':{ badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',   dotClass: 'bg-amber-500',   icon: AlertTriangle, color: '#d97706' },
  Expired:        { badgeClass: 'bg-red-50 text-red-700 border-red-200',         dotClass: 'bg-red-500',     icon: XCircle,       color: '#dc2626' },
  Upcoming:       { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',      dotClass: 'bg-blue-500',    icon: Clock,         color: '#2563eb' },
};

const supportTypeConfig: Record<string, { badgeClass: string; dotClass: string }> = {
  'CSAT':           { badgeClass: 'bg-red-50 text-red-700 border-red-200',   dotClass: 'bg-red-400' },
  'Normal Support': { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', dotClass: 'bg-blue-400' },
};

const avatarColors = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#1d4ed8', '#dc2626', '#6366f1', '#0f766e'];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function initials2(name: string) {
  const parts = name.trim().split(/[\s/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Excel (SpreadsheetML) export — includes Support Type column
// ---------------------------------------------------------------------------

function xmlEscape(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportSLAsToExcel(slas: SLA[]) {
  const headers = ['SLA ID', 'Company', 'Project', 'Start Date', 'End Date', 'Duration', 'Remaining Time', 'Status', 'Support Type', 'Notes'];
  const rows = slas.map((s) => {
    const status = calcSLAStatus(s.startDate, s.endDate);
    return [
      s.id, s.companyName, s.projectName, s.startDate, s.endDate,
      calcDurationLabel(s.startDate, s.endDate),
      calcRemainingTime(s.endDate),
      status,
      calcSupportType(status),
      s.notes,
    ];
  });
  const makeCell = (v: string, bold = false) => {
    const style = bold ? ' ss:StyleID="header"' : '';
    return `<Cell${style}><Data ss:Type="String">${xmlEscape(v)}</Data></Cell>`;
  };
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
  </Styles>
  <Worksheet ss:Name="SLA Directory">
    <Table>
      <Row>${headers.map((h) => makeCell(h, true)).join('')}</Row>
      ${rows.map((r) => `<Row>${r.map((c) => makeCell(c)).join('')}</Row>`).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sla-directory-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// File parsing helpers
// ---------------------------------------------------------------------------

type ParsedRow = { companyName: string; projectName: string; startDate: string; endDate: string };

/** Normalise a raw 2-D array of strings into ParsedRow[].
 *  Handles both:
 *   - Our own export: SLA ID | Company | Project | Start Date | End Date | …
 *   - Simple import:  No | Client | Project | Start Date | End Date
 */
function normaliseRows(grid: string[][]): { rows: ParsedRow[]; error: string } {
  if (grid.length === 0) return { rows: [], error: 'File appears to be empty.' };

  // Detect and skip header row
  const firstRow = grid[0].map((c) => c.toLowerCase().trim());
  const isHeader =
    firstRow.some((c) => c === 'company' || c === 'client' || c === 'sla id' || c === 'no');
  const dataRows = isHeader ? grid.slice(1) : grid;

  // Detect column mapping from header
  let companyIdx = 1, projectIdx = 2, startIdx = 3, endIdx = 4;
  if (isHeader) {
    firstRow.forEach((h, i) => {
      if (h === 'company' || h === 'client') companyIdx = i;
      else if (h === 'project') projectIdx = i;
      else if (h.includes('start')) startIdx = i;
      else if (h.includes('end')) endIdx = i;
    });
  } else {
    // No header — check if col[0] looks like a row number
    const startsWithNo = dataRows.every((r) => !isNaN(Number(r[0]?.trim())));
    if (!startsWithNo) { companyIdx = 0; projectIdx = 1; startIdx = 2; endIdx = 3; }
  }

  const rows: ParsedRow[] = [];
  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const companyName = r[companyIdx]?.trim() ?? '';
    const projectName = r[projectIdx]?.trim() ?? '';
    const startDate   = r[startIdx]?.trim()   ?? '';
    const endDate     = r[endIdx]?.trim()     ?? '';
    if (!companyName && !projectName) continue; // skip blank rows
    if (!companyName || !projectName || !startDate || !endDate) {
      return { rows: [], error: `Row ${i + (isHeader ? 2 : 1)}: missing Company, Project, Start Date, or End Date.` };
    }
    rows.push({ companyName, projectName, startDate, endDate });
  }
  if (rows.length === 0) return { rows: [], error: 'No data rows found in the file.' };
  return { rows, error: '' };
}

/** Parse delimited text (CSV or TSV). */
function parseDelimited(text: string): string[][] {
  return text.trim().split('\n').filter(Boolean).map((line) =>
    line.split(/\t|,/).map((c) => c.trim().replace(/^"|"$/g, '')),
  );
}

/** Parse SpreadsheetML XML (.xls produced by our own export). */
function parseSpreadsheetML(xmlText: string): string[][] | null {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return null;
    const grid: string[][] = [];
    doc.querySelectorAll('Row').forEach((row) => {
      const cells: string[] = [];
      row.querySelectorAll('Cell').forEach((cell) => {
        cells.push(cell.querySelector('Data')?.textContent?.trim() ?? '');
      });
      grid.push(cells);
    });
    return grid;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Import dialog — file upload + paste, preview in Directory table format
// ---------------------------------------------------------------------------

function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { importSLAs } = useServiceDesk();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<'file' | 'paste'>('file');
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [raw, setRaw] = useState('');
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [error, setError] = useState('');

  function reset() { setFileName(''); setRaw(''); setPreview([]); setError(''); }

  function applyGrid(grid: string[][]): void {
    const { rows, error } = normaliseRows(grid);
    if (error) { setError(error); setPreview([]); }
    else { setPreview(rows); setError(''); }
  }

  function handleFile(file: File) {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'tsv', 'txt', 'xls'].includes(ext ?? '')) {
      setError('Unsupported file type. Please upload a .csv, .tsv, or .xls file.');
      return;
    }
    setFileName(file.name);
    setError('');
    setPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const grid = ext === 'xls' ? (parseSpreadsheetML(text) ?? parseDelimited(text)) : parseDelimited(text);
      applyGrid(grid);
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handlePastePreview() {
    applyGrid(parseDelimited(raw));
  }

  function handleImport() {
    if (preview.length === 0) return;
    importSLAs(preview);
    reset();
    onClose();
  }

  function handleClose() { reset(); onClose(); }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Import SLAs</DialogTitle>
          <DialogDescription>
            Upload a file or paste rows. Expected columns:
            <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[12px]">
              No | Client | Project | Start Date | End Date
            </code>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Tab switcher */}
          <div className="flex rounded-lg border bg-muted/40 p-0.5 gap-0.5 w-fit">
            {(['file', 'paste'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'file' ? 'File Upload' : 'Paste Rows'}
              </button>
            ))}
          </div>

          {/* ── File upload ── */}
          {tab === 'file' && (
            <div className="space-y-3">
              <div
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
                  dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.tsv,.txt,.xls"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
                />
                <FileUp className={`w-9 h-9 mb-3 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
                {fileName ? (
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium text-foreground">{fileName}</p>
                    <p className="text-[12px] text-muted-foreground">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[13px] font-medium">Click to upload or drag & drop</p>
                    <p className="text-[12px] text-muted-foreground">Supports .csv, .tsv, .txt, .xls (exported from this app)</p>
                  </div>
                )}
              </div>

              <div className="rounded border bg-muted/50 px-3 py-2.5 text-[12px] text-muted-foreground">
                <span className="font-medium text-foreground">Accepted formats: </span>
                CSV (comma or tab-separated), and .xls files exported from SLA Management.
                <span className="ml-1 text-amber-600">XLSX is not supported — export from Excel as CSV first.</span>
              </div>
            </div>
          )}

          {/* ── Paste ── */}
          {tab === 'paste' && (
            <div className="space-y-3">
              <div className="rounded border bg-muted/50 p-3 text-[12px] text-muted-foreground font-mono">
                <div className="font-semibold text-foreground mb-1 font-sans">Example (tab-separated or CSV):</div>
                <div>1{'\t'}EPSS{'\t'}EPSS Enterprise Support{'\t'}2026-01-01{'\t'}2026-12-31</div>
                <div>2{'\t'}CBE{'\t'}CBE Branch Rollout{'\t'}2026-06-01{'\t'}2027-05-31</div>
              </div>
              <div>
                <Label className="text-[13px]">Paste rows here</Label>
                <Textarea
                  placeholder="Paste Excel rows here..."
                  className="mt-1.5 h-32 font-mono text-[12px]"
                  value={raw}
                  onChange={(e) => { setRaw(e.target.value); setPreview([]); setError(''); }}
                />
              </div>
              <Button variant="outline" size="sm" className="text-[13px]" onClick={handlePastePreview}>
                Preview import
              </Button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── Preview in Directory table format ── */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium">{preview.length} row{preview.length !== 1 ? 's' : ''} ready to import</p>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                  Preview
                </Badge>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[80px]">ID</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Start Date</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">End Date</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((r, i) => {
                      const status = calcSLAStatus(r.startDate, r.endDate);
                      const sc = slaStatusConfig[status];
                      const supportType = calcSupportType(status);
                      const stc = supportTypeConfig[supportType];
                      const isExpired = status === 'Expired';
                      const isExpiring = status === 'Expiring Soon';
                      return (
                        <TableRow key={i}>
                          <TableCell className="px-3 py-2.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Auto</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6 rounded-md">
                                <AvatarFallback className="rounded-md text-[9px] font-bold text-white" style={{ backgroundColor: avatarColor(r.companyName) }}>
                                  {initials2(r.companyName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[12px] font-medium">{r.companyName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className="text-[12px]">{r.projectName}</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {r.startDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <div className={`flex items-center gap-1 text-[12px] ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              {r.endDate}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className="text-[12px] text-muted-foreground">{calcDurationLabel(r.startDate, r.endDate)}</span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <span className={`text-[12px] font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              {calcRemainingTime(r.endDate)}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${sc.dotClass}`} />
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-2.5">
                            <Badge variant="outline" className={`gap-1 text-[11px] ${stc.badgeClass}`}>
                              <span className={`size-1.5 rounded-full ${stc.dotClass}`} />
                              {supportType}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-2">
          <Button variant="outline" size="sm" className="text-[13px]" onClick={handleClose}>Cancel</Button>
          <Button size="sm" className="text-[13px] gap-1.5" onClick={handleImport} disabled={preview.length === 0}>
            <Upload className="w-3.5 h-3.5" />
            Import {preview.length > 0 ? `${preview.length} SLA${preview.length !== 1 ? 's' : ''}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit dialog (inline edit)
// ---------------------------------------------------------------------------

function EditSLADialog({ sla, onClose }: { sla: SLA; onClose: () => void }) {
  const { updateSLA } = useServiceDesk();
  const [form, setForm] = useState({
    companyName: sla.companyName,
    projectName: sla.projectName,
    startDate: sla.startDate,
    endDate: sla.endDate,
    notes: sla.notes,
  });
  const [formError, setFormError] = useState('');

  function set(field: string, value: string) {
    setFormError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (!form.companyName || !form.projectName || !form.startDate || !form.endDate) {
      setFormError('All fields are required');
      return;
    }
    updateSLA({ id: sla.id, ...form });
    onClose();
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
          {form.startDate && form.endDate && (
            <div className="rounded bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
              Status preview:{' '}
              <span className="font-medium text-foreground">{calcSLAStatus(form.startDate, form.endDate)}</span>
              {' · '}{calcRemainingTime(form.endDate)}
            </div>
          )}
        </div>
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-[13px]" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-[13px]" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Email Support tab (embedded inside SLA Management)
// ---------------------------------------------------------------------------

const emailData = [
  {
    id: 'EM-001', from: 'EPSS Client', fromEmail: 'epss@gmail.com', initials: 'EP', color: '#7c3aed',
    subject: 'Urgent: FortiGate firewall dropping VPN sessions intermittently',
    preview: 'We are experiencing frequent VPN session drops on our FortiGate firewall at the Addis Ababa data center. This is affecting...',
    date: '10:32 AM', status: 'Open', priority: 'Critical', unread: true, starred: false, attachments: 1, tag: 'Network', agent: 'WW',
  },
  {
    id: 'EM-002', from: 'IE Client', fromEmail: 'ie@gmail.com', initials: 'IE', color: '#0891b2',
    subject: 'Request: New user account creation for 3 staff members',
    preview: 'Good morning, we need to create new Active Directory accounts for 3 new staff joining next Monday. Please find the details attached.',
    date: 'Yesterday', status: 'Pending', priority: 'Low', unread: false, starred: true, attachments: 0, tag: 'Access', agent: 'SS',
  },
  {
    id: 'EM-003', from: 'MinT Client', fromEmail: 'mint@gmail.com', initials: 'MI', color: '#6b7280',
    subject: 'Follow-up on network latency issue reported last week',
    preview: 'We wanted to follow up on the network latency issue we reported last week. The problem persists during peak hours between 9AM and 12PM.',
    date: 'Yesterday', status: 'Open', priority: 'High', unread: false, starred: false, attachments: 2, tag: 'Network', agent: 'DB',
  },
  {
    id: 'EM-004', from: 'CSA Client', fromEmail: 'csa@gmail.com', initials: 'CS', color: '#0891b2',
    subject: 'Monthly report request — Q1 2026 system uptime and incident summary',
    preview: 'Please provide the monthly uptime and incident report for Q1 2026. The management team needs this by end of week for their review.',
    date: 'Apr 12', status: 'Closed', priority: 'Medium', unread: false, starred: false, attachments: 0, tag: 'Reporting', agent: 'AT',
  },
  {
    id: 'EM-005', from: 'ERA/MOTL Client', fromEmail: 'eramotl@gmail.com', initials: 'ER', color: '#059669',
    subject: 'Infrastructure upgrade proposal — need technical review',
    preview: 'We are planning to upgrade our server infrastructure and would like a technical review of our proposed setup before proceeding.',
    date: 'Apr 11', status: 'Open', priority: 'Medium', unread: true, starred: false, attachments: 3, tag: 'Infrastructure', agent: null,
  },
  {
    id: 'EM-006', from: 'MoWS Client', fromEmail: 'mows@gmail.com', initials: 'MW', color: '#d97706',
    subject: 'CSAT Survey Response — Technical Support Feedback',
    preview: 'Thank you for the recent support engagement. We have completed the CSAT survey and wanted to share our feedback directly as well.',
    date: 'Apr 10', status: 'Closed', priority: 'Low', unread: false, starred: false, attachments: 0, tag: 'CSAT', agent: 'WW',
  },
  {
    id: 'EM-007', from: 'Abay Bank Client', fromEmail: 'abaybank@gmail.com', initials: 'AB', color: '#dc2626',
    subject: 'Critical: Core banking system cannot connect to backup server',
    preview: 'URGENT — Our core banking application is failing to connect to the backup server since this morning. Transactions are being affected.',
    date: 'Apr 9', status: 'Closed', priority: 'Critical', unread: false, starred: true, attachments: 1, tag: 'Critical', agent: 'SS',
  },
];

const emailPriorityConfig: Record<string, { badgeClass: string }> = {
  Critical: { badgeClass: 'bg-red-50 text-red-700 border-red-200' },
  High:     { badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  Medium:   { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  Low:      { badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const emailStatusCfg: Record<string, { badgeClass: string; dotClass: string }> = {
  Open:    { badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',      dotClass: 'bg-blue-500' },
  Pending: { badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',   dotClass: 'bg-amber-500' },
  Closed:  { badgeClass: 'bg-muted text-muted-foreground border-border',  dotClass: 'bg-muted-foreground' },
};

function EmailSupportTab() {
  const navigate = useNavigate();
  const [emailSearch, setEmailSearch] = useState('');
  const [emailFolder, setEmailFolder] = useState<'All' | 'Open' | 'Pending' | 'Closed' | 'Starred'>('All');
  const [emailPriorityFilter, setEmailPriorityFilter] = useState('all');
  const [starred, setStarred] = useState<Record<string, boolean>>(
    Object.fromEntries(emailData.map((e) => [e.id, e.starred]))
  );

  const folderCounts = {
    All:     emailData.length,
    Open:    emailData.filter((e) => e.status === 'Open').length,
    Pending: emailData.filter((e) => e.status === 'Pending').length,
    Closed:  emailData.filter((e) => e.status === 'Closed').length,
    Starred: Object.values(starred).filter(Boolean).length,
  };

  const filtered = emailData.filter((e) => {
    if (emailSearch &&
      !e.subject.toLowerCase().includes(emailSearch.toLowerCase()) &&
      !e.from.toLowerCase().includes(emailSearch.toLowerCase())) return false;
    if (emailFolder === 'Starred' && !starred[e.id]) return false;
    if (emailFolder !== 'All' && emailFolder !== 'Starred' && e.status !== emailFolder) return false;
    if (emailPriorityFilter !== 'all' && e.priority !== emailPriorityFilter) return false;
    return true;
  });

  const unreadCount = emailData.filter((e) => e.unread).length;

  return (
    <div className="flex h-full flex-col">
      {/* Email stats + filters */}
      <div className="border-b bg-background px-6 py-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Emails',   value: emailData.length,                              icon: Mail,         color: '#0b2235' },
            { label: 'Unread',         value: unreadCount,                                   icon: Inbox,        color: '#2563eb' },
            { label: 'Open',           value: emailData.filter((e) => e.status === 'Open').length, icon: AlertCircle, color: '#d97706' },
            { label: 'Resolved Today', value: 4,                                             icon: CheckCircle2, color: '#059669' },
          ].map((s) => (
            <Card key={s.label} className="gap-0 px-4 py-3">
              <CardContent className="flex items-center gap-3 p-0">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="h-8 bg-muted pl-9 pr-3 text-[13px]"
            />
          </div>
          <Select value={emailPriorityFilter} onValueChange={setEmailPriorityFilter}>
            <SelectTrigger className="h-8 w-[150px] text-[13px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inbox area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Folder Sidebar */}
        <div className="flex w-[180px] shrink-0 flex-col gap-0.5 border-r bg-background px-2 py-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Folders</div>
          {(Object.keys(folderCounts) as Array<keyof typeof folderCounts>).map((f) => (
            <Button
              key={f}
              onClick={() => setEmailFolder(f)}
              variant={emailFolder === f ? 'secondary' : 'ghost'}
              className="h-auto justify-between px-2 py-2 text-[13px] font-medium"
            >
              <div className="flex items-center gap-2">
                {f === 'All'     && <Inbox        className="w-3.5 h-3.5" />}
                {f === 'Open'    && <AlertCircle  className="w-3.5 h-3.5" />}
                {f === 'Pending' && <Clock        className="w-3.5 h-3.5" />}
                {f === 'Closed'  && <CheckCircle2 className="w-3.5 h-3.5" />}
                {f === 'Starred' && <Star         className="w-3.5 h-3.5" />}
                {f}
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${emailFolder === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {folderCounts[f]}
              </span>
            </Button>
          ))}
          <div className="mt-4 border-t pt-3">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</div>
            {['Network', 'Access', 'Infrastructure', 'CSAT', 'Critical'].map((tag) => (
              <Button key={tag} variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-1.5 text-[12px]">
                <Tag className="w-3 h-3" />
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-2">
            <Checkbox />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Button variant="ghost" size="sm" className="h-auto gap-1 p-0 text-[12px] text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />Filter
            </Button>
            <Button variant="ghost" size="sm" className="h-auto gap-1 p-0 text-[12px] text-muted-foreground">
              <ArrowUpDown className="w-3.5 h-3.5" />Sort
            </Button>
            <span className="ml-auto text-[12px] text-muted-foreground">
              {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-background">
            {filtered.map((email) => {
              const pc = emailPriorityConfig[email.priority];
              const sc = emailStatusCfg[email.status];
              const isStarred = starred[email.id];
              return (
                <div
                  key={email.id}
                  className={`group flex cursor-pointer items-start gap-3 border-b px-4 py-3.5 transition-colors hover:bg-muted/50 ${email.unread ? 'bg-blue-50/40' : ''}`}
                  onClick={() => navigate(`/email-support/${email.id}`)}
                >
                  <Checkbox className="mt-1 shrink-0" onClick={(e) => e.stopPropagation()} />
                  <Button
                    variant="ghost" size="icon" className="mt-0.5 size-6 shrink-0"
                    onClick={(e) => { e.stopPropagation(); setStarred((prev) => ({ ...prev, [email.id]: !prev[email.id] })); }}
                  >
                    {isStarred
                      ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      : <StarOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px] font-semibold text-white" style={{ backgroundColor: email.color }}>
                      {email.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`truncate text-[13px] ${email.unread ? 'font-semibold' : 'font-medium'}`}>{email.from}</span>
                        {email.unread && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">{email.date}</span>
                    </div>
                    <div className={`mb-1 truncate text-[13px] ${email.unread ? 'font-medium' : 'text-muted-foreground'}`}>{email.subject}</div>
                    <div className="truncate text-[12px] text-muted-foreground">{email.preview}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{email.id}</span>
                      <Badge variant="outline" className={`gap-1 text-[11px] ${sc.badgeClass}`}>
                        <span className={`size-1.5 rounded-full ${sc.dotClass}`} />{email.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[11px] ${pc.badgeClass}`}>{email.priority}</Badge>
                      <span className="rounded border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{email.tag}</span>
                      {email.attachments > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="w-3 h-3" />{email.attachments}
                        </span>
                      )}
                      {email.agent && (
                        <Avatar className="ml-auto size-5">
                          <AvatarFallback className="text-[9px] font-semibold">{email.agent}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      entityName={email.id}
                      onView={() => navigate(`/email-support/${email.id}`)}
                      onEdit={() => toast.info(`Edit draft for ${email.id} coming soon`)}
                      onDelete={() => toast.success(`${email.id} deleted`)}
                    />
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <div className="text-[14px] font-medium">No emails found</div>
                <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SLAManagement() {
  const navigate = useNavigate();
  const { slas, deleteSLA } = useServiceDesk();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supportTypeFilter, setSupportTypeFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortField, setSortField] = useState<'companyName' | 'endDate' | 'startDate'>('endDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [importOpen, setImportOpen] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLA | null>(null);
  const [activeTab, setActiveTab] = useState<'sla' | 'email'>('sla');
  const [selected, setSelected] = useState<string[]>([]);

  const companies = useMemo(() => Array.from(new Set(slas.map((s) => s.companyName))).sort(), [slas]);
  const years = useMemo(() => {
    const ys = new Set<string>();
    slas.forEach((s) => { ys.add(s.startDate.slice(0, 4)); ys.add(s.endDate.slice(0, 4)); });
    return Array.from(ys).sort();
  }, [slas]);

  const enriched = useMemo(() =>
    slas.map((s) => {
      const status = calcSLAStatus(s.startDate, s.endDate);
      return { ...s, status, remaining: calcRemainingTime(s.endDate), supportType: calcSupportType(status) };
    }),
    [slas],
  );

  const filtered = useMemo(() => {
    let rows = enriched.filter((s) => {
      if (search &&
        !s.companyName.toLowerCase().includes(search.toLowerCase()) &&
        !s.projectName.toLowerCase().includes(search.toLowerCase()) &&
        !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (supportTypeFilter !== 'all' && s.supportType !== supportTypeFilter) return false;
      if (companyFilter !== 'all' && s.companyName !== companyFilter) return false;
      if (yearFilter !== 'all' && !s.startDate.startsWith(yearFilter) && !s.endDate.startsWith(yearFilter)) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [enriched, search, statusFilter, supportTypeFilter, companyFilter, yearFilter, sortField, sortDir]);

  const total = enriched.length;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const hasFilters = search || statusFilter !== 'all' || supportTypeFilter !== 'all' || companyFilter !== 'all' || yearFilter !== 'all';

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">SLA Management</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Service Level Agreements & Email Support
            </p>
          </div>
          {activeTab === 'sla' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => setImportOpen(true)}>
                <Upload className="w-3.5 h-3.5" />Import
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-[13px]" onClick={() => exportSLAsToExcel(filtered)}>
                <Download className="w-3.5 h-3.5" />Export
              </Button>
              <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/sla/new')}>
                <Plus className="w-3.5 h-3.5" />New SLA
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-[13px]">
                <RefreshCw className="w-3.5 h-3.5" />Refresh
              </Button>
              <Button size="sm" className="gap-1.5 text-[13px]" onClick={() => navigate('/email-support/new')}>
                <Plus className="w-3.5 h-3.5" />Compose
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b bg-background px-6">
        {(['sla', 'email'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex items-center gap-1.5 mr-6 px-0 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'sla' ? <><ShieldCheck className="w-3.5 h-3.5" /> SLA Directory</> : <><Mail className="w-3.5 h-3.5" /> Email Support</>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'sla' ? (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 border-b bg-background px-6 py-3 flex-shrink-0 flex-wrap">
              <div className="relative min-w-[180px] max-w-xs flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search SLAs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 bg-muted pl-9 pr-3 text-[13px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[150px] text-[13px]"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={supportTypeFilter} onValueChange={setSupportTypeFilter}>
                <SelectTrigger className="h-8 w-[155px] text-[13px]"><SelectValue placeholder="All Support Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Support Types</SelectItem>
                  <SelectItem value="Normal Support">Normal Support</SelectItem>
                  <SelectItem value="CSAT">CSAT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="h-8 w-[160px] text-[13px]"><SelectValue placeholder="All Companies" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="h-8 w-[120px] text-[13px]"><SelectValue placeholder="All Years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-[12px] text-muted-foreground"
                  onClick={() => { setSearch(''); setStatusFilter('all'); setSupportTypeFilter('all'); setCompanyFilter('all'); setYearFilter('all'); }}>
                  <Filter className="w-3 h-3 mr-1" />Clear
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="w-10 pl-5 py-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => setSelected(checked ? filtered.map((s) => s.id) : [])}
                      />
                    </TableHead>
                    <TableHead className="pl-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[100px]">ID</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('companyName')}>
                        Company <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Project</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('startDate')}>
                        Start Date <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <div className="flex cursor-pointer items-center gap-1 hover:text-foreground" onClick={() => toggleSort('endDate')}>
                        End Date <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remaining</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support Type</TableHead>
                    <TableHead className="px-4 py-3 w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-background">
                  {filtered.map((s) => {
                    const sc = slaStatusConfig[s.status];
                    const stc = supportTypeConfig[s.supportType];
                    const duration = calcDurationLabel(s.startDate, s.endDate);
                    const isExpiring = s.status === 'Expiring Soon';
                    const isExpired = s.status === 'Expired';
                    return (
                      <TableRow key={s.id} className="group cursor-pointer" data-state={selected.includes(s.id) ? 'selected' : undefined} onClick={() => navigate(`/sla/${s.id}`)}>
                        <TableCell className="w-10 pl-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                        </TableCell>
                        <TableCell className="pl-5 py-3.5">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">{s.id}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7 rounded-md">
                              <AvatarFallback className="rounded-md text-[10px] font-bold text-white" style={{ backgroundColor: avatarColor(s.companyName) }}>
                                {initials2(s.companyName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-medium">{s.companyName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[13px]">{s.projectName}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />{s.startDate}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className={`flex items-center gap-1.5 text-[12px] ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            <Calendar className="w-3 h-3" />{s.endDate}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className="text-[12px] text-muted-foreground">{duration}</span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <span className={`text-[12px] font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {s.remaining}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <Badge variant="outline" className={`gap-1.5 text-[11px] ${sc.badgeClass}`}>
                            <span className={`size-1.5 rounded-full ${sc.dotClass}`} />{s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <Badge variant="outline" className={`gap-1.5 text-[11px] ${stc.badgeClass}`}>
                            <span className={`size-1.5 rounded-full ${stc.dotClass}`} />{s.supportType}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu
                            entityName={s.id}
                            onView={() => navigate(`/sla/${s.id}`)}
                            onEdit={() => setEditingSLA(s)}
                            onDelete={() => deleteSLA(s.id)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <div className="text-[14px] font-medium">No SLAs found</div>
                            <div className="mt-1 text-[13px] text-muted-foreground">Try adjusting your search or filters</div>
                          </div>
                          {hasFilters && (
                            <Button variant="outline" size="sm" className="text-[13px]"
                              onClick={() => { setSearch(''); setStatusFilter('all'); setSupportTypeFilter('all'); setCompanyFilter('all'); setYearFilter('all'); }}>
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t bg-background px-6 py-3">
              <span className="text-[12px] text-muted-foreground">
                {selected.length > 0
                  ? `${selected.length} of ${filtered.length} selected`
                  : `Showing ${filtered.length} of ${total} SLAs`}
              </span>
              {selected.length > 0 && (
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 text-[12px] h-7 px-2.5"
                  onClick={() => {
                    const toExport = filtered.filter((s) => selected.includes(s.id));
                    exportSLAsToExcel(toExport);
                  }}
                >
                  <Download className="w-3 h-3" />
                  Export {selected.length} SLA{selected.length !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </>
        ) : (
          <EmailSupportTab />
        )}
      </div>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
      {editingSLA && <EditSLADialog sla={editingSLA} onClose={() => setEditingSLA(null)} />}
    </div>
  );
}
